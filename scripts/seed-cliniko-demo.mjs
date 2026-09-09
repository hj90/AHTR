import { ClinikoClient, buildPath } from './lib/cliniko-client.mjs';
import { loadLocalEnv } from './lib/local-env.mjs';
import { DEMO_MARKER, SEED_WINDOW, seedScenarios } from './cliniko-demo-scenarios.mjs';

const APPOINTMENT_SPACING_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const OPENAI_TIMEOUT_MS = 60000;

const SCENARIO_FORM_DETAILS = {
  'shoulder-warehouse-rtw': {
    requestNumber: 'AHTR-REQ-1001',
    preExistingConditions: 'No relevant pre-existing shoulder condition reported.',
    hasPositionDescription: 'yes',
    workCurrentCapacity:
      'Currently working 20 hours per week on counter duties and floor stock only; no overhead picking, no pallet wrapping and no lifting above shoulder height.',
    activitiesPreInjuryCapacity:
      'Before injury, independent with driving, household chores, gym training twice weekly and sleeping through the night.',
    activitiesCurrentCapacity:
      'Currently avoids overhead household tasks, wakes when lying on the right side and has stopped upper body gym training.',
    somInterpretation:
      'QuickDASH improvement from 58/100 to 43/100 shows measurable functional improvement, but remaining disability limits overhead work and sleep.',
    recoveryStrategies:
      'Provide written pacing advice, progress work simulation under symptom limits, liaise with employer about overhead task restrictions and reinforce the home exercise plan.',
    directContactAssistance: true,
    caseConferenceAssistance: false,
    caseConferenceWith: '',
    collaborativeCaseReview: false,
    achievedLastPlanGoals: 'partially',
    workGoal: 'Return to 38 hours per week and tolerate overhead picking for 30 minutes within six weeks.',
    activityGoal: 'Sleep through the night without waking from shoulder pain and resume modified upper body gym training.',
    selfManagement: 'Daily rotator cuff and scapular strengthening, heat before stretching, pacing of overhead tasks and sleep positioning strategies.',
    serviceRationale:
      'Additional sessions are required to progress load tolerance from modified duties to overhead work demands and reduce the risk of flare with full duties.',
    collaborativelyDeveloped: 'yes',
    changedDischargeExplanation: 'No change to the anticipated discharge date from the current plan.',
    service: {
      type: 'Physiotherapy',
      sessions: '6',
      frequency: 'weekly over six weeks',
      code: 'PHYS001',
      cost: '$110',
      total: '$660',
    },
  },
  'knee-exercise-physiology': {
    requestNumber: 'AHTR-REQ-1002',
    preExistingConditions: 'No relevant pre-existing knee condition reported.',
    hasPositionDescription: 'yes',
    workCurrentCapacity:
      'Currently working 25 hours per week on shorter shifts, avoiding storeroom stairs while carrying stock and using seated admin breaks.',
    activitiesPreInjuryCapacity:
      'Before injury, independent with stairs, public transport, grocery shopping, recreational walking and home duties.',
    activitiesCurrentCapacity:
      'Currently limits stairs to one flight without load, avoids long shopping trips and has stopped recreational hill walks.',
    somInterpretation:
      'KOOS improvement from 45/100 to 66/100 shows improving symptoms and function, with remaining deficits in stair confidence and loaded work tasks.',
    recoveryStrategies:
      'Use graded stair exposure, supervised strengthening, confidence building around safe loading, pacing education and a written gym-based self-management plan.',
    directContactAssistance: false,
    caseConferenceAssistance: false,
    caseConferenceWith: '',
    collaborativeCaseReview: false,
    achievedLastPlanGoals: 'partially',
    workGoal: 'Return to 35 hours standing work and climb two flights of stairs while carrying light stock within eight weeks.',
    activityGoal: 'Resume 30-minute recreational walks on level ground and complete normal grocery shopping without symptom flare.',
    selfManagement: 'Three gym sessions per week with quadriceps, gluteal and balance exercises plus pacing of stairs and ice after flare-ups.',
    serviceRationale:
      'Fortnightly exercise physiology sessions are needed to progress strength, stair tolerance and confidence with work-specific loaded movement.',
    collaborativelyDeveloped: 'yes',
    changedDischargeExplanation: 'No change to the anticipated discharge date from the current plan.',
    service: {
      type: 'Exercise physiology',
      sessions: '4',
      frequency: 'fortnightly over eight weeks',
      code: 'EP001',
      cost: '$125',
      total: '$500',
    },
  },
  'psychological-adjustment': {
    requestNumber: 'AHTR-REQ-1003',
    preExistingConditions: 'No relevant pre-existing psychological condition reported.',
    hasPositionDescription: 'yes',
    workCurrentCapacity:
      'Currently not driving buses; attending the depot briefly with support and considering four-hour non-driving duties.',
    activitiesPreInjuryCapacity:
      'Before injury, managed rotating shifts, drove independently, attended family events and used public places without avoidance.',
    activitiesCurrentCapacity:
      'Currently avoids crowded buses, sleeps poorly, limits social outings and feels panic symptoms before depot attendance.',
    somInterpretation:
      'K-10 improvement from 34/50 to 28/50 suggests psychological distress is reducing, but symptoms still interfere with graded return to work.',
    recoveryStrategies:
      'Continue trauma-informed CBT, graded exposure to the depot, sleep routine, grounding strategies and coordinated planning with the GP, employer and insurer.',
    directContactAssistance: true,
    caseConferenceAssistance: true,
    caseConferenceWith: 'employer, insurer case manager and GP',
    collaborativeCaseReview: false,
    achievedLastPlanGoals: 'partially',
    workGoal: 'Attend the depot for two graded exposure visits and resume four-hour non-driving duties within six weeks.',
    activityGoal: 'Use public transport for one short planned trip and attend one family activity without leaving early.',
    selfManagement: 'Daily grounding practice, sleep routine, paced exposure hierarchy and written coping plan for depot attendance.',
    serviceRationale:
      'Further psychology sessions are required to consolidate graded exposure, reduce avoidance and coordinate a sustainable return-to-work pathway.',
    collaborativelyDeveloped: 'yes',
    changedDischargeExplanation: 'No change to the anticipated discharge date from the current plan.',
    service: {
      type: 'Psychology',
      sessions: '6',
      frequency: 'weekly over six weeks',
      code: 'PSY001',
      cost: '$210',
      total: '$1260',
    },
  },
  'ankle-incomplete-admin': {
    requestNumber: 'AHTR-REQ-1004',
    preExistingConditions: 'Previous right ankle sprain at school, fully recovered before this workplace injury.',
    hasPositionDescription: 'no',
    workCurrentCapacity:
      'Currently working 24 hours per week on ground-level tasks only; no ladder work, roof cavity work or uneven trench work.',
    activitiesPreInjuryCapacity:
      'Before injury, independent with ladder climbing, kneeling, sport, driving and walking across uneven worksites.',
    activitiesCurrentCapacity:
      'Currently walking tolerance is 20 minutes, avoids sport and uses a brace for uneven ground.',
    somInterpretation:
      'FADI improvement from 54/104 to 68/104 shows early functional gains, with ongoing limits for ladders and uneven ground.',
    recoveryStrategies:
      'Use bracing advice, graded ladder drills, proprioception tasks, calf strengthening and request confirmation of claim details from the insurer.',
    directContactAssistance: true,
    caseConferenceAssistance: false,
    caseConferenceWith: '',
    collaborativeCaseReview: false,
    achievedLastPlanGoals: 'na',
    workGoal: 'Return to safe ladder work and uneven-ground work duties within four weeks.',
    activityGoal: 'Walk 60 minutes on uneven ground and resume light sport drills without instability.',
    selfManagement: 'Daily balance drills, calf strengthening, brace use on uneven ground and swelling management after work.',
    serviceRationale:
      'Additional physiotherapy is required to restore ankle mobility, balance and ladder tolerance before full electrical duties resume.',
    collaborativelyDeveloped: 'yes',
    changedDischargeExplanation: 'No change to the anticipated discharge date from the current plan.',
    service: {
      type: 'Physiotherapy',
      sessions: '4',
      frequency: 'weekly over four weeks',
      code: 'PHYS001',
      cost: '$105',
      total: '$420',
    },
  },
  'lumbar-partial-goals': {
    requestNumber: 'AHTR-REQ-1005',
    preExistingConditions: 'Intermittent mild low back stiffness before injury, not requiring treatment or work restriction.',
    hasPositionDescription: 'yes',
    workCurrentCapacity:
      'Currently working 16 hours per week on administrative duties, medication checking and short ward rounds; no patient transfers.',
    activitiesPreInjuryCapacity:
      'Before injury, independent with patient transfers, prolonged standing, driving, gardening and household lifting.',
    activitiesCurrentCapacity:
      'Currently avoids gardening, limits standing to 30 minutes and uses pacing for household lifting.',
    somInterpretation:
      'PSEQ improvement from 22/60 to 36/60 indicates improving confidence with activity, but transfer duties still trigger symptoms.',
    recoveryStrategies:
      'Use graded lifting exposure, pacing plan, transfer-aid discussion with employer and self-management stretches between sessions.',
    directContactAssistance: true,
    caseConferenceAssistance: true,
    caseConferenceWith: 'employer return-to-work coordinator, insurer case manager and nurse unit manager',
    collaborativeCaseReview: false,
    achievedLastPlanGoals: 'partially',
    workGoal: 'Increase from 16 hours administrative duties to 32 hours including assisted patient transfers within eight weeks.',
    activityGoal: 'Stand for 60 minutes and complete normal household lifting with pacing within eight weeks.',
    selfManagement: 'Twice-daily lumbar mobility, walking program, pacing diary and graded lifting practice with symptom monitoring.',
    serviceRationale:
      'Osteopathy sessions are needed to progress manual therapy, graded lifting exposure and workplace transfer tolerance before discharge.',
    collaborativelyDeveloped: 'yes',
    changedDischargeExplanation: 'Discharge date moved later because transfer duties remained restricted.',
    service: {
      type: 'Osteopathy',
      sessions: '5',
      frequency: 'over six weeks',
      code: 'OST001',
      cost: '$145',
      total: '$725',
    },
  },
};

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
  const openAiApiKey = env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    throw new Error('Set OPENAI_API_KEY in .env.local before generating Cliniko seed transcripts.');
  }

  if (apply && !confirmClearAllPatients) {
    throw new Error('Refusing to clear Cliniko patients without --confirm-clear-all-patients.');
  }

  const cliniko = ClinikoClient.fromEnv(env);
  const modeLabel = apply ? 'apply' : 'dry run';

  console.info(`Generating demo appointment transcripts with ${model} (${modeLabel}).`);
  const generatedScenarios = [];
  for (const scenario of seedScenarios) {
    const appointmentSlots = buildAppointmentSlots(scenario, randomAppointmentCount());
    const transcriptSeries = await generateAppointmentSeries({
      scenario,
      appointmentSlots,
      model,
      apiKey: openAiApiKey,
    });
    generatedScenarios.push({ scenario, appointmentSlots, transcriptSeries });
    console.info(`Generated ${scenario.slug}: ${appointmentSlots.length} appointment transcript(s).`);
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
  let createdAppointmentCount = 0;
  for (const generated of generatedScenarios) {
    const patient = await cliniko.post('/patients', buildPatientPayload(generated.scenario));
    const appointmentIds = [];

    for (const [index, appointmentSlot] of generated.appointmentSlots.entries()) {
      const appointment = await cliniko.post(
        '/individual_appointments',
        buildAppointmentPayload(
          generated.scenario,
          appointmentSlot,
          generated.transcriptSeries.appointments[index],
          patient.id,
          context,
        ),
      );
      appointmentIds.push(appointment.id);
      createdAppointmentCount += 1;
    }

    created.push({ slug: generated.scenario.slug, patientId: patient.id, appointmentIds });
    console.info(
      `Created ${generated.scenario.slug}: patient ${patient.id}, ${appointmentIds.length} appointment(s).`,
    );
  }

  console.info(`Seed complete. Created ${created.length} patients and ${createdAppointmentCount} appointment transcripts.`);
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

function buildAppointmentPayload(scenario, appointmentSlot, transcript, patientId, context) {
  const ahtPreparationContext = appointmentSlot.appointmentNumber === appointmentSlot.appointmentCount
    ? buildAhtPreparationContext(scenario)
    : '';

  return {
    appointment_type_id: String(context.appointmentType.id),
    business_id: String(context.business.id),
    practitioner_id: String(context.practitioner.id),
    patient_id: String(patientId),
    starts_at: appointmentSlot.starts_at,
    ends_at: appointmentSlot.ends_at,
    notes: [
      DEMO_MARKER,
      `Scenario: ${scenario.slug}`,
      `Session: ${appointmentSlot.appointmentNumber} of ${appointmentSlot.appointmentCount}`,
      `Title: ${transcript.title || scenario.title}`,
      '',
      'Synthetic consultation transcript for the AHTR extraction demo.',
      '',
      ahtPreparationContext,
      '',
      transcript.transcript.trim(),
    ].filter((line) => line !== '').join('\n'),
  };
}

function buildAppointmentSlots(scenario, appointmentCount) {
  const latestStart = new Date(scenario.appointment.starts_at);
  const latestEnd = new Date(scenario.appointment.ends_at);
  const durationMs = latestEnd.getTime() - latestStart.getTime();

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error(`Invalid appointment times for ${scenario.slug}.`);
  }

  return Array.from({ length: appointmentCount }, (_, index) => {
    const offset = appointmentCount - index - 1;
    const startsAt = new Date(latestStart.getTime() - offset * APPOINTMENT_SPACING_DAYS * DAY_MS);
    const endsAt = new Date(startsAt.getTime() + durationMs);

    return {
      appointmentNumber: index + 1,
      appointmentCount,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    };
  });
}

