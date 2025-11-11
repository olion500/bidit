// Task T025: Create components/ui/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function Card({ children, style, testID }: CardProps) {
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1C1C1E' },
    'background'
  );
  const borderColor = useThemeColor(
    { light: '#E5E5EA', dark: '#38383A' },
    'border'
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
          shadowColor: useThemeColor(
            { light: '#000000', dark: '#000000' },
            'text'
          ),
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
