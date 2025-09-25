'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import styles from './AppRoot.module.scss';

import clsx from 'clsx';
import { multipleRef } from '@/shared/lib/react/refs';
import { useObjectMemo } from '@/shared/tgui-lib/useObjectMemo';

import { AppRootContext, type AppRootContextInterface } from './AppRootContext';
import { usePortalContainer } from './hooks/usePortalContainer';

export interface AppRootProps extends HTMLAttributes<HTMLDivElement> {
  /** Rewriting portal container for rendering, AppRoot container as default */
  portalContainer?: AppRootContextInterface['portalContainer'];
}

export const AppRoot = forwardRef<HTMLDivElement, AppRootProps>(({
  portalContainer: portalContainerProp,
  children,
  className,
  ...restProps
}, ref) => {
  const portalContainer = usePortalContainer(portalContainerProp);

  const contextValue = useObjectMemo({
    portalContainer,
    isRendered: true,
  });

  return (
    <div
      ref={multipleRef(ref, portalContainer)}
      className={clsx(
        styles.wrapper,
        className,
      )}
      {...restProps}
    >
      <AppRootContext.Provider value={contextValue}>
        {children}
      </AppRootContext.Provider>
    </div>
  );
});
