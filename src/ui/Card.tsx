import { cx } from '@/utils/cx';
import type { CardProps } from '@/types/components';

export default function Card({ children, className, testId }: CardProps) {
  return (
    <div
      data-rgt-id={testId}
      className={cx(
        'rounded-xl border border-[var(--rgt-border)] bg-[var(--rgt-surface)] p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
