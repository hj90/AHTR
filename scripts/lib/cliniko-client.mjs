const RETRYABLE_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);

export class ClinikoClient {
  constructor({ apiKey, userAgent, baseUrl }) {
    if (!apiKey) throw new Error('Set CLINIKO_API_KEY before running Cliniko scripts.');
    if (!userAgent) {
      throw new Error(
        'Set CLINIKO_USER_AGENT before running Cliniko scripts, for example "AHTR Demo (you@example.com)".',
      );
    }

    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.headers = {
      Accept: 'application/json',
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'User-Agent': userAgent,
    };
  }

  static fromEnv(env) {
    const apiKey = env.CLINIKO_API_KEY;
    const shard = (env.CLINIKO_SHARD || apiKey?.match(/-([a-z]{2}\d+)$/i)?.[1] || 'au1').toLowerCase();

    return new ClinikoClient({
      apiKey,
      userAgent: env.CLINIKO_USER_AGENT,
      baseUrl: env.CLINIKO_BASE_URL || `https://api.${shard}.cliniko.com/v1`,
    });
  }

  async get(path) {
    return this.request(path);
  }

  async post(path, body = {}) {
    return this.request(path, { method: 'POST', body });
  }

  async listAll(path, collectionKey) {
    const items = [];
    let nextPath = path;

    while (nextPath) {
      const page = await this.get(nextPath);
      const pageItems = page[collectionKey];
      if (!Array.isArray(pageItems)) {
        throw new Error(`Cliniko response did not include ${collectionKey}.`);
      }

      items.push(...pageItems);
      nextPath = this.toRelativePath(page.links?.next);
    }

    return items;
  }

  async request(path, options = {}) {
    const method = options.method ?? 'GET';
    const hasBody = Object.prototype.hasOwnProperty.call(options, 'body');
    const requestHeaders = hasBody ? { ...this.headers, 'Content-Type': 'application/json' } : this.headers;
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(this.toUrl(path), {
          method,
          headers: requestHeaders,
          body: hasBody ? JSON.stringify(options.body) : undefined,
          signal: AbortSignal.timeout(options.timeoutMs ?? 20000),
        });
        const body = await parseResponseBody(response);

        if (response.ok) return body;

        lastError = createClinikoError(method, path, response.status, body);
        if (!RETRYABLE_STATUSES.has(response.status) || attempt === 3) throw lastError;

        await pause(retryDelayMs(response, attempt));
      } catch (error) {
        lastError = error;
        if (attempt === 3) throw lastError;
        await pause(500 * attempt);
      }
    }

    throw lastError;
  }

  toUrl(path) {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  toRelativePath(url) {
    if (!url) return null;
    if (url.startsWith('/')) return url;

    const parsedUrl = new URL(url);
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  }
}

export function buildPath(pathname, params = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      for (const item of value) query.append(key, String(item));
    } else {
      query.set(key, String(value));
    }
  }

  const suffix = query.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 500) };
  }
}

function createClinikoError(method, path, status, body) {
  const message = body?.message || body?.error || formatErrors(body?.errors) || 'Unexpected Cliniko response.';
  return new Error(`${method} ${path} failed with HTTP ${status}: ${message}`);
}

function formatErrors(errors) {
  if (!errors || typeof errors !== 'object') return '';

  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
    .join('; ');
}

function retryDelayMs(response, attempt) {
  const resetHeader = response.headers.get('X-RateLimit-Reset');
  const resetSeconds = Number(resetHeader);
  if (Number.isFinite(resetSeconds) && resetSeconds > 0) return resetSeconds * 1000;

  return 1000 * attempt;
}

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
