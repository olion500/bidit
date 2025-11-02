# Data Model: Mobile Auction Platform

**Feature**: Mobile Auction Platform (Bidit)
**Database**: Supabase PostgreSQL
**Date**: 2025-11-02

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│      auctions       │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ description         │
│ start_price         │
│ current_price       │
│ min_increment       │
│ image_url           │
│ ends_at             │
│ status              │
│ created_at          │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│        bids         │
├─────────────────────┤
│ id (PK)             │
│ auction_id (FK)     │
│ bidder_name         │
│ amount              │
│ created_at          │
└─────────────────────┘
```

**Relationships**:
- One auction has many bids (1:N)
- One bid belongs to one auction (N:1)

---

## Tables

### `auctions`

Stores auction listings with current price and status tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique auction identifier |
| `title` | text | NOT NULL | Auction title (e.g., "iPhone 15 Pro") |
| `description` | text | NOT NULL | Detailed description of item |
| `start_price` | numeric | NOT NULL, CHECK (start_price >= 0) | Initial starting price in Korean Won |
| `current_price` | numeric | NOT NULL, CHECK (current_price >= start_price) | Current highest bid (or start_price if no bids) |
| `min_increment` | numeric | NOT NULL, DEFAULT 1000, CHECK (min_increment > 0) | Minimum bid increment in Korean Won |
| `image_url` | text | NULLABLE | URL to auction image (placeholder if null) |
| `ends_at` | timestamptz | NOT NULL, CHECK (ends_at > created_at) | When auction closes (server timestamp) |
| `status` | text | NOT NULL, DEFAULT 'active', CHECK (status IN ('active', 'ended')) | Auction state |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | When auction was created |

**Indexes**:
```sql
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_ends_at ON auctions(ends_at) WHERE status = 'active';
```

**SQL Schema**:
```sql
CREATE TABLE auctions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_price numeric NOT NULL CHECK (start_price >= 0),
  current_price numeric NOT NULL CHECK (current_price >= start_price),
  min_increment numeric NOT NULL DEFAULT 1000 CHECK (min_increment > 0),
  image_url text,
  ends_at timestamptz NOT NULL CHECK (ends_at > created_at),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_ends_at ON auctions(ends_at) WHERE status = 'active';
```

**Business Rules**:
1. `current_price` must always be >= `start_price`
2. `current_price` updates when new bid is placed (via trigger)
3. `status` changes from 'active' to 'ended' when `ends_at` is reached (via pg_cron function)
4. Cannot place bids on auctions where `status = 'ended'`
5. Default `min_increment` is 1,000 Korean Won (customizable per auction)

---

### `bids`

Stores bid history with timestamps for realtime updates and audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique bid identifier |
| `auction_id` | uuid | NOT NULL, FOREIGN KEY → auctions(id) ON DELETE CASCADE | Which auction this bid is for |
| `bidder_name` | text | NOT NULL, DEFAULT 'Anonymous' | Bidder display name (MVP: all "Anonymous") |
| `amount` | numeric | NOT NULL, CHECK (amount > 0) | Bid amount in Korean Won |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | When bid was placed (server timestamp) |

**Indexes**:
```sql
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_created_at ON bids(created_at DESC);
CREATE INDEX idx_bids_auction_created ON bids(auction_id, created_at DESC);
```

**SQL Schema**:
```sql
CREATE TABLE bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_name text NOT NULL DEFAULT 'Anonymous',
  amount numeric NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_created_at ON bids(created_at DESC);
CREATE INDEX idx_bids_auction_created ON bids(auction_id, created_at DESC);
```

**Business Rules**:
1. Bid `amount` must be >= auction `current_price` + `min_increment` (enforced by trigger)
2. Cannot bid on ended auctions (enforced by trigger)
3. Bids are immutable (no updates/deletes allowed after creation)
4. All bids stored permanently for audit trail
5. `created_at` uses server time to prevent client clock manipulation

---

## Database Functions

### `close_expired_auctions()`

Automatically closes auctions when `ends_at` timestamp is reached.

```sql
CREATE OR REPLACE FUNCTION close_expired_auctions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE auctions
  SET status = 'ended'
  WHERE ends_at < now()
    AND status = 'active';
END;
$$;
```

**Scheduling** (via pg_cron):
```sql
-- Run every minute
SELECT cron.schedule(
  'close-expired-auctions',
  '* * * * *',
  $$ SELECT close_expired_auctions() $$
);
```

**Purpose**: Ensures auctions automatically transition to 'ended' status when time expires, without requiring client or server application to be running.

---

### `validate_bid()` (Trigger Function)

Validates bid meets minimum requirements before allowing insertion.

```sql
CREATE OR REPLACE FUNCTION validate_bid()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_auction auctions%ROWTYPE;
BEGIN
  -- Fetch auction details
  SELECT * INTO v_auction
  FROM auctions
  WHERE id = NEW.auction_id;

  -- Check auction exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auction not found';
  END IF;

  -- Check auction is still active
  IF v_auction.status != 'active' THEN
    RAISE EXCEPTION 'Cannot bid on ended auction';
  END IF;

  -- Check bid meets minimum
  IF NEW.amount < (v_auction.current_price + v_auction.min_increment) THEN
    RAISE EXCEPTION 'Bid too low - minimum is %', (v_auction.current_price + v_auction.min_increment);
  END IF;

  -- Update auction current_price
  UPDATE auctions
  SET current_price = NEW.amount
  WHERE id = NEW.auction_id;

  RETURN NEW;
