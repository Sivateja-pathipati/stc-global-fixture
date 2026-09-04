import { cx } from '@/utils/cx';
import { BADGE_TONES } from '@/constants/colors';
import type { BadgeProps } from '@/types/components';

export default function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
