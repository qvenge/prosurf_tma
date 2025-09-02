import { Icon } from '../icon';
import { InfoFill } from '@/shared/ds';
import styles from './EmptyListStub.module.scss';

export interface EmptyListStubProps extends React.PropsWithChildren {
  message: string;
}

export function EmptyListStub({ message }: EmptyListStubProps) {
  return (
    <div className={styles.wrapper}>
      <Icon className={styles.icon} src={InfoFill} width={48} height={48}/>
      <p className={styles.message}>{message}</p>
    </div>
  );
}