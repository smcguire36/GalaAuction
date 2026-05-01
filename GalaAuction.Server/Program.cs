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

// Resolve the Keycloak base URL from config (set in appsettings.Development.json).
// We use plain AddJwtBearer instead of AddKeycloakJwtBearer because the latter
// sets up Aspire service-discovery URLs (https+http://keycloak) for the backchannel
// HTTP client, which resolves to a dynamic Aspire proxy port that is unreachable.
var keycloakUrl = builder.Configuration["Keycloak:BaseUrl"]
                  ?? "http://localhost:6001";
var keycloakRealmUrl = $"{keycloakUrl.TrimEnd('/')}/realms/GalaAuction";

builder.Services.AddAuthentication()
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.Audience = "GalaAuction";
        options.Authority = keycloakRealmUrl;
        options.MetadataAddress = $"{keycloakRealmUrl}/.well-known/openid-configuration";
        options.TokenValidationParameters.ValidIssuers = [
            "http://localhost:6001/auth/realms/GalaAuction",
            "http://localhost:8001/auth/realms/GalaAuction",
            "http://rivendell:6001/auth/realms/GalaAuction",
            "http://rivendell:8001/auth/realms/GalaAuction",
            "https://rivendell:8001/auth/realms/GalaAuction",
            "http://keycloak:8080/auth/realms/GalaAuction",
            "http://id.GalaAuction.local/auth/realms/GalaAuction",
            "https://id.GalaAuction.local/auth/realms/GalaAuction"
        ];
        options.TokenValidationParameters.ClockSkew = TimeSpan.FromMinutes(2);

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
                        "JWT authentication failed. Path: {Path}, Message: {Message}, Authority: {Authority}, MetadataAddress: {MetadataAddress}",
                        context.HttpContext.Request.Path,
                        context.Exception.Message,
                        context.Options.Authority,
                        context.Options.MetadataAddress
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
var logger = services.GetRequiredService<ILogger<Program>>();

try
{
    logger.LogInformation("Starting database migration...");
    var dbContext = services.GetRequiredService<GalaAuctionDBContext>();

    var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
    if (pendingMigrations.Any())
    {
        logger.LogInformation("Found {Count} pending migration(s): {Migrations}", 
            pendingMigrations.Count(), 
            string.Join(", ", pendingMigrations));

        await dbContext.Database.MigrateAsync();
        logger.LogInformation("Database migration completed successfully.");
    }
    else
    {
        logger.LogInformation("No pending migrations found. Database is up to date.");
    }
}
catch (Exception e)
{
    logger.LogError(e, "An error occurred while migrating the database.");
    throw; // Re-throw to prevent app from starting with a broken database
}

app.Run();
