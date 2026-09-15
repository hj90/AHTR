import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signUpWithEmailPassword } from '../../src/integrations/authSession';
import { getSupabaseClient } from '../../src/integrations/supabaseClient';

vi.mock('../../src/integrations/supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
}));

const getSupabaseClientMock = vi.mocked(getSupabaseClient);

describe('auth session integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a clear message when Supabase rejects an existing signup email', async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'User already registered' },
    });
    getSupabaseClientMock.mockReturnValue({ auth: { signUp } } as never);

    await expect(signUpWithEmailPassword({
      email: 'alex@example.test',
      password: 'password123',
      practiceState: 'NSW',
    })).rejects.toThrow('An account already exists for this email. Log in instead.');
  });

  it('shows a clear message when Supabase returns no new identity for signup', async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: {
        session: null,
        user: {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          identities: [],
        },
      },
      error: null,
    });
    getSupabaseClientMock.mockReturnValue({ auth: { signUp } } as never);

    await expect(signUpWithEmailPassword({
      email: 'alex@example.test',
      password: 'password123',
      practiceState: 'NSW',
    })).rejects.toThrow('An account already exists for this email. Log in instead.');
  });
});
