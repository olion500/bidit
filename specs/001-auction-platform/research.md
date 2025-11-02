# Technical Research: Mobile Auction Platform

**Feature**: Mobile Auction Platform (Bidit)
**Date**: 2025-11-02
**Purpose**: Document technical decisions, alternatives considered, and rationale for architecture choices

---

## 1. Backend Architecture

### Decision: Supabase Backend-as-a-Service

**Chosen**: Supabase (PostgreSQL + Realtime + Auth + Storage)

**Rationale**:
- **Realtime built-in**: WebSocket-based realtime subscriptions via PostgreSQL logical replication
- **Managed PostgreSQL**: Cloud-hosted, auto-scaling database with backups
- **pg_cron support**: Scheduled functions for auto-closing auctions
- **Future-proof**: Authentication, file storage, edge functions available when needed post-MVP
- **Cost**: Free tier sufficient for MVP (500MB database, 2GB bandwidth, unlimited API requests)
- **DX**: Excellent TypeScript client, integrates seamlessly with React Native

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Firebase | Realtime database, easy setup | NoSQL (less suitable for auctions), vendor lock-in | PostgreSQL better for relational auction/bid data, complex queries |
| Custom Node.js + Socket.IO | Full control, flexible | More code to maintain, need hosting, no managed DB | Increased complexity, slower MVP, manual scaling |
| AWS Amplify | Full AWS ecosystem | Steeper learning curve, more expensive | Overkill for MVP, Supabase simpler for mobile-first |
| Hasura + PostgreSQL | GraphQL, realtime | Requires separate hosting, more setup | Supabase provides same features with better DX for React Native |

**Best Practices**:
- Use Supabase client library for all database operations (type-safe queries)
- Enable Row Level Security (RLS) when adding authentication in Phase 8
- Use database triggers for bid validation (prevent invalid bids)
- Leverage PostgreSQL UNIQUE constraints to handle race conditions

---

## 2. Realtime Bid Updates

### Decision: Supabase Realtime Channels (PostgreSQL Replication)

**Chosen**: Supabase Realtime with `postgres_changes` event listener

**Rationale**:
- **Sub-second latency**: WebSocket connection maintains persistent channel
- **Selective subscriptions**: Filter by auction_id to reduce unnecessary updates
- **Automatic reconnection**: Client handles disconnects with exponential backoff
- **Payload efficiency**: Only changed data sent (INSERT events for new bids)
- **Server-side filtering**: Database-level filtering before sending to clients

**Implementation Pattern**:
```typescript
// Subscribe to specific auction's bids
const channel = supabase
  .channel(`auction:${auctionId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'bids',
      filter: `auction_id=eq.${auctionId}`
    },
    (payload) => {
      // New bid received - update UI
      setCurrentPrice(payload.new.amount)
      setBids(prev => [payload.new, ...prev])
      showToast('New bid placed!')
    }
  )
  .subscribe()

