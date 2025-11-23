import { useThemeColor } from '@/hooks/use-theme-color';
import { formatPrice } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CountdownTimer } from './CountdownTimer';

const { height } = Dimensions.get('window');

interface BiddingBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    currentPrice: number;
    startPrice: number;
    minIncrement: number;
    endsAt: string;
    onSubmit: (amount: number) => Promise<void>;
    loading?: boolean;
    testID?: string;
}

export function BiddingBottomSheet({
    visible,
    onClose,
    currentPrice,
    startPrice,
    minIncrement,
    endsAt,
    onSubmit,
    loading = false,
    testID,
}: BiddingBottomSheetProps) {
    const [bidAmount, setBidAmount] = useState(currentPrice + minIncrement);
    const slideAnim = React.useRef(new Animated.Value(height)).current;

    // Reset bid amount when opening
    useEffect(() => {
        if (visible) {
            setBidAmount(currentPrice + minIncrement);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 90,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, currentPrice, minIncrement, slideAnim]);

    const handleIncrement = () => {
        setBidAmount((prev) => prev + minIncrement);
    };

    const handleDecrement = () => {
        if (bidAmount > currentPrice + minIncrement) {
            setBidAmount((prev) => prev - minIncrement);
        }
    };

    const handleSubmit = async () => {
        await onSubmit(bidAmount);
        onClose();
    };

    const textColor = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');
    const secondaryTextColor = useThemeColor(
        { light: '#8E8E93', dark: '#636366' },
        'text'
    );
    const tintColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint');
    const backgroundColor = useThemeColor(
        { light: '#FFFFFF', dark: '#1C1C1E' },
        'background'
    );
    const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'border');

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <Animated.View
                    style={[
                        styles.sheet,
                        { backgroundColor, transform: [{ translateY: slideAnim }] },
                    ]}
                    testID={testID}
                >
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: textColor }]}>Place your bid</Text>
                        <View style={styles.timerPill}>
                            <Ionicons name="time-outline" size={14} color="#FF3B30" />
                            <Text style={styles.timerLabel}>Time Left to bid</Text>
                            <CountdownTimer endsAt={endsAt} style={styles.timerValue} />
                        </View>
                    </View>

                    {/* Price Summary */}
                    <View style={[styles.summaryCard, { borderColor }]}>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryLabel, { color: secondaryTextColor }]}>Starting Bid</Text>
                            <Text style={[styles.summaryValue, { color: textColor }]}>{formatPrice(startPrice)}</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: borderColor }]} />
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryLabel, { color: secondaryTextColor }]}>Last Bid</Text>
                            <Text style={[styles.summaryValue, { color: textColor }]}>{formatPrice(currentPrice)}</Text>
                        </View>
                    </View>

                    {/* Bid Adjuster */}
                    <View style={styles.adjusterContainer}>
                        <Text style={[styles.yourBidLabel, { color: secondaryTextColor }]}>Your bid</Text>

                        <View style={styles.adjusterRow}>
                            <Pressable
                                style={[styles.adjusterButton, { borderColor: '#FF9500' }]}
                                onPress={handleDecrement}
                                disabled={bidAmount <= currentPrice + minIncrement}
                            >
                                <Ionicons name="remove" size={24} color="#FF9500" />
                            </Pressable>

                            <View style={styles.amountContainer}>
                                <Text style={[styles.bidAmount, { color: '#2f54eb' }]}>
                                    {formatPrice(bidAmount)}
                                </Text>
                            </View>

                            <Pressable
                                style={[styles.adjusterButton, { borderColor: '#34C759' }]}
                                onPress={handleIncrement}
                            >
                                <Ionicons name="add" size={24} color="#34C759" />
                            </Pressable>
                        </View>

                        <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                            *Bid increase by {formatPrice(minIncrement)}
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.submitButton,
                            { backgroundColor: '#2f54eb' },
                            pressed && styles.submitPressed,
                            loading && styles.disabledButton,
                        ]}
                        onPress={handleSubmit}
                        disabled={loading}
                        testID={`${testID}-submit`}
                    >
                        <Text style={styles.submitText}>
                            {loading ? 'Placing Bid...' : `Place your bid at ${formatPrice(bidAmount)}`}
                        </Text>
                    </Pressable>

                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        minHeight: 400,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E5EA',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    timerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        gap: 4,
    },
    timerLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
    },
    timerValue: {
        fontSize: 10,
        color: '#FF3B30',
        fontWeight: '700',
    },
    summaryCard: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: '100%',
    },
    summaryLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    adjusterContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    yourBidLabel: {
        fontSize: 14,
        marginBottom: 12,
    },
    adjusterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    adjusterButton: {
        width: 50,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    amountContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#2f54eb',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    bidAmount: {
        fontSize: 32,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 12,
    },
    submitButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2f54eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    }
});
