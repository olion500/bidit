---
description: "Task list for Mobile Auction Platform (Bidit)"
---

# Tasks: Mobile Auction Platform (Bidit)

**Input**: Design documents from `/specs/001-auction-platform/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/supabase-api.md, research.md, quickstart.md

**Tests**: Manual testing only - no automated tests requested in specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile App (Bidit)**: `app/`, `components/`, `hooks/`, `lib/`, `constants/` at repository root
- Paths follow Expo/React Native structure from plan.md

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Initialize Supabase backend and install core dependencies

- [x] T001 Create Supabase project at https://supabase.com (note project URL and API keys)
- [x] T002 Configure environment variables in .env file (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- [x] T003 [P] Install Supabase client via `npx expo install @supabase/supabase-js`
- [x] T004 [P] Install Expo Image via `npx expo install expo-image`
- [x] T005 Verify TypeScript strict mode enabled in tsconfig.json
- [x] T006 Verify React Compiler enabled in app.json (experiments.reactCompiler: true)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema and infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Setup

- [x] T007 Create auctions table in Supabase SQL Editor (run schema from data-model.md lines 72-88)
- [x] T008 Create bids table in Supabase SQL Editor (run schema from data-model.md lines 117-127)
- [x] T009 [P] Create indexes for auctions table (idx_auctions_status, idx_auctions_ends_at)
- [x] T010 [P] Create indexes for bids table (idx_bids_auction_id, idx_bids_created_at, idx_bids_auction_created)
- [x] T011 Create validate_bid() trigger function in Supabase SQL Editor (from data-model.md lines 149-180)
- [x] T012 Attach trigger_validate_bid to bids table (from data-model.md lines 182-185)
- [x] T013 Create close_expired_auctions() function in Supabase SQL Editor (from data-model.md lines 129-138)
- [x] T014 Enable pg_cron extension in Supabase (CREATE EXTENSION IF NOT EXISTS pg_cron)
- [x] T015 Schedule pg_cron job to run close_expired_auctions() every minute (from data-model.md lines 143-148)
- [x] T016 Insert test auction data (5 sample auctions from data-model.md lines 191-221)
- [x] T017 Verify database setup by running SELECT queries on auctions and bids tables

### Core Infrastructure

- [x] T018 [P] Create lib/supabase.ts with Supabase client configuration (import createClient, export supabase instance)
- [x] T019 [P] Create lib/utils.ts with price formatting function (formatPrice: number → string with thousand separators)
- [x] T020 [P] Create lib/utils.ts with time formatting function (formatTimeRemaining: Date → "Xh Ym" or "Ym Xs" or "Ended")
- [x] T021 [P] Create constants/Auction.ts with AuctionStatus enum ('active' | 'ended') and DEFAULT_MIN_INCREMENT constant
- [x] T022 [P] Create TypeScript types in lib/types.ts (Auction, Bid interfaces matching database schema)

### UI Primitives

- [x] T023 [P] Create components/ui/Button.tsx (primary, secondary, outline variants with testID prop)
- [x] T024 [P] Create components/ui/Input.tsx (text/number input with validation, error display, testID prop)
- [x] T025 [P] Create components/ui/Card.tsx (auction card container with shadow, theme-aware)
- [x] T026 [P] Create components/ui/EmptyState.tsx (icon, title, description props, theme-aware)
- [x] T027 [P] Create components/ui/LoadingSpinner.tsx (activity indicator, theme-aware)
- [x] T028 [P] Create components/ui/Toast.tsx (success/error/info notifications with auto-dismiss)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Active Auctions (Priority: P1) 🎯 MVP

**Goal**: Users can discover and view ongoing auctions in a scrollable feed

**Independent Test**: Create test auction data in database, verify feed displays with pull-to-refresh

### Implementation for User Story 1

- [x] T029 [P] [US1] Create hooks/useAuctions.ts custom hook (fetch active auctions from Supabase, return data/loading/error states)
- [x] T030 [P] [US1] Create components/auction/AuctionCard.tsx (display title, current price, countdown timer, status badge, testID prop)
- [x] T031 [US1] Update app/(tabs)/index.tsx to fetch and display auctions using useAuctions hook
- [x] T032 [US1] Add FlatList to app/(tabs)/index.tsx with AuctionCard items, keyExtractor, renderItem
- [x] T033 [US1] Add pull-to-refresh functionality to app/(tabs)/index.tsx (RefreshControl component)
- [x] T034 [US1] Add loading state with LoadingSpinner to app/(tabs)/index.tsx (show while fetching)
- [x] T035 [US1] Add empty state with EmptyState to app/(tabs)/index.tsx (show when no auctions, message: "No active auctions")
- [x] T036 [US1] Add error state with retry button to app/(tabs)/index.tsx (show on network error, message: "Failed to load")
- [x] T037 [US1] Add onPress navigation to AuctionCard (navigate to app/auction/[id].tsx on tap)
- [x] T038 [US1] Verify theme support in AuctionCard (works in light/dark mode)
- [x] T039 [US1] Add testID props to interactive elements in auction feed

**Checkpoint**: User Story 1 complete - auction feed functional and testable independently

---

## Phase 4: User Story 2 - View Auction Details with Realtime Updates (Priority: P1)

**Goal**: Users see comprehensive auction information with sub-1-second realtime bid updates

**Independent Test**: Open same auction on two devices, verify bid updates appear instantly (< 1 second)

### Implementation for User Story 2

- [x] T040 [P] [US2] Create hooks/useAuctionDetail.ts custom hook (fetch auction by ID, subscribe to realtime bid updates)
- [x] T041 [P] [US2] Create components/auction/CountdownTimer.tsx (calculate and display remaining time, update every second, show "Ended" when expires)
- [x] T042 [P] [US2] Create components/auction/BidHistory.tsx (display latest 5 bids, newest first, show bidder name, amount, timestamp)
- [x] T043 [US2] Create app/auction/[id].tsx modal route with Stack.Screen configuration
- [x] T044 [US2] Add useAuctionDetail hook to app/auction/[id].tsx (fetch auction and bids on mount)
- [x] T045 [US2] Display auction details in app/auction/[id].tsx (title, description, image, current price, countdown timer)
- [x] T046 [US2] Display BidHistory component in app/auction/[id].tsx (latest 5 bids)
- [x] T047 [US2] Add Supabase realtime subscription to useAuctionDetail hook (subscribe to bids table INSERT events filtered by auction_id)
- [x] T048 [US2] Update UI automatically when new bid received via realtime (update current price, prepend to bid history, show toast)
- [x] T049 [US2] Add toast notification for realtime updates (message: "New bid placed!")
- [x] T050 [US2] Disable bidding controls when auction status is 'ended' in app/auction/[id].tsx
- [x] T051 [US2] Display winner information when auction ended in app/auction/[id].tsx (show highest bidder name)
- [x] T052 [US2] Add loading state to app/auction/[id].tsx (show while fetching auction details)
- [x] T053 [US2] Add error handling to app/auction/[id].tsx (navigate to 404 if auction not found)
- [x] T054 [US2] Verify countdown timer accuracy across two devices (difference < 2 seconds)
- [x] T055 [US2] Test realtime latency on two devices (bid update appears in < 1 second)
- [x] T056 [US2] Add testID props to auction detail elements

**Checkpoint**: User Story 2 complete - auction details with realtime updates functional

---

## Phase 5: User Story 3 - Place Bids on Auctions (Priority: P1)

**Goal**: Users can place bids with validation, optimistic UI, and instant feedback

**Independent Test**: Enter valid bid, submit, verify appears in database and UI updates

### Implementation for User Story 3

- [x] T057 [P] [US3] Create hooks/usePlaceBid.ts custom hook (insert bid into Supabase, handle validation errors, return submit function and loading state)
- [x] T058 [P] [US3] Create components/auction/BidInput.tsx (bid amount input, quick bid buttons +1,000원/+5,000원/+10,000원, submit button, testID props)
- [x] T059 [US3] Add BidInput component to app/auction/[id].tsx (sticky at bottom of screen)
- [x] T060 [US3] Connect BidInput to usePlaceBid hook in app/auction/[id].tsx
- [x] T061 [US3] Implement optimistic UI update in usePlaceBid (update local state immediately before server confirms)
- [x] T062 [US3] Add success toast on bid placement (message: "Bid placed successfully!")
- [x] T063 [US3] Add error handling for "bid too low" validation (toast message: "Bid too low - minimum is X원")
- [x] T064 [US3] Add error handling for "auction ended" validation (toast message: "Auction has ended")
- [x] T065 [US3] Add error handling for network failures (toast message: "Failed to place bid. Please try again.")
- [x] T066 [US3] Implement rollback on error (revert optimistic update if bid fails)
- [x] T067 [US3] Disable bid input when auction status is 'ended'
- [x] T068 [US3] Add loading indicator to submit button while bid is being processed
- [x] T069 [US3] Test bid validation with amount below minimum (verify error message)
- [x] T070 [US3] Test bid submission on two devices (verify second device receives update via realtime)
- [x] T071 [US3] Verify optimistic UI provides instant feedback before server confirms

**Checkpoint**: User Story 3 complete - bidding functional with realtime sync across devices

---

## Phase 6: User Story 4 - Create New Auctions (Priority: P2)

**Goal**: Users can create auction listings with validation

**Independent Test**: Fill form, submit, verify auction appears in feed and database

### Implementation for User Story 4

- [ ] T072 [US4] Create app/create-auction.tsx modal route (form for title, description, start price, min increment)
- [ ] T073 [US4] Add form inputs to create-auction.tsx (title Input, description TextArea, start price numeric Input, min increment numeric Input with default 1000)
- [ ] T074 [US4] Add form validation to create-auction.tsx (title required min 3 chars, description required min 10 chars, start price >= 0, min increment > 0)
- [ ] T075 [US4] Create submit handler in create-auction.tsx (insert auction into Supabase with 1-hour duration, ends_at = now() + interval '1 hour')
- [ ] T076 [US4] Add success handling in create-auction.tsx (close modal, navigate to feed, show toast: "Auction created!")
- [ ] T077 [US4] Add error handling in create-auction.tsx (display validation errors inline, network errors via toast)
- [ ] T078 [US4] Add "+" button to tab bar in app/(tabs)/_layout.tsx (navigate to create-auction.tsx on press)
- [ ] T079 [US4] Add loading state to submit button in create-auction.tsx (disable while creating)
- [ ] T080 [US4] Test form validation (empty fields, invalid values, verify error messages)
- [ ] T081 [US4] Test successful creation (verify new auction appears in feed with status "Active")
- [ ] T082 [US4] Verify created auction has correct ends_at timestamp (~1 hour from creation)

**Checkpoint**: User Story 4 complete - auction creation functional

---

## Phase 7: User Story 5 - Search and Filter Auctions (Priority: P3)

**Goal**: Users can find auctions via text search, status filter, and sorting

**Independent Test**: Enter search term, apply filters, verify results match criteria

### Implementation for User Story 5

- [ ] T083 [P] [US5] Add search input to app/(tabs)/index.tsx (TextInput with debounced onChange, 300ms delay)
- [ ] T084 [P] [US5] Add status filter buttons to app/(tabs)/index.tsx (All, Active, Ended radio buttons)
- [ ] T085 [P] [US5] Add sort dropdown to app/(tabs)/index.tsx (Ending Soon, Latest, Price options)
- [ ] T086 [US5] Implement client-side text search filter in app/(tabs)/index.tsx (filter by title/description match, case-insensitive)
- [ ] T087 [US5] Implement status filter in app/(tabs)/index.tsx (filter by auction.status === selectedStatus)
- [ ] T088 [US5] Implement sorting in app/(tabs)/index.tsx (sort by ends_at ASC, created_at DESC, or current_price DESC)
- [ ] T089 [US5] Use useMemo to optimize filtering performance in app/(tabs)/index.tsx (recompute only when search/filter/sort changes)
- [ ] T090 [US5] Add clear filters button to app/(tabs)/index.tsx (reset search, status, sort to defaults)
- [ ] T091 [US5] Test search functionality (verify filtering updates as user types)
- [ ] T092 [US5] Test combined filters (search + status + sort work together)
- [ ] T093 [US5] Verify filter performance with 100+ auctions (< 500ms response time)

**Checkpoint**: User Story 5 complete - search and filtering functional

---

## Phase 8: User Story 6 - Track My Bids and Wins (Priority: P3)

**Goal**: Users see their bid history with win/loss status

**Independent Test**: Place bids on multiple auctions, verify "My Bids" shows correct status

**Note**: MVP shows all bids (no user authentication) - post-MVP will filter by user_id

### Implementation for User Story 6

- [ ] T094 [P] [US6] Create hooks/useMyBids.ts custom hook (fetch bids with joined auction data from Supabase)
- [ ] T095 [US6] Update app/(tabs)/my-bids.tsx to use useMyBids hook
- [ ] T096 [US6] Display bid list in app/(tabs)/my-bids.tsx (FlatList with bid items showing auction title, bid amount, status)
- [ ] T097 [US6] Calculate win/loss status in app/(tabs)/my-bids.tsx (isWinning: active auction + bid equals current_price, hasWon/hasLost: ended auction)
- [ ] T098 [US6] Add status badges to bid items in app/(tabs)/my-bids.tsx ("Currently Winning", "Won", "Lost")
- [ ] T099 [US6] Add onPress navigation to bid items (navigate to auction detail on tap)
- [ ] T100 [US6] Add empty state to app/(tabs)/my-bids.tsx (show when no bids, message: "You haven't placed any bids yet")
- [ ] T101 [US6] Add loading state to app/(tabs)/my-bids.tsx (show while fetching bids)
- [ ] T102 [US6] Test bid tracking (place bids, verify appear in My Bids)
- [ ] T103 [US6] Test win/loss status calculation (verify badges show correct state)

**Checkpoint**: User Story 6 complete - bid tracking functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T104 [P] Add error boundary to app/_layout.tsx (catch React errors, show fallback UI with retry)
- [ ] T105 [P] Optimize bundle size (run `npx expo export`, verify < 50MB)
- [ ] T106 [P] Add accessibility labels to all interactive components (accessibilityLabel prop)
- [ ] T107 [P] Test theme switching (verify all screens work in light and dark mode)
- [ ] T108 Test on iOS device (verify 60fps scrolling, smooth animations, realtime updates)
- [ ] T109 Test on Android device (verify 60fps scrolling, smooth animations, realtime updates)
- [ ] T110 Test countdown timer accuracy on both platforms (verify < 2 second difference)
- [ ] T111 Verify auto-close function (create 1-minute auction, confirm status changes to 'ended' within 1 minute)
- [ ] T112 Run `npx expo doctor` and fix any issues
- [ ] T113 Test app with 100+ auctions in feed (verify smooth scrolling, no performance degradation)
- [ ] T114 Test realtime with poor network (verify reconnection, no data loss)
- [ ] T115 Verify all testID props are present (for future automated testing)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1, US2, US3 can proceed in parallel after Phase 2 (P1 priority)
  - US4 can proceed after US1 complete (P2 priority)
  - US5, US6 can proceed after US1 complete (P3 priority)
- **Polish (Phase 9)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (Browse)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (View Details)**: Can start after Foundational - No dependencies (parallel with US1)
- **User Story 3 (Place Bids)**: Depends on US2 (needs auction detail screen) - Sequential after US2
- **User Story 4 (Create)**: Can start after Foundational - Minimal dependency on US1 (needs feed to verify)
- **User Story 5 (Search/Filter)**: Depends on US1 (enhances auction feed)
- **User Story 6 (My Bids)**: Depends on US3 (needs bids to track)

### Critical Path for MVP (P1 Stories Only)

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1: Browse) → Phase 4 (US2: View Details) → Phase 5 (US3: Place Bids) → Test realtime on 2 devices → MVP Complete
```

