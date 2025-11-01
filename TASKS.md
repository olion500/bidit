# Bidit Development Tasks

> **Project**: Bidit - Mobile-first Auction Platform
> **Tech Stack**: Expo/React Native + Supabase
> **Strategy**: Prototype-First → Core Features → Polish → Auth & Advanced

---

## 📋 Development Strategy

**Goal**: Get a working auction + bidding system as fast as possible, then add user management later.

**Priority**:
1. 🚀 **Prototype** - See it work (no auth, dummy data)
2. ⭐ **Core** - Essential features
3. 🔹 **Polish** - UX improvements
4. 🔸 **Later** - Auth, advanced features

---

## 🚀 Phase 1: Minimal Supabase Setup (Day 1)

### 1.1 Quick Supabase Setup
- [ ] 🔴 Create Supabase project
- [ ] 🔴 Configure environment variables
- [ ] 🔴 **Disable RLS temporarily** (enable later in Phase 6)

### 1.2 Minimal Database Schema
- [ ] 🔴 **Create `auctions` table (simplified)**
  ```sql
  - id (uuid, primary key, default: gen_random_uuid())
  - title (text)
  - description (text)
  - start_price (numeric)
  - current_price (numeric)
  - min_increment (numeric, default: 1000)
  - image_url (text, nullable)  -- Single image for now
  - ends_at (timestamptz)
  - status (text, default: 'active')
  - created_at (timestamptz, default: now())
  ```

- [ ] 🔴 **Create `bids` table (simplified)**
  ```sql
  - id (uuid, primary key, default: gen_random_uuid())
  - auction_id (uuid, references auctions)
  - bidder_name (text, default: 'Anonymous')  -- No user FK yet
  - amount (numeric)
  - created_at (timestamptz, default: now())
  ```

- [ ] 🔴 **Insert test data (3-5 auctions)**
  ```sql
  INSERT INTO auctions (title, description, start_price, current_price, ends_at)
  VALUES
    ('iPhone 15 Pro', 'Like new condition', 800000, 850000, now() + interval '1 hour'),
    ('Vintage Watch', 'Rare collectible', 500000, 500000, now() + interval '30 minutes');
  ```

---

## 🚀 Phase 2: Basic Expo App Setup (Day 1-2)

### 2.1 Install Essential Dependencies Only
```bash
npx expo install @supabase/supabase-js
npx expo install expo-image              # For optimized images
```

### 2.2 Supabase Client (No Auth)
- [ ] 🔴 Create `lib/supabase.ts`
  ```typescript
  import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
  )
  ```

### 2.3 Simple Navigation
- [ ] 🔴 Keep default tab structure from template
- [ ] 🔴 Use `app/(tabs)/index.tsx` as auction feed
- [ ] 🔴 Use `app/(tabs)/explore.tsx` as auction detail (for now)
- [ ] 🔴 Clean up unused screens (modal, etc.)

---

## 🚀 Phase 3: Auction Feed UI (Day 2-3)

### 3.1 Fetch Auctions
- [ ] 🔴 **Create `hooks/useAuctions.ts`**
  ```typescript
  // Fetch all active auctions
  // Use Supabase query: select * from auctions where status = 'active'
  ```

### 3.2 Auction Feed Screen
- [ ] 🔴 **Update `app/(tabs)/index.tsx`**
  - Fetch auctions on mount
  - Display loading state
  - List auctions in FlatList
  - Pull-to-refresh

### 3.3 Auction Card Component
- [ ] 🔴 **Create `components/AuctionCard.tsx`**
  - Show: title, current price, end time
  - Placeholder image for now
  - Press to navigate to detail
  - Simple, clean design

---

## 🚀 Phase 4: Auction Detail + Realtime Bidding (Day 4-5)

### 4.1 Auction Detail Screen
- [ ] 🔴 **Create `app/auction/[id].tsx`** (modal route)
  - Accept auction ID param
  - Fetch auction details
  - Display: title, description, current price
  - Show bid history (latest 5)
  - Countdown timer component

### 4.2 Countdown Timer
- [ ] 🔴 **Create `components/CountdownTimer.tsx`**
  - Calculate remaining time from `ends_at`
  - Update every second
  - Format: "5m 32s" or "1h 23m"
  - Show "Ended" when time's up

### 4.3 Bid Input UI
- [ ] 🔴 **Create bid input section (sticky bottom)**
  - Current price display (large, bold)
  - Text input for bid amount
  - Quick bid buttons (+1,000원, +5,000원, +10,000원)
  - "Place Bid" button (primary color)

