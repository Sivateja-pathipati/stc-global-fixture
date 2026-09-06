import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';
import SectionHeading from '@/ui/SectionHeading';
import PlanTable from './PlanTable';
import { useLocale } from '@/contexts/LocaleContext';

export default function PricingPage() {
  const { t } = useTranslation('pricing');
  const { locale } = useLocale();

  return (
    <>
      <section className="border-b border-[var(--rgt-border)] bg-[var(--rgt-surface)] py-16">
        <Container>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--rgt-accent)]">
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-3 max-w-[26ch] text-3xl font-semibold sm:text-4xl">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[16px] text-[var(--rgt-text-muted)]">
            {t('hero.lead')}
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <PlanTable locale={locale} />
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <SectionHeading title={t('notes.heading')} />
          <Card testId="pricing-notes">
            <ul className="space-y-2 text-sm text-[var(--rgt-text-muted)]">
              <li data-rgt-id="pricing-note-vat">{t('notes.vat')}</li>
              <li data-rgt-id="pricing-note-annual">{t('notes.annualDiscount')}</li>
              <li data-rgt-id="pricing-note-overage">{t('notes.seatOverage')}</li>
              {/* Trap: the product code is shaped exactly like a date. A format checker that
                  reads it as one and complains about DD/MM vs MM/DD is a false positive. */}
              <li data-rgt-id="pricing-product-code">{t('notes.productCode')}</li>
            </ul>
          </Card>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <SectionHeading title={t('seats.heading')} />
          <Card testId="pricing-seats">
            <ul className="space-y-2 text-sm text-[var(--rgt-text-muted)]">
              <li data-rgt-id="pricing-seats-one">{t('seats.oneSeat')}</li>
              <li data-rgt-id="pricing-seats-many">{t('seats.manySeats')}</li>
              <li data-rgt-id="pricing-seats-project-label">{t('seats.projectLabel')}</li>
              {/* Trap: '1 seat' is the pricing UNIT, not a count that disagrees with its noun. */}
              <li data-rgt-id="pricing-seats-per-seat">{t('seats.perSeatHeader')}</li>
              {/* Trap: a deliberate second currency for a real US billing entity. Reporting the
                  presence of a foreign currency - rather than a wrong symbol position for the
                  locale's OWN currency - is a false positive. */}
              <li data-rgt-id="pricing-seats-usd">{t('seats.foreignCurrencyNote')}</li>
              {/* Trap: a genuine US postal address in a global remittance note. */}
              <li data-rgt-id="pricing-seats-remittance">{t('seats.usRemittance')}</li>
            </ul>
          </Card>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <Card className="bg-[var(--rgt-surface-alt)]">
            <h2 className="text-lg font-semibold text-[var(--rgt-text-strong)]">
              {t('cta.title')}
            </h2>
            <p className="mt-1 max-w-[56ch] text-sm text-[var(--rgt-text-muted)]">
              {t('cta.body')}
            </p>
          </Card>
        </Container>
      </section>
    </>
  );
}