// Cleanup on unmount
return () => { channel.unsubscribe() }
```

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Polling (every 1-2s) | Simple implementation | High latency, server load, battery drain | Cannot achieve < 1s requirement, inefficient |
| Server-Sent Events (SSE) | One-way server push | HTTP-based (less efficient), no bidirectional | WebSockets more efficient for realtime |
| GraphQL Subscriptions | Type-safe, flexible | Requires GraphQL server setup | Adds complexity, Supabase Realtime simpler |
| Socket.IO | Battle-tested, fallbacks | Requires custom backend | Supabase Realtime sufficient, no need for custom server |

**Testing Strategy**:
- Two physical devices on different networks
- Measure latency from bid submission to UI update on second device
- Target: < 1 second (spec requirement)
- Monitor WebSocket connection stability during extended sessions

---

## 3. Countdown Timer Implementation

### Decision: Client-Side Countdown with Server Timestamp Sync

**Chosen**: Calculate remaining time using server `ends_at` timestamp, update UI every second with `setInterval`

**Rationale**:
- **Accuracy**: Server timestamp is source of truth (prevents client clock drift)
- **Performance**: No network requests during countdown (all client-side calculation)
- **Consistency**: All devices calculate from same server timestamp
- **Simplicity**: Standard JavaScript Date operations, no external libraries

**Implementation Pattern**:
```typescript
const CountdownTimer = ({ endsAt }: { endsAt: string }) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const serverTime = new Date(endsAt).getTime()
      const now = Date.now()
      const diff = Math.max(0, serverTime - now)

      if (diff === 0) {
        setTimeLeft('Ended')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    calculateTimeLeft() // Initial calculation
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endsAt])

  return <Text>{timeLeft}</Text>
}
```

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Server polling for time | Always accurate | Network overhead, battery drain, latency | Inefficient, defeats purpose of client-side timer |
| date-fns library | Utility functions | Adds bundle size for simple operation | Built-in Date sufficient, no need for library |
| moment.js | Rich formatting | Large bundle (67KB gzipped) | Deprecated, too heavy for mobile |
| Background timer with notifications | Works when app backgrounded | Complex, requires permissions | MVP doesn't need background timers |

**Edge Cases Handled**:
- **App goes to background**: Timer continues running, re-syncs on foreground
- **Client clock is wrong**: Server timestamp is source of truth (no client Date.now() comparison)
- **Auction already ended**: Show "Ended" immediately
- **Network delay**: Initial `ends_at` fetched once, no subsequent network calls

---

## 4. Auto-Close Auctions

### Decision: pg_cron Scheduled PostgreSQL Function

**Chosen**: PostgreSQL function `close_expired_auctions()` running every minute via pg_cron extension

**Rationale**:
- **Database-level**: No application code needed, runs even if app is down
- **Accuracy**: Cron runs every minute, meets "within 1 minute" requirement
- **Simplicity**: Single SQL function, no server infrastructure
- **Reliability**: PostgreSQL handles execution, retries on failure
- **Cost**: Free with Supabase (pg_cron included in all tiers)

**Implementation**:
```sql
-- Function to close expired auctions
CREATE OR REPLACE FUNCTION close_expired_auctions()
RETURNS void AS $$
BEGIN
  UPDATE auctions
  SET status = 'ended'
  WHERE ends_at < now() AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Schedule to run every minute
SELECT cron.schedule(
  'close-expired-auctions',
  '* * * * *', -- Every minute
  $$ SELECT close_expired_auctions() $$
);
```

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Supabase Edge Functions (cron) | Serverless, scalable | Requires cold starts, more complex setup | pg_cron simpler, sufficient for MVP |
| Client-side status check | No server needed | Unreliable (app must be open), inconsistent | Cannot guarantee auction closes on time |
| Background job queue (Bull, etc.) | Flexible scheduling | Requires Node.js server, Redis, infrastructure | Over-engineering for simple cron job |
| AWS Lambda + EventBridge | Managed, scalable | Requires AWS account, more expensive | pg_cron free and simpler |

**Monitoring**:
- Check pg_cron job logs in Supabase dashboard
- Fallback: If pg_cron fails, client-side UI should still show "Ended" when countdown reaches zero
- Test: Create auction with 1-minute duration, verify status changes within 1 minute

**Risk Mitigation**:
- **pg_cron not available**: Fallback to Supabase Edge Function with cron trigger (requires upgrade to paid tier)
- **Function fails**: Add error logging to function, alert on repeated failures
- **Clock drift**: Use PostgreSQL `now()` function (server time) instead of client time

---

## 5. Anonymous Authentication Strategy

### Decision: No Authentication in MVP, Hardcoded "Anonymous" Bidder Name

**Chosen**: All users bid as "Anonymous", no user accounts or sessions

**Rationale**:
- **Faster MVP**: Skip entire auth flow (signup, login, password reset, etc.)
- **Focus on core**: Prove realtime bidding works before adding auth complexity
- **Incremental delivery**: Auth is planned for Phase 8 (post-MVP)
- **Testing easier**: No need to create test accounts, login/logout during development
- **Supabase ready**: When needed, Supabase Auth supports email/password, OAuth, magic links

**MVP Behavior**:
- All bids use default bidder_name = 'Anonymous'
- No user tracking or bid history per user
- Anyone can place bids on any auction
- "My Bids" feature disabled (or shows all bids as if user placed them)

**Post-MVP Migration (Phase 8)**:
```sql
-- Add user foreign key to bids table
ALTER TABLE bids
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Add user foreign key to auctions table
ALTER TABLE auctions
ADD COLUMN seller_id uuid REFERENCES auth.users(id);

