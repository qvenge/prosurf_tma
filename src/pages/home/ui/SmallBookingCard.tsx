import { Icon } from '@/shared/ui';
import type { BookingExtended } from '@/shared/api';
import { BarbellBold, ConfettiBold, AirplaneTiltBold } from '@/shared/ds/icons';
import { formatBookingDate } from '@/shared/lib/date-utils';
import styles from './SmallBookingCard.module.scss';

// TODO: Fix event types with new API structure
const eventTypes = {
  'training:surfing': { icon: BarbellBold, name: 'Серфинг' },
  'training:surfskate': { icon: BarbellBold, name: 'Серфскейт'},
  tour: { icon: AirplaneTiltBold, name: 'Тур' },
  activity: { icon: ConfettiBold, name: 'Ивент' }
} as const;

export interface SmallBookingCardProps {
  data: BookingExtended;
}

function getEventType(labels?: string[] | null) {
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

export function SmallBookingCard({ data }: SmallBookingCardProps) {
  const typeData = getEventType(data.session?.event.labels);
  const title = data.session?.event.title || 'Без названия';
  const location = data.session?.event.location;
  const formattedDate = data.session?.startsAt ? formatBookingDate(data.session.startsAt) : '';

  return (
    <div className={styles.wrapper}>
      <div className={styles.type}>
        <Icon src={typeData.icon} width={20} height={20} className={styles.typeIcon} />
        <div className={styles.typeName}>{typeData.name}</div>
      </div>
      <div className={styles.title}>
        {location ? `${location} • ${title}` : title}
      </div>
      <div className={styles.start}>{formattedDate}</div>
    </div>
  )
}