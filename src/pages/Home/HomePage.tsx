// ── React ──────────────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ── Custom ─────────────────────────────────────────────────────────────────────────────────
import Container from '@/ui/Container';
import Button from '@/ui/Button';
import Card from '@/ui/Card';
import SectionHeading from '@/ui/SectionHeading';
import Testimonial from './Testimonial';
import { useLocale } from '@/contexts/LocaleContext';
import { APP_ROUTES } from '@/constants/routes';
import { HARDCODED_HERO_TITLE_EN } from '@/constants/labels/hardcoded';
import { D_EN_HOME_HERO_HARDCODED } from '@/constants/generated/activeDefects';

const STAT_KEYS = ['clients', 'countries', 'uptime', 'engineers'] as const;
const PILLAR_KEYS = ['platform', 'data', 'modernisation'] as const;

export default function HomePage() {
  const { t } = useTranslation('home');
  const { localePath } = useLocale();

  return (
    <>
      <section className="border-b border-[var(--rgt-border)] bg-[var(--rgt-surface)] py-20">
        <Container>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--rgt-accent)]">
            {t('hero.eyebrow')}
          </p>
          <h1
            className="mt-3 max-w-[22ch] text-4xl font-semibold leading-tight sm:text-5xl"
            data-rgt-id="home-hero-title"
          >
            {/* Seeded: an English literal written into the component, so it stays English in
                every locale no matter what the resources say. */}
            {D_EN_HOME_HERO_HARDCODED ? HARDCODED_HERO_TITLE_EN : t('hero.title')}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[17px] text-[var(--rgt-text-muted)]">
            {t('hero.lead')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={localePath(APP_ROUTES.contact)}>
              <Button data-rgt-id="home-hero-primary">{t('hero.primaryCta')}</Button>
            </Link>
            <Link to={localePath(APP_ROUTES.services)}>
              <Button variant="secondary">{t('hero.secondaryCta')}</Button>
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <h2 className="sr-only">{t('stats.heading')}</h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_KEYS.map((key) => (
              <Card key={key} testId={`home-stat-${key}`}>
                <dt className="text-[13px] text-[var(--rgt-text-muted)]">
                  {t(`stats.${key}Label`)}
                </dt>
                <dd className="mt-2 text-3xl font-semibold text-[var(--rgt-text-strong)]">
                  {t(`stats.${key}Value`)}
                </dd>
              </Card>
            ))}
          </dl>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <SectionHeading title={t('pillars.heading')} lead={t('pillars.lead')} />
          <div className="grid gap-4 lg:grid-cols-3">
            {PILLAR_KEYS.map((key) => (
              <Card key={key} testId={`home-pillar-${key}`}>
                <h3 className="text-base font-semibold text-[var(--rgt-text-strong)]">
                  {t(`pillars.${key}Title`)}
                </h3>
                <p className="mt-2 text-sm text-[var(--rgt-text-muted)]">
                  {t(`pillars.${key}Body`)}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <Testimonial />

      <section className="py-14">
        <Container>
          <Card className="flex flex-col items-start gap-4 bg-[var(--rgt-surface-alt)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--rgt-text-strong)]">
                {t('cta.title')}
              </h2>
              <p className="mt-1 max-w-[56ch] text-sm text-[var(--rgt-text-muted)]">
                {t('cta.body')}
              </p>
            </div>
            <Link to={localePath(APP_ROUTES.contact)}>
              <Button>{t('cta.button')}</Button>
            </Link>
          </Card>
        </Container>
      </section>
    </>
  );
}
