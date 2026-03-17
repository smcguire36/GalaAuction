using GalaAuction.Server.Data;
using GalaAuction.Server.Mappings;
using GalaAuction.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(options =>
{
    // Add a route token transformer convention to convert controller and action names to kebab-case in the generated routes
    options.Conventions.Add(new RouteTokenTransformerConvention(new KebabCaseParameterTransformer()));
});
builder.Services.AddOpenApi(opts =>
{
    // Add transformers to provide support for Badge and Scalar attributes in the OpenAPI document
    opts.AddScalarTransformers();
});
builder.AddServiceDefaults();

builder.Services.AddScoped<EventService>();
builder.Services.AddScoped<ItemService>();
builder.Services.AddScoped<GuestService>();

builder.Services.AddAuthentication()
    .AddKeycloakJwtBearer(serviceName: "keycloak", realm: "GalaAuction", options =>
    {
        options.RequireHttpsMetadata = false;
        options.Audience = "GalaAuction";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuers = [
                "http://localhost:6001/realms/GalaAuction",
                "http://keycloak:8080/realms/GalaAuction",
                "http://id.GalaAuction.local/realms/GalaAuction",
                "https://id.GalaAuction.local/realms/GalaAuction"
            ],
            ClockSkew = TimeSpan.FromMinutes(2)
        };

        if (builder.Environment.IsDevelopment())
        {
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILoggerFactory>()
                        .CreateLogger("AuthDiagnostics");

                    logger.LogWarning(
                        context.Exception,
                        "JWT authentication failed. Path: {Path}, Message: {Message}",
                        context.HttpContext.Request.Path,
                        context.Exception.Message
                    );

                    return Task.CompletedTask;
                },
                OnChallenge = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILoggerFactory>()
                        .CreateLogger("AuthDiagnostics");

                    var hasAuthorizationHeader = context.Request.Headers.ContainsKey("Authorization");

                    logger.LogWarning(
                        "JWT challenge issued. Path: {Path}, Error: {Error}, Description: {Description}, HasAuthorizationHeader: {HasAuthorizationHeader}",
                        context.Request.Path,
                        context.Error,
                        context.ErrorDescription,
                        hasAuthorizationHeader
                    );

                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILoggerFactory>()
                        .CreateLogger("AuthDiagnostics");

                    var subject = context.Principal?.Identity?.Name ?? "unknown";
                    var expiration = context.SecurityToken?.ValidTo;

                    logger.LogDebug(
                        "JWT token validated. Path: {Path}, Subject: {Subject}, ValidToUtc: {ValidToUtc}",
                        context.HttpContext.Request.Path,
                        subject,
                        expiration
                    );

                    return Task.CompletedTask;
                }
            };
        }
    });

builder.AddNpgsqlDbContext<GalaAuctionDBContext>(
    connectionName: "GalaAuctionDb",
    configureSettings: null,
    configureDbContextOptions: options =>
    {
        options.ConfigureWarnings(warnings => warnings
            .Ignore(RelationalEventId.PendingModelChangesWarning)
        );
    }
);

// Define a policy name
const string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// Get the React frontend URL from Aspire environment variables
// Note: "webfrontend" should match the name used in your AppHost project
var frontendUrl = builder.Configuration["services:frontend:https:0"]
                  ?? builder.Configuration["services:frontend:http:0"];

if (frontendUrl != null)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: MyAllowSpecificOrigins,
            policy =>
            {
                policy
                      .SetIsOriginAllowed(_ => true)    // Allow any origin temporarily
//                      .WithOrigins(frontendUrl) // Dynamically allow the React app
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials(); // Required if using Keycloak/Cookies
            });
    });
}


var app = builder.Build();

app.UseCors(MyAllowSpecificOrigins);

app.MapDefaultEndpoints();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Gala Auction API")
        .AddPreferredSecuritySchemes("BearerAuth")
        .AddHttpAuthentication("BearerAuth", auth =>
        {
            auth.Token = "";
        });
        //        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarTarget.HttpClient);
    });
}

//app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var dbContext = services.GetRequiredService<GalaAuctionDBContext>();
    await dbContext.Database.MigrateAsync();
}
catch (Exception e)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(e, "An error occurred while migrating or seeding the database.");
}

app.Run();
