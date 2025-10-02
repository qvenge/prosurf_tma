import { useCallback } from 'react';
import { useNavigator, type Tab } from '../lib/Navigator';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  to: string;
  tab?: Tab;
  reset?: boolean;
  params?: { [key: string]: string | number | boolean }
}

export function Link({to, tab, reset, params, style, ...restProps}: LinkProps) {
  const navigator = useNavigator();
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.push(to, {tab, reset});
  }, [navigator]);

  return <a
    style={{...style, textDecoration: 'none', color: 'inherit'}}
    {...restProps}
    href={to}
    onClick={handleClick}
  />;
}