import { siraAlliedHealthTreatmentRequest } from './templates/siraAlliedHealthTreatmentRequest';
import { worksafeVictoriaAlliedHealthRecoveryManagementPlan } from './templates/worksafeVictoriaAlliedHealthRecoveryManagementPlan';
import { workcoverQueenslandProviderManagementPlan } from './templates/workcoverQueenslandProviderManagementPlan';
import { workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan } from './templates/workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan';

export const formRegistry = [
  siraAlliedHealthTreatmentRequest,
  worksafeVictoriaAlliedHealthRecoveryManagementPlan,
  workcoverQueenslandProviderManagementPlan,
  workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan,
];

export function getFormForPracticeState(practiceState: 'NSW' | 'VIC' | 'QLD' | 'WA') {
  if (practiceState === 'VIC') return worksafeVictoriaAlliedHealthRecoveryManagementPlan;
  if (practiceState === 'QLD') return workcoverQueenslandProviderManagementPlan;
  if (practiceState === 'WA') return workcoverWesternAustraliaPhysiotherapyTreatmentManagementPlan;
  return siraAlliedHealthTreatmentRequest;
}
