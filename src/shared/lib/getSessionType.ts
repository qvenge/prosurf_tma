import type { Session } from '@/shared/api';

export type SessionType = 'Серфинг' | 'Серфскейт' | 'Тур' | 'Ивент';

const sessionTypeByLabel: Record<string, SessionType> = {
  'training:surfing': 'Серфинг',
  'training:surfskate': 'Серфскейт',
  'tour': 'Тур',
  'activity': 'Ивент',
}

export function getSessionType(session: Session): SessionType | 'Сессия' {
  const label = session.event.labels?.find((label) => Object.keys(sessionTypeByLabel).includes(label));
  return label ? sessionTypeByLabel[label] : 'Сессия';
}
