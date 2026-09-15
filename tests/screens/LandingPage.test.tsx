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

  it('uses only the currently supported state schemes', () => {
    render(<LandingPage onEnterApp={vi.fn()} />);
    expect(screen.getByLabelText('Supported schemes')).toHaveTextContent('SIRA NSW');
    expect(screen.getByLabelText('Supported schemes')).toHaveTextContent('WorkCover WA');
    expect(screen.queryByText('NT WorkSafe')).not.toBeInTheDocument();
  });
});
