'use client';

import { useCallback } from 'react';
import type { HTMLAttributes, ReactElement } from 'react';
import styles from './Tabbar.module.scss';

import clsx from 'clsx';
import { usePlatform } from '@/shared/app-root/usePlatform';
import { TabbarItem, type TabbarItemProps } from './components/TabbarItem/TabbarItem';

export interface TabbarProps extends HTMLAttributes<HTMLDivElement> {
  onHeightChange: (val: number) => void;
  /** The child elements of the Tabbar, expected to be `Tabbar.Item` components. */
  children: ReactElement<TabbarItemProps>[];
}

/**
 * Serves as a container for `Tabbar.Item` components, rendering a navigational tab bar.
 * Utilizes a `FixedLayout` to ensure the tab bar remains positioned at a specific area within a view,
 * typically at the bottom of the screen, making it ideal for mobile or web application navigation menus.
 *
 * The component adapts its styling based on the platform, providing a consistent look and feel across different devices.
 */
export const Tabbar = ({
  children,
  className,
  onHeightChange,
  ...restProps
}: TabbarProps) => {
  const platform = usePlatform();

  const measuredRef = useCallback((node: HTMLElement | null) => {
    if (node !== null) {
      onHeightChange(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <div
      ref={measuredRef}
      className={clsx(
        styles.wrapper,
        platform === 'ios' && styles['wrapper--ios'],
        className,
      )}
      {...restProps}
    >
      {children}
    </div>
  );
};

Tabbar.Item = TabbarItem;
