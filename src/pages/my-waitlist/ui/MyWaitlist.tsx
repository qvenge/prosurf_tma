import styles from './MyWaitlist.module.scss';

import { EmptyListStub } from '@/shared/ui'

export function MyWaitlist() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Лист ожиданий</h1>
      <div className={styles.emptyStub}>
        <EmptyListStub message="У вас пока нет записей в листе ожиданий" />
      </div>
    </div>
  );
}