# GalaAuction

GalaAuction is an Aspire-based application with:

- an ASP.NET Core backend in `GalaAuction.Server`
- a React + Vite frontend in `galaauction.client`
- an Aspire orchestrator in `GalaAuction.AppHost`
- PostgreSQL, Keycloak, and YARP wiring managed by the AppHost

## Prerequisites

- .NET 10 SDK
- Node.js and npm
- Docker Desktop or another local Docker runtime

## Initial Setup

Install frontend dependencies:

```bash
cd galaauction.client
npm install
```

Enable the shared git hooks for this clone:

```bash
git config core.hooksPath hooks
```

## Running The Application

Start the full local stack through the Aspire AppHost:

```bash
dotnet run --project GalaAuction.AppHost/GalaAuction.AppHost.csproj
```

The AppHost starts:

- the backend API
- the Vite frontend dev server
- Keycloak
- PostgreSQL
- YARP gateway

## Local Endpoints

The configured local ports in the AppHost are:

- Frontend dev server: `http://localhost:5173`
- Backend API: `http://localhost:7001`
- Keycloak: `http://localhost:6001`
- Gateway: `http://localhost:8002`
- pgAdmin: `http://localhost:5050`

## Build And Test

Build the AppHost:

```bash
dotnet build GalaAuction.AppHost/GalaAuction.AppHost.csproj
```

Run the frontend checks:

```bash
cd galaauction.client
npm run build
npm run lint
```

Run the test project:

```bash
dotnet test GalaAuction.Tests/GalaAuction.Tests.csproj
```

## Repository Hooks

This repository includes a shared pre-commit hook in `hooks/pre-commit`.

The hook blocks commits that include generated build artifacts from `obj/` or `bin/` directories. The `core.hooksPath` setting is local to each clone, so run the setup command once on every machine you use with this repository.