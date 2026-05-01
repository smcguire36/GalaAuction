using Aspire.Hosting.ApplicationModel;
using Aspire.Hosting.Docker;
using Aspire.Hosting.Yarp;
using Aspire.Hosting.Yarp.Transforms;

var builder = DistributedApplication.CreateBuilder(args);

var compose = builder.AddDockerComposeEnvironment("production")
    .WithDashboard(dashboard => dashboard.WithHostPort(8081));

// Create the keycloak container
#pragma warning disable ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
var keycloak = builder.AddKeycloak("keycloak")
    .WithDataVolume("keycloak-galaauction")
    .WithRealmImport("../Realms")
    .WithEnvironment("KC_HOSTNAME", "rivendell")
    .WithEnvironment("KC_HOSTNAME_STRICT", "false")
    .WithEnvironment("KC_HOSTNAME_STRICT_HTTPS", "false")
    .WithEnvironment("KC_HTTP_ENABLED", "true")
    .WithEnvironment("KC_PROXY_HEADERS", "xforwarded")
    .WithEnvironment("KC_HOSTNAME_PORT", "8001")
    .WithEnvironment("KC_HTTP_RELATIVE_PATH", "/auth")
    .WithEnvironment("KC_HEALTH_ENABLED", "true")
    .WithEndpoint("http", e => {
        e.Port = 6001;
        e.TargetHost = "0.0.0.0";
        e.IsExternal = true;
    })
    .WithExternalHttpEndpoints()
    .WithLifetime(ContainerLifetime.Persistent); // Keep running across restarts


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
    // Removed .WaitFor(keycloak) - backend will retry connection to Keycloak
    .WaitFor(postgres);

// Create the frontend container and reference the backend container and keycloak container
var frontend = builder.AddJavaScriptApp("frontend", "../galaauction.client")
    .WithHttpEndpoint(port: 5173, env: "VITE_PORT")
    .WithExternalHttpEndpoints()
    .WithReference(backend)
    .WithReference(keycloak)
//    .WithEnvironment("VITE_KEYCLOAK_URL", keycloak.GetEndpoint("http"))
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
    .WithReference(keycloak)
    .WithConfiguration(yarpBuilder =>
    {
        // Route API calls to backend, removing /api prefix
        yarpBuilder.AddRoute("/api/{**catch-all}", backend)
            .WithTransformPathRemovePrefix("/api")
            .WithOrder(1);

        // Route Keycloak calls through YARP - keep /auth prefix (Keycloak expects it)
        yarpBuilder.AddRoute("/auth/{**catch-all}", keycloak)
            .WithOrder(2);

        // Note: Frontend route is configured via environment variables below
        // because frontend is not a containerized resource - it runs on host machine
    })
    .WithEndpoint("https", endpoint => {
        endpoint.Port = 8001;
        endpoint.TargetPort = 443;
        endpoint.UriScheme = "https";
        endpoint.TargetHost = "0.0.0.0";
    })
    .WithExternalHttpEndpoints()
    // Frontend route configuration (host machine access)
    .WithEnvironment("ReverseProxy__Routes__frontend-route__ClusterId", "frontend-cluster")
    .WithEnvironment("ReverseProxy__Routes__frontend-route__Match__Path", "{**catch-all}")
    .WithEnvironment("ReverseProxy__Routes__frontend-route__Order", "2")
    .WithEnvironment("ReverseProxy__Clusters__frontend-cluster__Destinations__frontend__Address", "http://host.docker.internal:5173")
    .WaitFor(backend)
    .WaitFor(frontend);

builder.Build().Run();
