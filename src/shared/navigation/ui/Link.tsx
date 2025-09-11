import { useCallback } from 'react';
import { useNavigator} from './Navigator';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  to: string;
  params?: { [key: string]: string | number | boolean }
}

export function Link({to, params, style, ...restProps}: LinkProps) {
  const navigator = useNavigator();
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.push(to);
  }, [navigator]);

  return <a
    style={{...style, textDecoration: 'none', color: 'inherit'}}
    {...restProps}
    href={to}
    onClick={handleClick}
  />;
}