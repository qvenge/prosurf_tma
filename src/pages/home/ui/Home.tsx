import styles from './Home.module.scss';

import bannerSrc from './78a995e4a40eefc86ddc0dbe832752a2d21d4162.png';

export function Home() {
  return (
    <div className={styles.root}>
      <div className={styles.bannerWrapper}>
        <img className={styles.banner} src={bannerSrc} alt="banner" />
      </div>
      <div className={styles.content}>
        

      </div>
    </div>
  );
}