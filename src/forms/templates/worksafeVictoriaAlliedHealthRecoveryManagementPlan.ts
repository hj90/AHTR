import type { FormFieldDefinition, FormSectionDefinition, PdfTemplateDefinition } from '../formTypes';

const SOURCE_URL = 'https://www.worksafe.vic.gov.au/resources/allied-health-recovery-management-plan';

function text(
  id: string,
  label: string,
  fieldName: string,
  required = false,
  type: FormFieldDefinition['type'] = 'text',
): FormFieldDefinition {
  return { id, label, type, required, pdf: { mode: 'acroform', fieldName, fontSize: 9 } };
}

function textarea(id: string, label: string, fieldName: string, required = false): FormFieldDefinition {
  return { id, label, type: 'textarea', required, pdf: { mode: 'acroform', fieldName, fontSize: 8 } };
}

function checkbox(id: string, label: string, fieldName: string): FormFieldDefinition {
  return { id, label, type: 'checkbox', pdf: { mode: 'acroform', fieldName, pdfFieldType: 'checkbox' } };
}

function yesNo(id: string, label: string, fieldName: string): FormFieldDefinition {
  return {
    id,
    label,
    type: 'radio',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    pdf: {
      mode: 'acroform',
      fieldName,
      pdfFieldType: 'buttonGroup',
      exportValueByValue: { yes: 'Yes', no: 'No' },
    },
  };
}

function guidance(title: string, items: string[]): FormSectionDefinition['guidance'] {
  return { title, items, sourceUrl: SOURCE_URL };
}

const outcomeRows = [
  ['vicOutcome1', 'Outcome measure 1', '4 Assessment Standardised outcome measuresRow2', 'DateRow1', 'ScoreRow1', 'DateRow1_2', 'ScoreRow1_2', 'DateRow1_3', 'ScoreRow1_3'],
  ['vicOutcome2', 'Outcome measure 2', '4 Assessment Standardised outcome measuresRow3', 'DateRow2', 'ScoreRow2', 'DateRow2_2', 'ScoreRow2_2', 'DateRow2_3', 'ScoreRow2_3'],
  ['vicOutcome3', 'Outcome measure 3', '4 Assessment Standardised outcome measuresRow4', 'DateRow3', 'ScoreRow3', 'DateRow3_2', 'ScoreRow3_2', 'DateRow3_3', 'ScoreRow3_3'],
] as const;

const outcomeFields = outcomeRows.flatMap(([id, label, measure, initialDate, initialScore, reviewDate, reviewScore, latestDate, latestScore]) => [
  text(`${id}Measure`, label, measure),
  text(`${id}InitialDate`, `${label} - initial date`, initialDate, false, 'date'),
  text(`${id}InitialScore`, `${label} - initial score`, initialScore),
  text(`${id}ReviewDate`, `${label} - review date`, reviewDate, false, 'date'),
  text(`${id}ReviewScore`, `${label} - review score`, reviewScore),
  text(`${id}LatestDate`, `${label} - latest review date`, latestDate, false, 'date'),
  text(`${id}LatestScore`, `${label} - latest review score`, latestScore),
]);

const goalFields = [1, 2, 3].flatMap((row) => [
  textarea(`vicGoal${row}Limitation`, `Current activity or functional limitation ${row}`, `Current activity/functional limitations_${row}`, row === 1),
  textarea(`vicGoal${row}Goal`, `Related activity goal ${row}`, `Related activity goals_${row}`, row === 1),
  text(`vicGoal${row}Date`, `Estimated achievement date ${row}`, `Estimated date of achievement${row}`, row === 1, 'date'),
]);

