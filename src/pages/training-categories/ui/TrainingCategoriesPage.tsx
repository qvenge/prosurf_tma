
import { useState } from 'react';
import { PageLayout } from '@/widgets/page-layout';
import { SegmentedControl, ImageSlider, Button } from '@/shared/ui';
import { useImages } from '@/shared/api';
import { useNavigate } from '@/shared/navigation';
import styles from './TrainingCategoriesPage.module.scss';

const descriptions = {
  surfing: `Наши тренировки по серфингу предназначены для всех уровней подготовки — от новичков до опытных серферов. 
  Под руководством наших квалифицированных инструкторов вы научитесь основам серфинга, технике гребли`,
  surfskate: `Тренировки по серфскейту помогут вам развить баланс, координацию и технику катания, которые
  пригодятся вам на воде. Наши опытные тренеры проведут вас через все этапы обучения, от базовых движений до сложных трюков.`
};

export function TrainingCategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'surfing' | 'surfskate'>('surfing');

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
        <CategoryContent type={selectedCategory} />
      </div>
    </PageLayout>
  );
};

function CategoryContent({
  type
}: {type: 'surfing' | 'surfskate'}) {
  const navigate = useNavigate();

  const { data } = useImages({"tags.any": [`training:${type}`]});
  const images = data?.items.map(item => item.url) ?? [];

  return (
    <div className={styles.categoryContent}>
      <ImageSlider 
        images={images}
        className={styles.images}
      />
      <div className={styles.description}>
        <h2 className={styles.descriptionHeading}>Описание</h2>
        <p className={styles.descriptionText}>{descriptions[type]}</p>
      </div>
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