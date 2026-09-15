import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SignupScreen } from '../../src/screens/SignupScreen';

describe('SignupScreen', () => {
  it('shows the duplicate email message returned during account creation', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('An account already exists for this email. Log in instead.'));
    render(
      <SignupScreen
        initialEmail="alex@example.test"
        initialPracticeState="NSW"
        onLogin={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }).closest('form')!);

    expect(await screen.findByRole('alert')).toHaveTextContent('An account already exists for this email. Log in instead.');
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'alex@example.test',
      password: 'password123',
      practiceState: 'NSW',
    });
  });

  it('creates the account when the email is available', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <SignupScreen
        initialEmail="alex@example.test"
        initialPracticeState="VIC"
        onLogin={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Create account' }).closest('form')!);

    await screen.findByRole('status');
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'alex@example.test',
      password: 'password123',
      practiceState: 'VIC',
    });
  });
});
