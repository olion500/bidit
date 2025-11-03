// Task T029: Create hooks/useAuctions.ts custom hook
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Auction } from '@/lib/types';

interface UseAuctionsReturn {
  auctions: Auction[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAuctions(): UseAuctionsReturn {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('auctions')
        .select('*')
        .eq('status', 'active')
        .order('ends_at', { ascending: true }); // Ending soon first

      if (fetchError) {
        throw fetchError;
      }

      setAuctions(data || []);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  return {
    auctions,
    loading,
    error,
    refetch: fetchAuctions,
  };
}
