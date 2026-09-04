import Card from '@/ui/Card';
import type { EmptyStateProps } from '@/types/components';

/**
 * Zero-result state. Deliberately a first-class component rather than an inline fragment:
 * empty states are one of the surfaces localization sweeps miss most often, so it needs a
 * stable test id a detector can anchor on.
 */
export default function EmptyState({ title, body, testId }: EmptyStateProps) {
  return (
    <Card testId={testId} className="text-center">
      <h3 className="text-base font-semibold text-[var(--rgt-text-strong)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-[48ch] text-sm text-[var(--rgt-text-muted)]">{body}</p>
    </Card>
  );
}
