import styles from './MySubscriptions.module.scss';

import { EmptyListStub } from '@/shared/ui'

export function MySubscriptions() {
  return (
    <div>
      <h1>Мои история покупок</h1>
      <div className={styles.emptyStub}>
        <EmptyListStub message="У вас пока нет покупок" />
      </div>
    </div>
  );
}