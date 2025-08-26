'use client';

import { useContext, useRef } from 'react';

import { AppRootContext, type AppRootContextInterface } from '../AppRootContext';

export const usePortalContainer = (portalContainer?: AppRootContextInterface['portalContainer']): NonNullable<AppRootContextInterface['portalContainer']> => {
  const appContext = useContext(AppRootContext);
  const fallbackRef = useRef(null);
  
  if (portalContainer !== undefined) {
    return portalContainer;
  }

  if (appContext.isRendered && appContext.portalContainer !== undefined) {
    return appContext.portalContainer;
  }

  return fallbackRef;
};
