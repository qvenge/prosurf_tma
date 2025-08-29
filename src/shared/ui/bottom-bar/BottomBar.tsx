import { useCallback, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { useMatches } from 'react-router';
import clsx from 'clsx';
import { usePlatform } from '@/shared/app-root/usePlatform';
import { useBottomBar } from './BottomBarContext';
import styles from './BottomBar.module.scss';

export interface BottomBarProps extends HTMLAttributes<HTMLDivElement> {
  onHeightChange: (val: number) => void;
}

export function BottomBar({ className, onHeightChange, ...restProps }: BottomBarProps) {
  const matches = useMatches();
  const { content } = useBottomBar();
  const platform = usePlatform();

  const measuredRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    const resizeObserver = new ResizeObserver(() => { 
      onHeightChange(node.getBoundingClientRect().height);
    });
    resizeObserver.observe(node);
  }, [onHeightChange]);

  // Берём метаданные из самого “глубокого” совпавшего роута
  const deepest = matches[matches.length - 1];
  const meta = (deepest?.handle as any)?.bottomBar ?? {};
  const visible = meta?.visible ?? true; // дефолт: видим

  if (!visible) return null;

  const node = (
    <div
      ref={measuredRef}
      className={clsx(
        styles.wrapper,
        platform === 'ios' && styles['wrapper--ios'],
        className,
      )}
      role="contentinfo"
      aria-label="Bottom bar"
      {...restProps}
    >
      {content}
    </div>
  );

  return createPortal(node, document.body);
}
