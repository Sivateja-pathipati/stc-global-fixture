import i18next, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isSupportedLocale } from '@/constants/locales';
import { MESSAGES } from '@/constants/generated/messages';
import type { LocaleId } from '@/types/locale';

/**
 * The locale of the very first render, taken straight from the URL.
 *
 * This must be right before React mounts, not corrected afterwards in an effect. Setting it in
 * a provider's layout effect looks equivalent and is not: changeLanguage() resolves in a
 * microtask, so `languageChanged` can fire BEFORE react-i18next's useTranslation subscriptions
 * are attached in their passive effects — the event is missed and the tree stays in the initial
 * language even though i18next has already switched. Deriving it here removes the race, and
 * also removes a frame of English content that a screenshot could otherwise catch.
 */
function initialLocale(): LocaleId {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const first = window.location.pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(first) ? first : DEFAULT_LOCALE;
}

/**
 * i18next with resources bundled at build time — no HTTP backend.
 *
 * Two reasons, both about the fixture's job rather than about performance: a network fetch for
 * translations would make first paint timing-dependent (bad for any screenshot-diffing
 * detector), and changeLanguage() stays synchronous, so <html lang> and the rendered language
 * can never be briefly out of step during a locale switch.
 */
export const I18N_NAMESPACES = [
  'common',
  'home',
  'about',
  'services',
  'pricing',
  'events',
  'contact',
  'blog',
  'auth',
  'errors',
] as const;

void i18next.use(initReactI18next).init({
  resources: MESSAGES as unknown as Resource,
  lng: initialLocale(),
  // A key deleted from de-DE resolves through here to the English string — which is exactly
  // what a genuinely missing translation looks like in a real app.
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...SUPPORTED_LOCALES],
  ns: [...I18N_NAMESPACES],
  defaultNS: 'common',
  returnNull: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  // A key missing from EVERY locale is an authoring bug, not a seeded defect. Fail loudly in
  // dev; in a production build let it render the key rather than blanking the page.
  saveMissing: import.meta.env.DEV,
  missingKeyHandler: import.meta.env.DEV
    ? (_lngs: readonly string[], ns: string, key: string) => {
        throw new Error(`i18n: '${ns}:${key}' is missing from every locale.`);
      }
    : undefined,
});

export default i18next;
