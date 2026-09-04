import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Button from '@/ui/Button';
import { useLocale } from '@/contexts/LocaleContext';
import { APP_ROUTES } from '@/constants/routes';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { B_UNLOCALIZED_NOT_FOUND } from '@/constants/generated/activeDefects';

/**
 * Note the status code: Vercel serves this with HTTP 200, because `routes` and `rewrites` are
 * mutually exclusive in vercel.json and the transport defects need `headers`. Documented as a
 * known non-testable in the README — what matters here is the localization of the error page.
 */
export default function NotFoundPage() {
  // Seeded: force the default locale's copy regardless of the URL, so a German 404 renders in
  // English — one of the most commonly missed surfaces in a localization sweep.
  const { t } = useTranslation('errors', {
    lng: B_UNLOCALIZED_NOT_FOUND ? DEFAULT_LOCALE : undefined,
  });
  const { localePath } = useLocale();

  return (
    <Container className="py-24 text-center" as="section">
      <p className="text-[64px] font-bold leading-none text-[var(--rgt-border-strong)]">
        {t('notFound.code')}
      </p>
      <h1 className="mt-4 text-2xl font-semibold" data-rgt-id="not-found-title">
        {t('notFound.title')}
      </h1>
      <p className="mx-auto mt-3 max-w-[52ch] text-[15px] text-[var(--rgt-text-muted)]">
        {t('notFound.body')}
      </p>
      <Link to={localePath(APP_ROUTES.home)} className="mt-8 inline-block">
        <Button>{t('notFound.action')}</Button>
      </Link>
    </Container>
  );
}