### 4.4 Place Bid Logic
- [ ] 🔴 **Create `hooks/usePlaceBid.ts`**
  ```typescript
  // Insert into bids table
  // Update auctions.current_price
  // Validate: amount >= current_price + min_increment
  // Use anonymous bidder name for now
  ```

- [ ] 🔴 **Show success/error toast**
  - "Bid placed successfully!"
  - "Bid too low" error

### 4.5 Realtime Bid Updates ⭐⭐⭐ (CORE FEATURE)
- [ ] 🔴 **Subscribe to bids changes**
  ```typescript
  supabase
    .channel('bids')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'bids' },
      (payload) => {
        // Update UI with new bid
      }
    )
    .subscribe()
  ```

- [ ] 🔴 **Update current price in realtime**
- [ ] 🔴 **Add new bid to history list**
- [ ] 🔴 **Show toast: "New bid placed!"**
- [ ] 🔴 **Test with 2 devices** (most important!)

---

## ⭐ Phase 5: Create Auction (Day 6-7)

### 5.1 Simple Create Form
- [ ] 🔴 **Create `app/create-auction.tsx`** (modal)
  - Title input
  - Description textarea
  - Start price input (numeric)
  - Min increment (default 1000, editable)
  - End time picker (just use 1 hour from now for MVP)
  - Submit button

### 5.2 Insert Auction
- [ ] 🔴 **Insert auction into Supabase**
  ```typescript
  const { data, error } = await supabase
    .from('auctions')
    .insert({
      title,
      description,
      start_price,
      current_price: start_price,
      min_increment,
      ends_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    })
  ```

- [ ] 🔴 **Navigate back to feed after success**

### 5.3 Add to Tab Navigation
- [ ] 🔴 Add "+" button in tab bar to open create modal

---

## ⭐ Phase 6: Auto-Close Auctions (Day 8)

### 6.1 Database Function for Auto-Close
- [ ] 🔴 **Create Postgres Function**
  ```sql
  CREATE OR REPLACE FUNCTION close_expired_auctions()
  RETURNS void AS $$
  BEGIN
    UPDATE auctions
    SET status = 'ended'
    WHERE ends_at < now() AND status = 'active';
  END;
  $$ LANGUAGE plpgsql;
  ```

