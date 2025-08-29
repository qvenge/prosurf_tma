'use client';

import type { HTMLAttributes, ReactElement } from 'react';
import styles from './Tabbar.module.scss';

import clsx from 'clsx';
import { TabbarItem, type TabbarItemProps } from './components/TabbarItem/TabbarItem';

export interface TabbarProps extends HTMLAttributes<HTMLDivElement> {
  /** The child elements of the Tabbar, expected to be `Tabbar.Item` components. */
  children: ReactElement<TabbarItemProps>[];
}

/**
 * Serves as a container for `Tabbar.Item` components, rendering a navigational tab bar.
 * typically at the bottom of the screen, making it ideal for mobile or web application navigation menus.
 *
 * The component adapts its styling based on the platform, providing a consistent look and feel across different devices.
 */
export const Tabbar = ({
  children,
  className,
  ...restProps
}: TabbarProps) => {
  return (
    <div
      className={clsx(styles.wrapper, className)}
      {...restProps}
    >
      {children}
    </div>
  );
};

Tabbar.Item = TabbarItem;
