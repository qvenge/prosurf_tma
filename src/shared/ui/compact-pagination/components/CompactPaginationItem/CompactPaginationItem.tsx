import { type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { hasReactNode } from '@/shared/lib/react/node';
import { VisuallyHidden } from '@/shared/ui/visually-hidden';
import styles from './CompactPaginationItem.module.scss';

export interface CompactPaginationItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const CompactPaginationItem = ({
  selected,
  className,
  children,
  ...restProps
}: CompactPaginationItemProps) => (
  <button
    type="button"
    role="tab"
    aria-selected={selected}
    className={clsx(
      styles.wrapper,
      selected && styles['wrapper--selected'],
      className,
    )}
    {...restProps}
  >
    {hasReactNode(children) ? <VisuallyHidden>{children}</VisuallyHidden> : undefined}
  </button>
);
