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
export { clientsClient } from './clients/clients';
export { eventsClient } from './clients/events';
export { sessionsClient } from './clients/sessions';
export { bookingsClient } from './clients/bookings';
export { paymentsClient } from './clients/payments';
export { certificatesClient } from './clients/certificates';
export { seasonTicketsClient } from './clients/season-tickets';
export { cashbackClient } from './clients/cashback';
export { waitlistClient } from './clients/waitlist';
export { webhooksClient } from './clients/webhooks';
export { imagesClient } from './clients/images';

// Hooks - Auth
export * from './hooks/auth';

// Hooks - Clients
export * from './hooks/clients';

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

// Hooks - Images
export * from './hooks/images';

// Providers
export { ApiProvider } from './providers/ApiProvider';

// Query key factories (for advanced usage)
export { authKeys } from './auth';
export { clientsKeys } from './hooks/clients';
export { eventsKeys } from './hooks/events';
export { sessionsKeys } from './hooks/sessions';
export { bookingsKeys } from './hooks/bookings';
export { paymentsKeys } from './hooks/payments';
export { certificatesKeys } from './hooks/certificates';
export { seasonTicketsKeys } from './hooks/season-tickets';
export { cashbackKeys } from './hooks/cashback';
export { waitlistKeys } from './hooks/waitlist';
export { imagesKeys } from './hooks/images';

// Common utilities and helpers
export {
  // Role helpers
  hasRole,
  isUser,
  requireAuth,
  // Auth utilities
  performLogout,
} from './auth';