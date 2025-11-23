// Task T058: Create components/auction/BidInput.tsx
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPrice } from '@/lib/utils';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface BidInputProps {
  currentPrice: number;
  minIncrement: number;
  onSubmit: (amount: number) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

export function BidInput({
  currentPrice,
  minIncrement,
  onSubmit,
  disabled = false,
  loading = false,
  testID,
}: BidInputProps) {
  // For this design iteration, we'll simplify to just a "Place your bid" button
  // In a real app, this would open a modal or bottom sheet.
  // Here we'll just simulate placing the minimum bid for demonstration
  // or we could keep the quick bid logic but hidden until pressed.

  // Let's implement a simple "Quick Bid" of min increment for the button action
  // to keep it functional without a full modal implementation in this step.

  const minimumBid = currentPrice + minIncrement;
  const tintColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  const handlePress = () => {
    // For demo purposes, just submit the minimum bid
    onSubmit(minimumBid);
  };

  return (
    <View style={styles.container} testID={testID}>
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: '#2f54eb' }, // Using a specific blue from the screenshot
          (disabled || loading) && styles.disabledButton,
          pressed && styles.fabPressed,
        ]}
        onPress={handlePress}
        disabled={disabled || loading}
        testID={`${testID}-submit`}
      >
        {loading ? (
          <Text style={styles.fabText}>Placing Bid...</Text>
        ) : (
          <Text style={styles.fabText}>Place your bid</Text>
        )}
      </Pressable>
      <Text style={styles.subtext}>
        Min bid: {formatPrice(minimumBid)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  fab: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  fabText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  subtext: {
    fontSize: 12,
    color: '#8E8E93',
  }
});
