import { useState } from 'react';
import { Tabbar } from '../tabbar';

import { Icon} from '@/shared/ui/icon';

interface Item {
  id: string;
  text: string;
  icon?: string;
}

export interface NavbarProps {
  items: Item[];
}

export function Navbar({items}: NavbarProps) {
  const [currentTab, setCurrentTab] = useState(items[0].id);

  return (
    <Tabbar>
      {items.map(({ id, text, icon }) => (
        <Tabbar.Item
          key={id}
          text={text}
          selected={id === currentTab}
          onClick={() => setCurrentTab(id)}
        >
          {icon && <Icon src={icon} width={24} height={24} />}
        </Tabbar.Item>
      ))}
    </Tabbar>
  );
}