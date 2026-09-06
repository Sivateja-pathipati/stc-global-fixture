import type { LocaleId } from './locale';
import type { RouteId, RouteParams } from './route';

export type Polarity = 'defect' | 'trap';

export type FixtureMode = 'clean' | 'seeded';

export type DefectKind =
  // ── content ────────────────────────────────────────────────────────────────────────────
  | 'translation.missing'
  | 'translation.untranslated'
  | 'translation.mojibake'
  | 'translation.placeholder'
  | 'translation.rawKey'
  | 'translation.truncated'
  | 'translation.hardcoded'
  | 'translation.concatenated'
  | 'translation.wrongLanguage'
  | 'translation.marker'
  /**
   * A literal `undefined` or `null` reaching the page. Distinct from `translation.marker`:
   * a marker is a string someone deliberately authored as a placeholder, this is a JavaScript
   * value that escaped a template. Different root cause, different rule, so a scoring run can
   * tell which detector was right.
   */
  | 'translation.nullValue'
  /** Raw ICU message syntax rendered literally, because the runtime has no ICU formatter. */
  | 'translation.icuSyntax'
  | 'translation.controlChar'
  /** U+FEFF inside a text node — invisible, and it breaks string equality on the first char. */
  | 'translation.byteOrderMark'
  /**
   * NFD round-trip: `Uber` as `U` plus a combining diaeresis. Visually identical to the correct
   * string, byte-different. Split from `translation.diacriticsStripped` because the two need
   * different rules - this one is a byte-level property a normalization check finds, the other
   * needs a dictionary.
   */
  | 'translation.unicodeNormalization'
  /** Umlauts genuinely gone: `Vortraege` rendered `Vortrage`. Needs a dictionary; Level 5. */
  | 'translation.diacriticsStripped'
  // ── formatting ─────────────────────────────────────────────────────────────────────────
  | 'format.number'
  | 'format.currency'
  | 'format.date'
  | 'format.time'
  | 'format.phone'
  | 'format.address'
  // ── document head ──────────────────────────────────────────────────────────────────────
  | 'head.lang'
  | 'head.title'
  | 'head.description'
  | 'head.canonical'
  | 'head.hreflang'
  | 'head.og'
  | 'head.charset'
  /** The shell file itself saved as UTF-8-with-BOM — the "opened it in Notepad" defect. */
  | 'head.byteOrderMark'
  // ── transport ──────────────────────────────────────────────────────────────────────────
  | 'header.contentLanguage'
  | 'header.contentType'
  // ── rendered DOM / visual ──────────────────────────────────────────────────────────────
  | 'dom.clipped'
  | 'dom.overflow'
  | 'dom.wrapped'
  | 'dom.altTextUntranslated'
  | 'dom.altTextMissing'
  | 'dom.textInImage'
  | 'dom.ariaUntranslated'
  | 'dom.placeholderUntranslated'
  // ── routing / behaviour ────────────────────────────────────────────────────────────────
  | 'route.localeIgnored'
  | 'route.precedenceViolation'
  | 'route.localeLostOnAuth'
  | 'route.notFoundUnlocalized'
  // ── traps (polarity 'trap' only) ───────────────────────────────────────────────────────
  | 'trap.brandName'
  | 'trap.loanword'
  | 'trap.cognate'
  | 'trap.versionString'
  | 'trap.productCode'
  | 'trap.taggedForeignQuote'
  | 'trap.internationalPhone'
  | 'trap.latinNumerals'
  | 'trap.legalEntity'
  // ── traps aimed at Level 1 plumbing rules ──────────────────────────────────────────────
  // Without these, Level 1 precision is unmeasured and a greedy regex scores 100%.
  /** A dotted filename that is not a resource key. Guards `RawResourceKey`. */
  | 'trap.dottedIdentifier'
  /** Braces in prose that are content, not an unresolved token. Guards `UnresolvedPlaceholder` and `IcuSyntaxError`. */
  | 'trap.bracedLiteral'
  /** The word `null` used as terminology. Guards `NullOrUndefinedRendered`. */
  | 'trap.nullInProse';

/**
 * The closed set of build-time component flags.
 *
 * Closed and hand-declared on purpose: `seed.ts` emits a `const` for EVERY id here on every
 * build (true or false), so the names always exist for typecheck, and because each is a
 * literal boolean Rollup constant-folds the inactive branch away. A dynamic record lookup
 * would defeat dead-code elimination and let defect strings leak into the clean bundle.
 */
