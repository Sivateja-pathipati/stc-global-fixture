import { existsSync } from 'node:fs';
import { readJson } from './json';
import { PATHS } from './paths';
import type { FixtureEntry, FixtureManifest } from '../../src/types/fixture';

/**
 * Loads and sanity-checks the ground truth.
 *
 * Returns an empty manifest when the file is absent so `npm install`'s prepare hook can seed a
 * clean build on a fresh clone before any defects have been authored.
 */
export function loadManifest(): FixtureManifest {
  if (!existsSync(PATHS.manifest)) {
    return { version: '0.0.0', entries: [] };
  }

  const manifest = readJson<FixtureManifest>(PATHS.manifest);
  assertWellFormed(manifest);
  return { ...manifest, entries: [...manifest.entries].sort((a, b) => (a.id < b.id ? -1 : 1)) };
}

function assertWellFormed(manifest: FixtureManifest): void {
  const problems: string[] = [];

  if (!Array.isArray(manifest.entries)) {
    throw new Error('manifest.entries must be an array');
  }

  const seen = new Set<string>();
  for (const entry of manifest.entries) {
    if (seen.has(entry.id)) problems.push(`duplicate id: ${entry.id}`);
    seen.add(entry.id);

    if (!entry.detect || Object.keys(entry.detect).length === 0) {
      problems.push(`${entry.id}: detect must name at least one anchor`);
    }
    if (entry.polarity === 'trap' && entry.expected !== entry.actual) {
      problems.push(`${entry.id}: a trap must have expected === actual`);
    }
    if (entry.polarity === 'trap' && entry.target.via !== 'none') {
      problems.push(
        `${entry.id}: a trap must use target.via 'none' — traps are documented, not injected`,
      );
    }
    if (entry.polarity === 'defect' && entry.target.via === 'none') {
      problems.push(`${entry.id}: a defect needs a real injection target`);
    }
    if (entry.polarity === 'defect' && entry.expected === entry.actual) {
      problems.push(`${entry.id}: a defect must change something`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`Manifest is not well formed:\n  - ${problems.join('\n  - ')}`);
  }
}

export function defects(entries: readonly FixtureEntry[]): readonly FixtureEntry[] {
  return entries.filter((e) => e.polarity === 'defect');
}

export function traps(entries: readonly FixtureEntry[]): readonly FixtureEntry[] {
  return entries.filter((e) => e.polarity === 'trap');
}
