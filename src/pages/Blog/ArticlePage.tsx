import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Prose from '@/ui/Prose';
import Badge from '@/ui/Badge';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import { getPost, pick } from '@/services/content.service';
import { useLocale } from '@/contexts/LocaleContext';
import { APP_ROUTES } from '@/constants/routes';
import { D_DE_TEXT_IN_IMAGE } from '@/constants/generated/activeDefects';

export default function ArticlePage() {
  const { t } = useTranslation('blog');
  const { locale, localePath } = useLocale();
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPost(slug) : undefined;

  if (!post) return <NotFoundPage />;

  // Seeded: the hero swaps to an image with English words baked into the pixels, so the
  // translated alt text is correct while the picture itself is not localized. Only OCR finds
  // this one — it is invisible to every DOM-based check.
  const heroSrc = D_DE_TEXT_IN_IMAGE ? '/images/article-baked-en.svg' : post.heroImage;

  return (
    <article className="py-14">
      <Container>
        <nav aria-label={t('article.backToList')} className="mb-6">
          <Link
            to={localePath(APP_ROUTES.blog)}
            className="text-[13px] font-semibold text-[var(--rgt-accent)]"
          >
            ← {t('article.backToList')}
          </Link>
        </nav>

        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <h1
          className="mt-3 max-w-[26ch] text-3xl font-semibold sm:text-4xl"
          data-rgt-id="article-title"
        >
          {pick(post.title, locale)}
        </h1>

        <p className="mt-3 text-[13px] text-[var(--rgt-text-muted)]">
          <span className="font-semibold">{t('article.authorLabel')}: </span>
          {post.author}
          {' · '}
          <span data-rgt-id="article-published">{pick(post.published, locale)}</span>
          {' · '}
          <span>{pick(post.readingTime, locale)}</span>
        </p>

        <img
          src={heroSrc}
          alt={pick(post.heroAlt, locale)}
          width={1200}
          height={480}
          data-rgt-id="article-hero"
          className="mt-8 w-full rounded-xl border border-[var(--rgt-border)] bg-[var(--rgt-surface)]"
        />

        <Prose className="mt-8">
          {pick(post.body, locale).map((paragraph, index) => (
            <p key={paragraph.slice(0, 24)} data-rgt-id={`article-p${index + 1}`}>
              {paragraph}
            </p>
          ))}
        </Prose>
      </Container>
    </article>
  );
}
