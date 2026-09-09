import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  importClinikoAppointments,
  listClinikoAppointments,
  listClinikoPatients,
} from '../../src/integrations/clinikoImport';

describe('Cliniko import client', () => {
  afterEach(() => vi.restoreAllMocks());

  it('loads patients through the local API endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        patients: [{ id: '1', firstName: 'Jordan', lastName: 'Hayes' }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    await expect(listClinikoPatients()).resolves.toEqual([
      { id: '1', firstName: 'Jordan', lastName: 'Hayes' },
    ]);
    expect(fetchMock).toHaveBeenCalledWith('/api/cliniko-import?action=patients');
  });

  it('loads appointments for a patient through the local API endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        appointments: [{ id: '10', patientId: '1', hasNotes: true }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    await expect(listClinikoAppointments('1')).resolves.toEqual([
      { id: '10', patientId: '1', hasNotes: true },
    ]);
    expect(fetchMock).toHaveBeenCalledWith('/api/cliniko-import?action=appointments&patientId=1');
  });

  it('imports selected appointment notes through the local API endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ clinicalNote: 'Collated Cliniko transcript' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(importClinikoAppointments(['10', '11'])).resolves.toBe('Collated Cliniko transcript');
    expect(fetchMock).toHaveBeenCalledWith('/api/cliniko-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentIds: ['10', '11'] }),
    });
  });

  it('surfaces safe API errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Cliniko is not configured.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(listClinikoPatients()).rejects.toThrow('Cliniko is not configured.');
  });
});
