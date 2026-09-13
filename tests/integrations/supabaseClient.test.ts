import { describe, expect, it, vi } from 'vitest';
import {
  checkSupabaseConnection,
  resolveSupabaseConfig,
} from '../../src/integrations/supabaseClient';

describe('Supabase client configuration', () => {
  it('reads Vite-prefixed Supabase values first', () => {
    const result = resolveSupabaseConfig(
      {
        VITE_SUPABASE_URL: 'https://vite-project.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_vite',
      },
      {
        url: 'https://fallback-project.supabase.co',
        publishableKey: 'sb_publishable_fallback',
      },
    );

    expect(result.config?.projectHost).toBe('vite-project.supabase.co');
    expect(result.config?.publishableKey).toBe('sb_publishable_vite');
  });

  it('falls back to safely injected non-Vite env values', () => {
    const result = resolveSupabaseConfig(
      {},
      {
        url: 'https://plain-project.supabase.co',
        publishableKey: 'sb_publishable_plain',
      },
    );

    expect(result.config?.projectHost).toBe('plain-project.supabase.co');
    expect(result.config?.publishableKey).toBe('sb_publishable_plain');
  });

  it('reports missing publishable key configuration', () => {
    const result = resolveSupabaseConfig(
      {},
      {
        url: 'https://plain-project.supabase.co',
        publishableKey: '',
      },
    );

    expect(result).toEqual({ config: null, issue: 'missing-key' });
  });

  it('checks the Supabase Auth endpoint without exposing the key in the result', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    const result = await checkSupabaseConnection(
      {
        config: {
          url: 'https://plain-project.supabase.co',
          publishableKey: 'sb_publishable_plain',
          projectHost: 'plain-project.supabase.co',
        },
      },
      fetchImpl,
    );

    expect(fetchImpl).toHaveBeenCalledWith('https://plain-project.supabase.co/auth/v1/settings', {
      method: 'GET',
      headers: {
        apikey: 'sb_publishable_plain',
      },
    });
    expect(result).toMatchObject({
      state: 'connected',
      label: 'Connected',
      projectHost: 'plain-project.supabase.co',
      statusCode: 200,
    });
    expect(result.detail).not.toContain('sb_publishable_plain');
  });
});