function randomAppointmentCount() {
  return 1 + Math.floor(Math.random() * 3);
}

async function generateAppointmentSeries({ scenario, appointmentSlots, model, apiKey }) {
  const appointments = [];

  for (const appointmentSlot of appointmentSlots) {
    const appointment = await generateAppointmentTranscript({
      scenario,
      appointmentSlot,
      previousAppointments: appointments,
      model,
      apiKey,
    });
    appointments.push({ ...appointment, appointmentNumber: appointmentSlot.appointmentNumber });
  }

  return { appointments };
}

async function generateAppointmentTranscript({ scenario, appointmentSlot, previousAppointments, model, apiKey }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      store: false,
      instructions:
        'Create one synthetic allied health consultation transcript for a local software demo. Use only fictional people and the exact scenario facts provided. If previous session summaries are supplied, this session must build on them naturally while staying within the scenario facts. The final session in the series must naturally include every supplied AHTR field target, including date of birth, claim details, capacity, outcome-measure history, goals, assistance requests and service cost details. The note must read like normal clinical documentation or practitioner-patient/admin dialogue rather than a completed form or checklist. Use the supplied appointment date exactly. Do not add facts not present in the scenario brief.',
      input: JSON.stringify({
        demoMarker: DEMO_MARKER,
        appointment: {
          appointmentNumber: appointmentSlot.appointmentNumber,
          appointmentCount: appointmentSlot.appointmentCount,
          startsAt: appointmentSlot.starts_at,
          endsAt: appointmentSlot.ends_at,
          isFinalAppointment: appointmentSlot.appointmentNumber === appointmentSlot.appointmentCount,
        },
        previousSessions: previousAppointments.map((appointment) => ({
          appointmentNumber: appointment.appointmentNumber,
          progressSummary: appointment.progressSummary,
        })),
        scenario: {
          title: scenario.title,
          patient: scenario.patient,
          ahtBrief: scenario.ahtBrief,
        },
        finalAppointmentAhtFieldTargets: appointmentSlot.appointmentNumber === appointmentSlot.appointmentCount
          ? buildAhtFactChecklist(scenario)
          : [],
      }),
      max_output_tokens: 3500,
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
              progressSummary: { type: 'string' },
              transcript: {
                type: 'string',
                description:
                  'A synthetic consultation transcript or detailed note, 450 to 750 words, with natural headings and dialogue where helpful.',
              },
            },
            required: ['title', 'progressSummary', 'transcript'],
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

