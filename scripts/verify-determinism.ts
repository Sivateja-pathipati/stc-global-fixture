/**
 * Builds twice and compares a sha256 tree.
 *
 * A fixture whose output drifts between builds cannot support byte-identical snapshot
 * assertions or build-over-build diffing, which is most of what makes it useful. TZ and LC_ALL
 * are pinned so a machine's locale cannot leak into the output.
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, resolve } from 'node:path';
import { PATHS, parseMode } from './lib/paths';

function main(): void {
  const mode = process.argv.some((a) => a.startsWith('--mode='))
    ? parseMode(process.argv.slice(2))
    : 'seeded';

  const workspace = resolve(PATHS.root, '.verify');
  rmSync(workspace, { recursive: true, force: true });

  // Must track package.json's build scripts: each mode writes to its own directory so the two
  // builds cannot overwrite each other.
  const buildDir = resolve(PATHS.root, `dist-${mode}`);

  const runs = ['a', 'b'].map((label) => {
    console.log(`verify-determinism: build ${label} (mode=${mode})…`);
    execSync(`npm run build:${mode}`, {
      cwd: PATHS.root,
      stdio: 'pipe',
      env: { ...process.env, TZ: 'UTC', LC_ALL: 'C' },
    });
    const target = join(workspace, label);
    cpSync(buildDir, target, { recursive: true });
    return hashTree(target);
  });

  const [first, second] = runs;
  const differences: string[] = [];

  for (const [path, hash] of first) {
    const other = second.get(path);
    if (other === undefined) differences.push(`only in build a: ${path}`);
    else if (other !== hash) differences.push(`differs: ${path}`);
  }
  for (const path of second.keys()) {
    if (!first.has(path)) differences.push(`only in build b: ${path}`);
  }

  if (differences.length > 0) {
    console.error(`verify-determinism FAILED — ${differences.length} difference(s):`);
    for (const difference of differences.slice(0, 20)) console.error(`  - ${difference}`);
    process.exit(1);
  }

  rmSync(workspace, { recursive: true, force: true });
  console.log(`verify-determinism: OK — ${first.size} files byte-identical across two builds`);
}

function hashTree(root: string): Map<string, string> {
  const hashes = new Map<string, string>();
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      hashes.set(
        relative(root, full).split('\\').join('/'),
        createHash('sha256').update(readFileSync(full)).digest('hex'),
      );
    }
  };
  if (existsSync(root)) walk(root);
  return hashes;
}

main();
