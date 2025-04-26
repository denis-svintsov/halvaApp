import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal,
  Platform, PermissionsAndroid, Alert, Animated, Easing, TouchableWithoutFeedback, PanResponder
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { FONT_FAMILY } from '../../customFont';

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
      Animated.timing(translateY, {
        toValue: 0,  // Модалка должна подняться
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
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
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={require('../assets/icons/bogdan.jpg')} style={styles.logo} />
          <Text style={styles.username}>Алексей</Text>
        </View>
        <View style={styles.qrBox}>
          <TouchableOpacity onPress={openModal}>
            <Image source={require('../assets/icons/qr-code-white.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Траты */}
      <View style={styles.section}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Траты</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AllPurchases')}
            style={styles.moreButton}
          >
            <Text style={styles.moreButtonText}>Ещё</Text>
          </TouchableOpacity>
        </View>

        <View>
          {purchases.map((item) => (
            <View key={item.id} style={styles.purchaseCard}>
               <Image source={require('../assets/icons/magnit.png')} style={styles.purchaseIcon} />
              <View style={styles.purchaseInfo}>
                <Text style={styles.purchaseShop}>{item.shop}</Text>
                <Text style={styles.purchaseTime}>{item.time}</Text>
              </View>
              <Text style={styles.purchaseAmount}>{item.amount}</Text>
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
    marginBottom: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 50,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    marginLeft: 10,
    fontSize: 22,
    // fontWeight: '600',
    fontFamily: FONT_FAMILY.Montserrat_MEDIUM,
  },
  qrBox: {
    backgroundColor: '#ff4e50',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Распределение по ширине
    marginBottom: 12,
  },
  moreButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.Montserrat_REGULAR,
  },
  sectionTitle: {
    fontSize: 24,
    // fontWeight: 'bold',
    fontFamily: FONT_FAMILY.Montserrat_BOLD,
    marginLeft: 10,
  },
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  purchaseIcon: {
    width: 30,
    height: 30,
  },
  purchaseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  purchaseShop: {
    fontSize: 16,
    // fontWeight: '600',
    fontFamily: FONT_FAMILY.Montserrat_MEDIUM,
  },
  purchaseTime: {
    fontSize: 12,
    color: '#777',
    fontFamily: FONT_FAMILY.Montserrat_LIGHT,
  },
  purchaseAmount: {
    // fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONT_FAMILY.Montserrat_BOLD,
  },
  moreButton: {
    backgroundColor: '#ff4e50', // Цвет кнопки
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  categoryScroll: {
    marginBottom: 24,
    paddingVertical: 4,
  },
  categoryBox: {
    backgroundColor: '#FEFEFE',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 20,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dragBar: {
    width: 50,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  noImageText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#ff4e50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
