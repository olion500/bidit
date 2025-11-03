// Task T021: Create auction constants

export type AuctionStatus = 'active' | 'ended';

export const AuctionStatus = {
  ACTIVE: 'active' as AuctionStatus,
  ENDED: 'ended' as AuctionStatus,
} as const;

export const DEFAULT_MIN_INCREMENT = 1000; // Korean Won

// Quick bid button amounts (Korean Won)
export const QUICK_BID_AMOUNTS = [1000, 5000, 10000] as const;

// Auction duration for new auctions (1 hour in milliseconds)
export const DEFAULT_AUCTION_DURATION_MS = 60 * 60 * 1000;

// Bid history limit for display
export const BID_HISTORY_LIMIT = 5;

// Status badge labels
export const STATUS_LABELS: Record<AuctionStatus, string> = {
  active: 'Active',
  ended: 'Ended',
};

// Auction ending soon threshold (30 minutes in milliseconds)
export const ENDING_SOON_THRESHOLD_MS = 30 * 60 * 1000;
