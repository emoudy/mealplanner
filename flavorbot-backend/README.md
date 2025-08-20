# MealPlanner Backend

Express.js API server for MealPlanner - AI-powered recipe management platform.

## Features

- **Authentication System**: Email/password authentication with session management
- **Recipe Management**: CRUD operations for user recipes
- **AI Integration**: Anthropic Claude for recipe generation and chat
- **Security**: Rate limiting, CORS, security headers, input validation
- **Email Verification**: Secure email verification workflow
- **Usage Tracking**: Monitor API usage and limits

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Anthropic API key

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Database Setup

```bash
npm run db:push
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Recipes
- `GET /api/recipes` - Get user recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/:id` - Get recipe by ID
- `PATCH /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

### AI Features
- `POST /api/chatbot` - Chat with AI assistant

### Utilities
- `GET /health` - Health check

## Security Features

- Rate limiting (global, auth-specific, AI-specific)
- CORS configuration
- Security headers via Helmet
- Input validation
- Session-based authentication
- HTTPS enforcement in production

## Architecture

Built with:
- Express.js
- Drizzle ORM
- PostgreSQL
- Anthropic Claude API
- Passport.js for authentication
- @mealplanner/shared for shared utilities