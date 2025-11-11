// Task T024: Create components/ui/Input.tsx
import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  KeyboardTypeOptions,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface InputProps extends Omit<TextInputProps, 'keyboardType'> {
  label?: string;
  error?: string;
  type?: 'text' | 'number';
  testID?: string;
}

export function Input({
  label,
  error,
  type = 'text',
  testID,
  style,
  ...props
}: InputProps) {
  const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
  const borderColor = useThemeColor(
    { light: '#C7C7CC', dark: '#38383A' },
    'border'
  );
  const backgroundColor = useThemeColor(
    { light: '#FFFFFF', dark: '#1C1C1E' },
    'background'
  );
  const errorColor = '#FF3B30';
  const placeholderColor = useThemeColor(
    { light: '#8E8E93', dark: '#636366' },
    'text'
  );

  const keyboardType: KeyboardTypeOptions = type === 'number' ? 'numeric' : 'default';

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            borderColor: error ? errorColor : borderColor,
            backgroundColor,
          },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        keyboardType={keyboardType}
        testID={testID}
        {...props}
      />
      {error && <Text style={[styles.error, { color: errorColor }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 48,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
