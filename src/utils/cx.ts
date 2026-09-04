/**
 * Joins class names, dropping falsy entries. Exists so a defect flag can be inlined as
 * `cx('base', FLAG && 'defect-only-classes')` and constant-fold away in the clean build.
 */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
