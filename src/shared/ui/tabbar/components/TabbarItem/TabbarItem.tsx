'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './TabbarItem.module.scss';

import clsx from 'clsx';
import { hasReactNode } from '@/shared/lib/react/node';

import { Tapable } from '@/shared/ui/tapable';
import { Caption } from '@/shared/typography';

export interface TabbarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Indicates whether the tab is selected or active. */
  selected?: boolean;
  /** The text displayed on the tab. */
  text?: string;
  /** The icon displayed on the tab. It should be passed as a ReactNode with dimensions of 28x28. */
  children?: ReactNode;
}

/**
 * Represents an individual tab within a `Tabbar`.
 * Each `Tabbar.Item` typically contains an icon and optional text.
 * When selected, the tab exhibit different visual styles to indicate its active state.
 *
 * The component adapts its styling based on the platform, providing a consistent look and feel across different devices.
 */
export const TabbarItem = ({
  selected,
  text,
  children,
  className,
  ...restProps
}: TabbarItemProps) => {
  return (
    <Tapable
      Component="button"
      interactiveAnimation="opacity"
      className={clsx(
        styles.wrapper,
        selected && styles['wrapper--selected'],
        className,
      )}
      {...restProps}
    >
      {hasReactNode(children) && (
        <div className={styles.icon}>
          {children}
        </div>
      )}
      {hasReactNode(text) && (
        <Caption
          className={styles.text}
          weight="2"
          level="1"
        >
          {text}
        </Caption>
      )}
    </Tapable>
  );
};
