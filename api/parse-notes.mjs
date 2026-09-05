const ALLOWED_FIELD_IDS = [
  'requestNumber', 'requestDate', 'servicesFirstCommenced', 'consultationsToDate',
  'discipline', 'disciplineOther', 'referredBy', 'requestPhone', 'personName',
  'dateOfBirth', 'preInjuryOccupation', 'preInjuryWorkHours', 'claimNumber',
  'injuryDate', 'compensableInjury', 'clinicalSigns', 'riskScreeningApplied',
  'riskToolName', 'riskDate', 'riskScore', 'preExistingConditions',
  'hasPositionDescription', 'workPreInjuryCapacity', 'workCurrentCapacity',
  'activitiesPreInjuryCapacity', 'activitiesCurrentCapacity', 'som1Measure',
  'som1InitialDate', 'som1InitialScore', 'som1PreviousDate', 'som1PreviousScore',
  'som1CurrentDate', 'som1CurrentScore', 'som2Measure', 'som2InitialDate',
  'som2InitialScore', 'som2PreviousDate', 'som2PreviousScore', 'som2CurrentDate',
  'som2CurrentScore', 'som3Measure', 'som3InitialDate', 'som3InitialScore',
  'som3PreviousDate', 'som3PreviousScore', 'som3CurrentDate', 'som3CurrentScore',
  'somInterpretation', 'barriersToRecovery', 'recoveryStrategies',
  'directContactAssistance', 'caseConferenceAssistance', 'caseConferenceWith',
  'collaborativeCaseReview', 'achievedLastPlanGoals', 'workGoal', 'activityGoal',
  'selfManagement', 'intervention', 'serviceRationale', 'additionalSessions',
  'anticipatedDischargeDate', 'changedDischargeExplanation',
  'collaborativelyDeveloped', 'notCollaborativeReason',
  ...Array.from({ length: 5 }, (_, index) => index + 1).flatMap((row) => [
    `service${row}Type`, `service${row}Sessions`, `service${row}Frequency`,
    `service${row}Code`, `service${row}Cost`, `service${row}Total`,
  ]),
];

const AHTR_SYSTEM_PROMPT = `You are a clinical documentation assistant mapping an allied health practitioner's consultation notes onto the NSW SIRA Allied Health Treatment Request form.

Absolute rules:
1. Extract and reshape only facts present in the delimited inputs. Never invent, assume, diagnose, upgrade, soften, or embellish clinical facts.
2. A recorded negative is real content. A fact that is not mentioned must not be returned.
3. Use claim_record only for administrative fields and practice_profile only for practitioner fields. Use them verbatim.
4. Dates must be YYYY-MM-DD. Do not calculate relative dates unless an explicit anchor date is present; if calculated, explain it in reviewReason.
5. Do not assume whether this is the first AHTR. Do not impose a consultation cap. Do not complete insurer-only fields or create a signature.
6. Return a field only when there is useful source content. Set needsReview true whenever the value required interpretation, synthesis, calculation, or uncertainty.
7. For radio fields use these exact values: yes, no, partially, or na. Checkbox fields use booleans.
8. Keep goals faithful to the patient's stated aims. You may make wording specific and measurable only from details already supplied.
9. Surface urgent or red-flag features in clinicalFlags without adding a diagnosis or advice.
10. Output only data matching the supplied JSON schema.`;

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    fields: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          fieldId: { type: 'string', enum: ALLOWED_FIELD_IDS },
          value: { anyOf: [{ type: 'string' }, { type: 'boolean' }, { type: 'null' }] },
          needsReview: { type: 'boolean' },
          sourceSnippet: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          reviewReason: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        },
        required: ['fieldId', 'value', 'needsReview', 'sourceSnippet', 'reviewReason'],
      },
    },
    clinicalFlags: { type: 'array', items: { type: 'string' } },
    notes: { type: 'array', items: { type: 'string' } },
  },
  required: ['fields', 'clinicalFlags', 'notes'],
};

function extractOutputText(response) {
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }
  return null;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({ error: 'AI note drafting is not configured yet.' });
  }

  const clinicalNote = typeof request.body?.clinicalNote === 'string' ? request.body.clinicalNote.trim() : '';
  if (!clinicalNote || clinicalNote.length > 60000) {
    return response.status(400).json({ error: 'Enter notes between 1 and 60,000 characters.' });
  }

  const practiceProfile = request.body?.practiceProfile ?? {};
  const input = `<clinical_note>\n${clinicalNote}\n</clinical_note>\n<claim_record>\n{}\n</claim_record>\n<practice_profile>\n${JSON.stringify(practiceProfile)}\n</practice_profile>`;

  try {
    const apiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        store: false,
        instructions: AHTR_SYSTEM_PROMPT,
        input,
        text: { format: { type: 'json_schema', name: 'ahtr_prefill', strict: true, schema: responseSchema } },
      }),
    });

    if (!apiResponse.ok) {
      console.error('OpenAI request failed', apiResponse.status);
      return response.status(502).json({ error: 'The AI drafting service is temporarily unavailable.' });
    }

    const payload = await apiResponse.json();
    const outputText = extractOutputText(payload);
    if (!outputText) return response.status(502).json({ error: 'The AI service returned no draft.' });
    return response.status(200).json(JSON.parse(outputText));
  } catch (error) {
    console.error('Unable to parse AHTR notes', error instanceof Error ? error.message : 'Unknown error');
    return response.status(502).json({ error: 'Unable to draft the form from these notes.' });
  }
}
