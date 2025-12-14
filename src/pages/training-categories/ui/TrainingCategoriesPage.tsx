import { useState, useMemo } from 'react';
import { PageLayout } from '@/widgets/page-layout';
import { SegmentedControl, ImageSlider, Button, MarkdownRenderer } from '@/shared/ui';
import { useImages, useContentsByKeys } from '@/shared/api';
import { useNavigate } from '@/shared/navigation';
import styles from './TrainingCategoriesPage.module.scss';

export function TrainingCategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'surfing' | 'surfskate'>('surfing');

  // Fetch training descriptions from CMS
  const { data: trainingContents } = useContentsByKeys(['training.surfing', 'training.surfskate']);
  const contentMap = useMemo(() => {
    if (!trainingContents) return {};
    return Object.fromEntries(trainingContents.map(c => [c.key, c]));
  }, [trainingContents]);

  return (
    <PageLayout title='Тренировки'>
      <div className={styles.wrapper}>
        <SegmentedControl className={styles.segmentedControl}>
          <SegmentedControl.Item
            selected={selectedCategory === 'surfing'}
            onClick={() => setSelectedCategory('surfing')}
          >
            Серфинг
          </SegmentedControl.Item>
          <SegmentedControl.Item
            selected={selectedCategory === 'surfskate'}
            onClick={() => setSelectedCategory('surfskate')}
          >
            Серфскейт
          </SegmentedControl.Item>
        </SegmentedControl>
        <CategoryContent type={selectedCategory} contentMap={contentMap} />
      </div>
    </PageLayout>
  );
};

function CategoryContent({
  type,
  contentMap
}: {
  type: 'surfing' | 'surfskate';
  contentMap: Record<string, { key: string; title: string; content: string }>;
}) {
  const navigate = useNavigate();

  const { data } = useImages({"tags.any": [`training:${type}`]});
  const images = data?.items.map(item => item.url) ?? [];

  const contentKey = `training.${type}`;
  const content = contentMap[contentKey];

  return (
    <div className={styles.categoryContent}>
      <ImageSlider
        images={images}
        className={styles.images}
      />
      {content && (
        <div className={styles.description}>
          <h2 className={styles.descriptionHeading}>Описание</h2>
          <MarkdownRenderer content={content.content} className={styles.descriptionText} />
        </div>
      )}
      <Button
        className={styles.button}
        size='l'
        stretched
        onClick={() => navigate(`/trainings/categories/${type}`)}
      >
        Смотреть расписание
      </Button>
    </div>
  );
}
