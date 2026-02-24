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
            port: port,
            proxy: {
                '/api': {
                    target: 'http://localhost:7001',
                    secure: false
                }
            }
        }
    };
});
