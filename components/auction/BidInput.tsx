// Task T058: Create components/auction/BidInput.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { QUICK_BID_AMOUNTS } from '@/constants/Auction';
import { formatPrice } from '@/lib/utils';

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
  const minimumBid = currentPrice + minIncrement;
  const [bidAmount, setBidAmount] = useState(minimumBid.toString());
  const [error, setError] = useState<string>('');

  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const secondaryTextColor = useThemeColor(
    { light: '#8E8E93', dark: '#636366' },
    'text'
  );
  const buttonBgColor = useThemeColor(
    { light: '#F2F2F7', dark: '#2C2C2E' },
    'background'
  );

  const handleQuickBid = (increment: number) => {
    const newAmount = currentPrice + increment;
    setBidAmount(newAmount.toString());
    setError('');
  };

  const handleSubmit = async () => {
    const amount = parseInt(bidAmount, 10);

    // Client-side validation
    if (isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount < minimumBid) {
      setError(`Bid too low - minimum is ${formatPrice(minimumBid)}`);
      return;
    }

    setError('');

    try {
      await onSubmit(amount);
      // Reset to new minimum after successful bid
      setBidAmount((amount + minIncrement).toString());
    } catch (err) {
      // Error handled by parent component
      console.error('Bid submission error:', err);
    }
  };

  return (
    <Card style={styles.container} testID={testID}>
      <Text style={[styles.title, { color: textColor }]}>Place Your Bid</Text>

      <Text style={[styles.minimumText, { color: secondaryTextColor }]}>
        Minimum bid: {formatPrice(minimumBid)}
      </Text>

      {/* Quick bid buttons */}
      <View style={styles.quickBidContainer}>
        {QUICK_BID_AMOUNTS.map((increment) => (
          <Pressable
            key={increment}
            style={({ pressed }) => [
              styles.quickBidButton,
              { backgroundColor: buttonBgColor },
              pressed && styles.quickBidPressed,
            ]}
            onPress={() => handleQuickBid(increment)}
            disabled={disabled || loading}
            testID={`${testID}-quick-${increment}`}
          >
            <Text style={[styles.quickBidText, { color: textColor }]}>
              +{formatPrice(increment)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Bid amount input */}
      <Input
        label="Your Bid Amount (원)"
        value={bidAmount}
        onChangeText={(text) => {
          setBidAmount(text);
          setError('');
        }}
        type="number"
        keyboardType="numeric"
        placeholder={minimumBid.toString()}
        error={error}
        editable={!disabled && !loading}
        testID={`${testID}-input`}
      />

      {/* Submit button */}
      <Button
        onPress={handleSubmit}
        variant="primary"
        disabled={disabled}
        loading={loading}
        testID={`${testID}-submit`}
      >
        Place Bid
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  minimumText: {
    fontSize: 14,
    marginBottom: 16,
  },
  quickBidContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickBidButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickBidPressed: {
    opacity: 0.7,
  },
  quickBidText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
