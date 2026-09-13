import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { returnToWorkSouthAustraliaPhysiotherapyManagementPlan as template } from '../../src/forms/templates/returnToWorkSouthAustraliaPhysiotherapyManagementPlan';
import { generateCompletedPdf } from '../../src/pdf/generatePdf';

describe('ReturnToWorkSA PDF generation', () => {
  it('writes a guided physiotherapy management plan over the official form', async () => {
    const originalBytes = await readFile(resolve(process.cwd(), 'public/templates/return-to-work-south-australia-physiotherapy-management-plan.pdf'));
    const values = Object.fromEntries(
      template.sections.flatMap((section) => section.fields).map((field) => [field.id, field.type === 'checkbox' ? false : '']),
    );
    Object.assign(values, {
      personName: 'Jordan Hayes',
      claimNumber: 'SA-12345',
      compensableInjury: 'Right shoulder strain',
      saClaimsAgent: 'eml',
      injuryDate: '2026-08-01',
      saTreatmentsToDate: '10',
      saGoal1: 'Resume normal lifting duties',
      saGoal1Date: '2026-10-30',
      saGoal1Plan: 'Graded strengthening and workplace exercises',
      estimatedDischargeDate: '2026-11-15',
      practitionerName: 'Alex Clinician',
      practiceName: 'Example Physiotherapy',
      practiceAddress: '1 Example Street, Adelaide SA 5000',
      phoneNumber: '08 8000 0000',
      practiceEmail: 'alex@example.test',
      saWorkAssistsRecovery: true,
    });

    const output = await generateCompletedPdf(template, values, { fetchTemplate: async () => new Uint8Array(originalBytes) });
    const pdf = await PDFDocument.load(output);

    expect(pdf.getPageCount()).toBe(4);
    expect(output.byteLength).toBeGreaterThan(100_000);
    expect(output.byteLength).not.toBe(originalBytes.byteLength);
  });
});
