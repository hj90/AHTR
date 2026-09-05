import { useEffect, useMemo, useState } from 'react';
import { formRegistry } from './forms/formRegistry';
import type { FieldValue, FormValues } from './forms/formTypes';
import { AppShell } from './components/AppShell';
import { CompleteScreen } from './screens/CompleteScreen';
import { FormScreen } from './screens/FormScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { withCalculatedServiceTotals } from './utils/calculations';
import { createGenericDownloadName, createPdfObjectUrl } from './utils/download';
import { clearGeneratedPdfUrl, getInitialFormValues, resetFormState } from './utils/formState';
import { hasErrors, validateTemplate } from './utils/validation';
import type { ValidationErrors } from './utils/validation';
import {
  clearPractitionerSettings,
  emptyPractitionerSettings,
  getNewFormValues,
  loadPractitionerSettings,
  savePractitionerSettings,
} from './utils/practitionerSettings';
import type { PractitionerSettings } from './utils/practitionerSettings';
import { parseConsultNotes } from './utils/noteParser';

type Screen = 'home' | 'settings' | 'form' | 'review' | 'complete';

export default function App() {
  const template = formRegistry[0];
  const [screen, setScreen] = useState<Screen>('home');
  const [values, setValues] = useState<FormValues>(() => getInitialFormValues(template));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [draftSummary, setDraftSummary] = useState<string | null>(null);
  const [practitionerSettings, setPractitionerSettings] = useState<PractitionerSettings>(
    loadPractitionerSettings,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem('ahtr-sidebar-collapsed') === 'true',
  );

  const downloadName = useMemo(() => createGenericDownloadName(template), [template]);

  useEffect(() => {
    return () => clearGeneratedPdfUrl(generatedPdfUrl);
  }, [generatedPdfUrl]);

  function updateField(fieldId: string, value: FieldValue) {
    setValues((currentValues) => withCalculatedServiceTotals(currentValues, fieldId, value));
    setErrors((currentErrors) => {
      if (!(fieldId in currentErrors)) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldId];
      return nextErrors;
    });
  }

  function startForm() {
    setValues(getNewFormValues(template, practitionerSettings));
    setErrors({});
    setGenerationError(null);
    setDraftSummary(null);
    setScreen('form');
    setActiveSectionId(template.sections[0]?.id ?? null);
    window.scrollTo({ top: 0 });
  }

  async function startFormFromNotes(notes: string) {
    const baseValues = getNewFormValues(template, practitionerSettings);
    const draft = await parseConsultNotes(notes, practitionerSettings, template);
    setValues({ ...baseValues, ...draft.values });
    setErrors({});
    setGenerationError(null);
    const reviewCount = draft.meta.reviewFieldIds.length;
    const flagCount = draft.meta.clinicalFlags.length;
    const openAIMatch = draft.meta.serverTiming?.match(/openai;dur=([\d.]+)/);
    const openAISeconds = openAIMatch ? Number(openAIMatch[1]) / 1000 : null;
    const totalSeconds = draft.meta.clientMs / 1000;
    const timingSummary = openAISeconds === null
      ? ` Draft prepared in ${totalSeconds.toFixed(1)}s.`
      : ` Draft prepared in ${totalSeconds.toFixed(1)}s (${openAISeconds.toFixed(1)}s AI processing).`;
    setDraftSummary(
      `AI drafted ${Object.keys(draft.values).length} field${Object.keys(draft.values).length === 1 ? '' : 's'}. ` +
      `${reviewCount} need${reviewCount === 1 ? 's' : ''} extra review${flagCount ? `; ${flagCount} clinical flag${flagCount === 1 ? '' : 's'} identified` : ''}.` +
      timingSummary,
    );
    setScreen('form');
    setActiveSectionId(template.sections[0]?.id ?? null);
    window.scrollTo({ top: 0 });
  }

  function saveSettings(nextSettings: PractitionerSettings) {
    savePractitionerSettings(nextSettings);
    setPractitionerSettings(nextSettings);
  }

  function clearSettings() {
    clearPractitionerSettings();
    setPractitionerSettings(emptyPractitionerSettings);
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('ahtr-sidebar-collapsed', String(next));
      return next;
    });
  }

  function reviewForm() {
    const nextErrors = validateTemplate(template, values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      const firstInvalidSection = template.sections.find((section) =>
        section.fields.some((field) => nextErrors[field.id]),
      );
      setActiveSectionId(firstInvalidSection?.id ?? null);
      window.scrollTo({ top: 0 });
      return;
    }

    setScreen('review');
    window.scrollTo({ top: 0 });
  }

  function editSection(sectionId: string) {
    setScreen('form');
    changeSection(sectionId);
  }

  function changeSection(sectionId: string) {
    setActiveSectionId(sectionId);
    window.scrollTo({ top: 0 });
  }

  async function generatePdf() {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const { generateCompletedPdf } = await import('./pdf/generatePdf');
      const pdfBytes = await generateCompletedPdf(template, values);
      clearGeneratedPdfUrl(generatedPdfUrl);
      setGeneratedPdfUrl(createPdfObjectUrl(pdfBytes));
      setScreen('complete');
      window.scrollTo({ top: 0 });
    } catch {
      setGenerationError('Please check the form and try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  function clearForm() {
    const clearedState = resetFormState(template, generatedPdfUrl);
    setValues({ ...clearedState.values, ...getNewFormValues(template, practitionerSettings) });
    setGeneratedPdfUrl(clearedState.generatedPdfUrl);
    setErrors({});
    setGenerationError(null);
    setDraftSummary(null);
    setActiveSectionId(template.sections[0]?.id ?? null);
    setScreen('form');
    window.scrollTo({ top: 0 });
  }

  if (screen === 'home') {
    return (
      <AppShell
        activePage="home"
        collapsed={sidebarCollapsed}
        onNavigate={setScreen}
        onToggle={toggleSidebar}
      >
        <HomeScreen onStartBlank={startForm} onStartFromNotes={startFormFromNotes} />
      </AppShell>
    );
  }

  if (screen === 'settings') {
    return (
      <AppShell
        activePage="settings"
        collapsed={sidebarCollapsed}
        onNavigate={setScreen}
        onToggle={toggleSidebar}
      >
        <SettingsScreen
          settings={practitionerSettings}
          onSave={saveSettings}
          onClear={clearSettings}
        />
      </AppShell>
    );
  }

  if (screen === 'review') {
    return (
      <ReviewScreen
        template={template}
        values={values}
        isGenerating={isGenerating}
        generationError={generationError}
        onEdit={editSection}
        onGenerate={generatePdf}
      />
    );
  }

  if (screen === 'complete' && generatedPdfUrl) {
    return (
      <CompleteScreen
        template={template}
        generatedPdfUrl={generatedPdfUrl}
        downloadName={downloadName}
        onStartNew={clearForm}
      />
    );
  }

  return (
    <FormScreen
      template={template}
      values={values}
      errors={errors}
      activeSectionId={activeSectionId}
      onChange={updateField}
      onSectionChange={changeSection}
      onReview={reviewForm}
      onClear={clearForm}
      draftSummary={draftSummary}
    />
  );
}
