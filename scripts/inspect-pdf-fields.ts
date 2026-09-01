import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PDFDocument, PDFField } from 'pdf-lib';

const [, , input] = process.argv;

if (!input) {
  throw new Error('Usage: npm run inspect-pdf -- public/templates/form.pdf');
}

const path = resolve(process.cwd(), input);
const pdfDoc = await PDFDocument.load(await readFile(path));
const fields = pdfDoc.getForm().getFields();

if (fields.length === 0) {
  console.info('No AcroForm fields found. Use coordinate overlay mapping.');
  process.exit(0);
}

for (const field of fields) {
  console.info(`${field.getName()}\t${fieldType(field)}`);
}

function fieldType(field: PDFField): string {
  return field.constructor.name.replace(/^PDF/, '').replace(/Field$/, '').toLowerCase();
}
