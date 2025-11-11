// CountdownTimer component for auction cards and detail views
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { formatTimeRemaining, getRemainingMs } from '@/lib/utils';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ENDING_SOON_THRESHOLD_MS } from '@/constants/Auction';

interface CountdownTimerProps {
  endsAt: string;
  style?: TextStyle;
  testID?: string;
}

export function CountdownTimer({ endsAt, style, testID }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(endsAt));
  const [isEndingSoon, setIsEndingSoon] = useState(
    getRemainingMs(endsAt) <= ENDING_SOON_THRESHOLD_MS && getRemainingMs(endsAt) > 0
  );

  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const warningColor = '#FF9500';
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
    <Text style={[styles.timer, { color }, style]} testID={testID}>
      {timeLeft}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 14,
    fontWeight: '600',
  },
});
