# API Contracts: Supabase Queries & Realtime

**Feature**: Mobile Auction Platform (Bidit)
**Backend**: Supabase (PostgreSQL + Realtime)
**Date**: 2025-11-02

---

## Overview

All backend operations use Supabase client library (`@supabase/supabase-js`). No REST API or GraphQL needed - Supabase provides auto-generated PostgREST API + Realtime subscriptions.

**Authentication**: None for MVP (anonymous access). Supabase ANON_KEY allows public read/write per RLS policies (currently disabled).

---

## Query Specifications

### Q1: Fetch Active Auctions

**Purpose**: Display auction feed on home screen

**User Story**: US1 - Browse Active Auctions

**TypeScript**:
```typescript
const { data: auctions, error } = await supabase
  .from('auctions')
  .select('*')
  .eq('status', 'active')
  .order('ends_at', { ascending: true }) // Ending soon first

if (error) throw error
return auctions
```

**SQL Equivalent**:
```sql
SELECT *
FROM auctions
WHERE status = 'active'
ORDER BY ends_at ASC;
```

**Response Example**:
```json
[
  {
    "id": "a1b2c3d4-...",
    "title": "iPhone 15 Pro 256GB",
    "description": "Brand new, sealed box...",
    "start_price": 800000,
    "current_price": 850000,
    "min_increment": 10000,
    "image_url": "https://example.com/iphone15.jpg",
    "ends_at": "2025-11-02T18:30:00Z",
    "status": "active",
    "created_at": "2025-11-02T17:30:00Z"
  }
]
```

**Error Handling**:
- Network error → Show error state with retry button
- Empty result → Show "No active auctions" empty state

---

### Q2: Fetch Single Auction Detail

**Purpose**: Display auction detail screen with current price and bid history

**User Story**: US2 - View Auction Details

**TypeScript**:
```typescript
const { data: auction, error } = await supabase
  .from('auctions')
  .select('*')
  .eq('id', auctionId)
  .single()

if (error) throw error
return auction
```

**SQL Equivalent**:
```sql
SELECT *
FROM auctions
WHERE id = $1;
```

**Response Example**:
```json
{
  "id": "a1b2c3d4-...",
  "title": "iPhone 15 Pro 256GB",
  "description": "Brand new, sealed box. Space Black color...",
  "start_price": 800000,
  "current_price": 850000,
  "min_increment": 10000,
  "image_url": "https://example.com/iphone15.jpg",
  "ends_at": "2025-11-02T18:30:00Z",
  "status": "active",
  "created_at": "2025-11-02T17:30:00Z"
}
```

**Error Handling**:
- Auction not found → Navigate to 404 screen
- Network error → Show error state with retry button

---

### Q3: Fetch Bid History

**Purpose**: Display recent bids in auction detail screen

**User Story**: US2 - View Auction Details

**TypeScript**:
```typescript
const { data: bids, error } = await supabase
  .from('bids')
  .select('*')
  .eq('auction_id', auctionId)
  .order('created_at', { ascending: false })
  .limit(5) // Latest 5 bids only

if (error) throw error
return bids
```

**SQL Equivalent**:
```sql
SELECT *
FROM bids
WHERE auction_id = $1
ORDER BY created_at DESC
LIMIT 5;
```

**Response Example**:
```json
[
  {
    "id": "b1c2d3e4-...",
    "auction_id": "a1b2c3d4-...",
    "bidder_name": "Anonymous",
    "amount": 850000,
    "created_at": "2025-11-02T17:45:00Z"
  },
  {
    "id": "b2c3d4e5-...",
    "auction_id": "a1b2c3d4-...",
    "bidder_name": "Anonymous",
    "amount": 820000,
    "created_at": "2025-11-02T17:40:00Z"
  }
]
```

**Error Handling**:
- Network error → Show error state
- Empty result → Show "No bids yet" message

---

### Q4: Place Bid

**Purpose**: Insert new bid and update auction current price

**User Story**: US3 - Place Bids on Auctions

**TypeScript**:
```typescript
const { data: bid, error } = await supabase
  .from('bids')
  .insert({
    auction_id: auctionId,
    bidder_name: 'Anonymous',
    amount: bidAmount,
  })
  .select()
  .single()

if (error) {
  if (error.message.includes('Bid too low')) {
    throw new Error(`Bid too low - minimum is ${currentPrice + minIncrement}원`)
  }
  if (error.message.includes('ended auction')) {
    throw new Error('Auction has ended')
  }
  throw error
}

return bid
```

**SQL Equivalent** (via trigger):
```sql
-- User inserts bid
INSERT INTO bids (auction_id, bidder_name, amount)
VALUES ($1, 'Anonymous', $2);

-- Trigger automatically:
-- 1. Validates bid meets minimum (current_price + min_increment)
-- 2. Validates auction is still active
-- 3. Updates auctions.current_price = $2
```

**Request Example**:
```json
{
  "auction_id": "a1b2c3d4-...",
  "bidder_name": "Anonymous",
  "amount": 860000
}
```

