import { useLayoutEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import i18n from '@/services/i18n.service';
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  LOCALE_DIR,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from '@/constants/locales';
import { writeCookie } from '@/utils/cookie';
import { LocaleContext, type LocaleContextValue } from '@/contexts/LocaleContext';
import type { LocaleId, LocaleSource } from '@/types/locale';

interface LocaleProviderProps {
  /** The locale the CONTENT is rendered in. */
  readonly locale: LocaleId;
  /** The locale in the URL. Differs from `locale` only when a defect is active. */
  readonly pathLocale: LocaleId;
  readonly source: LocaleSource;
  readonly children: React.ReactNode;
}

export default function LocaleProvider({
  locale,
  pathLocale,
  source,
  children,
}: LocaleProviderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // useLayoutEffect, not useEffect: the language must be switched before the first paint a
  // headless browser could capture, or a screenshot can catch the previous locale's text.
  useLayoutEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
  }, [locale]);

  useLayoutEffect(() => {
    if (source === 'path' || source === 'query') {
      writeCookie(LOCALE_COOKIE, pathLocale, LOCALE_COOKIE_MAX_AGE_SECONDS);
    }
  }, [pathLocale, source]);

  const value = useMemo<LocaleContextValue>(() => {
    const bare = stripLocale(pathname);

    return {
      locale,
      dir: LOCALE_DIR[locale],
      source,
      localePath: (path: string) => `/${pathLocale}${path === '/' ? '' : path}`,
      switchLocale: (next: LocaleId) => {
        writeCookie(LOCALE_COOKIE, next, LOCALE_COOKIE_MAX_AGE_SECONDS);
        navigate(`/${next}${bare}`);
      },
      alternates: SUPPORTED_LOCALES.map((l) => ({ locale: l, href: `/${l}${bare}` })),
    };
  }, [locale, pathLocale, source, pathname, navigate]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** '/de-DE/blog/x' -> '/blog/x'; '/de-DE' -> ''. */
function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (isSupportedLocale(segments[0])) segments.shift();
  return segments.length === 0 ? '' : `/${segments.join('/')}`;
}
