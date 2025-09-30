import styles from './PageLayout.module.scss';
import { ImageSlider } from '@/shared/ui';
import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

export interface PageLayoutProps extends HTMLAttributes<HTMLDivElement> {
  heroImages?: string[];
  title?: string;
}

export function PageLayout({children, heroImages, title, className}: PageLayoutProps) {
  const hasImages = heroImages && heroImages.length > 0;

  return (
    <div className={clsx(styles.wrapper, hasImages && styles.withImages)}>
      <div className={styles.header}>
        {hasImages && <ImageSlider 
          images={heroImages}
          className={styles.imageSlider}
        />}
        {title && <h1 className={styles.title}>{title}</h1>}
      </div>
      <div className={clsx(styles.body, className)}>
        {children}
      </div>
    </div>
  );
}