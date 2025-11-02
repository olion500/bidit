<!--
SYNC IMPACT REPORT
==================
Version Change: N/A → 1.0.0
Constitution Type: Initial establishment
Ratification Date: 2025-11-02
Last Amendment: 2025-11-02

Modified Principles:
- NEW: I. Mobile-First Development
- NEW: II. Type Safety & Modern React
- NEW: III. Component Reusability
- NEW: IV. Performance & User Experience
- NEW: V. Platform Best Practices

Added Sections:
- Core Principles (5 principles)
- Development Standards
- Quality Assurance
- Governance

Removed Sections: None (initial version)

Templates Requiring Updates:
✅ plan-template.md - Updated with mobile-specific Constitution Check, Technical Context defaults, and Expo project structure
✅ spec-template.md - No changes needed (generic requirements structure supports mobile development)
✅ tasks-template.md - Updated with mobile-specific path conventions, setup tasks, foundational tasks, and implementation examples
✅ checklist-template.md - No changes needed (generic checklist structure)
✅ agent-file-template.md - No changes needed (generic agent guidance template)

Follow-up TODOs:
- Consider adding formal testing framework (Jest/React Native Testing Library) in future amendments
- Monitor React Compiler effectiveness and update guidance if needed
- Establish app store submission guidelines as deployment matures
-->

# Bidit Constitution

## Core Principles

### I. Mobile-First Development

Bidit is a cross-platform mobile application built with Expo and React Native. All features MUST:

- Be designed for mobile form factors first (iOS and Android)
- Support web as a secondary platform where appropriate
- Utilize Expo's managed workflow and EAS services for builds, updates, and deployments
- Leverage native capabilities through Expo SDK modules rather than custom native code when possible
- Ensure compatibility with both Expo Go (for rapid prototyping) and development builds (for production features)

**Rationale**: Mobile users are the primary audience. Expo provides the infrastructure for rapid iteration and consistent deployment across platforms while maintaining native quality.

### II. Type Safety & Modern React

All code MUST adhere to strict TypeScript standards and modern React patterns:

- TypeScript strict mode is NON-NEGOTIABLE
- React 19 functional components with hooks (no class components)
- React Compiler automatic memoization is enabled; minimize manual `useMemo`/`useCallback` unless profiling demonstrates benefit
- Typed routes via Expo Router for type-safe navigation
- Self-documenting code preferred over comments
- Path aliases (`@/*`) for clean imports

**Rationale**: Type safety prevents runtime errors, especially critical in mobile environments where debugging is harder. React Compiler optimizes performance automatically, reducing cognitive overhead.

### III. Component Reusability

Components MUST be organized for maximum reusability:

- UI primitives in `components/ui/` (e.g., IconSymbol, Collapsible)
- Feature components organized by domain (e.g., themed components, navigation components)
- Theme-aware components using `useThemeColor()` hook
- System theme detection via `useColorScheme()` for automatic dark/light mode
- Components MUST include `testID` props for testability

**Rationale**: Mobile apps require consistent UI/UX across screens. Reusable, theme-aware components ensure brand consistency and reduce maintenance burden.

### IV. Performance & User Experience

Performance MUST be prioritized for mobile users:

- Use Expo Image for optimized, cached image loading
- Animations MUST use `react-native-reanimated` for native thread performance (60fps target)
- Gestures MUST use `react-native-gesture-handler` for native responsiveness
- File-based routing (Expo Router) for automatic code-splitting and fast navigation
- New Architecture enabled for improved performance and future-proofing
- Monitor and optimize bundle size; lazy-load heavy features

**Rationale**: Mobile devices have constrained resources. Native thread animations and optimized asset loading ensure smooth UX even on mid-range devices.

### V. Platform Best Practices

Development MUST follow Expo and React Native ecosystem standards:

- Install packages via `npx expo install` to ensure version compatibility
- Use EAS Workflows for CI/CD automation (draft, development-builds, deploy)
- Development builds required for native modules, config plugins, or production-like debugging
- Run `npx expo doctor` regularly to maintain project health
- Consult official Expo documentation for AI agents: https://docs.expo.dev/llms-full.txt
- Implement error boundaries for production error handling

**Rationale**: Expo's tooling is designed to prevent version conflicts and deployment issues. Following ecosystem conventions reduces maintenance and leverages community best practices.

