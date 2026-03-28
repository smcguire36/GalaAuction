using Aspire.Hosting.Docker;
using Aspire.Hosting.Yarp;
using Aspire.Hosting.Yarp.Transforms;

var builder = DistributedApplication.CreateBuilder(args);

var compose = builder.AddDockerComposeEnvironment("production")
    .WithDashboard(dashboard => dashboard.WithHostPort(8081));

// Create the keycloak container
#pragma warning disable ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
var keycloak = builder.AddKeycloak("keycloak", 6001)
    .WithoutHttpsCertificate()
    .WithDataVolume("keycloak-galaauction")
    .WithRealmImport("../Realms")
    .WithExternalHttpEndpoints()
    .WithEnvironment("KC_HTTP_ENABLED", "true")
    .WithEnvironment("KC_HOSTNAME_STRICT", "false")
    .WithEnvironment("VIRTUAL_HOST", "id.galaauction.local")
    .WithEnvironment("VIRTUAL_PORT", "8080");
#pragma warning restore ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

var postgres = builder.AddPostgres("postgres", port: 5432)
    .WithDataVolume("postgres-galaauction")
    .WithPgAdmin(admin => admin.WithHostPort(5050));
var galaAuctionDb = postgres.AddDatabase("GalaAuctionDb");

// Create the backend container and reference the keycloak container
var backend = builder.AddProject<Projects.GalaAuction_Server>("galaauction-server")
    .WithHttpEndpoint(7001, 8082, "auctionApi")
    .WithExternalHttpEndpoints()
    .WithReference(keycloak)
    .WithReference(galaAuctionDb)
    .WaitFor(keycloak)
    .WaitFor(galaAuctionDb);

// Create the frontend container and reference the backend container and keycloak container
var frontend = builder.AddJavaScriptApp("frontend", "../galaauction.client")
//    .WithNpm(true, "install")
    .WithHttpEndpoint(port: 5173, env: "VITE_PORT")
    .WithExternalHttpEndpoints()
    .WithReference(backend)
    .WithReference(keycloak)
    .WithEnvironment("VITE_BACKEND_URL", backend.GetEndpoint("auctionApi"))
    .WithEnvironment("VITE_KEYCLOAK_URL", keycloak.GetEndpoint("http"))
    .WithArgs("--host")
    .PublishAsDockerFile()
    .WaitFor(backend);

/*
var frontend1 = builder.AddViteApp("frontend", "../galaauction.client")
//    .WithNpmPackageInstallation()

    // Note: AddViteApp calls WithHttpEndpoint internally.
    // If you need a fixed port (e.g., for Keycloak redirects), use this specific syntax:
    .WithEndpoint("http", e => e.Port = 5173)

    .WithExternalHttpEndpoints()
    .WithReference(backend)
    .WithReference(keycloak)

    // Vite-specific environment variables
    .WithEnvironment("VITE_BACKEND_URL", backend.GetEndpoint("auctionApi"))
    .WithEnvironment("VITE_KEYCLOAK_URL", keycloak.GetEndpoint("http"))

    // Passes --host to the underlying 'npm run dev' command
    .WithArgs("--host")
    .WaitFor(backend);
*/

backend.WithReference(frontend);

var yarp = builder.AddYarp("gateway")
    .WithConfiguration(yarpBuilder =>
    {
        yarpBuilder.AddRoute("/api/{**catch-all}", backend)
//            .WithTransformPathRemovePrefix()
            .WithOrder(1);

        yarpBuilder.AddRoute("{**catch-all}", frontend)
            .WithOrder(2);
    })
    .WithEnvironment("ASPNETCORE_URLS", "http://*:8001")
    .WithEndpoint(port: 8001, targetPort: 8001, scheme: "http", name: "gateway", isExternal: true)
    .WithEnvironment("VIRTUAL_HOST", "api.galaauction.local")
    .WithEnvironment("VIRTUAL_PORT", "8002")
    .WithEnvironment("Logging__LogLevel__Microsoft.ReverseProxy", "Debug")
    .WithEnvironment("Logging__LogLevel__Default", "Debug")
    .WithReference(frontend)
    .WithReference(keycloak)
    .WithExternalHttpEndpoints();

frontend.WithReference(yarp);
frontend.WithEnvironment("VITE_GATEWAY_URL", yarp.GetEndpoint("http"));

builder.Build().Run();
