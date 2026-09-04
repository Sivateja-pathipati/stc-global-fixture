import { isSupportedLocale, DEFAULT_LOCALE } from '@/constants/locales';
import type { LocaleId } from '@/types/locale';
import type { RouteId, RouteParams } from '@/types/route';

export interface ParsedLocation {
  readonly pathLocale: LocaleId;
  readonly routeId: RouteId;
  readonly params?: RouteParams;
  /** The path with its locale prefix removed, e.g. '/blog/scaling-globally'. */
  readonly barePath: string;
}

/**
 * Derives route identity from the URL rather than from React Router params.
 *
 * The head model, the prerenderer and the manifest are all keyed by RouteId, so one function
 * has to turn a path into that id. Doing it here — pure, no hooks — means the prerenderer and
 * the runtime agree by construction.
 */
export function parseLocation(pathname: string): ParsedLocation {
  const segments = pathname.split('/').filter(Boolean);
  const pathLocale = isSupportedLocale(segments[0]) ? segments[0] : DEFAULT_LOCALE;
  const rest = isSupportedLocale(segments[0]) ? segments.slice(1) : segments;
  const barePath = rest.length === 0 ? '/' : `/${rest.join('/')}`;

  if (rest.length === 0) return { pathLocale, routeId: 'home', barePath };

  if (rest[0] === 'blog') {
    if (rest.length === 1) return { pathLocale, routeId: 'blog', barePath };
    return { pathLocale, routeId: 'blog.article', params: { slug: rest[1] }, barePath };
  }

  const single: Partial<Record<string, RouteId>> = {
    about: 'about',
    services: 'services',
    pricing: 'pricing',
    events: 'events',
    contact: 'contact',
    login: 'login',
    account: 'account',
    '404': 'notFound',
    '500': 'serverError',
  };

  const matched = rest.length === 1 ? single[rest[0]] : undefined;
  return { pathLocale, routeId: matched ?? 'notFound', params: undefined, barePath };
}
