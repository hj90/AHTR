import type { FormFieldDefinition, FormSectionDefinition, PdfTemplateDefinition } from '../formTypes';

const SOURCE_URL = 'https://www.workcoverqld.com.au/service-providers/allied-health-and-return-to-work-providers/provider-management-plans/completing-provider-management-plans';

function text(id: string, label: string, fieldName: string, required = false, type: FormFieldDefinition['type'] = 'text'): FormFieldDefinition {
  return { id, label, type, required, pdf: { mode: 'acroform', fieldName, fontSize: 8 } };
}

function textarea(id: string, label: string, fieldName: string, required = false): FormFieldDefinition {
  return { id, label, type: 'textarea', required, pdf: { mode: 'acroform', fieldName, fontSize: 7 } };
}

function checkbox(id: string, label: string, fieldName: string): FormFieldDefinition {
  return { id, label, type: 'checkbox', pdf: { mode: 'acroform', fieldName, pdfFieldType: 'checkbox' } };
}

function guidance(title: string, items: string[]): FormSectionDefinition['guidance'] {
  return { title, items, sourceUrl: SOURCE_URL };
}

const serviceFields = [
  ['qldServiceChiropractic', 'Chiropractic', 'Chiropractic'],
  ['qldServiceExercisePhysiology', 'Exercise physiology', 'Exercise Physiologist'],
  ['qldServicePsychology', 'Psychology', 'Psychologist'],
  ['qldServiceHandTherapy', 'Hand therapy', 'Hand therapist'],
  ['qldServicePhysiotherapy', 'Physiotherapy', 'Physiotherapy'],
  ['qldServiceOccupationalTherapy', 'Occupational therapy', 'Occupational therapy'],
  ['qldServicePodiatry', 'Podiatry', 'Podiatrist'],
  ['qldServiceOsteopathy', 'Osteopathy', 'Osteopathy'],
] as const;

const consultationRows = [
  ['qldConsultation1', 'TOC Item No', 'No. of services or costs'],
  ['qldConsultation2', 'TOC Item No_2', 'No. of services or costs_2'],
  ['qldConsultation3', 'TOC Item No_3', 'No of services or costs_3'],
  ['qldConsultation4', 'TOC Item No_4', 'No of services or costs_4'],
  ['qldConsultation5', 'TOC Item No_5', 'No of services or costs_5'],
] as const;

const outcomeRows = [
  ['qldOutcome1', 'Outcome measuresRow1', 'Measures at initial assessmentRow1', 'Current measuresRow1', 'Anticipated outcomesRow1'],
  ['qldOutcome2', 'Outcome measuresRow2', 'Measures at initial assessmentRow2', 'Current measuresRow2', 'Anticipated outcomesRow2'],
  ['qldOutcome3', 'Outcome measuresRow3', 'Measures at initial assessmentRow3', 'Current measuresRow3', 'Anticipated outcomesRow3'],
] as const;

const barrierRows = [
  ['qldBarrier1', 'BarriersRow1', 'Recommended strategiesRow1'],
  ['qldBarrier2', 'BarriersRow2', 'Recommended strategiesRow2'],
  ['qldBarrier3', 'BarriersRow3', 'Recommended strategiesRow3'],
] as const;

