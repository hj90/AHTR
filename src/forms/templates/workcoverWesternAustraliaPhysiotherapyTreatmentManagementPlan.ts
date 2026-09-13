import type { FormFieldDefinition, FormSectionDefinition, PdfTemplateDefinition } from '../formTypes';

const SOURCE_URL = 'https://www.workcover.wa.gov.au/health-providers/physiotherapy-treatment-management-plan/';

function text(id: string, label: string, fieldName: string, required = false, type: FormFieldDefinition['type'] = 'text'): FormFieldDefinition {
  return { id, label, type, required, pdf: { mode: 'acroform', fieldName, fontSize: 8 } };
}

function textarea(id: string, label: string, fieldName: string, required = false): FormFieldDefinition {
  return { id, label, type: 'textarea', required, pdf: { mode: 'acroform', fieldName, fontSize: 7 } };
}

function compactText(id: string, label: string, fieldName: string, required = false): FormFieldDefinition {
  return { id, label, type: 'text', required, pdf: { mode: 'acroform', fieldName, fontSize: 6 } };
}

function checkbox(id: string, label: string, fieldName: string): FormFieldDefinition {
  return { id, label, type: 'checkbox', pdf: { mode: 'acroform', fieldName, pdfFieldType: 'checkbox' } };
}

function buttonGroup(id: string, label: string, fieldName: string, options: Array<{ label: string; value: string }>, exportValueByValue: Record<string, string>): FormFieldDefinition {
  return { id, label, type: 'radio', options, pdf: { mode: 'acroform', fieldName, pdfFieldType: 'radio', exportValueByValue } };
}

function overlayYesNo(id: string, label: string, y: number): FormFieldDefinition {
  return {
    id,
    label,
    type: 'radio',
    options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }],
    pdf: { mode: 'overlay', page: 1, x: 468, y, renderAs: 'radio', optionMap: { yes: { x: 468, y }, no: { x: 504, y } } },
  };
}

const screeningRows = [1, 2].flatMap((row) => [
  text(`waScreening${row}Tool`, `Screening tool ${row}`, `ToolRow${row}`, row === 1),
  text(`waScreening${row}InitialDate`, `Initial date ${row}`, `Date administeredRow${row}`, row === 1, 'date'),
  text(`waScreening${row}InitialScore`, `Initial score ${row}`, `Initial scoreRow${row}`, row === 1),
  compactText(`waScreening${row}Interpretation`, `Interpretation ${row}`, `Interpretation of resultsRow${row}`, row === 1),
  text(`waScreening${row}ReviewDate`, `Review date ${row}`, `Date re administeredRow${row}`, false, 'date'),
  text(`waScreening${row}ReviewScore`, `Review score ${row}`, `Subsequent scoreRow${row}`),
  compactText(`waScreening${row}Outcome`, `Outcome ${row}`, `OutcomeRow${row}`),
]);

const functionalRows = [
  ['LiftingFloorToWaist', 'Lifting - floor to waist', 'lifting  floor to waist'],
  ['LiftingWaistToShoulder', 'Lifting - waist to shoulder height', 'lifting  waist to shoulder height'],
  ['WorkingAboveShoulder', 'Working above shoulder height', 'working above shoulder height'],
  ['Sitting', 'Sitting', 'sitting'],
  ['Standing', 'Standing', 'standing'],
  ['Walking', 'Walking', 'walking'],
  ['PushingPulling', 'Pushing / pulling', 'pushing  pulling'],
  ['BendingTwistingSquatting', 'Bending / twisting / squatting', 'bending  twisting  squatting'],
  ['Driving', 'Driving', 'driving'],
  ['Other', 'Other functional activity', 'other specify'],
] as const;

const functionalFields = functionalRows.flatMap(([id, label, fieldName]) => [
  checkbox(`wa${id}Selected`, label, fieldName),
  text(`wa${id}Initial`, `${label} - initial or last reported`, `Initial  as last reported${fieldName}`),
  text(`wa${id}Current`, `${label} - current`, `Current${fieldName}`),
  text(`wa${id}Goal`, `${label} - expected goal and timeframe`, `Expected  goal within denoted timeframe${fieldName}`),
]);

