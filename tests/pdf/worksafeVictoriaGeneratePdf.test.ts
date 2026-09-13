import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { worksafeVictoriaAlliedHealthRecoveryManagementPlan as template } from '../../src/forms/templates/worksafeVictoriaAlliedHealthRecoveryManagementPlan';
import { generateCompletedPdf } from '../../src/pdf/generatePdf';

describe('WorkSafe Victoria PDF generation', () => {
  it('fills the official recovery management plan', async () => {
    const originalBytes = await readFile(resolve(process.cwd(), 'public/templates/worksafe-victoria-allied-health-recovery-management-plan.pdf'));
    const values = Object.fromEntries(
      template.sections.flatMap((section) => section.fields).map((field) => [field.id, field.type === 'checkbox' ? true : field.type === 'radio' ? 'yes' : 'Example value']),
    );
    Object.assign(values, {
      personName: 'Jordan Hayes',
      dateOfBirth: '1987-03-14',
      injuryDate: '2026-08-01',
      claimNumber: 'VIC-12345',
      practitionerName: 'Alex Clinician',
      practiceEmail: 'alex@example.test',
    });

    const output = await generateCompletedPdf(template, values, { fetchTemplate: async () => new Uint8Array(originalBytes) });
    const pdf = await PDFDocument.load(output);
    const form = pdf.getForm();

    expect(pdf.getPageCount()).toBe(4);
    expect(form.getTextField("Worker's name").getText()).toBe('Jordan Hayes');
    expect(form.getTextField('Date2_af_date').getText()).toBe('14/03/1987');
    expect(form.getTextField('Claim number').getText()).toBe('VIC-12345');
    expect(form.getTextField('Treating provider’s name').getText()).toBe('Alex Clinician');
    expect(form.getCheckBox('Physiotherapy').isChecked()).toBe(true);
  });
});
