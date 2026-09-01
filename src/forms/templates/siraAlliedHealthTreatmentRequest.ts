import type {
  FormFieldDefinition,
  FormFieldType,
  PdfFieldMapping,
  PdfTemplateDefinition,
} from '../formTypes';

type FieldInput = Omit<FormFieldDefinition, 'pdf'> & {
  pdf: string | PdfFieldMapping;
};

const explanatoryNotesUrl =
  'https://www.sira.nsw.gov.au/resources-library/for-healthcare-providers/allied-health-treatment-request-ahtr-explanatory-notes';

const disciplineOptions = [
  'Accredited Exercise Physiologist',
  'Chiropractor',
  'Counsellor',
  'Osteopath',
  'Physiotherapist',
  'Psychologist',
  'Other (please specify)',
].map((value) => ({ label: value, value }));

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

const standardisedOutcomeMeasureOptions = [
  'Keele STarT Back screening tool',
  'Short form Orebro Musculoskeletal Pain Screening Questionnaire (OMSPQ-10)',
  'Function in Sitting Test (FIST)',
  'Headache Disability Index (HDI)',
  'Neck Disability Index (NDI)',
  'Patient-Rated Wrist Evaluation (PRWE)',
  'Quick Disabilities of the Arm Shoulder and Hand (QuickDASH)',
  'Shoulder Pain and Disability Index (SPADI)',
  'Upper Extremity Functional Index (UEFI)',
  'Foot and Ankle Disability Index (FADI)',
  'Hip Disability and Osteoarthritis Score (HOOS)',
  'Knee Injury and Osteoarthritis Outcome Score (KOOS)',
  'Pain Catastrophising Scale (PCS)',
  'Pain Self Efficacy Questionnaire (PSEQ)',
  'Tampa Scale for Kinesiophobia (TSK)',
  'Depression Anxiety and Stress Scale 42 item (DASS-42)',
  'Impact of Event Scale (IES)',
  'Kessler Psychological Distress Scale (K-10)',
  'Work Productivity and Activity Impairment Questionnaire (WPAI)',
  'Other clinically appropriate measure',
].map((value) => ({ label: value, value }));

function field(input: FieldInput): FormFieldDefinition {
  return {
    ...input,
    autocomplete: input.autocomplete ?? 'off',
    pdf:
      typeof input.pdf === 'string'
        ? { mode: 'acroform', fieldName: input.pdf, pdfFieldType: 'text' }
        : input.pdf,
  };
}

function text(
  id: string,
  label: string,
  pdf: string,
  required = false,
  type: FormFieldType = 'text',
): FormFieldDefinition {
  return field({ id, label, type, required, pdf });
}

function textarea(
  id: string,
  label: string,
  pdf: string,
  required = false,
  helpText?: string,
): FormFieldDefinition {
  return field({ id, label, type: 'textarea', required, helpText, pdf });
}

function radioGroup(
  id: string,
  label: string,
  fieldName: string,
  exportValueByValue: Record<string, string>,
  required = false,
  options = yesNoOptions,
): FormFieldDefinition {
  return field({
    id,
    label,
    type: 'radio',
    required,
    options,
    pdf: {
      mode: 'acroform',
      fieldName,
      pdfFieldType: 'buttonGroup',
      exportValueByValue,
    },
  });
}

function checkbox(id: string, label: string, fieldName: string): FormFieldDefinition {
  return field({
    id,
    label,
    type: 'checkbox',
    pdf: { mode: 'acroform', fieldName, pdfFieldType: 'checkbox' },
  });
}

function signature(id: string, label: string, page: number, x: number, y: number, required = false) {
  return field({
    id,
    label,
    type: 'text',
    required,
    helpText: 'Typed name only. This does not create a cryptographic digital signature.',
    pdf: { mode: 'overlay', page, x, y, size: 10, maxWidth: 250 },
  });
}

function outcomeMeasure(id: string, label: string, pdf: string, required = false): FormFieldDefinition {
  return field({
    id,
    label,
    type: 'select',
    required,
    options: standardisedOutcomeMeasureOptions,
    pdf,
  });
}