**Response Example** (Success):
```json
{
  "id": "b3c4d5e6-...",
  "auction_id": "a1b2c3d4-...",
  "bidder_name": "Anonymous",
  "amount": 860000,
  "created_at": "2025-11-02T17:50:00Z"
}
```

**Error Handling**:
- Bid too low → Show toast: "Bid too low - minimum is X원"
- Auction ended → Show toast: "Auction has ended"
- Network error → Show toast: "Failed to place bid. Please try again."

**Optimistic UI**:
```typescript
// Update UI immediately (before server confirms)
setCurrentPrice(bidAmount)
setBids(prev => [{ id: 'temp', auction_id: auctionId, bidder_name: 'Anonymous', amount: bidAmount, created_at: new Date().toISOString() }, ...prev])

// Then submit to server
try {
  await placeBid(bidAmount)
  // Server confirms - UI already updated
} catch (error) {
  // Rollback on error
  setCurrentPrice(previousPrice)
  setBids(prev => prev.filter(b => b.id !== 'temp'))
  showToast({ type: 'error', message: error.message })
}
```

---

### Q5: Create Auction

**Purpose**: Allow users to create new auction listings

**User Story**: US4 - Create New Auctions

**TypeScript**:
```typescript
const { data: auction, error } = await supabase
  .from('auctions')
  .insert({
    title: formData.title,
    description: formData.description,
    start_price: formData.startPrice,
    current_price: formData.startPrice, // Initially same as start_price
    min_increment: formData.minIncrement || 1000,
    image_url: formData.imageUrl || null,
    ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    status: 'active',
  })
  .select()
  .single()

if (error) throw error
return auction
```

**SQL Equivalent**:
```sql
INSERT INTO auctions (title, description, start_price, current_price, min_increment, image_url, ends_at, status)
VALUES ($1, $2, $3, $3, $4, $5, now() + interval '1 hour', 'active')
RETURNING *;
```

**Request Example**:
```json
{
  "title": "Samsung Galaxy S24 Ultra",
  "description": "512GB, Titanium Black. Brand new, unlocked.",
  "start_price": 1200000,
  "min_increment": 10000,
  "image_url": null
}
```

**Response Example**:
```json
{
  "id": "a2b3c4d5-...",
  "title": "Samsung Galaxy S24 Ultra",
  "description": "512GB, Titanium Black...",
  "start_price": 1200000,
  "current_price": 1200000,
  "min_increment": 10000,
  "image_url": null,
  "ends_at": "2025-11-02T18:55:00Z",
  "status": "active",
  "created_at": "2025-11-02T17:55:00Z"
}
```

**Validation** (client-side):
- Title: Required, 3-100 characters
- Description: Required, 10-500 characters
- Start Price: Required, >= 0
- Min Increment: Optional, default 1000, >= 0

**Error Handling**:
- Validation error → Show inline error messages on form fields
- Network error → Show toast: "Failed to create auction. Please try again."

---

### Q6: Fetch User's Bids (My Bids Screen)

**Purpose**: Show auctions user has bid on with win/loss status

**User Story**: US6 - Track My Bids and Wins

**TypeScript** (MVP - shows all bids as "Anonymous"):
```typescript
// Since MVP has no auth, this shows ALL bids (not user-specific)
// Post-MVP: Add WHERE user_id = auth.uid() filter

const { data: myBids, error } = await supabase
  .from('bids')
  .select(`
    *,
    auction:auctions(*)
  `)
  .order('created_at', { ascending: false })

if (error) throw error
return myBids
```

**SQL Equivalent**:
```sql
SELECT bids.*, auctions.*
FROM bids
LEFT JOIN auctions ON bids.auction_id = auctions.id
ORDER BY bids.created_at DESC;
```

**Response Example**:
```json
[
  {
    "id": "b1c2d3e4-...",
    "auction_id": "a1b2c3d4-...",
    "bidder_name": "Anonymous",
    "amount": 850000,
    "created_at": "2025-11-02T17:45:00Z",
    "auction": {
      "id": "a1b2c3d4-...",
      "title": "iPhone 15 Pro 256GB",
      "current_price": 860000,
      "status": "active"
    }
  }
]
```

**Client-Side Logic**:
```typescript
const enrichedBids = myBids.map(bid => ({
  ...bid,
  isWinning: bid.auction.status === 'active' && bid.amount === bid.auction.current_price,
  hasWon: bid.auction.status === 'ended' && bid.amount === bid.auction.current_price,
  hasLost: bid.auction.status === 'ended' && bid.amount < bid.auction.current_price,
}))
```

**Error Handling**:
- Network error → Show error state with retry
- Empty result → Show "You haven't placed any bids yet"

---

### Q7: Search and Filter Auctions

**Purpose**: Client-side search and filter (no server query needed)

**User Story**: US5 - Search and Filter Auctions

**Implementation**: Use Q1 (Fetch Active Auctions) and filter in React state

