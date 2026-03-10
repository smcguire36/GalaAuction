import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
    // Load env variables to access VITE_PORT set by Aspire
    const env = loadEnv(mode, process.cwd(), "");
    const port = parseInt(env.VITE_PORT) || 5173;

    return {
    	plugins: [tailwindcss(),react()],
        server: {
            // bind to all interfaces so the dev server accepts requests forwarded from the gateway/container
            host: true,
            port: port,
            // allow the Docker host name that Aspire uses when forwarding requests
            // some tooling expects an `allowedHosts` setting (webpack-dev-server); adding it is harmless
            // and lets other environments allow this host when present.
            allowedHosts: ['host.docker.internal'],
            // configure HMR host so websocket connections from the browser work when routed through Docker
            hmr: {
                host: 'host.docker.internal'
            },
            proxy: {
                '/api': {
                    target: 'http://localhost:7001',
                    secure: false
                }
            }
        }
    };
});
