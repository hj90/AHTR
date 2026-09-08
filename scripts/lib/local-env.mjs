import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function loadLocalEnv(cwd = process.cwd()) {
  const localEnvPath = resolve(cwd, '.env.local');
  const fileEnv = existsSync(localEnvPath) ? parseEnvText(await readFile(localEnvPath, 'utf8')) : {};

  return { ...fileEnv, ...process.env };
}

export function parseEnvText(text) {
  const values = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    values[key] = parseEnvValue(line.slice(separator + 1).trim());
  }

  return values;
}

function parseEnvValue(value) {
  if (value.length < 2) return value;

  const quote = value[0];
  if ((quote !== '"' && quote !== "'") || value[value.length - 1] !== quote) return value;

  const inner = value.slice(1, -1);
  if (quote === "'") return inner;

  return inner
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}
