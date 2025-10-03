import { useMemo } from 'react';
import { formatAvailability, formatPrice } from '../format-utils';
import { formatDuration, formatTime } from '../date-utils';
import type { Session } from '@/shared/api';

export interface SessionCard {
  id: string;
  time: string;
  duration?: string;
  title: string;
  location: string;
  price: string;
  availability: {
    hasSeats: boolean;
    text: string;
  };
}

export interface SessionGroup {
  dateHeader: string;
  sessions: SessionCard[];
}

export const useSessionGroups = (sessions: Session[]) => {
  return useMemo(() => {
    if (!sessions.length) return [];

    const groupedSessions = sessions.reduce((groups, session) => {
      const sessionDate = new Date(session.startsAt);
      const dayName = sessionDate.toLocaleDateString('ru-RU', { weekday: 'long' });
      const day = sessionDate.getDate();
      const monthName = sessionDate.toLocaleDateString('ru-RU', { month: 'long' });
      const dateKey = `${dayName} • ${day} ${monthName}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push({
        id: session.id,
        time: formatTime(session.startsAt),
        duration: formatDuration(session.startsAt, session.endsAt),
        title: session.event.title,
        location: session.event.location || 'Не указано',
        price: formatPrice(session.event.tickets[0]?.full.price),
        availability: formatAvailability(session.remainingSeats)
      });

      return groups;
    }, {} as Record<string, SessionGroup['sessions']>);

    return Object.entries(groupedSessions).map(([dateHeader, sessions]) => ({
      dateHeader,
      sessions
    }));
  }, [sessions]);
};