import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, Animated, PanResponder, StyleSheet, Easing } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export interface Purchase {
    loadId: string;
    shop: string;
    total: number;
    date: string;
    category: string;
    items: {
        name: string;
        price: number;
        count: number;
        total: number;
    }[];
}

interface PurchaseDetailsModalProps {
    purchaseModalVisible: boolean;
    setPurchaseModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    selectedPurchase: Purchase | null;
}

const shopIcons: { [key: string]: any } = {
    'Магнит': require('../assets/icons/magnit.png'),
    'Пятерочка': require('../assets/icons/pyatyorochka.png'),
    'OZON': require('../assets/icons/ozon.png'),
};

const PurchaseDetailsModal: React.FC<PurchaseDetailsModalProps> = ({ purchaseModalVisible, setPurchaseModalVisible, selectedPurchase }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [translateY] = useState(new Animated.Value(300));
    const [scrollOffset, setScrollOffset] = useState(0);

    const openModal = () => {
        translateY.setValue(300);
        fadeAnim.setValue(0);
        setPurchaseModalVisible(true);

        setTimeout(() => {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 8,
                    tension: 70,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 50);
    };

    useEffect(() => {
        if (purchaseModalVisible) {
            openModal();
        }
    }, [purchaseModalVisible]);

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 300,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setPurchaseModalVisible(false);
        });
    };

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
            if (scrollOffset <= 0 && gestureState.dy > 5) {
                return true;
            }
            return false;
        },
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) {
                translateY.setValue(gestureState.dy);
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 150) {
                closeModal();
            } else {
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        },
    });

    const handleScroll = (event: any) => {
        setScrollOffset(event.nativeEvent.contentOffset.y);
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    const matchedIconKey = Object.keys(shopIcons).find(key => selectedPurchase?.shop.includes(key));
    const iconSource = matchedIconKey ? shopIcons[matchedIconKey] : require('../assets/icons/LENTA.png');

    return (
        <Modal transparent={true} visible={purchaseModalVisible} onRequestClose={closeModal}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={closeModal}>
                    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)', opacity: fadeAnim }]} />
                </TouchableWithoutFeedback>

                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.modalContentWrapper, { transform: [{ translateY }] }]}>

                    <View style={styles.dragBar} />

                    <ScrollView
                        style={styles.modalContent}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={handleScroll}
                    >
                        {/* Шапка чека */}
                        <View style={styles.receiptHeader}>
                            <Image
                                source={iconSource}
                                style={styles.shopIcon}
                            />
                            <Text style={styles.shopName}>{selectedPurchase?.shop || 'Магазин'}</Text>
                            <Text style={styles.receiptDate}>{formatDate(selectedPurchase?.date || new Date().toISOString())}</Text>
                            <Text style={styles.receiptDate}>Категория: {selectedPurchase?.category}</Text>
                        </View>

                        {/* Список товаров */}
                        <View style={styles.itemsList}>
                            {selectedPurchase?.items.map((item, index) => (
                                <View key={index} style={styles.itemRow}>
                                    <View style={styles.itemNameWrapper}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemPrice}>{item.price}₽ × {item.count}</Text>
                                    </View>
                                    <Text style={styles.itemTotal}>{item.total}₽</Text>
                                </View>
                            ))}
                        </View>

                        {/* Итоговая сумма */}
                        <View style={styles.totalSection}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>ИТОГО</Text>
                                <Text style={styles.totalAmount}>{selectedPurchase?.total}₽</Text>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContentWrapper: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: '90%',
        width: '100%',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    dragBar: {
        width: 40,
        height: 4,
        backgroundColor: '#ccc',
        borderRadius: 2,
        alignSelf: 'center',
        marginVertical: 8,
    },
    modalContent: {
        paddingHorizontal: 16,
    },
    receiptHeader: {
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    shopIcon: {
        width: 48,
        height: 48,
        marginBottom: 8,
        resizeMode: 'contain',
    },
    shopName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    receiptDate: {
        fontSize: 14,
        color: '#666',
    },
    itemsList: {
        marginVertical: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemNameWrapper: {
        flex: 1,
        marginRight: 8,
    },
    itemName: {
        fontSize: 16,
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalSection: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 12,
        marginBottom: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    receiptFooter: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
});

export default PurchaseDetailsModal;