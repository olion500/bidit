// Tasks T031-T039: Auction Feed Screen
import { AuctionCard } from '@/components/auction/AuctionCard';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuctions } from '@/hooks/useAuctions';
import type { Auction } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function AuctionFeedScreen() {
  const router = useRouter();
  const { auctions, loading, error, refetch } = useAuctions();
  const [refreshing, setRefreshing] = React.useState(false);

  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#000000' },
    'background'
  );
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

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

  const ListHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerTitle, { color: textColor }]}>Discover</Text>
        <Text style={styles.headerSubtitle}>Live Auctions</Text>
      </View>
      <View style={styles.iconButton}>
        <Ionicons name="search" size={24} color={textColor} />
      </View>
    </View>
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

  // T032, T033, T037, T039: FlatList with pull-to-refresh and navigation
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={auctions}
        renderItem={renderAuctionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            testID="auction-feed-refresh"
          />
        }
        testID="auction-feed-list"
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="🔨"
              title="No active auctions"
              description="Check back later or create your own auction"
              testID="auction-feed-empty"
            />
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 60, // Space for status bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});
