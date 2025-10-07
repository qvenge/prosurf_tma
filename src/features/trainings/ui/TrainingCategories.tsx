import { TrainingCategoryItem } from './TrainingCategoryItem';
import styles from './TrainingCategories.module.scss';
import clsx from 'clsx';
import surfingImg from './images/surfing1.jpg';
import surfskateImg from './images/surfskate1.png';

type TrainingCategoriesProps = React.HTMLAttributes<HTMLDivElement>;


export function TrainingCategories({ className }: TrainingCategoriesProps) {
  return (
    <div className={clsx(className, styles.categories)}>
      <TrainingCategoryItem
        title="Серфинг"
        imageUrl={surfingImg}
        eventType="training:surfing"
      />
      <TrainingCategoryItem
        title="Серфскейт"
        imageUrl={surfskateImg}
        eventType="training:surfskate"
      />
    </div>
  );
}