-- Insert test auction data
-- Task T016: Insert test data (5 sample auctions)

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
  )
ON CONFLICT DO NOTHING;

-- Insert test bids
INSERT INTO bids (auction_id, bidder_name, amount)
SELECT
  id,
  'Anonymous',
  current_price
FROM auctions
WHERE current_price > start_price
ON CONFLICT DO NOTHING;
