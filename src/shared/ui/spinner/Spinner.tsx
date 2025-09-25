'use client';

import styles from './Spinner.module.scss';

import clsx from 'clsx';
import { BaseSpinner } from './components/BaseSpinner/BaseSpinner';
import { type SpinnerProps } from './types';

export * from './types';

const sizeStyles = {
  s: styles['wrapper--s'],
  m: styles['wrapper--m'],
  l: styles['wrapper--l'],
};

/**
 * Provides a visual indicator for loading states across different platforms. It automatically selects
 * an appropriate spinner style based on the current platform, allowing for a consistent user experience.
 */
export const Spinner = ({
  size = 'm',
  className,
}: SpinnerProps) => {

  const Component = BaseSpinner;
  return (
    <div
      role="status"
      className={clsx(
        styles.wrapper,
        sizeStyles[size],
        className,
      )}
    >
      <Component size={size} />
    </div>
  );
};
