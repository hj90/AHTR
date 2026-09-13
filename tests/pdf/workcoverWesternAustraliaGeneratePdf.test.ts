import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan as template } from '../../src/forms/templates/workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan';
import { generateCompletedPdf } from '../../src/pdf/generatePdf';

describe('WorkCover Western Australia PDF generation', () => {
  it('fills the official physiotherapy Treatment Management Plan', async () => {
    const originalBytes = await readFile(resolve(process.cwd(), 'public/templates/workcover-western-australia-physiotherapy-treatment-management-plan.pdf'));
    const values = Object.fromEntries(
      template.sections.flatMap((section) => section.fields).map((field) => [field.id, field.type === 'checkbox' ? false : '']),
    );
    Object.assign(values, {
      personName: 'Jordan Hayes',
      dateOfBirth: '1987-03-14',
      claimNumber: 'WA-12345',
      injuryDate: '2026-08-01',
      waInitialConsultationDate: '2026-08-05',
      compensableInjury: 'Right shoulder strain',
      waAreasTreated: 'Right shoulder',
      waWalkingSelected: true,
      waWalkingCurrent: '2 km with mild pain',
      waHoursOrDutiesProgressed: 'yes',
      waLikelyPreInjuryCapacity: 'unsure',
      waTreatmentSessions: '5',
      waTreatmentWeeks: '5',
      intervention: 'Weekly physiotherapy and graded strengthening.',
      waSelfManagementImplemented: 'yes',
      practitionerName: 'Alex Clinician',
      practiceName: 'Example Physiotherapy',
      practiceEmail: 'alex@example.test',
      phoneNumber: '08 9000 0000',
    });

    const output = await generateCompletedPdf(template, values, { fetchTemplate: async () => new Uint8Array(originalBytes) });
    const pdf = await PDFDocument.load(output);
    const form = pdf.getForm();

    expect(pdf.getPageCount()).toBe(4);
    expect(form.getTextField('Workers name').getText()).toBe('Jordan Hayes');
    expect(form.getTextField('Date of birth').getText()).toBe('14/03/1987');
    expect(form.getTextField('Date of initial consultation').getText()).toBe('01/08/2026');
    expect(form.getTextField('undefined').getText()).toBe('05/08/2026');
    expect(form.getTextField('Physiotherapists diagnosis').getText()).toBe('Right shoulder strain');
    expect(form.getTextField('undefined_6').getText()).toBe('Weekly physiotherapy and graded strengthening.');
    expect(form.getCheckBox('walking').isChecked()).toBe(true);
    expect(form.getRadioGroup('undefined_3').getSelected()).toBe('Yes_4');
    expect(form.getRadioGroup('Is the worker likely to return to the functional capacity required to perform their preinjury duties').getSelected()).toBe('Unsure');
    expect(form.getRadioGroup('undefined_7').getSelected()).toBe('Yes_6');
  });
});
