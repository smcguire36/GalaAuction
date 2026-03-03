import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import routes from './Routes.tsx';
import keycloak from './keycloak';
import EventProvider from './store/EventProvider.tsx';
import ModalProvider from './store/ModalProvider.tsx';

import './index.css';

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const initOptions = {
    onLoad: 'check-sso', // Silently check if the user is already logged in
    pkceMethod: 'S256',  // Mandatory for Authorization Code Flow
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
};

createRoot(document.getElementById('root')!).render(
    <ReactKeycloakProvider
        authClient={keycloak}
        initOptions={initOptions}
    >
        <EventProvider>
            <ModalProvider>
                <RouterProvider router={routes} />
            </ModalProvider>
        </EventProvider>
    </ReactKeycloakProvider>
);
