import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), localApiPlugin()],
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

function localApiPlugin(): Plugin {
  const handlers: Record<string, string> = {
    '/api/parse-notes': 'api/parse-notes.mjs',
    '/api/cliniko-import': 'api/cliniko-import.mjs',
  };

  return {
    name: 'ahtr-local-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        const handlerPath = handlers[pathname];

        if (!handlerPath) {
          next();
          return;
        }

        try {
          await runLocalApiHandler(handlerPath, request, response);
        } catch (error) {
          console.error('Local API handler failed', error instanceof Error ? error.message : 'Unknown error');
          if (!response.headersSent) {
            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
          }
          response.end(JSON.stringify({ error: 'Local API handler failed.' }));
        }
      });
    },
  };
}

async function runLocalApiHandler(
  handlerPath: string,
  request: IncomingMessage,
  response: ServerResponse,
) {
  await loadServerEnvForLocalApi();

  const moduleUrl = pathToFileURL(resolve(process.cwd(), handlerPath)).href;
  const mod = await import(moduleUrl);
  const apiRequest = Object.assign(request, {
    body: await readRequestBody(request),
  });
  const apiResponse = createLocalApiResponse(response);

  await mod.default(apiRequest, apiResponse);

  if (!response.writableEnded) {
    response.end();
  }
}

async function loadServerEnvForLocalApi() {
  const moduleUrl = pathToFileURL(resolve(process.cwd(), 'scripts/lib/local-env.mjs')).href;
  const mod = await import(moduleUrl);
  Object.assign(process.env, await mod.loadLocalEnv());
}

function createLocalApiResponse(response: ServerResponse) {
  return {
    setHeader(name: string, value: number | string | readonly string[]) {
      response.setHeader(name, value);
    },
    status(statusCode: number) {
      response.statusCode = statusCode;
      return this;
    },
    json(body: unknown) {
      if (!response.headersSent) {
        response.setHeader('Content-Type', 'application/json');
      }
      response.end(JSON.stringify(body));
    },
  };
}

async function readRequestBody(request: IncomingMessage) {
  if (!['POST', 'PUT', 'PATCH'].includes(request.method ?? '')) return undefined;

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return undefined;

  const contentType = request.headers['content-type'] ?? '';
  if (String(contentType).includes('application/json')) {
    return JSON.parse(text);
  }

  return text;
}

function readClientEnv(
  loadedEnv: Record<string, string>,
  viteName: string,
  plainName: string,
): string {
  return process.env[viteName] ?? loadedEnv[viteName] ?? process.env[plainName] ?? loadedEnv[plainName] ?? '';
}
