// Task T023: Create components/ui/Button.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  testID,
  style,
}: ButtonProps) {
  const backgroundColor = useThemeColor(
    { light: '#007AFF', dark: '#0A84FF' },
    'background'
  );
  const secondaryBg = useThemeColor(
    { light: '#F2F2F7', dark: '#1C1C1E' },
    'background'
  );
  const textColor = useThemeColor({ light: '#FFFFFF', dark: '#FFFFFF' }, 'text');
  const secondaryText = useThemeColor(
    { light: '#007AFF', dark: '#0A84FF' },
    'text'
  );
  const borderColor = useThemeColor(
    { light: '#007AFF', dark: '#0A84FF' },
    'border'
  );

  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    ...styles.button,
    ...(variant === 'primary' && {
      backgroundColor: isDisabled ? '#C7C7CC' : backgroundColor,
    }),
    ...(variant === 'secondary' && {
      backgroundColor: isDisabled ? '#C7C7CC' : secondaryBg,
    }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: isDisabled ? '#C7C7CC' : borderColor,
    }),
    ...(isDisabled && { opacity: 0.5 }),
    ...style,
  };

  const textStyle: TextStyle = {
    ...styles.text,
    ...(variant === 'primary' && { color: textColor }),
    ...(variant === 'secondary' && { color: secondaryText }),
    ...(variant === 'outline' && { color: isDisabled ? '#C7C7CC' : borderColor }),
  };

  return (
    <Pressable
      style={({ pressed }) => [
        containerStyle,
        pressed && !isDisabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? textColor : borderColor}
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