export type ComponentFlagId =
  | 'deNavItemClipped'
  | 'deServicesCtaClipped'
  | 'dePricingTableOverflow'
  | 'deCtaWrapsAtMobile'
  | 'hiCardTruncated'
  | 'enHomeHeroHardcoded'
  | 'enContactCtaHardcoded'
  | 'deFooterNoteHardcoded'
  | 'hiBadgeHardcoded'
  | 'deTextInImage';

export type RouteBehaviourId =
  | 'serveDefaultLocale'
  | 'ignoreQueryLang'
  | 'cookieBeatsPath'
  | 'dropLocaleOnAuth'
  | 'unlocalizedNotFound';

export type HeadFieldName =
  | 'htmlLang'
  | 'title'
  | 'description'
  | 'canonical'
  | 'ogTitle'
  | 'ogDescription'
  | 'ogLocale'
  | 'charset';

export type TransformCodec =
  | 'utf8-as-cp1252'
  | 'nfd'
  | 'strip-diacritics'
  | 'truncate'
  | 'strip-placeholder'
  | 'inject-control-char'
  | 'inject-bom';

/** How the seeder physically produces the defect. Exhaustively switched in scripts/seed.ts. */
export type DefectTarget =
  | {
      readonly via: 'i18nValue';
      readonly namespace: string;
      readonly key: string;
      readonly replacement: string;
    }
  | { readonly via: 'i18nDelete'; readonly namespace: string; readonly key: string }
  | {
      readonly via: 'i18nTransform';
      readonly namespace: string;
      readonly key: string;
      readonly codec: TransformCodec;
      readonly arg?: string;
    }
  | {
      /**
       * Patches a pre-formatted display literal in content/data/site-data.json — prices,
       * dates, phone numbers, addresses. These live outside the i18n resources because they
       * are formatted values rather than prose, so they need their own injection target.
       */
      readonly via: 'dataValue';
      /** Dotted path into site-data, e.g. 'plans.1.price.de-DE'. */
      readonly pointer: string;
      readonly replacement: string;
    }
  | { readonly via: 'headField'; readonly field: HeadFieldName; readonly value: string }
  | {
      /**
       * Writes one shell as UTF-8-with-BOM. Not a headField: the BOM sits before the doctype,
       * outside anything the head model describes, and it is a property of how the file was
       * encoded rather than of its content.
       */
      readonly via: 'shellByteOrderMark';
    }
  | { readonly via: 'hreflangBreak'; readonly omitLocales: readonly LocaleId[] }
  | { readonly via: 'componentFlag'; readonly flag: ComponentFlagId }
  | {
      readonly via: 'routeBehaviour';
      readonly behaviour: RouteBehaviourId;
      readonly routeIds?: readonly RouteId[];
    }
  | {
      readonly via: 'responseHeader';
      readonly pathGlob: string;
      readonly header: string;
      readonly value: string;
    }
  | { readonly via: 'assetSwap'; readonly publicPath: string; readonly replacementPath: string }
  | { readonly via: 'none' };

/** Where a detector should look. At least one field must be set. */
export interface FixtureDetectHint {
  /** Value of the data-rgt-id attribute on the owning element. */
  readonly testId?: string;
  readonly selector?: string;
  readonly headSelector?: string;
  readonly httpHeader?: string;
  /** For route.* kinds: what the final URL should be after the behaviour. */
  readonly urlAssertion?: string;
}

export interface FixtureEntry {
  /** '<LOCALE-SHORT>-<3 digits>', e.g. 'DE-014'. Stable, sorted, never reused. */
  readonly id: string;
  readonly polarity: Polarity;
  readonly kind: DefectKind;
  readonly locale: LocaleId;
  readonly routeId: RouteId;
  readonly routeParams?: RouteParams;
  readonly severity: 'critical' | 'major' | 'minor' | 'none';
  readonly category: 'i18n' | 'l10n' | 'format' | 'markup' | 'transport' | 'ux' | 'seo';
  readonly target: DefectTarget;

  /** What the clean build renders or serves. */
  readonly expected: string;
  /** What the seeded build renders or serves. Equal to `expected` for traps. */
  readonly actual: string;

  readonly detect: FixtureDetectHint;
  /** For traps, the argument for why flagging this would be a false positive. */
  readonly rationale: string;
  readonly addedIn: string;
}

export interface FixtureManifest {
  readonly version: string;
  readonly entries: readonly FixtureEntry[];
}
