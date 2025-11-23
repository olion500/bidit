// CountdownTimer component for auction cards and detail views
import { ENDING_SOON_THRESHOLD_MS } from '@/constants/Auction';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatTimeRemaining, getRemainingMs } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';

interface CountdownTimerProps {
  endsAt: string;
  style?: TextStyle;
  testID?: string;
  showIcon?: boolean;
}

export function CountdownTimer({ endsAt, style, testID, showIcon = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(endsAt));
  const [isEndingSoon, setIsEndingSoon] = useState(
    getRemainingMs(endsAt) <= ENDING_SOON_THRESHOLD_MS && getRemainingMs(endsAt) > 0
  );

  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const warningColor = '#FF3B30'; // Red for urgency
  const endedColor = '#8E8E93';

  useEffect(() => {
    const updateTimer = () => {
      const remaining = getRemainingMs(endsAt);
      setTimeLeft(formatTimeRemaining(endsAt));
      setIsEndingSoon(remaining <= ENDING_SOON_THRESHOLD_MS && remaining > 0);
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  const color = timeLeft === 'Ended' ? endedColor : isEndingSoon ? warningColor : textColor;

  return (
    <View style={styles.container}>
      {showIcon && (
        <Ionicons name="time-outline" size={16} color={color} style={{ marginRight: 4 }} />
      )}
      <Text style={[styles.timer, { color }, style]} testID={testID}>
        {timeLeft}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timer: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
