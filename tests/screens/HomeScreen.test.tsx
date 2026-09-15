import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeScreen } from '../../src/screens/HomeScreen';
import type { FormSubmission } from '../../src/integrations/formSubmissionStore';

describe('HomeScreen Cliniko import', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('collates selected Cliniko appointments into the consult notes field', async () => {
    const onStartBlank = vi.fn();
    const onStartFromNotes = vi.fn();
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);

      if (url === '/api/cliniko-import?action=patients') {
        return new Response(JSON.stringify({
          patients: [
            {
              id: '1',
              firstName: 'Jordan',
              lastName: 'Hayes',
              preferredFirstName: 'Jordan',
              dateOfBirth: '1987-03-14',
              email: 'jordan@example.test',
              phone: '0400000101',
              updatedAt: '2026-09-14T00:00:00Z',
            },
          ],
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (url === '/api/cliniko-import?action=appointments&patientId=1') {
        return new Response(JSON.stringify({
          appointments: [
            {
              id: '10',
              patientId: '1',
              startsAt: '2026-09-14T00:00:00Z',
              endsAt: '2026-09-14T00:45:00Z',
              appointmentType: 'Demo transcript session',
              practitioner: 'Alex Clinician',
              hasNotes: true,
              notesPreview: 'Right shoulder transcript preview',
            },
          ],
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (url === '/api/cliniko-import' && init?.method === 'POST') {
        return new Response(JSON.stringify({ clinicalNote: 'Collated Cliniko transcript text' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Unexpected request ${url}`);
    });

    render(<HomeScreen practiceState="NSW" onStartBlank={onStartBlank} onStartFromNotes={onStartFromNotes} />);

    fireEvent.click(screen.getByLabelText(/Import from Cliniko/i));

    const patientButton = await screen.findByRole('button', { name: /Jordan Hayes/i });
    fireEvent.click(patientButton);

    const appointmentCheckbox = await screen.findByRole('checkbox', { name: /Demo transcript session/i });
    fireEvent.click(appointmentCheckbox);
    fireEvent.click(screen.getByRole('button', { name: /Import selected/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Consult notes')).toHaveValue('Collated Cliniko transcript text');
    });

    expect(screen.getByRole('button', { name: /Draft form/i })).toBeEnabled();
    expect(onStartFromNotes).not.toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith('/api/cliniko-import', expect.objectContaining({ method: 'POST' }));
  });

  it('allows appointments to be selected for only one expanded patient at a time', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      if (url === '/api/cliniko-import?action=patients') {
        return new Response(JSON.stringify({
          patients: [
            {
              id: '1',
              firstName: 'Jordan',
              lastName: 'Hayes',
              preferredFirstName: 'Jordan',
              dateOfBirth: '1987-03-14',
              email: 'jordan@example.test',
              phone: '0400000101',
              updatedAt: '2026-09-04T00:00:00Z',
            },
            {
              id: '2',
              firstName: 'Casey',
              lastName: 'Nguyen',
              preferredFirstName: 'Casey',
              dateOfBirth: '1992-11-02',
              email: 'casey@example.test',
              phone: '0400000102',
              updatedAt: '2026-09-03T00:00:00Z',
            },
          ],
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (url === '/api/cliniko-import?action=appointments&patientId=1') {
        return new Response(JSON.stringify({
          appointments: [
            {
              id: '10',
              patientId: '1',
              startsAt: '2026-09-04T00:00:00Z',
              endsAt: '2026-09-04T00:45:00Z',
              appointmentType: 'Shoulder review',
              practitioner: 'Alex Clinician',
              hasNotes: true,
              notesPreview: 'Right shoulder transcript preview',
            },
          ],
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (url === '/api/cliniko-import?action=appointments&patientId=2') {
        return new Response(JSON.stringify({
          appointments: [
            {
              id: '20',
              patientId: '2',
              startsAt: '2026-09-03T01:00:00Z',
              endsAt: '2026-09-03T01:45:00Z',
              appointmentType: 'Knee review',
              practitioner: 'Alex Clinician',
              hasNotes: true,
              notesPreview: 'Left knee transcript preview',
            },
          ],
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      throw new Error(`Unexpected request ${url}`);
    });

    render(<HomeScreen practiceState="NSW" onStartBlank={vi.fn()} onStartFromNotes={vi.fn()} />);

    fireEvent.click(screen.getByLabelText(/Import from Cliniko/i));
    fireEvent.click(await screen.findByRole('button', { name: /Jordan Hayes/i }));

    const jordanAppointment = await screen.findByRole('checkbox', { name: /Shoulder review/i });
    fireEvent.click(jordanAppointment);
    expect(screen.getByText('1 appointment selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Import selected/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /Casey Nguyen/i }));

    await screen.findByRole('checkbox', { name: /Knee review/i });
    expect(screen.queryByRole('checkbox', { name: /Shoulder review/i })).not.toBeInTheDocument();
    expect(screen.getByText('0 appointments selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Import selected/i })).toBeDisabled();
  });
});

describe('HomeScreen state-specific form selection', () => {
  it('shows WorkSafe and marks TAC as coming soon for Victoria', () => {
    render(<HomeScreen practiceState="VIC" onStartBlank={vi.fn()} onStartFromNotes={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'What kind of claim is this?' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Work injury/i)).toBeChecked();
    expect(screen.getByLabelText(/Transport accident/i)).toBeDisabled();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('describes the ReturnToWorkSA form for South Australia', () => {
    render(<HomeScreen practiceState="SA" onStartBlank={vi.fn()} onStartFromNotes={vi.fn()} />);

    expect(screen.getByText(/ReturnToWorkSA physiotherapy management plan/i)).toBeInTheDocument();
  });
});

describe('HomeScreen saved requests', () => {
  it('shows drafts and submitted requests and opens the selected request', () => {
    const onOpenSubmission = vi.fn();
    const submissions: FormSubmission[] = [
      {
        id: 'draft-1',
        templateId: 'sira-allied-health-treatment-request',
        practiceState: 'NSW' as const,
        status: 'draft' as const,
        values: { personName: 'Jordan Example', claimNumber: 'NSW-1' },
        createdAt: '2026-09-15T00:00:00Z',
        updatedAt: '2026-09-15T01:00:00Z',
        submittedAt: null,
      },
      {
        id: 'submitted-1',
        templateId: 'worksafe-victoria-allied-health-recovery-management-plan',
        practiceState: 'VIC' as const,
        status: 'submitted' as const,
        values: { personName: 'Alex Morgan' },
        createdAt: '2026-09-14T00:00:00Z',
        updatedAt: '2026-09-14T01:00:00Z',
        submittedAt: '2026-09-14T01:00:00Z',
      },
    ];

    render(
      <HomeScreen
        practiceState="NSW"
        onStartBlank={vi.fn()}
        onStartFromNotes={vi.fn()}
        submissions={submissions}
        onOpenSubmission={onOpenSubmission}
      />,
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Jordan Example').closest('button')!);
    expect(onOpenSubmission).toHaveBeenCalledWith(submissions[0]);
  });

  it('requires confirmation before deleting a request', async () => {
    const onDeleteSubmission = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const submission = {
      id: 'draft-1',
      templateId: 'sira-allied-health-treatment-request',
      practiceState: 'NSW' as const,
      status: 'draft' as const,
      values: { personName: 'Jordan Example' },
      createdAt: '2026-09-15T00:00:00Z',
      updatedAt: '2026-09-15T01:00:00Z',
      submittedAt: null,
    };

    render(
      <HomeScreen
        practiceState="NSW"
        onStartBlank={vi.fn()}
        onStartFromNotes={vi.fn()}
        submissions={[submission]}
        onDeleteSubmission={onDeleteSubmission}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete request for Jordan Example/i }));
    await waitFor(() => expect(onDeleteSubmission).toHaveBeenCalledWith('draft-1'));
  });
});
