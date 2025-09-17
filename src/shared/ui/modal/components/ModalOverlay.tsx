import { forwardRef, useMemo } from 'react';
import styles from './ModalOverlay.module.scss';

import clsx from 'clsx';
import { hexToRGB } from '@/shared/lib/color';
import { useTelegramTheme } from '@/shared/lib/telegram-sdk';
import { useAppRootContext } from '@/shared/app-root/useAppRootContext';

import { Drawer } from 'vaul';

export interface ModalOverlayProps {
  className?: string;
}

const DEFAULT_LIGHT_OVERLAY_RGB = [255, 255, 255];
const DEFAULT_DARK_OVERLAY_RGB = [33, 33, 33];

export const ModalOverlay = forwardRef<HTMLDivElement, ModalOverlayProps>(({
  className,
  ...props
}, ref) => {
  const context = useAppRootContext();
  const themeParams = useTelegramTheme();

  // We don't use getComputedStyle because overlay renders before the appearance is changing
  const [r, g, b] = useMemo(() => {
    if (themeParams?.bgColor) {
      return hexToRGB(themeParams.bgColor);
    }

    return context.appearance === 'light' ? DEFAULT_LIGHT_OVERLAY_RGB : DEFAULT_DARK_OVERLAY_RGB;
  }, [context.appearance, themeParams]);

  return (
    <Drawer.Overlay
      ref={ref}
      // Opacity on overlay is dynamically calculated based on the percentage of opened drawers
      // This is why we use rgba here and not background: token + opacity
      style={{ background: `rgba(${r}, ${g}, ${b}, .4)` }}
      className={clsx(styles.wrapper, className)}
      {...props}
    />
  );
});
