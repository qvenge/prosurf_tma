# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start the development server with hot module reloading
- `pnpm build` - Build the application for production (runs TypeScript compiler first, then Vite build)
- `pnpm preview` - Preview the production build locally
- `pnpm lint` - Run ESLint to check code quality and style

### Package Management
- This project uses `pnpm` as the package manager
- Use `pnpm install` to install dependencies
- Use `pnpm add <package>` to add new dependencies

## Architecture

### Tech Stack
- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.2 with SWC plugin for fast compilation
- **Routing**: React Router 7.8.1
- **UI Library**: Telegram Apps UI components
- **Styling**: SASS with embedded compiler
- **Linting**: ESLint with TypeScript support and React hooks/refresh plugins

### Project Structure
```
src/
├── app/           # Application entry point and global styles
│   ├── main.tsx   # App initialization with React Router
│   └── index.css  # Global styles
├── pages/         # Page components (currently empty)
├── shared/        # Shared components and utilities (currently empty)
└── vite-env.d.ts  # Vite environment type definitions
```

### Configuration Files
- **TypeScript**: Uses project references with separate configs for app (`tsconfig.app.json`) and Node (`tsconfig.node.json`)
- **ESLint**: Configured with TypeScript, React hooks, and React refresh plugins
- **Vite**: Minimal configuration with React SWC plugin

### Current Router Setup
The application uses React Router with browser routing. Currently has a single route (`/`) rendering "Hello World". Router configuration is in `src/app/main.tsx:7-12`.

## Development Notes
- The project is in early stages with minimal boilerplate setup
- The project uses Feature-Sliced Design architectural methodology
- Uses Telegram Apps UI library, indicating this may be a Telegram Web App or similar integration
- No testing framework is currently configured