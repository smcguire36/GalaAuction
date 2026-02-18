var builder = DistributedApplication.CreateBuilder(args);

// Create the keycloak container
#pragma warning disable ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
var keycloak = builder.AddKeycloak("keycloak", 6001)
    .WithoutHttpsCertificate()
    .WithDataVolume("keycloak-galaauction")
    .WithEnvironment("KC_HTTP_ENABLED", "true")
    .WithEnvironment("KC_HOSTNAME_STRICT", "false")
    .WithEnvironment("VIRTUAL_HOST", "id.GalaAuction.local")
    .WithEnvironment("VIRTUAL_PORT", "8080");
#pragma warning restore ASPIRECERTIFICATES001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

var postgres = builder.AddPostgres("postgres", port: 5432)
    .WithDataVolume("postgres-galaauction")
    .WithPgAdmin(admin => admin.WithHostPort(5050));
var galaAuctionDb = postgres.AddDatabase("GalaAuctionDb");

// Create the backend container and reference the keycloak container
var backend = builder.AddProject<Projects.GalaAuction_Server>("galaauction-server")
    .WithHttpEndpoint(7001, 8080, "auctionApi")
    .WithReference(keycloak)
    .WithReference(galaAuctionDb)
    .WaitFor(keycloak)
    .WaitFor(galaAuctionDb);

// Create the frontend container and reference the backend container and keycloak container
var frontend = builder.AddJavaScriptApp("frontend", "../galaauction.client")
    .WithNpm(true, "install")
    .WithHttpEndpoint(port: 5173, env: "VITE_PORT")
    .WithExternalHttpEndpoints()
    .WithReference(backend)
    .WithReference(keycloak)
    .WaitFor(backend);

var yarp = builder.AddYarp("gateway")
    .WithConfiguration(yarpBuilder =>
    {
        yarpBuilder.AddRoute("/{**catch-all}", backend);
    })
    .WithEnvironment("ASPNETCORE_URLS", "http://*:8001")
    .WithEndpoint(port: 8001, targetPort: 8001, scheme: "http", name: "gateway", isExternal: true)
    .WithEnvironment("VIRTUAL_HOST", "api.GalaAuction.local")
    .WithEnvironment("VIRTUAL_PORT", "8001");


builder.Build().Run();
