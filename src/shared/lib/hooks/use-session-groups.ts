import { useMemo } from 'react';
import { formatDuration, formatAvailability, formatPrice } from '../format-utils';
import type { SessionGroupProps } from '../../ui/session-group';

interface EventSession {
  id: string;
  start: string;
  end: string | null;
  title: string;
  location: string;
  price: { amount: string; currency: string };
  remainingSeats: number;
}

export const useSessionGroups = (eventSessions: EventSession[]) => {
  return useMemo(() => {
    if (!eventSessions.length) return [];

    const groupedSessions = eventSessions.reduce((groups, session) => {
      const sessionDate = new Date(session.start);
      const dayName = sessionDate.toLocaleDateString('ru-RU', { weekday: 'long' });
      const day = sessionDate.getDate();
      const monthName = sessionDate.toLocaleDateString('ru-RU', { month: 'long' });
      const dateKey = `${dayName} • ${day} ${monthName}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push({
        id: session.id,
        time: new Date(session.start).toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: formatDuration(session.start, session.end),
        title: session.title,
        location: session.location,
        price: formatPrice(session.price),
        availability: formatAvailability(session.remainingSeats)
      });

      return groups;
    }, {} as Record<string, SessionGroupProps['sessions']>);

    return Object.entries(groupedSessions).map(([dateHeader, sessions]) => ({
      dateHeader,
      sessions
    }));
  }, [eventSessions]);
};