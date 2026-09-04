/**
 * Strings deliberately hardcoded in components, bypassing i18next.
 *
 * This is the one thing `constants/labels/` is kept for in this fixture. The sibling FE repo
 * puts EVERY user-facing string in `as const` label objects with no i18n at all — so lifting
 * that convention here, and using it for exactly the strings that are meant to be a defect,
 * makes the hardcoded-string category realistic rather than contrived.
 *
 * Each of these renders only when its component flag is on, so the clean build never contains
 * them — proven by scripts/verify-clean.ts.
 */

/** German prose that stays German in en-US and hi-IN too. */
export const HARDCODED_FOOTER_NOTE_DE = 'Tätig in 14 Ländern weltweit.';

/** English hero copy that stays English in de-DE and hi-IN. */
export const HARDCODED_HERO_TITLE_EN = 'Ship software that works everywhere';

/** English CTA that stays English in every locale. */
export const HARDCODED_CONTACT_CTA_EN = 'Get in touch today';

/** English badge text on an otherwise Hindi page. */
export const HARDCODED_BADGE_EN = 'Most popular';