function serviceRow(row: number, fields: string[]): FormFieldDefinition[] {
  const [service, sessions, frequency, code, cost, total] = fields;
  const prefix = `service${row}`;
  return [
    text(`${prefix}Type`, `Service ${row} - service type`, service, row === 1),
    text(`${prefix}Sessions`, `Service ${row} - number of sessions`, sessions, row === 1),
    text(`${prefix}Frequency`, `Service ${row} - frequency/timeframe`, frequency, row === 1),
    text(`${prefix}Code`, `Service ${row} - service code`, code),
    text(`${prefix}Cost`, `Service ${row} - cost per session/item`, cost),
    text(`${prefix}Total`, `Service ${row} - total cost`, total),
  ];
}

export const siraAlliedHealthTreatmentRequest: PdfTemplateDefinition = {
  id: 'sira-allied-health-treatment-request',
  name: 'SIRA Allied Health Treatment Request',
  description:
    'Official SIRA allied health treatment request form for NSW workers compensation and CTP claims.',
  templatePath: '/templates/sira-allied-health-treatment-request-form.pdf',
  previewPath: '/templates/sira-allied-health-treatment-request-form-preview.png',
  defaultDownloadName: 'sira-allied-health-treatment-request.pdf',
  sections: [
    {
      id: 'request-details',
      title: 'Request Details',
      description: 'Claim and practitioner referral details at the top of the SIRA form.',
      guidance: {
        title: 'SIRA guidance for this step',
        sourceUrl: explanatoryNotesUrl,
        items: [
          'Complete the AHTR in partnership with the person with a claim and make sure the information is accurate.',
          'Only include personal information beyond the compensable injury or illness after informed consent.',
          'Date services first commenced means the date your practice first delivered services to the person with a claim.',
          'Total consultations means all consultations delivered by your practice for this claim, including those by another allied health practitioner in the same practice.',
        ],
      },
      fields: [
        text('requestNumber', 'Request number', 'Text Field 2', true),
        text('requestDate', 'Date of request', 'Text Field 145', true, 'date'),
        text('servicesFirstCommenced', 'Date services first commenced', 'Text Field 4', true, 'date'),
        text('consultationsToDate', 'Total number of consultations to date', 'Text Field 5', true, 'number'),
        field({
          id: 'discipline',
          label: 'Allied health discipline',
          type: 'select',
          required: true,
          options: disciplineOptions,
          pdf: { mode: 'acroform', fieldName: 'Combo Box 1', pdfFieldType: 'dropdown' },
        }),
        field({
          id: 'disciplineOther',
          label: 'Other discipline',
          type: 'text',
          requiredWhen: [
            {
              fieldId: 'discipline',
              equals: 'Other (please specify)',
              message: 'Enter the other discipline.',
            },
          ],
          pdf: 'Text Field 159',
        }),
        text('referredBy', 'Referred by', 'Text Field 157', true),
        text('requestPhone', 'Phone number', 'Text Field 158', true, 'tel'),
      ],
    },
    {
      id: 'person-details',
      title: 'Section 1: Details Of Person With An Injury',
      guidance: {
        title: 'SIRA guidance for this step',
        sourceUrl: explanatoryNotesUrl,
        items: [
          'Record the person with injury details, their pre-injury occupation, claim number and injury or accident date.',
          'Use the occupation and claim details to anchor the later capacity and goal-setting sections.',
        ],
      },
      fields: [
        text('personName', 'Name', 'Text Field 6', true),
        text('dateOfBirth', 'Date of birth', 'Text Field 146', true, 'date'),
        text('preInjuryOccupation', 'Pre-injury occupation', 'Text Field 7', true),
        text('preInjuryWorkHours', 'Pre-injury work hours/week (average)', 'Text Field 147', true, 'number'),
        text('claimNumber', 'Claim number', 'Text Field 8', true),
        text('injuryDate', 'Date of injury/crash', 'Text Field 148', true, 'date'),
      ],
    },
    {
      id: 'clinical-assessment',
      title: 'Section 2: Clinical Assessment',
      guidance: {
        title: 'SIRA guidance for this step',
        sourceUrl: explanatoryNotesUrl,
        items: [
          'Document your diagnosis of the compensable injury or illness based on your assessment on the day you complete the form.',
          'If diagnosis is outside your scope, use the injury or illness specified in the referral or certificate.',
          'Record current signs and symptoms, including physical or psychological impacts where relevant.',
          'Use a validated risk screening tool relevant to the person, and record the tool name, date and score.',
          'Include relevant pre-existing conditions that may adversely affect recovery.',
        ],
      },
      fields: [
        text('compensableInjury', 'Compensable injury/illness', 'Text Field 17', true),
        textarea('clinicalSigns', 'Current clinical signs and symptoms', 'Text Field 16', true),
        radioGroup('riskScreeningApplied', 'Applied a risk screening tool?', 'Check Box 29', {
          yes: 'Yes',
          no: 'No',
        }),
        text('riskToolName', 'Name of risk screening tool', 'Text Field 18'),
        text('riskDate', 'Date administered', 'Text Field 154', false, 'date'),
        text('riskScore', 'Score/comment', 'Text Field 149'),
        textarea(
          'preExistingConditions',
          'Details of pre-existing conditions relevant to the compensable injury',
          'Text Field 155',
        ),
      ],
    },
    {
      id: 'capacity',
      title: 'Capacity',
      description: 'Describe pre-injury and current capacity for work and usual activities.',
      guidance: {
        title: 'SIRA guidance for this step',
        sourceUrl: explanatoryNotesUrl,
        items: [
          'Describe capacity relative to the compensable injury or illness.',
          'For pre-injury capacity, record what the person could do before the injury or illness.',
          'For current capacity, record what the person can do now, based on the most recent assessment.',
          'Include work tasks, hours, activities of daily living, driving, transport, leisure and other usual activities where relevant.',
        ],
      },
      fields: [
        radioGroup('hasPositionDescription', 'Copy of position description/work duties available?', 'Check Box 5', {
          yes: 'Yes',
          no: 'No',
        }),
        textarea('workPreInjuryCapacity', 'Work - pre-injury capacity', 'Text Field 168', true),
        textarea('workCurrentCapacity', 'Work - current capacity', 'Text Field 170', true),
        textarea('activitiesPreInjuryCapacity', 'Usual activities - pre-injury capacity', 'Text Field 169', true),
        textarea('activitiesCurrentCapacity', 'Usual activities - current capacity', 'Text Field 171', true),
      ],
    },
    {
      id: 'outcome-measures',
      title: 'Standardised Outcome Measures',
      description: 'The SIRA form asks for at least one measure to be reported.',
      guidance: {
        title: 'SIRA guidance for this step',
        sourceUrl: explanatoryNotesUrl,
        items: [
          'Choose at least one outcome measure that is reliable, valid, sensitive to change and relevant to the injury, treatment goals, work demands or usual activities.',
          'Range of motion alone is not considered a standardised outcome measure.',
          'Initial score is the first SOM completed; previous score is from the previous AHTR, or N/A for the first AHTR; current score is the latest SOM completed.',
          'Use the interpretation field to explain what the scores mean for progress toward goals, return to work or usual activity.',
          'SIRA does not mandate one particular SOM; use clinical judgement when selecting the measure.',
        ],
      },
      fields: [
        outcomeMeasure('som1Measure', 'Measure 1', 'Text Field 172', true),
        text('som1InitialDate', 'Measure 1 - initial score date', 'Text Field 173', false, 'date'),
        text('som1InitialScore', 'Measure 1 - initial score', 'Text Field 174'),
        text('som1PreviousDate', 'Measure 1 - previous score date', 'Text Field 175', false, 'date'),
        text('som1PreviousScore', 'Measure 1 - previous score', 'Text Field 176'),
        text('som1CurrentDate', 'Measure 1 - current score date', 'Text Field 177', false, 'date'),
        text('som1CurrentScore', 'Measure 1 - current score', 'Text Field 178'),
        outcomeMeasure('som2Measure', 'Measure 2', 'Text Field 1012'),
        text('som2InitialDate', 'Measure 2 - initial score date', 'Text Field 184', false, 'date'),
        text('som2InitialScore', 'Measure 2 - initial score', 'Text Field 183'),
        text('som2PreviousDate', 'Measure 2 - previous score date', 'Text Field 182', false, 'date'),
        text('som2PreviousScore', 'Measure 2 - previous score', 'Text Field 181'),
        text('som2CurrentDate', 'Measure 2 - current score date', 'Text Field 180', false, 'date'),
        text('som2CurrentScore', 'Measure 2 - current score', 'Text Field 179'),
        outcomeMeasure('som3Measure', 'Measure 3', 'Text Field 1013'),
        text('som3InitialDate', 'Measure 3 - initial score date', 'Text Field 190', false, 'date'),
        text('som3InitialScore', 'Measure 3 - initial score', 'Text Field 189'),
        text('som3PreviousDate', 'Measure 3 - previous score date', 'Text Field 188', false, 'date'),
        text('som3PreviousScore', 'Measure 3 - previous score', 'Text Field 187'),
        text('som3CurrentDate', 'Measure 3 - current score date', 'Text Field 186', false, 'date'),
        text('som3CurrentScore', 'Measure 3 - current score', 'Text Field 185'),
        textarea('somInterpretation', 'Interpretation of score(s)', 'Text Field 191'),
        textarea(
          'barriersToRecovery',
          'Barriers to recovery identified through screening and assessment',
          'Text Field 49',
          true,
        ),
      ],
    },
    {
      id: 'recovery-strategies',
      title: 'Section 3: Barriers To Recovery And Strategies',
      guidance: {
        title: 'SIRA guidance for this step',
        sourceUrl: explanatoryNotesUrl,
        items: [
          'Use assessment and risk screening information to identify physical, psychological, social or other barriers to recovery.',
          'Examples may include treatment non-compliance, medication issues, lack of workplace support, social isolation, concurrent health concerns or distress about claims disputes.',
          'Describe strategies that address the identified barriers, including treatment adjustments or recommended insurer assistance.',
          'You can ask the insurer to contact you, arrange a case conference, or consider independent consultant input.',
        ],
      },
      fields: [
        textarea('recoveryStrategies', 'Strategies to address barriers to recovery', 'Text Field 48', true),
        checkbox('directContactAssistance', 'Direct contact from the insurer requested', 'Check Box 9'),
        checkbox('caseConferenceAssistance', 'Case conference requested', 'Check Box 10'),
        field({
          id: 'caseConferenceWith',
          label: 'Case conference - who with',
          type: 'text',
          requiredWhen: [
            {
              fieldId: 'caseConferenceAssistance',
              equals: true,
              message: 'Enter who should attend the case conference.',
            },
          ],
          pdf: 'Text Field 50',
        }),
        checkbox(
          'collaborativeCaseReview',
          'Collaborative case review with independent consultant requested',
          'Check Box 11',
        ),
      ],
    },
    {
      id: 'treatment-plan',
      title: 'Section 4: Treatment Plan',
      guidance: {
        title: 'SIRA guidance for this step',
        sourceUrl: explanatoryNotesUrl,
        items: [
          'If previous goals were not fully achieved, document reasons in the barriers section.',
          'Develop recovery goals with the person with a claim, with a focus on function, participation and return to work.',
          'Make goals specific, measurable, achievable, relevant and timed.',
          'Document self-management strategies that help the person manage symptoms and function despite symptoms.',
          'Your intervention should link the evidence-based treatment, rationale, number of sessions and anticipated discharge date.',
        ],
      },
      fields: [
        radioGroup(
          'achievedLastPlanGoals',
          'Has the person achieved the goals from the last treatment plan?',
          'Check Box 15',
          { yes: 'Yes', no: 'No', partially: 'Partially', na: 'N/A' },
          false,
          [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
            { label: 'Partially', value: 'partially' },
            { label: 'N/A', value: 'na' },
          ],
        ),
        textarea('workGoal', 'Work goal or activity goal if not working at time of injury', 'Text Field 54', true),
        textarea('activityGoal', 'Activity or participation goal', 'Text Field 116', true),
        textarea('selfManagement', 'Self-management between sessions', 'Text Field 192', true),
        textarea('intervention', 'Your intervention', 'Text Field 193', true),
        textarea('serviceRationale', 'Rationale for requested services', 'Text Field 194', true),
        text('additionalSessions', 'Additional sessions anticipated before discharge', 'Text Field 195', true, 'number'),
        text('anticipatedDischargeDate', 'Anticipated discharge date', 'Text Field 196', true, 'date'),
        textarea('changedDischargeExplanation', 'If the date has changed since the last plan, explain why', 'Text Field 197'),
        radioGroup(
          'collaborativelyDeveloped',
          'Was this plan collaboratively developed with the person with an injury?',
          'Check Box 27',
          { yes: 'Yes', no: 'No' },
        ),
        field({
          id: 'notCollaborativeReason',
          label: 'If no, explain why',
          type: 'textarea',
          requiredWhen: [
            {
              fieldId: 'collaborativelyDeveloped',
              equals: 'no',
              message: 'Explain why the treatment plan was not collaboratively developed.',
            },
          ],
          pdf: 'Text Field 198',
        }),
      ],
    },
    {
      id: 'service-requested',
      title: 'Section 5: Service Requested',
      description: 'Add the requested services, sessions, timing, codes, and costs.',
      guidance: {
        title: 'SIRA guidance for this step',
        sourceUrl: explanatoryNotesUrl,
        items: [
          'Requested services should reflect the treatment documented in Section 4.',
          'Record service type, number of consultations or sessions, frequency or timeframe, and how services will be delivered.',
          'Submit the AHTR with enough time before treatment is proposed to commence so the insurer can review the request.',
        ],
      },
      fields: [
        ...serviceRow(1, ['Text Field 199', 'Text Field 225', 'Text Field 220', 'Text Field 215', 'Text Field 210', 'Text Field 204']),
        ...serviceRow(2, ['Text Field 200', 'Text Field 226', 'Text Field 221', 'Text Field 216', 'Text Field 211', 'Text Field 205']),
        ...serviceRow(3, ['Text Field 201', 'Text Field 227', 'Text Field 222', 'Text Field 217', 'Text Field 212', 'Text Field 206']),
        ...serviceRow(4, ['Text Field 202', 'Text Field 228', 'Text Field 223', 'Text Field 218', 'Text Field 213', 'Text Field 207']),
        ...serviceRow(5, ['Text Field 203', 'Text Field 229', 'Text Field 224', 'Text Field 219', 'Text Field 214', 'Text Field 208']),
        text('overallTotal', 'Overall total', 'Text Field 209'),
      ],
    },
    {
      id: 'practitioner-details',
      title: 'Section 6: Your Details',
      guidance: {
        title: 'SIRA guidance for this step',
        sourceUrl: explanatoryNotesUrl,
        items: [
          'Provide your Ahpra number, or peak association membership number if your profession is not registered under Ahpra.',
          'Provide your SIRA approval number when applicable for workers compensation services.',
          'Include individual and practice email addresses for the practice where services are proposed.',
          'The AHTR should be signed by the allied health practitioner who completed it with the person and will deliver the requested services.',
        ],
      },
      fields: [
        text('practitionerName', 'Treating practitioner name', 'Text Field 91', true),
        text('practiceEmail', 'Practice email', 'Text Field 96', true, 'email'),
        text('ahpraNumber', 'AHPRA registration or membership number', 'Text Field 92', true),
        text('bestContactTime', 'Best time/day to contact', 'Text Field 161', true),
        text('practiceName', 'Practice name', 'Text Field 93', true),
        text('siraApprovalNumber', 'SIRA approval number (workers compensation only)', 'Text Field 100'),
        text('suburb', 'Suburb', 'Text Field 94', true),
        text('state', 'State', 'Text Field 97', true),
        text('postcode', 'Postcode', 'Text Field 98', true),
        text('treatingPractitionerEmail', 'Treating practitioner email', 'Text Field 101', true, 'email'),
        text('phoneNumber', 'Phone number', 'Text Field 95', true, 'tel'),
        text('fax', 'Fax', 'Text Field 99', true, 'tel'),
        signature('practitionerSignature', 'Signature / typed name', 3, 306, 366, true),
      ],
    },
  ],
};
