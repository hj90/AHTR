import { mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const execFileAsync = promisify(execFile);
const outputPath = resolve(
  __dirname,
  '../public/templates/demo-allied-health-referral.pdf',
);
const previewPrefix = resolve(
  __dirname,
  '../public/templates/demo-allied-health-referral-preview',
);

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([612, 792]);
const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

const ink = rgb(0.09, 0.13, 0.12);
const muted = rgb(0.35, 0.42, 0.4);
const rule = rgb(0.74, 0.78, 0.75);
const accent = rgb(0.05, 0.45, 0.42);

function text(label, x, y, size = 10, font = regular, color = ink) {
  page.drawText(label, { x, y, size, font, color });
}

function line(x1, y, x2) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.7,
    color: rule,
  });
}

function box(x, y, size = 10) {
  page.drawRectangle({
    x,
    y,
    width: size,
    height: size,
    borderColor: rule,
    borderWidth: 0.8,
  });
}

text('Demo Allied Health Referral', 54, 738, 19, bold, accent);
text('Synthetic fixture for local browser-only PDF generation tests.', 54, 718, 9, regular, muted);
text('Replace with the real blank PDF and mapping before production use.', 54, 704, 9, regular, muted);

text('Patient details', 54, 668, 13, bold);
text('Patient full name', 54, 690, 9, regular, muted);
line(145, 688, 540);
text('Date of birth', 54, 663, 9, regular, muted);
line(145, 661, 330);
text('Phone', 54, 637, 9, regular, muted);
line(145, 635, 330);
text('Email', 54, 611, 9, regular, muted);
line(145, 609, 540);

text('Referral details', 54, 573, 13, bold);
text('Referral date', 54, 557, 9, regular, muted);
line(145, 555, 330);
text('Clinician', 54, 531, 9, regular, muted);
line(145, 529, 540);
text('Provider number', 54, 505, 9, regular, muted);
line(145, 503, 330);
text('Service requested', 54, 479, 9, regular, muted);
line(145, 477, 540);
text('Funding', 54, 451, 9, regular, muted);
box(145, 447);
text('NDIS', 160, 448, 9);
box(222, 447);
text('Medicare', 237, 448, 9);
box(322, 447);
text('Private', 337, 448, 9);
box(410, 447);
text('Workers compensation', 425, 448, 9);

text('Clinical reason', 54, 414, 13, bold);
page.drawRectangle({ x: 54, y: 306, width: 504, height: 88, borderColor: rule, borderWidth: 0.7 });
text('Functional goals', 54, 276, 13, bold);
page.drawRectangle({ x: 54, y: 228, width: 504, height: 36, borderColor: rule, borderWidth: 0.7 });

box(54, 204, 12);
text('Consent to share this referral information with the receiving provider', 73, 206, 9);
box(54, 181, 12);
text('Urgent request', 73, 183, 9);

text('Generated locally in the browser by the Allied Health PDF Filler demo.', 54, 52, 8, regular, muted);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, await pdfDoc.save());

try {
  const pdftoppm = findPdftoppm();
  await execFileAsync(pdftoppm, ['-png', '-singlefile', '-r', '120', outputPath, previewPrefix]);
} catch {
  try {
    await execFileAsync('/usr/bin/sips', [
      '-s',
      'format',
      'png',
      outputPath,
      '--out',
      `${previewPrefix}.png`,
    ]);
  } catch {
    if (!existsSync(`${previewPrefix}.png`)) {
      process.stderr.write('Preview PNG was not generated because no PDF renderer was available.\n');
    }
  }
}

function findPdftoppm() {
  const candidates = [
    '/Users/minjieshi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm',
    '/opt/homebrew/bin/pdftoppm',
    '/usr/local/bin/pdftoppm',
    'pdftoppm',
  ];

  return candidates.find((candidate) => candidate === 'pdftoppm' || existsSync(candidate)) ?? 'pdftoppm';
}
