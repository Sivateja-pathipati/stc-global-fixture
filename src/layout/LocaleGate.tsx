import { useLayoutEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { resolveLocale } from '@/utils/localeResolution';
import { readCookie, writeCookie } from '@/utils/cookie';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE_SECONDS } from '@/constants/locales';
import { B_COOKIE_BEATS_PATH, B_IGNORE_QUERY_LANG } from '@/constants/generated/activeDefects';

/**
 * The element for the top-level `path="*"` route: everything without a valid locale prefix.
 *
 * Matches '/', '/about', '/?lang=de-DE', '/fr-FR/about'. Resolves the locale per
 * docs/locale-precedence.md and redirects to the canonical prefixed path, so invariant I-1
 * holds — every rendered page's URL carries a locale.
 *
 * An unsupported prefix such as '/fr-FR/about' canonicalises to '/en-US/fr-FR/about', which
 * then hits the inner catch-all and renders a LOCALIZED 404 rather than a bare one. That is
 * deliberate: an unknown locale should still get a translated error page.
 */
export default function LocaleGate() {
  const { pathname, search } = useLocation();

  const resolution = resolveLocale(
    {
      pathname,
      search,
      cookieValue: readCookie(LOCALE_COOKIE),
      navigatorLanguages: typeof navigator === 'undefined' ? [] : navigator.languages,
    },
    { cookieBeatsPath: B_COOKIE_BEATS_PATH, ignoreQueryLang: B_IGNORE_QUERY_LANG },
  );

  useLayoutEffect(() => {
    if (resolution.shouldPersistCookie) {
      writeCookie(LOCALE_COOKIE, resolution.locale, LOCALE_COOKIE_MAX_AGE_SECONDS);
    }
  }, [resolution.shouldPersistCookie, resolution.locale]);

  // `replace`, not push: the redirect is plumbing, not a navigation the user made, and a
  // detector's history trace should not be full of them.
  return <Navigate to={resolution.canonicalPath} replace />;
}
