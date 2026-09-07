import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      __AHTR_SUPABASE_URL__: JSON.stringify(readClientEnv(env, 'VITE_SUPABASE_URL', 'SUPABASE_URL')),
      __AHTR_SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(
        readClientEnv(env, 'VITE_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_PUBLISHABLE_KEY'),
      ),
    },
    server: {
      allowedHosts: ['.trycloudflare.com'],
    },
    test: {
      environment: 'jsdom',
      exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**'],
      globals: true,
      setupFiles: './tests/setup.ts',
    },
  };
});

function readClientEnv(
  loadedEnv: Record<string, string>,
  viteName: string,
  plainName: string,
): string {
  return process.env[viteName] ?? loadedEnv[viteName] ?? process.env[plainName] ?? loadedEnv[plainName] ?? '';
}
