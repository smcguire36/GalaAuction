# Replace volume definitions to use external volumes
$yaml = Get-Content docker-compose.yaml -Raw
$yaml = $yaml -replace 'keycloak-galaauction:\s*\n\s*driver: "local"', "keycloak-galaauction:`n    external: true"
$yaml = $yaml -replace 'postgres-galaauction:\s*\n\s*driver: "local"', "postgres-galaauction:`n    external: true"
$yaml | Set-Content docker-compose.yaml

docker compose up -d