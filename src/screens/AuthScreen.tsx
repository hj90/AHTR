import { useState } from 'react';
import { getSupabaseClient } from '../integrations/supabaseClient';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Login is not configured.');
      return;
    }

    setIsSending(true);
    setError(null);
    setMessage(null);
    const result = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: true },
    });
    setIsSending(false);

    if (result.error) {
      setError('We could not send the login link. Please check the email and try again.');
      return;
    }

    setMessage(`Check ${email.trim()} for your secure login link.`);
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand">AHTR</div>
        <h1>Sign in to AHTR Assist</h1>
        <p>Enter your email and we’ll send you a secure, one-time login link.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendMagicLink();
          }}
        >
          <label>
            <span>Email address</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@practice.com.au"
            />
          </label>
          <button className="primary-action" type="submit" disabled={isSending}>
            {isSending ? 'Sending link…' : 'Email me a login link'}
          </button>
        </form>
        {message ? <p className="auth-message" role="status">{message}</p> : null}
        {error ? <p className="auth-error" role="alert">{error}</p> : null}
        <small>For this demo, entering a new email creates an account automatically.</small>
      </section>
    </main>
  );
}