function buildAhtPreparationContext(scenario) {
  const facts = buildAhtFormFacts(scenario);
  const claimContext = /not available/i.test(facts.claimNumber)
    ? 'the claim number was recorded as not available in the transcript'
    : `claim number ${facts.claimNumber}`;
  const assistanceRequests = [
    facts.directContactAssistance ? 'direct insurer contact is requested' : 'direct insurer contact is not requested',
    facts.caseConferenceAssistance
      ? `a case conference is requested with ${facts.caseConferenceWith}`
      : 'no case conference is requested',
    facts.collaborativeCaseReview
      ? 'collaborative case review is requested'
      : 'collaborative case review is not requested',
  ].join('; ');

  return [
    `AHTR preparation context: ${facts.personName}, date of birth ${facts.dateOfBirth}, confirmed the request details with ${claimContext}. The request number is ${facts.requestNumber}; date of request ${facts.requestDate}; services first commenced ${facts.servicesFirstCommenced}; total consultations to date ${facts.consultationsToDate}; referred by ${facts.referredBy}; request contact phone ${facts.requestPhone}. The allied health discipline is ${facts.discipline}.`,
    `Claim and injury context: pre-injury occupation ${facts.preInjuryOccupation}; pre-injury work hours ${facts.preInjuryWorkHours} per week; injury or crash date ${facts.injuryDate}; compensable injury or illness ${facts.compensableInjury}. Current clinical signs and symptoms are ${facts.clinicalSigns} Relevant pre-existing conditions: ${facts.preExistingConditions}`,
    `Risk and capacity: risk screening applied ${facts.riskScreeningApplied}; tool ${facts.riskToolName || 'none'}; date ${facts.riskDate || 'not applicable'}; score or comment ${facts.riskScore || 'not applicable'}. Position description or work duties available: ${facts.hasPositionDescription}. Pre-injury work capacity: ${facts.workPreInjuryCapacity} Current work capacity: ${facts.workCurrentCapacity} Pre-injury usual activities: ${facts.activitiesPreInjuryCapacity} Current usual activities: ${facts.activitiesCurrentCapacity}`,
    `Standardised outcome measure: ${facts.som1Measure}; initial score ${facts.som1InitialScore} on ${facts.som1InitialDate}; previous score ${facts.som1PreviousScore || 'N/A'} on ${facts.som1PreviousDate || 'N/A'}; current score ${facts.som1CurrentScore} on ${facts.som1CurrentDate}. Interpretation: ${facts.somInterpretation} Barriers to recovery: ${facts.barriersToRecovery}`,
    `Recovery and treatment plan: ${facts.recoveryStrategies} Insurer assistance: ${assistanceRequests}. Goals from the last treatment plan were ${facts.achievedLastPlanGoals}. Work goal: ${facts.workGoal} Activity or participation goal: ${facts.activityGoal} Self-management between sessions: ${facts.selfManagement} Practitioner intervention: ${facts.intervention} Rationale for requested services: ${facts.serviceRationale}`,
    `Service request: ${facts.additionalSessions} additional sessions before discharge; anticipated discharge date ${facts.anticipatedDischargeDate}; discharge date note: ${facts.changedDischargeExplanation || 'not changed'}. The plan was collaboratively developed with the person: ${facts.collaborativelyDeveloped}. Service line 1 is ${facts.service1Type}, ${facts.service1Sessions} sessions, ${facts.service1Frequency}, service code ${facts.service1Code}, cost ${facts.service1Cost} per session, total ${facts.service1Total}; overall total ${facts.overallTotal}.`,
  ].join('\n\n');
}

