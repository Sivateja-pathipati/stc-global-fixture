/**
 * Fake credentials for the members-only page. There is no backend, no token and no real
 * identity — the demo address uses the RFC 2606 reserved `.example` TLD so it can never
 * resolve to a real mailbox, and the passcode is obviously a fixture artefact.
 *
 * These are published in the README on purpose: the detector needs them to reach /account.
 */
export const DEMO_EMAIL = 'demo@rgtglobal.example';
export const DEMO_PASSCODE = 'fixture-demo';
export const DEMO_DISPLAY_NAME = 'Demo Visitor';

/**
 * sessionStorage, not localStorage: it clears on tab close so repeated detector runs cannot
 * leak state into one another, and it is per-tab so parallel runs do not interfere.
 */
export const SESSION_STORAGE_KEY = 'rgt_fixture_session';
