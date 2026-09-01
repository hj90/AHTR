import type { FieldValue, FormValues } from '../forms/formTypes';

const serviceRows = [1, 2, 3, 4, 5];

export function withCalculatedServiceTotals(
  values: FormValues,
  changedFieldId?: string,
  changedValue?: FieldValue,
): FormValues {
  const nextValues =
    changedFieldId === undefined ? { ...values } : { ...values, [changedFieldId]: changedValue ?? '' };

  for (const row of serviceRows) {
    const sessions = parseAmount(nextValues[`service${row}Sessions`]);
    const cost = parseAmount(nextValues[`service${row}Cost`]);
    const totalFieldId = `service${row}Total`;

    nextValues[totalFieldId] =
      sessions !== null && cost !== null ? formatAmount(sessions * cost) : '';
  }

  const overallTotal = serviceRows.reduce((sum, row) => {
    const total = parseAmount(nextValues[`service${row}Total`]);
    return sum + (total ?? 0);
  }, 0);

  nextValues.overallTotal = overallTotal > 0 ? formatAmount(overallTotal) : '';
  return nextValues;
}

function parseAmount(value: FieldValue | undefined): number | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.replace(/[$,]/g, '').trim();
  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function formatAmount(value: number): string {
  return value.toFixed(2).replace(/\.00$/, '');
}
