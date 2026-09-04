import { useId } from 'react';
import { cx } from '@/utils/cx';
import type { InputProps } from '@/types/components';

export default function Input({ label, error, hint, className, id, ...rest }: InputProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-[13px] font-semibold text-[var(--rgt-text-strong)]">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          'h-10 rounded-lg border bg-[var(--rgt-surface)] px-3 text-sm',
          error ? 'border-[var(--rgt-danger)]' : 'border-[var(--rgt-border-strong)]',
          className,
        )}
        {...rest}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-[12px] text-[var(--rgt-text-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-[12px] text-[var(--rgt-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
