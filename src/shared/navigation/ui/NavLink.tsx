import { useCallback } from 'react';
import { useNavigator, type Tab } from '../lib/Navigator';

export interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  name: Tab;
  reset?: boolean;
  params: { [key: string]: string | number | boolean }
}

export function NavLink({name, reset, params, style, ...restProps}: NavLinkProps) {
  const navigator = useNavigator();
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.switchTab(name, reset);
  }, [navigator]);

  return <a
    style={{...style, textDecoration: 'none', color: 'inherit'}}
    {...restProps}
    onClick={handleClick}
  />;
}