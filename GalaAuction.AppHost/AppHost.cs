var builder = DistributedApplication.CreateBuilder(args);

// Create the keycloak container
var keycloak = builder.AddKeycloak("keycloak", 7001)
        .WithDataVolume("keycloak-galaauction");

var postgres = builder.AddPostgres("postgres", port: 5432)
    .WithDataVolume("postgres-galaauction")
    .WithPgAdmin();
var galaAuctionDb = postgres.AddDatabase("GalaAuction");

// Create the backend container and reference the keycloak container
var backend = builder.AddProject<Projects.GalaAuction_Server>("galaauction-server")
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

builder.Build().Run();
