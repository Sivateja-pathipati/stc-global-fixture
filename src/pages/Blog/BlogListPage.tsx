import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';
import Badge from '@/ui/Badge';
import EmptyState from '@/components/EmptyState';
import { BLOG_TAGS, pick, postsByTag } from '@/services/content.service';
import { useLocale } from '@/contexts/LocaleContext';
import { routePath } from '@/constants/routes';
import { cx } from '@/utils/cx';

/** `?tag=none` (or any unknown tag) renders the empty state. */
export default function BlogListPage() {
  const { t } = useTranslation('blog');
  const { locale, localePath } = useLocale();
  const [params, setParams] = useSearchParams();
  const activeTag = params.get('tag');
  const posts = postsByTag(activeTag);

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
          <p className="mt-5 max-w-[60ch] text-[16px] text-[var(--rgt-text-muted)]">
            {t('hero.lead')}
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <div
            className="mb-6 flex flex-wrap items-center gap-2"
            role="group"
            aria-label={t('list.filterLabel')}
            data-rgt-id="blog-filters"
          >
            <button
              type="button"
              onClick={() => setParams({})}
              className={cx(
                'rounded-full border px-3 py-1 text-[12px] font-semibold',
                !activeTag
                  ? 'border-transparent bg-[var(--rgt-accent-soft)] text-[var(--rgt-accent)]'
                  : 'border-[var(--rgt-border-strong)] text-[var(--rgt-text-muted)]',
              )}
            >
              {t('list.filterAll')}
            </button>
            {BLOG_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setParams({ tag })}
                className={cx(
                  'rounded-full border px-3 py-1 text-[12px] font-semibold',
                  activeTag === tag
                    ? 'border-transparent bg-[var(--rgt-accent-soft)] text-[var(--rgt-accent)]'
                    : 'border-[var(--rgt-border-strong)] text-[var(--rgt-text-muted)]',
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          {posts.length > 0 && (
            // A pre-formatted count string, not an interpolation. The fixture seeds raw ICU
            // syntax here, and the app deliberately has no ICU formatter — see fixtures/README.
            <p
              className="mb-4 text-[13px] text-[var(--rgt-text-muted)]"
              data-rgt-id="blog-result-count"
            >
              {t('list.resultCount')}
            </p>
          )}

          {posts.length === 0 ? (
            <EmptyState testId="blog-empty" title={t('empty.title')} body={t('empty.body')} />
          ) : (
            <ul className="grid gap-4 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Card testId={`blog-card-${post.slug}`} className="flex h-full flex-col">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                    <h2 className="mt-3 text-base font-semibold text-[var(--rgt-text-strong)]">
                      <Link to={localePath(routePath('blog.article', { slug: post.slug }))}>
                        {pick(post.title, locale)}
                      </Link>
                    </h2>
                    <p className="mt-2 flex-1 text-sm text-[var(--rgt-text-muted)]">
                      {pick(post.excerpt, locale)}
                    </p>
                    <p className="mt-4 text-[12px] text-[var(--rgt-text-muted)]">
                      <span data-rgt-id={`blog-published-${post.slug}`}>
                        {pick(post.published, locale)}
                      </span>
                      {' · '}
                      <span>{pick(post.readingTime, locale)}</span>
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