### Parallel Opportunities

Tasks marked with **[P]** can run in parallel within their phase:

**Phase 1 (Setup)**:
- T003, T004 (different dependencies)

**Phase 2 (Foundational)**:
- T009, T010 (different tables)
- T018, T019, T020, T021, T022 (different files)
- T023, T024, T025, T026, T027, T028 (different UI components)

**Phase 3 (US1)**:
- T029, T030 (hook and component, different files)

**Phase 4 (US2)**:
- T040, T041, T042 (different files)

**Phase 5 (US3)**:
- T057, T058 (hook and component, different files)

**Phase 7 (US5)**:
- T083, T084, T085 (UI elements in same file, but can be styled independently)

**Phase 8 (US6)**:
- T094 (independent hook)

**Phase 9 (Polish)**:
- T104, T105, T106, T107 (independent improvements)

---

## Parallel Example: User Story 1

```bash
# Launch tasks T029 and T030 together (different files):
Task: "Create hooks/useAuctions.ts custom hook"
Task: "Create components/auction/AuctionCard.tsx"

# Both can be developed simultaneously by different developers or in parallel
```

---

## Implementation Strategy

### MVP First (P1 User Stories Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T028) - CRITICAL BLOCKER
3. Complete Phase 3: Browse Auctions (T029-T039)
4. Complete Phase 4: View Details (T040-T056)
5. Complete Phase 5: Place Bids (T057-T071)
6. **STOP and VALIDATE**: Test on two devices, verify realtime < 1s latency
7. Deploy MVP if validation passes

