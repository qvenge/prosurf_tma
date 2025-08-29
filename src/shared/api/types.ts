export type Currency = 'RUB' | 'USD';

export type EventType = 'surfingTraining' | 'surfskateTraining' | 'tour' | 'other';

export interface Price {
  currency: Currency;
  amount: string;
}

export interface DescriptionSection {
  heading: string;
  body: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface EventSession {
  id: string;
  title: string;
  type: EventType;
  location: string;
  capacity: number;
  start: string;
  end: string | null;
  bookingPrice: Price | null;
  price: Price;
  remainingSeats: number;
  description: DescriptionSection[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface EventSessionFilters {
  types?: EventType[];
  minRemainingSeats?: number;
}

export interface GetEventSessionsQuery {
  dateFrom?: string;
  dateTo?: string;
  filters?: EventSessionFilters;
  offset?: number;
  limit?: number;
}