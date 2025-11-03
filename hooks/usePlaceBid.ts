// Task T057: Create hooks/usePlaceBid.ts custom hook
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Bid } from '@/lib/types';

interface UsePlaceBidReturn {
  placeBid: (auctionId: string, amount: number) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function usePlaceBid(): UsePlaceBidReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const placeBid = useCallback(async (auctionId: string, amount: number) => {
    try {
      setLoading(true);
      setError(null);

      // Insert bid into Supabase
      const { data, error: bidError } = await supabase
        .from('bids')
        .insert({
          auction_id: auctionId,
          bidder_name: 'Anonymous',
          amount,
        })
        .select()
        .single();

      if (bidError) {
        // T063, T064, T065: Parse error messages for user-friendly display
        const errorMessage = bidError.message;

        if (errorMessage.includes('Bid too low')) {
          // Extract minimum amount from error if available
          const match = errorMessage.match(/minimum is (\d+)/);
          const minAmount = match ? match[1] : 'unknown';
          throw new Error(`Bid too low - minimum is ${minAmount}원`);
        } else if (errorMessage.includes('ended auction')) {
          throw new Error('Auction has ended');
        } else {
          throw new Error('Failed to place bid. Please try again.');
        }
      }

      // Success - bid was placed
      console.log('Bid placed successfully:', data);
    } catch (err) {
      console.error('Error placing bid:', err);
      setError(err as Error);
      throw err; // Re-throw so component can handle it
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    placeBid,
    loading,
    error,
  };
}
