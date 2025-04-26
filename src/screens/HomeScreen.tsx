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
import PurchaseDetailsModal, { Purchase } from '../components/PurchaseDetailModal';

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);


  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0)); // Анимация затемнения фона
  const [translateY] = useState(new Animated.Value(300)); // Анимация появления модалки снизу

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

    if (year === now.getFullYear()) {
      return `${day} ${month} в ${hours}:${minutes}`;
    } else {
      return `${day} ${month} ${year} в ${hours}:${minutes}`;
    }
  };


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
    console.log("modal")
    translateY.setValue(300);
    fadeAnim.setValue(0);
    setModalVisible(true);

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
    }, 50); // Даем 50ms, чтобы Modal успел стать видимым
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
    { id: 1, time: '2025-04-26T18:01', amount: '450', idShop: 1 },
    { id: 2, time: '2025-04-26T18:01', amount: '320', idShop: 2 },
    { id: 3, time: '2025-04-26T18:01', amount: '1 200', idShop: 3 },
  ];

  const shopIcons: { [key: number]: { icon: any; name: string } } = {
    1: { icon: require('../assets/icons/magnit.png'), name: 'Магнит' },
    2: { icon: require('../assets/icons/pyatyorochka.png'), name: 'Пятёрочка' },
    3: { icon: require('../assets/icons/ozon.png'), name: 'OZON' },
  };

  const categories = ['Продукты', 'Одежда', 'Техника', 'Дом', 'Спорт'];

  const categoriesIcons: { [key: string]: any } = {
    'Продукты': require('../assets/categories/products.png'),
    'Одежда': require('../assets/categories/clothes.png'),
  };

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
        colors={['#ff4e50', '#ff4e50']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
            <Image source={require('../assets/icons/bogdan.jpg')} style={styles.logo} />
          </TouchableOpacity>
          <Text style={styles.username}>Богдан</Text>
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
            {purchases.map((item, index) => {
              const shop = shopIcons[item.idShop];

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setSelectedPurchase(item); // Сохраняем выбранную покупку
                    setPurchaseModalVisible(true); // Открываем модалку
                  }}
                >
                  <View style={styles.purchaseCard}>
                    <Image
                      source={shop?.icon || require('../assets/icons/default.png')}
                      style={styles.purchaseIcon}
                    />
                    <View style={styles.purchaseInfo}>
                      <Text style={styles.purchaseShop}>{shop?.name || 'Неизвестно'}</Text>
                      <Text style={styles.purchaseTime}>{formatDate(item.time)}</Text>
                    </View>
                    <Text style={styles.purchaseAmount}>{item.amount}₽</Text>
                  </View>

                  {index !== purchases.length - 1 && <View style={styles.purchaseSeparator} />}
                </TouchableOpacity>
              );
            })}

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
                <View style={{ position: 'relative' }}>
                  <Image
                    source={categoriesIcons[cat] || require('../assets/categories/default.png')}  // fallback на дефолтную иконку
                    style={styles.categoriesIcon}
                  />
                  <Text style={styles.categoriesTextOverlay}>{cat}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

        </View>

        {/* Акции */}
        <View style={styles.section}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Акции</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat, idx) => (
              <View key={idx} style={styles.categoryBox}>
                <View style={{ position: 'relative' }}>
                  <Image
                    source={categoriesIcons[cat] || require('../assets/categories/default.png')}  // fallback на дефолтную иконку
                    style={styles.categoriesIcon}
                  />
                  <Text style={styles.categoriesTextOverlay}>{cat}</Text>
                </View>
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

      <PurchaseDetailsModal
        purchaseModalVisible={purchaseModalVisible}
        setPurchaseModalVisible={setPurchaseModalVisible}
        selectedPurchase={selectedPurchase}
      />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  content: {
    marginTop: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F6F7F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  header: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    marginLeft: 12,
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: FONT_FAMILY.Montserrat_MEDIUM,
    letterSpacing: 0.2,
  },
  qrBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,

    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  moreButtonText: {
    color: '#ff4e50',
    fontSize: 15,
    fontFamily: FONT_FAMILY.Montserrat_MEDIUM,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#000000',
    fontFamily: FONT_FAMILY.Montserrat_BOLD,
  },
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  purchaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    // backgroundColor: '#FFDD2D20',
    padding: 8,
  },
  purchaseInfo: {
    flex: 1,
    marginLeft: 16,
  },
  purchaseShop: {
    fontSize: 16,
    color: '#000000',
    fontFamily: FONT_FAMILY.Montserrat_MEDIUM,
  },
  purchaseTime: {
    fontSize: 13,
    color: '#797979',
    fontFamily: FONT_FAMILY.Montserrat_REGULAR,
    marginTop: 4,
  },
  purchaseAmount: {
    fontSize: 16,
    color: '#000000',
    fontFamily: FONT_FAMILY.Montserrat_BOLD,
  },
  purchaseSeparator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    marginVertical: 4,
  },
  categoryScroll: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  categoryBox: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    // paddingVertical: 12,
    // paddingHorizontal: 20,
    borderRadius: 30,
    marginRight: 15,
    // borderWidth: 4,
    // borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  categoriesIcon: {
    width: '100%',
    height: undefined, // обязательно убрать фиксированную высоту!
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    resizeMode: 'contain',
  },
  categoriesTextOverlay: {
    position: 'absolute',
    top: 5,
    left: 5,
    color: '#777', // чтобы текст был виден на картинке
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 16,
    fontFamily: FONT_FAMILY.PODKOVA_REGULAR,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#ff4e50',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  dragBar: {
    width: 48,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    color: '#000000',
    fontFamily: FONT_FAMILY.Montserrat_BOLD,
    marginBottom: 24,
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
  },
  noImageText: {
    fontSize: 15,
    color: '#A0A0A0',
    fontFamily: FONT_FAMILY.Montserrat_REGULAR,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#ff4e50',
    paddingVertical: 16,
    borderRadius: 14,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONT_FAMILY.Montserrat_MEDIUM,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default HomeScreen;
