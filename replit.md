# Overview

This project is a modern web application for the Innovare Technical Club, built as a full-stack application showcasing the club's activities, events, team members, and gallery. The application features a React frontend with a Node.js/Express backend, designed to provide an engaging user experience with interactive 3D elements and responsive design.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using **React 18** with **TypeScript** and follows a component-based architecture:

- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for consistent theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **3D Graphics**: Spline viewer integration for interactive 3D elements
- **Forms**: React Hook Form with Zod validation schemas

The frontend follows a page-based structure with reusable components, custom hooks for common functionality, and a responsive design system.

## Backend Architecture
The backend is built with **Express.js** and follows a RESTful API pattern:

- **Runtime**: Node.js with TypeScript and ES modules
- **Framework**: Express.js with middleware for JSON parsing and request logging
- **API Design**: RESTful endpoints for events, team members, and gallery resources
- **Error Handling**: Centralized error handling middleware
- **Development**: Hot reload with Vite integration in development mode

The backend uses an in-memory storage implementation with an interface-based design that allows for easy migration to database storage.

## Data Layer
The application uses **Drizzle ORM** with **PostgreSQL** for data persistence:

- **Database**: PostgreSQL with Neon Database integration
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Defined database tables for events, team members, and gallery images
- **Validation**: Zod schemas for runtime type validation and form validation
- **Migrations**: Drizzle Kit for database schema migrations

The data layer includes proper TypeScript types generated from the database schema and validation schemas for API endpoints.

## Development Workflow
The project uses a monorepo structure with shared TypeScript configuration:

- **Shared Types**: Common schemas and types shared between frontend and backend
- **Path Aliases**: Configured for clean imports and better developer experience
- **Development Server**: Vite dev server with Express backend integration
- **Build Process**: Separate build steps for frontend (Vite) and backend (esbuild)

## Design System
The application implements a custom design system with:

- **Typography**: Multiple font families (Inter, JetBrains Mono, Fira Code)
- **Color Palette**: Tech-focused color scheme with CSS custom properties
- **Components**: Comprehensive UI component library with consistent styling
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Animations**: CSS animations and scroll-based interactions

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework for the backend API
- **react**: Frontend framework for building user interfaces
- **vite**: Build tool and development server

## UI and Styling
- **@radix-ui/***: Headless UI components for accessibility and functionality
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library for consistent iconography

## State Management and Forms
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Resolvers for form validation schemas
- **zod**: Schema validation library

## Development Tools
- **typescript**: Static type checking
- **@types/node**: Node.js type definitions
- **tsx**: TypeScript execution environment
- **drizzle-kit**: Database migration and introspection tools

## 3D Graphics and Animations
- **@splinetool/viewer**: 3D scene viewer for interactive graphics
- **wouter**: Lightweight routing library for React

## Additional Utilities
- **clsx**: Utility for conditional CSS classes
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **cmdk**: Command palette component