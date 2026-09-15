import { describe, expect, it } from 'vitest';
import { getFormForPracticeState } from '../../src/forms/formRegistry';
import { noteParserCases } from '../../scripts/fixtures/note-parser-cases.mjs';

const stateByTemplate = {
  'sira-allied-health-treatment-request': 'NSW',
  'worksafe-victoria-allied-health-recovery-management-plan': 'VIC',
  'workcover-queensland-provider-management-plan': 'QLD',
  'workcover-western-australia-physiotherapy-treatment-management-plan': 'WA',
  'return-to-work-south-australia-physiotherapy-management-plan': 'SA',
} as const;

describe('state-specific note parser fixtures', () => {
  it('covers every supported state with real fields from its selected form', () => {
    const coveredStates = new Set<string>();

    for (const fixture of noteParserCases) {
      const state = stateByTemplate[fixture.templateId as keyof typeof stateByTemplate];
      expect(state, `${fixture.id} uses an unknown template`).toBeDefined();
      coveredStates.add(state);

      const template = getFormForPracticeState(state);
      const templateFieldIds = new Set(template.sections.flatMap((section) => section.fields.map((field) => field.id)));
      const fixtureFieldIds = new Set(fixture.formFields.map((field: { id: string }) => field.id));
      const assertedFieldIds = [
        ...Object.keys(fixture.expected ?? {}),
        ...Object.keys(fixture.expectedContains ?? {}),
        ...(fixture.expectedAbsent ?? []),
      ];

      expect(fixture.templateId).toBe(template.id);
      expect(fixtureFieldIds.size).toBe(fixture.formFields.length);
      for (const fieldId of fixtureFieldIds) expect(templateFieldIds.has(fieldId), `${fixture.id}: ${fieldId}`).toBe(true);
      for (const fieldId of assertedFieldIds) expect(fixtureFieldIds.has(fieldId), `${fixture.id}: ${fieldId}`).toBe(true);
    }

    expect([...coveredStates].sort()).toEqual(['NSW', 'QLD', 'SA', 'VIC', 'WA']);
  });
});
