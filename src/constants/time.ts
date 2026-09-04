/**
 * The fixture's frozen "now".
 *
 * Hand-pinned, never generated. A generated timestamp would defeat the entire point: two
 * builds a minute apart would differ, and byte-identical output is what makes this fixture
 * usable for build-over-build diffing.
 *
 * Every displayed date and time in the site is a pre-formatted literal in content/data/*.json
 * rather than something derived from this at render time — see docs/determinism.md for why
 * runtime Intl is banned. This constant exists for the few places that need a timestamp value
 * (the fake session record, dist/__fixture.json) rather than a display string.
 */
export const BUILD_NOW = '2026-03-17T09:30:00.000Z';

/** Matches BUILD_NOW. Used where a year is displayed as chrome, e.g. the footer copyright. */
export const BUILD_YEAR = '2026';
