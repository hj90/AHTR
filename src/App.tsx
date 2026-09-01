import { useEffect, useMemo, useState } from 'react';
import { formRegistry } from './forms/formRegistry';
import type { FieldValue, FormValues } from './forms/formTypes';
import { CompleteScreen } from './screens/CompleteScreen';
import { FormScreen } from './screens/FormScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { withCalculatedServiceTotals } from './utils/calculations';
import { createGenericDownloadName, createPdfObjectUrl } from './utils/download';
import { clearGeneratedPdfUrl, getInitialFormValues, resetFormState } from './utils/formState';
import { hasErrors, validateTemplate } from './utils/validation';
import type { ValidationErrors } from './utils/validation';

type Screen = 'home' | 'form' | 'review' | 'complete';

export default function App() {
  const template = formRegistry[0];
  const [screen, setScreen] = useState<Screen>('home');
  const [values, setValues] = useState<FormValues>(() => getInitialFormValues(template));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

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
    setScreen('form');
    setActiveSectionId(template.sections[0]?.id ?? null);
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
    setValues(clearedState.values);
    setGeneratedPdfUrl(clearedState.generatedPdfUrl);
    setErrors({});
    setGenerationError(null);
    setActiveSectionId(template.sections[0]?.id ?? null);
    setScreen('form');
    window.scrollTo({ top: 0 });
  }

  if (screen === 'home') {
    return <HomeScreen template={template} onStart={startForm} />;
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
    />
  );
}
