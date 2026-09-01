import { PDFDocument, StandardFonts } from 'pdf-lib';
import type { FormValues, PdfTemplateDefinition } from '../forms/formTypes';
import { renderAcroField } from './renderers/renderAcroField';
import { renderOverlayField } from './renderers/renderOverlayField';

export interface GeneratePdfOptions {
  fetchTemplate?: (templatePath: string) => Promise<ArrayBuffer | Uint8Array>;
}

export async function generateCompletedPdf(
  template: PdfTemplateDefinition,
  values: FormValues,
  options: GeneratePdfOptions = {},
): Promise<Uint8Array> {
  const templateBytes = await loadTemplateBytes(template.templatePath, options.fetchTemplate);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const overlayFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const section of template.sections) {
    for (const field of section.fields) {
      const value = values[field.id];

      if (field.pdf.mode === 'acroform') {
        renderAcroField(pdfDoc, field, value);
      } else {
        const page = pdfDoc.getPage(field.pdf.page);
        renderOverlayField(page, field, value, overlayFont);
      }
    }
  }

  pdfDoc.getForm().updateFieldAppearances(overlayFont);
  return pdfDoc.save();
}

async function loadTemplateBytes(
  templatePath: string,
  fetchTemplate?: (templatePath: string) => Promise<ArrayBuffer | Uint8Array>,
): Promise<ArrayBuffer | Uint8Array> {
  if (fetchTemplate) {
    return fetchTemplate(templatePath);
  }

  const response = await fetch(templatePath, {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('PDF_TEMPLATE_LOAD_FAILED');
  }

  return response.arrayBuffer();
}
