import { useKeycloak } from '@react-keycloak/web';
import type { ReactNode } from 'react';

const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { keycloak, initialized } = useKeycloak();

    // 1. Wait for Keycloak to finish initializing
    if (!initialized) {
        return <div>Loading authentication...</div>;
        console.log(keycloak);
    }

    // 2. If not authenticated, redirect to Keycloak login
    // Note: keycloak.login() will perform a full-page redirect
    if (!keycloak.authenticated) {
        keycloak.login();
        return <div>Redirecting to login...</div>;
    }

    // 3. If authenticated, render the protected content
    return children;
};

export default PrivateRoute;