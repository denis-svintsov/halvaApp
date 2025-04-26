import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal,
  Platform, PermissionsAndroid, Alert, Animated, Easing, TouchableWithoutFeedback, PanResponder
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { FONT_FAMILY } from '../../customFont';
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0)); // Анимация затемнения фона
  const [translateY] = useState(new Animated.Value(300)); // Анимация появления модалки снизу

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true, // Это позволит сразу обрабатывать свайпы
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5, // Проверяем движение по оси Y
    onPanResponderMove: (_, gestureState) => {
      // Когда двигаем — обновляем translateY
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) {
        // Если смахнули достаточно вниз — закрыть
        closeModal();
      } else {
        // Иначе вернуть обратно вверх
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const openModal = () => {
    translateY.setValue(300);  // Начальное положение модалки
    fadeAnim.setValue(0);  // Начальная прозрачность фона
    setModalVisible(true);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 70,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,  // Делаем фон полупрозрачным
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 300, // Модалка спускается вниз
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,  // Фон снова становится прозрачным
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  const purchases = [
    { id: 1, shop: 'Магнит', time: 'Сегодня, 12:30', amount: '450₽' },
    { id: 2, shop: 'Пятёрочка', time: 'Вчера, 18:00', amount: '320₽' },
    { id: 3, shop: 'OZON', time: '12 апр, 10:15', amount: '1 200₽' },
  ];

  const categories = ['Продукты', 'Одежда', 'Техника', 'Дом', 'Спорт'];

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        const uri = response.assets?.[0]?.uri ?? null;
        setImageUri(uri);
      }
    });
  };

  const takePhoto = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Разрешение на использование камеры',
          message: 'Приложению нужно разрешение на использование камеры для съемки фото.',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Отказать',
          buttonPositive: 'Разрешить',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Ошибка', 'Вы не дали разрешение на использование камеры.');
        return;
      }
    }

    launchCamera({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        const uri = response.assets?.[0]?.uri ?? null;
        setImageUri(uri);
      }
    });
  };

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите изображение!');
      return;
    }

    const formData = new FormData();
    const image = {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    };

    formData.append('file', image);
    formData.append('userId', '1');

    try {
      await axios.post('http://109.195.28.204/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Успех', 'Изображение успешно отправлено!', [{ text: 'OK', onPress: () => closeModal() }]);
    } catch (error) {
      console.log('Ошибка при отправке:', error);
      Alert.alert('Ошибка', 'Не удалось отправить изображение. Попробуйте снова.');
    }
  };

  const handleCloseBackground = () => {
    closeModal();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2A2F4F', '#2A2F4F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={require('../assets/icons/bogdan.jpg')} style={styles.logo} />
          <Text style={styles.username}>Алексей</Text>
        </View>
        <View style={styles.qrBox}>
          <TouchableOpacity onPress={openModal}>
            <Image source={require('../assets/icons/qr-code-white.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Траты */}
        <View style={styles.section}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Траты</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllPurchases')}
              // style={styles.moreButton}
            >
              <Text style={styles.moreButtonText}>Ещё</Text>
            </TouchableOpacity>
          </View>

          <View>
            {purchases.map((item) => (
              <View key={item.id}>
                <View style={styles.purchaseCard}>
                  <Image source={require('../assets/icons/magnit.png')} style={styles.purchaseIcon} />
                  <View style={styles.purchaseInfo}>
                    <Text style={styles.purchaseShop}>{item.shop}</Text>
                    <Text style={styles.purchaseTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.purchaseAmount}>{item.amount}</Text>
                </View>

                {/* Линия под карточкой */}
                <View style={styles.purchaseSeparator} />
              </View>
            ))}
          </View>
        </View>

        {/* Категории */}
        <View style={styles.section}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Категории</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat, idx) => (
              <View key={idx} style={styles.categoryBox}>
                <Text>{cat}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Модальное окно */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          {/* Фон с затемнением */}
          <TouchableWithoutFeedback onPress={closeModal}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)', opacity: fadeAnim }]} />
          </TouchableWithoutFeedback>

          {/* Модальное окно со свайпом вниз */}
          <Animated.View
            {...panResponder.panHandlers}  // Добавляем панел для жестов
            style={[styles.modalContent, { transform: [{ translateY }] }]}>
            <View style={styles.dragBar}></View>
            <Text style={styles.title}>Загрузите фото</Text>

            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Text style={styles.noImageText}>Нет выбранного изображения</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={selectImage}>
              <Text style={styles.buttonText}>Выбрать из галереи</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>Сделать фото</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={uploadImage}>
              <Text style={styles.buttonText}>Отправить</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#2A2F4F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 242, 0.8)',
  },
  content: {
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#2A2F4F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    marginLeft: 16,
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: FONT_FAMILY.Montserrat_REGULAR,
    letterSpacing: 0.5,
  },
  qrBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moreButtonText: {
    color: '#2A2F4F',
    fontSize: 16,
    fontFamily: FONT_FAMILY.Montserrat_MEDIUM,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#2A2F4F',
    fontFamily: FONT_FAMILY.Montserrat_BOLD,
    letterSpacing: 0.5,
  },
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  purchaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  purchaseInfo: {
    flex: 1,
    marginLeft: 16,
  },
  purchaseShop: {
    fontSize: 16,
    color: '#2A2F4F',
    fontFamily: FONT_FAMILY.Montserrat_REGULAR,
  },
  purchaseTime: {
    fontSize: 13,
    color: '#6C757D',
    fontFamily: FONT_FAMILY.Montserrat_LIGHT,
  },
  purchaseAmount: {
    fontSize: 16,
    color: '#2A2F4F',
    fontFamily: FONT_FAMILY.Montserrat_BOLD,
  },
  purchaseSeparator: {
    height: 1,
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    marginVertical: 8,
    marginHorizontal: 40
  },
  categoryScroll: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  categoryBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 242, 0.8)',
    shadowColor: '#2A2F4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: '#FFFFFF',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(42, 47, 79, 0.6)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
  },
  dragBar: {
    width: 64,
    height: 5,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: '#2A2F4F',
    fontFamily: FONT_FAMILY.Montserrat_BOLD,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  noImageText: {
    fontSize: 16,
    color: '#ADB5BD',
    fontFamily: FONT_FAMILY.Montserrat_REGULAR,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#2A2F4F',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#2A2F4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONT_FAMILY.Montserrat_REGULAR,
    letterSpacing: 0.3,
  },
});

export default HomeScreen;
