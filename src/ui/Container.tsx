import { cx } from '@/utils/cx';
import type { ContainerProps } from '@/types/components';

export default function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return <Tag className={cx('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</Tag>;
}
