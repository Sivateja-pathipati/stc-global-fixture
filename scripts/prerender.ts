/**
 * Stamps one static HTML shell per locale × route on top of Vite's single index.html.
 *
 * Runs as the last build step. Vercel checks the filesystem before applying rewrites, so a
 * request to /de-DE/about serves dist/de-DE/about/index.html directly and the SPA fallback
 * never fires — the two mechanisms partition the URL space rather than competing.
 *
 * The head content comes from computeHead(), the SAME function the running app uses. That is
 * the guarantee that a detector reading raw HTML and a detector driving a browser see the same
 * head; reimplementing the logic here would let the two drift and invent phantom defects.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { writeText, writeJson } from './lib/json';
import { loadManifest } from './lib/manifest';
import { PATHS, parseMode, parseOutDir } from './lib/paths';
import { enumerateShells } from './lib/enumerate';
import { computeHead, computeRootHead } from '../src/services/head.service';
import { toHeadTags, renderHeadTag } from '../src/mappers/head.mapper';
import { SITE_CONFIG } from '../src/services/content.service';
import { createHash } from 'node:crypto';
import type { HeadModel } from '../src/types/head';

function main(): void {
  const mode = parseMode(process.argv.slice(2));
  const dist = parseOutDir(process.argv.slice(2));
  const origin = mode === 'seeded' ? SITE_CONFIG.origins.seeded : SITE_CONFIG.origins.clean;
  const manifest = loadManifest();
  const bomShells = mode === 'seeded' ? shellsWithBom(manifest.entries) : new Set<string>();

  const templatePath = resolve(dist, 'index.html');
  if (!existsSync(templatePath)) {
    throw new Error(`${dist}/index.html is missing — run \`vite build\` before prerendering.`);
  }
  const template = readFileSync(templatePath, 'utf8');
  const assetTags = extractAssetTags(template);
  const bodyHtml = extractBody(template);

  const shells = enumerateShells();

  for (const shell of shells) {
    const head = computeHead(shell.locale, shell.routeId, shell.params, origin);
    const html = renderShell({
      head,
      assetTags,
      bodyHtml,
      shellInfo: { locale: shell.locale, routeId: shell.routeId, mode, origin },
    });
    const outDir = shell.path === '/' ? shell.locale : `${shell.locale}${shell.path}`;
    const target = resolve(dist, outDir, 'index.html');
    // writeText normalises and appends a newline, which is what every other shell wants. A BOM
    // shell has to bypass it: the marker must be the first bytes of the file, before the
    // doctype, and that is a property of the encoding rather than of the content.
    if (bomShells.has(`${shell.locale}|${shell.routeId}`)) {
      writeShellWithBom(target, html);
      continue;
    }
    writeText(target, html);
  }

  // The root gate shell. It only redirects, so it must not be indexed.
  const rootHead = computeRootHead(origin);
  writeText(
    templatePath,
    renderShell({
      head: rootHead,
      assetTags,
      bodyHtml,
      shellInfo: { locale: 'en-US', routeId: 'home', mode, origin },
    }),
  );

  applyAssetSwaps(manifest.entries, dist);

  const manifestSha = createHash('sha256')
    .update(readFileSync(PATHS.manifest, 'utf8'))
    .digest('hex');

  writeJson(
    resolve(dist, '__fixture.json'),
    {
      mode,
      fixtureVersion: manifest.version,
      manifestSha256: manifestSha,
      entryCount: manifest.entries.length,
      defectCount: manifest.entries.filter((e) => e.polarity === 'defect').length,
      trapCount: manifest.entries.filter((e) => e.polarity === 'trap').length,
      shellCount: shells.length + 1,
      origin,
    },
    { sort: false },
  );

  const bomNote = bomShells.size > 0 ? `, ${bomShells.size} with a BOM` : '';
  console.log(
    `prerender: mode=${mode}, wrote ${shells.length + 1} shell(s)${bomNote} into ${dist} against ${origin}`,
  );
}

/** '<locale>|<routeId>' for each shell the manifest says must be served UTF-8-with-BOM. */
function shellsWithBom(entries: ReturnType<typeof loadManifest>['entries']): Set<string> {
  const keys = new Set<string>();
  for (const entry of entries) {
    if (entry.polarity !== 'defect' || entry.target.via !== 'shellByteOrderMark') continue;
    keys.add(`${entry.locale}|${entry.routeId}`);
  }
  return keys;
}

function writeShellWithBom(path: string, html: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const normalized = html.replace(/\r\n/g, '\n');
  const body = normalized.endsWith('\n') ? normalized : `${normalized}\n`;
  writeFileSync(path, `\uFEFF${body}`, 'utf8');
}

interface RenderArgs {
  head: HeadModel;
  assetTags: string;
  bodyHtml: string;
  shellInfo: { locale: string; routeId: string; mode: string; origin: string };
}

function renderShell({ head, assetTags, bodyHtml, shellInfo }: RenderArgs): string {
  const tags = toHeadTags(head).map(renderHeadTag).join('\n    ');

  // Font preloads are not decoration. Without them font-display:swap produces a flash whose
  // timing varies run to run, and any screenshot-diffing detector goes flaky.
  const preloads = '';

  return `<!doctype html>
<html lang="${head.htmlLang}" dir="${head.dir}">
  <head>
    ${tags}${preloads}
    ${assetTags}
    <script>window.__RGT_SHELL__=${JSON.stringify(shellInfo)};</script>
  </head>
  ${bodyHtml}
</html>
`;
}

/** The <script>/<link rel="stylesheet"> tags Vite injected. Copied through unchanged. */
function extractAssetTags(template: string): string {
  const head = template.slice(template.indexOf('<head>'), template.indexOf('</head>'));
  const matches = head.match(
    /<script[^>]*src="[^"]*"[^>]*><\/script>|<link[^>]*rel="stylesheet"[^>]*>/g,
  );
  return (matches ?? []).join('\n    ');
}

function extractBody(template: string): string {
  const start = template.indexOf('<body>');
  const end = template.indexOf('</body>');
  if (start === -1 || end === -1) throw new Error('Template has no <body>.');
  return template.slice(start, end + '</body>'.length);
}

/** Text baked into pixels cannot be a string patch — it is a file copy. */
function applyAssetSwaps(entries: ReturnType<typeof loadManifest>['entries'], dist: string): void {
  for (const entry of entries) {
    if (entry.polarity !== 'defect' || entry.target.via !== 'assetSwap') continue;
    const from = resolve(PATHS.public, entry.target.replacementPath.replace(/^\//, ''));
    const to = resolve(dist, entry.target.publicPath.replace(/^\//, ''));
    if (!existsSync(from)) throw new Error(`${entry.id}: replacement asset ${from} is missing`);
    copyFileSync(from, to);
  }
}

main();
