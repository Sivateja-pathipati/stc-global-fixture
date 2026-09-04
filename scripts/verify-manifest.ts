/**
 * Structural checks on the ground truth itself: coverage per locale, category spread, and the
 * anchors a detector needs. Runs without a build.
 */
import { loadManifest } from './lib/manifest';
import { readJson } from './lib/json';
import { PATHS } from './lib/paths';
import { SUPPORTED_LOCALES } from '../src/constants/locales';
import { PRERENDER_ROUTE_IDS } from '../src/constants/routes';

const MIN_DEFECTS_PER_LOCALE = 25;
const MIN_TRAPS_PER_LOCALE = 10;
const MIN_KINDS_PER_LOCALE = 8;

interface IssueTypeRow {
  readonly issueType: string | null;
  readonly level: number | null;
  readonly guards?: readonly string[];
}

interface IssueTypeMap {
  readonly version: string;
  readonly kinds: Readonly<Record<string, IssueTypeRow>>;
}

function main(): void {
  const { entries, version } = loadManifest();
  const problems: string[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    const mine = entries.filter((e) => e.locale === locale);
    const defects = mine.filter((e) => e.polarity === 'defect');
    const traps = mine.filter((e) => e.polarity === 'trap');
    const kinds = new Set(defects.map((e) => e.kind));

    if (defects.length < MIN_DEFECTS_PER_LOCALE) {
      problems.push(
        `${locale}: ${defects.length} defects, need at least ${MIN_DEFECTS_PER_LOCALE}`,
      );
    }
    if (traps.length < MIN_TRAPS_PER_LOCALE) {
      problems.push(
        `${locale}: ${traps.length} traps, need at least ${MIN_TRAPS_PER_LOCALE} — without traps you measure recall only`,
      );
    }
    if (kinds.size < MIN_KINDS_PER_LOCALE) {
      problems.push(
        `${locale}: only ${kinds.size} distinct defect kinds, need ${MIN_KINDS_PER_LOCALE}`,
      );
    }
  }

  // A duplicate (locale, route, kind, anchor) means two entries a detector cannot tell apart.
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const anchor =
      entry.detect.testId ??
      entry.detect.headSelector ??
      entry.detect.httpHeader ??
      entry.detect.selector ??
      '';
    const key = `${entry.locale}|${entry.routeId}|${entry.kind}|${anchor}`;
    const previous = seen.get(key);
    if (previous)
      problems.push(`${entry.id} duplicates ${previous} — same locale/route/kind/anchor`);
    seen.set(key, entry.id);
  }

  for (const entry of entries) {
    if (!PRERENDER_ROUTE_IDS.includes(entry.routeId)) {
      problems.push(`${entry.id}: routeId '${entry.routeId}' has no prerendered shell`);
    }
    if (entry.routeId === 'blog.article' && !entry.routeParams?.slug) {
      problems.push(`${entry.id}: blog.article entries need routeParams.slug`);
    }
  }

  // Two defects on one resource key stack: the second transforms whatever the first left
  // behind, and the ground truth stops saying which rule should fire. seed.ts catches the
  // transform case by recomputation, but a plain i18nValue pair would overwrite silently.
  const targeted = new Map<string, string>();
  for (const entry of entries) {
    const { target } = entry;
    if (target.via !== 'i18nValue' && target.via !== 'i18nDelete' && target.via !== 'i18nTransform')
      continue;
    const key = `${entry.locale}|${target.namespace}.${target.key}`;
    const previous = targeted.get(key);
    if (previous) problems.push(`${entry.id} and ${previous} both seed ${key}`);
    targeted.set(key, entry.id);
  }

  const coverage = checkIssueTypeMap(problems, entries);

  if (problems.length > 0) {
    console.error(`verify-manifest FAILED — ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  const defects = entries.filter((e) => e.polarity === 'defect').length;
  const traps = entries.length - defects;
  console.log(
    `verify-manifest: OK — v${version}, ${entries.length} entries (${defects} defects, ${traps} traps)`,
  );
  for (const locale of SUPPORTED_LOCALES) {
    const mine = entries.filter((e) => e.locale === locale);
    const d = mine.filter((e) => e.polarity === 'defect');
    const kinds = new Set(d.map((e) => e.kind)).size;
    console.log(
      `  ${locale}: ${d.length} defects across ${kinds} kinds, ${mine.length - d.length} traps`,
    );
  }

  console.log(
    `  level 1: ${coverage.measurable}/${coverage.total} defect entries bound to an IssueType`,
  );
}

/**
 * Every kind a manifest entry uses must name the rule expected to catch it, or say explicitly
 * that none does yet. Without this a new kind can be added and quietly score against nothing —
 * recall stays at 100% because the denominator never grew.
 */
function checkIssueTypeMap(
  problems: string[],
  entries: ReturnType<typeof loadManifest>['entries'],
): { measurable: number; total: number } {
  const map = readJson<IssueTypeMap>(PATHS.issueTypeMap);
  let measurable = 0;
  let total = 0;

  for (const entry of entries) {
    const row = map.kinds[entry.kind];
    if (row === undefined) {
      problems.push(`${entry.id}: kind '${entry.kind}' has no row in issue-type-map.json`);
      continue;
    }
    if (entry.polarity === 'trap') {
      if (row.issueType !== null) {
        problems.push(`${entry.id}: trap kind '${entry.kind}' must not name an issueType`);
      }
      continue;
    }
    total += 1;
    if (row.issueType !== null) measurable += 1;
  }

  return { measurable, total };
}

main();
