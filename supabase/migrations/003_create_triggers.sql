-- Create database functions and triggers
-- Task T011: Create validate_bid() trigger function
-- Task T012: Attach trigger_validate_bid to bids table

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
DROP TRIGGER IF EXISTS trigger_validate_bid ON bids;
CREATE TRIGGER trigger_validate_bid
  BEFORE INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION validate_bid();
