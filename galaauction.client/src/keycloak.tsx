import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: `${import.meta.env.VITE_KEYCLOAK_URL}`,     // Keycloak server base URL
    realm: 'GalaAuction',
    clientId: 'react-app'
});

keycloak.init({
    pkceMethod: 'S256',
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
});

export default keycloak;