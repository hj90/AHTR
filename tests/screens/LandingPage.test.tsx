import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LandingPage } from '../../src/screens/LandingPage';

describe('LandingPage', () => {
  it('opens the login flow when Log in is selected', () => {
    const onLogin = vi.fn();
    render(<LandingPage onLogin={onLogin} onStartTrial={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(onLogin).toHaveBeenCalledOnce();
  });

  it('requires an email and state before starting a trial', () => {
    const onStartTrial = vi.fn();
    render(<LandingPage onLogin={vi.fn()} onStartTrial={onStartTrial} />);

    fireEvent.submit(screen.getByRole('button', { name: 'Start free trial' }).closest('form')!);

    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email and choose your state to continue.');
    expect(onStartTrial).not.toHaveBeenCalled();
  });

  it('sends the email and selected state into the signup flow', () => {
    const onStartTrial = vi.fn();
    render(<LandingPage onLogin={vi.fn()} onStartTrial={onStartTrial} />);

    fireEvent.change(screen.getByLabelText('Work email'), { target: { value: 'alex@example.test' } });
    fireEvent.change(screen.getByLabelText('Where do you practise?'), { target: { value: 'VIC' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Start free trial' }).closest('form')!);

    expect(onStartTrial).toHaveBeenCalledWith({
      email: 'alex@example.test',
      practiceState: 'VIC',
    });
  });

  it('does not show the form availability labels in the hero', () => {
    render(<LandingPage onLogin={vi.fn()} onStartTrial={vi.fn()} />);
    expect(screen.queryByText('Forms supported')).not.toBeInTheDocument();
    expect(screen.queryByText('Coming next')).not.toBeInTheDocument();
  });

  it('shows review-first PDF copy and realistic sample requests', () => {
    render(<LandingPage onLogin={vi.fn()} onStartTrial={vi.fn()} />);
    expect(screen.getByText(/Download the insurer’s official PDF/)).toBeInTheDocument();
    expect(screen.getByText('A. Whitfield')).toBeInTheDocument();
    expect(screen.getByText('WS-204418')).toBeInTheDocument();
    expect(screen.queryByText('Sample Patient A')).not.toBeInTheDocument();
  });
});
