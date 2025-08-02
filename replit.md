# FlavorBot - AI-Powered Recipe Management Platform

## Project Overview
A comprehensive AI-powered recipe management platform that leverages advanced language models to generate, personalize, and assist users in their culinary journey.

## Project Architecture

### Technology Stack
- **Frontend**: React.js with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Anthropic Claude for recipe generation and chat assistance
- **Authentication**: OAuth 2.0
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite
- **Deployment**: Replit with automatic deployments

### Key Features
- AI-powered recipe generation and recommendations
- Recipe collection management (save, edit, delete, categorize)
- Interactive chatbot for culinary assistance
- User authentication and personalized experience
- Responsive design with dark/light theme support
- Search and filter functionality
- Recipe sharing capabilities

## Accessibility Implementation (WCAG 2.2 Compliance)

### Recent Accessibility Improvements
**Date**: 2025-01-02

Implemented comprehensive WCAG 2.2 accessibility compliance including:

#### 1. Semantic HTML Structure
- Added proper semantic elements (`<header>`, `<main>`, `<section>`, `<nav>`)
- Used appropriate heading hierarchy (h1, h2, h3) with proper nesting
- Added skip navigation link for keyboard users

#### 2. ARIA Roles and Attributes
- Navigation with `role="navigation"` and `aria-label`
- Form controls with proper `aria-required`, `aria-describedby`, `aria-invalid`
- Interactive elements with `aria-label` and `aria-pressed` where appropriate
- Live regions with `aria-live="polite"` for dynamic content updates
- Tab panels with proper `role="tabpanel"` and `aria-controls`

#### 3. Color Contrast and Visual Design
- Updated color palette to meet WCAG AA contrast ratios (4.5:1 minimum)
- Added support for high contrast mode with `@media (prefers-contrast: high)`
- Improved focus indicators with visible outline styles
- Added `aria-hidden="true"` to decorative icons

#### 4. Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus management with proper tabindex usage
- Added keyboard event handlers for custom interactive components
- Skip link implementation for main content access

#### 5. Screen Reader Support
- Screen reader only content with `.sr-only` class
- Proper labeling of form controls and interactive elements
- Error messages with `role="alert"` and proper associations
- Descriptive alt text and aria-labels throughout

#### 6. Form Accessibility
- Labels properly associated with form controls
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required="true"`
- Input validation states with `aria-invalid`
- Helper text provided for complex form fields

#### 7. Responsive and Adaptive Features
- Support for reduced motion with `@media (prefers-reduced-motion: reduce)`
- Flexible layouts that work across all viewport sizes
- Touch-friendly target sizes (minimum 44px)

### Accessibility Components
- Created `AccessibilityAnnouncement` component for screen reader notifications
- Enhanced existing UI components with proper ARIA attributes
- Added accessibility-focused CSS utilities

## User Preferences
- Clean, modern interface with intuitive navigation
- Fast, responsive interactions
- Comprehensive accessibility support
- Professional, helpful tone in AI interactions

## Development Guidelines
- Follow the fullstack_js development pattern
- Use TypeScript for type safety
- Implement proper error handling and loading states
- Maintain accessibility standards in all new features
- Test with keyboard navigation and screen readers
- Ensure color contrast meets WCAG AA standards

## Recent Changes
- **2025-01-02**: Implemented comprehensive WCAG 2.2 accessibility compliance
- Enhanced semantic HTML structure across all pages
- Added proper ARIA roles and attributes
- Improved color contrast and focus management
- Created accessibility announcement component
- Added skip navigation and keyboard support
- Updated CSS with accessibility utilities and reduced motion support

## Database Schema
Located in `shared/schema.ts` with proper TypeScript interfaces and Drizzle ORM integration.

## API Structure
RESTful API with proper error handling, authentication middleware, and input validation.

## Deployment
Configured for automatic deployment on Replit with environment variable management for API keys and database connections.