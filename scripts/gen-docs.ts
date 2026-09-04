/** Renders the manifest as a human-readable catalogue. Generated — never hand-edited. */
import { resolve } from 'node:path';
import { loadManifest } from './lib/manifest';
import { writeText } from './lib/json';
import { PATHS } from './lib/paths';
import { SUPPORTED_LOCALES } from '../src/constants/locales';
import type { FixtureEntry } from '../src/types/fixture';

function main(): void {
  const { entries, version } = loadManifest();
  const lines: string[] = [
    '# Defect catalogue',
    '',
    `Generated from \`fixtures/manifest.json\` v${version} by \`npm run gen:docs\`. Do not edit by hand.`,
    '',
    `**${entries.filter((e) => e.polarity === 'defect').length} defects · ${entries.filter((e) => e.polarity === 'trap').length} traps**`,
    '',
  ];

  for (const locale of SUPPORTED_LOCALES) {
    const mine = entries.filter((e) => e.locale === locale);
    lines.push(`## ${locale}`, '');

    lines.push('### Defects', '');
    lines.push('| ID | Kind | Route | Severity | Expected | Actual |');
    lines.push('|---|---|---|---|---|---|');
    for (const entry of mine.filter((e) => e.polarity === 'defect')) lines.push(row(entry));
    lines.push('');

    lines.push('### Traps — these must NOT be flagged', '');
    lines.push('| ID | Kind | Route | Value | Why flagging it is a false positive |');
    lines.push('|---|---|---|---|---|');
    for (const entry of mine.filter((e) => e.polarity === 'trap')) {
      lines.push(
        `| \`${entry.id}\` | ${entry.kind} | ${route(entry)} | ${cell(entry.expected)} | ${cell(entry.rationale)} |`,
      );
    }
    lines.push('');
  }

  writeText(resolve(PATHS.docs, 'defect-catalogue.md'), lines.join('\n'));
  console.log(`gen-docs: wrote docs/defect-catalogue.md (${entries.length} entries)`);
}

function row(entry: FixtureEntry): string {
  return `| \`${entry.id}\` | ${entry.kind} | ${route(entry)} | ${entry.severity} | ${cell(entry.expected)} | ${cell(entry.actual)} |`;
}

function route(entry: FixtureEntry): string {
  return entry.routeParams?.slug ? `${entry.routeId} (${entry.routeParams.slug})` : entry.routeId;
}

function cell(value: string): string {
  const trimmed = value.length > 90 ? `${value.slice(0, 90)}…` : value;
  return trimmed.replace(/\|/g, '\\|').replace(/\n/g, ' ') || '_(empty)_';
}

main();
