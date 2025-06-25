# Study Planner App

A modern, intelligent study planner that helps students organize their learning with automated daily planning, progress tracking, and exam preparation.

## Features

- **Smart Daily Planning**: Automatically generates optimized study schedules based on topic difficulty, exam urgency, and available time
- **Subject & Topic Management**: Organize your studies with customizable subjects and difficulty-rated topics
- **Exam Tracking**: Schedule exams and get automated reminders with topic-specific preparation
- **Progress Analytics**: Track study streaks, completion rates, and performance insights
- **Mobile-First Design**: Responsive interface optimized for both mobile and desktop use

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Mobile Testing
1. Open the deployed app URL in your mobile browser
2. For PWA experience: Add to Home Screen on iOS/Android
3. The app is fully responsive and touch-optimized

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **UI**: shadcn/ui components with Radix UI
- **State**: TanStack Query for server state management
- **Database**: In-memory storage (production-ready for PostgreSQL)

## Project Structure

- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared TypeScript schemas and types
- `/components` - Reusable UI components with accessibility compliance

## Deployment

The app is configured for Replit deployment with automatic scaling and mobile accessibility. All production configurations are included.

## Features in Detail

### Auto-Generation
- Study plans generate automatically when dashboard loads
- Intelligent prioritization based on exam dates and topic difficulty
- Real-time streak calculation based on completed sessions

### Accessibility
- Full ARIA compliance for screen readers
- Proper form label associations
- Keyboard navigation support

## License

MIT License - Built for educational use and personal productivity.