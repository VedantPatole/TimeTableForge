# Overview

This is a timetable management system for educational institutions, built as a full-stack web application. The system manages departments, faculty, students, rooms, subjects, and timetables with a modern React frontend and Express.js backend. It provides dashboard analytics, resource management, and scheduling capabilities for academic administration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation through Hookform resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with organized route handlers
- **Development**: Hot reloading with Vite middleware integration in development mode

## Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Centralized schema definitions in shared directory
- **Migrations**: Drizzle Kit for database migrations and schema changes

## Data Models
The system manages seven core entities:
- **Users**: Authentication and role-based access (student, faculty, admin)
- **Departments**: Academic departments with unique codes
- **Divisions**: Class divisions within departments
- **Students**: Student records linked to divisions and users
- **Faculty**: Staff records with department assignments and designations
- **Rooms**: Physical spaces with capacity and type classification
- **Subjects**: Academic courses with department associations
- **TimeSlots**: Time periods for scheduling
- **Timetables**: Complete scheduling system linking all entities

## Component Architecture
- **Layout Components**: Reusable sidebar navigation and header components
- **Page Components**: Feature-specific pages for each major entity
- **Dashboard Components**: Analytics widgets for institutional overview
- **UI Components**: Comprehensive design system with consistent styling

## Development Patterns
- **Monorepo Structure**: Shared types and schemas between client and server
- **Type Safety**: End-to-end TypeScript with strict configuration
- **Code Organization**: Feature-based file structure with clear separation of concerns
- **Development Experience**: Hot reloading, error overlays, and development tools integration

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time database connections for development

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant handling

## Development Tools
- **Replit Integration**: Development environment plugins for cartographer and dev banner
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility
- **ESBuild**: Fast JavaScript bundling for production builds

## Runtime Libraries
- **Date-fns**: Date manipulation and formatting utilities
- **Nanoid**: Unique ID generation for entities
- **WebSocket (ws)**: Server-side WebSocket implementation for database connections