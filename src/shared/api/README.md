# ProSurf API Integration

This directory contains a comprehensive API integration layer built with TanStack Query, Zod validation, and Axios, following Feature-Sliced Design methodology.

## Architecture

```
shared/api/
├── config.ts              # Axios configuration and interceptors
├── schemas.ts              # Zod validation schemas
├── error-handler.ts        # Centralized error handling
├── query-client.ts         # TanStack Query client configuration
├── auth.ts                # Authentication API functions
├── event-sessions.ts       # Event sessions API functions
├── users.ts               # User profile API functions
├── hooks/                 # Custom TanStack Query hooks
│   ├── use-auth.ts        # Authentication hooks
│   ├── use-event-sessions.ts # Event sessions hooks
│   └── use-user.ts        # User profile hooks
├── providers/             # React context providers
│   ├── api-provider.tsx   # Main API provider
│   └── query-provider.tsx # Query client provider
└── examples/              # Usage examples
    └── usage-examples.tsx
```

## Features

- ✅ JWT Authentication with automatic token management
- ✅ Request/response interceptors for auth headers
- ✅ Comprehensive Zod validation for all API data
- ✅ Type-safe API hooks with TanStack Query
- ✅ Centralized error handling with custom error classes
- ✅ Automatic token refresh on 401 errors
- ✅ Local storage integration for token persistence
- ✅ Rate limiting and retry logic
- ✅ Infinite query support for pagination

## Quick Start

### 1. Setup Provider

The API provider is already integrated in `src/app/main.tsx`:

```tsx
import { ApiProvider } from '@/shared/api';

<ApiProvider>
  <RouterProvider router={router} />
</ApiProvider>
```

### 2. Authentication

```tsx
import { useLogin, useRegister, useLogout, useUserProfile } from '@/shared/api';

function AuthComponent() {
  const { mutate: login, isPending } = useLogin();
  const { data: user } = useUserProfile();
  
  const handleLogin = () => {
    login({ 
      email: 'user@example.com', 
      password: 'password123' 
    });
  };
  
  return (
    <div>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <button onClick={handleLogin} disabled={isPending}>
          Login
        </button>
      )}
    </div>
  );
}
```

### 3. Event Sessions

```tsx
import { useEventSessions, useEventSession } from '@/shared/api';

function EventsComponent() {
  const { data: sessions, isLoading } = useEventSessions({
    filters: { 
      types: ['surfingTraining'],
      minRemainingSeats: 1 
    },
    limit: 10
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {sessions?.map(session => (
        <div key={session.title}>
          <h3>{session.title}</h3>
          <p>Price: {session.price.amount} {session.price.currency}</p>
          <p>Available: {session.remainingSeats} seats</p>
        </div>
      ))}
    </div>
  );
}
```

## Available Hooks

### Authentication
- `useLogin()` - Login with email/password
- `useRegister()` - Register new user account
- `useLogout()` - Logout and clear tokens
- `useLogoutAll()` - Clear all auth data
- `useUserProfile()` - Get current user profile
- `useIsAuthenticated()` - Check auth status

### Event Sessions
- `useEventSessions(query)` - Get paginated event sessions
- `useInfiniteEventSessions(query)` - Infinite scroll event sessions
- `useEventSession(id)` - Get single event session
- `useUpcomingEventSessions(filters)` - Get upcoming sessions
- `useEventSessionsByType(type)` - Get sessions by event type

## API Configuration

### Environment Variables
Create a `.env` file (see `.env.example`):

```
VITE_API_URL=http://localhost:3000
```

### Error Handling
All API errors are handled through a centralized error handler that converts axios errors into typed ProSurf API errors:

```tsx
import { isAuthError, isValidationError, getErrorMessage } from '@/shared/api';

// Check specific error types
if (isAuthError(error)) {
  // Handle authentication error
}

if (isValidationError(error)) {
  // Handle validation error
}

// Get user-friendly error message
const message = getErrorMessage(error);
```

## Type Safety

All API responses are validated using Zod schemas, ensuring type safety throughout the application:

- Input validation on API calls
- Response validation from server
- TypeScript types generated from schemas
- Runtime validation prevents bad data

## Query Keys

The following query key patterns are used:
- `['user', 'profile']` - User profile
- `['event-sessions', query]` - Event sessions with query params
- `['event-sessions', 'infinite', query]` - Infinite event sessions
- `['event-sessions', id]` - Single event session

This allows for precise cache invalidation and updates when data changes.