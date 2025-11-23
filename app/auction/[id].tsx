// Tasks T043-T071: Auction Detail Screen with Realtime Updates and Bidding
import { AuctionStatusCard } from '@/components/auction/AuctionStatusCard';
import { BiddingBottomSheet } from '@/components/auction/BiddingBottomSheet';
import { BidHistory } from '@/components/auction/BidHistory';
import { BidInput } from '@/components/auction/BidInput';
import { SellerInfo } from '@/components/auction/SellerInfo';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast, useToast } from '@/components/ui/Toast';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuctionDetail } from '@/hooks/useAuctionDetail';
import { usePlaceBid } from '@/hooks/usePlaceBid';
import type { Bid } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const IMG_HEIGHT = height * 0.45;

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { auction, bids, loading, error, refetch } = useAuctionDetail(id!);
  const { placeBid, loading: bidLoading } = usePlaceBid();
  const { toast, showToast, hideToast } = useToast();

  // T061: Optimistic UI state
  const [optimisticBid, setOptimisticBid] = useState<Bid | null>(null);
  const [optimisticPrice, setOptimisticPrice] = useState<number | null>(null);

  // Bottom Sheet State
  const [isBidSheetVisible, setIsBidSheetVisible] = useState(false);

  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = useThemeColor(
    { light: '#666666', dark: '#8E8E93' },
    'text'
  );
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#000000' },
    'background'
  );

  // T049: Show toast on new bid (listen for bids changes)
  const prevBidsLength = useRef(bids.length);
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
      bidder_name: 'You',
      amount,
      created_at: new Date().toISOString(),
    };

    setOptimisticBid(optimisticBidData);
    setOptimisticPrice(amount);

    try {
      await placeBid(auction.id, amount);
      // T062: Success toast
      showToast('Bid placed successfully!', 'success');
      setIsBidSheetVisible(false); // Close sheet on success
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
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedView style={styles.centerContainer}>
          <LoadingSpinner testID="auction-detail-loading" />
        </ThemedView>
      </>
    );
  }

  // T053: Error handling - auction not found
  if (error || !auction) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedView style={styles.centerContainer}>
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
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        testID="auction-detail-scroll"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          {auction.image_url ? (
            <Image
              source={{ uri: auction.image_url }}
              style={styles.image}
              resizeMode="cover"
              testID="auction-detail-image"
            />
          ) : (
            <View style={[styles.image, { backgroundColor: '#ccc' }]} />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.1)']}
            style={styles.imageGradient}
          />

          {/* Custom Header Buttons */}
          <View style={styles.headerButtons}>
            <Ionicons name="chevron-back" size={28} color="white" onPress={() => router.back()} />
            <Ionicons name="heart-outline" size={28} color="white" />
          </View>

          {/* Carousel Indicators (Visual Only) */}
          <View style={styles.indicators}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={[styles.content, { backgroundColor }]}>
          <View style={styles.titleHeader}>
            <Text style={[styles.title, { color: textColor }]}>{auction.title}</Text>
            <Ionicons name="share-social-outline" size={24} color={textColor} />
          </View>

          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            256GB • Blue • 2023
          </Text>

          <Text style={[styles.description, { color: secondaryTextColor }]}>
            {auction.description}
          </Text>

          <SellerInfo name="Harish Kumar" />

          <AuctionStatusCard
            startPrice={auction.start_price}
            currentPrice={displayPrice}
            biddersCount={displayBids.length}
            endsAt={auction.ends_at}
          />

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

          <BidHistory bids={displayBids} testID="auction-detail-bid-history" />

          {/* Spacer for bottom bar */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Bottom Bid Button */}
      {!isEnded && (
        <View style={[styles.bottomBar, { backgroundColor }]}>
          <BidInput
            currentPrice={displayPrice}
            minIncrement={auction.min_increment}
            onSubmit={async () => setIsBidSheetVisible(true)} // Open sheet instead of submitting
            disabled={isEnded}
            loading={bidLoading}
            testID="auction-detail-bid-input"
          />
        </View>
      )}

      {/* Bidding Bottom Sheet */}
      <BiddingBottomSheet
        visible={isBidSheetVisible}
        onClose={() => setIsBidSheetVisible(false)}
        currentPrice={displayPrice}
        startPrice={auction.start_price}
        minIncrement={auction.min_increment}
        endsAt={auction.ends_at}
        onSubmit={handlePlaceBid}
        loading={bidLoading}
        testID="auction-detail-bid-sheet"
      />

      {/* T049: Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={hideToast}
        testID="auction-detail-toast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  imageContainer: {
    height: IMG_HEIGHT,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  indicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    backgroundColor: 'white',
    width: 24,
  },
  content: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  winnerBanner: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
