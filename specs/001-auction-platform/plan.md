# Implementation Plan: Mobile Auction Platform (Bidit)

**Branch**: `001-auction-platform` | **Date**: 2025-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auction-platform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Bidit is a mobile-first auction platform enabling users to browse auctions, place bids in realtime, and create auction listings. The MVP focuses on core auction/bidding functionality with anonymous users, leveraging Supabase for backend services and realtime subscriptions. Key technical challenges include sub-1-second realtime bid updates, accurate countdown timers, and automatic auction closing via scheduled database functions.

**Primary Requirement**: Enable competitive realtime bidding on mobile devices with instant updates across all connected clients.

**Technical Approach**: Expo/React Native mobile app with Supabase PostgreSQL backend, realtime subscriptions via WebSockets, and pg_cron for automated auction closing.

## Technical Context

**Language/Version**: TypeScript strict mode, React 19, React Native 0.81, Expo SDK ~54

**Primary Dependencies**:
- `@supabase/supabase-js` - Backend client for database and realtime
- `expo-router` - File-based navigation
- `expo-image` - Optimized image loading
- `react-native-reanimated` - Native thread animations (60fps)
- `react-native-gesture-handler` - Native gestures

**Storage**: Supabase PostgreSQL (cloud-hosted)
- `auctions` table - Auction listings with status tracking
- `bids` table - Bid history with timestamps
- RLS disabled for MVP (enabled in post-MVP authentication phase)

**Testing**: Manual testing on iOS/Android devices
- Two-device realtime sync testing (critical for bid updates)
- Countdown timer accuracy validation
- Auto-close verification via scheduled jobs

**Target Platform**: iOS 15+, Android 10+ (mobile-first), web (secondary/optional)

**Project Type**: Mobile (Expo/React Native)

**Performance Goals**:
- 60fps scrolling and animations
- < 3s initial app load
- < 1s realtime bid update latency
- Smooth gestures with no jank

**Constraints**:
- Mobile device resources (CPU, memory, battery)
- Realtime updates require stable internet connection
- < 50MB bundle size for mobile network downloads
- No offline functionality in MVP

**Scale/Scope**:
- 6 user stories (3 P1, 1 P2, 2 P3)
- 8-10 screens/modals
- 2 database tables (MVP)
- Support 100+ concurrent bidders per auction
- Handle 100+ active auctions in feed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [x] **Mobile-First Development**: Feature designed for mobile form factors (iOS/Android), uses Expo SDK modules (Supabase, expo-image, expo-router)
- [x] **Type Safety & Modern React**: TypeScript strict mode, React 19 functional components with hooks, typed routes via Expo Router
- [x] **Component Reusability**: Components organized in `components/`, theme-aware via `useThemeColor()`, include `testID` props for testing
- [x] **Performance & User Experience**: Uses optimized libraries (expo-image for caching, react-native-reanimated for 60fps animations), targets sub-1s realtime updates
- [x] **Platform Best Practices**: Dependencies via `npx expo install`, compatible with EAS Workflows for CI/CD

**Complexity Justification**: No constitution violations. All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-auction-platform/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── supabase-api.md  # Database queries and realtime subscriptions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Bidit Mobile App Structure (Expo/React Native)
app/                                    # Expo Router file-based routing
├── (tabs)/                             # Tab-based navigation screens
│   ├── index.tsx                       # Auction feed (home screen)
│   ├── my-bids.tsx                     # User's bid history (Phase 3)
│   └── _layout.tsx                     # Tabs configuration
├── auction/
│   └── [id].tsx                        # Auction detail modal (dynamic route)
├── create-auction.tsx                  # Create auction modal
├── _layout.tsx                         # Root layout (theme, fonts, error boundaries)
└── +not-found.tsx                      # 404 screen

components/                             # Reusable React components
├── ui/                                 # UI primitives
│   ├── Button.tsx                      # Primary/secondary/outline variants
│   ├── Input.tsx                       # Text/number input with validation
│   ├── Card.tsx                        # Auction card container
│   ├── EmptyState.tsx                  # Empty state with icon/message
│   ├── LoadingSpinner.tsx              # Loading indicator
│   └── Toast.tsx                       # Success/error notifications
├── auction/                            # Auction-specific components
│   ├── AuctionCard.tsx                 # Feed item (title, price, timer, status)
│   ├── CountdownTimer.tsx              # Realtime countdown display
│   ├── BidInput.tsx                    # Bid amount input with quick buttons
│   └── BidHistory.tsx                  # Recent bids list
└── ThemedText.tsx                      # Theme-aware text (existing)

lib/                                    # Core utilities
├── supabase.ts                         # Supabase client config
└── utils.ts                            # Formatting (prices, time)

hooks/                                  # Custom React hooks
├── useAuctions.ts                      # Fetch/subscribe to auctions
├── useAuctionDetail.ts                 # Fetch single auction with realtime
├── usePlaceBid.ts                      # Bid submission mutation
└── useThemeColor.ts                    # Theme support (existing)

constants/                              # App-wide constants
├── Colors.ts                           # Theme colors (existing)
└── Auction.ts                          # Auction status enum, min increment

