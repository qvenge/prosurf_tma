import type { HTMLAttributes, ReactElement } from 'react';
import styles from './CompactPagination.module.scss';

import clsx from 'clsx';

import {
  CompactPaginationItem,
  type CompactPaginationItemProps,
} from './components/CompactPaginationItem/CompactPaginationItem';

export interface CompactPaginationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Contains pagination items. */
  children?: ReactElement<CompactPaginationItemProps>[];
}

/**
 * Displays a compact set of pagination controls. This component allows users to navigate between pages of content.
 */
export const CompactPagination = ({
  children,
  className,
  ...restProps
}: CompactPaginationProps) => (
  <div
    role="tablist"
    className={clsx(
      styles.wrapper,
      className,
    )}
    {...restProps}
  >
    {children}
  </div>
);

CompactPagination.Item = CompactPaginationItem;