### Incremental Delivery

1. **Foundation** (Phase 1-2) → Database ready, UI primitives available
2. **Browse** (Phase 3) → Users can see auctions
3. **View + Realtime** (Phase 4) → Users can see details with live updates
4. **Bid** (Phase 5) → Users can participate in auctions (MVP complete!)
5. **Create** (Phase 6) → Users can list items (P2 enhancement)
6. **Search** (Phase 7) → Users can find specific items (P3 enhancement)
7. **Track** (Phase 8) → Users can monitor their activity (P3 enhancement)
8. **Polish** (Phase 9) → Production-ready quality

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

- **Developer A**: Phase 3 (US1: Browse) + Phase 5 (US3: Bids)
- **Developer B**: Phase 4 (US2: View Details)
- **Developer C**: Phase 2 (Foundational tasks in parallel)

Then merge and test realtime bidding across devices.

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability
- **Manual testing**: No automated tests - follow quickstart.md test scenarios
- **Realtime critical**: US2 + US3 realtime sync is MVP killer feature - test thoroughly
- **Database triggers**: Validate_bid() enforces business rules at DB level
- **pg_cron**: Auto-close auctions requires pg_cron extension enabled
- **TypeScript strict**: All tasks must maintain strict mode compliance
- **Theme support**: All components must work in light and dark mode
- **testID props**: Required for future automated testing

