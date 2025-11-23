import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface SellerInfoProps {
    name: string;
    avatarUrl?: string;
    testID?: string;
}

export function SellerInfo({ name, avatarUrl, testID }: SellerInfoProps) {
    const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
    const secondaryTextColor = useThemeColor(
        { light: '#8E8E93', dark: '#636366' },
        'text'
    );

    return (
        <View style={styles.container} testID={testID}>
            <Image
                source={{ uri: avatarUrl || 'https://i.pravatar.cc/150?u=seller' }}
                style={styles.avatar}
            />
            <View>
                <Text style={[styles.label, { color: secondaryTextColor }]}>Posted by</Text>
                <Text style={[styles.name, { color: textColor }]}>{name}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#E5E5EA',
    },
    label: {
        fontSize: 12,
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
});
