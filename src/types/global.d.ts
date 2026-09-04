import type { FixtureMode } from './fixture';
import type { LocaleId } from './locale';
import type { RouteId } from './route';

/**
 * Stamped into every prerendered shell by scripts/prerender.ts.
 *
 * Two jobs: it lets the runtime build head URLs against the SAME origin the shell used (so the
 * hydrated head is byte-identical to the stamped one and a hydration mismatch can only ever be
 * a deliberate manifest entry), and it lets a detector harness confirm it reached the intended
 * prerendered shell rather than the SPA fallback.
 */
export interface RgtShellInfo {
  readonly locale: LocaleId;
  readonly routeId: RouteId;
  readonly mode: FixtureMode;
  readonly origin: string;
}

declare global {
  interface Window {
    __RGT_SHELL__?: RgtShellInfo;
  }
}

export {};
