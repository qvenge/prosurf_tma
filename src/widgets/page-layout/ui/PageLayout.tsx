import styles from './PageLayout.module.scss';
import { ImageSlider } from '@/shared/ui';
import clsx from 'clsx';
import type { HTMLAttributes } from 'react';

export interface PageLayoutProps extends HTMLAttributes<HTMLDivElement> {
  heroImages?: string[];
  title?: string;
}

export function PageLayout({children, heroImages, title, className}: PageLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        {heroImages && heroImages.length > 0 && <ImageSlider 
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