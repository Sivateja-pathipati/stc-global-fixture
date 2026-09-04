export interface FixtureSession {
  readonly displayName: string;
  readonly email: string;
  /** Frozen BUILD_NOW, never Date.now() — see docs/determinism.md. */
  readonly signedInAt: string;
}

export type SignInFailure = 'empty' | 'invalid';

export type SignInResult =
  | { readonly ok: true; readonly session: FixtureSession }
  | { readonly ok: false; readonly reason: SignInFailure };

export interface AuthContextValue {
  readonly session: FixtureSession | null;
  signIn(email: string, passcode: string): SignInResult;
  signOut(): void;
}
