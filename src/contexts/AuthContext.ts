import { createContext, useContext } from 'react';
import type { AuthContextValue } from '@/types/auth';

/** Split from AuthProvider.tsx so this module exports no component — see LocaleContext.ts. */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider.');
  return ctx;
}
