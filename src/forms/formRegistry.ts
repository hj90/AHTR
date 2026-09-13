import { siraAlliedHealthTreatmentRequest } from './templates/siraAlliedHealthTreatmentRequest';
import { worksafeVictoriaAlliedHealthRecoveryManagementPlan } from './templates/worksafeVictoriaAlliedHealthRecoveryManagementPlan';
import { workcoverQueenslandProviderManagementPlan } from './templates/workcoverQueenslandProviderManagementPlan';

export const formRegistry = [
  siraAlliedHealthTreatmentRequest,
  worksafeVictoriaAlliedHealthRecoveryManagementPlan,
  workcoverQueenslandProviderManagementPlan,
];

export function getFormForPracticeState(practiceState: 'NSW' | 'VIC' | 'QLD') {
  if (practiceState === 'VIC') return worksafeVictoriaAlliedHealthRecoveryManagementPlan;
  if (practiceState === 'QLD') return workcoverQueenslandProviderManagementPlan;
  return siraAlliedHealthTreatmentRequest;
}