**TypeScript**:
```typescript
// Fetch all active auctions once
const { data: allAuctions } = await supabase
  .from('auctions')
  .select('*')
  .eq('status', 'active')

// Filter client-side
const filteredAuctions = useMemo(() => {
  let filtered = allAuctions

  // Text search
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
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
}, [allAuctions, searchQuery, statusFilter, sortBy])
```

**No Server Query Needed**: Client-side filtering is sufficient for 100+ auctions.

---

## Realtime Subscriptions

### R1: Subscribe to Bid Updates

**Purpose**: Receive realtime notifications when new bids are placed

**User Story**: US2 - View Auction Details with Realtime Updates

**TypeScript**:
```typescript
useEffect(() => {
  const channel = supabase
    .channel(`auction:${auctionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `auction_id=eq.${auctionId}`,
      },
      (payload) => {
        // New bid received
        const newBid = payload.new as Bid

        // Update current price
        setCurrentPrice(newBid.amount)

        // Add to bid history
        setBids((prev) => [newBid, ...prev.slice(0, 4)]) // Keep latest 5

        // Show toast notification
        showToast({
          type: 'info',
          message: `New bid: ${formatPrice(newBid.amount)}원`,
        })
      }
    )
    .subscribe()

  // Cleanup on unmount
  return () => {
    channel.unsubscribe()
  }
}, [auctionId])
```

**WebSocket Connection**:
- Supabase automatically establishes WebSocket connection on first subscription
- Connection is reused for all channels (efficient)
- Auto-reconnects with exponential backoff if connection lost

**Payload Example** (INSERT event):
```json
{
  "schema": "public",
  "table": "bids",
  "commit_timestamp": "2025-11-02T17:50:00Z",
  "eventType": "INSERT",
  "new": {
    "id": "b3c4d5e6-...",
    "auction_id": "a1b2c3d4-...",
    "bidder_name": "Anonymous",
    "amount": 860000,
    "created_at": "2025-11-02T17:50:00Z"
  },
  "old": {},
  "errors": null
}
```

**Performance**:
- Latency: < 1 second from database INSERT to client callback
- Payload size: ~200 bytes (minimal)
- Connection overhead: Single WebSocket for all subscriptions

**Error Handling**:
- Connection loss → Auto-reconnect (Supabase handles)
- Subscription error → Log error, show offline indicator
- Missing payload data → Ignore malformed messages

---

### R2: Subscribe to Auction Status Changes

**Purpose**: Detect when auction transitions to 'ended' status

**User Story**: US2 - View Auction Details

**TypeScript**:
```typescript
useEffect(() => {
  const channel = supabase
    .channel(`auction-status:${auctionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'auctions',
        filter: `id=eq.${auctionId}`,
      },
      (payload) => {
        const updatedAuction = payload.new as Auction

        // Check if status changed to 'ended'
        if (updatedAuction.status === 'ended') {
          setAuctionStatus('ended')
          showToast({
            type: 'info',
            message: 'Auction has ended!',
          })
        }
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}, [auctionId])
```

**Use Case**: Auction auto-closes via pg_cron → UPDATE event sent → Client UI updates to show "Ended" state

---

## Error Codes & Messages

| Error Type | Supabase Error | User-Friendly Message |
|------------|----------------|----------------------|
| Bid too low | `new row violates check constraint` | "Bid too low - minimum is X원" |
| Auction ended | `Cannot bid on ended auction` | "Auction has ended" |
| Network error | `fetch failed` | "Failed to load. Please check your connection." |
| Validation error | `null value in column "title"` | "Title is required" |
| Not found | `No rows found` | "Auction not found" |

---

## Rate Limiting

Supabase Free Tier:
- **API Requests**: Unlimited
- **Realtime Connections**: 200 concurrent
- **Bandwidth**: 2GB/month (includes WebSocket traffic)

**Throttling**: Not needed for MVP (expect < 100 concurrent users)

**Future**: If needed, implement client-side debouncing for search input (already planned)

---

## Caching Strategy

**React Query** (recommended for future enhancement):
```typescript
const { data: auctions, isLoading, error } = useQuery({
  queryKey: ['auctions', 'active'],
  queryFn: () => fetchActiveAuctions(),
  staleTime: 30 * 1000, // 30 seconds
  refetchInterval: 60 * 1000, // Refetch every 60 seconds
})
```

**MVP**: Simple useState + useEffect (no caching library needed)

---

## Testing Scenarios

See [quickstart.md](../quickstart.md) for end-to-end testing steps.

**Critical Path**:
1. Fetch active auctions (Q1)
2. Open auction detail (Q2)
3. Fetch bid history (Q3)
4. Subscribe to realtime updates (R1)
5. Place bid on device A (Q4)
6. Verify realtime update on device B (< 1 second latency)
7. Create new auction (Q5)
8. Verify auto-close via pg_cron

---

## Next Steps

1. Implement custom hooks (`useAuctions`, `useAuctionDetail`, `usePlaceBid`)
2. Test all queries in Supabase SQL Editor
3. Test realtime subscriptions with two browser tabs
4. Proceed to quickstart.md for end-to-end validation
