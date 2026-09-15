import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthScreen } from '../../src/screens/AuthScreen';
import { getSupabaseClient } from '../../src/integrations/supabaseClient';

vi.mock('../../src/integrations/supabaseClient', () => ({ getSupabaseClient: vi.fn() }));

describe('AuthScreen', () => {
  it('sends a magic link that may create a demo account', async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(getSupabaseClient).mockReturnValue({ auth: { signInWithOtp } } as never);
    render(<AuthScreen />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'alex@practice.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Email me a login link' }));
    await waitFor(() => expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'alex@practice.test',
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: true },
    }));
    expect(await screen.findByRole('status')).toHaveTextContent('alex@practice.test');
  });
});
