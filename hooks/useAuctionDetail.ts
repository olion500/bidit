// Task T040: Create hooks/useAuctionDetail.ts with realtime subscriptions
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Auction, Bid } from '@/lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseAuctionDetailReturn {
  auction: Auction | null;
  bids: Bid[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAuctionDetail(auctionId: string): UseAuctionDetailReturn {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuctionDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch auction details
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      if (auctionError) {
        throw auctionError;
      }

      // Fetch bid history (latest 5 bids)
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (bidsError) {
        throw bidsError;
      }

      setAuction(auctionData);
      setBids(bidsData || []);
    } catch (err) {
      console.error('Error fetching auction detail:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    fetchAuctionDetail();

    // T047: Subscribe to realtime bid updates
    const channel: RealtimeChannel = supabase
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
          const newBid = payload.new as Bid;

          // T048: Update UI with new bid
          setBids((prevBids) => [newBid, ...prevBids.slice(0, 4)]);

          // Update auction current_price
          setAuction((prevAuction) => {
            if (!prevAuction) return null;
            return {
              ...prevAuction,
              current_price: newBid.amount,
            };
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
          filter: `id=eq.${auctionId}`,
        },
        (payload) => {
          const updatedAuction = payload.new as Auction;
          setAuction(updatedAuction);
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [auctionId, fetchAuctionDetail]);

  return {
    auction,
    bids,
    loading,
    error,
    refetch: fetchAuctionDetail,
  };
}
