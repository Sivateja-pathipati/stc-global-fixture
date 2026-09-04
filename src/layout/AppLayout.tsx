import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteHeader from '@/layout/SiteHeader';
import SiteFooter from '@/layout/SiteFooter';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import { parseLocation } from '@/utils/routeMatch';

export default function AppLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation('common');
  const { pathLocale, routeId, params } = parseLocation(pathname);

  // The PATH locale, deliberately — not the rendered content locale. When a defect makes the
  // two disagree, <html lang> keeps reporting what the URL claims while the body renders
  // something else, which is exactly the shape of the real-world bug.
  useDocumentHead(pathLocale, routeId, params);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--rgt-bg-page)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--rgt-surface)] focus:px-3 focus:py-2"
      >
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />
      <main id="main" className="flex-1 pb-16">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
