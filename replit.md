# Study Planner Application - System Architecture Documentation

## Overview

This is a full-stack study planner application built with a modern tech stack featuring React/TypeScript frontend, Express.js backend, and PostgreSQL database. The application helps students organize their study schedules, track subjects and topics, manage exams, and monitor progress through automated study plan generation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with custom configuration
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js with middleware-based architecture
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon Database (serverless PostgreSQL)
- **Session Management**: Built-in memory storage with extensible interface
- **API Design**: RESTful endpoints with JSON responses

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Definition**: Type-safe schema with Zod validation
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Data Models**: Users, Subjects, Topics, Exams, StudySessions

## Key Components

### Data Models
1. **Users**: Profile settings, study preferences, notifications
2. **Subjects**: Study subjects with visual customization (icons, colors)
3. **Topics**: Individual study topics within subjects, difficulty tracking
4. **Exams**: Scheduled exams linked to specific topics
5. **StudySessions**: Time-blocked study sessions with completion tracking

### Frontend Components
- **Pages**: Dashboard, Subjects, Exams, Settings
- **Study Components**: QuickStats, TodaySchedule, UpcomingExams, SubjectCard
- **Forms**: Subject and Exam creation/editing with validation
- **Navigation**: Bottom navigation for mobile, header for desktop
- **UI Components**: Complete shadcn/ui component library

### Backend Services
- **Storage Interface**: Abstract storage layer with memory implementation
- **Route Handlers**: CRUD operations for all data models
- **Middleware Stack**: JSON parsing, request logging, error handling
- **Development Tools**: Vite integration for HMR in development

## Data Flow

### Study Plan Generation
1. Algorithm analyzes user preferences, topic difficulty, and exam dates
2. Generates optimized daily study sessions based on available time
3. Prioritizes topics by urgency and importance
4. Updates user progress tracking in real-time

### User Interaction Flow
1. User sets study preferences and daily goals
2. Creates subjects with topics and difficulty ratings
3. Schedules upcoming exams with topic associations
4. System generates daily study plans automatically
5. User completes study sessions and tracks progress
6. Dashboard provides visual feedback and analytics

### API Communication
- Client uses TanStack Query for efficient data fetching
- Optimistic updates for immediate UI feedback
- Automatic cache invalidation on mutations
- Error handling with user-friendly messages

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI/UX**: Radix UI primitives, Lucide icons, class-variance-authority
- **Data/State**: TanStack Query, date-fns for date manipulation
- **Development**: Vite, TypeScript, Tailwind CSS

### Backend Dependencies
- **Core**: Express.js, TypeScript (tsx for development)
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Validation**: Zod for schema validation and type inference
- **Build**: ESBuild for production bundling

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit environment
- **Hot Reload**: Vite middleware integration with Express
- **Database Tools**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20 and PostgreSQL 16 modules
- **Hot Reload**: Vite dev server with Express middleware
- **Database**: Neon Database with connection pooling
- **Port Configuration**: Local port 5000, external port 80

### Production Build
- **Frontend**: Vite build to static assets in `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Database**: Environment-based connection string
- **Deployment**: Replit autoscale deployment target

### Environment Configuration
- **Development**: `npm run dev` with tsx and hot reload
- **Production**: `npm run start` with optimized builds
- **Database**: `npm run db:push` for schema deployment

## Changelog

- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.