export const workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan: PdfTemplateDefinition = {
  id: 'workcover-western-australia-physiotherapy-treatment-management-plan',
  name: 'WorkCover WA Physiotherapy Treatment Management Plan',
  description: 'Official WorkCover WA plan for physiotherapy expected to continue beyond ten consultations.',
  templatePath: '/templates/workcover-western-australia-physiotherapy-treatment-management-plan.pdf',
  previewPath: '/templates/workcover-western-australia-physiotherapy-treatment-management-plan-preview.png',
  defaultDownloadName: 'workcover-wa-physiotherapy-treatment-management-plan.pdf',
  sections: [
    {
      id: 'wa-contact-details',
      title: 'Worker and claim details',
      guidance: { title: 'When to use this plan', items: ['Use this plan when physiotherapy is likely to be required beyond 10 consultations.', 'A physiotherapist may initiate it, or an insurer or self-insurer may request it.'], sourceUrl: SOURCE_URL },
      fields: [
        text('personName', 'Worker name', 'Workers name', true),
        text('dateOfBirth', 'Date of birth', 'Date of birth', true, 'date'),
        text('preInjuryOccupation', 'Occupation', 'Occupation', true),
        text('claimNumber', 'Claim number', 'Claim No', true),
        text('employerName', 'Employer', 'Employer', true),
        text('insurerName', 'Insurer', 'Insurer', true),
        text('referringDoctor', 'Referring medical practitioner', 'Referring medical practitioner'),
        text('waRehabilitationProvider', 'Workplace rehabilitation provider', 'Workplace rehabilitation provider if applicable'),
      ],
    },
    {
      id: 'wa-clinical-assessment',
      title: 'Clinical assessment',
      fields: [
        text('injuryDate', 'Date of injury', 'Date of initial consultation', true, 'date'),
        text('waInitialConsultationDate', 'Date of initial consultation', 'undefined', true, 'date'),
        text('waConsultationsToDate', 'Consultations to date', 'Number of consults to date', true, 'number'),
        text('waConsultationsSinceSurgery', 'Consultations since last surgery', 'Number of consults since last surgery', false, 'number'),
        textarea('compensableInjury', 'Physiotherapist diagnosis', 'Physiotherapists diagnosis', true),
        textarea('waAreasTreated', 'Areas treated', 'Screening toolsquestionnaires', true),
      ],
    },
    { id: 'wa-screening', title: 'Screening tools and questionnaires', fields: screeningRows },
    { id: 'wa-functional-measures', title: 'Functional measures', description: 'Select relevant activities and record measurable baseline, current and expected capacity.', fields: [...functionalFields, textarea('waTreatmentAdherence', 'Worker adherence to treatment', 'Briefly comment on the workers adherence to treatment')] },
    {
      id: 'wa-biopsychosocial',
      title: 'Biopsychosocial factors',
      fields: [
        overlayYesNo('waBiologicalFactors', 'Biological factors identified?', 740),
        overlayYesNo('waPsychosocialFactors', 'Psychosocial factors identified?', 717),
        overlayYesNo('waOtherFactors', 'Other factors identified?', 694),
        textarea('barriersToRecovery', 'Recommendations to address identified factors', 'regarding injury and treatment expectations work site assessment etc'),
      ],
    },
    {
      id: 'wa-work-status',
      title: 'Current work status',
      fields: [
        text('preInjuryWorkHours', 'Pre-injury hours per week', 'Preinjury hours at work', false, 'number'),
        text('workCurrentHours', 'Current hours per week', 'Current hours at work', false, 'number'),
        checkbox('waPreInjuryDuties', 'Pre-injury duties', 'Preinjury duties'),
        checkbox('waModifiedDuties', 'Alternative or modified duties', 'Alternative  modified duties'),
        checkbox('waNotWorking', 'Not working', 'Not working'),
        checkbox('waRequestDutyInformation', 'Request more information about available duties', 'I would like more information about the duties and the associated physical demands of the workers pre'),
      ],
    },
    {
      id: 'wa-return-to-work',
      title: 'Return-to-work progression',
      fields: [
        buttonGroup('waHoursOrDutiesProgressed', 'Have hours or duties progressed in the last six weeks?', 'undefined_3', [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], { yes: 'Yes_4', no: 'No_4' }),
        textarea('waProgressDetails', 'Progress details', 'Provide details'),
        buttonGroup('waLikelyPreInjuryCapacity', 'Likely to return to pre-injury functional capacity?', 'Is the worker likely to return to the functional capacity required to perform their preinjury duties', [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }, { label: 'Unsure', value: 'unsure' }], { yes: 'Yes_5', no: 'No_5', unsure: 'Unsure' }),
        text('waReturnTimeframe', 'Anticipated timeframe', 'Anticipated timeframe'),
        textarea('waReturnNoComment', 'If no - comment', 'undefined_4'),
        textarea('waReturnUnsureComment', 'If unsure - comment', 'undefined_5'),
        textarea('waCapacityComments', 'Comments to assist the medical practitioner certifying capacity', 'eg consider current functional measures modifications to the workplace'),
      ],
    },
    {
      id: 'wa-management-plan',
      title: 'Proposed management plan',
      fields: [
        checkbox('waPhysiotherapyConsultations', 'Physiotherapy consultations', 'Physiotherapy consultations'),
        text('waTreatmentSessions', 'Number of treatment sessions proposed', 'Number of treatment sessions proposed', true, 'number'),
        text('waTreatmentWeeks', 'Conducted over how many weeks', 'To be conducted over', true, 'number'),
        textarea('intervention', 'Treatment proposed', 'undefined_6', true),
        checkbox('waExerciseBasedProgram', 'Exercise-based program', 'Exercisebased program'),
        buttonGroup('waSelfManagementImplemented', 'Have self-management strategies been implemented?', 'undefined_7', [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], { yes: 'Yes_6', no: 'No_6' }),
      ],
    },
    {
      id: 'wa-practitioner-details',
      title: 'Physiotherapist details',
      description: 'The signature can be added after downloading the completed form.',
      fields: [
        text('practitionerName', 'Name', 'Name', true),
        text('practiceName', 'Practice', 'Practice', true),
        text('practiceEmail', 'Email', 'Email', true, 'email'),
        text('phoneNumber', 'Phone', 'Phone', true, 'tel'),
        text('waPractitionerDate', 'Date', 'Date', false, 'date'),
        checkbox('waCopyToInsurer', 'Copy sent to insurer or self-insurer', 'Insurer  Selfinsurer'),
        checkbox('waCopyToMedicalPractitioner', 'Copy sent to medical practitioner', 'Medical Practitioner'),
        checkbox('waCopyToOther', 'Copy sent to another recipient', 'undefined_8'),
        text('waCopyToOtherDetails', 'Other recipient', 'Other specify'),
      ],
    },
  ],
};
