/**
 * Bans physical direction utilities in className strings.
 *
 * Crude, cheap, and it actually holds the line: adding an RTL locale later is a content folder
 * plus one entry in LOCALE_DIR only if nothing in the tree hardcodes left/right. Tailwind's
 * logical utilities (ms-/me-/ps-/pe-/text-start/text-end/start-/end-) emit
 * margin-inline-start and friends, which mirror automatically.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { PATHS } from './lib/paths';

const BANNED =
  /\b(ml-|mr-|pl-|pr-|text-left|text-right|left-|right-|border-l-|border-r-|rounded-l-|rounded-r-)/;

function main(): void {
  const problems: string[] = [];
  const src = join(PATHS.root, 'src');

  const walk = (dir: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === 'generated') continue;
        walk(full);
        continue;
      }
      if (!['.ts', '.tsx'].includes(extname(name))) continue;

      const lines = readFileSync(full, 'utf8').split('\n');
      lines.forEach((line, index) => {
        if (!/className|cx\(|'[^']*-\d/.test(line)) return;
        const match = BANNED.exec(line);
        if (match) {
          problems.push(
            `${relative(PATHS.root, full)}:${index + 1} uses '${match[1]}' — use the logical equivalent (ms-/me-/ps-/pe-/text-start/text-end/start-/end-)`,
          );
        }
      });
    }
  };

  walk(src);

  if (problems.length > 0) {
    console.error(
      `verify-rtl-ready FAILED — ${problems.length} physical direction utility/utilities:`,
    );
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  console.log('verify-rtl-ready: OK — no physical direction utilities in src/');
}

main();
