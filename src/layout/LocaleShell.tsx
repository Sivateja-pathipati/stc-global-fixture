import { useLocation } from 'react-router-dom';
import LocaleProvider from '@/contexts/LocaleProvider';
import AppLayout from '@/layout/AppLayout';
import { readCookie } from '@/utils/cookie';
import { parseLocation } from '@/utils/routeMatch';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isSupportedLocale } from '@/constants/locales';
import {
  B_COOKIE_BEATS_PATH,
  B_SERVE_DEFAULT_LOCALE_ROUTES,
} from '@/constants/generated/activeDefects';
import type { LocaleId, LocaleSource } from '@/types/locale';
import type { LocaleShellProps } from '@/types/components';

/**
 * The element for each literal locale route. `locale` arrives as a compile-time prop rather
 * than through useParams(), which removes the "is this segment a locale or a stray path part"
 * question entirely — see docs/locale-precedence.md for why a `:locale` param cannot work.
 *
 * This is also where two seeded precedence violations take effect. In both, the URL keeps
 * saying one locale while the body renders another; that disagreement is the observable
 * defect, and it stays visible in two independent places (<html lang> and the rendered text).
 */
export default function LocaleShell({ locale }: LocaleShellProps) {
  const { pathname } = useLocation();
  const { routeId } = parseLocation(pathname);

  const { effective, source } = resolveContentLocale(locale, routeId);

  return (
    <LocaleProvider locale={effective} pathLocale={locale} source={source}>
      <AppLayout />
    </LocaleProvider>
  );
}

function resolveContentLocale(
  pathLocale: LocaleId,
  routeId: string,
): { effective: LocaleId; source: LocaleSource } {
  if (B_COOKIE_BEATS_PATH) {
    const cookie = readCookie(LOCALE_COOKIE);
    if (isSupportedLocale(cookie) && cookie !== pathLocale) {
      return { effective: cookie, source: 'cookie' };
    }
  }

  if (B_SERVE_DEFAULT_LOCALE_ROUTES.includes(routeId) && pathLocale !== DEFAULT_LOCALE) {
    return { effective: DEFAULT_LOCALE, source: 'default' };
  }

  return { effective: pathLocale, source: 'path' };
}