function buildAhtFactChecklist(scenario) {
  const facts = buildAhtFormFacts(scenario);

  return Object.entries(facts)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([fieldId, value]) => `${fieldId}: ${formatFactValue(value)}`);
}

function buildAhtFormFacts(scenario) {
  const details = formDetailsForScenario(scenario);
  const outcome = parseOutcomeMeasure(scenario.ahtBrief.outcomeMeasure);
  const risk = parseRiskScreening(scenario.ahtBrief.riskScreening);

  return {
    requestNumber: details.requestNumber,
    requestDate: scenario.ahtBrief.requestDate,
    servicesFirstCommenced: scenario.ahtBrief.servicesFirstCommenced,
    consultationsToDate: scenario.ahtBrief.consultationsToDate,
    discipline: scenario.ahtBrief.discipline,
    referredBy: scenario.ahtBrief.referredBy,
    requestPhone: scenario.ahtBrief.requestPhone,
    personName: formatScenarioPatientName(scenario.patient),
    dateOfBirth: scenario.patient.date_of_birth,
    preInjuryOccupation: scenario.patient.occupation,
    preInjuryWorkHours: extractWeeklyHours(scenario.ahtBrief.preInjuryWork),
    claimNumber: scenario.ahtBrief.claimNumber,
    injuryDate: scenario.ahtBrief.injuryDate,
    compensableInjury: scenario.ahtBrief.injury,
    clinicalSigns: scenario.ahtBrief.clinicalSigns,
    riskScreeningApplied: risk.applied,
    riskToolName: risk.toolName,
    riskDate: risk.date,
    riskScore: risk.score,
    preExistingConditions: details.preExistingConditions,
    hasPositionDescription: details.hasPositionDescription,
    workPreInjuryCapacity: scenario.ahtBrief.preInjuryWork,
    workCurrentCapacity: details.workCurrentCapacity,
    activitiesPreInjuryCapacity: details.activitiesPreInjuryCapacity,
    activitiesCurrentCapacity: details.activitiesCurrentCapacity,
    som1Measure: outcome.measure,
    som1InitialDate: outcome.initialDate,
    som1InitialScore: outcome.initialScore,
    som1PreviousDate: outcome.previousDate,
    som1PreviousScore: outcome.previousScore,
    som1CurrentDate: outcome.currentDate,
    som1CurrentScore: outcome.currentScore,
    somInterpretation: details.somInterpretation,
    barriersToRecovery: scenario.ahtBrief.barriers,
    recoveryStrategies: details.recoveryStrategies,
    directContactAssistance: details.directContactAssistance,
    caseConferenceAssistance: details.caseConferenceAssistance,
    caseConferenceWith: details.caseConferenceWith,
    collaborativeCaseReview: details.collaborativeCaseReview,
    achievedLastPlanGoals: details.achievedLastPlanGoals,
    workGoal: details.workGoal,
    activityGoal: details.activityGoal,
    selfManagement: details.selfManagement,
    intervention: scenario.ahtBrief.treatmentPlan,
    serviceRationale: details.serviceRationale,
    additionalSessions: details.service.sessions,
    anticipatedDischargeDate: scenario.ahtBrief.discharge,
    changedDischargeExplanation: scenario.ahtBrief.changedDischargeExplanation || details.changedDischargeExplanation,
    collaborativelyDeveloped: details.collaborativelyDeveloped,
    service1Type: details.service.type,
    service1Sessions: details.service.sessions,
    service1Frequency: details.service.frequency,
    service1Code: details.service.code,
    service1Cost: details.service.cost,
    service1Total: details.service.total,
    overallTotal: details.service.total,
  };
}

