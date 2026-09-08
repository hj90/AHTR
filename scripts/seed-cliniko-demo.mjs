import { ClinikoClient, buildPath } from './lib/cliniko-client.mjs';
import { loadLocalEnv } from './lib/local-env.mjs';
import { DEMO_MARKER, SEED_WINDOW, seedScenarios } from './cliniko-demo-scenarios.mjs';

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has('--apply');
  const confirmClearAllPatients = args.has('--confirm-clear-all-patients');

  const env = await loadLocalEnv();
  const model = env.CLINIKO_SEED_OPENAI_MODEL || env.OPENAI_MODEL || 'gpt-4.1-mini';
  const openAiApiKey = env.CLINIKO_SEED_OPENAI_API_KEY || env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    throw new Error(
      'Set CLINIKO_SEED_OPENAI_API_KEY or OPENAI_API_KEY in your shell or .env.local before generating Cliniko seed transcripts.',
    );
  }

  if (apply && !confirmClearAllPatients) {
    throw new Error('Refusing to clear Cliniko patients without --confirm-clear-all-patients.');
  }

  const cliniko = ClinikoClient.fromEnv(env);
  const modeLabel = apply ? 'apply' : 'dry run';

  console.info(`Generating ${seedScenarios.length} demo transcripts with ${model} (${modeLabel}).`);
  const generatedScenarios = [];
  for (const scenario of seedScenarios) {
    const transcript = await generateTranscript({ scenario, model, apiKey: openAiApiKey });
    generatedScenarios.push({ scenario, transcript });
    console.info(`Generated ${scenario.slug}: ${transcript.transcript.length} characters.`);
  }

  const context = await getClinikoContext(cliniko, env);
  console.info(
    `Cliniko target: business ${context.business.id}, practitioner ${context.practitioner.id}, appointment type ${context.appointmentType.id}.`,
  );

  if (!apply) {
    const patients = await cliniko.get(buildPath('/patients', { per_page: 1 }));
    console.info(`Dry run complete. Active Cliniko patients found: ${patients.total_entries ?? 'unknown'}.`);
    console.info('Run npm run cliniko:seed-demo:apply to archive active patients and create the generated demo sessions.');
    return;
  }

  await archiveOldDemoAppointments(cliniko);
  await archiveActivePatients(cliniko);

  const created = [];
  for (const generated of generatedScenarios) {
    const patient = await cliniko.post('/patients', buildPatientPayload(generated.scenario));
    const appointment = await cliniko.post(
      '/individual_appointments',
      buildAppointmentPayload(generated.scenario, generated.transcript, patient.id, context),
    );
    created.push({ slug: generated.scenario.slug, patientId: patient.id, appointmentId: appointment.id });
    console.info(`Created ${generated.scenario.slug}: patient ${patient.id}, appointment ${appointment.id}.`);
  }

  console.info(`Seed complete. Created ${created.length} patients and ${created.length} appointment transcripts.`);
}

async function getClinikoContext(client, scriptEnv) {
  const [businesses, practitioners, appointmentTypes] = await Promise.all([
    client.listAll(buildPath('/businesses', { per_page: 100 }), 'businesses'),
    client.listAll(buildPath('/practitioners', { per_page: 100 }), 'practitioners'),
    client.listAll(buildPath('/appointment_types', { per_page: 100 }), 'appointment_types'),
  ]);

  return {
    business: chooseResource('business', businesses, scriptEnv.CLINIKO_BUSINESS_ID),
    practitioner: chooseResource('practitioner', practitioners, scriptEnv.CLINIKO_PRACTITIONER_ID),
    appointmentType: chooseResource('appointment type', appointmentTypes, scriptEnv.CLINIKO_APPOINTMENT_TYPE_ID),
  };
}

function chooseResource(label, resources, configuredId) {
  if (!resources.length) throw new Error(`No Cliniko ${label}s are available.`);

  if (!configuredId) return resources[0];

  const match = resources.find((resource) => String(resource.id) === String(configuredId));
  if (!match) throw new Error(`CLINIKO_${label.toUpperCase().replaceAll(' ', '_')}_ID=${configuredId} was not found.`);

  return match;
}