## Development Standards

### Code Organization

**File Structure**: Follow Expo Router conventions:

- `app/` - File-based routing (screens become routes automatically)
- `components/` - Reusable React components
- `constants/` - Theme colors, app-wide constants
- `hooks/` - Custom React hooks
- `assets/` - Images, fonts, static files
- `.eas/workflows/` - EAS Workflow definitions

**Naming Conventions**:

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useThemeColor.ts`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `API_TIMEOUT`)
- Routes: Follow Expo Router conventions (e.g., `(tabs)/index.tsx`, `modal.tsx`)

### Dependency Management

**Approved Core Libraries**:

- **Navigation**: `expo-router` (file-based routing)
- **Images**: `expo-image` (optimized, cached)
- **Animations**: `react-native-reanimated` (native thread)
- **Gestures**: `react-native-gesture-handler`
- **Storage**: `expo-sqlite` for databases, `expo-sqlite/kv-store` for key-value

**Adding New Dependencies**:

- MUST use `npx expo install <package>` for compatibility
- MUST verify package supports React Native (check npm page)
- MUST justify why existing Expo SDK modules are insufficient
- MUST check bundle size impact for large libraries

### Environment & Configuration

**Configuration Files**:

- `app.json` - Expo configuration (name: bidit, bundle IDs: com.olion500.bidit)
- `eas.json` - Build profiles (development, preview, production)
- EAS Project ID: `fa4f6900-37ca-441e-897e-5c665e1b9bda`

**Build Profiles**:

- `development` - Development builds with dev client
- `development-simulator` - iOS simulator builds
- `preview` - Internal distribution previews
- `production` - Production builds with auto-increment versioning

## Quality Assurance

### Testing Requirements

**Component Testing**:

- All interactive components MUST include `testID` props
- UI components SHOULD be visually tested in isolation (consider Storybook for future)

**Manual Testing**:

- Test on both iOS and Android before major releases
- Verify theme switching (light/dark mode)
- Test offline behavior where applicable
- Validate accessibility (screen readers, font scaling)

**Future Testing Goals** (to be added in future amendments):

- Automated unit testing (Jest + React Native Testing Library)
- Integration testing for critical user flows
- E2E testing for app store releases

### Logging & Debugging

**Console Usage**:

- `console.log` - Debugging only (MUST remove before production)
- `console.warn` - Deprecation notices and non-critical issues
- `console.error` - Actual errors requiring attention
- Production apps MUST implement error boundaries and error tracking

### Code Quality

**Pre-commit Requirements**:

- Code MUST pass `npm run lint` (ESLint)
- TypeScript MUST compile without errors
- No uncommitted debugging code (`console.log`, commented code blocks)

**Review Checklist**:

- Type safety maintained
- Theme support (works in light and dark mode)
- Performance impact considered (bundle size, rendering)
- Platform compatibility (iOS, Android, web if applicable)
- Accessibility basics (contrast, touch targets, labels)

## Governance

### Amendment Process

1. Proposed amendments MUST be documented with rationale
2. Amendments affecting core principles require project lead approval
3. Breaking changes require migration plan for existing code
4. Version bumping rules:
   - **MAJOR**: Backward incompatible governance changes, principle removals/redefinitions
   - **MINOR**: New principle/section added, materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance

**All code contributions MUST**:

- Adhere to all five Core Principles (non-negotiable)
- Follow Development Standards for code organization and dependencies
- Meet Quality Assurance requirements for testing and logging
- Pass constitution compliance review before merging

**Complexity Justification**:

If a feature violates a principle (e.g., requires custom native module when Expo SDK alternative exists), contributor MUST:

- Document the violation in plan.md Complexity Tracking table
- Explain why the principle cannot be followed
- Justify why simpler alternatives are insufficient
- Obtain approval before implementation

### Living Document

This constitution is the authoritative source for Bidit development practices. When in conflict:

1. Constitution supersedes all other documentation
2. CLAUDE.md provides runtime guidance to AI assistants (should align with constitution)
3. Feature specs and plans MUST reference constitution compliance

For questions or proposed amendments, consult project documentation or project lead.

**Version**: 1.0.0 | **Ratified**: 2025-11-02 | **Last Amended**: 2025-11-02
