import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';
import Prose from '@/ui/Prose';
import SectionHeading from '@/ui/SectionHeading';
import { OFFICES, pick } from '@/services/content.service';
import { useLocale } from '@/contexts/LocaleContext';

const VALUE_KEYS = ['one', 'two', 'three'] as const;

export default function AboutPage() {
  const { t } = useTranslation('about');
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
          <p className="mt-5 max-w-[64ch] text-[16px] text-[var(--rgt-text-muted)]">
            {t('hero.lead')}
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <SectionHeading title={t('story.heading')} />
          <Prose>
            <p data-rgt-id="about-story-p1">{t('story.p1')}</p>
            <p data-rgt-id="about-story-p2">{t('story.p2')}</p>
            <p data-rgt-id="about-story-p3">{t('story.p3')}</p>
          </Prose>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <SectionHeading title={t('values.heading')} />
          <div className="grid gap-4 lg:grid-cols-3">
            {VALUE_KEYS.map((key) => (
              <Card key={key} testId={`about-value-${key}`}>
                <h3 className="text-base font-semibold text-[var(--rgt-text-strong)]">
                  {t(`values.${key}Title`)}
                </h3>
                <p className="mt-2 text-sm text-[var(--rgt-text-muted)]">
                  {t(`values.${key}Body`)}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <SectionHeading title={t('facts.heading')} />
          <Card testId="about-facts">
            <ul className="space-y-2 text-sm text-[var(--rgt-text-muted)]">
              <li data-rgt-id="about-fact-distance">{t('facts.campusDistance')}</li>
              <li data-rgt-id="about-fact-temperature">{t('facts.hallTemperature')}</li>
              {/* Trap: a US trail is signposted in miles, so miles are correct here even on a
                  metric locale. A unit checker that only looks at the locale is a false positive. */}
              <li data-rgt-id="about-fact-foreign-trail">{t('facts.foreignTrail')}</li>
              <li data-rgt-id="about-fact-script-note">{t('facts.scriptNote')}</li>
              {/* Trap: OAuth and HTTPS are Latin in every script. A script checker that measures
                  out-of-range codepoints without whitelisting technical terms fires here. */}
              <li data-rgt-id="about-fact-technical-note">{t('facts.technicalNote')}</li>
              {/* Trap: an ISO-8601 date is locale-neutral and never a date-format defect. */}
              <li data-rgt-id="about-fact-iso-date">{t('facts.isoDate')}</li>
              {/* Trap: 03/04/2026 is undecidable - neither component exceeds 12, so a date rule
                  must SKIP it rather than guess which order it is in. */}
              <li data-rgt-id="about-fact-ambiguous-date">{t('facts.ambiguousDate')}</li>
              {/* Trap: an IPv4 address is dotted digits and is not a grouped number. */}
              <li data-rgt-id="about-fact-gateway">{t('facts.gatewayAddress')}</li>
            </ul>
          </Card>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <SectionHeading title={t('offices.heading')} lead={t('offices.lead')} />
          <div className="grid gap-4 lg:grid-cols-3">
            {OFFICES.map((office) => (
              <Card key={office.id} testId={`about-office-${office.id}`}>
                <h3 className="text-base font-semibold text-[var(--rgt-text-strong)]">
                  {pick(office.city, locale)}
                </h3>
                <address className="mt-2 not-italic text-sm text-[var(--rgt-text-muted)]">
                  {pick(office.addressLines, locale).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
