import { ImageSlider } from '@/shared/ui';

import styles from './HeroSection.module.scss';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];

interface HeroSectionProps {
  title?: string;
}

export const HeroSection = ({ title = 'Тренировки' }: HeroSectionProps) => {
  return (
    <div className={styles.heroSection}>
      <ImageSlider 
        images={heroImages}
        className={styles.imageSlider}
      />
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
};