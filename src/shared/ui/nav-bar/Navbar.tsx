import {type HTMLAttributes,useCallback } from 'react';
import clsx from 'clsx';
import { useNavigate, useMatches } from 'react-router';
import { Tabbar } from '../tabbar';

import { Icon} from '@/shared/ui/icon';

interface Item {
  id: string;
  text: string;
  path: string;
  icon?: string;
}

export interface NavbarProps extends HTMLAttributes<HTMLDivElement> {
  onHeightChange: (val: number) => void;
  items: Item[];
}

export function Navbar({items, className, onHeightChange, ...restProps}: NavbarProps) {
  const navigate = useNavigate();
  const matches = useMatches().reverse();

  let selected = { id: items[0].id, weight: matches.findIndex(({pathname}) => pathname.startsWith(items[0].path))};

  for (let i = 1; i < items.length; i++) {
    const weight = matches.findIndex(({pathname}) => pathname.startsWith(items[i].path))

    if (selected.weight <= weight) {
      selected = {id: items[i].id, weight};
    }
  }

  const handleClick = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <Tabbar
      onHeightChange={onHeightChange}
      className={clsx(className)}
      {...restProps}
    >
      {items.map(({ id, text, path, icon }) => (
        <Tabbar.Item
          key={id}
          text={text}
          selected={id === selected.id}
          onClick={() => handleClick(path)}
        >
          {icon && <Icon src={icon} width={24} height={24} />}
        </Tabbar.Item>
      ))}
    </Tabbar>
  );
}