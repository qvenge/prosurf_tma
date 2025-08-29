export interface FormattedSession {
  id: string;
  time: string;
  duration?: string;
  title: string;
  location: string;
  price: string;
  availability: { hasSeats: boolean; text: string };
}

export interface SessionGroup {
  dateHeader: string;
  sessions: FormattedSession[];
}