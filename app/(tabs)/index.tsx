// Tasks T031-T039: Auction Feed Screen
import React from 'react';
import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuctions } from '@/hooks/useAuctions';
import { AuctionCard } from '@/components/auction/AuctionCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { Auction } from '@/lib/types';

export default function AuctionFeedScreen() {
  const router = useRouter();
  const { auctions, loading, error, refetch } = useAuctions();
  const [refreshing, setRefreshing] = React.useState(false);

  const backgroundColor = useThemeColor(
    { light: '#F2F2F7', dark: '#000000' },
    'background'
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAuctionPress = (auctionId: string) => {
    router.push(`/auction/${auctionId}`);
  };

  const renderAuctionCard = ({ item }: { item: Auction }) => (
    <AuctionCard
      auction={item}
      onPress={() => handleAuctionPress(item.id)}
      testID={`auction-card-${item.id}`}
    />
  );

  // T034: Loading state
  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <LoadingSpinner testID="auction-feed-loading" />
      </ThemedView>
    );
  }

  // T036: Error state with retry button
  if (error && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <EmptyState
            icon="⚠️"
            title="Failed to load"
            description="Could not fetch auctions. Please check your connection and try again."
            testID="auction-feed-error"
          />
          <Button
            onPress={() => refetch()}
            variant="primary"
            testID="auction-feed-retry"
          >
            Retry
          </Button>
        </View>
      </ThemedView>
    );
  }

  // T035: Empty state
  if (!loading && auctions.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          icon="🔨"
          title="No active auctions"
          description="Check back later or create your own auction"
          testID="auction-feed-empty"
        />
      </ThemedView>
    );
  }

  // T032, T033, T037, T039: FlatList with pull-to-refresh and navigation
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={auctions}
        renderItem={renderAuctionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            testID="auction-feed-refresh"
          />
        }
        testID="auction-feed-list"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});
