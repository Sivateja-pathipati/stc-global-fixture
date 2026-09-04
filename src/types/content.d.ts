import type { LocaleId } from './locale';

/** A value that differs per locale. Every displayed string in content/data is one of these. */
export type Localized<T> = Readonly<Record<LocaleId, T>>;

export interface BlogPost {
  readonly slug: string;
  readonly heroImage: string;
  /** Pre-formatted per locale — never derived from a Date at render time. */
  readonly published: Localized<string>;
  readonly title: Localized<string>;
  readonly excerpt: Localized<string>;
  readonly body: Localized<readonly string[]>;
  readonly heroAlt: Localized<string>;
  readonly author: string;
  readonly tags: readonly string[];
  readonly readingTime: Localized<string>;
}

export interface EventItem {
  readonly id: string;
  readonly city: Localized<string>;
  readonly title: Localized<string>;
  /** Pre-formatted date, time and timezone as one display string, per locale. */
  readonly when: Localized<string>;
  readonly seatsLabel: Localized<string>;
}

export interface PricingPlan {
  readonly id: string;
  readonly name: Localized<string>;
  /** Pre-formatted currency string including symbol and separators. */
  readonly price: Localized<string>;
  readonly cadence: Localized<string>;
  readonly seats: Localized<string>;
  readonly uptime: Localized<string>;
  readonly features: Localized<readonly string[]>;
  readonly featured: boolean;
}

export interface OfficeContact {
  readonly id: string;
  readonly city: Localized<string>;
  readonly addressLines: Localized<readonly string[]>;
  readonly phone: Localized<string>;
  readonly hours: Localized<string>;
}

export interface SiteData {
  readonly posts: readonly BlogPost[];
  readonly events: readonly EventItem[];
  readonly plans: readonly PricingPlan[];
  readonly offices: readonly OfficeContact[];
}
