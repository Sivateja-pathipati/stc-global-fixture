import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Button from '@/ui/Button';
import { useLocale } from '@/contexts/LocaleContext';
import { APP_ROUTES } from '@/constants/routes';

/** Reachable at /{locale}/500. Served with HTTP 200 — see NotFoundPage for why. */
export default function ServerErrorPage() {
  const { t } = useTranslation('errors');
  const { localePath } = useLocale();

  return (
    <Container className="py-24 text-center" as="section">
      <p className="text-[64px] font-bold leading-none text-[var(--rgt-border-strong)]">
        {t('serverError.code')}
      </p>
      <h1 className="mt-4 text-2xl font-semibold" data-rgt-id="server-error-title">
        {t('serverError.title')}
      </h1>
      <p className="mx-auto mt-3 max-w-[52ch] text-[15px] text-[var(--rgt-text-muted)]">
        {t('serverError.body')}
      </p>
      <Link to={localePath(APP_ROUTES.home)} className="mt-8 inline-block">
        <Button>{t('serverError.action')}</Button>
      </Link>
    </Container>
  );
}
