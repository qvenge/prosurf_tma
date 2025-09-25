'use client';

import type { AllHTMLAttributes, ElementType, ReactNode } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';
import { hasReactNode } from '@/shared/lib/react/node';

import { Spinner } from '../spinner';
import { Tapable } from '../tapable';

import styles from './Button.module.scss';

export interface ButtonProps extends Omit<AllHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** Inserts a component before the button text, typically an icon. */
  before?: ReactNode;
  /** Inserts a component after the button text, such as a badge or indicator. */
  after?: ReactNode;
  /** Controls the size of the button, influencing padding and font size. */
  size?: 's' | 'm' | 'l';
  /** If true, stretches the button to fill the width with its container. */
  stretched?: boolean;
  /** Defines the button's visual style, affecting its background and text color. */
  mode?: 'primary' | 'secondary';
  /** Displays a loading indicator in place of the button content when true. */
  loading?: boolean;
  /** Disables the button, preventing user interactions, when true. */
  disabled?: boolean;
  /** Specifies the root element type for the button, allowing for semantic customization or integration with routing libraries. */
  Component?: ElementType;
}

const modeStyles = {
  primary: styles['wrapper--primary'],
  secondary: styles['wrapper--secondary'],
};

const sizeStyles = {
  s: styles['wrapper--s'],
  m: styles['wrapper--m'],
  l: styles['wrapper--l'],
};

/**
 * Renders a button or a button-like element with customizable properties, such as size, mode, and loading state. Supports adding icons or other elements before and after the text.
 */
export const Button = forwardRef(({
  type,
  size = 'm',
  before,
  after,
  stretched,
  children,
  className,
  mode = 'primary',
  loading,
  Component = 'button',
  ...restProps
}: ButtonProps, ref) => {
  return (
    <Tapable
      ref={ref}
      type={type || 'button'}
      Component={Component}
      className={clsx(
        styles.wrapper,
        mode && modeStyles[mode],
        size && sizeStyles[size],
        stretched && styles['wrapper--stretched'],
        loading && styles['wrapper--loading'],
        className,
      )}
      {...restProps}
    >
      {loading && <Spinner className={styles.spinner} size="s" />}
      {hasReactNode(before) && (
        <div className={styles.before}>
          {before}
        </div>
      )}
      <div className={styles.content}>{children}</div>
      {hasReactNode(after) && (
        <div className={styles.after}>
          {after}
        </div>
      )}
    </Tapable>
  );
});
