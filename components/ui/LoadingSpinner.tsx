// Task T027: Create components/ui/LoadingSpinner.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  testID?: string;
}

export function LoadingSpinner({ size = 'large', testID }: LoadingSpinnerProps) {
  const color = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');

  return (
    <View style={styles.container} testID={testID}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
