'use client';

import type { ButtonHTMLAttributes } from 'react';
import styles from './SegmentedControlItem.module.scss';

import clsx from 'clsx';
import { usePlatform } from '@/shared/app-root/usePlatform';

import { Tapable } from '@/shared/ui/tapable';
import { Caption } from '@/shared/typography';

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
  const platform = usePlatform();
  return (
    <Tapable
      role="tab"
      Component="button"
      className={clsx(
        styles.wrapper,
        platform === 'ios' && styles['wrapper--ios'],
        className,
      )}
      {...restProps}
    >
      <Caption weight={selected ? '2' : '3'}>{children}</Caption>
    </Tapable>
  );
};
