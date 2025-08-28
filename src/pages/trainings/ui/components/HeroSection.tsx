import { ImageSlider } from '@/shared/ui';

import styles from './HeroSection.module.scss';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];

export const HeroSection = () => {
  return (
    <div className={styles.heroSection}>
      <ImageSlider 
        images={heroImages}
        className={styles.imageSlider}
      />
      <h1 className={styles.title}>Тренировки по серфингу</h1>
    </div>
  );
};