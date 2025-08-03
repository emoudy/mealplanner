# FlavorBot Mobile

React Native mobile application for FlavorBot, your AI-powered cooking companion.

## Features

- 🍳 **Recipe Management** - Browse, search, and manage your recipe collection
- 🤖 **AI Chef Assistant** - Interactive chatbot for cooking advice and recipe suggestions
- 📱 **Native Mobile Experience** - Optimized for iOS and Android devices
- 🔐 **Secure Authentication** - Session-based auth with secure storage
- 🎨 **Adaptive UI** - Dark/light theme support with system detection
- 📷 **Camera Integration** - Future support for recipe photo capture
- 🔔 **Push Notifications** - Recipe reminders and cooking tips

## Technology Stack

- **React Native** with Expo for cross-platform development
- **@flavorbot/shared** package for 70-80% code reuse with web platform
- **React Navigation** for native navigation patterns
- **Expo Secure Store** for secure authentication persistence
- **TypeScript** for type safety and better development experience

## Development Setup

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio
- Physical device for testing (recommended)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android  
npm run android
```

### Building for Production

#### iOS App Store
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### Google Play Store
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## Architecture

### Shared Code Integration
The mobile app leverages the `@flavorbot/shared` package for:
- **API Client**: Cross-platform HTTP client with automatic platform detection
- **React Hooks**: Authentication, recipes, chatbot, and usage stats
- **Type Definitions**: Complete TypeScript interfaces and schemas
- **Validation**: Zod schemas for form validation and data integrity

### Mobile-Specific Features
- **Native Navigation**: Tab-based navigation with platform-appropriate animations
- **Secure Storage**: Authentication tokens stored securely using Expo Secure Store
- **Camera Access**: Future integration for recipe photo capture
- **Push Notifications**: Recipe reminders and cooking tips
- **Offline Support**: Basic offline functionality for recipe viewing

### Screen Structure
```
src/
├── screens/
│   ├── HomeScreen.tsx        # Dashboard with stats and quick actions
│   ├── RecipesScreen.tsx     # Recipe browser with search and filters
│   ├── ChatbotScreen.tsx     # AI assistant chat interface
│   └── SettingsScreen.tsx    # User preferences and app settings
├── contexts/
│   ├── AuthContext.tsx       # Authentication state management
│   └── ThemeContext.tsx      # Theme and appearance settings
└── components/               # Reusable mobile components
```

## Code Sharing Benefits

- **70-80% Code Reuse**: Business logic, API calls, and state management shared with web
- **Consistent Behavior**: Same authentication, validation, and error handling across platforms
- **Faster Development**: Focus on mobile-specific UI while leveraging shared functionality
- **Type Safety**: Complete TypeScript coverage from shared package

## Deployment Strategy

### Development
- **Expo Development Build**: Fast iteration with hot reloading
- **Expo Preview**: Internal testing and stakeholder previews

### Production
- **iOS App Store**: Automated builds and submissions via EAS
- **Google Play Store**: Play Console integration for releases
- **Over-the-Air Updates**: Instant updates for JavaScript changes

### CI/CD Integration
- **GitHub Actions**: Automated testing and building
- **EAS Build**: Cloud-based builds for consistency
- **Automated Testing**: Unit tests and integration tests

## Platform-Specific Considerations

### iOS
- **Human Interface Guidelines**: Native iOS design patterns
- **App Store Review**: Compliance with Apple's app review guidelines
- **Privacy**: App Tracking Transparency and privacy labels

### Android
- **Material Design**: Google's design system implementation
- **Google Play**: Play Console policies and requirements
- **Permissions**: Runtime permission handling for camera and notifications

## Future Enhancements

- **Offline Recipe Storage**: Local database for offline access
- **Recipe Photo Capture**: Camera integration for recipe documentation
- **Voice Commands**: Voice-activated recipe reading and cooking timers
- **Social Features**: Recipe sharing and community features
- **Meal Planning**: Weekly meal planning and grocery list generation
- **Apple Watch/Wear OS**: Companion apps for cooking timers and quick access

## Contributing

1. Follow the mobile development patterns established in existing screens
2. Use the shared package for all business logic and API calls
3. Implement platform-specific UI using React Native best practices
4. Test on both iOS and Android devices
5. Follow accessibility guidelines for mobile apps

## Support

For mobile-specific issues and development questions, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [React Native Documentation](https://reactnative.dev/)
- [FlavorBot Shared Package](../flavorbot-shared/README.md)