import type { RouteId, RouteParams } from '@/types/route';

/**
 * Locale-less route paths, keyed by route id. Never write one of these as a literal at a call
 * site — every Link, every navigate() and the prerenderer all read this table, so a second
 * copy means renaming a path silently produces a 404 somewhere.
 */
export const APP_ROUTES: Readonly<Record<RouteId, string>> = {
  home: '/',
  about: '/about',
  services: '/services',
  pricing: '/pricing',
  events: '/events',
  contact: '/contact',
  blog: '/blog',
  'blog.article': '/blog/:slug',
  login: '/login',
  account: '/account',
  notFound: '/404',
  serverError: '/500',
};

/** Route ids that appear in the primary navigation, in display order. */
export const NAV_ROUTE_IDS: readonly RouteId[] = [
  'home',
  'about',
  'services',
  'pricing',
  'events',
  'blog',
  'contact',
];

/** Routes the prerenderer emits a shell for. 'blog.article' expands over the fixed slug list. */
export const PRERENDER_ROUTE_IDS: readonly RouteId[] = [
  'home',
  'about',
  'services',
  'pricing',
  'events',
  'contact',
  'blog',
  'blog.article',
  'login',
  'account',
  'notFound',
  'serverError',
];

/** Fills :params in a route pattern. Unknown params are left in place, which fails loudly. */
export function routePath(routeId: RouteId, params?: RouteParams): string {
  const pattern = APP_ROUTES[routeId];
  if (!params) return pattern;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, value),
    pattern,
  );
}

/** '/about' -> 'about'. React Router child routes are declared relative to their parent. */
export function childPath(routeId: RouteId): string {
  return APP_ROUTES[routeId].replace(/^\//, '');
}
