import { LOCALE_DIR, LOCALE_HTML_LANG, SUPPORTED_LOCALES } from '@/constants/locales';
import { routePath } from '@/constants/routes';
import { HEAD_OVERRIDES, HREFLANG_OMISSIONS } from '@/constants/generated/headOverrides';
import { getHeadContent, getPost, pick, SITE_CONFIG } from '@/services/content.service';
import type { HeadAlternate, HeadModel } from '@/types/head';
import type { LocaleId } from '@/types/locale';
import type { RouteId, RouteParams } from '@/types/route';

/**
 * Builds the complete <head> model for one locale × route.
 *
 * PURE and Node-safe on purpose. scripts/prerender.ts imports this exact function to stamp the
 * static shells, and useDocumentHead applies its output to the live DOM. One implementation,
 * two renderers — which is why a shell and its hydrated page can never silently disagree. If
 * someone ever "optimises" this by inlining head logic into a component, that guarantee is
 * gone and head defects start scoring differently for a raw-HTML detector than for a browser.
 */
export function computeHead(
  locale: LocaleId,
  routeId: RouteId,
  params: RouteParams | undefined,
  origin: string,
): HeadModel {
  const path = routePath(routeId, params);
  const overrides = HEAD_OVERRIDES[overrideKey(locale, routeId, params)] ?? {};

  const base = baseCopy(locale, routeId, params);

  return {
    locale,
    htmlLang: overrides.htmlLang ?? LOCALE_HTML_LANG[locale],
    dir: LOCALE_DIR[locale],
    charset: overrides.charset ?? 'utf-8',
    title: overrides.title ?? base.title,
    description: overrides.description ?? base.description,
    canonical: overrides.canonical ?? absolute(origin, locale, path),
    ogTitle: overrides.ogTitle ?? base.title,
    ogDescription: overrides.ogDescription ?? base.description,
    ogLocale: overrides.ogLocale ?? locale.replace('-', '_'),
    ogUrl: absolute(origin, locale, path),
    ogImage: `${origin}${SITE_CONFIG.ogImagePath}`,
    alternates: buildAlternates(origin, locale, routeId, params, path),
  };
}

/** The root gate shell at dist/index.html. Never indexed — it only redirects. */
export function computeRootHead(origin: string): HeadModel {
  return {
    locale: 'en-US',
    htmlLang: 'en',
    dir: 'ltr',
    charset: 'utf-8',
    title: `${SITE_CONFIG.siteName}`,
    description: 'Choosing your language…',
    canonical: '',
    ogTitle: SITE_CONFIG.siteName,
    ogDescription: 'Choosing your language…',
    ogLocale: 'en_US',
    ogUrl: origin,
    ogImage: `${origin}${SITE_CONFIG.ogImagePath}`,
    alternates: [
      ...SUPPORTED_LOCALES.map((l) => ({ hreflang: l, href: `${origin}/${l}` })),
      { hreflang: 'x-default', href: `${origin}/en-US` },
    ],
    robots: 'noindex, follow',
  };
}

/**
 * Reciprocity is STRUCTURAL, not checked: the set is generated from the sorted locale tuple
 * for every variant of a route and always includes a self-reference, so a correct build is
 * reciprocal by construction and cannot break by accident. A seeded hreflangBreak removes one
 * link from one shell — a genuine one-directional break that a reciprocity crawler catches
 * and a per-page checker misses.
 */
function buildAlternates(
  origin: string,
  locale: LocaleId,
  routeId: RouteId,
  params: RouteParams | undefined,
  path: string,
): readonly HeadAlternate[] {
  const omitted = HREFLANG_OMISSIONS[overrideKey(locale, routeId, params)] ?? [];
  const alternates: HeadAlternate[] = SUPPORTED_LOCALES.filter((l) => !omitted.includes(l)).map(
    (l) => ({ hreflang: l, href: absolute(origin, l, path) }),
  );
  alternates.push({ hreflang: 'x-default', href: absolute(origin, 'en-US', path) });
  return alternates;
}

function baseCopy(
  locale: LocaleId,
  routeId: RouteId,
  params: RouteParams | undefined,
): { title: string; description: string } {
  if (routeId === 'blog.article') {
    const post = params?.slug ? getPost(params.slug) : undefined;
    if (post) {
      return {
        title: `${pick(post.title, locale)} — ${SITE_CONFIG.siteName}`,
        description: pick(post.excerpt, locale),
      };
    }
  }

  const entry = getHeadContent(routeId, locale);
  return {
    title: entry?.title ?? SITE_CONFIG.siteName,
    description: entry?.description ?? '',
  };
}

/** No trailing slash — vercel.json sets trailingSlash:false and would 308 otherwise. */
function absolute(origin: string, locale: LocaleId, path: string): string {
  const suffix = path === '/' ? '' : path;
  return `${origin}/${locale}${suffix}`;
}

export function overrideKey(locale: LocaleId, routeId: RouteId, params?: RouteParams): string {
  const slug = params?.slug ? `:${params.slug}` : '';
  return `${locale}|${routeId}${slug}`;
}
