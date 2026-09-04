import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';
import Button from '@/ui/Button';
import SectionHeading from '@/ui/SectionHeading';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { ACCOUNT_SNAPSHOT } from '@/constants/account';

/**
 * Members-only. Reached only through RequireAuth, but /account still gets a prerendered shell
 * with correct head and lang — so the head-level ground truth for this route is testable
 * without authenticating at all.
 */
export default function AccountPage() {
  const { t } = useTranslation('auth');
  const { session, signOut } = useAuth();
  const { locale } = useLocale();
  const snapshot = ACCOUNT_SNAPSHOT[locale];

  const profileRows = [
    { key: 'name', label: t('account.nameLabel'), value: session?.displayName ?? '' },
    { key: 'email', label: t('account.emailLabel'), value: session?.email ?? '' },
    { key: 'plan', label: t('account.planLabel'), value: snapshot.plan },
    { key: 'seats', label: t('account.seatsLabel'), value: snapshot.seats },
    { key: 'renewal', label: t('account.renewalLabel'), value: snapshot.renewal },
  ];

  const invoiceRows = [
    {
      key: 'invoice-number',
      label: t('account.invoiceNumberLabel'),
      value: snapshot.invoiceNumber,
    },
    {
      key: 'invoice-amount',
      label: t('account.invoiceAmountLabel'),
      value: snapshot.invoiceAmount,
    },
    { key: 'invoice-date', label: t('account.invoiceDateLabel'), value: snapshot.invoiceDate },
  ];

  return (
    <Container className="py-16" as="section">
      <h1 className="text-2xl font-semibold" data-rgt-id="account-title">
        {t('account.title')}
      </h1>
      <p className="mt-2 text-sm text-[var(--rgt-text-muted)]">
        {t('account.welcome')}, {session?.displayName}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card testId="account-profile">
          <SectionHeading title={t('account.profileHeading')} />
          <dl className="grid gap-3 text-sm">
            {profileRows.map((row) => (
              <div key={row.key} className="flex justify-between gap-4">
                <dt className="text-[var(--rgt-text-muted)]">{row.label}</dt>
                <dd className="font-semibold" data-rgt-id={`account-${row.key}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card testId="account-invoice">
          <SectionHeading title={t('account.invoiceHeading')} />
          <dl className="grid gap-3 text-sm">
            {invoiceRows.map((row) => (
              <div key={row.key} className="flex justify-between gap-4">
                <dt className="text-[var(--rgt-text-muted)]">{row.label}</dt>
                <dd className="font-semibold" data-rgt-id={`account-${row.key}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Button variant="secondary" className="mt-8" data-rgt-id="account-signout" onClick={signOut}>
        {t('account.signOut')}
      </Button>
    </Container>
  );
}
