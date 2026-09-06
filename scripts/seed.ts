/**
 * Applies the ground-truth manifest to produce the generated inputs the app builds from.
 *
 * The rule that keeps the clean and seeded builds from diverging: this script writes ONLY into
 * src/constants/generated/. Product code under src/ is never text-patched, and the clean build
 * is this same pipeline with an empty defect set — not a different code path.
 */
import { deleteAtPath, getAtPath, readJson, setAtPath, writeText } from './lib/json';
import { applyCodec } from './lib/codecs';
import { loadManifest } from './lib/manifest';
import { PATHS, parseMode } from './lib/paths';
import { resolve } from 'node:path';
import { SUPPORTED_LOCALES } from '../src/constants/locales';
import type { ComponentFlagId, FixtureEntry, FixtureMode } from '../src/types/fixture';
import type { LocaleId } from '../src/types/locale';

// Read from the tuple rather than restated. This was a second hand-maintained copy of the locale
// list, and a fourth locale added here but not there would have seeded three locales silently.
const LOCALES: readonly LocaleId[] = SUPPORTED_LOCALES;

/** Must list every ComponentFlagId. seed.ts emits a const for each on every build. */
const ALL_COMPONENT_FLAGS: readonly ComponentFlagId[] = [
  'deNavItemClipped',
  'deServicesCtaClipped',
  'dePricingTableOverflow',
  'deCtaWrapsAtMobile',
  'hiCardTruncated',
  'enHomeHeroHardcoded',
  'enContactCtaHardcoded',
  'deFooterNoteHardcoded',
  'hiBadgeHardcoded',
  'deTextInImage',
  'arPhoneNotIsolated',
];

type Messages = Record<string, unknown>;

function main(): void {
  const mode = parseMode(process.argv.slice(2));
  const manifest = loadManifest();
  const entries = mode === 'seeded' ? manifest.entries.filter((e) => e.polarity === 'defect') : [];

  const messages = loadMessages();
  const siteData = readJson<Record<string, unknown>>(PATHS.siteData);
  const flags = new Set<ComponentFlagId>();
  const behaviours = new Map<string, string[]>();
  const headOverrides: Record<string, Record<string, string>> = {};
  const hreflangOmissions: Record<string, LocaleId[]> = {};

  for (const entry of entries) {
    applyEntry(entry, { messages, siteData, flags, behaviours, headOverrides, hreflangOmissions });
  }

  emitMessages(messages);
  emitSiteData(siteData);
  emitActiveDefects(flags, behaviours);
  emitHeadOverrides(headOverrides, hreflangOmissions);
  emitBuildInfo(mode, manifest.version, entries.length);

  const label = mode === 'seeded' ? `${entries.length} defect(s)` : 'no defects (control build)';
  console.log(`seed: mode=${mode}, applied ${label}`);
}

interface SeedSinks {
  readonly messages: Record<LocaleId, Messages>;
  readonly siteData: Record<string, unknown>;
  readonly flags: Set<ComponentFlagId>;
  readonly behaviours: Map<string, string[]>;
  readonly headOverrides: Record<string, Record<string, string>>;
  readonly hreflangOmissions: Record<string, LocaleId[]>;
}

function applyEntry(entry: FixtureEntry, sinks: SeedSinks): void {
  const { messages, siteData, flags, behaviours, headOverrides, hreflangOmissions } = sinks;
  const { target } = entry;

  switch (target.via) {
    case 'i18nValue': {
      const path = `${target.namespace}.${target.key}`;
      assertProduces(entry, target.replacement);
      setAtPath(messages[entry.locale], path, target.replacement);
      return;
    }

    case 'i18nDelete': {
      // Delete rather than replace: i18next's fallbackLng then surfaces the English string,
      // which is what a genuinely missing translation looks like. Hardcoding the English text
      // would be indistinguishable from `translation.untranslated`, a different defect.
      deleteAtPath(messages[entry.locale], `${target.namespace}.${target.key}`);
      return;
    }

    case 'i18nTransform': {
      const path = `${target.namespace}.${target.key}`;
      const before = getAtPath(messages[entry.locale], path);
      const after = applyCodec(before, target.codec, target.arg);
      assertProduces(entry, after);
      setAtPath(messages[entry.locale], path, after);
      return;
    }

    case 'dataValue': {
      assertProduces(entry, target.replacement);
      setAtPath(siteData, target.pointer, target.replacement);
      return;
    }

    case 'headField': {
      const key = overrideKeyOf(entry);
      headOverrides[key] = { ...headOverrides[key], [target.field]: target.value };
      return;
    }

    case 'hreflangBreak': {
      hreflangOmissions[overrideKeyOf(entry)] = [...target.omitLocales];
      return;
    }

    case 'componentFlag': {
      flags.add(target.flag);
      return;
    }

    case 'routeBehaviour': {
      const existing = behaviours.get(target.behaviour) ?? [];
      behaviours.set(target.behaviour, [...existing, ...(target.routeIds ?? [])]);
      return;
    }

    // Handled outside the seeder: gen-vercel.ts reads responseHeader entries, and prerender.ts
    // performs the asset swap and writes the BOM shell during its own phases. None of the three
    // can go through the generated bundle — they are file bytes and server config, not content.
    case 'responseHeader':
    case 'assetSwap':
    case 'shellByteOrderMark':
      return;

    case 'none':
      throw new Error(`${entry.id}: a defect cannot use target.via 'none'`);

    default: {
      const exhaustive: never = target;
      throw new Error(`Unhandled target: ${JSON.stringify(exhaustive)}`);
    }
  }
}

