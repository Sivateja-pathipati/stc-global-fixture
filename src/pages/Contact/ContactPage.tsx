import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';
import SectionHeading from '@/ui/SectionHeading';
import ContactForm from './ContactForm';
import { OFFICES, pick } from '@/services/content.service';
import { useLocale } from '@/contexts/LocaleContext';
import { D_AR_PHONE_NOT_ISOLATED } from '@/constants/generated/activeDefects';

export default function ContactPage() {
  const { t } = useTranslation('contact');
  const { locale } = useLocale();

  return (
    <>
      <section className="border-b border-[var(--rgt-border)] bg-[var(--rgt-surface)] py-16">
        <Container>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--rgt-accent)]">
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-3 max-w-[24ch] text-3xl font-semibold sm:text-4xl">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-[60ch] text-[16px] text-[var(--rgt-text-muted)]">
            {t('hero.lead')}
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <ContactForm />

          <div>
            <SectionHeading title={t('offices.heading')} />
            <div className="grid gap-4">
              {OFFICES.map((office) => (
                <Card key={office.id} testId={`contact-office-${office.id}`}>
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
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">{t('offices.phoneLabel')}: </span>
                    {/* Trap on the Berlin office: '+49 30 901820' is a correct international
                        number. Flagging it as a badly formatted phone is a false positive. */}
                    <span data-rgt-id={`office-phone-${office.id}`}>
                      {/* <bdi> is the correct markup: a Latin-script number inside RTL prose
                          reorders without it, so the leading '+' lands at the wrong end. The
                          seeded defect removes the isolation, not the number. */}
                      {D_AR_PHONE_NOT_ISOLATED ? (
                        pick(office.phone, locale)
                      ) : (
                        <bdi>{pick(office.phone, locale)}</bdi>
                      )}
                    </span>
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold">{t('offices.hoursLabel')}: </span>
                    <span data-rgt-id={`office-hours-${office.id}`}>
                      {pick(office.hours, locale)}
                    </span>
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <Card testId="contact-notes">
            <h2 className="text-lg font-semibold text-[var(--rgt-text-strong)]">
              {t('notes.heading')}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--rgt-text-muted)]">
              <li data-rgt-id="contact-note-response">{t('notes.responsePromise')}</li>
              {/* Trap: the informal register is quoted from the careers page on purpose. A tone
                  checker that counts registers without noticing the quotation marks fires here. */}
              <li data-rgt-id="contact-note-informal">{t('notes.quotedInformal')}</li>
              {/* Trap: a US webcast time quoted as it appears in the invitation. */}
              <li data-rgt-id="contact-note-schedule">{t('notes.scheduleQuote')}</li>
              {/* Trap: 'Vorname(n)' / 'first name(s)' is idiomatic, not a leaked plural artefact. */}
              <li data-rgt-id="contact-note-name-hint">{t('notes.nameFieldHint')}</li>
            </ul>
          </Card>
        </Container>
      </section>
    </>
  );
}
