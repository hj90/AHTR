import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const defaultMigrationPath = 'supabase/migrations/202609080001_create_demo_users.sql';

async function parseEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  const text = await readFile(path, 'utf8');
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter((line) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1).trim()];
      }),
  );
}

const fileEnv = await parseEnvFile(resolve(process.cwd(), '.env.local'));
const env = { ...fileEnv, ...process.env };
const accessToken = env.SUPABASE_ACCESS_TOKEN;
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const databaseUrl = env.SUPABASE_DB_URL || env.DATABASE_URL || env.POSTGRES_URL;
const migrationPath = process.argv[2] ?? defaultMigrationPath;

if (databaseUrl) {
  const normalizedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);
  const result = spawnSync(
    'psql',
    [normalizedDatabaseUrl, '-v', 'ON_ERROR_STOP=1', '-f', resolve(process.cwd(), migrationPath)],
    { encoding: 'utf8' },
  );

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(redactOutput(result.stderr));
  }

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Supabase migration failed with exit code ${result.status}.`);
  }

  console.info(`Applied ${migrationPath} with SUPABASE_DB_URL.`);
  process.exit(0);
}

if (!accessToken) {
  throw new Error(
    'Set SUPABASE_DB_URL or SUPABASE_ACCESS_TOKEN before applying remote migrations.',
  );
}

if (!supabaseUrl) {
  throw new Error('Set SUPABASE_URL or VITE_SUPABASE_URL before applying remote migrations.');
}

const projectRef = new URL(supabaseUrl).host.split('.')[0];
const query = await readFile(resolve(process.cwd(), migrationPath), 'utf8');

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Supabase migration failed with HTTP ${response.status}: ${body.slice(0, 500)}`);
}

console.info(`Applied ${migrationPath} to Supabase project ${projectRef}.`);

function normalizeDatabaseUrl(value) {
  const schemeMatch = value.match(/^postgres(?:ql)?:\/\//);
  if (!schemeMatch) {
    return value;
  }

  const scheme = schemeMatch[0];
  const rest = value.slice(scheme.length);
  const credentialsSeparator = rest.lastIndexOf('@');

  if (credentialsSeparator === -1) {
    return value;
  }

  const userInfo = rest.slice(0, credentialsSeparator);
  const hostAndPath = rest.slice(credentialsSeparator + 1);
  const passwordSeparator = userInfo.indexOf(':');

  if (passwordSeparator === -1) {
    return `${scheme}${encodeUrlComponent(userInfo)}@${hostAndPath}`;
  }

  const username = userInfo.slice(0, passwordSeparator);
  const password = userInfo.slice(passwordSeparator + 1);

  return `${scheme}${encodeUrlComponent(username)}:${encodeUrlComponent(password)}@${hostAndPath}`;
}

function encodeUrlComponent(value) {
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
}

function redactOutput(value) {
  return value
    .replace(/postgres(?:ql)?:\/\/\S+/g, 'postgresql://[redacted]')
    .replace(/host name "[^"]+"/g, 'host name "[redacted]"');
}
