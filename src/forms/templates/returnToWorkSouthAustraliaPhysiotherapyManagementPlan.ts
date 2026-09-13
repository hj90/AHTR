import type { FormFieldDefinition, PdfTemplateDefinition } from '../formTypes';

const SOURCE_URL = 'https://www.rtwsa.com/service-providers/allied-health/tools-and-resources';

function overlay(
  id: string,
  label: string,
  page: number,
  x: number,
  y: number,
  maxWidth: number,
  type: FormFieldDefinition['type'] = 'text',
  required = false,
  size = 8,
): FormFieldDefinition {
  return { id, label, type, required, pdf: { mode: 'overlay', page, x, y, maxWidth, size, lineHeight: size + 2 } };
}

function checkbox(id: string, label: string, page: number, x: number, y: number): FormFieldDefinition {
  return { id, label, type: 'checkbox', pdf: { mode: 'overlay', page, x, y, renderAs: 'checkbox' } };
}

function radio(
  id: string,
  label: string,
  page: number,
  options: Array<{ label: string; value: string }>,
  optionMap: Record<string, { x: number; y: number }>,
): FormFieldDefinition {
  const first = Object.values(optionMap)[0];
  return { id, label, type: 'radio', options, pdf: { mode: 'overlay', page, x: first.x, y: first.y, renderAs: 'radio', optionMap } };
}

