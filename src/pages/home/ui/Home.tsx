import clsx from 'clsx';
import { PageLayout } from '@/widgets/page-layout'
import styles from './Home.module.scss';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];

export const HomePage = () => {

  return (
    <PageLayout heroImages={heroImages}>
      <div className={styles.wrapper}>
        
      </div>
    </PageLayout>
  );
};