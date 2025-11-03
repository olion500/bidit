-- Create auctions table
-- Task T007: Create auctions table in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS auctions (
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

-- Task T009: Create indexes for auctions table
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_ends_at ON auctions(ends_at) WHERE status = 'active';
