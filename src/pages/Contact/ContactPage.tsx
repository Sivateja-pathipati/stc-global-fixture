import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';
import SectionHeading from '@/ui/SectionHeading';
import ContactForm from './ContactForm';
import { OFFICES, pick } from '@/services/content.service';
import { useLocale } from '@/contexts/LocaleContext';

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
                      {pick(office.phone, locale)}
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
    </>
  );
}