export const worksafeVictoriaAlliedHealthRecoveryManagementPlan: PdfTemplateDefinition = {
  id: 'worksafe-victoria-allied-health-recovery-management-plan',
  name: 'WorkSafe Victoria Allied Health Recovery Management Plan',
  description: 'Official WorkSafe Victoria management plan for allied health treatment of a work injury.',
  templatePath: '/templates/worksafe-victoria-allied-health-recovery-management-plan.pdf',
  previewPath: '/templates/worksafe-victoria-allied-health-recovery-management-plan-preview.png',
  defaultDownloadName: 'worksafe-victoria-allied-health-recovery-management-plan.pdf',
  sections: [
    {
      id: 'vic-plan-details',
      title: 'Plan details',
      guidance: guidance('Before you start', [
        'Submit the initial plan to the WorkSafe agent within the first five consultations.',
        'Submit a subsequent plan only when requested by the employer, agent or self-insurer.',
      ]),
      fields: [
        checkbox('vicInitialPlan', 'Initial plan', 'Initial'),
        checkbox('vicSubsequentPlan', 'Subsequent plan', 'Subsequent'),
        text('vicTreatmentMonths', 'Duration of treatment to date (months)', 'months', false, 'number'),
        checkbox('vicDisciplinePhysiotherapy', 'Physiotherapy', 'Physiotherapy'),
        checkbox('vicDisciplineOsteopathy', 'Osteopathy', 'Osteopathy'),
        checkbox('vicDisciplineChiropractic', 'Chiropractic', 'Chiropractic'),
        checkbox('vicDisciplinePodiatry', 'Podiatry', 'Podiatry'),
        checkbox('vicDisciplineEipfPhysiotherapy', 'EIPF Physiotherapy', 'EIPF Physiotherapy'),
        checkbox('vicDisciplineOccupationalTherapy', 'Occupational therapy', 'Occupational Therapist'),
        checkbox('vicDisciplineExercisePhysiology', 'Exercise physiology', 'Exercise Physiologist'),
      ],
    },
    {
      id: 'vic-worker-details',
      title: 'Worker details',
      fields: [
        text('personName', 'Worker name', "Worker's name", true),
        text('dateOfBirth', 'Date of birth', 'Date2_af_date', true, 'date'),
        text('preInjuryOccupation', 'Occupation', 'Occupation'),
        text('injuryDate', 'Date of injury', 'Date4_af_date', true, 'date'),
        text('claimNumber', 'Claim number', 'Claim number', true),
      ],
    },
    {
      id: 'vic-injury-details',
      title: 'Injury details',
      fields: [textarea('compensableInjury', 'Diagnosis and areas being treated', 'Diagnosis areas being treated', true)],
    },
    {
      id: 'vic-work-status',
      title: 'Work status',
      fields: [
        yesNo('vicProvidesCapacityCertificates', 'Are you providing certificates of capacity?', 'Are you providing certificates of capacity?'),
        yesNo('vicLiaisingWithCertifier', 'If no, are you liaising with the certifier?', 'No  If No, are you liaising with the certifier?'),
        text('preInjuryWorkHours', 'Pre-injury hours at work per week', 'per week', false, 'number'),
        text('workCurrentHours', 'Current hours at work per week', 'per week_2', false, 'number'),
        checkbox('vicPreInjuryDuties', 'Pre-injury duties', 'Pre-injury duties'),
        checkbox('vicModifiedDuties', 'Alternative or modified duties', 'Alternativemodified duties'),
        checkbox('vicNotWorking', 'Not working', 'Not working'),
      ],
    },
    {
      id: 'vic-assessment',
      title: 'Assessment',
      description: 'Record standardised outcome and psychosocial risk measures.',
      fields: [
        ...outcomeFields,
        text('vicRisk1InitialDate', 'Orebro SF - initial date', 'DateRow1_4', false, 'date'),
        text('vicRisk1InitialScore', 'Orebro SF - initial score', 'ScoreRow1_4'),
        text('vicRisk1ReviewDate', 'Orebro SF - review date', 'DateRow1_5', false, 'date'),
        text('vicRisk1ReviewScore', 'Orebro SF - review score', 'ScoreRow1_5'),
        text('vicRisk1LatestDate', 'Orebro SF - latest review date', 'DateRow1_6', false, 'date'),
        text('vicRisk1LatestScore', 'Orebro SF - latest review score', 'ScoreRow1_6'),
        text('vicRisk2Measure', 'Additional risk measure', 'Risk measuresRow3'),
        text('vicRisk2InitialDate', 'Additional risk measure - initial date', 'DateRow2_4', false, 'date'),
        text('vicRisk2InitialScore', 'Additional risk measure - initial score', 'ScoreRow2_4'),
        text('vicRisk2ReviewDate', 'Additional risk measure - review date', 'DateRow2_5', false, 'date'),
        text('vicRisk2ReviewScore', 'Additional risk measure - review score', 'ScoreRow2_5'),
        text('vicRisk2LatestDate', 'Additional risk measure - latest review date', 'DateRow2_6', false, 'date'),
        text('vicRisk2LatestScore', 'Additional risk measure - latest review score', 'ScoreRow2_6'),
      ],
    },
    {
      id: 'vic-barriers-and-goals',
      title: 'Barriers and goals',
      guidance: guidance('Goal setting', [
        'Describe barriers that may influence recovery or return to work.',
        'Use functional goals that include activities of daily living and work or travel goals.',
      ]),
      fields: [
        textarea('barriersToRecovery', 'Barriers affecting recovery or return to work', 'Specify any physical personal andor environmental barriers that may influence the worker'),
        ...goalFields,
      ],
    },
    {
      id: 'vic-treatment-plan',
      title: 'Treatment plan',
      fields: [
        text('vicServiceCount', 'Proposed total number of services', 'over', true, 'number'),
        text('vicTreatmentWeeks', 'Number of weeks', 'number of weeks', true, 'number'),
        text('vicTreatmentFrom', 'Treatment from', 'From', true, 'date'),
        text('vicTreatmentTo', 'Treatment to', 'to', true, 'date'),
        text('anticipatedDischargeDate', 'Anticipated discharge date', 'Date11_af_date', false, 'date'),
        textarea('intervention', 'Treatment details', 'Treatment details', true),
        textarea('selfManagement', 'Self-management strategies', 'Self management  indicate strategies that the worker will use to manage their condition', true),
      ],
    },
    {
      id: 'vic-provider-details',
      title: 'Provider details',
      fields: [
        text('practitionerName', 'Treating provider name', 'Treating provider’s name', true),
        text('practiceAddress', 'Treating provider address', 'Treating provider’s address', true),
        text('practiceEmail', 'Email address', 'Email address', true, 'email'),
        text('phoneNumber', 'Telephone', 'Telephone', true, 'tel'),
        text('vicContactAvailability', 'Time or availability for discussion', 'Time/availability for discussion'),
        text('siraApprovalNumber', 'WorkSafe provider number', 'WorkSafe provider number', true),
        text('vicProviderSignature', 'Treating provider signature', 'Treating provider’s signature'),
        text('vicProviderSignatureDate', 'Provider signature date', 'Date9_af_date', false, 'date'),
      ],
    },
    {
      id: 'vic-consent',
      title: 'Worker consent',
      description: 'The worker, parent or guardian must review the privacy statement in the official form.',
      fields: [
        {
          id: 'vicWorkerSignature',
          label: 'Signature of worker, parent or guardian',
          type: 'text',
          helpText: 'Type a name here or leave blank and sign the downloaded form.',
          pdf: { mode: 'overlay', page: 1, x: 31, y: 111, size: 9, maxWidth: 350 },
        },
        text('vicWorkerConsentDate', 'Consent date', 'Text20', false, 'date'),
        text('vicWorkerConsentName', 'Full name', 'Full name please print', true),
      ],
    },
  ],
};
