import { describe, expect, it } from 'vitest';
import { withCalculatedServiceTotals } from '../../src/utils/calculations';

describe('withCalculatedServiceTotals', () => {
  it('calculates row totals and the overall total from sessions and cost', () => {
    const values = withCalculatedServiceTotals({
      service1Sessions: '6',
      service1Cost: '$120',
      service2Sessions: '2',
      service2Cost: '80.50',
    });

    expect(values.service1Total).toBe('720');
    expect(values.service2Total).toBe('161');
    expect(values.overallTotal).toBe('881');
  });

  it('clears totals when a row cannot be calculated', () => {
    const values = withCalculatedServiceTotals({
      service1Sessions: '',
      service1Cost: '120',
    });

    expect(values.service1Total).toBe('');
    expect(values.overallTotal).toBe('');
  });
});
