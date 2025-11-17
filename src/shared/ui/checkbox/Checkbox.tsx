'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.scss';

import clsx from 'clsx';

import { VisuallyHidden } from '../visually-hidden';

export interface CheckboxProps
  extends InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
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
      <div aria-hidden className={styles.control}>
        <div className={styles.check}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.8747 0.310939C11.2553 0.71118 11.2393 1.34414 10.8391 1.7247L4.52872 7.72473C4.33624 7.90775 4.07885 8.00667 3.81333 7.99968C3.54782 7.99269 3.29599 7.88035 3.11341 7.68746L0.273754 4.68746C-0.105905 4.28636 -0.0885258 3.65343 0.31257 3.27378C0.713667 2.89412 1.34659 2.9115 1.72625 3.31259L3.87693 5.58471L9.46094 0.275301C9.86118 -0.105258 10.4941 -0.0893025 10.8747 0.310939Z" fill="#0F0F0F"/>
          </svg>
        </div>
      </div>
      {children}
    </label>
  );
});
