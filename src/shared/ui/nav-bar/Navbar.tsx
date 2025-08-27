import { useCallback } from 'react';
import { useNavigate, useMatches } from 'react-router';
import { Tabbar } from '../tabbar';

import { Icon} from '@/shared/ui/icon';

interface Item {
  id: string;
  text: string;
  path: string;
  icon?: string;
}

export interface NavbarProps {
  items: Item[];
}

export function Navbar({items}: NavbarProps) {
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
    <Tabbar>
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