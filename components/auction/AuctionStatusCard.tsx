import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPrice } from '@/lib/utils';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CountdownTimer } from './CountdownTimer';

interface AuctionStatusCardProps {
    startPrice: number;
    currentPrice: number;
    biddersCount: number;
    endsAt: string;
    testID?: string;
}

export function AuctionStatusCard({
    startPrice,
    currentPrice,
    biddersCount,
    endsAt,
    testID,
}: AuctionStatusCardProps) {
    const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
    const secondaryTextColor = useThemeColor(
        { light: '#8E8E93', dark: '#636366' },
        'text'
    );
    const tintColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');
    const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'border');

    return (
        <View style={[styles.container, { borderColor }]} testID={testID}>
            {/* Time Left Pill */}
            <View style={styles.pillContainer}>
                <View style={styles.pill}>
                    <Text style={styles.pillLabel}>Time Left to bid</Text>
                    <CountdownTimer endsAt={endsAt} style={styles.timer} showIcon={true} />
                </View>
            </View>

            <View style={styles.content}>
                {/* Starting Bid */}
                <View style={styles.column}>
                    <Text style={[styles.label, { color: secondaryTextColor }]}>Starting Bid</Text>
                    <Text style={[styles.value, { color: tintColor }]}>{formatPrice(startPrice)}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: borderColor }]} />

                {/* Latest Bid */}
                <View style={styles.column}>
                    <Text style={[styles.label, { color: secondaryTextColor }]}>Latest Bid</Text>
                    <Text style={[styles.value, { color: tintColor }]}>{formatPrice(currentPrice)}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: borderColor }]} />

                {/* Bidders */}
                <View style={styles.column}>
                    <Text style={[styles.label, { color: secondaryTextColor }]}>Bidders</Text>
                    <Text style={[styles.value, { color: tintColor }]}>
                        {biddersCount.toString().padStart(2, '0')}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        paddingTop: 24,
        marginBottom: 24,
        position: 'relative',
    },
    pillContainer: {
        position: 'absolute',
        top: -14,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    pill: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pillLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    timer: {
        fontSize: 12,
        color: '#FF3B30',
        fontWeight: '600',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 30,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
    },
});
