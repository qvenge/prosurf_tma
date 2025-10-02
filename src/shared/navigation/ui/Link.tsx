import { useCallback } from 'react';
import { useNavigator, type Tab } from './Navigator';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  to: string;
  tab?: Tab | { value: Tab; reset: boolean };
  params?: { [key: string]: string | number | boolean }
}

export function Link({to, tab, params, style, ...restProps}: LinkProps) {
  const navigator = useNavigator();
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const tabValue = typeof tab === 'object' ? tab.value : tab;
    const reset = typeof tab === 'object' ? tab.reset : false;
    navigator.push(to, tabValue, reset);
  }, [navigator]);

  return <a
    style={{...style, textDecoration: 'none', color: 'inherit'}}
    {...restProps}
    href={to}
    onClick={handleClick}
  />;
}