// Task T022: Create TypeScript types matching database schema

export interface Auction {
  id: string;
  title: string;
  description: string;
  start_price: number;
  current_price: number;
  min_increment: number;
  image_url: string | null;
  ends_at: string; // ISO timestamp
  status: 'active' | 'ended';
  created_at: string; // ISO timestamp
}

export interface Bid {
  id: string;
  auction_id: string;
  bidder_name: string;
  amount: number;
  created_at: string; // ISO timestamp
}

// Type-safe database schema for Supabase client
export interface Database {
  public: {
    Tables: {
      auctions: {
        Row: Auction;
        Insert: Omit<Auction, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Auction, 'id' | 'created_at'>>;
      };
      bids: {
        Row: Bid;
        Insert: Omit<Bid, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Bid, 'id' | 'created_at'>>;
      };
    };
  };
}
