import { siraAlliedHealthTreatmentRequest } from './templates/siraAlliedHealthTreatmentRequest';
import { worksafeVictoriaAlliedHealthRecoveryManagementPlan } from './templates/worksafeVictoriaAlliedHealthRecoveryManagementPlan';
import { workcoverQueenslandProviderManagementPlan } from './templates/workcoverQueenslandProviderManagementPlan';
import { workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan } from './templates/workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan';
import { returnToWorkSouthAustraliaPhysiotherapyManagementPlan } from './templates/returnToWorkSouthAustraliaPhysiotherapyManagementPlan';

export const formRegistry = [
  siraAlliedHealthTreatmentRequest,
  worksafeVictoriaAlliedHealthRecoveryManagementPlan,
  workcoverQueenslandProviderManagementPlan,
  workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan,
  returnToWorkSouthAustraliaPhysiotherapyManagementPlan,
];

export function getFormForPracticeState(practiceState: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA') {
  if (practiceState === 'VIC') return worksafeVictoriaAlliedHealthRecoveryManagementPlan;
  if (practiceState === 'QLD') return workcoverQueenslandProviderManagementPlan;
  if (practiceState === 'WA') return workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan;
  if (practiceState === 'SA') return returnToWorkSouthAustraliaPhysiotherapyManagementPlan;
  return siraAlliedHealthTreatmentRequest;
}

export function getFormById(templateId: string) {
  return formRegistry.find((template) => template.id === templateId);
}
