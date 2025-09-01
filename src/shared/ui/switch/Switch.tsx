'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './Switch.module.scss';

import clsx from 'clsx';

import { VisuallyHidden } from '../visually-hidden';

export interface SwitchProps
  extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * A custom switch component that mimics the behavior of a checkbox input but with enhanced styling.
 * It supports all the standard attributes of an HTML input element of type "checkbox".
 * The appearance of the switch can be customized to match either a base or iOS platform style using CSS modules.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  style,
  className,
  disabled,
  children,
  ...restProps
}, ref) => {
  return (
    <label
      className={clsx(
        styles.wrapper,
        disabled && styles['wrapper--disabled'],
        className,
      )}
    >
      <VisuallyHidden
        {...restProps}
        Component="input"
        type="checkbox"
        className={styles.input}
        disabled={disabled}
        ref={ref}
      />
      <div aria-hidden className={styles.control} />
      {children}
    </label>
  );
});
