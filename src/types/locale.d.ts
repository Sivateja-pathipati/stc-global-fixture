export type LocaleId = 'ar-SA' | 'de-DE' | 'en-US' | 'hi-IN';

export type TextDirection = 'ltr' | 'rtl';

/** Which precedence rule produced the resolved locale. See docs/locale-precedence.md. */
export type LocaleSource = 'path' | 'query' | 'cookie' | 'navigator' | 'default';

export interface LocaleResolutionInput {
  readonly pathname: string;
  readonly search: string;
  readonly cookieValue: string | null;
  readonly navigatorLanguages: readonly string[];
}

export interface LocaleResolution {
  readonly locale: LocaleId;
  readonly source: LocaleSource;
  /** Where the app must be, given this resolution. Equals pathname iff source === 'path'. */
  readonly canonicalPath: string;
  /**
   * True only for sources 'path' and 'query'. A first-time visitor whose browser happens to
   * be German must not be silently pinned before they have chosen anything.
   */
  readonly shouldPersistCookie: boolean;
}

export interface LocaleAlternate {
  readonly locale: LocaleId;
  readonly href: string;
}
