import { createContext, useContext } from 'react';
import type { LocaleAlternate, LocaleId, LocaleSource, TextDirection } from '@/types/locale';

/**
 * Split from LocaleProvider.tsx so this module exports no component. Mixing a component and
 * non-component exports in one file breaks Vite's fast refresh for both — the same reason the
 * sibling FE repo splits JobContext.ts from JobProvider.tsx.
 */
export interface LocaleContextValue {
  readonly locale: LocaleId;
  readonly dir: TextDirection;
  readonly source: LocaleSource;
  /** '/about' -> '/de-DE/about'. Every Link in the app goes through this. */
  localePath(path: string): string;
  /** Same page, different locale. */
  switchLocale(next: LocaleId): void;
  /** Locale-tagged alternates for the current page, sorted. */
  readonly alternates: readonly LocaleAlternate[];
}

export const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider.');
  return ctx;
}