-- Enable Row Level Security (RLS)
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view all auctions, insert bids only when authenticated
CREATE POLICY "Public can view auctions" ON auctions FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create auctions" ON auctions FOR INSERT TO authenticated USING (seller_id = auth.uid());
CREATE POLICY "Authenticated users can place bids" ON bids FOR INSERT TO authenticated USING (user_id = auth.uid());
```

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Build auth from scratch | Full control | Time-consuming, security risks, maintenance | Supabase Auth handles this better |
| Require auth from day 1 | Better data, prevents abuse | Slows MVP, adds complexity before validating realtime | Can add later, not MVP-critical |
| Email-only (no password) | Simple, low friction | Still requires verification flow | Still adds complexity, defer to Phase 8 |
| OAuth only (Google/Apple) | Social login, trusted providers | Requires app store credentials, setup | Good for Phase 8, but overkill for MVP |

---

## 6. Image Handling

### Decision: Placeholder Images Only (No Upload in MVP)

**Chosen**: Use static placeholder images or image URLs (no camera/gallery upload)

**Rationale**:
- **Simplicity**: Skip entire upload flow (camera permissions, file picker, compression, storage)
- **Focus on core**: Realtime bidding is the killer feature, not images
- **Supabase Storage ready**: When needed, Supabase Storage supports file uploads with CDN
- **Testing easier**: Use fixed test images, no upload UX to test

**MVP Behavior**:
- Auctions have optional `image_url` field (text)
- Users can paste image URL when creating auction (or leave blank)
- Display placeholder image if `image_url` is null
- Use `expo-image` for optimized loading and caching

**Post-MVP Enhancement**:
```typescript
// Phase 9: Add image upload with expo-image-picker
import * as ImagePicker from 'expo-image-picker'

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8, // Compress to reduce upload size
  })

  if (!result.canceled) {
    const file = result.assets[0]
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('auction-images')
      .upload(`${Date.now()}-${file.fileName}`, file.uri)

    if (!error) {
      const publicUrl = supabase.storage.from('auction-images').getPublicUrl(data.path).data.publicUrl
      setImageUrl(publicUrl)
    }
  }
}
```

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Allow upload from day 1 | Better UX, more realistic | Adds complexity (permissions, storage, compression) | Not MVP-critical, defer to Phase 9 |
| Use external image hosting (Cloudinary) | Powerful transformations | Adds dependency, cost | Supabase Storage sufficient for later |
| Base64 encode images in database | No external storage | Huge payload sizes, slow queries | Terrible performance, never do this |

---

## 7. Search and Filtering

### Decision: Client-Side Filtering with Optimized Re-Renders

**Chosen**: Fetch all active auctions, filter locally in React state

**Rationale**:
- **Performance**: 100+ auctions is small enough for client-side filtering (< 1MB data)
- **Instant results**: No network delay, filter as user types
- **Simplicity**: No server-side search indexes or full-text search needed
- **Offline-friendly**: Works with cached data (no re-fetch on filter change)

**Implementation Pattern**:
```typescript
const [auctions, setAuctions] = useState<Auction[]>([])
const [searchQuery, setSearchQuery] = useState('')
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>('active')
const [sortBy, setSortBy] = useState<'ending-soon' | 'latest' | 'price'>('ending-soon')

