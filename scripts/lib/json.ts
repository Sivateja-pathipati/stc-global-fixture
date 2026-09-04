import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Recursively sorts object keys with a byte comparator.
 *
 * Byte comparison rather than localeCompare: localeCompare consults ICU, which is exactly the
 * cross-version variance this fixture exists to avoid. Arrays keep their authored order —
 * ordering there is content, not incidental.
 */
export function sortKeys<T>(value: T): T {
  if (Array.isArray(value)) return value.map(sortKeys) as unknown as T;
  if (value === null || typeof value !== 'object') return value;

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  const out: Record<string, unknown> = {};
  for (const [key, item] of entries) out[key] = sortKeys(item);
  return out as unknown as T;
}

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

/** Two-space indent, LF only, trailing newline — matches Prettier so checks stay green. */
export function writeText(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const normalized = contents.replace(/\r\n/g, '\n');
  writeFileSync(path, normalized.endsWith('\n') ? normalized : `${normalized}\n`, 'utf8');
}

export function writeJson(path: string, value: unknown, { sort = true } = {}): void {
  writeText(path, JSON.stringify(sort ? sortKeys(value) : value, null, 2));
}

/** Deep-set a dotted path, e.g. 'home.hero.title'. Throws if the path does not exist. */
export function setAtPath(root: Record<string, unknown>, path: string, next: string): void {
  const parts = path.split('.');
  let cursor: Record<string, unknown> = root;
  for (const part of parts.slice(0, -1)) {
    const child = cursor[part];
    if (child === undefined || typeof child !== 'object' || child === null) {
      throw new Error(`setAtPath: '${path}' does not exist (stopped at '${part}')`);
    }
    cursor = child as Record<string, unknown>;
  }
  const leaf = parts[parts.length - 1];
  if (!(leaf in cursor)) throw new Error(`setAtPath: '${path}' does not exist (no leaf '${leaf}')`);
  cursor[leaf] = next;
}

export function getAtPath(root: Record<string, unknown>, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (acc === undefined || acc === null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[part];
  }, root);
  if (typeof value !== 'string') throw new Error(`getAtPath: '${path}' is not a string`);
  return value;
}

export function deleteAtPath(root: Record<string, unknown>, path: string): void {
  const parts = path.split('.');
  let cursor: Record<string, unknown> = root;
  for (const part of parts.slice(0, -1)) {
    const child = cursor[part];
    if (child === undefined || typeof child !== 'object' || child === null) {
      throw new Error(`deleteAtPath: '${path}' does not exist (stopped at '${part}')`);
    }
    cursor = child as Record<string, unknown>;
  }
  const leaf = parts[parts.length - 1];
  if (!(leaf in cursor)) throw new Error(`deleteAtPath: '${path}' does not exist`);
  delete cursor[leaf];
}
