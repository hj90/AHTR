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

  it('shows only shipped forms as supported, with upcoming forms called out separately', () => {
    render(<LandingPage onEnterApp={vi.fn()} />);
    expect(screen.getByLabelText('Forms supported')).toHaveTextContent('SIRA allied health treatment request (SIRA09191)');
    expect(screen.getByLabelText('Coming next')).toHaveTextContent('WorkSafe Victoria AHRMP');
    expect(screen.getByLabelText('Coming next')).toHaveTextContent('WorkCover Queensland PMP');
  });
});
