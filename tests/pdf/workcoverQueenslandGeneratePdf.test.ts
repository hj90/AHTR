import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { workcoverQueenslandProviderManagementPlan as template } from '../../src/forms/templates/workcoverQueenslandProviderManagementPlan';
import { generateCompletedPdf } from '../../src/pdf/generatePdf';

describe('WorkCover Queensland PDF generation', () => {
  it('fills the official Provider Management Plan', async () => {
    const originalBytes = await readFile(resolve(process.cwd(), 'public/templates/workcover-queensland-provider-management-plan.pdf'));
    const values = Object.fromEntries(
      template.sections.flatMap((section) => section.fields).map((field) => [field.id, field.type === 'checkbox' ? false : '']),
    );
    Object.assign(values, {
      qldServicePhysiotherapy: true,
      personName: 'Jordan Hayes',
      dateOfBirth: '1987-03-14',
      injuryDate: '2026-08-01',
      compensableInjury: 'Right shoulder strain',
      claimNumber: 'QLD-12345',
      qldPlanNumber: '2',
      qldInitialConsultationDate: '2026-08-05',
      qldRequestedConsultations: '5',
      qldProviderContactDetails: 'Alex Clinician\nalex@example.test\n07 3000 0000',
      phoneNumber: '07 3000 0000',
      intervention: 'Weekly physiotherapy for five weeks.',
      qldConsultation1ItemNumber: '100003',
      qldConsultation1Services: '5',
      qldOutcome1Measure: 'PSFS',
      qldOutcome1Initial: '3/10',
      qldOutcome1Current: '5/10',
      qldOutcome1Anticipated: '8/10',
      qldBarrier1Description: 'Limited overhead tolerance',
      qldBarrier1Strategy: 'Graded strengthening and modified duties',
    });

    const output = await generateCompletedPdf(template, values, { fetchTemplate: async () => new Uint8Array(originalBytes) });
    const pdf = await PDFDocument.load(output);
    const form = pdf.getForm();

    expect(pdf.getPageCount()).toBe(1);
    expect(form.getTextField('Name').getText()).toBe('Jordan Hayes');
    expect(form.getTextField('DOB').getText()).toBe('14/03/1987');
    expect(form.getTextField('Claim number').getText()).toBe('QLD-12345');
    expect(form.getTextField('Treatment plan').getText()).toBe('Weekly physiotherapy for five weeks.');
    expect(form.getCheckBox('Physiotherapy').isChecked()).toBe(true);
  });
});
