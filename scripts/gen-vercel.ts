/**
 * Generates vercel.json from the locale set plus the manifest's responseHeader entries.
 *
 * vercel.json is a build artifact that must be COMMITTED: Vercel reads it from the repo root
 * before the build runs, so it cannot be produced by the build. CI re-runs this and fails if
 * the committed file differs, which keeps the transport defects derived from the manifest
 * rather than hand-maintained.
 *
 * Usage: npm run gen:vercel -- --mode=clean|seeded
 */
import { loadManifest } from './lib/manifest';
import { writeJson } from './lib/json';
import { PATHS, parseMode } from './lib/paths';
import { SUPPORTED_LOCALES } from '../src/constants/locales';

interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

function main(): void {
  const mode = parseMode(process.argv.slice(2));
  const manifest = loadManifest();

  const headers: HeaderRule[] = [
    {
      source: '/(.*)',
      headers: [
        // The detector hits clean and seeded in quick succession and must never compare a
        // cached shell against a fresh one.
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        { key: 'X-RGT-Fixture-Mode', value: mode },
      ],
    },
    // Per-locale Content-Language. Generated from the locale tuple, so a fourth locale needs
    // no edit here.
    ...SUPPORTED_LOCALES.map((locale) => ({
      source: `/${locale}/:path*`,
      headers: [{ key: 'Content-Language', value: locale }],
    })),
    ...SUPPORTED_LOCALES.map((locale) => ({
      source: `/${locale}`,
      headers: [{ key: 'Content-Language', value: locale }],
    })),
  ];

  // Seeded transport defects come LAST: Vercel applies every matching rule in order and a
  // later rule overwrites the same key, so these override the generic per-locale rules for
  // exactly the paths they name.
  if (mode === 'seeded') {
    for (const entry of manifest.entries) {
      if (entry.polarity !== 'defect' || entry.target.via !== 'responseHeader') continue;
      headers.push({
        source: entry.target.pathGlob,
        headers: [{ key: entry.target.header, value: entry.target.value }],
      });
    }
  }

  const config = {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    buildCommand: mode === 'seeded' ? 'npm run build:seeded' : 'npm run build:clean',
    // Must track package.json's build scripts: each mode writes to its own directory so
    // the two builds cannot overwrite each other.
    outputDirectory: `dist-${mode}`,
    installCommand: 'npm ci',
    framework: null,
    trailingSlash: false,
    // One rewrite per locale, written out rather than a path-to-regexp group: trivially
    // diffable and no group-syntax risk. Only ever reached for URLs the prerenderer did not
    // enumerate, since Vercel matches the filesystem first.
    rewrites: [
      ...SUPPORTED_LOCALES.map((locale) => ({
        source: `/${locale}/:path*`,
        destination: `/${locale}/index.html`,
      })),
      { source: '/:path*', destination: '/index.html' },
    ],
    headers,
  };

  writeJson(PATHS.vercelJson, config, { sort: false });
  console.log(`gen-vercel: mode=${mode}, ${headers.length} header rule(s)`);
}

main();
