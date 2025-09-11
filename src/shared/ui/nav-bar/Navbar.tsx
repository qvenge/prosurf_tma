import {type HTMLAttributes,useCallback } from 'react';
import clsx from 'clsx';
import { Tabbar } from '../tabbar';

import { useNavigator, useNavigationState } from '@/shared/navigation';

import { Icon} from '@/shared/ui/icon';

interface Item {
  id: string;
  text: string;
  icon?: string;
}

export interface NavbarProps extends HTMLAttributes<HTMLDivElement> {
  items: Item[];
}

export function Navbar({items, className, ...restProps}: NavbarProps) {
  const navigator = useNavigator();
  const { tab } = useNavigationState();

  const handleClick = useCallback((tabName: string) => {
    navigator.switchTab(tabName as any);
  }, [navigator]);

  return (
    <Tabbar
      className={clsx(className)}
      {...restProps}
    >
      {items.map(({ id, text, icon }) => (
        <Tabbar.Item
          key={id}
          text={text}
          selected={id === tab}
          onClick={() => handleClick(id)}
        >
          {icon && <Icon src={icon} width={24} height={24} />}
        </Tabbar.Item>
      ))}
    </Tabbar>
  );
}