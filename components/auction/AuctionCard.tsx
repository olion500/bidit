// Task T030: Create components/auction/AuctionCard.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Card } from '@/components/ui/Card';
import { CountdownTimer } from './CountdownTimer';
import { formatPrice, getRemainingMs } from '@/lib/utils';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { Auction } from '@/lib/types';
import { ENDING_SOON_THRESHOLD_MS, STATUS_LABELS } from '@/constants/Auction';

interface AuctionCardProps {
  auction: Auction;
  onPress: () => void;
  testID?: string;
}

export function AuctionCard({ auction, onPress, testID }: AuctionCardProps) {
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = useThemeColor(
    { light: '#8E8E93', dark: '#636366' },
    'text'
  );
  const priceColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  const isActive = auction.status === 'active';
  const remainingMs = getRemainingMs(auction.ends_at);
  const isEndingSoon = isActive && remainingMs <= ENDING_SOON_THRESHOLD_MS && remainingMs > 0;

  const statusBadgeColor = auction.status === 'ended' ? '#8E8E93' : isEndingSoon ? '#FF9500' : '#34C759';
  const statusLabel = auction.status === 'ended'
    ? STATUS_LABELS.ended
    : isEndingSoon
      ? 'Ending Soon'
      : STATUS_LABELS.active;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
      testID={testID}
    >
      <Card style={styles.card}>
        {auction.image_url && (
          <Image
            source={{ uri: auction.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
              {auction.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusBadgeColor }]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.priceContainer}>
              <Text style={[styles.priceLabel, { color: secondaryTextColor }]}>
                Current Price
              </Text>
              <Text style={[styles.price, { color: priceColor }]}>
                {formatPrice(auction.current_price)}
              </Text>
            </View>

            <View style={styles.timerContainer}>
              <Text style={[styles.timerLabel, { color: secondaryTextColor }]}>
                {auction.status === 'ended' ? 'Ended' : 'Ends in'}
              </Text>
              <CountdownTimer
                endsAt={auction.ends_at}
                style={styles.countdown}
                testID={`${testID}-countdown`}
              />
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  countdown: {
    fontSize: 16,
  },
});
