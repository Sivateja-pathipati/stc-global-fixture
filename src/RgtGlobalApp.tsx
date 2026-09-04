import AuthProvider from '@/contexts/AuthProvider';
import AppRoutes from '@/router/routes';
import '@/services/i18n.service';

/** Providers that sit above routing. LocaleProvider is per-route — see LocaleShell. */
export default function RgtGlobalApp() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
