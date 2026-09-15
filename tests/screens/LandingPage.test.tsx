import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LandingPage } from '../../src/screens/LandingPage';

describe('LandingPage', () => {
  it('opens the app when Log in is selected', () => {
    const onEnterApp = vi.fn();
    render(<LandingPage onEnterApp={onEnterApp} />);
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(onEnterApp).toHaveBeenCalledOnce();
  });

  it('does not show the form availability labels in the hero', () => {
    render(<LandingPage onEnterApp={vi.fn()} />);
    expect(screen.queryByText('Forms supported')).not.toBeInTheDocument();
    expect(screen.queryByText('Coming next')).not.toBeInTheDocument();
  });

  it('shows review-first PDF copy and realistic sample requests', () => {
    render(<LandingPage onEnterApp={vi.fn()} />);
    expect(screen.getByText(/Download the insurer’s official PDF/)).toBeInTheDocument();
    expect(screen.getByText('A. Whitfield')).toBeInTheDocument();
    expect(screen.getByText('WS-204418')).toBeInTheDocument();
    expect(screen.queryByText('Sample Patient A')).not.toBeInTheDocument();
  });
});
