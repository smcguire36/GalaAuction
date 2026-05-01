import Keycloak from 'keycloak-js';

const keycloakUrl =
    import.meta.env.VITE_KEYCLOAK_URL || `${window.location.protocol}//${window.location.hostname}:8001/auth`;

const keycloak = new Keycloak({
    url: keycloakUrl,
    realm: 'GalaAuction',
    clientId: 'react-app'
});

export default keycloak;
