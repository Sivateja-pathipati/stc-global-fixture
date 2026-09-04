import { cx } from '@/utils/cx';
import { BUTTON_SIZES, BUTTON_VARIANTS } from '@/constants/colors';
import type { ButtonProps } from '@/types/components';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-50',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
