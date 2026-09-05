import { writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { AHTR_SYSTEM_PROMPT, extractOutputText, responseSchema } from '../api/parse-notes.mjs';

const models = (process.env.BENCHMARK_MODELS || 'gpt-4.1-mini,gpt-5.4-nano').split(',');
const runs = Number(process.env.BENCHMARK_RUNS || 2);

const cases = [
  {
    id: 'structured-shoulder',
    note: 'Initial physiotherapy consultation 2026-09-05. Patient Jordan Example. DOB 1987-03-14. Claim TEST-12345. Injury 2026-08-18. Warehouse storeperson, 38 hours weekly. Right shoulder flexion 120 degrees and pain with resisted abduction. QuickDASH 43/100 today. Request six physiotherapy sessions weekly. Anticipated discharge 2026-10-17. Plan developed collaboratively.',
    expected: { personName: 'Jordan Example', dateOfBirth: '1987-03-14', claimNumber: 'TEST-12345', injuryDate: '2026-08-18', preInjuryWorkHours: '38', som1Measure: 'QuickDASH', som1InitialScore: '43', additionalSessions: '6', anticipatedDischargeDate: '2026-10-17', collaborativelyDeveloped: 'yes' },
    forbidden: ['riskScore', 'caseConferenceWith'],
  },
  {
    id: 'missing-administration',
    note: 'Physiotherapy review. Left ankle pain is now 3/10 when walking. Dorsiflexion remains limited. Continue strengthening and balance exercises. No patient name, claim number, birth date or injury date was supplied.',
    expectedContains: { clinicalSigns: ['Left ankle', 'Dorsiflexion'], intervention: ['strengthening', 'balance'] },
    forbidden: ['personName', 'claimNumber', 'dateOfBirth', 'injuryDate'],
  },
  {
    id: 'negative-red-flags',
    note: 'Patient Sam Fiction reports lumbar pain. They deny saddle anaesthesia, bladder or bowel change, fever, unexplained weight loss and progressive leg weakness. No outcome measure was completed.',
    expected: { personName: 'Sam Fiction' },
    expectedContains: { clinicalSigns: ['lumbar pain'] },
    forbidden: ['som1Measure', 'som1InitialScore', 'riskScore'],
  },
  {
    id: 'work-capacity-goals',
    note: 'Pre-injury role was registered nurse, 32 hours per week. Currently working 16 hours per week on administrative duties with no patient transfers. Goal: return to 32 hours and safely complete patient transfers within eight weeks.',
    expected: { preInjuryOccupation: 'registered nurse', preInjuryWorkHours: '32' },
    expectedContains: { workCurrentCapacity: ['16 hours', 'no patient transfers'], workGoal: ['32 hours', 'patient transfers', 'eight weeks'] },
    forbidden: ['personName', 'claimNumber', 'injuryDate'],
  },
  {
    id: 'outcome-history',
    note: 'LEFS was 28/80 on 2026-07-01, 39/80 on 2026-08-01 and 51/80 on 2026-09-01. This indicates improving lower-limb function.',
    expected: { som1Measure: 'LEFS', som1InitialDate: '2026-07-01', som1InitialScore: '28', som1PreviousDate: '2026-08-01', som1PreviousScore: '39', som1CurrentDate: '2026-09-01', som1CurrentScore: '51' },
    expectedContains: { somInterpretation: ['improving'] },
    forbidden: ['personName', 'claimNumber'],
  },
  {
    id: 'ambiguity-review',
    note: 'The practitioner discussed possibly arranging a case conference with the employer if progress stalls. No conference has been booked. Discharge may be around late October, but this is uncertain.',
    expectedReview: ['anticipatedDischargeDate'],
    forbidden: ['caseConferenceAssistance', 'caseConferenceWith'],
  },
];

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

  for (const fieldId of testCase.forbidden || []) {
    checks += 1;
    if (!fields.has(fieldId)) correct += 1;
    else failures.push(`${fieldId}: populated without support`);
  }

  for (const fieldId of testCase.expectedReview || []) {
    checks += 1;
    if (!fields.has(fieldId) || fields.get(fieldId)?.needsReview === true) correct += 1;
    else failures.push(`${fieldId}: uncertainty was not flagged`);
  }

  return { checks, correct, failures, populatedFields: fields.size };
}

async function runCase(model, testCase, run) {
  const input = `<clinical_note>\n${testCase.note}\n</clinical_note>\n<claim_record>\n{}\n</claim_record>\n<practice_profile>\n{}\n</practice_profile>`;
  const started = performance.now();
  const response = process.env.BENCHMARK_ENDPOINT
    ? await fetch(process.env.BENCHMARK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicalNote: testCase.note, practiceProfile: {} }),
      })
    : await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, store: false, instructions: AHTR_SYSTEM_PROMPT, input, max_output_tokens: 2000, reasoning: model.startsWith('gpt-5.4') ? { effort: 'none' } : undefined, text: { format: { type: 'json_schema', name: 'ahtr_prefill', strict: true, schema: responseSchema } } }),
      });
  const latencyMs = Math.round(performance.now() - started);
  if (!response.ok) throw new Error(`${model}/${testCase.id}: HTTP ${response.status} ${await response.text()}`);
  const body = await response.json();
  const payload = process.env.BENCHMARK_ENDPOINT ? body : JSON.parse(extractOutputText(body));
  return { model, caseId: testCase.id, run, latencyMs, ...score(testCase, payload) };
}

if (!process.env.OPENAI_API_KEY && !process.env.BENCHMARK_ENDPOINT) {
  throw new Error('Set OPENAI_API_KEY or BENCHMARK_ENDPOINT before running the benchmark.');
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
