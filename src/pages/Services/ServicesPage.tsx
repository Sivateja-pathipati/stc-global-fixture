import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';
import Button from '@/ui/Button';
import SectionHeading from '@/ui/SectionHeading';
import { cx } from '@/utils/cx';
import { D_DE_SERVICES_CTA_CLIPPED } from '@/constants/generated/activeDefects';

const PRACTICES = ['platform', 'data', 'modernisation'] as const;
const STEPS = ['step1', 'step2', 'step3'] as const;

export default function ServicesPage() {
  const { t } = useTranslation('services');

  return (
    <>
      <section className="border-b border-[var(--rgt-border)] bg-[var(--rgt-surface)] py-16">
        <Container>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--rgt-accent)]">
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-3 max-w-[28ch] text-3xl font-semibold sm:text-4xl">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[16px] text-[var(--rgt-text-muted)]">
            {t('hero.lead')}
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <div className="grid gap-4 lg:grid-cols-3">
            {PRACTICES.map((practice) => (
              <Card key={practice} testId={`service-${practice}`} className="flex flex-col">
                <h2 className="text-lg font-semibold text-[var(--rgt-text-strong)]">
                  {t(`${practice}.title`)}
                </h2>
                <p className="mt-2 text-sm text-[var(--rgt-text-muted)]">{t(`${practice}.body`)}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {[1, 2, 3].map((n) => (
                    <li key={n} className="flex gap-2">
                      <span aria-hidden className="text-[var(--rgt-accent)]">
                        —
                      </span>
                      <span>{t(`${practice}.bullet${n}`)}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="secondary"
                  size="sm"
                  data-rgt-id={`service-cta-${practice}`}
                  className={cx(
                    'mt-5 self-start',
                    // Seeded: a fixed max-width sized for the English label. The longer German
                    // and Hindi labels are clipped mid-word with no ellipsis.
                    D_DE_SERVICES_CTA_CLIPPED &&
                      'max-w-[11rem] overflow-hidden whitespace-nowrap text-ellipsis',
                  )}
                >
                  {t(`${practice}.cta`)}
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/*
        Carries the three Level 1 traps: a dotted filename that is not a resource key, a JSON
        snippet whose braces are content rather than an unresolved token, and the word `null`
        used as terminology. Each one is a near-miss for a plumbing rule and must not be
        flagged — they are what stop a greedy regex scoring 100% on precision.
      */}
      <section className="py-8">
        <Container>
          <SectionHeading title={t('notes.heading')} />
          <ul
            className="space-y-2 text-sm text-[var(--rgt-text-muted)]"
            data-rgt-id="service-notes"
          >
            <li data-rgt-id="service-note-config">{t('notes.configFile')}</li>
            <li data-rgt-id="service-note-region">{t('notes.regionExample')}</li>
            <li data-rgt-id="service-note-null">{t('notes.nullRegion')}</li>
          </ul>
        </Container>
      </section>

      <section className="py-8 pb-16">
        <Container>
          <SectionHeading title={t('engagement.heading')} />
          <ol className="grid gap-4 lg:grid-cols-3">
            {STEPS.map((step, index) => (
              <Card key={step} testId={`engagement-${step}`}>
                <p className="text-[12px] font-semibold text-[var(--rgt-accent)]">{index + 1}</p>
                <h3 className="mt-1 text-base font-semibold text-[var(--rgt-text-strong)]">
                  {t(`engagement.${step}Title`)}
                </h3>
                <p className="mt-2 text-sm text-[var(--rgt-text-muted)]">
                  {t(`engagement.${step}Body`)}
                </p>
              </Card>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
