import { SUPPORTED_LOCALES } from '../../src/constants/locales';
import { PRERENDER_ROUTE_IDS, routePath } from '../../src/constants/routes';
import { BLOG_POSTS } from '../../src/services/content.service';
import type { LocaleId } from '../../src/types/locale';
import type { RouteId, RouteParams } from '../../src/types/route';

export interface ShellTarget {
  readonly locale: LocaleId;
  readonly routeId: RouteId;
  readonly params?: RouteParams;
  /** Locale-less path, e.g. '/blog/scaling-globally'. */
  readonly path: string;
}

/**
 * Every shell the prerenderer emits, in a deterministic order.
 *
 * Blog articles are expanded over the fixed slug list rather than left to a dynamic rewrite.
 * The set is finite and known at build time, so enumerating it keeps the output byte-stable
 * and means every article URL is a real file rather than an SPA fallback.
 *
 * Sorted with a byte comparator, not localeCompare — collation is exactly the ICU-dependent
 * behaviour this fixture avoids everywhere else.
 */
export function enumerateShells(): readonly ShellTarget[] {
  const shells: ShellTarget[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const routeId of PRERENDER_ROUTE_IDS) {
      if (routeId === 'blog.article') {
        for (const post of BLOG_POSTS) {
          shells.push({
            locale,
            routeId,
            params: { slug: post.slug },
            path: routePath(routeId, { slug: post.slug }),
          });
        }
        continue;
      }
      shells.push({ locale, routeId, path: routePath(routeId) });
    }
  }

  return shells.sort((a, b) => {
    const left = `${a.locale}${a.path}`;
    const right = `${b.locale}${b.path}`;
    return left < right ? -1 : left > right ? 1 : 0;
  });
}
