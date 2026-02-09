import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
    // Load env variables to access VITE_PORT set by Aspire
    const env = loadEnv(mode, process.cwd(), "");
    const port = parseInt(env.VITE_PORT) || 5173;

    return {
        plugins: [react()],
        server: {
            port: port,
            proxy: {
                '/api': {
                    target: 'http://localhost:7185',
                    secure: false
                }
            }
        }
    };
});
