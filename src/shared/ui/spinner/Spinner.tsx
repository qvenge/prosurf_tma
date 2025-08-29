'use client';

import styles from './Spinner.module.scss';

import clsx from 'clsx';
import { usePlatform } from '@/shared/app-root/usePlatform';

import { BaseSpinner } from './components/BaseSpinner/BaseSpinner';
import { IOSSpinner } from './components/IOSSpinner/IOSSpinner';
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
  const platform = usePlatform();

  const Component = platform === 'ios' ? IOSSpinner : BaseSpinner;
  return (
    <div
      role="status"
      className={clsx(
        styles.wrapper,
        platform === 'ios' && styles['wrapper--ios'],
        sizeStyles[size],
        className,
      )}
    >
      <Component size={size} />
    </div>
  );
};
