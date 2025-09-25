# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with hot reload
pnpm run dev

# Type checking and production build
pnpm run build

# Lint TypeScript and React code
pnpm run lint

# Preview production build
pnpm run preview
```

## Architecture

This is a **Telegram Mini App** built with React 19 + TypeScript + Vite using **Feature-Sliced Design (FSD)** architecture.

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, React Router 7
- **Styling**: SCSS modules with design system
- **State Management**: React Query (TanStack Query)
- **Authentication**: Telegram Mini App SDK with auto-login
- **UI**: Custom Telegram UI components + Telegram Apps UI library
- **API**: Axios with comprehensive React Query hooks
- **Validation**: Zod schemas

### Project Structure

```
src/
├── app/           # Application layer (routing, providers, app shell)
├── pages/         # Page components (route handlers)
├── features/      # Business logic features
├── shared/        # Shared resources across the app
│   ├── api/       # API clients, hooks, and configuration
│   ├── ui/        # Reusable UI components
│   ├── lib/       # Utility functions and helpers
│   ├── types/     # TypeScript type definitions
│   ├── tma/       # Telegram Mini App integration
│   └── ds/        # Design system (colors, icons, variables)
└── widgets/       # Complex UI widgets
```

### Key Configuration

- **Path Aliases**: `@/` → `src/`
- **Styling**: SCSS with automatic DS imports: `@use "@/shared/lib/style-utils"` and `@use "@/shared/ds"`
- **Build Output**: `dist/` directory
- **Assets**: SVG icons are not inlined as base64

## API Layer

The app uses React Query for server state management with a structured API layer:

- **Clients**: `src/shared/api/clients/` - Axios-based API clients for each domain
- **Hooks**: `src/shared/api/hooks/` - React Query hooks for data fetching
- **Schemas**: Zod validation schemas for API responses
- **Types**: TypeScript interfaces for API data
- **Configuration**: Centralized API config with token management

### Authentication
- Telegram Mini App authentication via `useTelegramAutoLogin`
- Token storage and automatic refresh
- Role-based access control (admin/user)

## UI Components

Custom component library in `src/shared/ui/` with:
- Telegram-native styling and behavior
- SCSS modules for styling
- TypeScript props with proper typing
- Accessibility features

## Development Notes

- **Telegram Environment**: App only works within Telegram Mini App context
- **OpenAPI**: API contracts available in `openapi_v*.yaml` files
- **ESLint**: Configured with TypeScript and React rules
- **No Tests**: No testing framework currently configured
- **Vite HMR**: Fast development with React SWC plugin

## Common Patterns

- Use barrel exports (`index.ts`) in feature folders
- SCSS modules for component styling
- React Query for all server state
- Custom hooks for complex logic
- Feature-based organization following FSD principles