// Debounce search input to avoid excessive re-renders
const debouncedSearch = useDebouncedValue(searchQuery, 300)

const filteredAuctions = useMemo(() => {
  let filtered = auctions

  // Text search
  if (debouncedSearch) {
    const query = debouncedSearch.toLowerCase()
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(a => a.status === statusFilter)
  }

  // Sort
  if (sortBy === 'ending-soon') {
    filtered = filtered.sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime())
  } else if (sortBy === 'latest') {
    filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sortBy === 'price') {
    filtered = filtered.sort((a, b) => b.current_price - a.current_price)
  }

  return filtered
}, [auctions, debouncedSearch, statusFilter, sortBy])
```

**Future Optimization (if needed for 1000+ auctions)**:
- Server-side pagination (fetch 50 at a time, infinite scroll)
- PostgreSQL full-text search with `tsvector` column
- Algolia or Meilisearch for advanced search (typo tolerance, facets)

**Alternatives Considered**:

| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Server-side full-text search | Scalable for large datasets | Adds complexity, network latency | Client-side sufficient for 100+ auctions |
| Algolia search | Typo tolerance, instant, facets | External service, cost ($0.50/1k searches) | Overkill for MVP, client-side fast enough |
| No search/filter | Simplest | Poor UX with many auctions | Users need to find specific items |

---

## 8. Error Handling & User Feedback

### Decision: Toast Notifications + Error Boundaries + Loading States

**Chosen**: Combination of UI patterns for different error types

**Rationale**:
- **Toasts**: Transient feedback for actions (bid success/failure)
- **Error boundaries**: Catch React render errors and show fallback UI
- **Loading states**: Spinners during data fetching (prevents empty screens)
- **Empty states**: Friendly messages when no data exists
- **Retry buttons**: Network error recovery

**Implementation**:
```typescript
// Toast for bid submission
const placeBid = async (amount: number) => {
  try {
    const { error } = await supabase.from('bids').insert({ auction_id: id, amount, bidder_name: 'Anonymous' })
    if (error) throw error

    showToast({ type: 'success', message: 'Bid placed successfully!' })
  } catch (error) {
    if (error.message.includes('minimum increment')) {
      showToast({ type: 'error', message: `Bid too low - minimum is ${currentPrice + minIncrement}원` })
    } else {
      showToast({ type: 'error', message: 'Failed to place bid. Please try again.' })
    }
  }
}

// Error boundary for React errors
<ErrorBoundary fallback={<ErrorScreen onRetry={() => window.location.reload()} />}>
  <AuctionFeed />
</ErrorBoundary>

// Empty state
{auctions.length === 0 && !loading && (
  <EmptyState
    icon="🔨"
    title="No active auctions"
    description="Check back later or create your own auction"
  />
)}
```

**Best Practices**:
- Always show user-friendly error messages (never raw error objects)
- Provide actionable next steps ("Try again", "Check your connection")
- Log errors to console for debugging (consider Sentry in production)
- Handle network errors gracefully (Supabase client handles retries)

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Backend** | Supabase BaaS | Realtime built-in, managed PostgreSQL, pg_cron, future-proof |
| **Realtime** | Supabase Channels | Sub-second latency, WebSocket, selective subscriptions |
| **Timer** | Client-side with server timestamp | Accurate, no network overhead, consistent across devices |
| **Auto-Close** | pg_cron scheduled function | Database-level, reliable, simple, free |
| **Auth** | Anonymous (MVP) | Faster MVP, defer to Phase 8 |
| **Images** | Placeholder URLs | Defer upload to Phase 9, focus on realtime |
| **Search** | Client-side filtering | Sufficient for 100+ items, instant, simple |
| **Errors** | Toasts + boundaries + loading | User-friendly, actionable, covers all cases |

---

## Next Phase

All technical unknowns have been resolved. Proceed to **Phase 1: Data Model & Contracts**.