---

## Success Metrics

After completing all tasks, verify:

- [ ] Auction feed loads in < 2 seconds
- [ ] Realtime bid updates appear in < 1 second on both devices
- [ ] Countdown timers accurate within 2 seconds across devices
- [ ] Auctions auto-close within 1 minute of expiration
- [ ] 60fps scrolling on mid-range device with 100+ auctions
- [ ] App bundle size < 50MB
- [ ] No runtime TypeScript errors
- [ ] All testID props present for future testing

---

**Total Tasks**: 115
**Setup**: 6 tasks
**Foundational**: 22 tasks (BLOCKS all user stories)
**User Story 1 (P1)**: 11 tasks
**User Story 2 (P1)**: 17 tasks
**User Story 3 (P1)**: 15 tasks
**User Story 4 (P2)**: 11 tasks
**User Story 5 (P3)**: 11 tasks
**User Story 6 (P3)**: 10 tasks
**Polish**: 12 tasks

**MVP Scope (P1 only)**: Phases 1-5 (71 tasks) → Functional auction platform with realtime bidding

**Estimated Timeline**:
- MVP (P1 stories): 5-7 days for experienced developer
- Full feature set (P1 + P2 + P3): 10-14 days
- Production polish: +3-5 days

**Critical Path**: Setup → Foundational → Browse → View → Bid → Test Realtime (2 devices)
