// Task T042: Create components/auction/BidHistory.tsx
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Bid } from '@/lib/types';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

interface BidHistoryProps {
  bids: Bid[];
  testID?: string;
}

export function BidHistory({ bids, testID }: BidHistoryProps) {
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = useThemeColor(
    { light: '#8E8E93', dark: '#636366' },
    'text'
  );
  const backgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#000000' }, 'background');
  const cardColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'background');

  const renderBidItem = ({ item, index }: { item: Bid; index: number }) => (
    <View
      style={[styles.bidItem, { backgroundColor: cardColor }]}
      testID={`${testID}-bid-${item.id}`}
    >
      <Image
        source={{ uri: `https://i.pravatar.cc/150?u=${item.bidder_name}` }}
        style={styles.avatar}
      />

      <View style={styles.bidInfo}>
        <Text style={[styles.bidderName, { color: textColor }]}>{item.bidder_name}</Text>
        <Text style={[styles.bidTime, { color: secondaryTextColor }]}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>

      <Text style={[styles.bidAmount, { color: textColor }]}>
        {formatPrice(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]} testID={testID}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Bidders</Text>
        <View style={styles.filterContainer}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Recent</Text>
            <Ionicons name="chevron-down" size={12} color="#666" />
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Sort</Text>
            <Ionicons name="chevron-down" size={12} color="#666" />
          </View>
        </View>
      </View>

      {bids.length === 0 ? (
        <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
          No bids yet. Be the first to bid!
        </Text>
      ) : (
        <FlatList
          data={bids}
          renderItem={renderBidItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          style={styles.list}
          contentContainerStyle={{ gap: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 24,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  list: {
    marginTop: 0,
  },
  bidItem: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E5E5EA',
  },
  bidInfo: {
    flex: 1,
  },
  bidderName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  bidTime: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
