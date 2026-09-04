import { useCallback, useMemo, useState } from 'react';
import { clearSession, persistSession, readSession, signIn } from '@/services/auth.service';
import { AuthContext } from '@/contexts/AuthContext';
import type { AuthContextValue, FixtureSession, SignInResult } from '@/types/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // Lazy initialiser rather than an effect: the session is known synchronously, so reading it
  // in an effect would render one signed-out frame that a screenshot could catch.
  const [session, setSession] = useState<FixtureSession | null>(() => readSession());

  const handleSignIn = useCallback((email: string, passcode: string): SignInResult => {
    const result = signIn(email, passcode);
    if (result.ok) {
      persistSession(result.session);
      setSession(result.session);
    }
    return result;
  }, []);

  const handleSignOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, signIn: handleSignIn, signOut: handleSignOut }),
    [session, handleSignIn, handleSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
