import type { Session } from '@supabase/supabase-js';
import type { PractitionerSettings } from '../utils/practitionerSettings';
import { getSupabaseClient } from './supabaseClient';

export interface AppAuthSession {
  userId: string;
  email: string;
}

export interface SignUpResult {
  session: AppAuthSession | null;
  requiresEmailConfirmation: boolean;
}

export async function getCurrentAuthSession(): Promise<AppAuthSession | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }

  return toAppAuthSession(data.session);
}

export function subscribeToAuthSessionChange(
  onChange: (session: AppAuthSession | null) => void,
): () => void {
  const supabase = getSupabaseClient();
  if (!supabase) return () => undefined;

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(toAppAuthSession(session));
  });

  return () => data.subscription.unsubscribe();
}

export async function signUpWithEmailPassword({
  email,
  password,
  practiceState,
}: {
  email: string;
  password: string;
  practiceState: PractitionerSettings['practiceState'];
}): Promise<SignUpResult> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        practice_state: practiceState,
      },
    },
  });

  if (error) {
    if (isExistingAccountError(error)) {
      throw new Error(existingAccountMessage);
    }

    throw new Error(error.message);
  }

  if (hasNoNewIdentity(data.user)) {
    throw new Error(existingAccountMessage);
  }

  const session = toAppAuthSession(data.session);

  return {
    session,
    requiresEmailConfirmation: Boolean(data.user && !session),
  };
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<AppAuthSession> {
  const supabase = requireSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  const session = toAppAuthSession(data.session);
  if (!session) {
    throw new Error('Supabase did not return a session.');
  }

  return session;
}

export async function signOutAuthSession(): Promise<void> {
  const supabase = requireSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

function requireSupabaseClient() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
}

function toAppAuthSession(session: Session | null): AppAuthSession | null {
  if (!session?.user.id) return null;

  return {
    userId: session.user.id,
    email: session.user.email ?? '',
  };
}

const existingAccountMessage = 'An account already exists for this email. Log in instead.';

function isExistingAccountError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? '';

  return (
    error.code === 'user_already_exists' ||
    error.code === 'email_exists' ||
    message.includes('already registered') ||
    message.includes('already exists')
  );
}

function hasNoNewIdentity(user: { identities?: unknown[] | null } | null) {
  return Array.isArray(user?.identities) && user.identities.length === 0;
}
