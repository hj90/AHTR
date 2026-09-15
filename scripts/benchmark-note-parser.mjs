import { writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { AHTR_SYSTEM_PROMPT, extractOutputText, responseSchema } from '../api/parse-notes.mjs';
import { loadLocalEnv } from './lib/local-env.mjs';
import { noteParserCases } from './fixtures/note-parser-cases.mjs';

const env = await loadLocalEnv();
const models = (env.BENCHMARK_MODELS || 'gpt-4.1-mini,gpt-5.4-nano').split(',');
const runs = Number(env.BENCHMARK_RUNS || 2);

const cases = noteParserCases;

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function score(testCase, payload) {
  const fields = new Map((payload.fields || []).map((field) => [field.fieldId, field]));
  let checks = 0;
  let correct = 0;
  const failures = [];

  for (const [fieldId, expected] of Object.entries(testCase.expected || {})) {
    checks += 1;
    const actual = fields.get(fieldId)?.value;
    if (normalize(actual) === normalize(expected)) correct += 1;
    else failures.push(`${fieldId}: expected ${expected}, received ${actual ?? 'missing'}`);
  }

  for (const [fieldId, fragments] of Object.entries(testCase.expectedContains || {})) {
    for (const fragment of fragments) {
      checks += 1;
      const actual = fields.get(fieldId)?.value;
      if (normalize(actual).includes(normalize(fragment))) correct += 1;
      else failures.push(`${fieldId}: missing “${fragment}”`);
    }
  }

  for (const fieldId of testCase.expectedAbsent || []) {
    checks += 1;
    if (!fields.has(fieldId)) correct += 1;
    else failures.push(`${fieldId}: populated without source support`);
  }

  for (const fieldId of testCase.expectedReview || []) {
    checks += 1;
    if (!fields.has(fieldId) || fields.get(fieldId)?.needsReview === true) correct += 1;
    else failures.push(`${fieldId}: uncertainty was not flagged`);
  }

  return { checks, correct, failures, populatedFields: fields.size };
}

async function runCase(model, testCase, run) {
  const input = `<selected_form>\n${testCase.templateId}\n</selected_form>\n<form_fields>\n${JSON.stringify(testCase.formFields)}\n</form_fields>\n<clinical_note>\n${testCase.note}\n</clinical_note>\n<claim_record>\n{}\n</claim_record>\n<practice_profile>\n{}\n</practice_profile>`;
  const started = performance.now();
  const response = env.BENCHMARK_ENDPOINT
    ? await fetch(env.BENCHMARK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicalNote: testCase.note, practiceProfile: {}, templateId: testCase.templateId, formFields: testCase.formFields }),
      })
    : await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, store: false, instructions: AHTR_SYSTEM_PROMPT, input, max_output_tokens: 2000, reasoning: model.startsWith('gpt-5.4') ? { effort: 'none' } : undefined, text: { format: { type: 'json_schema', name: 'ahtr_prefill', strict: true, schema: responseSchema } } }),
      });
  const latencyMs = Math.round(performance.now() - started);
  if (!response.ok) throw new Error(`${model}/${testCase.id}: HTTP ${response.status} ${await response.text()}`);
  const body = await response.json();
  const payload = env.BENCHMARK_ENDPOINT ? body : JSON.parse(extractOutputText(body));
  return { model, caseId: testCase.id, run, latencyMs, ...score(testCase, payload) };
}

if (!env.OPENAI_API_KEY && !env.BENCHMARK_ENDPOINT) {
  throw new Error('Set OPENAI_API_KEY in .env.local or BENCHMARK_ENDPOINT before running the benchmark.');
}

const results = [];
for (const model of models) {
  for (let run = 1; run <= runs; run += 1) {
    const batch = await Promise.all(cases.map((testCase) => runCase(model, testCase, run)));
    results.push(...batch);
  }
}

const summary = models.map((model) => {
  const rows = results.filter((row) => row.model === model);
  const latencies = rows.map((row) => row.latencyMs).sort((a, b) => a - b);
  const totalChecks = rows.reduce((sum, row) => sum + row.checks, 0);
  const totalCorrect = rows.reduce((sum, row) => sum + row.correct, 0);
  return {
    model,
    accuracyPercent: Number(((totalCorrect / totalChecks) * 100).toFixed(1)),
    medianLatencyMs: latencies[Math.floor(latencies.length / 2)],
    p95LatencyMs: latencies[Math.ceil(latencies.length * 0.95) - 1],
    failedChecks: totalChecks - totalCorrect,
    totalChecks,
  };
});

const report = { generatedAt: new Date().toISOString(), runsPerCase: runs, caseCount: cases.length, summary, results };
await writeFile('/private/tmp/ahtr-note-benchmark.json', `${JSON.stringify(report, null, 2)}\n`);
console.table(summary);
console.log('Detailed report: /private/tmp/ahtr-note-benchmark.json');
