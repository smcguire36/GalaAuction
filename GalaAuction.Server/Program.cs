using GalaAuction.Server.Data;
using GalaAuction.Server.Mappings;
using GalaAuction.Server.Services;
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
            ClockSkew = TimeSpan.Zero
        };
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

var app = builder.Build();

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

app.UseHttpsRedirection();

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
