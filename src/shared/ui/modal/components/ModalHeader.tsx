import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import styles from './ModalHeader.module.scss';

import clsx from 'clsx';

import { Text } from '@/shared/typography';

export interface ModalHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Inserts a component before the header text, e.g. Icon */
  before?: ReactNode;
  /** Inserts a component after the header text, e.g. Icon */
  after?: ReactNode;
}

export const ModalHeader = forwardRef<HTMLElement, ModalHeaderProps>(({
  before,
  after,
  className,
  children,
  ...props
}, ref) => {
  return (
    <header
      ref={ref}
      className={clsx(styles.wrapper, className)}
      {...props}
    >
      <div className={styles.before}>
        {before}
      </div>
      <Text weight="2" className={styles.children}>{children}</Text>
      <div className={styles.after}>
        {after}
      </div>
    </header>
  );
});
