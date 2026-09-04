/**
 * HARD GATE: the control build must genuinely be clean.
 *
 * A naive "grep dist for every seeded string" does not work here, and the reason is worth
 * recording. Most cross-locale defects inject ANOTHER LOCALE'S CORRECT STRING — DE-022 puts the
 * real English title on the German page, DE-008 falls back to the real English nav label. Those
 * strings are legitimately present in the clean build, on their own locale's pages, and the
 * shared JS bundle carries every locale's resources anyway. A whole-dist grep flags all of them
 * and proves nothing.
 *
 * So this checks the three things that ARE decidable:
 *
 *   1. The generated flag surface is empty — no component or route defect branch is live.
 *   2. Per-locale head shells carry the expected value and not the seeded one. Head defects are
 *      stamped per locale × route, so the specific file IS distinguishable.
 *   3. Dead-code elimination actually removed the hardcoded literals. This is the one that
 *      needs proving rather than assuming: a literal surviving because Rollup could not fold a
 *      branch is exactly the silent failure that would make the control fixture worthless.
 *      Only literals that appear nowhere in the authored content are checkable — one of them
 *      ("Most popular") is deliberately identical to a real en-US string, so it is skipped and
 *      reported as such.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadManifest } from './lib/manifest';
import { PATHS } from './lib/paths';
import { readDistText } from './lib/distSearch';
import { readJson } from './lib/json';
import { SUPPORTED_LOCALES } from '../src/constants/locales';
import { routePath } from '../src/constants/routes';
import type { LocaleId } from '../src/types/locale';

const HEAD_KINDS = new Set([
  'head.lang',
  'head.title',
  'head.description',
  'head.canonical',
  'head.og',
  'head.charset',
  'head.byteOrderMark',
]);

function main(): void {
  const dist = process.argv[2] ? resolve(process.argv[2]) : PATHS.dist;
  if (!existsSync(dist)) throw new Error(`No build at ${dist}. Run npm run build:clean first.`);

  const problems: string[] = [];
  const files = readDistText(dist);

  checkFlagsAreOff(problems);
  checkHeadShells(problems, files);
  const { checked, skipped } = checkDeadCodeElimination(problems, files);

  if (problems.length > 0) {
    console.error(`verify-clean FAILED — ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  console.log(
    `verify-clean: OK — flags all off, head shells clean, ${checked} hardcoded literal(s) eliminated` +
      (skipped.length > 0 ? ` (${skipped.length} not checkable: ${skipped.join(', ')})` : ''),
  );
}

/**
 * Every component flag false and every route-behaviour list empty.
 *
 * Reads src/constants/generated/, which is a build INPUT and reflects whichever seed ran last —
 * not the dist being inspected. Now that both builds persist side by side, running this after a
 * seeded build would read seeded flags and fail against a perfectly good clean dist. The npm
 * script therefore reseeds clean first; do not call this script directly without doing the same.
 */
function checkFlagsAreOff(problems: string[]): void {
  const path = resolve(PATHS.generated, 'activeDefects.ts');
  const source = readFileSync(path, 'utf8');

  for (const match of source.matchAll(/export const (D_\w+) = (true|false);/g)) {
    if (match[2] === 'true') problems.push(`component flag ${match[1]} is live in a clean build`);
  }
  for (const match of source.matchAll(/export const (B_\w+) = (true|false);/g)) {
    if (match[2] === 'true') problems.push(`route behaviour ${match[1]} is live in a clean build`);
  }
  const routes = /B_SERVE_DEFAULT_LOCALE_ROUTES: readonly string\[\] = (\[.*?\]);/s.exec(source);
  if (routes && routes[1] !== '[]') {
    problems.push(`B_SERVE_DEFAULT_LOCALE_ROUTES is ${routes[1]} in a clean build`);
  }

  const overrides = readFileSync(resolve(PATHS.generated, 'headOverrides.ts'), 'utf8');
  if (!/HEAD_OVERRIDES[^=]*=\s*\{\}/.test(overrides)) {
    problems.push('HEAD_OVERRIDES is not empty in a clean build');
  }
  if (!/HREFLANG_OMISSIONS[^=]*=\s*\{\}/.test(overrides)) {
    problems.push('HREFLANG_OMISSIONS is not empty in a clean build');
  }
}

/**
 * Head defects are stamped into one specific locale × route shell, so that exact file can be
 * checked precisely — unlike body content, which is client-rendered and shared.
 */
function checkHeadShells(problems: string[], files: ReadonlyMap<string, string>): void {
  for (const entry of loadManifest().entries) {
    if (entry.polarity !== 'defect' || !HEAD_KINDS.has(entry.kind)) continue;
    if (entry.actual.trim().length === 0) continue;

    const shell = shellPath(entry.locale, routePath(entry.routeId, entry.routeParams));
    const contents = files.get(shell);
    if (contents === undefined) {
      problems.push(`${entry.id}: shell ${shell} is missing from the build`);
      continue;
    }
    if (contents.includes(entry.actual) && !contents.includes(entry.expected)) {
      problems.push(`${entry.id}: seeded head value present in the clean shell ${shell}`);
    }
  }
}

/** The literals in constants/labels/hardcoded.ts must not survive into a clean bundle. */
function checkDeadCodeElimination(
  problems: string[],
  files: ReadonlyMap<string, string>,
): { checked: number; skipped: string[] } {
  const source = readFileSync(resolve(PATHS.root, 'src/constants/labels/hardcoded.ts'), 'utf8');
  const literals = [...source.matchAll(/^export const \w+ = '(.+)';$/gm)].map((m) => m[1]);

  const authored = SUPPORTED_LOCALES.map((locale) =>
    JSON.stringify(readJson(resolve(PATHS.locales, `${locale}.json`))),
  ).join('\n');

  const bundle = [...files.entries()]
    .filter(([path]) => path.endsWith('.js'))
    .map(([, contents]) => contents)
    .join('\n');

  let checked = 0;
  const skipped: string[] = [];

  for (const literal of literals) {
    // A literal that is also a real authored string cannot be distinguished from legitimate
    // content in the bundle. Report it rather than pretending it was verified.
    if (authored.includes(literal)) {
      skipped.push(JSON.stringify(literal));
      continue;
    }
    checked += 1;
    if (bundle.includes(literal)) {
      problems.push(
        `hardcoded literal ${JSON.stringify(literal)} survived into the clean bundle — dead-code elimination did not remove its branch`,
      );
    }
  }

  return { checked, skipped };
}

function shellPath(locale: LocaleId, path: string): string {
  return path === '/' ? `${locale}/index.html` : `${locale}${path}/index.html`;
}

main();
