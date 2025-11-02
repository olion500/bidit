# Quickstart Testing Guide: Mobile Auction Platform

**Feature**: Mobile Auction Platform (Bidit)
**Purpose**: End-to-end validation of critical user flows
**Date**: 2025-11-02

---

## Prerequisites

Before testing, ensure you have:

- [x] Supabase project created
- [x] Database schema applied (auctions, bids tables)
- [x] Test data inserted (5+ sample auctions)
- [x] pg_cron scheduled function configured
- [x] Environment variables configured (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- [x] Dependencies installed (`@supabase/supabase-js`, `expo-image`)
- [x] Two physical devices or emulators for realtime testing

---

## Test Scenario 1: Browse Active Auctions (US1)

**Goal**: Verify auction feed displays correctly with basic interactions

**Steps**:

1. **Launch app**
   - App opens to home screen (tab navigation)
   - Loading spinner appears briefly
   - Auction feed loads within 2 seconds

2. **Verify auction cards display**
   - Each card shows: title, current price, time remaining, status badge
   - Prices formatted with thousand separators (e.g., "1,000,000원")
   - Countdown timers update every second
   - Status badges show "Active", "Ending Soon", or "Ended"

3. **Test pull-to-refresh**
   - Pull down on feed
   - Loading indicator appears
   - Feed refreshes with latest data
   - New auctions appear if created

4. **Test empty state** (if no auctions exist)
   - Feed shows "No active auctions" message
   - Message includes icon and helpful text

5. **Test error state**
   - Disconnect from internet
   - Pull to refresh
   - Error message "Failed to load" appears with retry button
   - Tap retry button → feed loads successfully

**Expected Results**:
- ✅ Feed loads < 2 seconds on good network
- ✅ Auction cards display all required information
- ✅ Countdown timers accurate (verify on two devices, difference < 2 seconds)
- ✅ Pull-to-refresh works without crashes
- ✅ Empty state appears when no auctions exist
- ✅ Error handling gracefully handles network issues

---

## Test Scenario 2: View Auction Details (US2)

**Goal**: Verify auction detail screen displays correctly with realtime updates

**Steps**:

1. **Navigate to detail screen**
   - Tap any auction card in feed
   - Detail modal opens with slide-up animation
   - Loading spinner appears briefly
   - Auction details load within 1 second

2. **Verify detail screen layout**
   - Title, description, image displayed
   - Current price (large, bold)
   - Countdown timer (updates every second)
   - Bid history (latest 5 bids, newest first)
   - Bid input section (sticky at bottom)
   - Quick bid buttons (+1,000원, +5,000원, +10,000원)

3. **Verify bid history**
   - Shows latest 5 bids
   - Each bid shows: bidder name ("Anonymous"), amount, timestamp
   - Ordered by newest first
   - If no bids: Show "No bids yet" message

4. **Verify countdown timer**
   - Timer displays as "Xh Ym" if > 1 hour remaining
   - Timer displays as "Ym Xs" if < 1 hour remaining
   - Timer updates every second
   - When time reaches zero: Shows "Auction Ended"
   - When ended: Bid input disabled, shows winner info

**Expected Results**:
- ✅ Detail screen loads < 1 second
- ✅ All auction information displayed correctly
- ✅ Countdown timer accurate and updates smoothly
- ✅ Bid history shows latest bids correctly
- ✅ UI disables bidding on ended auctions

---

## Test Scenario 3: Place Bid (US3)

**Goal**: Verify bid placement works with validation and optimistic UI

**Steps**:

1. **Test manual bid input**
   - Enter bid amount in input field
   - Tap "Place Bid" button
   - Optimistic UI: Price updates immediately
   - Success toast appears: "Bid placed successfully!"
   - Bid appears at top of history list
   - Input field clears

2. **Test quick bid buttons**
   - Tap "+1,000원" button
   - Input updates to current_price + 1,000
   - Tap "Place Bid"
   - Bid placed successfully

3. **Test bid validation - too low**
   - Enter amount < current_price + min_increment
   - Tap "Place Bid"
   - Error toast appears: "Bid too low - minimum is X원"
   - UI rolls back optimistic update

4. **Test bid validation - ended auction**
   - Wait for auction to end (or use test auction ending in 1 minute)
   - Attempt to place bid
   - Error toast appears: "Auction has ended"
   - Bid input disabled

5. **Test network error handling**
   - Disconnect from internet
   - Attempt to place bid
   - Error toast appears: "Failed to place bid. Please try again."
   - UI rolls back optimistic update

**Expected Results**:
- ✅ Bids placed successfully with valid amounts
- ✅ Optimistic UI provides instant feedback
- ✅ Validation errors show clear messages
- ✅ Network errors handled gracefully with rollback
- ✅ Quick bid buttons calculate correct amounts

---

## Test Scenario 4: Realtime Bid Updates (US2 + US3) ⭐ CRITICAL

**Goal**: Verify sub-1-second realtime updates across devices

**Requirements**: Two devices (Device A, Device B) on different networks

**Steps**:

1. **Setup**
   - Open same auction detail screen on both devices
   - Verify both show identical current price
   - Verify countdown timers match within 2 seconds

2. **Test realtime update from Device A to Device B**
   - Device A: Place bid of X원
   - Device A: Optimistic UI updates immediately
   - Device A: Success toast appears
   - **CRITICAL**: Device B: New bid appears within 1 second without manual refresh
   - Device B: Current price updates automatically
   - Device B: Toast notification: "New bid placed!"
   - Device B: Bid history updates with new bid at top

3. **Test realtime update from Device B to Device A**
   - Device B: Place bid of Y원 (Y > X + min_increment)
   - Device B: Optimistic UI updates
   - **CRITICAL**: Device A: New bid appears within 1 second
   - Device A: Current price updates automatically
   - Device A: Toast notification appears

4. **Test multiple rapid bids**
   - Device A: Place bid
   - Device B: Immediately place higher bid
   - Verify both devices show correct final state
   - Verify no race conditions or duplicate bids

5. **Measure latency** (use stopwatch)
   - Device A: Note exact time bid submitted
   - Device B: Note exact time UI updates
   - Calculate difference
   - **REQUIREMENT**: Latency < 1 second

**Expected Results**:
- ✅ Realtime updates appear on both devices < 1 second
- ✅ No manual refresh needed
- ✅ Toast notifications appear on receiving device
- ✅ Both devices show identical state after updates
- ✅ No race conditions or data inconsistencies
- ✅ WebSocket connection remains stable during extended session

---

## Test Scenario 5: Create Auction (US4)

**Goal**: Verify auction creation flow works end-to-end

**Steps**:

1. **Open create form**
   - Tap "+" button in tab bar
   - Create auction modal opens
   - Form shows: title, description, start price, min increment fields

2. **Fill form with valid data**
   - Title: "Test Auction"
   - Description: "This is a test auction created during validation"
   - Start Price: 100000
   - Min Increment: 1000 (auto-filled)

3. **Submit form**
   - Tap "Create Auction" button
   - Loading indicator appears
   - Success: Modal closes, navigates back to feed
   - New auction appears at top of feed (ending soon)

4. **Verify auction details**
   - New auction shows status "Active"
   - Current price = start price (100000)
   - Countdown shows ~1 hour remaining
   - Bid history empty ("No bids yet")

5. **Test form validation**
   - Leave title empty → Error: "Title is required"
   - Enter title < 3 characters → Error: "Title too short"
   - Leave description empty → Error: "Description is required"
   - Enter negative start price → Error: "Price must be positive"
   - Fix errors → Form submits successfully

**Expected Results**:
- ✅ Form validation works for all fields
- ✅ Auction created successfully with 1-hour duration
- ✅ New auction appears in feed immediately
- ✅ Auction details match form input
- ✅ Can place bids on newly created auction

---

## Test Scenario 6: Auto-Close Auctions

**Goal**: Verify pg_cron automatically closes expired auctions

**Requirements**: Supabase project with pg_cron configured

**Steps**:

1. **Create test auction with short duration**
   - Modify SQL to create auction ending in 2 minutes:
   ```sql
   INSERT INTO auctions (title, description, start_price, current_price, ends_at)
   VALUES ('Test Auto-Close', 'Ends in 2 minutes', 50000, 50000, now() + interval '2 minutes');
   ```

2. **Monitor auction status**
   - Open auction detail screen
   - Watch countdown timer approach zero
   - Timer reaches "0m 0s"
   - Timer shows "Auction Ended"
   - Bid input disabled immediately

3. **Wait for pg_cron**
   - Wait 1 minute after timer reaches zero
   - Check auction status in database:
   ```sql
   SELECT id, title, status FROM auctions WHERE title = 'Test Auto-Close';
   ```
   - Status should be 'ended'

4. **Verify client UI**
   - Refresh auction detail screen
   - Status badge shows "Ended"
   - Winner information displayed (if bids exist)
   - Cannot place new bids

**Expected Results**:
- ✅ Countdown timer accurate (reaches zero at correct time)
- ✅ Client UI disables bidding when timer reaches zero
- ✅ pg_cron updates status to 'ended' within 1 minute of expiration
- ✅ Database status matches client UI
- ✅ Ended auctions no longer accept bids

---

## Test Scenario 7: Search and Filter (US5)

**Goal**: Verify client-side search and filtering works correctly

**Steps**:

1. **Test text search**
   - Type "iPhone" in search bar
   - Feed filters to show only matching auctions
   - Search updates as user types (debounced)
   - Clear search → All auctions reappear

2. **Test status filter**
   - Select "Active" filter → Only active auctions shown
   - Select "Ended" filter → Only ended auctions shown
   - Select "All" → All auctions shown

3. **Test sorting**
   - Select "Ending Soon" → Auctions sorted by ends_at ASC
   - Select "Latest" → Auctions sorted by created_at DESC
   - Select "Price" → Auctions sorted by current_price DESC

4. **Test combined filters**
   - Search "iPhone" + Status "Active" + Sort "Ending Soon"
   - Feed shows only active iPhone auctions, ending soon first
   - Clear all filters → Full feed restored

**Expected Results**:
- ✅ Search filters instantly (< 500ms after typing stops)
- ✅ Status filter works correctly
- ✅ Sorting works correctly
- ✅ Combined filters work together
- ✅ Clearing filters restores full feed

---

## Test Scenario 8: My Bids Screen (US6)

**Goal**: Verify bid tracking and win/loss status

**Note**: MVP shows all bids (no user authentication)

**Steps**:

1. **Navigate to My Bids**
   - Tap "My Bids" tab
   - Screen shows all bids placed

2. **Verify bid list**
   - Each item shows: auction title, bid amount, auction status
   - Badge shows "Currently Winning" if user's bid is highest on active auction
   - Badge shows "Won" if user's bid is highest on ended auction
   - Badge shows "Lost" if outbid on ended auction

3. **Test tap to view auction**
   - Tap any bid item
   - Navigates to auction detail screen
   - Shows correct auction

4. **Test empty state**
   - If no bids exist (fresh install):
   - Shows "You haven't placed any bids yet" message

**Expected Results**:
- ✅ All bids displayed with correct status
- ✅ Win/loss status calculated correctly
- ✅ Tap navigation works
- ✅ Empty state shows when no bids

---

## Performance Benchmarks

### Load Times

| Screen | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| App launch to feed | < 2s | < 3s | > 3s |
| Auction detail load | < 1s | < 2s | > 2s |
| Bid placement | < 500ms | < 1s | > 1s |
| Realtime update latency | < 1s | < 2s | > 2s |

### Scrolling Performance

- **60fps target** on mid-range Android device
- **Tested with**: 100+ auctions in feed
- **Tool**: React DevTools Profiler
- **Metric**: Frame render time < 16.67ms (60fps)

### Network Usage

- **Initial load**: < 500KB (includes images)
- **Realtime connection**: ~1KB/minute (idle)
- **Bid placement**: < 5KB (includes optimistic UI)

---

## Edge Cases to Test

1. **Race Conditions**
   - Two users bid identical amount at same time → One succeeds, one gets "outbid" error
   - User bids just as auction expires → Error: "Auction has ended"

2. **Network Instability**
   - Slow 3G connection → Loading states appear, graceful degradation
   - Connection drops mid-bid → Error toast, rollback optimistic UI
   - Realtime reconnection → Subscription auto-resumes, no data loss

3. **Clock Drift**
   - Device A clock 5 minutes fast → Countdown still accurate (uses server timestamp)
   - Device B clock 5 minutes slow → Countdown still accurate

4. **Background/Foreground**
   - App goes to background → Timer pauses (or continues, depends on implementation)
   - App returns to foreground → Timer re-syncs with server time
   - Realtime subscription reconnects automatically

5. **Expired Auctions**
   - Countdown reaches zero → Client disables bidding immediately
   - pg_cron updates status within 1 minute → Database and client in sync
   - Trying to bid on expired auction → Error: "Auction has ended"

---

## Acceptance Criteria

**All scenarios MUST pass** before considering MVP ready for deployment:

- ✅ Auction feed loads < 2 seconds
- ✅ Realtime bid updates < 1 second latency (two-device test)
- ✅ Countdown timers accurate within 2 seconds across devices
- ✅ Auctions auto-close within 1 minute of expiration
- ✅ Bid validation prevents invalid bids
- ✅ Optimistic UI provides instant feedback
- ✅ Error handling works for network issues
- ✅ 60fps scrolling on mid-range device with 100+ auctions
- ✅ No runtime TypeScript errors
- ✅ App bundle size < 50MB

---

## Deployment Checklist

Before deploying to production:

- [ ] All test scenarios pass
- [ ] Performance benchmarks met
- [ ] Error boundaries tested with intentional crashes
- [ ] Accessibility: Screen reader support, font scaling
- [ ] Dark mode: All screens work in both light and dark themes
- [ ] App store metadata: Screenshots, description, keywords
- [ ] Privacy policy: Data collection disclosure (minimal for MVP)
- [ ] Supabase RLS: Disabled for MVP (document plan to enable with auth)
- [ ] Environment variables: Production Supabase credentials configured
- [ ] EAS Build: Successful builds for iOS and Android
- [ ] TestFlight/Internal Testing: Beta testers validate flows
- [ ] App store submission: Follow iOS/Android guidelines

---

## Troubleshooting

### Realtime not working
- Check Supabase Realtime enabled in project settings
- Verify WebSocket connection in Network tab (ws:// or wss://)
- Check channel subscription status (should show "SUBSCRIBED")
- Verify filter syntax: `auction_id=eq.{id}` (not `auction_id={id}`)

### Countdown timer inaccurate
- Use server timestamp (`ends_at`) as source of truth, not client `Date.now()`
- Verify `ends_at` is stored as `timestamptz` (timezone-aware)
- Check for timezone conversion issues (UTC vs local time)

### Bids rejected with "too low" error
- Verify bid >= current_price + min_increment
- Check for race condition (another bid placed between fetch and submit)
- Confirm trigger function `validate_bid()` is attached to `bids` table

### pg_cron not closing auctions
- Check pg_cron job in Supabase dashboard (Database → Cron Jobs)
- Verify job schedule: `* * * * *` (every minute)
- Check function logs for errors
- Test function manually: `SELECT close_expired_auctions();`

### App crashes on startup
- Check environment variables are set correctly
- Verify Supabase URL and ANON_KEY match project
- Review error logs in Expo Dev Tools
- Test on fresh install (clear app data/cache)

---

## Next Steps

After all tests pass:

1. Generate tasks with `/speckit.tasks`
2. Begin implementation (Phase 1: Supabase setup)
3. Implement user stories in priority order (P1 → P2 → P3)
4. Run this quickstart guide at each milestone
5. Deploy MVP when all acceptance criteria met

---

**Last Updated**: 2025-11-02
**Status**: Ready for implementation