assets/                                 # Images, fonts, static files
.eas/workflows/                         # EAS Workflow definitions
```

**Structure Decision**: Using Expo Router file-based routing with tab navigation for main screens (Auction Feed, My Bids) and modal routes for detail/create views. All auction-specific components grouped under `components/auction/` for organization. Supabase client configured in `lib/supabase.ts` for centralized access. No separate backend API needed - Supabase handles all backend concerns.

## Complexity Tracking

> **No constitution violations identified.** All architecture decisions align with mobile-first, type-safe, performant Expo/React Native best practices.

---

## Phase 0: Research & Decisions

See [research.md](./research.md) for detailed findings.

**Key Decisions**:
1. **Realtime Strategy**: Supabase Realtime Channels (WebSocket-based) for bid updates
2. **Timer Implementation**: Client-side countdown with server timestamp sync to prevent drift
3. **Auto-Close Mechanism**: pg_cron extension in Supabase to run scheduled functions
4. **Anonymous Auth**: Use default "Anonymous" bidder name, no session management in MVP
5. **Image Handling**: Placeholder images initially, no upload in MVP

---

## Phase 1: Data Model & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete schema.

**Core Entities**:
- `auctions` - Auction listings with current price, status, timestamps
- `bids` - Bid history with amount, bidder name, auction reference

### API Contracts

See [contracts/supabase-api.md](./contracts/supabase-api.md) for query specifications.

**Supabase Queries**:
- Fetch active auctions (SELECT with status filter)
- Fetch auction detail (SELECT by ID)
- Fetch bid history (SELECT with JOIN, ORDER BY created_at DESC)
- Insert bid (INSERT with validation trigger)
- Update auction current_price (UPDATE with optimistic locking)
- Insert auction (INSERT with default values)
- Realtime subscription to `bids` table (Supabase Channel)

### Testing Scenario

See [quickstart.md](./quickstart.md) for end-to-end validation steps.

**Critical Path**: Browse auctions → View detail → Place bid → Verify realtime update on second device

---

## Implementation Notes

### Realtime Architecture

**Challenge**: Sub-1-second bid updates across devices

**Solution**:
```typescript
// Supabase realtime subscription in useAuctionDetail hook
const channel = supabase
  .channel(`auction:${auctionId}`)
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'bids', filter: `auction_id=eq.${auctionId}` },
    (payload) => {
      // Update local state with new bid
      // Trigger toast notification
      // Update current price display
    }
  )
  .subscribe()
```

**Validation**: Test with two physical devices on different networks to ensure < 1s latency.

### Countdown Timer

**Challenge**: Accurate countdown across devices with different system clocks

**Solution**:
```typescript
// Calculate remaining time using server timestamp
const serverTime = new Date(auction.ends_at).getTime()
const now = Date.now()
const remaining = Math.max(0, serverTime - now)

// Update every second with useEffect + setInterval
// Display as "5m 32s" or "1h 23m" or "Ended"
```

**Validation**: Compare countdown on two devices, verify both reach zero within 2 seconds of each other.

### Auto-Close Auctions

**Challenge**: Close auctions automatically when time expires

**Solution**:
```sql
-- Postgres function (run via Supabase SQL Editor)
CREATE OR REPLACE FUNCTION close_expired_auctions()
RETURNS void AS $$
BEGIN
  UPDATE auctions
  SET status = 'ended'
  WHERE ends_at < now() AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron (every minute)
SELECT cron.schedule(
  'close-expired-auctions',
  '* * * * *',
  $$ SELECT close_expired_auctions() $$
);
```

**Validation**: Create auction with 1-minute duration, verify status changes to 'ended' within 1 minute of expiration.

### Performance Optimizations

1. **FlatList virtualization** for auction feed (handles 100+ items)
2. **expo-image caching** for auction images (reduces network requests)
3. **React Compiler auto-memoization** (minimize manual useMemo/useCallback)
4. **Debounced search input** for filter (avoid excessive re-renders)
5. **Optimistic UI updates** for bid placement (instant feedback before server confirms)

### Error Handling

1. **Network errors**: Toast with retry button
2. **Bid validation failures**: Toast with specific error message ("Bid too low - minimum is X")
3. **Realtime connection loss**: Auto-reconnect with exponential backoff (Supabase handles this)
4. **Empty states**: Friendly messages ("No active auctions", "You haven't placed any bids yet")
5. **Error boundaries**: Catch React render errors and show fallback UI

---

## Next Steps

1. **Run `/speckit.tasks`** to generate executable task breakdown
2. **Create Supabase project** and configure environment variables
3. **Implement Phase 1 tasks** (Supabase setup, database schema, test data)
4. **Build auction feed** (User Story 1)
5. **Test realtime bidding** on two devices (User Story 2 + 3)
6. **Iterate** through remaining user stories (P2, P3)

---

## Dependencies Installation

```bash
# Core dependencies
npx expo install @supabase/supabase-js
npx expo install expo-image
npx expo install react-native-reanimated react-native-gesture-handler

# Environment variables (create .env file)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## Success Metrics

- [ ] Auction feed loads in < 2 seconds
- [ ] Realtime bid updates appear in < 1 second on both devices
- [ ] Countdown timers accurate within 2 seconds across devices
- [ ] Auctions auto-close within 1 minute of expiration
- [ ] 60fps scrolling on mid-range Android device
- [ ] App bundle size < 50MB
- [ ] No runtime TypeScript errors

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Realtime latency > 1s on poor networks | HIGH | Add connection quality indicator, optimize payload size |
| Countdown drift on background apps | MEDIUM | Re-sync on app foreground, use server time as source of truth |
| Race conditions on simultaneous bids | HIGH | Use database-level constraints (UNIQUE on auction_id + amount), optimistic locking |
| Expo Go limitations for Supabase | LOW | Use development builds instead of Expo Go for testing |
| pg_cron not available on Supabase free tier | CRITICAL | Verify pg_cron availability, fallback to Edge Function if needed |
