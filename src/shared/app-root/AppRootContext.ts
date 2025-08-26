'use client';

import { createContext, type RefObject } from 'react';

export interface AppRootContextInterface {
  platform?: 'base' | 'ios';
  appearance?: 'light' | 'dark';
  portalContainer?: RefObject<HTMLDivElement | null>;
  isRendered: boolean;
}

export const AppRootContext = createContext<AppRootContextInterface>({
  isRendered: false,
});
