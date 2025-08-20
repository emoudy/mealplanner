# MealPlanner Web

React web application for MealPlanner - AI-powered recipe management platform.

## Features

- **Modern React Stack**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Authentication**: Email/password with session management
- **Recipe Management**: Full CRUD operations with AI assistance
- **AI Chat**: Interactive culinary assistant
- **Responsive Design**: Mobile-first responsive layouts
- **Accessibility**: WCAG 2.2 compliant
- **PWA Ready**: Progressive Web App capabilities

## Getting Started

### Prerequisites

- Node.js 18+
- MealPlanner Backend running on port 5001

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: TanStack Query + React Context
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Key Features
- Shared business logic via @mealplanner/shared
- Type-safe API client
- Comprehensive form validation
- Dark/light theme support
- Responsive design patterns
- Accessibility-first approach

### Project Structure
```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── lib/           # Utilities and configurations
├── pages/         # Route components
└── assets/        # Static assets
```

## API Integration

Connects to MealPlanner Backend via proxy configuration:
- Development: `http://localhost:5001`
- Production: Configure via `VITE_API_URL`

## Deployment

Optimized for static hosting:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service