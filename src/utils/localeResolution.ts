import { DEFAULT_LOCALE, isSupportedLocale, SUPPORTED_LOCALES } from '@/constants/locales';
import type { LocaleId, LocaleResolution, LocaleResolutionInput } from '@/types/locale';

/**
 * Deliberate violations of the precedence spec, injected by the seeder. Passed in rather than
 * imported so this module stays a pure function of its arguments and every rule in
 * docs/locale-precedence.md is testable in isolation.
 */
export interface LocaleBehaviourFlags {
  /** Cookie wins over an explicit path prefix — violates rule 1. */
  readonly cookieBeatsPath: boolean;
  /** `?lang=` is silently discarded — violates rule 2. */
  readonly ignoreQueryLang: boolean;
}

export const DEFAULT_LOCALE_BEHAVIOUR: LocaleBehaviourFlags = {
  cookieBeatsPath: false,
  ignoreQueryLang: false,
};

/**
 * The single source of truth for "which locale is this request?", per
 * docs/locale-precedence.md. No React, no window, no document — everything above this is a
 * thin adapter, which is what makes the spec testable and makes each seeded precedence
 * violation a one-branch swap rather than a scattered edit.
 */
export function resolveLocale(
  input: LocaleResolutionInput,
  behaviour: LocaleBehaviourFlags = DEFAULT_LOCALE_BEHAVIOUR,
): LocaleResolution {
  const segments = splitPath(input.pathname);
  const pathLocale = isSupportedLocale(segments[0]) ? segments[0] : null;

  // ── Rule 1: path prefix ────────────────────────────────────────────────────────────────
  if (pathLocale) {
    const cookieLocale = isSupportedLocale(input.cookieValue) ? input.cookieValue : null;

    // Seeded violation: the URL still says /de-DE, but the content is served in the cookie's
    // locale. canonicalPath stays put so there is no redirect loop — the disagreement between
    // URL and rendered language IS the observable defect.
    if (behaviour.cookieBeatsPath && cookieLocale && cookieLocale !== pathLocale) {
      return {
        locale: cookieLocale,
        source: 'cookie',
        canonicalPath: normalizePath(input.pathname),
        shouldPersistCookie: false,
      };
    }

    return {
      locale: pathLocale,
      source: 'path',
      canonicalPath: normalizePath(input.pathname),
      shouldPersistCookie: true,
    };
  }

  const rest = joinPath(segments);

  // ── Rule 2: ?lang= override, un-prefixed URLs only ─────────────────────────────────────
  if (!behaviour.ignoreQueryLang) {
    const queryLocale = readQueryLocale(input.search);
    if (queryLocale) {
      return {
        locale: queryLocale,
        source: 'query',
        canonicalPath: prefixed(queryLocale, rest),
        shouldPersistCookie: true,
      };
    }
  }

  // ── Rule 3: cookie ─────────────────────────────────────────────────────────────────────
  if (isSupportedLocale(input.cookieValue)) {
    return {
      locale: input.cookieValue,
      source: 'cookie',
      canonicalPath: prefixed(input.cookieValue, rest),
      shouldPersistCookie: false,
    };
  }

  // ── Rule 4: Accept-Language, via its client-side stand-in ──────────────────────────────
  const negotiated = negotiate(input.navigatorLanguages);
  if (negotiated) {
    return {
      locale: negotiated,
      source: 'navigator',
      canonicalPath: prefixed(negotiated, rest),
      shouldPersistCookie: false,
    };
  }

  // ── Rule 5: default ────────────────────────────────────────────────────────────────────
  return {
    locale: DEFAULT_LOCALE,
    source: 'default',
    canonicalPath: prefixed(DEFAULT_LOCALE, rest),
    shouldPersistCookie: false,
  };
}

/**
 * Exact tag first, then primary subtag ('de' -> 'de-DE'). Candidates are checked in the
 * browser's stated preference order; the supported set is scanned in its own sorted order so
 * a tie is resolved deterministically rather than by hash iteration.
 */
function negotiate(languages: readonly string[]): LocaleId | null {
  for (const candidate of languages) {
    if (isSupportedLocale(candidate)) return candidate;
  }
  for (const candidate of languages) {
    const primary = candidate.split('-')[0]?.toLowerCase();
    if (!primary) continue;
    const match = SUPPORTED_LOCALES.find((l) => l.split('-')[0].toLowerCase() === primary);
    if (match) return match;
  }
  return null;
}

function readQueryLocale(search: string): LocaleId | null {
  const value = new URLSearchParams(search).get('lang');
  return isSupportedLocale(value) ? value : null;
}

function splitPath(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}

function joinPath(segments: readonly string[]): string {
  return segments.length === 0 ? '' : `/${segments.join('/')}`;
}

/** No trailing slash anywhere — vercel.json sets trailingSlash:false and 308s otherwise. */
function normalizePath(pathname: string): string {
  const joined = joinPath(splitPath(pathname));
  return joined === '' ? '/' : joined;
}

function prefixed(locale: LocaleId, rest: string): string {
  return `/${locale}${rest}`;
}
