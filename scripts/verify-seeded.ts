/**
 * HARD GATE: every literal the manifest claims must actually be in the seeded build, and every
 * trap must be present and unchanged.
 *
 * Together with verify-clean this is what makes the manifest a contract rather than
 * documentation: it cannot claim a defect the pipeline did not produce, and it cannot quietly
 * lose one either.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadManifest } from './lib/manifest';
import { PATHS } from './lib/paths';
import { findInDist, hasLiteralActual, readDistText } from './lib/distSearch';

function main(): void {
  const dist = process.argv[2] ? resolve(process.argv[2]) : PATHS.dist;
  if (!existsSync(dist)) throw new Error(`No build at ${dist}. Run npm run build:seeded first.`);

  const files = readDistText(dist);
  const manifest = loadManifest();
  const problems: string[] = [];

  for (const entry of manifest.entries.filter(hasLiteralActual)) {
    if (findInDist(files, entry.actual).length === 0) {
      problems.push(`${entry.id} (${entry.kind}): claimed defect text is absent from the build`);
    }
  }

  // A trap that has gone missing is just as bad as a defect that has: it silently stops
  // measuring precision.
  for (const trap of manifest.entries.filter((e) => e.polarity === 'trap')) {
    if (trap.expected.trim().length === 0) continue;
    if (findInDist(files, trap.expected).length === 0) {
      problems.push(
        `${trap.id} (trap): expected text is missing — precision is no longer measured`,
      );
    }
  }

  if (problems.length > 0) {
    console.error(`verify-seeded FAILED — ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  console.log(
    `verify-seeded: OK — ${manifest.entries.length} manifest entries reconcile against ${dist}`,
  );
}

main();
