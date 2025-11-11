// Tasks T043-T071: Auction Detail Screen with Realtime Updates and Bidding
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuctionDetail } from '@/hooks/useAuctionDetail';
import { usePlaceBid } from '@/hooks/usePlaceBid';
import { CountdownTimer } from '@/components/auction/CountdownTimer';
import { BidHistory } from '@/components/auction/BidHistory';
import { BidInput } from '@/components/auction/BidInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPrice } from '@/lib/utils';
import type { Bid } from '@/lib/types';

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { auction, bids, loading, error, refetch } = useAuctionDetail(id!);
  const { placeBid, loading: bidLoading } = usePlaceBid();
  const { toast, showToast, hideToast } = useToast();

  // T061: Optimistic UI state
  const [optimisticBid, setOptimisticBid] = useState<Bid | null>(null);
  const [optimisticPrice, setOptimisticPrice] = useState<number | null>(null);

  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = useThemeColor(
    { light: '#8E8E93', dark: '#636366' },
    'text'
  );
  const priceColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');
  const backgroundColor = useThemeColor(
    { light: '#F2F2F7', dark: '#000000' },
    'background'
  );

  // T049: Show toast on new bid (listen for bids changes)
  const prevBidsLength = React.useRef(bids.length);
  useEffect(() => {
    if (bids.length > prevBidsLength.current && prevBidsLength.current > 0) {
      showToast('New bid placed!', 'info');
      // T066: Clear optimistic state when real bid arrives
      setOptimisticBid(null);
      setOptimisticPrice(null);
    }
    prevBidsLength.current = bids.length;
  }, [bids.length, showToast]);

  // T060, T061, T062, T063, T064, T065, T066: Handle bid submission
  const handlePlaceBid = async (amount: number) => {
    if (!auction) return;

    // T061: Optimistic UI update
    const optimisticBidData: Bid = {
      id: 'optimistic-' + Date.now(),
      auction_id: auction.id,
      bidder_name: 'Anonymous',
      amount,
      created_at: new Date().toISOString(),
    };

    setOptimisticBid(optimisticBidData);
    setOptimisticPrice(amount);

    try {
      await placeBid(auction.id, amount);
      // T062: Success toast
      showToast('Bid placed successfully!', 'success');
    } catch (err) {
      // T066: Rollback optimistic update on error
      setOptimisticBid(null);
      setOptimisticPrice(null);

      // T063, T064, T065: Show appropriate error message
      const error = err as Error;
      showToast(error.message, 'error');
    }
  };

  // T052: Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ThemedView style={styles.container}>
          <LoadingSpinner testID="auction-detail-loading" />
        </ThemedView>
      </>
    );
  }

  // T053: Error handling - auction not found
  if (error || !auction) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <ThemedView style={styles.container}>
          <View style={styles.errorContainer}>
            <EmptyState
              icon="❌"
              title="Auction not found"
              description="This auction may have been removed or does not exist."
              testID="auction-detail-error"
            />
            <Button
              onPress={() => router.back()}
              variant="primary"
              testID="auction-detail-back"
            >
              Go Back
            </Button>
          </View>
        </ThemedView>
      </>
    );
  }

  const isEnded = auction.status === 'ended';

  // T061: Display optimistic bid if present, otherwise show actual bids
  const displayBids = optimisticBid ? [optimisticBid, ...bids] : bids;
  const displayPrice = optimisticPrice ?? auction.current_price;
  const highestBid = displayBids.length > 0 ? displayBids[0] : null;

  return (
    <>
      <Stack.Screen
        options={{
          title: auction.title,
          headerBackTitle: 'Auctions',
        }}
      />
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          testID="auction-detail-scroll"
        >
          {/* T045: Display auction details */}
          {auction.image_url && (
            <Image
              source={{ uri: auction.image_url }}
              style={styles.image}
              resizeMode="cover"
              testID="auction-detail-image"
            />
          )}

          <View style={styles.content}>
            <View style={styles.header}>
              <Text
                style={[styles.title, { color: textColor }]}
                testID="auction-detail-title"
              >
                {auction.title}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isEnded ? '#8E8E93' : '#34C759',
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {isEnded ? 'Ended' : 'Active'}
                </Text>
              </View>
            </View>

            <Text
              style={[styles.description, { color: secondaryTextColor }]}
              testID="auction-detail-description"
            >
              {auction.description}
            </Text>

            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>
                  Current Price
                </Text>
                <Text
                  style={[styles.price, { color: priceColor }]}
                  testID="auction-detail-price"
                >
                  {formatPrice(displayPrice)}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>
                  {isEnded ? 'Ended' : 'Ends in'}
                </Text>
                <CountdownTimer
                  endsAt={auction.ends_at}
                  style={styles.countdown}
                  testID="auction-detail-countdown"
                />
              </View>

              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>
                  Minimum Increment
                </Text>
                <Text style={[styles.incrementText, { color: textColor }]}>
                  {formatPrice(auction.min_increment)}
                </Text>
              </View>
            </View>

            {/* T051: Display winner information when ended */}
            {isEnded && highestBid && (
              <View
                style={[styles.winnerBanner, { backgroundColor: '#34C75920' }]}
                testID="auction-detail-winner"
              >
                <Text style={[styles.winnerText, { color: '#34C759' }]}>
                  🏆 Winner: {highestBid.bidder_name} - {formatPrice(highestBid.amount)}
                </Text>
              </View>
            )}

            {/* T046: Display BidHistory component with optimistic bid */}
            <BidHistory bids={displayBids} testID="auction-detail-bid-history" />

            {/* T059, T067, T068: BidInput component */}
            {!isEnded && (
              <BidInput
                currentPrice={displayPrice}
                minIncrement={auction.min_increment}
                onSubmit={handlePlaceBid}
                disabled={isEnded}
                loading={bidLoading}
                testID="auction-detail-bid-input"
              />
            )}
          </View>
        </ScrollView>

        {/* T049: Toast notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onDismiss={hideToast}
          testID="auction-detail-toast"
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  priceSection: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
  },
  countdown: {
    fontSize: 20,
    fontWeight: '600',
  },
  incrementText: {
    fontSize: 16,
    fontWeight: '500',
  },
  winnerBanner: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
