# Project Context

## Purpose

**Bidit** is a mobile-first real-time auction platform that enables users to participate in live bidding on items with instant price updates and competitive bidding mechanics. The platform is designed for Korean markets with support for Korean Won (원) currency formatting.

**Primary Goals:**
- Provide a seamless mobile auction experience with sub-second real-time updates
- Enable users to create, browse, and bid on auctions with minimal friction
- Deliver a competitive bidding experience with instant feedback
- Build a scalable foundation for future e-commerce features (authentication, payments, push notifications)

## Tech Stack

### Frontend/Mobile
- **React 19** with React Compiler enabled (automatic memoization)
- **React Native 0.81** with New Architecture enabled
- **TypeScript 5.9.2** with strict mode enabled
- **Expo SDK ~54** for cross-platform mobile development
- **Expo Router 6.0** for file-based navigation
- **React Native Reanimated 4.1** for native-thread animations
- **Expo Image 3.0** for optimized image loading and caching

### Backend & Infrastructure
- **Supabase** (cloud-hosted PostgreSQL) for database and real-time subscriptions
- **@supabase/supabase-js 2.78** client library
- **pg_cron** PostgreSQL extension for scheduled auction closing
- **EAS (Expo Application Services)** for builds, updates, and deployments

### Development & Tooling
- **EAS Workflows** for CI/CD automation
- **ESLint 9.25** with Expo config
- **TypeScript strict mode** for type safety
- **Expo Dev Client** for native development builds

## Project Conventions

### Code Style
- **TypeScript Strict Mode**: All code must pass strict type checking
- **Functional Components**: Use React functional components with hooks only
- **React Compiler**: Minimize manual `useMemo`/`useCallback` (compiler handles it)
- **Self-Documenting Code**: Prefer clear naming over comments
- **Path Aliases**: Use `@/*` to reference files from project root
- **ESLint**: Follow `eslint-config-expo` rules
- **Formatting**: Use Expo's default formatting conventions
- **Avoid Emojis**: Only use emojis in code if explicitly requested

### File & Folder Structure
```
app/                    # Expo Router file-based routing
├── (tabs)/             # Tab-based navigation screens
├── _layout.tsx         # Root layout with theme provider
components/             # Reusable React components
├── ui/                 # UI primitives
constants/              # Theme colors, app-wide constants
hooks/                  # Custom React hooks
assets/                 # Images, fonts, static files
.eas/workflows/         # CI/CD workflow definitions
specs/                  # Feature specifications (OpenSpec)
openspec/               # OpenSpec configuration
```

### Naming Conventions
- **Components**: PascalCase (e.g., `AuctionCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuctionTimer.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_BID_INCREMENT`)
- **Types/Interfaces**: PascalCase (e.g., `AuctionDetails`, `BidHistory`)
- **Files**: kebab-case for screens, PascalCase for components

### Architecture Patterns

**Navigation Architecture:**
- File-based routing via Expo Router (files in `app/` become routes)
- Typed routes enabled for type-safe navigation
- Bottom tabs for primary navigation, stack for details
- Use `Link` component or `router.push()` for navigation

**State Management:**
- React hooks (useState, useReducer) for local state
- Context API for theme management
- Supabase real-time subscriptions for server state
- No Redux/MobX in current architecture

**Data Flow:**
- Supabase client for database queries and real-time updates
- Real-time subscriptions for live auction updates (< 1 second latency)
- Optimistic updates for better UX on bid placement
- Error boundaries for production error handling

**Component Structure:**
- Screen components in `app/` directory
- Reusable UI components in `components/`
- Custom hooks in `hooks/` for shared logic
- Theme-aware components using `useThemeColor()` hook

### Testing Strategy

**Current State:**
- MVP focused on rapid development
- Manual testing on iOS simulator and Android emulator
- `testID` props added for future component testing

**Future Testing Approach:**
- Add component tests using React Native Testing Library
- Integration tests for real-time subscription flows
- E2E tests for critical user journeys (browse → bid → win)
- Performance testing for 100+ auction feeds (60fps target)

**Testing Considerations:**
- Test real-time updates on multiple devices simultaneously
- Verify race conditions in concurrent bidding scenarios
- Validate countdown timer accuracy across devices
- Test network interruption and reconnection handling

### Git Workflow

**Branching Strategy:**
- `main` branch for production-ready code
- Feature branches using OpenSpec naming: `feature/{spec-id}` (e.g., `feature/001-auction-platform`)
- Development branches for experimental work

**Commit Conventions:**
- Descriptive commit messages focusing on "why" over "what"
- Include feature reference when relevant (e.g., "001-auction-platform: Add real-time bid updates")
- Use present tense, imperative mood (e.g., "Add auction feed component")

