# Feature Specification: Mobile Auction Platform (Bidit)

**Feature Branch**: `001-auction-platform`
**Created**: 2025-11-02
**Status**: Draft
**Input**: User description: "i defined it in task.md organize them after that remove task.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Active Auctions (Priority: P1)

Users can discover and view ongoing auctions to find items they want to bid on.

**Why this priority**: Core discovery mechanism - without browsing, users cannot participate in auctions. This is the entry point to the entire platform.

**Independent Test**: Can be fully tested by creating test auction data in the database and verifying the feed displays correctly with pull-to-refresh functionality.

**Acceptance Scenarios**:

1. **Given** the app is launched, **When** user opens the home screen, **Then** they see a list of active auctions with title, current price, and time remaining
2. **Given** auctions are displayed, **When** user pulls down on the list, **Then** the auction feed refreshes with latest data
3. **Given** user is viewing the feed, **When** they tap on an auction card, **Then** they navigate to the detailed auction view
4. **Given** no auctions exist, **When** user views the feed, **Then** they see "No active auctions" empty state
5. **Given** network error occurs, **When** fetching auctions, **Then** user sees "Failed to load" error message with retry option

---

### User Story 2 - View Auction Details with Realtime Updates (Priority: P1)

Users can view comprehensive auction information including realtime bid updates from other participants.

**Why this priority**: Essential for informed bidding decisions. Realtime updates are the killer feature that differentiates this platform.

**Independent Test**: Can be tested by opening the same auction on two devices and verifying bid updates appear instantly (< 1 second) on both devices.

**Acceptance Scenarios**:

1. **Given** user taps an auction, **When** detail screen loads, **Then** they see title, description, current price, countdown timer, and recent bid history
2. **Given** user is viewing auction details, **When** another user places a bid, **Then** the current price updates automatically within 1 second without manual refresh
3. **Given** another bid arrives, **When** realtime update occurs, **Then** user sees a toast notification "New bid placed!" and bid history updates
4. **Given** auction time expires, **When** countdown reaches zero, **Then** timer shows "Auction Ended" and bidding controls are disabled
5. **Given** auction has ended, **When** user views the detail, **Then** they see winner information (highest bidder name)

---

### User Story 3 - Place Bids on Auctions (Priority: P1)

Users can place bids on active auctions using a simple, quick bid interface.

**Why this priority**: Core user action - the primary value proposition of an auction platform.

**Independent Test**: Can be tested by entering a valid bid amount, submitting, and verifying the bid appears in database and UI updates accordingly.

**Acceptance Scenarios**:

1. **Given** user is viewing an active auction, **When** they enter a bid amount >= current price + minimum increment, **Then** the bid is placed successfully and confirmation toast appears
2. **Given** user wants to bid quickly, **When** they tap quick bid buttons (+1,000원, +5,000원, +10,000원), **Then** the bid input updates automatically
3. **Given** user enters bid below minimum, **When** they attempt to submit, **Then** they see error message "Bid too low - minimum is [amount]"
4. **Given** bid is placed successfully, **When** transaction completes, **Then** auction current price updates and user's bid appears at top of bid history
5. **Given** auction has ended, **When** user attempts to bid, **Then** bidding controls are disabled and message shows "Auction Ended"

---

### User Story 4 - Create New Auctions (Priority: P2)

Users can list items for auction by creating auction listings with details and timing.

**Why this priority**: Required for marketplace to have content, but MVP can function with admin-created auctions initially.

**Independent Test**: Can be tested by filling out the creation form and verifying new auction appears in the feed and database.

**Acceptance Scenarios**:

1. **Given** user taps create button, **When** creation modal opens, **Then** they see form with title, description, starting price, and minimum increment fields
2. **Given** user fills valid auction details, **When** they submit, **Then** auction is created with 1-hour duration and appears in active feed
3. **Given** user leaves required fields empty, **When** they attempt to submit, **Then** validation errors highlight missing fields
4. **Given** auction is created successfully, **When** creation completes, **Then** user navigates back to feed and sees their new auction listed

---

### User Story 5 - Search and Filter Auctions (Priority: P3)

