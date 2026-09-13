import { siraAlliedHealthTreatmentRequest } from './templates/siraAlliedHealthTreatmentRequest';
import { worksafeVictoriaAlliedHealthRecoveryManagementPlan } from './templates/worksafeVictoriaAlliedHealthRecoveryManagementPlan';

export const formRegistry = [
  siraAlliedHealthTreatmentRequest,
  worksafeVictoriaAlliedHealthRecoveryManagementPlan,
];

export function getFormForPracticeState(practiceState: 'NSW' | 'VIC') {
  return practiceState === 'VIC'
    ? worksafeVictoriaAlliedHealthRecoveryManagementPlan
    : siraAlliedHealthTreatmentRequest;
}