/**
 * The check that makes ~120 hand-authored ground-truth rows tractable.
 *
 * A hand-typed `actual` for a mojibake or NFD transform will not match what the codec really
 * produces — NFD in particular is byte-different but visually identical, so the mistake is
 * invisible on review. Recomputing and failing here means the manifest can never claim
 * something the pipeline did not produce.
 */
function assertProduces(entry: FixtureEntry, produced: string): void {
  if (produced === entry.actual) return;
  throw new Error(
    `${entry.id}: manifest 'actual' does not match what the transform produces.\n` +
      `  manifest: ${JSON.stringify(entry.actual)}\n` +
      `  produced: ${JSON.stringify(produced)}`,
  );
}

function overrideKeyOf(entry: FixtureEntry): string {
  const slug = entry.routeParams?.slug ? `:${entry.routeParams.slug}` : '';
  return `${entry.locale}|${entry.routeId}${slug}`;
}

function loadMessages(): Record<LocaleId, Messages> {
  const out = {} as Record<LocaleId, Messages>;
  for (const locale of LOCALES) {
    out[locale] = readJson<Messages>(resolve(PATHS.locales, `${locale}.json`));
  }
  return out;
}

// ── emitters ─────────────────────────────────────────────────────────────────────────────────

const BANNER = `// GENERATED by scripts/seed.ts — do not edit, and do not commit.\n// Regenerate with: npm run seed:clean | npm run seed:seeded\n`;

function emitMessages(messages: Record<LocaleId, Messages>): void {
  writeText(
    resolve(PATHS.generated, 'messages.ts'),
    `${BANNER}
export const MESSAGES = ${JSON.stringify(messages, null, 2)} as const;
`,
  );
}

function emitSiteData(siteData: Record<string, unknown>): void {
  writeText(
    resolve(PATHS.generated, 'siteData.ts'),
    `${BANNER}
export const SITE_DATA = ${JSON.stringify(siteData, null, 2)};
`,
  );
}

function emitActiveDefects(flags: Set<ComponentFlagId>, behaviours: Map<string, string[]>): void {
  // Every flag is emitted on every build, true or false, so the names always exist for
  // typecheck. Each is a literal boolean const, which is what lets Rollup constant-fold and
  // dead-code-eliminate the inactive branch — proven afterwards by scripts/verify-clean.ts.
  const flagLines = ALL_COMPONENT_FLAGS.map(
    (flag) => `export const ${constName(flag)} = ${flags.has(flag) ? 'true' : 'false'};`,
  ).join('\n');

  const routeIds = behaviours.get('serveDefaultLocale') ?? [];

  writeText(
    resolve(PATHS.generated, 'activeDefects.ts'),
    `${BANNER}
${flagLines}

/** Routes that ignore their own locale prefix and serve the default locale instead. */
export const B_SERVE_DEFAULT_LOCALE_ROUTES: readonly string[] = ${JSON.stringify([...routeIds].sort())};

export const B_COOKIE_BEATS_PATH = ${behaviours.has('cookieBeatsPath')};
export const B_IGNORE_QUERY_LANG = ${behaviours.has('ignoreQueryLang')};
export const B_DROP_LOCALE_ON_AUTH = ${behaviours.has('dropLocaleOnAuth')};
export const B_UNLOCALIZED_NOT_FOUND = ${behaviours.has('unlocalizedNotFound')};
`,
  );
}

function emitHeadOverrides(
  overrides: Record<string, Record<string, string>>,
  omissions: Record<string, LocaleId[]>,
): void {
  writeText(
    resolve(PATHS.generated, 'headOverrides.ts'),
    `${BANNER}
import type { LocaleId } from '@/types/locale';

/** Keyed '<locale>|<routeId>[:<slug>]'. Consumed by computeHead(). */
export const HEAD_OVERRIDES: Readonly<Record<string, Readonly<Record<string, string>>>> =
  ${JSON.stringify(overrides, null, 2)};

export const HREFLANG_OMISSIONS: Readonly<Record<string, readonly LocaleId[]>> =
  ${JSON.stringify(omissions, null, 2)};
`,
  );
}

function emitBuildInfo(mode: FixtureMode, version: string, defectCount: number): void {
  writeText(
    resolve(PATHS.generated, 'buildInfo.ts'),
    `${BANNER}
export const FIXTURE_MODE = ${JSON.stringify(mode)} as const;
export const FIXTURE_VERSION = ${JSON.stringify(version)};
export const FIXTURE_DEFECT_COUNT = ${defectCount};
`,
  );
}

/** 'deNavItemClipped' -> 'D_DE_NAV_ITEM_CLIPPED'. */
function constName(flag: string): string {
  return `D_${flag.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
}

main();