**OpenSpec Workflow:**
1. Create change proposals in `openspec/changes/{nnn}-{slug}.md`
2. Review and validate proposals
3. Apply approved proposals with `/openspec:apply`
4. Archive deployed changes with `/openspec:archive`

**Pull Requests:**
- Use GitHub CLI (`gh pr create`) for PR creation
- Include summary, test plan, and OpenSpec references
- CI/CD via EAS Workflows validates builds

## Domain Context

**Auction Platform Concepts:**
- **Auction**: Time-limited listing where users compete by placing incrementally higher bids
- **Current Price**: The highest bid amount placed so far (or starting price if no bids)
- **Minimum Increment**: The smallest amount by which a new bid must exceed the current price
- **Quick Bid Buttons**: Pre-set increment buttons (+1,000원, +5,000원, +10,000원) for rapid bidding
- **Realtime Updates**: Instant synchronization of bids across all connected devices (< 1 second)
- **Countdown Timer**: Live countdown showing time remaining until auction ends
- **Bid History**: List of recent bids showing bidder name, amount, and timestamp
- **Winner**: The user with the highest bid when auction time expires

**Business Rules:**
- All auctions have fixed 1-hour duration (MVP limitation)
- Minimum bid increment is set per auction (typically 1,000원)
- Bids must be >= current price + minimum increment
- Auctions auto-close when countdown reaches zero (within 1-minute accuracy)
- Users can bid on their own auctions (validation not enforced in MVP)
- Anonymous bidding with default name "Anonymous" (auth coming in Phase 8)
- Korean Won (원) currency with thousand separators (e.g., 1,000,000원)

**Key Entities:**
- **Auction**: `id`, `title`, `description`, `starting_price`, `current_price`, `minimum_increment`, `image_url`, `end_time`, `status`, `created_at`
- **Bid**: `id`, `auction_id`, `bidder_name`, `bid_amount`, `created_at`
- **User** (Phase 2): `id`, `username`, `email`, `avatar`, `created_at`

## Important Constraints

**Technical Constraints:**
- **Platform**: iOS 15+ and Android 10+ required
- **Performance**: Maintain 60fps scrolling and animations on mid-range devices
- **Realtime Latency**: Bid updates must propagate in < 1 second
- **Bundle Size**: Keep app size under 50MB
- **Offline**: Requires internet connection (no offline mode in MVP)
- **Concurrency**: Support at least 100 concurrent bidders per auction
- **Database**: Supabase PostgreSQL with RLS disabled initially (enabled with auth in Phase 8)

**Development Constraints:**
- **React Compiler**: Enabled - must write compiler-friendly React code
- **New Architecture**: Enabled - use only compatible native modules
- **Typed Routes**: Enabled - navigation must be type-safe
- **TypeScript Strict**: All code must pass strict type checking
- **No Web**: Primary focus is native mobile (web is secondary)

**Business Constraints:**
- **MVP Scope**: Focus on core auction mechanics, defer auth/payments
- **Currency**: Korean Won (원) only in MVP
- **Duration**: Fixed 1-hour auctions in MVP
- **Images**: Placeholder images only (no upload in MVP)
- **Moderation**: No content moderation in MVP (trusted users assumed)

## External Dependencies

**Supabase (Critical):**
- **Purpose**: Backend-as-a-Service providing database, real-time subscriptions, and future auth
- **Database**: Cloud-hosted PostgreSQL with custom SQL functions and triggers
- **Realtime**: WebSocket-based subscriptions for live bid updates
- **Configuration**: Project ID `fa4f6900-37ca-441e-897e-5c665e1b9bda`
- **MCP Integration**: Supabase MCP server connected for database operations

**Expo Application Services (Critical):**
- **Purpose**: CI/CD platform for builds, updates, and deployments
- **Project**: `fa4f6900-37ca-441e-897e-5c665e1b9bda` (owner: `olion500`)
- **Workflows**: Automated builds via `.eas/workflows/` configs
- **Build Profiles**: development, development-simulator, preview, production
- **OTA Updates**: Runtime version policy set to `appVersion`

**localtunnel (Development):**
- **Purpose**: Expose local dev server for remote device testing
- **Usage**: `npm run tunnel` to create public URL for Expo dev server

**React Native/Expo Ecosystem:**
- `expo-image`: Optimized image loading with caching
- `expo-router`: File-based navigation system
- `react-native-reanimated`: Native-thread animations
- `react-native-gesture-handler`: Native gesture system
- `expo-constants`: Environment and build constants
- `expo-haptics`: Haptic feedback for bid interactions