END;
$$;

-- Attach trigger to bids table
CREATE TRIGGER trigger_validate_bid
  BEFORE INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION validate_bid();
```

**Purpose**: Enforces business rules at database level to prevent invalid bids, even if client validation is bypassed.

---

## Database Initialization

### Test Data

Insert sample auctions for development and testing:

```sql
-- Insert test auctions
INSERT INTO auctions (title, description, start_price, current_price, min_increment, ends_at, image_url)
VALUES
  (
    'iPhone 15 Pro 256GB',
    'Brand new, sealed box. Space Black color. 1-year Apple warranty.',
    800000,
    850000,
    10000,
    now() + interval '1 hour',
    'https://example.com/iphone15.jpg'
  ),
  (
    'Vintage Rolex Submariner',
    'Rare 1960s Rolex Submariner. Original papers and box. Serviced in 2024.',
    5000000,
    5000000,
    50000,
    now() + interval '30 minutes',
    'https://example.com/rolex.jpg'
  ),
  (
    'MacBook Pro 16" M3 Max',
    '2024 model. 64GB RAM, 2TB SSD. AppleCare+ until 2027. Like new condition.',
    3000000,
    3200000,
    20000,
    now() + interval '2 hours',
    'https://example.com/macbook.jpg'
  ),
  (
    'Sony A7 IV Camera',
    'Full-frame mirrorless camera. 6 months old. Includes 24-70mm lens.',
    1500000,
    1500000,
    10000,
    now() + interval '45 minutes',
    'https://example.com/sony.jpg'
  ),
  (
    'Herman Miller Aeron Chair',
    'Size B, fully adjustable. Purchased 2023. Excellent condition.',
    400000,
    420000,
    5000,
    now() + interval '3 hours',
    'https://example.com/chair.jpg'
  );

-- Insert test bids
INSERT INTO bids (auction_id, bidder_name, amount)
SELECT
  id,
  'Anonymous',
  current_price
FROM auctions
WHERE current_price > start_price;
```

### RLS (Row Level Security) Setup

**MVP**: RLS disabled (anonymous access)
```sql
-- Disable RLS for MVP
ALTER TABLE auctions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;
```

**Post-MVP (Phase 8 with Authentication)**:
```sql
-- Enable RLS
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can view auctions and bids
CREATE POLICY "Public can view auctions"
  ON auctions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view bids"
  ON bids FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can create auctions
CREATE POLICY "Authenticated users can create auctions"
  ON auctions FOR INSERT
  TO authenticated
  USING (seller_id = auth.uid());

-- Only authenticated users can place bids
CREATE POLICY "Authenticated users can place bids"
  ON bids FOR INSERT
  TO authenticated
  USING (user_id = auth.uid());
```

---

## TypeScript Types

```typescript
// Generated from Supabase schema
export interface Auction {
  id: string
  title: string
  description: string
  start_price: number
  current_price: number
  min_increment: number
  image_url: string | null
  ends_at: string // ISO timestamp
  status: 'active' | 'ended'
  created_at: string // ISO timestamp
}

export interface Bid {
  id: string
  auction_id: string
  bidder_name: string
  amount: number
  created_at: string // ISO timestamp
}

// Type-safe database client
export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
)

// Example queries
const { data: auctions } = await supabase
  .from('auctions')
  .select('*')
  .eq('status', 'active')
  .order('ends_at', { ascending: true })

const { data: bids } = await supabase
  .from('bids')
  .select('*')
  .eq('auction_id', auctionId)
  .order('created_at', { ascending: false })
  .limit(5)
```

---

## Migration Strategy

### Phase 1: MVP (Current)
- 2 tables: `auctions`, `bids`
- No authentication (anonymous bidding)
- RLS disabled
- Basic triggers for validation

### Phase 2: Authentication (Post-MVP)
- Add `users` table (Supabase Auth handles this)
- Add `seller_id` column to `auctions`
- Add `user_id` column to `bids`
- Enable RLS
- Create policies for access control

### Phase 3: Enhanced Features (Future)
- Add `categories` table for auction categorization
- Add `favorites` table for user watchlists
- Add `notifications` table for bid alerts
- Add `reports` table for user-reported content

---

## Performance Considerations

1. **Indexes**: Created on frequently queried columns (status, auction_id, created_at)
2. **Partitioning**: Not needed for MVP (expect < 10k auctions, < 100k bids)
3. **Archival**: Consider moving ended auctions to separate table after 30 days (future optimization)
4. **Query Optimization**: Use `select('*')` only when all fields needed, otherwise specify columns
5. **Connection Pooling**: Supabase handles this automatically (Supavisor)

---

## Backup & Recovery

- **Automatic Backups**: Supabase provides daily backups (retained for 7 days on free tier)
- **Point-in-Time Recovery**: Available on paid tiers (not needed for MVP)
- **Export**: Use `pg_dump` via Supabase CLI if manual backup needed

---

## Next Steps

1. Create Supabase project
2. Run SQL schema in Supabase SQL Editor
3. Insert test data
4. Configure pg_cron for auto-close function
5. Verify database setup with manual queries
6. Proceed to contracts (API specifications)
