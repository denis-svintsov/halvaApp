import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, Animated, PanResponder, StyleSheet, Easing } from 'react-native';
// Типизация пропсов компонента PurchaseDetailsModal
export interface Purchase {
    id: number;
    idShop: number;
    amount: string;
    time: string;
}

interface PurchaseDetailsModalProps {
    purchaseModalVisible: boolean;
    setPurchaseModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    selectedPurchase: Purchase | null;
}

const shopIcons: { [key: number]: { icon: any; name: string } } = {
    1: { icon: require('../assets/icons/magnit.png'), name: 'Магнит' },
    2: { icon: require('../assets/icons/pyatyorochka.png'), name: 'Пятёрочка' },
    3: { icon: require('../assets/icons/ozon.png'), name: 'OZON' },
  };

const PurchaseDetailsModal: React.FC<PurchaseDetailsModalProps> = ({ purchaseModalVisible, setPurchaseModalVisible, selectedPurchase }) => {
    const [fadeAnim] = useState(new Animated.Value(0)); // Анимация затемнения фона
    const [translateY] = useState(new Animated.Value(300)); // Для анимации появления модального окна
    const shop = selectedPurchase?.idShop !== undefined ? shopIcons[selectedPurchase.idShop] : null;


    const openModal = () => {
        console.log("Opening purchase modal...");
        translateY.setValue(300); // Начальная позиция модалки
        fadeAnim.setValue(0); // Фоновая анимация
        setPurchaseModalVisible(true);

        setTimeout(() => {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0, // Окончательная позиция модалки
                    useNativeDriver: true,
                    friction: 8,
                    tension: 70,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1, // Плавное появление фона
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 50); // Даем время, чтобы Modal стал видимым
    };

    useEffect(() => {
        if (purchaseModalVisible) {
            openModal();  // Открытие модалки, если purchaseModalVisible == true
        }
    }, [purchaseModalVisible]);

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 300, // Спускаем модалку вниз
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0, // Фон снова исчезает
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setPurchaseModalVisible(false); // Закрытие модального окна
        });
    };

    // Панель жестов для свайпа
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) {
                translateY.setValue(gestureState.dy);
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 150) {
                closeModal(); // Если смахнули достаточно сильно — закрыть
            } else {
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start(); // Если не смахнули, вернуть модалку обратно
            }
        },
    });

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
    
        const months = [
          'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
          'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
    
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
    
        return `${day} ${month} ${year} в ${hours}:${minutes}`;
      };

    return (
        <Modal transparent={true} visible={purchaseModalVisible} onRequestClose={closeModal}>
            <View style={styles.modalOverlay}>
                {/* Фон с затемнением */}
                <TouchableWithoutFeedback onPress={closeModal}>
                    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)', opacity: fadeAnim }]} />
                </TouchableWithoutFeedback>

                {/* Модальное окно со свайпом вниз */}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.modalContent, { transform: [{ translateY }] }]}>
                    <View style={styles.dragBar}></View>
                    <Text style={styles.title}>Детали покупки</Text>

                    {/* Отображаем информацию о покупке */}
                    <Text style={styles.purchaseDetails}>Магазин: {shop?.name || 'Неизвестно'}</Text>
                    <Text style={styles.purchaseDetails}>Сумма: {selectedPurchase?.amount}₽</Text>
                    <Text style={styles.purchaseDetails}>Дата: {formatDate(selectedPurchase?.time || "Дата не указана")
                    }</Text>
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
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 34,
    },
    dragBar: {
        width: 50,
        height: 5,
        backgroundColor: '#D3D3D3',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    purchaseDetails: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PurchaseDetailsModal;