### 6.2 Setup pg_cron
- [ ] 🔴 **Enable pg_cron extension**
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  ```

- [ ] 🔴 **Schedule job (every minute)**
  ```sql
  SELECT cron.schedule(
    'close-expired-auctions',
    '* * * * *',
    $$ SELECT close_expired_auctions() $$
  );
  ```

### 6.3 Show Ended Auctions
- [ ] 🔴 **Update UI to show "Auction Ended" badge**
- [ ] 🔴 **Disable bidding on ended auctions**
- [ ] 🔴 **Show winner info (highest bidder name)**

---

## 🔹 Phase 7: UI Polish (Day 9-10)

### 7.1 Improve Auction Cards
- [ ] 🔴 Better styling with shadows, borders
- [ ] 🔴 Add status badges (Active, Ending Soon, Ended)
- [ ] 🔴 Show bid count
- [ ] 🔴 Format prices with commas (1,000,000원)

### 7.2 Loading & Empty States
- [ ] 🔴 Loading spinner while fetching
- [ ] 🔴 Empty state: "No active auctions"
- [ ] 🔴 Error state: "Failed to load"

### 7.3 Toast Notifications
- [ ] 🔴 Install a toast library or create simple toast component
- [ ] 🔴 Show toast on bid success/failure
- [ ] 🔴 Show toast when new bid arrives

### 7.4 Basic Animations
- [ ] 🔴 Button press animations
- [ ] 🔴 Card press feedback
- [ ] 🔴 Fade-in for new bids in history

---

## 🔹 Phase 8: Add Authentication (Day 11-12)

### 8.1 Design System
- [ ] 🔴 Update `constants/Colors.ts` with brand colors
- [ ] 🔴 Define typography (sizes, weights)
- [ ] 🔴 Create reusable components:
  - Button (primary, secondary, outline)
  - Input (text, number)
  - Card
  - EmptyState
  - LoadingSpinner

### 8.2 Animations
- [ ] 🔴 Install `react-native-reanimated`
- [ ] 🔴 Add button press animations
- [ ] 🔴 Add card swipe gestures
- [ ] 🔴 Add toast notifications (success/error)

### 8.3 Accessibility
- [ ] 🔴 Add `accessibilityLabel` to interactive elements
- [ ] 🔴 Test with screen reader
- [ ] 🔴 Ensure color contrast meets WCAG AA

---

## Phase 9: Testing & QA (Week 7)

### 9.1 Search & Filter
- [ ] 🔴 Add search bar to home screen
- [ ] 🔴 Filter by status (Active, Ended)
- [ ] 🔴 Sort by: Ending Soon, Latest, Price

### 9.2 My Bids Screen
- [ ] 🔴 Show auctions user has bid on
- [ ] �004 Highlight if user is currently winning
- [ ] 🔴 Show Won/Lost status

### 9.3 Image Upload
- [ ] 🔴 Install `expo-image-picker`
- [ ] 🔴 Add image picker to create auction form
- [ ] 🔴 Upload to Supabase Storage
- [ ] 🔴 Display images in auction detail

### 9.4 Profile & Settings
- [ ] 🔴 User profile screen
- [ ] 🔴 Edit username/avatar
- [ ] 🔴 My auctions list (selling)
- [ ] 🔴 Logout button

---

## 🔹 Phase 10: Testing & Deployment (Week 3-4)

### 10.1 Manual Testing
- [ ] 🔴 Test full flow: create → bid → win
- [ ] 🔴 Test realtime with 2 devices simultaneously
- [ ] 🔴 Test countdown accuracy
- [ ] 🔴 Test auto-close after time expires
- [ ] 🔴 Test edge cases (simultaneous bids, network failure)

### 10.2 Performance
- [ ] 🔴 Test with 50+ auctions
- [ ] 🔴 Optimize image loading
- [ ] 🔴 Test on low-end Android device

### 10.3 Build & Deploy
- [ ] 🔴 Create development build:
  ```bash
  npx eas-cli@latest build --profile development --platform android
  ```
- [ ] 🔴 Test on real device
- [ ] 🔴 Share with test users (optional)

---

## 🔸 Post-MVP Features (Later)

### Payments
- [ ] 🔸 Integrate Stripe or Toss Payments
- [ ] 🔸 Payment flow after winning
- [ ] 🔸 Platform fee (1%)
- [ ] 🔸 Seller settlement

### Notifications
- [ ] 🔸 Push notifications (Expo Notifications + FCM)
- [ ] 🔸 Email notifications (Resend)
- [ ] 🔸 Notify on outbid, auction ending, won/lost

### Advanced Bidding
- [ ] 🔸 Proxy bidding (auto-increment)
- [ ] 🔸 Buy Now option
- [ ] 🔸 Reserve price

### Social & Discovery
- [ ] 🔸 Seller ratings & reviews
- [ ] 🔸 Follow sellers
- [ ] 🔸 In-app messaging
- [ ] 🔸 Auction recommendations
- [ ] 🔸 Share on social media
- [ ] 🔸 Categories & tags

### Admin
- [ ] 🔸 Admin dashboard
- [ ] 🔸 User moderation
- [ ] 🔸 Fraud detection
- [ ] 🔸 Analytics

---

## Environment Setup

### Required Accounts
- [ ] Supabase (free tier)
- [ ] Expo account (for EAS builds)
- [ ] Google Cloud Console (OAuth)
- [ ] Apple Developer (iOS)

### Environment Variables

```bash
# .env (Expo - use app.config.js for sensitive vars)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Local Tools
- [ ] Node.js 18+
- [ ] Supabase CLI
- [ ] Expo CLI / EAS CLI
- [ ] iOS Simulator / Android Emulator

---

## 🎯 Current Status

**Last Updated**: 2025-11-02
**Current Phase**: Phase 1 - Ready to start
**Target**: Working prototype in 5-7 days, MVP in 2-3 weeks

---

## 📝 Key Notes

### Development Philosophy
- **See it work FIRST** - Build core auction/bidding before auth
- **Test with 2 devices** - Realtime is the killer feature
- **Keep it simple** - No fancy features until core works perfectly

### Critical Success Factors
1. ⭐⭐⭐ **Realtime bidding** must feel instant (< 1 second)
2. ⭐⭐ **Countdown timer** must be accurate
3. ⭐ **Auto-close** must work reliably

### Tech Decisions
- No Next.js backend (all Supabase)
- No authentication initially (add in Phase 8)
- No payments in MVP (post-launch)
- Use pg_cron for auction closing (not Edge Functions)
- Disable RLS until auth is added

### Quick Start Checklist
- [ ] Create Supabase project
- [ ] Add test auction data
- [ ] Connect Expo app to Supabase
- [ ] Build auction feed
- [ ] Build auction detail + bidding
- [ ] Test realtime with 2 devices 🎯

**Next Action**: Phase 1, Task 1.1 - Create Supabase project
