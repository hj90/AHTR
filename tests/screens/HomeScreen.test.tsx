import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeScreen } from '../../src/screens/HomeScreen';

describe('HomeScreen three-step start flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('moves from practitioner to patient to treatment request details', () => {
    const onStartBlank = vi.fn();

    render(<HomeScreen practiceState="NSW" onStartBlank={onStartBlank} onStartFromNotes={vi.fn()} />);

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Choose practitioner details' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Use saved settings' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: /Continue to patient/i }));

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Choose patient details' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Fill it in the form' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: /Continue to treatment/i }));

    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Choose treatment request details' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Fill it in myself' })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: /Open form/i }));

    expect(onStartBlank).toHaveBeenCalledWith({
      patient: { source: 'form', selected: null },
      practitioner: { source: 'settings', selected: null },
    });
  });

  it('imports one Cliniko treatment session and moves it into the consult notes draft', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);

      if (url === '/api/cliniko-import?action=practitioners') {
        return new Response(JSON.stringify({ practitioners: [{ id: '2', name: 'Taylor Mills', designation: 'Physiotherapist' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url === '/api/cliniko-import?action=patients') {
        return new Response(JSON.stringify({ patients: [{ id: '1', firstName: 'Jordan', lastName: 'Hayes', preferredFirstName: 'Jordan', dateOfBirth: '1987-03-14', email: 'jordan@example.test', phone: '0400000101', updatedAt: '2026-09-14T00:00:00Z' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url === '/api/cliniko-import?action=appointments&patientId=1') {
        return new Response(JSON.stringify({ appointments: [{ id: '10', patientId: '1', startsAt: '2026-09-14T00:00:00Z', endsAt: '2026-09-14T00:45:00Z', appointmentType: 'Shoulder review', practitioner: 'Taylor Mills', hasNotes: true, notesPreview: 'Right shoulder treatment note' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url === '/api/cliniko-import' && init?.method === 'POST') {
        return new Response(JSON.stringify({ clinicalNote: 'Imported Cliniko treatment note' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      throw new Error(`Unexpected request ${url}`);
    });
    const onStartFromNotes = vi.fn().mockResolvedValue(undefined);

    render(<HomeScreen practiceState="NSW" onStartBlank={vi.fn()} onStartFromNotes={onStartFromNotes} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Import from Cliniko' }));
    fireEvent.click(await screen.findByRole('radio', { name: /Taylor Mills/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to patient/i }));

    fireEvent.click(screen.getByRole('radio', { name: 'Import from Cliniko' }));
    fireEvent.click(await screen.findByRole('radio', { name: /Jordan Hayes/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue to treatment/i }));

    fireEvent.click(screen.getByRole('radio', { name: 'Import treatment notes from Cliniko' }));
    fireEvent.click(await screen.findByRole('radio', { name: /Shoulder review/i }));
    fireEvent.click(screen.getByRole('button', { name: /Import treatment notes/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Consult notes')).toHaveValue('Imported Cliniko treatment note');
    });
    expect(screen.getByRole('radio', { name: 'Paste consult notes' })).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /Draft form/i }));
    await waitFor(() => {
      expect(onStartFromNotes).toHaveBeenCalledWith('Imported Cliniko treatment note', {
        patient: expect.objectContaining({ source: 'cliniko', selected: expect.objectContaining({ id: '1' }) }),
        practitioner: expect.objectContaining({ source: 'cliniko', selected: expect.objectContaining({ id: '2' }) }),
      });
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/cliniko-import', expect.objectContaining({ method: 'POST' }));
  });
});

describe('HomeScreen state-specific form selection', () => {
  it('shows WorkSafe and marks TAC as coming soon for Victoria', () => {
    render(<HomeScreen practiceState="VIC" onStartBlank={vi.fn()} onStartFromNotes={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'What kind of claim is this?' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Work injury/i)).toBeChecked();
    expect(screen.getByLabelText(/Transport accident/i)).toBeDisabled();
  });
});
