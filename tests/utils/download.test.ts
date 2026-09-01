import { describe, expect, it } from 'vitest';
import { demoAlliedHealthReferral } from '../../src/forms/templates/demoAlliedHealthReferral';
import { createGenericDownloadName } from '../../src/utils/download';

describe('createGenericDownloadName', () => {
  it('uses generic form naming without patient identifiers', () => {
    const name = createGenericDownloadName(
      demoAlliedHealthReferral,
      new Date('2026-08-13T00:00:00.000Z'),
    );

    expect(name).toBe('allied-health-completed-form-2026-08-13.pdf');
    expect(name).not.toContain('Test Patient');
  });
});
