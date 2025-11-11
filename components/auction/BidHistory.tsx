// Task T042: Create components/auction/BidHistory.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card } from '@/components/ui/Card';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Bid } from '@/lib/types';

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
  const priceColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'border');

  if (bids.length === 0) {
    return (
      <Card style={styles.container} testID={testID}>
        <Text style={[styles.title, { color: textColor }]}>Bid History</Text>
        <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
          No bids yet. Be the first to bid!
        </Text>
      </Card>
    );
  }

  const renderBidItem = ({ item, index }: { item: Bid; index: number }) => (
    <View
      style={[
        styles.bidItem,
        index !== bids.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
      ]}
      testID={`${testID}-bid-${item.id}`}
    >
      <View style={styles.bidHeader}>
        <Text style={[styles.bidderName, { color: textColor }]}>{item.bidder_name}</Text>
        <Text style={[styles.bidAmount, { color: priceColor }]}>
          {formatPrice(item.amount)}
        </Text>
      </View>
      <Text style={[styles.bidTime, { color: secondaryTextColor }]}>
        {formatRelativeTime(item.created_at)}
      </Text>
    </View>
  );

  return (
    <Card style={styles.container} testID={testID}>
      <Text style={[styles.title, { color: textColor }]}>
        Bid History ({bids.length})
      </Text>
      <FlatList
        data={bids}
        renderItem={renderBidItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={styles.list}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  list: {
    marginTop: 8,
  },
  bidItem: {
    paddingVertical: 12,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bidderName: {
    fontSize: 16,
    fontWeight: '500',
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  bidTime: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
