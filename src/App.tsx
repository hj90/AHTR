import { useEffect, useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { CompleteScreen } from './screens/CompleteScreen';
import { FormScreen } from './screens/FormScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LandingPage } from './screens/LandingPage';
import { LoginScreen } from './screens/LoginScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SignupScreen } from './screens/SignupScreen';
import { getFormById, getFormForPracticeState } from './forms/formRegistry';
import type { FieldValue, FormValues } from './forms/formTypes';
import {
  getCurrentAuthSession,
  signInWithEmailPassword,
  signOutAuthSession,
  signUpWithEmailPassword,
  subscribeToAuthSessionChange,
  type AppAuthSession,
} from './integrations/authSession';
import {
  clearPractitionerSettings,
  loadPractitionerSettings,
  savePractitionerSettings,
} from './integrations/practitionerSettingsStore';
import {
  createFormSubmission,
  deleteFormSubmission,
  listFormSubmissions,
  markFormSubmissionSubmitted,
  updateFormSubmission,
  type FormSubmission,
} from './integrations/formSubmissionStore';
import { withCalculatedServiceTotals } from './utils/calculations';
import { createGenericDownloadName, createPdfObjectUrl } from './utils/download';
import { clearGeneratedPdfUrl, getInitialFormValues, resetFormState } from './utils/formState';
import { parseConsultNotes } from './utils/noteParser';
import {
  emptyPractitionerSettings,
  getNewFormValues,
} from './utils/practitionerSettings';
import type { PractitionerSettings } from './utils/practitionerSettings';
import { hasErrors, validateTemplate } from './utils/validation';
import type { ValidationErrors } from './utils/validation';

type AppRoute = 'landing' | 'signup' | 'login' | 'home' | 'settings' | 'form' | 'review' | 'complete';

interface SignupDraft {
  email: string;
  practiceState: PractitionerSettings['practiceState'] | '';
}

const signupDraftStorageKey = 'ahtr-signup-draft';

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => routeFromLocation());
  const [authSession, setAuthSession] = useState<AppAuthSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [signupDraft, setSignupDraft] = useState<SignupDraft>(() => loadSignupDraft());
  const [practitionerSettings, setPractitionerSettings] = useState<PractitionerSettings>(
    emptyPractitionerSettings,
  );
  const template = useMemo(
    () => getFormForPracticeState(practitionerSettings.practiceState),
    [practitionerSettings.practiceState],
  );
  const [values, setValues] = useState<FormValues>(() => getInitialFormValues(template));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem('ahtr-sidebar-collapsed') === 'true',
  );

  const downloadName = useMemo(() => createGenericDownloadName(template), [template]);

  useEffect(() => {
    return () => clearGeneratedPdfUrl(generatedPdfUrl);
  }, [generatedPdfUrl]);

  useEffect(() => {
    const syncRouteFromHistory = () => setRoute(routeFromLocation());
    window.addEventListener('popstate', syncRouteFromHistory);

    if (window.location.pathname === '/' && window.location.hash === '#app') {
      navigate('home', { replace: true });
    }

    return () => window.removeEventListener('popstate', syncRouteFromHistory);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getCurrentAuthSession()
      .then((session) => {
        if (!cancelled) {
          setAuthSession(session);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthSession(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsAuthLoading(false);
        }
      });

    const unsubscribe = subscribeToAuthSessionChange((session) => {
      setAuthSession(session);
      setIsAuthLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!authSession && isProtectedRoute(route)) {
      navigate('login', { replace: true });
      return;
    }

    if (authSession && route === 'login') {
      navigate('home', { replace: true });
    }
  }, [authSession, isAuthLoading, route]);

  useEffect(() => {
    let cancelled = false;

    if (!authSession) {
      setPractitionerSettings(emptyPractitionerSettings);
      return () => {
        cancelled = true;
      };
    }

    const userId = authSession.userId;

    async function loadSettings() {
      try {
        const storedSettings = await loadPractitionerSettings(userId);
        if (!cancelled) {
          setPractitionerSettings(storedSettings);
        }
      } catch {
        if (!cancelled) {
          setPractitionerSettings(emptyPractitionerSettings);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [authSession?.userId]);

  useEffect(() => {
    if (!authSession) {
      setSubmissions([]);
      return;
    }

    void refreshSubmissions();
  }, [authSession?.userId]);

  useEffect(() => {
    if (route !== 'form' || !currentSubmissionId) return;

    const timeoutId = window.setTimeout(() => {
      void updateFormSubmission(currentSubmissionId, values)
        .then((saved) => {
          replaceSubmission(saved);
          setPersistenceError(null);
        })
        .catch((error: unknown) => {
          setPersistenceError(error instanceof Error ? error.message : 'Unable to autosave this draft.');
        });
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [currentSubmissionId, route, values]);

  if (isAuthLoading && isProtectedRoute(route)) {
    return <LoadingScreen />;
  }

  if (route === 'landing') {
    return (
      <LandingPage
        onLogin={() => navigate('login')}
        onStartTrial={(details) => {
          const nextDraft = {
            email: details.email,
            practiceState: details.practiceState,
          };
          saveSignupDraft(nextDraft);
          setSignupDraft(nextDraft);
          navigate('signup');
        }}
      />
    );
  }

  if (route === 'signup') {
    return (
      <SignupScreen
        initialEmail={signupDraft.email}
        initialPracticeState={signupDraft.practiceState}
        onLogin={() => navigate('login')}
        onSubmit={createAccount}
      />
    );
  }

  if (route === 'login') {
    return (
      <LoginScreen
        onCreateAccount={() => navigate('landing')}
        onSubmit={logIn}
      />
    );
  }

  if (!authSession) {
    return <LoadingScreen />;
  }

  const signedInUserId = authSession.userId;

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

  async function startForm() {
    const initialValues = getNewFormValues(template, practitionerSettings);
    setValues(initialValues);
    setErrors({});
    setGenerationError(null);
    setActiveSectionId(template.sections[0]?.id ?? null);
    navigate('form');
    await createDraft(template, practitionerSettings.practiceState, initialValues);
  }

  async function startFormFromNotes(notes: string) {
    const baseValues = getNewFormValues(template, practitionerSettings);
    const draft = await parseConsultNotes(notes, practitionerSettings, template);
    setValues({ ...baseValues, ...draft.values });
    setErrors({});
    setGenerationError(null);
    setActiveSectionId(template.sections[0]?.id ?? null);
    navigate('form');
    await createDraft(template, practitionerSettings.practiceState, { ...baseValues, ...draft.values });
  }

  async function saveSettings(nextSettings: PractitionerSettings) {
    const storedSettings = await savePractitionerSettings(nextSettings, signedInUserId);
    setPractitionerSettings(storedSettings);
  }

  async function clearSettings() {
    await clearPractitionerSettings(signedInUserId);
    setPractitionerSettings(emptyPractitionerSettings);
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('ahtr-sidebar-collapsed', String(next));
      return next;
    });
  }

  async function signOut() {
    try {
      await signOutAuthSession();
    } finally {
      setAuthSession(null);
      setPractitionerSettings(emptyPractitionerSettings);
      setCurrentSubmissionId(null);
      setSubmissions([]);
      navigate('login', { replace: true });
    }
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

    navigate('review');
  }

  function editSection(sectionId: string) {
    changeSection(sectionId);
    navigate('form');
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
      if (currentSubmissionId) {
        try {
          const saved = await markFormSubmissionSubmitted(currentSubmissionId, values);
          replaceSubmission(saved);
          setPersistenceError(null);
        } catch (error) {
          setPersistenceError(error instanceof Error ? error.message : 'The submitted status could not be saved.');
        }
      }
      navigate('complete');
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
    setActiveSectionId(template.sections[0]?.id ?? null);
    setCurrentSubmissionId(null);
    navigate('form');
  }

  if (route === 'home') {
    return (
      <AppShell
        activePage="home"
        collapsed={sidebarCollapsed}
        userEmail={authSession.email}
        onNavigate={navigate}
        onSignOut={() => void signOut()}
        onToggle={toggleSidebar}
      >
        <HomeScreen
          practiceState={practitionerSettings.practiceState}
          onStartBlank={startForm}
          onStartFromNotes={startFormFromNotes}
          submissions={submissions}
          persistenceError={persistenceError}
          onOpenSubmission={openSubmission}
          onDeleteSubmission={removeSubmission}
        />
      </AppShell>
    );
  }

  if (route === 'settings') {
    return (
      <AppShell
        activePage="settings"
        collapsed={sidebarCollapsed}
        userEmail={authSession.email}
        onNavigate={navigate}
        onSignOut={() => void signOut()}
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

  if (route === 'review') {
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

  if (route === 'complete' && generatedPdfUrl) {
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
      saveError={persistenceError}
      activeSectionId={activeSectionId}
      onChange={updateField}
      onSectionChange={changeSection}
      onBackHome={() => navigate('home')}
      onReview={reviewForm}
      onClear={clearForm}
    />
  );

  async function createAccount(details: {
    email: string;
    password: string;
    practiceState: PractitionerSettings['practiceState'];
  }) {
    const result = await signUpWithEmailPassword(details);

    if (!result.session) {
      if (result.requiresEmailConfirmation) {
        throw new Error('Check your email to confirm your account before logging in.');
      }

      throw new Error('Supabase did not return a session.');
    }

    setAuthSession(result.session);
    const starterSettings = {
      ...emptyPractitionerSettings,
      practiceState: details.practiceState,
      practitionerEmail: details.email,
      practiceEmail: details.email,
    };
    const storedSettings = await savePractitionerSettings(starterSettings, result.session.userId);
    setPractitionerSettings(storedSettings);
    saveSignupDraft({ email: '', practiceState: '' });
    setSignupDraft({ email: '', practiceState: '' });
    navigate('settings', { replace: true });
  }

  async function logIn(email: string, password: string) {
    const session = await signInWithEmailPassword(email, password);
    setAuthSession(session);
    navigate('home', { replace: true });
  }

  async function refreshSubmissions() {
    try {
      setSubmissions(await listFormSubmissions());
      setPersistenceError(null);
    } catch (error) {
      setPersistenceError(error instanceof Error ? error.message : 'Unable to load saved requests.');
    }
  }

  async function createDraft(
    selectedTemplate: typeof template,
    practiceState: PractitionerSettings['practiceState'],
    initialValues: FormValues,
  ) {
    try {
      const saved = await createFormSubmission(selectedTemplate, practiceState, initialValues);
      setCurrentSubmissionId(saved.id);
      setSubmissions((current) => [saved, ...current]);
      setPersistenceError(null);
    } catch (error) {
      setCurrentSubmissionId(null);
      setPersistenceError(error instanceof Error ? error.message : 'Unable to save this draft.');
    }
  }

  function openSubmission(submission: FormSubmission) {
    const savedTemplate = getFormById(submission.templateId);
    if (!savedTemplate) {
      setPersistenceError('This saved request uses a form that is no longer available.');
      return;
    }

    setPractitionerSettings((current) => ({ ...current, practiceState: submission.practiceState }));
    setValues({ ...getInitialFormValues(savedTemplate), ...submission.values });
    setCurrentSubmissionId(submission.id);
    setErrors({});
    setGenerationError(null);
    setActiveSectionId(savedTemplate.sections[0]?.id ?? null);
    navigate('form');
  }

  async function removeSubmission(submissionId: string) {
    await deleteFormSubmission(submissionId);
    setSubmissions((current) => current.filter((submission) => submission.id !== submissionId));
    if (currentSubmissionId === submissionId) setCurrentSubmissionId(null);
  }

  function replaceSubmission(saved: FormSubmission) {
    setSubmissions((current) => current.map((submission) => submission.id === saved.id ? saved : submission));
  }

  function navigate(nextRoute: AppRoute, options: { replace?: boolean } = {}) {
    const nextPath = pathForRoute(nextRoute);
    if (window.location.pathname !== nextPath || window.location.hash) {
      if (options.replace) {
        window.history.replaceState({}, '', nextPath);
      } else {
        window.history.pushState({}, '', nextPath);
      }
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0 });
  }
}

function LoadingScreen() {
  return (
    <main className="auth-page">
      <section className="auth-panel auth-panel--loading">
        <a className="marketing-wordmark auth-wordmark" href="/">AHTR <span>Assist</span></a>
        <p>Loading your session...</p>
      </section>
    </main>
  );
}

function routeFromLocation(): AppRoute {
  if (window.location.pathname === '/' && window.location.hash === '#app') return 'home';

  switch (window.location.pathname) {
    case '/signup':
      return 'signup';
    case '/login':
      return 'login';
    case '/home':
      return 'home';
    case '/settings':
      return 'settings';
    case '/form':
      return 'form';
    case '/review':
      return 'review';
    case '/complete':
      return 'complete';
    default:
      return 'landing';
  }
}

function pathForRoute(route: AppRoute): string {
  switch (route) {
    case 'signup':
      return '/signup';
    case 'login':
      return '/login';
    case 'home':
      return '/home';
    case 'settings':
      return '/settings';
    case 'form':
      return '/form';
    case 'review':
      return '/review';
    case 'complete':
      return '/complete';
    case 'landing':
    default:
      return '/';
  }
}

function isProtectedRoute(route: AppRoute) {
  return route === 'home' || route === 'settings' || route === 'form' || route === 'review' || route === 'complete';
}

function loadSignupDraft(): SignupDraft {
  try {
    const raw = window.sessionStorage.getItem(signupDraftStorageKey);
    if (!raw) return { email: '', practiceState: '' };

    const parsed = JSON.parse(raw) as Partial<SignupDraft>;
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      practiceState: isPracticeState(parsed.practiceState) ? parsed.practiceState : '',
    };
  } catch {
    return { email: '', practiceState: '' };
  }
}

function saveSignupDraft(draft: SignupDraft) {
  window.sessionStorage.setItem(signupDraftStorageKey, JSON.stringify(draft));
}

function isPracticeState(value: unknown): value is PractitionerSettings['practiceState'] {
  return value === 'NSW' || value === 'VIC' || value === 'QLD' || value === 'WA' || value === 'SA';
}