export const returnToWorkSouthAustraliaPhysiotherapyManagementPlan: PdfTemplateDefinition = {
  id: 'return-to-work-south-australia-physiotherapy-management-plan',
  name: 'ReturnToWorkSA Physiotherapy Management Plan',
  description: 'Official ReturnToWorkSA physiotherapy management plan, amended June 2025.',
  templatePath: '/templates/return-to-work-south-australia-physiotherapy-management-plan.pdf',
  previewPath: '/templates/return-to-work-south-australia-physiotherapy-management-plan-preview.png',
  defaultDownloadName: 'return-to-work-sa-physiotherapy-management-plan.pdf',
  sections: [
    {
      id: 'sa-patient-details',
      title: 'Patient and claim details',
      guidance: {
        title: 'When to use this plan',
        items: [
          'Complete it when requested by the claims manager.',
          'A treating physiotherapist may also initiate it every 10 treatments to support a treatment review.',
        ],
        sourceUrl: SOURCE_URL,
      },
      fields: [
        overlay('personName', 'Patient name', 0, 78, 686, 185, 'text', true),
        overlay('claimNumber', 'Claim number', 0, 360, 686, 125, 'text', true),
        overlay('compensableInjury', 'Working diagnosis or symptoms', 0, 116, 655, 150, 'textarea', true, 7),
        radio('saClaimsAgent', 'Claims agent', 0, [
          { label: 'EML', value: 'eml' },
          { label: 'Gallagher Bassett', value: 'gb' },
          { label: 'EnABLE Unit', value: 'enable' },
        ], { eml: { x: 281, y: 668 }, gb: { x: 367, y: 668 }, enable: { x: 449, y: 668 } }),
        overlay('injuryDate', 'Date of initial treatment', 0, 140, 635, 110, 'date', true),
        overlay('saTreatmentsToDate', 'Number of treatments to date', 0, 385, 635, 75, 'number', true),
      ],
    },
    {
      id: 'sa-evaluation',
      title: 'Evaluation and progress',
      fields: [
        overlay('saScreeningTool1', 'Additional psychosocial screening tool', 0, 55, 543, 160, 'text', false, 7),
        overlay('saScreeningPreviousDate1', 'Previous screening date', 0, 235, 562, 50, 'date', false, 7),
        overlay('saScreeningPreviousScore1', 'Previous score', 0, 300, 562, 40, 'text', false, 7),
        overlay('saScreeningUpdateDate1', 'Updated screening date', 0, 355, 562, 50, 'date', false, 7),
        overlay('saScreeningUpdateScore1', 'Updated score', 0, 420, 562, 40, 'text', false, 7),
        radio('saScreeningProgress1', 'Screening progress?', 0, [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], { yes: { x: 474, y: 565 }, no: { x: 516, y: 565 } }),
        overlay('saOutcomeMeasure1', 'Functional outcome measure 1', 0, 55, 480, 160, 'text', true, 7),
        overlay('saOutcomePreviousDate1', 'Previous outcome date', 0, 235, 480, 50, 'date', false, 7),
        overlay('saOutcomePreviousScore1', 'Previous outcome score', 0, 300, 480, 40, 'text', false, 7),
        overlay('saOutcomeUpdateDate1', 'Updated outcome date', 0, 355, 480, 50, 'date', false, 7),
        overlay('saOutcomeUpdateScore1', 'Updated outcome score', 0, 420, 480, 40, 'text', false, 7),
        radio('saOutcomeProgress1', 'Functional outcome progress?', 0, [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], { yes: { x: 474, y: 479 }, no: { x: 516, y: 479 } }),
      ],
    },
    {
      id: 'sa-plan',
      title: 'Goals and management plan',
      fields: [
        overlay('saGoal1', 'Functional or work goal 1', 0, 55, 396, 175, 'textarea', true, 7),
        overlay('saGoal1Date', 'Goal 1 estimated achievement date', 0, 245, 396, 55, 'date', true, 7),
        overlay('saGoal1Plan', 'Plan to achieve goal 1', 0, 315, 396, 205, 'textarea', true, 7),
        overlay('saGoal2', 'Functional or work goal 2', 0, 55, 379, 175, 'textarea', false, 7),
        overlay('saGoal2Date', 'Goal 2 estimated achievement date', 0, 245, 379, 55, 'date', false, 7),
        overlay('saGoal2Plan', 'Plan to achieve goal 2', 0, 315, 379, 205, 'textarea', false, 7),
        overlay('estimatedDischargeDate', 'Estimated discharge date', 0, 245, 316, 120, 'date', true, 8),
        overlay('barriersToRecovery', 'Issues or risks affecting recovery and return to work', 0, 55, 268, 465, 'textarea', false, 7),
      ],
    },
    {
      id: 'sa-functional-recommendations',
      title: 'Functional ability recommendations',
      description: 'This official second page is optional. Summarise relevant current abilities and restrictions for the treating doctor.',
      fields: [
        overlay('referringDoctor', 'Treating doctor', 1, 80, 716, 125),
        overlay('saSessionsSeen', 'Sessions completed', 1, 176, 697, 35, 'number'),
        overlay('saWeeksSeen', 'Weeks of treatment', 1, 333, 697, 35, 'number'),
        overlay('saExpectedUpgradeDate', 'Expected capacity upgrade date', 1, 360, 656, 95, 'date'),
        overlay('saFunctionalRecommendations', 'Functional abilities, modifications and comments', 1, 350, 554, 165, 'textarea', false, 7),
        checkbox('saWorkAssistsRecovery', 'Recovery will be assisted by incorporating work', 1, 49, 283),
        overlay('saManagementFocus', 'Current management focus', 1, 50, 218, 475, 'textarea', false, 8),
      ],
    },
    {
      id: 'sa-practitioner-details',
      title: 'Treating physiotherapist details',
      description: 'Add the signature after downloading the completed form.',
      fields: [
        overlay('practitionerName', 'Print name', 0, 118, 183, 130, 'text', true),
        overlay('practiceName', 'Practice name', 0, 365, 183, 150, 'text', true),
        overlay('practiceAddress', 'Address', 0, 96, 163, 420, 'text', true),
        overlay('phoneNumber', 'Phone', 0, 96, 143, 135, 'tel', true),
        overlay('practiceEmail', 'Email', 0, 345, 143, 170, 'email', true),
        overlay('saPractitionerDate', 'Date', 0, 305, 122, 110, 'date'),
        overlay('saFunctionalProviderName', 'Provider name on optional page', 1, 138, 119, 165),
        overlay('saFunctionalDate', 'Date on optional page', 1, 258, 145, 110, 'date'),
      ],
    },
  ],
};
