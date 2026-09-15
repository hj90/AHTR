import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import type { PractitionerSettings } from '../utils/practitionerSettings';

interface SignupScreenProps {
  initialEmail: string;
  initialPracticeState: PractitionerSettings['practiceState'] | '';
  onLogin: () => void;
  onSubmit: (details: {
    email: string;
    password: string;
    practiceState: PractitionerSettings['practiceState'];
  }) => Promise<void>;
}

const practiceStateOptions: Array<{ value: PractitionerSettings['practiceState']; label: string }> = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
];

export function SignupScreen({
  initialEmail,
  initialPracticeState,
  onLogin,
  onSubmit,
}: SignupScreenProps) {
  const [email, setEmail] = useState(initialEmail);
  const [practiceState, setPracticeState] = useState(initialPracticeState);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setEmail(initialEmail), [initialEmail]);
  useEffect(() => setPracticeState(initialPracticeState), [initialPracticeState]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim() || !practiceState) {
      setError('Enter your email and choose your state to continue.');
      return;
    }

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedEmail = email.trim();
      await onSubmit({
        email: trimmedEmail,
        password,
        practiceState,
      });
      setMessage('Account created.');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="signup-heading">
        <a className="marketing-wordmark auth-wordmark" href="/">AHTR <span>Assist</span></a>
        <div className="auth-copy">
          <p className="marketing-kicker">Create free trial</p>
          <h1 id="signup-heading">Set your password</h1>
          <p>Finish creating your account, then we’ll take you into settings to complete your practitioner and clinic details.</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="signup-email">Work email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="signup-state">Practice state</label>
          <select
            id="signup-state"
            value={practiceState}
            onChange={(event) => setPracticeState(event.target.value as PractitionerSettings['practiceState'] | '')}
            required
          >
            <option value="">Select your state</option>
            {practiceStateOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          <label htmlFor="signup-confirm-password">Confirm password</label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          {error ? <p className="auth-error" role="alert">{error}</p> : null}
          {message ? <p className="auth-message" role="status">{message}</p> : null}

          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <button type="button" onClick={onLogin}>Log in</button>
        </p>
      </section>
    </main>
  );
}
