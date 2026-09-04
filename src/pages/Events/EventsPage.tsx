import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';
import Button from '@/ui/Button';
import SectionHeading from '@/ui/SectionHeading';
import EmptyState from '@/components/EmptyState';
import { EVENTS, pick } from '@/services/content.service';
import { useLocale } from '@/contexts/LocaleContext';
import { cx } from '@/utils/cx';
import { D_HI_CARD_TRUNCATED } from '@/constants/generated/activeDefects';

/**
 * Every `when` string is a pre-formatted per-locale literal. That is what lets the manifest
 * assert an exact string for a date-format defect, and it keeps 12h/24h and month names stable
 * regardless of which Node version built the site.
 *
 * `?region=none` renders the empty state — an otherwise unreachable surface, and one of the
 * places untranslated copy hides most reliably.
 */
export default function EventsPage() {
  const { t } = useTranslation('events');
  const { locale } = useLocale();
  const [params] = useSearchParams();
  const showEmpty = params.get('region') === 'none';

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
          <p className="mt-5 max-w-[62ch] text-[16px] text-[var(--rgt-text-muted)]">
            {t('hero.lead')}
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <SectionHeading title={t('list.heading')} />

          {showEmpty ? (
            <EmptyState testId="events-empty" title={t('empty.title')} body={t('empty.body')} />
          ) : (
            <ul className="grid gap-4 lg:grid-cols-3">
              {EVENTS.map((event) => (
                <li key={event.id}>
                  <Card testId={`event-${event.id}`} className="flex h-full flex-col">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--rgt-accent)]">
                      {pick(event.city, locale)}
                    </p>
                    <h3
                      className={cx(
                        'mt-2 text-base font-semibold text-[var(--rgt-text-strong)]',
                        // Seeded: a fixed height with hidden overflow. Latin text fits; the
                        // taller Devanagari line box does not, so Hindi is cut off mid-line.
                        D_HI_CARD_TRUNCATED && 'h-[2.6rem] overflow-hidden',
                      )}
                      data-rgt-id={`event-title-${event.id}`}
                    >
                      {pick(event.title, locale)}
                    </h3>
                    <p
                      className="mt-3 text-sm text-[var(--rgt-text-muted)]"
                      data-rgt-id={`event-when-${event.id}`}
                    >
                      <span className="font-semibold">{t('list.whenHeading')}: </span>
                      {pick(event.when, locale)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--rgt-text-muted)]">
                      <span className="font-semibold">{t('list.seatsHeading')}: </span>
                      {pick(event.seatsLabel, locale)}
                    </p>
                    <Button variant="secondary" size="sm" className="mt-4 self-start">
                      {t('list.registerCta')}
                    </Button>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <Card testId="events-calendar-notes" className="bg-[var(--rgt-surface-alt)]">
            <h2 className="text-base font-semibold text-[var(--rgt-text-strong)]">
              {t('calendar.heading')}
            </h2>
            <p className="mt-2 text-sm text-[var(--rgt-text-muted)]">
              {t('calendar.weekStartsNote')}
            </p>
            <p className="mt-1 text-sm text-[var(--rgt-text-muted)]">
              {t('calendar.timezoneNote')}
            </p>
          </Card>
        </Container>
      </section>
    </>
  );
}
