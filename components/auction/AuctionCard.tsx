// Task T030: Create components/auction/AuctionCard.tsx
import { ENDING_SOON_THRESHOLD_MS } from '@/constants/Auction';
import type { Auction } from '@/lib/types';
import { formatPrice, getRemainingMs } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CountdownTimer } from './CountdownTimer';

interface AuctionCardProps {
  auction: Auction;
  onPress: () => void;
  testID?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const IMAGE_HEIGHT = CARD_WIDTH * 1.1; // 4:5 aspect ratio roughly, or just tall

export function AuctionCard({ auction, onPress, testID }: AuctionCardProps) {
  const isActive = auction.status === 'active';
  const remainingMs = getRemainingMs(auction.ends_at);
  const isEndingSoon = isActive && remainingMs <= ENDING_SOON_THRESHOLD_MS && remainingMs > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      testID={testID}
    >
      <View style={styles.imageContainer}>
        {auction.image_url ? (
          <Image
            source={{ uri: auction.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, { backgroundColor: '#F2F2F7' }]} />
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />

        {/* Live Badge */}
        {isActive && (
          <View style={[styles.badge, isEndingSoon && styles.badgeUrgent]}>
            <View style={[styles.dot, isEndingSoon && styles.dotUrgent]} />
            <Text style={styles.badgeText}>
              {isEndingSoon ? 'Ending Soon' : 'Live'}
            </Text>
          </View>
        )}

        {/* Heart Icon */}
        <View style={styles.heartButton}>
          <Ionicons name="heart-outline" size={24} color="white" />
        </View>

        {/* Content Overlay */}
        <View style={styles.overlayContent}>
          <Text style={styles.title} numberOfLines={2}>
            {auction.title}
          </Text>

          <View style={styles.detailsRow}>
            <View>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.price}>
                {formatPrice(auction.current_price)}
              </Text>
            </View>

            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={16} color="white" style={{ marginRight: 4 }} />
              <CountdownTimer
                endsAt={auction.ends_at}
                style={styles.timer}
                testID={`${testID}-countdown`}
              />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backdropFilter: 'blur(10px)', // Note: backdropFilter is web-only usually, but good for intent
  },
  badgeUrgent: {
    backgroundColor: '#FF3B30',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  dotUrgent: {
    backgroundColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  price: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timer: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
