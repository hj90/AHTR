export interface NoteParserFixture {
  id: string;
  templateId: string;
  formFields: Array<{ id: string; label: string; type: string }>;
  note: string;
  expected?: Record<string, string | boolean>;
  expectedContains?: Record<string, string[]>;
  expectedAbsent?: string[];
}

export const noteParserCases: NoteParserFixture[];
