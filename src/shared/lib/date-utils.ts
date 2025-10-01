const DAY_MS = 24 * 60 * 60 * 1000;

export const getCurrentAndNextMonth = () => {
  const now = new Date();
  const currentMonth = now.toLocaleDateString('ru-RU', { month: 'long' });
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1).toLocaleDateString('ru-RU', { month: 'long' });
  return {
    current: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
    next: nextMonth.charAt(0).toUpperCase() + nextMonth.slice(1)
  };
};

export const getMonthDateRange = (monthName: string) => {
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('ru-RU', { month: 'long' });
  const isCurrentMonth = monthName.toLowerCase() === currentMonthName;
  
  const targetDate = isCurrentMonth ? now : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  const dateFrom = new Date(year, month, 1).toISOString();
  const dateTo = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  
  return { dateFrom, dateTo };
};

export const formatTourDates = (start: string, end: string | null) => {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;
  
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  
  const startMonth = startDate.toLocaleDateString('ru-RU', { month: 'long' });
  const endMonth = endDate.toLocaleDateString('ru-RU', { month: 'long' });
  
  const year = startDate.getFullYear().toString();
  
  if (startMonth === endMonth) {
    return {
      dates: `${startDay} – ${endDay} ${startMonth}`,
      year: `${year} г`
    };
  } else {
    return {
      dates: `${startDay} ${startMonth} – ${endDay} ${endMonth}`,
      year: `${year} г`
    };
  }
};

export const formatTime = (datetime: string) => {
  const date = new Date(datetime);
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
};

export const formatSessionDate = (datetime: string) => {
  const date = new Date(datetime);
  const dayAndMonth = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' });
  
  return `${dayAndMonth} • ${weekday}`;
};

export const groupSessionsByDate = <T extends { start?: string; startsAt?: string }>(events: T[]) => {
  const grouped = events.reduce((acc, event) => {
    const dateStr = event.startsAt || event.start;
    if (!dateStr) return acc;
    const dateKey = new Date(dateStr).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, T[]>);

  return Object.entries(grouped).map(([, events]) => {
    const firstEvent = events[0];
    const dateStr = firstEvent.startsAt || firstEvent.start;
    return {
      date: formatSessionDate(dateStr!),
      events
    };
  });
};

export const getDiffBetweenDates = (startsAt: string, endsAt?: string | null): number => {
  return endsAt ? (new Date(endsAt).getTime() - new Date(startsAt).getTime()) : 0;
}

export const isTheSameDay = (startsAt: string, endsAt?: string | null) => {
  return getDiffBetweenDates(startsAt, endsAt) < DAY_MS;
}

export const formatDuration = (startsAt: string, endsAt?: string | null): string | undefined => {
  const diff = getDiffBetweenDates(startsAt, endsAt);

  if (diff < 0) return;

  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.round((diff % (60 * 60 * 1000)) / (60 * 1000));
  const parts: string[] = [];

  if (hours) parts.push(`${hours} ч`);
  if (minutes) parts.push(`${minutes} мин`);

  return parts.length ? parts.join(' ') : '0 мин';
};

export const pluralRules = new Intl.PluralRules('ru-RU', { type: 'cardinal' });

export const formatRange = (startsAt: string, endsAt?: string | null): string => {
  const formatedStart = new Date(startsAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });

  if (!endsAt) return formatedStart;

  const formatedEnd = new Date(endsAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });

  return `${formatedStart} – ${formatedEnd}`;
}

export const formatRangeWithYear = (startsAt: string, endsAt?: string | null): string => {
  const isSameYear = endsAt ? new Date(startsAt).getFullYear() === new Date(endsAt).getFullYear() : true;

  const formatedStart = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long'
  }).format(new Date(startsAt));

  if (!endsAt) {
    return `${formatedStart}, ${new Date(startsAt).getFullYear()} г`;
  }

  const formatedEnd = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long'
  }).format(new Date(endsAt));

  if (isSameYear) {
    return `${formatedStart} – ${formatedEnd}, ${new Date(startsAt).getFullYear()} г`;
  }

  return `${formatedStart}, ${new Date(startsAt).getFullYear()} г – ${formatedEnd}, ${new Date(endsAt).getFullYear()} г`;
};