Users can find specific auctions by searching and applying filters for auction status and sorting.

**Why this priority**: Enhances discoverability but not critical for MVP functionality.

**Independent Test**: Can be tested by entering search terms and applying filters, verifying results match criteria.

**Acceptance Scenarios**:

1. **Given** user is on home screen, **When** they type in search bar, **Then** auction list filters to show only matching titles/descriptions
2. **Given** user wants to see ended auctions, **When** they select "Ended" filter, **Then** only completed auctions are displayed
3. **Given** user wants to sort, **When** they select "Ending Soon", **Then** auctions are ordered by time remaining (ascending)
4. **Given** multiple filters are applied, **When** user clears filters, **Then** full auction list is restored

---

### User Story 6 - Track My Bids and Wins (Priority: P3)

Users can view their bidding history and track which auctions they're winning or have won.

**Why this priority**: Important for user engagement but not required for basic auction functionality.

**Independent Test**: Can be tested by placing bids on multiple auctions and verifying the "My Bids" screen displays correct status.

**Acceptance Scenarios**:

1. **Given** user has placed bids, **When** they open "My Bids" screen, **Then** they see all auctions they've bid on with current status
2. **Given** user is highest bidder, **When** viewing "My Bids", **Then** those auctions are highlighted with "Currently Winning" badge
3. **Given** auction user bid on has ended, **When** viewing "My Bids", **Then** status shows "Won" or "Lost" based on final outcome
4. **Given** user has not placed any bids, **When** they open "My Bids", **Then** they see empty state "You haven't placed any bids yet"

---

### Edge Cases

- What happens when two users place identical bids at the exact same time (race condition)?
- How does the system handle network disconnections during bid submission?
- What happens when countdown timer and server time are out of sync?
- How are bids handled when auction expires exactly as bid is being placed?
- What happens if realtime subscription fails or disconnects?
- How does the app behave when loading 100+ auctions in the feed?
- What happens when user attempts to bid on their own auction?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all active auctions in a scrollable feed with title, current price, and time remaining
- **FR-002**: System MUST refresh auction feed when user performs pull-to-refresh gesture
- **FR-003**: System MUST show auction details including title, description, current price, minimum increment, countdown timer, and bid history (latest 5 bids)
- **FR-004**: System MUST update auction prices and bid history in realtime (< 1 second latency) when new bids are placed
- **FR-005**: System MUST validate bids are >= current price + minimum increment before accepting
- **FR-006**: System MUST allow users to place bids using manual input or quick bid buttons (+1,000원, +5,000원, +10,000원)
- **FR-007**: System MUST display countdown timer that updates every second showing remaining time in format "Xh Ym" or "Ym Xs"
- **FR-008**: System MUST allow users to create new auctions with title, description, starting price, minimum increment (default 1,000), and automatic 1-hour duration
- **FR-009**: System MUST automatically close auctions when end time is reached (within 1 minute accuracy)
- **FR-010**: System MUST disable bidding controls when auction has ended
- **FR-011**: System MUST show winner information (highest bidder name) on ended auctions
- **FR-012**: System MUST provide search functionality to filter auctions by title/description text
- **FR-013**: System MUST allow filtering auctions by status (Active, Ended)
- **FR-014**: System MUST support sorting auctions by: Ending Soon, Latest, Price
- **FR-015**: System MUST track and display user's bidding history showing auctions they've bid on
- **FR-016**: System MUST indicate on "My Bids" screen which auctions user is currently winning
- **FR-017**: System MUST show Won/Lost status for ended auctions in user's bid history
- **FR-018**: System MUST display appropriate empty states when no auctions exist or no bids placed
- **FR-019**: System MUST show error states with retry options when data fetching fails
- **FR-020**: System MUST display success/error toast notifications for bid placement results
- **FR-021**: System MUST format prices with thousand separators (e.g., 1,000,000원)
- **FR-022**: System MUST show status badges (Active, Ending Soon, Ended) on auction cards
- **FR-023**: System MUST display bid count on auction cards
- **FR-024**: System MUST provide loading spinners during data fetch operations
- **FR-025**: System MUST allow anonymous bidding with default bidder name "Anonymous" (authentication added later)

