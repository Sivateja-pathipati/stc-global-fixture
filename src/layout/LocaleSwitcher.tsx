import { useTranslation } from 'react-i18next';
import { useLocale } from '@/contexts/LocaleContext';
import { LOCALE_LABEL, SUPPORTED_LOCALES } from '@/constants/locales';
import { cx } from '@/utils/cx';
import type { LocaleId } from '@/types/locale';
import type { LocaleSwitcherProps } from '@/types/components';

/**
 * The switcher reports the PATH locale as active, which is what the URL says.
 *
 * When a precedence-violation defect is active the body renders a different language, so the
 * switcher shows "Deutsch" while the content is English — the "selector lies about what is
 * being served" defect. That is intentional and manifest-recorded; it falls out of using the
 * path locale here rather than the rendered one.
 */
export default function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const { t } = useTranslation('common');
  const { switchLocale, alternates } = useLocale();
  const active = activeFromPath(alternates.map((a) => a.locale));

  return (
    <div className={cx('flex items-center gap-1', className)} data-rgt-id="locale-switcher">
      <span className="sr-only">{t('localeSwitcher.label')}</span>
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-current={locale === active ? 'true' : undefined}
          data-rgt-id={`locale-option-${locale}`}
          onClick={() => switchLocale(locale)}
          className={cx(
            'rounded-md px-2 py-1 text-[12px] font-semibold transition-colors',
            locale === active
              ? 'bg-[var(--rgt-accent-soft)] text-[var(--rgt-accent)]'
              : 'text-[var(--rgt-text-muted)] hover:bg-[var(--rgt-surface-alt)]',
          )}
        >
          {LOCALE_LABEL[locale]}
        </button>
      ))}
    </div>
  );
}

/** The locale segment currently in the address bar. */
function activeFromPath(candidates: readonly LocaleId[]): LocaleId | undefined {
  if (typeof window === 'undefined') return undefined;
  const first = window.location.pathname.split('/').filter(Boolean)[0];
  return candidates.find((locale) => locale === first);
}
