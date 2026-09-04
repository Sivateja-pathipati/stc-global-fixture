import { cx } from '@/utils/cx';
import type { ProseProps } from '@/types/components';

/** Long-form text column. Measure is capped in ch so it holds across scripts and expansion. */
export default function Prose({ children, className }: ProseProps) {
  return (
    <div className={cx('max-w-[68ch] space-y-4 text-[15px] leading-relaxed', className)}>
      {children}
    </div>
  );
}
