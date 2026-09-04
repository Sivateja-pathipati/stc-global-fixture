import type { TransformCodec } from '../../src/types/fixture';

/**
 * Real transforms, not typed-out approximations.
 *
 * This matters: a hand-written "Ã¤" in the manifest is a guess at what a broken pipeline
 * produces. Round-tripping the bytes produces exactly what one actually produces, so the
 * fixture reproduces the real defect rather than a plausible-looking imitation of it.
 */
export function applyCodec(value: string, codec: TransformCodec, arg?: string): string {
  switch (codec) {
    // UTF-8 bytes decoded as Windows-1252 — the classic "Qualität" -> "QualitÃ¤t" pipeline bug.
    case 'utf8-as-cp1252':
      return Buffer.from(value, 'utf8').toString('latin1');

    // Canonically decomposed. Visually identical, byte-different — a recall probe for
    // detectors that compare strings naively.
    case 'nfd':
      return value.normalize('NFD');

    // Decompose, then drop the combining marks: "München" -> "Munchen".
    case 'strip-diacritics':
      return value.normalize('NFD').replace(/[̀-ͯ]/g, '');

    case 'truncate': {
      const limit = Number(arg ?? 40);
      if (!Number.isFinite(limit) || limit <= 0) {
        throw new Error(`codec 'truncate' needs a positive numeric arg, got '${arg}'`);
      }
      return value.length <= limit ? value : `${value.slice(0, limit).trimEnd()}…`;
    }

    // Removes an i18next interpolation so the rendered sentence silently loses its value.
    case 'strip-placeholder':
      return value
        .replace(/\{\{\s*[\w.]+\s*\}\}/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

    // U+200E LEFT-TO-RIGHT MARK. Invisible in a screenshot, present in the DOM — catches
    // detectors that only ever look at rendered pixels.
    case 'inject-control-char': {
      const at = value.indexOf(' ');
      const index = at === -1 ? value.length : at;
      return `${value.slice(0, index)}‎${value.slice(index)}`;
    }

    // U+FEFF at the head of a string — what a UTF-8-with-BOM resource file yields once its
    // first value is parsed. Invisible everywhere, but it makes the string unequal to its own
    // literal on the very first character, so lookups and equality checks fail silently.
    // Written as an escape on purpose: a literal U+FEFF here would be invisible in every
    // editor and diff, so the one place the fixture defines this defect would be unreadable.
    case 'inject-bom':
      return `\uFEFF${value}`;

    default: {
      const exhaustive: never = codec;
      throw new Error(`Unknown codec: ${String(exhaustive)}`);
    }
  }
}