function formDetailsForScenario(scenario) {
  const details = SCENARIO_FORM_DETAILS[scenario.slug];
  if (!details) throw new Error(`Missing AHTR form detail seed data for ${scenario.slug}.`);

  return details;
}

function formatScenarioPatientName(patient) {
  return [patient.preferred_first_name || patient.first_name, patient.last_name].filter(Boolean).join(' ');
}

function extractWeeklyHours(text) {
  const match = text.match(/(\d+)\s*hours?\s*(?:per\s+week|weekly|a\s+week|\/week)/i);

  return match?.[1] ?? '';
}

function parseRiskScreening(text) {
  if (/no formal risk screening/i.test(text)) {
    return {
      applied: 'no',
      toolName: '',
      date: '',
      score: 'No formal risk screening tool completed yet.',
    };
  }

  const date = text.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1] ?? '';
  const toolName = text.split(/\s+on\s+\d{4}-\d{2}-\d{2}/i)[0].replace(/:$/, '').trim();
  const score = text
    .replace(toolName, '')
    .replace(date, '')
    .replace(/\bon\b/i, '')
    .replace(/[.:]\s*$/, '')
    .replace(/^\s*[:,-]?\s*/, '')
    .trim();

  return {
    applied: 'yes',
    toolName,
    date,
    score: score || text,
  };
}

function parseOutcomeMeasure(text) {
  const measure = text.split(/\s+initial\s+/i)[0].trim();
  const initial = text.match(/\binitial\s+([^,]+?)\s+on\s+(\d{4}-\d{2}-\d{2})/i);
  const previous = text.match(/\bprevious\s+([^,]+?)\s+on\s+(\d{4}-\d{2}-\d{2})/i);
  const current = text.match(/\bcurrent\s+([^,.]+?)\s+on\s+(\d{4}-\d{2}-\d{2})/i);

  return {
    measure,
    initialScore: cleanScore(initial?.[1]),
    initialDate: initial?.[2] ?? '',
    previousScore: cleanScore(previous?.[1]),
    previousDate: previous?.[2] ?? '',
    currentScore: cleanScore(current?.[1]),
    currentDate: current?.[2] ?? '',
  };
}

function cleanScore(value) {
  return value?.replace(/\s+and\s*$/i, '').trim() ?? '';
}

function formatFactValue(value) {
  if (typeof value === 'boolean') return value ? 'yes' : 'no';

  return String(value);
}

function extractOutputText(response) {
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }

  return null;
}
