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
    .WithEnvironment("KC_HTTP_RELATIVE_PATH", "/")
    .WithEnvironment("KC_HOSTNAME_STRICT_HTTPS", "false")
    .WithEnvironment("VIRTUAL_HOST", "id.galaauction.local")
    .WithEnvironment("VIRTUAL_PORT", "8080");
#pragma warning restore ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

var postgres = builder.AddPostgres("postgres")
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
    .WaitFor(postgres);

// Create the frontend container and reference the backend container and keycloak container
var frontend = builder.AddJavaScriptApp("frontend", "../galaauction.client")
    .WithHttpEndpoint(port: 5173, env: "VITE_PORT")
    .WithExternalHttpEndpoints()
    .WithReference(backend)
    .WithReference(keycloak)
    .WithEnvironment("VITE_KEYCLOAK_URL", keycloak.GetEndpoint("http"))
    .WithArgs("--host")
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
    .WithReference(backend)
    .WithConfiguration(yarpBuilder =>
    {
        // Route API calls to backend, removing /api prefix
        yarpBuilder.AddRoute("/api/{**catch-all}", backend)
            .WithTransformPathRemovePrefix("/api")
            .WithOrder(1);

        // Note: Frontend route is configured via environment variables below
        // because frontend is not a containerized resource - it runs on host machine
    })
    .WithHostPort(8001)
    .WithExternalHttpEndpoints()
    // Frontend route configuration (host machine access)
    .WithEnvironment("ReverseProxy__Routes__frontend-route__ClusterId", "frontend-cluster")
    .WithEnvironment("ReverseProxy__Routes__frontend-route__Match__Path", "{**catch-all}")
    .WithEnvironment("ReverseProxy__Routes__frontend-route__Order", "2")
    .WithEnvironment("ReverseProxy__Clusters__frontend-cluster__Destinations__frontend__Address", "http://host.docker.internal:5173")
    .WaitFor(backend)
    .WaitFor(frontend);

builder.Build().Run();