export const workcoverQueenslandProviderManagementPlan: PdfTemplateDefinition = {
  id: 'workcover-queensland-provider-management-plan',
  name: 'WorkCover Queensland Provider Management Plan',
  description: 'Official WorkCover Queensland Form 32 for requesting ongoing allied health treatment.',
  templatePath: '/templates/workcover-queensland-provider-management-plan.pdf',
  previewPath: '/templates/workcover-queensland-provider-management-plan-preview.png',
  defaultDownloadName: 'workcover-queensland-provider-management-plan.pdf',
  sections: [
    {
      id: 'qld-service',
      title: 'Service',
      guidance: guidance('When to use this form', [
        'Use a Provider Management Plan to request ongoing treatment beyond pre-approved or previously approved consultations.',
        'Complete the plan within your allied health scope of practice.',
      ]),
      fields: [
        ...serviceFields.map(([id, label, fieldName]) => checkbox(id, label, fieldName)),
        checkbox('qldServiceOther', 'Other service', 'Other'),
        text('qldServiceOtherDetails', 'Other service - specify', 'Other please specify'),
      ],
    },
    {
      id: 'qld-worker-details',
      title: 'Worker details',
      fields: [
        text('personName', 'Worker name', 'Name', true),
        text('dateOfBirth', 'Date of birth', 'DOB', true, 'date'),
        text('injuryDate', 'Date of injury', 'DOI', true, 'date'),
        textarea('compensableInjury', 'Diagnosis', 'Diagnosis 1', true),
        text('claimNumber', 'Claim number', 'Claim number', true),
        text('referringDoctor', 'Referring doctor', 'Referring doctor'),
        text('preInjuryOccupation', 'Worker occupation', "Worker's occupation"),
      ],
    },
    {
      id: 'qld-plan-details',
      title: 'Plan details',
      fields: [
        text('qldPlanNumber', 'Provider management plan number', 'Provider management plan no', true, 'number'),
        text('qldInitialConsultationDate', 'Initial consultation date for this injury', 'Date of initial consultation for present injury', true, 'date'),
        text('qldApprovedConsultations', 'Consultations approved to date', 'Total consultations for this injury approved to date', false, 'number'),
        text('qldRequestedConsultations', 'Consultations required in this plan', 'No. consultations required in this plan', true, 'number'),
      ],
    },
    {
      id: 'qld-provider-details',
      title: 'Provider details',
      fields: [
        textarea('qldProviderContactDetails', 'Treating provider name, email and contact phone number', 'Provider contact details', true),
        text('phoneNumber', 'Phone', 'Phone', true, 'tel'),
        text('qldProviderSignature', 'Signature', 'Signature'),
        text('qldProviderSignatureDate', 'Date', 'Date', false, 'date'),
      ],
    },
    {
      id: 'qld-treatment-plan',
      title: 'Treatment plan',
      guidance: guidance('Treatment request', [
        'Include the requested services, item numbers, frequency and treatment timeframe.',
        'Describe measurable functional, work, home or community recovery goals and how the worker will self-manage.',
      ]),
      fields: [
        textarea('intervention', 'Treatment plan, frequency and timeframes', 'Treatment plan', true),
        ...consultationRows.flatMap(([id, itemField, servicesField], index) => [
          text(`${id}ItemNumber`, `TOC item number ${index + 1}`, itemField, index === 0),
          text(`${id}Services`, `Number of services or costs ${index + 1}`, servicesField, index === 0),
        ]),
      ],
    },
    {
      id: 'qld-outcomes',
      title: 'Outcome measures',
      fields: outcomeRows.flatMap(([id, measure, initial, current, anticipated], index) => [
        text(`${id}Measure`, `Outcome measure ${index + 1}`, measure, index === 0),
        text(`${id}Initial`, `Initial measure ${index + 1}`, initial, index === 0),
        text(`${id}Current`, `Current measure ${index + 1}`, current, index === 0),
        text(`${id}Anticipated`, `Anticipated outcome ${index + 1}`, anticipated, index === 0),
      ]),
    },
    {
      id: 'qld-barriers',
      title: 'Barriers and strategies',
      fields: [
        ...barrierRows.flatMap(([id, barrier, strategy], index) => [
          textarea(`${id}Description`, `Barrier ${index + 1}`, barrier, index === 0),
          textarea(`${id}Strategy`, `Recommended strategy ${index + 1}`, strategy, index === 0),
        ]),
        textarea('qldOtherComments', 'Other comments', 'Other comments'),
      ],
    },
  ],
};
