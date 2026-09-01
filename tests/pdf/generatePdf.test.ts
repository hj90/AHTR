import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { demoAlliedHealthReferral } from '../../src/forms/templates/demoAlliedHealthReferral';
import { generateCompletedPdf } from '../../src/pdf/generatePdf';
import { formatDateForPdf, formatValueForPdf } from '../../src/pdf/valueFormatters';
import { wrapText } from '../../src/pdf/renderers/renderOverlayField';

describe('PDF generation', () => {
  it('generates a completed PDF from the local demo template', async () => {
    const fixturePath = resolve(process.cwd(), 'public/templates/demo-allied-health-referral.pdf');
    const originalBytes = await readFile(fixturePath);

    const outputBytes = await generateCompletedPdf(
      demoAlliedHealthReferral,
      {
        patientName: 'Test Patient',
        dateOfBirth: '1990-01-01',
        patientPhone: '0000000000',
        patientEmail: 'test@example.com',
        referralDate: '2026-08-13',
        clinicianName: 'Dr Example',
        providerNumber: '1234567A',
        serviceType: 'physiotherapy',
        fundingType: 'private',
        clinicalReason: 'Synthetic clinical reason for a browser-only PDF test.',
        functionalGoals: 'Synthetic mobility goal.',
        consentToShare: true,
        urgent: false,
      },
      {
        fetchTemplate: async () => new Uint8Array(originalBytes),
      },
    );

    const pdfDoc = await PDFDocument.load(outputBytes);
    expect(pdfDoc.getPageCount()).toBe(1);
    expect(outputBytes.byteLength).toBeGreaterThan(originalBytes.byteLength);
  });

  it('formats dates and selected options for the PDF', () => {
    const serviceField = demoAlliedHealthReferral.sections[1].fields.find(
      (field) => field.id === 'serviceType',
    );

    expect(formatDateForPdf('1990-01-01')).toBe('01/01/1990');
    expect(serviceField && formatValueForPdf(serviceField, 'physiotherapy')).toBe(
      'Physiotherapy',
    );
  });

  it('wraps long overlay text to configured width', async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont('Helvetica');
    const lines = wrapText(
      'This is a long synthetic clinical sentence used to test overlay wrapping.',
      font,
      10,
      130,
    );

    expect(lines.length).toBeGreaterThan(1);
  });
});