### Key Entities

- **Auction**: Represents an item listing available for bidding
  - Attributes: unique identifier, title, description, starting price, current price, minimum increment, image URL (optional), end time, status (active/ended), creation timestamp
  - Relationships: has many Bids

- **Bid**: Represents a user's bid on an auction
  - Attributes: unique identifier, auction reference, bidder name, bid amount, timestamp
  - Relationships: belongs to one Auction

- **User** (Phase 2 - Authentication): Represents platform participants
  - Attributes: unique identifier, username, email, avatar, creation timestamp
  - Relationships: has many Bids, has many Auctions (created)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse active auctions within 2 seconds of app launch
- **SC-002**: Realtime bid updates appear on all connected devices within 1 second of bid placement
- **SC-003**: Users can place a bid in under 5 seconds using quick bid buttons
- **SC-004**: Countdown timers remain accurate within 2 seconds across all devices
- **SC-005**: Auctions auto-close within 1 minute of expiration time
- **SC-006**: Users can create a new auction in under 60 seconds
- **SC-007**: App displays correct auction status (Active/Ended) 100% of the time
- **SC-008**: Search results filter instantly (< 500ms) as user types
- **SC-009**: App handles 100+ auctions in feed without performance degradation (60fps scrolling)
- **SC-010**: Realtime subscription successfully reconnects within 5 seconds after network interruption
- **SC-011**: Two devices testing simultaneously show identical auction state within 1-second sync window
- **SC-012**: Users can complete full auction cycle (create → bid → win) without errors in test environment

## Assumptions

1. **Currency**: All prices are in Korean Won (원) - this is inferred from the task list examples
2. **Initial Authentication**: Anonymous bidding is acceptable for MVP - authentication will be added in Phase 8
3. **Auction Duration**: Fixed 1-hour duration is sufficient for MVP - custom durations can be added later
4. **Image Support**: Single image per auction is sufficient initially - multiple images is post-MVP
5. **Data Volume**: System is designed for hundreds of auctions, not millions - optimization needed if scale increases
6. **Network**: Users have reasonably stable internet connection - offline mode is not in scope
7. **Timezone**: All times displayed in user's local timezone with server-side timestamp management
8. **Bid Increments**: Minimum increment is fixed per auction (not dynamic based on current price)
9. **Payment Processing**: Not included in MVP scope - added post-launch
10. **Moderation**: No content moderation or fraud detection in MVP - trusted user base assumed

## Constraints

- **Platform**: Mobile-first - iOS 15+ and Android 10+ required
- **Performance**: Maintain 60fps scrolling and animations on mid-range devices
- **Latency**: Realtime updates must be < 1 second for competitive bidding experience
- **Bundle Size**: Keep app size under 50MB for mobile network downloads
- **Offline**: App requires internet connection - no offline functionality in MVP
- **Concurrent Users**: System should support at least 100 concurrent bidders per auction
- **Database**: Use Supabase PostgreSQL with RLS disabled initially (enabled in Phase 8 with auth)

## Dependencies

- **Supabase**: Backend-as-a-Service for database, realtime subscriptions, and future authentication
- **Expo SDK ~54**: Mobile development framework for cross-platform development
- **expo-image**: Optimized image loading and caching
- **@supabase/supabase-js**: Client library for Supabase integration
- **pg_cron**: PostgreSQL extension for scheduled auction closing (Supabase-managed)
- **React Native Reanimated**: For smooth animations (added in Phase 7)

## Out of Scope (Post-MVP)

- User authentication and authorization (planned for Phase 8)
- Payment processing and transactions
- Push notifications for bid updates and auction endings
- Email notifications
- Proxy/auto bidding
- Buy Now functionality
- Reserve prices
- Multiple images per auction
- Custom auction durations beyond 1 hour
- Image upload via camera/gallery (placeholder images only in MVP)
- Seller ratings and reviews
- In-app messaging between buyers and sellers
- Social sharing
- Admin dashboard and moderation tools
- Fraud detection and prevention
- Analytics and reporting
- Categories and tags for auctions
- User profiles with edit capabilities (basic profile in Phase 9)
