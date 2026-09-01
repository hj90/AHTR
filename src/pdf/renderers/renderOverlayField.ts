import {
  PDFPage,
  PDFFont,
  rgb,
} from 'pdf-lib';
import type { FieldValue, FormFieldDefinition } from '../../forms/formTypes';
import { formatValueForPdf } from '../valueFormatters';

export function renderOverlayField(
  page: PDFPage,
  field: FormFieldDefinition,
  value: FieldValue,
  font: PDFFont,
): void {
  if (field.pdf.mode !== 'overlay' || value === '' || value === false) {
    return;
  }

  const mapping = field.pdf;
  const size = mapping.size ?? 10;
  const color = rgb(0.08, 0.13, 0.12);

  if (mapping.renderAs === 'checkbox') {
    page.drawText('X', {
      x: mapping.x + 1.8,
      y: mapping.y - 0.4,
      size: 10,
      font,
      color,
    });
    return;
  }

  if (mapping.renderAs === 'radio') {
    const option = typeof value === 'string' ? mapping.optionMap?.[value] : undefined;
    if (!option) {
      throw new Error(`PDF_MAPPING_ERROR: fieldId=${field.id}`);
    }

    page.drawText('X', {
      x: option.x + 1.8,
      y: option.y - 0.4,
      size: 10,
      font,
      color,
    });
    return;
  }

  const text = formatValueForPdf(field, value);
  const maxWidth = mapping.maxWidth ?? 420;
  const lines = wrapText(text, font, size, maxWidth);
  const lineHeight = mapping.lineHeight ?? size + 3;

  lines.forEach((line, index) => {
    page.drawText(line, {
      x: mapping.x,
      y: mapping.y - index * lineHeight,
      size,
      font,
      color,
      maxWidth,
    });
  });
}

export function wrapText(
  value: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];

  for (const paragraph of value.split(/\r?\n/)) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) {
          lines.push(line);
        }
        line = word;
      }
    }

    if (line) {
      lines.push(line);
    }
  }

  return lines.length > 0 ? lines : [''];
}
