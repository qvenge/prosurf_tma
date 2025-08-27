'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import styles from './AppRoot.module.scss';

import clsx from 'clsx';
import { multipleRef } from '@/shared/lib/react/refs';
import { useObjectMemo } from '@/shared/tgui-lib/useObjectMemo';

import { AppRootContext, type AppRootContextInterface } from './AppRootContext';
import { useAppearance } from './hooks/useAppearance';
import { usePlatform } from './hooks/usePlatform';
import { usePortalContainer } from './hooks/usePortalContainer';

export interface AppRootProps extends HTMLAttributes<HTMLDivElement> {
  /** Application platform, determined automatically if nothing passed */
  platform?: AppRootContextInterface['platform'];
  /** Application appearance, determined automatically if nothing passed */
  appearance?: AppRootContextInterface['appearance'];
  /** Rewriting portal container for rendering, AppRoot container as default */
  portalContainer?: AppRootContextInterface['portalContainer'];
}

export const AppRoot = forwardRef<HTMLDivElement, AppRootProps>(({
  platform: platformProp,
  appearance: appearanceProp,
  portalContainer: portalContainerProp,
  children,
  className,
  ...restProps
}, ref) => {
  const appearance = useAppearance(appearanceProp);
  const portalContainer = usePortalContainer(portalContainerProp);
  const platform = usePlatform(platformProp);

  const contextValue = useObjectMemo({
    platform,
    appearance,
    portalContainer,
    isRendered: true,
  });

  return (
    <div
      ref={multipleRef(ref, portalContainer)}
      className={clsx(
        styles.wrapper,
        platform === 'ios' && styles['wrapper--ios'],
        appearance === 'dark' && styles['wrapper--dark'],
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
