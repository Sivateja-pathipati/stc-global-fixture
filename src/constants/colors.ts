/**
 * Class-string maps keyed by a domain state, so no component writes a colour class inline and
 * a palette change is one edit here rather than a grep across pages.
 */

export const BADGE_TONES = {
  neutral: 'bg-[var(--rgt-surface-alt)] text-[var(--rgt-text-muted)]',
  accent: 'bg-[var(--rgt-accent-soft)] text-[var(--rgt-accent)]',
  success: 'bg-[var(--rgt-success-soft)] text-[var(--rgt-success)]',
} as const;

export const BUTTON_VARIANTS = {
  primary:
    'bg-[var(--rgt-accent)] text-white hover:bg-[var(--rgt-accent-hover)] border border-transparent',
  secondary:
    'bg-[var(--rgt-surface)] text-[var(--rgt-text-strong)] border border-[var(--rgt-border-strong)] hover:bg-[var(--rgt-surface-alt)]',
  ghost:
    'bg-transparent text-[var(--rgt-text)] border border-transparent hover:bg-[var(--rgt-surface-alt)]',
} as const;

export const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
} as const;
