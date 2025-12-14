import { useParams } from 'react-router';
import styles from './ArticlePage.module.scss';
import { PageLayout } from '@/widgets/page-layout';
import { useContentByKey } from '@/shared/api';
import { MarkdownRenderer, Spinner } from '@/shared/ui';

type ArticleType = 'payment-rules' | 'cancellation-rules' | 'contract' | 'safety';

const validArticleTypes: ArticleType[] = ['payment-rules', 'cancellation-rules', 'contract', 'safety'];

export const ArticlePage = () => {
  const { articleType } = useParams<{ articleType: string }>();

  const isValidArticleType = (type: string | undefined): type is ArticleType => {
    return type !== undefined && validArticleTypes.includes(type as ArticleType);
  };

  const contentKey = isValidArticleType(articleType) ? `article.${articleType}` : '';
  const { data: article, isLoading } = useContentByKey(contentKey, { enabled: !!contentKey });

  if (!isValidArticleType(articleType)) {
    return (
      <PageLayout title="Статья не найдена">
        <p className={styles.content}>К сожалению, запрашиваемая статья не найдена.</p>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title="Загрузка...">
        <div className={styles.loading}>
          <Spinner size="l" />
        </div>
      </PageLayout>
    );
  }

  if (!article) {
    return (
      <PageLayout title="Статья не найдена">
        <p className={styles.content}>К сожалению, запрашиваемая статья не найдена.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={article.title}>
      <MarkdownRenderer content={article.content} className={styles.content} />
    </PageLayout>
  );
}
