import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { FixtureEntry } from '../../src/types/fixture';

const TEXT_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.txt', '.svg']);

/** Every text file in a built dist, as [relativePath, contents]. */
export function readDistText(dist: string): ReadonlyMap<string, string> {
  const files = new Map<string, string>();

  const walk = (dir: string, prefix: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      const rel = prefix ? `${prefix}/${name}` : name;
      if (statSync(full).isDirectory()) {
        walk(full, rel);
        continue;
      }
      if (!TEXT_EXTENSIONS.has(extname(name))) continue;
      files.set(rel, readFileSync(full, 'utf8'));
    }
  };

  walk(dist, '');
  return files;
}

/**
 * Kinds whose `actual` is a DESCRIPTION of a rendered condition rather than a literal string
 * that appears in the output. A clipped nav has no marker text to grep for — the defect is
 * geometry, and only a browser can see it.
 */
const DESCRIPTIVE_KINDS = new Set([
  'dom.clipped',
  'dom.overflow',
  'dom.wrapped',
  'dom.textInImage',
  'head.hreflang',
  'route.localeIgnored',
  'route.precedenceViolation',
  'route.localeLostOnAuth',
  'route.notFoundUnlocalized',
]);

/** True when `entry.actual` is a literal that must physically appear in the seeded output. */
export function hasLiteralActual(entry: FixtureEntry): boolean {
  if (entry.polarity !== 'defect') return false;
  if (DESCRIPTIVE_KINDS.has(entry.kind)) return false;
  if (entry.actual.trim().length === 0) return false;
  // Header values live in vercel.json, not in dist.
  if (entry.target.via === 'responseHeader') return false;
  return true;
}

/**
 * Format characters a JS emitter escapes rather than embedding raw.
 *
 * esbuild writes U+FEFF into a string literal as `\uFEFF`, because a raw one in source is a
 * byte-order mark and would change how the file itself parses. U+2028/U+2029 get the same
 * treatment as legacy line terminators. Everything else — including U+200E, which the
 * control-char defects rely on — is emitted raw, which is why only these three need a variant.
 */
const EMITTER_ESCAPED = /[\uFEFF\u2028\u2029]/g;

function escapedVariant(needle: string): string | null {
  if (!EMITTER_ESCAPED.test(needle)) return null;
  EMITTER_ESCAPED.lastIndex = 0;
  return needle.replace(EMITTER_ESCAPED, (char) => {
    const hex = char.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0');
    return `\\u${hex}`;
  });
}

/**
 * Searches for the literal, and for the form a JS emitter would have written it as.
 *
 * Without the second form a byte-order-mark defect looks absent from the bundle even though the
 * runtime string is correct — the gate would fail on a defect that is genuinely present, and
 * the obvious "fix" would be to stop checking it.
 */
export function findInDist(files: ReadonlyMap<string, string>, needle: string): string[] {
  const variant = escapedVariant(needle);
  const hits: string[] = [];
  for (const [path, contents] of files) {
    if (contents.includes(needle) || (variant !== null && contents.includes(variant))) {
      hits.push(path);
    }
  }
  return hits;
}
