import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { emptyPractitionerSettings } from '../../src/utils/practitionerSettings';

describe('SettingsScreen', () => {
  it('shows practitioner settings without the integration status panel', () => {
    render(
      <SettingsScreen
        settings={emptyPractitionerSettings}
        onSave={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Practitioner and clinic details' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Checks and integrations' })).not.toBeInTheDocument();
  });
});
