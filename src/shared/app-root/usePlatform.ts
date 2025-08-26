'use client';

import { useAppRootContext } from './useAppRootContext';

import type { AppRootContextInterface } from './AppRootContext';

export const usePlatform = (): NonNullable<AppRootContextInterface['platform']> => {
  const context = useAppRootContext();
  return context.platform || 'base';
};
