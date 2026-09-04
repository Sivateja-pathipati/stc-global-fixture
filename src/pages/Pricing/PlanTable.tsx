import { useTranslation } from 'react-i18next';
import Badge from '@/ui/Badge';
import { PRICING_PLANS, pick } from '@/services/content.service';
import { cx } from '@/utils/cx';
import { HARDCODED_BADGE_EN } from '@/constants/labels/hardcoded';
import {
  D_DE_PRICING_TABLE_OVERFLOW,
  D_HI_BADGE_HARDCODED,
} from '@/constants/generated/activeDefects';
import type { LocaleId } from '@/types/locale';

/**
 * All prices, seat counts and uptime figures are pre-formatted literals from
 * content/data/site-data.json — never Intl at render time. ICU output for German currency
 * varies across Node versions in whether the space before € is U+0020 or U+00A0, and the
 * manifest records exact strings, so runtime formatting would make the ground truth unstable.
 */
export default function PlanTable({ locale }: { locale: LocaleId }) {
  const { t } = useTranslation('pricing');

  return (
    <div
      className={cx(
        'rounded-xl border border-[var(--rgt-border)] bg-[var(--rgt-surface)]',
        // Seeded: the wrapper loses its scroll container and the table is given a min-width
        // sized for the longer German headings, so the whole document scrolls sideways.
        D_DE_PRICING_TABLE_OVERFLOW ? 'overflow-visible' : 'overflow-x-auto',
      )}
      data-rgt-id="pricing-table-wrapper"
    >
      <table
        className={cx(
          'w-full border-collapse text-sm',
          D_DE_PRICING_TABLE_OVERFLOW && 'min-w-[70rem]',
        )}
        data-rgt-id="pricing-table"
      >
        <caption className="sr-only">{t('hero.title')}</caption>
        <thead>
          <tr className="border-b border-[var(--rgt-border)] text-start">
            <th scope="col" className="p-4 text-start font-semibold">
              {t('table.planHeading')}
            </th>
            <th scope="col" className="p-4 text-start font-semibold">
              {t('table.priceHeading')}
            </th>
            <th scope="col" className="p-4 text-start font-semibold">
              {t('table.seatsHeading')}
            </th>
            <th scope="col" className="p-4 text-start font-semibold">
              {t('table.uptimeHeading')}
            </th>
            <th scope="col" className="p-4 text-start font-semibold">
              {t('table.featuresHeading')}
            </th>
          </tr>
        </thead>
        <tbody>
          {PRICING_PLANS.map((plan) => (
            <tr
              key={plan.id}
              data-rgt-id={`plan-row-${plan.id}`}
              className="border-b border-[var(--rgt-border)] last:border-0"
            >
              <th scope="row" className="p-4 text-start align-top font-semibold">
                <span className="flex flex-wrap items-center gap-2">
                  {pick(plan.name, locale)}
                  {plan.featured && (
                    <Badge tone="accent">
                      {/* Seeded: English badge text baked into the component, so it stays
                          English on the Hindi page while everything around it is translated. */}
                      {D_HI_BADGE_HARDCODED ? HARDCODED_BADGE_EN : t('table.featuredBadge')}
                    </Badge>
                  )}
                </span>
              </th>
              <td className="p-4 align-top">
                <span
                  className="text-base font-semibold text-[var(--rgt-text-strong)]"
                  data-rgt-id={`plan-price-${plan.id}`}
                >
                  {pick(plan.price, locale)}
                </span>
                <span className="block text-[12px] text-[var(--rgt-text-muted)]">
                  {pick(plan.cadence, locale)}
                </span>
              </td>
              <td className="p-4 align-top" data-rgt-id={`plan-seats-${plan.id}`}>
                {pick(plan.seats, locale)}
              </td>
              <td className="p-4 align-top" data-rgt-id={`plan-uptime-${plan.id}`}>
                {pick(plan.uptime, locale)}
              </td>
              <td className="p-4 align-top">
                <ul className="space-y-1">
                  {pick(plan.features, locale).map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
