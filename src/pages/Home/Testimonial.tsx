import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';

/**
 * Deliberately client-rendered after mount.
 *
 * Nothing here needs to be async — the delay exists so the fixture has at least one block that
 * is absent from the server response and only appears once the page has rendered. A crawler
 * that reads raw HTML will miss it; one that drives a browser will not. That difference is
 * something the detector should be tested against.
 *
 * The quote itself is a TRAP: it is a genuine English original, correctly marked lang="en" on
 * the element. Flagging it as untranslated content on a German or Hindi page is a false
 * positive, and the lang attribute is the signal that says so.
 */
export default function Testimonial() {
  const { t } = useTranslation('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <section className="py-8" data-rgt-id="home-testimonial">
      <Container>
        <Card className="bg-[var(--rgt-surface-invert)] text-[var(--rgt-text-invert)]">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide opacity-70">
            {t('testimonial.heading')}
          </h2>
          <blockquote className="mt-4 max-w-[64ch] text-lg leading-relaxed">
            <p lang="en" data-rgt-id="testimonial-quote">
              “{t('testimonial.quote')}”
            </p>
          </blockquote>
          <footer className="mt-4 text-[13px] opacity-70">
            <p>{t('testimonial.attribution')}</p>
            <p className="mt-1 italic">{t('testimonial.englishOriginalNote')}</p>
          </footer>
        </Card>
      </Container>
    </section>
  );
}
