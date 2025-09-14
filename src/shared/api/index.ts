// Main API barrel export file

// Types
export * from './types';

// Schemas (export for validation if needed)
export * from './schemas';

// Configuration and utilities
export { apiClient, tokenStorage, withIdempotency, createQueryString, validateResponse, config } from './config';

// Error handling
export * from './error-handler';

// Authentication
export * from './auth';

// API Clients
export { authClient } from './clients/auth';
export { usersClient } from './clients/users';
export { eventsClient } from './clients/events';
export { sessionsClient } from './clients/sessions';
export { bookingsClient } from './clients/bookings';
export { paymentsClient } from './clients/payments';
export { certificatesClient } from './clients/certificates';
export { seasonTicketsClient } from './clients/season-tickets';
export { cashbackClient } from './clients/cashback';
export { waitlistClient } from './clients/waitlist';
export { adminClient } from './clients/admin';
export { webhooksClient } from './clients/webhooks';

// Hooks - Auth
export * from './hooks/auth';

// Hooks - Users
export * from './hooks/users';

// Hooks - Events
export * from './hooks/events';

// Hooks - Sessions
export * from './hooks/sessions';

// Hooks - Bookings
export * from './hooks/bookings';

// Hooks - Payments
export * from './hooks/payments';

// Hooks - Certificates
export * from './hooks/certificates';

// Hooks - Season Tickets
export * from './hooks/season-tickets';

// Hooks - Cashback
export * from './hooks/cashback';

// Hooks - Waitlist
export * from './hooks/waitlist';

// Hooks - Admin
export * from './hooks/admin';

// Providers
export { ApiProvider } from './providers/ApiProvider';

// Query key factories (for advanced usage)
export { authKeys } from './auth';
export { usersKeys } from './hooks/users';
export { eventsKeys } from './hooks/events';
export { sessionsKeys } from './hooks/sessions';
export { bookingsKeys } from './hooks/bookings';
export { paymentsKeys } from './hooks/payments';
export { certificatesKeys } from './hooks/certificates';
export { seasonTicketsKeys } from './hooks/season-tickets';
export { cashbackKeys } from './hooks/cashback';
export { waitlistKeys } from './hooks/waitlist';
export { adminKeys } from './hooks/admin';

// Common utilities and helpers
export {
  // Role helpers
  hasRole,
  isAdmin,
  isUser,
  requireAuth,
  requireAdmin,
  // Auth utilities
  performLogout,
} from './auth';