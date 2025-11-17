import styles from './ArticlePage.module.scss';
import { PageLayout } from '@/widgets/page-layout';

export const ArticlePage = () => {
  return (
    <PageLayout>
      <div className={styles.articlePage}>
        <h1>Article Page</h1>
        <p>This is where the article content will be displayed.</p>
      </div>
    </PageLayout>
  );
}