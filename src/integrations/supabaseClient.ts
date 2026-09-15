import { createClient, type SupabaseClient } from '@supabase/supabase-js';

declare const __AHTR_SUPABASE_URL__: string;
declare const __AHTR_SUPABASE_PUBLISHABLE_KEY__: string;

interface SupabaseEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface InjectedSupabaseConfig {
  url?: string;
  publishableKey?: string;
}

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
  projectHost: string;
}

export type SupabaseConnectionState =
  | 'missing-config'
  | 'invalid-config'
  | 'configured'
  | 'connected'
  | 'rejected'
  | 'unreachable';

export interface SupabaseConnectionResult {
  state: SupabaseConnectionState;
  label: string;
  detail: string;
  projectHost?: string;
  statusCode?: number;
}

interface SupabaseConfigResult {
  config: SupabaseConfig | null;
  issue?: 'missing-url' | 'missing-key' | 'invalid-url';
}

const injectedConfig: InjectedSupabaseConfig = {
  url: typeof __AHTR_SUPABASE_URL__ === 'string' ? __AHTR_SUPABASE_URL__ : '',
  publishableKey:
    typeof __AHTR_SUPABASE_PUBLISHABLE_KEY__ === 'string'
      ? __AHTR_SUPABASE_PUBLISHABLE_KEY__
      : '',
};

let cachedClient: SupabaseClient | null = null;
let cachedClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { config } = resolveSupabaseConfig();
  if (!config) {
    return null;
  }

  const clientKey = `${config.url}|${config.publishableKey}`;
  if (!cachedClient || cachedClientKey !== clientKey) {
    cachedClient = createClient(config.url, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    cachedClientKey = clientKey;
  }

  return cachedClient;
}

export function getSupabaseConnectionStatus(): SupabaseConnectionResult {
  return configStatus(resolveSupabaseConfig());
}

export async function checkSupabaseConnection(
  configResult: SupabaseConfigResult = resolveSupabaseConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<SupabaseConnectionResult> {
  const status = configStatus(configResult);
  if (!configResult.config || status.state !== 'configured') {
    return status;
  }

  const { config } = configResult;

  try {
    const response = await fetchImpl(`${config.url}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        apikey: config.publishableKey,
      },
    });

    if (response.ok) {
      return {
        state: 'connected',
        label: 'Connected',
        detail: `Reached Supabase Auth for ${config.projectHost}.`,
        projectHost: config.projectHost,
        statusCode: response.status,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        state: 'rejected',
        label: 'Key rejected',
        detail: `Supabase rejected the publishable key for ${config.projectHost}; check the key belongs to this project.`,
        projectHost: config.projectHost,
        statusCode: response.status,
      };
    }

    return {
      state: 'unreachable',
      label: 'Check failed',
      detail: `Supabase Auth responded with HTTP ${response.status} for ${config.projectHost}.`,
      projectHost: config.projectHost,
      statusCode: response.status,
    };
  } catch {
    return {
      state: 'unreachable',
      label: 'No response',
      detail: `Could not reach Supabase Auth for ${config.projectHost} from this browser.`,
      projectHost: config.projectHost,
    };
  }
}

export function resolveSupabaseConfig(
  env: SupabaseEnv = import.meta.env,
  fallback: InjectedSupabaseConfig = injectedConfig,
): SupabaseConfigResult {
  const rawUrl = firstPresent(env.VITE_SUPABASE_URL, fallback.url);
  const publishableKey = firstPresent(env.VITE_SUPABASE_PUBLISHABLE_KEY, fallback.publishableKey);

  if (!rawUrl) {
    return { config: null, issue: 'missing-url' };
  }

  if (!publishableKey) {
    return { config: null, issue: 'missing-key' };
  }

  const normalized = normalizeSupabaseUrl(rawUrl);
  if (!normalized) {
    return { config: null, issue: 'invalid-url' };
  }

  return {
    config: {
      url: normalized.url,
      projectHost: normalized.projectHost,
      publishableKey,
    },
  };
}

function configStatus(configResult: SupabaseConfigResult): SupabaseConnectionResult {
  if (configResult.config) {
    return {
      state: 'configured',
      label: 'Configured',
      detail: `Ready to connect to ${configResult.config.projectHost}.`,
      projectHost: configResult.config.projectHost,
    };
  }

  if (configResult.issue === 'invalid-url') {
    return {
      state: 'invalid-config',
      label: 'Invalid URL',
      detail: 'Check SUPABASE_URL or VITE_SUPABASE_URL in your local environment.',
    };
  }

  const missingName =
    configResult.issue === 'missing-key'
      ? 'SUPABASE_PUBLISHABLE_KEY'
      : 'SUPABASE_URL';

  return {
    state: 'missing-config',
    label: 'Not configured',
    detail: `Add ${missingName} to .env.local or pass it before npm run dev.`,
  };
}

function firstPresent(...values: Array<string | undefined>): string {
  for (const value of values) {
    const normalized = value?.trim();
    if (normalized) {
      return normalized;
    }
  }

  return '';
}

function normalizeSupabaseUrl(value: string): { url: string; projectHost: string } | null {
  try {
    const url = new URL(value);
    return {
      url: url.origin,
      projectHost: url.host,
    };
  } catch {
    return null;
  }
}
