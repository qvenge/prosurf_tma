'use client';

import type { ButtonHTMLAttributes } from 'react';
import styles from './SegmentedControlItem.module.scss';

import clsx from 'clsx';

import { Tapable } from '@/shared/ui/tapable';

export interface SegmentedControlItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the item is selected. Used by the parent SegmentedControl to style accordingly. */
  selected?: boolean;
}

/**
 * A component representing an individual item within a SegmentedControl.
 * It leverages the Tappable component for handling interactions and supports platform-specific styles.
 */
export const SegmentedControlItem = ({
  selected,
  className,
  children,
  ...restProps
}: SegmentedControlItemProps) => {
  return (
    <Tapable
      role="tab"
      Component="button"
      className={clsx(
        styles.wrapper,
        selected && styles['wrapper--selected'],
        className,
      )}
      {...restProps}
    >
      <span className={styles.text}>{children}</span>
    </Tapable>
  );
};
