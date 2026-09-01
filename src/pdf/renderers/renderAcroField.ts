import { PDFDocument, PDFName } from 'pdf-lib';
import type { FieldValue, FormFieldDefinition } from '../../forms/formTypes';
import { formatValueForPdf } from '../valueFormatters';

export function renderAcroField(
  pdfDoc: PDFDocument,
  field: FormFieldDefinition,
  value: FieldValue,
): void {
  if (field.pdf.mode !== 'acroform' || value === '' || value === false) {
    return;
  }

  try {
    const form = pdfDoc.getForm();
    const pdfFieldType = field.pdf.pdfFieldType ?? 'text';

    if (pdfFieldType === 'checkbox') {
      const checkbox = form.getCheckBox(field.pdf.fieldName);
      if (value === true) {
        checkbox.check();
      } else {
        checkbox.uncheck();
      }
      return;
    }

    if (pdfFieldType === 'buttonGroup') {
      const checkbox = form.getCheckBox(field.pdf.fieldName);
      const exportValue = field.pdf.exportValueByValue?.[String(value)] ?? String(value);
      const selected = PDFName.of(exportValue);
      checkbox.acroField.dict.set(PDFName.of('V'), selected);

      for (const widget of checkbox.acroField.getWidgets()) {
        const onValue = widget.getOnValue();
        widget.setAppearanceState(
          onValue?.toString() === selected.toString() ? selected : PDFName.of('Off'),
        );
      }
      return;
    }

    if (pdfFieldType === 'radio') {
      form.getRadioGroup(field.pdf.fieldName).select(String(value));
      return;
    }

    if (pdfFieldType === 'dropdown') {
      form.getDropdown(field.pdf.fieldName).select(formatValueForPdf(field, value));
      return;
    }

    form.getTextField(field.pdf.fieldName).setText(formatValueForPdf(field, value));
  } catch {
    throw new Error(`PDF_MAPPING_ERROR: fieldId=${field.id}`);
  }
}
