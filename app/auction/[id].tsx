// Tasks T043-T056: Auction Detail Screen with Realtime Updates
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuctionDetail } from '@/hooks/useAuctionDetail';
import { CountdownTimer } from '@/components/auction/CountdownTimer';
import { BidHistory } from '@/components/auction/BidHistory';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/Toast';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/useThemeColor';
import { formatPrice } from '@/lib/utils';

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { auction, bids, loading, error, refetch } = useAuctionDetail(id!);
  const { toast, showToast, hideToast } = useToast();

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
    }
    prevBidsLength.current = bids.length;
  }, [bids.length, showToast]);

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
  const highestBid = bids.length > 0 ? bids[0] : null;

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
                  {formatPrice(auction.current_price)}
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

            {/* T046: Display BidHistory component */}
            <BidHistory bids={bids} testID="auction-detail-bid-history" />

            {/* T050: Note about bidding (actual bid input in Phase 5) */}
            {!isEnded && (
              <View style={styles.bidPlaceholder}>
                <Text style={[styles.placeholderText, { color: secondaryTextColor }]}>
                  Bidding will be available in the next phase
                </Text>
              </View>
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
  bidPlaceholder: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    marginTop: 16,
  },
  placeholderText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
