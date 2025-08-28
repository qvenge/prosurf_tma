import { forwardRef } from 'react';
import type { AllHTMLAttributes, ElementType } from 'react';
import styles from './VisuallyHidden.module.scss';

import clsx from 'clsx';

export interface VisuallyHiddenProps<T> extends AllHTMLAttributes<T> {
  Component?: ElementType;
}

export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps<HTMLSpanElement>>(
  ({ Component = 'span', className, ...restProps }, ref) => (
    <Component {...restProps} ref={ref} className={clsx(styles.wrapper, className)} />
  ),
);
