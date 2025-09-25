'use client';

import { type AllHTMLAttributes, type ElementType, forwardRef } from 'react';
import styles from './Tapable.module.css';

import clsx from 'clsx';

import { useRipple } from './components/Ripple/hooks/useRipple';
import { Ripple } from './components/Ripple/Ripple';

export interface TapableProps extends AllHTMLAttributes<HTMLElement> {
  /** HTML Tag */
  Component?: ElementType;
  interactiveAnimation?: 'opacity' | 'background';
}

type Platform = 'ios' | 'base';

const platform: Platform = 'base';

export const Tapable = forwardRef(({
  Component = 'div',
  children,
  className,
  interactiveAnimation = 'background',
  readOnly,
  ...restProps
}: TapableProps, ref) => {
  const { clicks, onPointerCancel, onPointerDown } = useRipple();

  const hasRippleEffect = platform === 'base' && interactiveAnimation === 'background' && !readOnly;
  return (
    <Component
      ref={ref}
      className={clsx(
        styles.wrapper,
        interactiveAnimation === 'opacity' && styles['wrapper--opacity'],
        className,
      )}
      onPointerCancel={onPointerCancel}
      onPointerDown={onPointerDown}
      readOnly={readOnly}
      {...restProps}
    >
      {hasRippleEffect && <Ripple clicks={clicks} />}
      {children}
    </Component>
  );
});
