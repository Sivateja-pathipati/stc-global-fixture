/**
 * A local preview server that routes the way Vercel does.
 *
 * This exists because the obvious alternatives both misrepresent production, in opposite
 * directions, and each one hides real defects:
 *
 *   `npx serve dist`     — no SPA fallback at all, so /about and /?lang=de-DE 404 instead of
 *                          reaching the locale gate.
 *   `npx serve -s dist`  — rewrites EVERYTHING to the root index.html, so every prerendered
 *                          shell is masked and every head-level defect silently disappears.
 *
 * Vercel checks the filesystem FIRST and only then applies rewrites. That order is the whole
 * reason shells and the SPA fallback can coexist, so a preview server that gets it wrong will
 * have you chasing defects that are not there.
 *
 * Usage: npx tsx scripts/serve-local.ts dist-seeded 4400
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { SUPPORTED_LOCALES } from '../src/constants/locales';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function main(): void {
  const root = resolve(process.argv[2] ?? 'dist');
  const port = Number(process.argv[3] ?? 4400);

  if (!existsSync(root)) throw new Error(`No build at ${root}`);

  createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);

    const file = resolveFile(root, pathname);
    if (!file) {
      res.writeHead(404).end('Not found');
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    };

    // Mirrors the per-locale Content-Language rules gen-vercel.ts emits. The seeded
    // per-route header overrides are NOT replicated here — those are Vercel config, and
    // checking them needs the real deployment.
    const localeSegment = pathname.split('/').filter(Boolean)[0];
    if ((SUPPORTED_LOCALES as readonly string[]).includes(localeSegment ?? '')) {
      headers['Content-Language'] = localeSegment;
    }

    res.writeHead(200, headers);
    createReadStream(file).pipe(res);
  }).listen(port, () => {
    console.log(
      `serve-local: ${root} on http://localhost:${port} (filesystem first, then SPA fallback)`,
    );
  });
}

function resolveFile(root: string, pathname: string): string | null {
  const candidates = [
    join(root, pathname),
    join(root, pathname, 'index.html'),
    // Fallback order matches vercel.json: the locale's own shell, then the root gate.
    ...localeFallback(root, pathname),
    join(root, 'index.html'),
  ];

  for (const candidate of candidates) {
    if (!candidate.startsWith(root)) continue; // no traversal outside the build
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function localeFallback(root: string, pathname: string): string[] {
  const first = pathname.split('/').filter(Boolean)[0];
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(first ?? '')) return [];
  return [join(root, first, 'index.html')];
}

main();
