import type { LocaleId, TextDirection } from './locale';

export interface HeadAlternate {
  readonly hreflang: string;
  readonly href: string;
}

/**
 * Everything that goes into a page's <head>, fully resolved. Produced by computeHead() and
 * consumed by exactly two callers: scripts/prerender.ts renders it to an HTML string, and
 * useDocumentHead applies it to the live DOM. One model, two renderers — which is why the
 * stamped shell and the hydrated page can never silently disagree.
 */
export interface HeadModel {
  readonly locale: LocaleId;
  readonly htmlLang: string;
  readonly dir: TextDirection;
  readonly charset: string;
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly ogTitle: string;
  readonly ogDescription: string;
  readonly ogLocale: string;
  readonly ogUrl: string;
  readonly ogImage: string;
  readonly alternates: readonly HeadAlternate[];
  /** Set only on the root gate shell, which must not be indexed. */
  readonly robots?: string;
}

/** A single head element, in the fixed order head.mapper.ts emits. */
export interface HeadTagDescriptor {
  readonly tag: 'title' | 'meta' | 'link';
  readonly attrs: Readonly<Record<string, string>>;
  readonly text?: string;
  /** Stable identity for DOM reconciliation at runtime. */
  readonly key: string;
}

/** Per-route, per-locale head copy authored in content/head/*.json. */
export interface HeadContentEntry {
  readonly title: string;
  readonly description: string;
  readonly ogTitle?: string;
  readonly ogDescription?: string;
}
