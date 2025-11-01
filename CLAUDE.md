# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bidit** is an Expo/React Native mobile application with:
- **React 19** with React Compiler enabled
- **React Native 0.81** with New Architecture enabled
- **Expo Router** for file-based navigation
- **TypeScript** with strict mode enabled
- Path aliases: `@/*` maps to project root

## Essential Commands

### Development
```bash
npm run start              # Start Expo dev server
npm run android            # Start on Android emulator
npm run ios                # Start on iOS simulator
npm run web                # Start web version
npm run tunnel             # Expose dev server via localtunnel
npm run lint               # Run ESLint
```

### Installation & Maintenance
```bash
npx expo install <package>      # Install packages with compatible versions
npx expo install --check        # Check for outdated packages
npx expo install --fix          # Auto-update invalid package versions
npx expo doctor                 # Check project health
npx expo start --clear          # Clear cache and start
```

### EAS Workflows (CI/CD)
```bash
npm run draft                      # Publish preview update (workflow)
npm run development-builds         # Create development builds (workflow)
npm run deploy                     # Deploy to production (workflow)
```

### EAS Build & Submit (Manual)
```bash
npx eas-cli@latest build --platform ios --profile development
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios -s    # Build and submit to App Store
```

## Project Structure

```
app/                    # Expo Router file-based routing
├── (tabs)/             # Tab-based navigation
│   ├── index.tsx       # Home screen
│   ├── explore.tsx     # Explore screen
│   └── _layout.tsx     # Tabs layout
├── _layout.tsx         # Root layout (theme provider, fonts)
└── modal.tsx           # Example modal screen

components/             # Reusable React components
├── ui/                 # UI primitives (IconSymbol, Collapsible)
└── ...                 # Feature components (themed, navigation)

constants/              # Theme colors, app-wide constants
hooks/                  # Custom React hooks (theme, color scheme)
assets/                 # Images, fonts, static files
scripts/                # Utility scripts (reset-project)
.eas/workflows/         # EAS Workflows definitions
```

## Architecture & Key Concepts

### Navigation (Expo Router)
- File-based routing: Files in `app/` become routes
- Import from `expo-router`: `Link`, `router`, `useLocalSearchParams`, `Stack`, `Tabs`
- Typed routes enabled: Type-safe navigation with auto-generated types
- Layouts use `Stack.Screen` or `Tabs.Screen` for configuration

### Theming
- System theme detection via `useColorScheme()` hook
- Theme colors defined in `constants/Colors.ts`
- Use `useThemeColor()` hook for theme-aware styles

### React Compiler
- React Compiler is **enabled** in `app.json` (`reactCompiler: true`)
- Automatic memoization of components and hooks
- Minimize manual `useMemo`/`useCallback` unless profiling shows benefit

### Development Builds vs Expo Go
- **Expo Go**: Limited sandbox, good for prototyping
- **Development Builds**: Full native environment, required after:
  - Installing native modules
  - Adding config plugins
  - Most production-like debugging

## Development Guidelines

### Code Style
- **TypeScript strict mode** is enabled
- Use functional components with hooks
- Prefer self-documenting code over comments
- Follow existing patterns in the codebase

### Recommended Libraries
- **Navigation**: `expo-router`
- **Images**: `expo-image` (optimized, cached)
- **Animations**: `react-native-reanimated` (native thread)
- **Gestures**: `react-native-gesture-handler`
- **Storage**: `expo-sqlite` for persistent data, `expo-sqlite/kv-store` for key-value

### Testing
- Add `testID` props for component testing
- Use console methods appropriately:
  - `console.log` for debugging (remove before production)
  - `console.warn` for deprecation notices
  - `console.error` for actual errors
- Implement error boundaries for production error handling

## Configuration Files

### app.json
- App name: **bidit**
- Bundle IDs: `com.olion500.bidit`
- New Architecture: **enabled**
- React Compiler: **enabled**
- Typed routes: **enabled**
- EAS Project ID: `fa4f6900-37ca-441e-897e-5c665e1b9bda`

### eas.json Build Profiles
- `development`: Development builds with dev client
- `development-simulator`: iOS simulator builds
- `preview`: Internal distribution preview builds
- `production`: Production builds with auto-increment versioning

## Documentation Resources

Always consult official Expo documentation for AI agents:
- https://docs.expo.dev/llms-full.txt - Complete Expo documentation
- https://docs.expo.dev/llms-eas.txt - EAS (build/submit/update) docs
- https://docs.expo.dev/llms-sdk.txt - Expo SDK modules
- https://docs.expo.dev/eas/workflows/ - EAS Workflows examples
- https://reactnative.dev/docs/getting-started - React Native docs

## Troubleshooting

### Common Issues
1. **Expo Go errors**: Create a development build with `npm run development-builds`
2. **Module not found**: Run `npx expo install --fix` to align versions
3. **Cache issues**: Run `npx expo start --clear`
4. **Health check**: Run `npx expo doctor`

### Workflow Validation
Validate workflow YAML files against schema:
```
https://exp.host/--/api/v2/workflows/schema
```
