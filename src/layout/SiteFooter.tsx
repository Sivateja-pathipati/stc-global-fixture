// ── React ──────────────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ── Custom ─────────────────────────────────────────────────────────────────────────────────
import Container from '@/ui/Container';
import { useLocale } from '@/contexts/LocaleContext';
import { APP_ROUTES } from '@/constants/routes';
import { BUILD_YEAR } from '@/constants/time';
import { HARDCODED_FOOTER_NOTE_DE } from '@/constants/labels/hardcoded';
import { D_DE_FOOTER_NOTE_HARDCODED } from '@/constants/generated/activeDefects';

export default function SiteFooter() {
  const { t } = useTranslation('common');
  const { localePath } = useLocale();

  return (
    <footer className="border-t border-[var(--rgt-border)] bg-[var(--rgt-surface)]">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[15px] font-semibold text-[var(--rgt-text-strong)]">
            {t('brand.name')}
          </p>
          <p className="mt-2 text-[13px] text-[var(--rgt-text-muted)]">{t('brand.tagline')}</p>
          <p className="mt-4 text-[12px] text-[var(--rgt-text-muted)]" data-rgt-id="footer-note">
            {/* Seeded: a German string written straight into the component, bypassing i18next
                entirely — so it stays German in every locale. The FE repo's own
                constants/labels convention is what makes this defect class realistic. */}
            {D_DE_FOOTER_NOTE_HARDCODED ? HARDCODED_FOOTER_NOTE_DE : t('footer.note')}
          </p>
        </div>

        <nav aria-label={t('footer.companyHeading')}>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[var(--rgt-text-muted)]">
            {t('footer.companyHeading')}
          </p>
          <ul className="space-y-2 text-[13px]">
            <li>
              <Link to={localePath(APP_ROUTES.about)}>{t('nav.about')}</Link>
            </li>
            <li>
              <Link to={localePath(APP_ROUTES.services)}>{t('nav.services')}</Link>
            </li>
            <li>
              <Link to={localePath(APP_ROUTES.contact)}>{t('nav.contact')}</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={t('footer.resourcesHeading')}>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[var(--rgt-text-muted)]">
            {t('footer.resourcesHeading')}
          </p>
          <ul className="space-y-2 text-[13px]">
            <li>
              <Link to={localePath(APP_ROUTES.blog)}>{t('nav.blog')}</Link>
            </li>
            <li>
              <Link to={localePath(APP_ROUTES.events)}>{t('nav.events')}</Link>
            </li>
            <li>
              <Link to={localePath(APP_ROUTES.pricing)}>{t('nav.pricing')}</Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[var(--rgt-text-muted)]">
            {t('footer.legalHeading')}
          </p>
          <ul className="space-y-2 text-[13px] text-[var(--rgt-text-muted)]">
            <li>{t('footer.privacy')}</li>
            <li>{t('footer.terms')}</li>
            <li>{t('footer.accessibility')}</li>
            <li>{t('footer.imprint')}</li>
          </ul>

          {/* Traps: 'Login' and 'Email' are established loanwords in German and normal usage
              in Hindi UI copy. They are identical to the English strings and correct, so an
              equality check against the source flags them and is wrong both times. */}
          <p className="mt-4 text-[13px] text-[var(--rgt-text-muted)]">
            <span data-rgt-id="footer-login">{t('labels.login')}</span>
            {' · '}
            <span data-rgt-id="footer-email">{t('labels.email')}</span>
          </p>
        </div>
      </Container>

      <Container className="border-t border-[var(--rgt-border)] py-5">
        <p className="text-[12px] text-[var(--rgt-text-muted)]">
          {/* Trap: the legal entity name and the version string must both survive untranslated.
              '1.000' is a release number, not a thousands-separated quantity. */}
          © {BUILD_YEAR} <span data-rgt-id="legal-entity">{t('footer.legalEntity')}</span>.{' '}
          {t('footer.rights')}{' '}
          <span data-rgt-id="platform-version">{t('footer.platformVersion')}</span>
        </p>
      </Container>
    </footer>
  );
}
