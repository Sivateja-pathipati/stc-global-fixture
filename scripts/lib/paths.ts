import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

export const ROOT = resolve(here, '..', '..');

export const PATHS = {
  root: ROOT,
  content: resolve(ROOT, 'content'),
  locales: resolve(ROOT, 'content', 'locales'),
  siteData: resolve(ROOT, 'content', 'data', 'site-data.json'),
  siteConfig: resolve(ROOT, 'content', 'site.config.json'),
  headContent: resolve(ROOT, 'content', 'head', 'head.json'),
  manifest: resolve(ROOT, 'fixtures', 'manifest.json'),
  issueTypeMap: resolve(ROOT, 'fixtures', 'issue-type-map.json'),
  generated: resolve(ROOT, 'src', 'constants', 'generated'),
  dist: resolve(ROOT, 'dist'),
  public: resolve(ROOT, 'public'),
  vercelJson: resolve(ROOT, 'vercel.json'),
  docs: resolve(ROOT, 'docs'),
} as const;

export function parseMode(argv: readonly string[]): 'clean' | 'seeded' {
  const flag = argv.find((a) => a.startsWith('--mode='));
  const value = flag?.split('=')[1];
  if (value === 'clean' || value === 'seeded') return value;
  throw new Error('Pass --mode=clean or --mode=seeded');
}

/**
 * Where a build lives. The two builds write to dist-clean/ and dist-seeded/ rather than both
 * to dist/, because the alternative was a manual `mv dist dist-clean` between them — and
 * forgetting it silently destroyed the first build with no warning at all.
 */
export function parseOutDir(argv: readonly string[]): string {
  const flag = argv.find((a) => a.startsWith('--out='));
  const value = flag?.split('=')[1];
  return resolve(ROOT, value && value.length > 0 ? value : 'dist');
}
