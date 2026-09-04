// ── React ──────────────────────────────────────────────────────────────────────────────────
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ── Custom ─────────────────────────────────────────────────────────────────────────────────
import Container from '@/ui/Container';
import Button from '@/ui/Button';
import LocaleSwitcher from '@/layout/LocaleSwitcher';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { APP_ROUTES, NAV_ROUTE_IDS } from '@/constants/routes';
import { D_DE_NAV_ITEM_CLIPPED } from '@/constants/generated/activeDefects';
import { cx } from '@/utils/cx';

export default function SiteHeader() {
  const { t } = useTranslation('common');
  const { localePath } = useLocale();
  const { session, signOut } = useAuth();

  return (
    <header className="border-b border-[var(--rgt-border)] bg-[var(--rgt-surface)]">
      <Container className="flex h-16 items-center gap-6">
        <NavLink to={localePath(APP_ROUTES.home)} className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="inline-block h-6 w-6 rounded bg-[var(--rgt-accent)]"
            data-rgt-id="brand-mark"
          />
          <span className="text-[15px] text-[var(--rgt-text-strong)]">{t('brand.name')}</span>
        </NavLink>

        <nav
          aria-label={t('nav.primaryLabel')}
          data-rgt-id="primary-nav"
          className="hidden flex-1 items-center gap-1 lg:flex"
        >
          {NAV_ROUTE_IDS.map((routeId) => (
            <NavLink
              key={routeId}
              to={localePath(APP_ROUTES[routeId])}
              end={routeId === 'home'}
              data-rgt-id={`nav-${routeId}`}
              className={({ isActive }) =>
                cx(
                  'rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                  // Seeded: a fixed width plus overflow:hidden. Fine for English, clips the
                  // longer German labels — the classic expansion defect, invisible until the
                  // locale changes.
                  D_DE_NAV_ITEM_CLIPPED && 'block max-w-[6.5rem] overflow-hidden whitespace-nowrap',
                  isActive
                    ? 'bg-[var(--rgt-surface-alt)] text-[var(--rgt-text-strong)]'
                    : 'text-[var(--rgt-text-muted)] hover:text-[var(--rgt-text-strong)]',
                )
              }
            >
              {t(`nav.${routeId}`)}
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-3">
          <LocaleSwitcher />
          {session ? (
            <Button variant="secondary" size="sm" data-rgt-id="header-auth" onClick={signOut}>
              {t('actions.signOut')}
            </Button>
          ) : (
            <NavLink to={localePath(APP_ROUTES.login)}>
              <Button variant="secondary" size="sm" data-rgt-id="header-auth">
                {t('actions.signIn')}
              </Button>
            </NavLink>
          )}
        </div>
      </Container>
    </header>
  );
}
