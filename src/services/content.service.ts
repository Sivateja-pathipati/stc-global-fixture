import { SITE_DATA } from '@/constants/generated/siteData';
import siteConfigJson from '../../content/site.config.json';
import headJson from '../../content/head/head.json';
import type { BlogPost, EventItem, Localized, OfficeContact, PricingPlan } from '@/types/content';
import type { HeadContentEntry } from '@/types/head';
import type { LocaleId } from '@/types/locale';
import type { RouteId } from '@/types/route';

/**
 * Typed accessors over the hand-authored content in content/. Node-safe: no React, no DOM,
 * no browser globals, so scripts/prerender.ts can import the same data the app renders.
 */

// Read from the generated copy, not from content/, so a dataValue defect can reach the
// pre-formatted prices and dates the same way an i18nValue defect reaches prose.
const siteData = SITE_DATA as unknown as {
  plans: PricingPlan[];
  events: EventItem[];
  offices: OfficeContact[];
  posts: BlogPost[];
};

const headContent = headJson as unknown as Partial<
  Record<RouteId, Record<LocaleId, HeadContentEntry>>
>;

export const SITE_CONFIG = siteConfigJson;

/** Sorted by slug so the prerender enumeration is byte-stable across builds. */
export const BLOG_POSTS: readonly BlogPost[] = [...siteData.posts].sort((a, b) =>
  a.slug < b.slug ? -1 : 1,
);

export const PRICING_PLANS: readonly PricingPlan[] = siteData.plans;
export const EVENTS: readonly EventItem[] = siteData.events;
export const OFFICES: readonly OfficeContact[] = siteData.offices;

/** Every distinct tag across all posts, sorted. Feeds the blog topic filter. */
export const BLOG_TAGS: readonly string[] = [
  ...new Set(BLOG_POSTS.flatMap((post) => post.tags)),
].sort();

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function postsByTag(tag: string | null): readonly BlogPost[] {
  if (!tag) return BLOG_POSTS;
  return BLOG_POSTS.filter((post) => post.tags.includes(tag));
}

/** Picks one locale out of a Localized<T>. The single place that indexing happens. */
export function pick<T>(value: Localized<T>, locale: LocaleId): T {
  return value[locale];
}

export function getHeadContent(routeId: RouteId, locale: LocaleId): HeadContentEntry | undefined {
  return headContent[routeId]?.[locale];
}
