import { useCallback } from 'react';
import { useNavigator} from './Navigator';

export interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  name: string;
  params: { [key: string]: string | number | boolean }
}

export function NavLink({name, params, style, ...restProps}: NavLinkProps) {
  const navigator = useNavigator();
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.switchTab(name as any);
  }, [navigator]);

  return <a
    style={{...style, textDecoration: 'none', color: 'inherit'}}
    {...restProps}
    onClick={handleClick}
  />;
}