import { Button, Icon } from '@/shared/ui';
import { BarbellBold, ConfettiBold, AirplaneTiltBold } from '@/shared/ds/icons';
import styles from './SessionCard.module.scss';
import { useNavigate } from '@/shared/navigation';

// TODO: Fix event types with new API structure
const eventTypes = {
  'training:surfing': { icon: BarbellBold, name: 'Серфинг' },
  'training:surfskate': { icon: BarbellBold, name: 'Серфскейт'},
  tour: { icon: AirplaneTiltBold, name: 'Тур' },
  activity: { icon: ConfettiBold, name: 'Ивент' }
} as const;

export interface SessionCardProps {
  data: {
    id: string;
    hasSeats: boolean;
    labels?: string[];
    eventTitle: string;
    eventLocation: string;
    rightTopInner?: string;
    rightBottomInner?: string;
  }
}

function getEventType(labels?: string[]) {
  if (!labels || labels.length === 0) {
    return { icon: ConfettiBold, name: 'Другое' };
  }
  
  for (const label of labels) {
    if (eventTypes[label as keyof typeof eventTypes]) {
      return eventTypes[label as keyof typeof eventTypes];
    }
  }
  
  return { icon: ConfettiBold, name: 'Другое' };
}

export function SessionCard({ data }: SessionCardProps) {
  const navigate = useNavigate();
  const typeData = getEventType(data.labels);

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <div className={styles.left}>
          <div className={styles.type}>
            <Icon src={typeData.icon} width={20} height={20} className={styles.typeIcon}></Icon>
            <div className={styles.typeName}>{typeData.name}</div>
          </div>
          <div className={styles.eventName}>{data.eventTitle}</div>
          <div className={styles.location}>{data.eventLocation}</div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.right}>
          {data.rightTopInner && <div className={styles.top}>{data.rightTopInner}</div>}
          {data.rightBottomInner && <div className={styles.bottom}>{data.rightBottomInner}</div>}
        </div>
      </div>
      <Button
        mode={data.hasSeats ? 'primary' : 'secondary'}
        className={styles.button}
        disabled={!data.hasSeats}
        onClick={() => {navigate(`trainings/sessions/${data.id}`, {tab: 'trainings'})}}
      >
        {data.hasSeats ? 'Перейти к записи' : 'Нет мест'}
      </Button>
    </div>
  )
}