async function archiveActivePatients(client) {
  const patients = await client.listAll(
    buildPath('/patients', { per_page: 100, sort: 'created_at:desc', 'q[]': 'archived_at:!?' }),
    'patients',
  );

  console.info(`Archiving ${patients.length} active Cliniko patients.`);
  for (const patient of patients) {
    await client.post(`/patients/${patient.id}/archive`);
  }
}

async function archiveOldDemoAppointments(client) {
  const appointments = await client.listAll(
    buildPath('/individual_appointments', {
      per_page: 100,
      sort: 'starts_at:asc',
      'q[]': [
        `starts_at:>=${SEED_WINDOW.startsAtOrAfter}`,
        `starts_at:<=${SEED_WINDOW.startsAtOrBefore}`,
      ],
    }),
    'individual_appointments',
  );
  const demoAppointments = appointments.filter((appointment) => appointment.notes?.includes(DEMO_MARKER));

  console.info(`Archiving ${demoAppointments.length} previous demo appointments in the seed window.`);
  for (const appointment of demoAppointments) {
    await client.post(`/individual_appointments/${appointment.id}/archive`);
  }
}

function buildPatientPayload(scenario) {
  const { patient } = scenario;

  return {
    first_name: patient.first_name,
    preferred_first_name: patient.preferred_first_name,
    last_name: patient.last_name,
    date_of_birth: patient.date_of_birth,
    email: patient.email,
    occupation: patient.occupation,
    address_1: patient.address_1,
    city: patient.city,
    state: patient.state,
    post_code: patient.post_code,
    country_code: patient.country_code,
    old_reference_id: `${DEMO_MARKER}:${scenario.slug}`,
    notes: `${DEMO_MARKER}\nSynthetic patient created for the AHTR extraction demo.\nScenario: ${scenario.title}`,
    patient_phone_numbers: [{ phone_type: 'Mobile', number: patient.phone }],
    receives_cancellation_emails: false,
    receives_confirmation_emails: false,
    accepted_email_marketing: false,
    accepted_privacy_policy: true,
  };
}

function buildAppointmentPayload(scenario, transcript, patientId, context) {
  return {
    appointment_type_id: String(context.appointmentType.id),
    business_id: String(context.business.id),
    practitioner_id: String(context.practitioner.id),
    patient_id: String(patientId),
    starts_at: scenario.appointment.starts_at,
    ends_at: scenario.appointment.ends_at,
    notes: [
      DEMO_MARKER,
      `Scenario: ${scenario.slug}`,
      `Title: ${transcript.title || scenario.title}`,
      '',
      'Synthetic consultation transcript for the AHTR extraction demo.',
      '',
      transcript.transcript.trim(),
    ].join('\n'),
  };
}

async function generateTranscript({ scenario, model, apiKey }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model,
      store: false,
      instructions:
        'Create synthetic allied health consultation transcripts for a local software demo. Use only fictional people and the exact scenario facts provided. The transcript must contain enough detail for a conservative extraction system to populate the NSW SIRA Allied Health Treatment Request form, but it must read like normal clinical documentation rather than a completed form. Do not add facts not present in the scenario brief.',
      input: JSON.stringify({
        demoMarker: DEMO_MARKER,
        scenario: {
          title: scenario.title,
          patient: scenario.patient,
          ahtBrief: scenario.ahtBrief,
        },
      }),
      max_output_tokens: 2600,
      text: {
        format: {
          type: 'json_schema',
          name: 'cliniko_seed_transcript',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              transcript: {
                type: 'string',
                description:
                  'A synthetic consultation transcript or detailed note, 650 to 950 words, with natural headings and dialogue where helpful.',
              },
            },
            required: ['title', 'transcript'],
          },
        },
      },
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `OpenAI transcript generation failed before any Cliniko records were changed. HTTP ${response.status}: ${body?.error?.message || response.statusText}`,
    );
  }

  const outputText = extractOutputText(body);
  if (!outputText) throw new Error('OpenAI transcript generation returned no output text.');

  return JSON.parse(outputText);
}

function extractOutputText(response) {
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }

  return null;
}
