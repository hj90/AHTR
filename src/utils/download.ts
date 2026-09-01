import type { PdfTemplateDefinition } from '../forms/formTypes';

export function createGenericDownloadName(
  template: PdfTemplateDefinition,
  date: Date = new Date(),
): string {
  const day = date.toISOString().slice(0, 10);
  const baseName = template.defaultDownloadName.replace(/\.pdf$/i, '');
  return `${baseName}-${day}.pdf`;
}

export function createPdfObjectUrl(bytes: Uint8Array): string {
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
