import { Icon } from '@/shared/ui';
import { BarbellBold, ConfettiBold, AirplaneTiltBold } from '@/shared/ds/icons';
import { type Session } from '@/shared/api'
import styles from './BookingCard.module.scss';

// TODO: Fix event types with new API structure
const eventTypes = {
  surfingTraining: { icon: BarbellBold, name: 'Серфинг' },
  surfskateTraining: { icon: BarbellBold, name: 'Серфскейт'},
  tour: { icon: AirplaneTiltBold, name: 'Тур' },
  other: { icon: ConfettiBold, name: 'Ивент' }
} as const;

export interface BookingCardProps {
  data: {
    type: keyof typeof eventTypes;
    eventTitle: string;
    eventLocation: string;
    rightTopInner?: string;
    rightBottomInner?: string;
  }
}

export function BookingCard({ data }: BookingCardProps) {
  const typeData = eventTypes[data.type];

  return (
    <div className={styles.wrapper}>
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
  )
}