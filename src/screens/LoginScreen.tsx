import type { FormEvent } from 'react';
import { useState } from 'react';

interface LoginScreenProps {
  onCreateAccount: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginScreen({ onCreateAccount, onSubmit }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password to log in.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email.trim(), password);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to log in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-heading">
        <a className="marketing-wordmark auth-wordmark" href="/">AHTR <span>Assist</span></a>
        <div className="auth-copy">
          <p className="marketing-kicker">Welcome back</p>
          <h1 id="login-heading">Log in</h1>
          <p>Open your dashboard, continue saved requests and update your practitioner settings.</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="login-email">Work email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error ? <p className="auth-error" role="alert">{error}</p> : null}

          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New to AHTR Assist? <button type="button" onClick={onCreateAccount}>Create a free trial</button>
        </p>
      </section>
    </main>
  );
}
