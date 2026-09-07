import type { LocaleId } from '@/types/locale';

/**
 * The locale set, sorted byte-wise and frozen.
 *
 * Sorted because the order propagates into hreflang link sets, the prerender enumeration and
 * the locale switcher — all of which must be byte-stable across builds. Adding a fourth locale
 * is one entry here plus one content directory; the router, prerenderer and vercel.json all
 * widen off this tuple.
 */
export const SUPPORTED_LOCALES = ['ar-SA', 'de-DE', 'en-US', 'hi-IN'] as const;

export const DEFAULT_LOCALE: LocaleId = 'en-US';

/** Reading direction. Adding an RTL locale is one entry — see docs/locale-precedence.md. */
export const LOCALE_DIR: Readonly<Record<LocaleId, 'ltr' | 'rtl'>> = {
  'ar-SA': 'rtl',
  'de-DE': 'ltr',
  'en-US': 'ltr',
  'hi-IN': 'ltr',
};

/** What goes into <html lang>. Deliberately the full tag, not the primary subtag. */
export const LOCALE_HTML_LANG: Readonly<Record<LocaleId, string>> = {
  'ar-SA': 'ar-SA',
  'de-DE': 'de-DE',
  'en-US': 'en-US',
  'hi-IN': 'hi-IN',
};

/** Endonyms — a language picker that names languages in English is itself a defect. */
export const LOCALE_LABEL: Readonly<Record<LocaleId, string>> = {
  'ar-SA': 'العربية',
  'de-DE': 'Deutsch',
  'en-US': 'English',
  'hi-IN': 'हिन्दी',
};

export const LOCALE_COOKIE = 'rgt_locale';

/** One year. Long enough that persistence is testable across a detector's whole run. */
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 31_536_000;

export function isSupportedLocale(value: string | null | undefined): value is LocaleId {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
