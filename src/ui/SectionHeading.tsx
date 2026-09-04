import type { SectionHeadingProps } from '@/types/components';

export default function SectionHeading({ eyebrow, title, lead, testId }: SectionHeadingProps) {
  return (
    <header className="mb-8 max-w-[60ch]" data-rgt-id={testId}>
      {eyebrow && (
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--rgt-accent)]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
      {lead && <p className="mt-3 text-[15px] text-[var(--rgt-text-muted)]">{lead}</p>}
    </header>
  );
}
