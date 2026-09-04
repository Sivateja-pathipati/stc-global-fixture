import {
  DEMO_DISPLAY_NAME,
  DEMO_EMAIL,
  DEMO_PASSCODE,
  SESSION_STORAGE_KEY,
} from '@/constants/auth';
import { APP_ROUTES } from '@/constants/routes';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { BUILD_NOW } from '@/constants/time';
import { B_DROP_LOCALE_ON_AUTH } from '@/constants/generated/activeDefects';
import type { FixtureSession, SignInResult } from '@/types/auth';
import type { LocaleId } from '@/types/locale';

/** Plain comparison against a published demo credential. No backend, no token, no real user. */
export function signIn(email: string, passcode: string): SignInResult {
  if (!email.trim() || !passcode.trim()) return { ok: false, reason: 'empty' };
  if (email.trim().toLowerCase() !== DEMO_EMAIL || passcode !== DEMO_PASSCODE) {
    return { ok: false, reason: 'invalid' };
  }
  const session: FixtureSession = {
    displayName: DEMO_DISPLAY_NAME,
    email: DEMO_EMAIL,
    signedInAt: BUILD_NOW,
  };
  return { ok: true, session };
}

export function readSession(): FixtureSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FixtureSession) : null;
  } catch {
    // A blocked or unavailable sessionStorage means "not signed in", not a crash.
    return null;
  }
}

export function persistSession(session: FixtureSession): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable — the session simply does not survive a reload */
  }
}

export function clearSession(): void {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}

/**
 * Where to land after a successful sign-in.
 *
 * The whole "locale resets to en-US after login" defect lives in this one branch. It
 * deliberately does NOT clear the locale cookie and does NOT change <html lang> on the login
 * page — the user simply ends up on the wrong URL, which keeps it a single clean signal.
 */
export function postLoginPath(locale: LocaleId, from: string | null): string {
  if (B_DROP_LOCALE_ON_AUTH) return `/${DEFAULT_LOCALE}${APP_ROUTES.account}`;
  return from ?? `/${locale}${APP_ROUTES.account}`;
}
