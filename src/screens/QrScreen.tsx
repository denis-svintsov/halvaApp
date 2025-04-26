import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';

const QrScreen = ({ navigation }: any) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const selectImage = () => {
    // Показываем меню выбора: камера или галерея
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        // Проверяем, что URI существует, и устанавливаем его или null
        const uri = response.assets?.[0]?.uri ?? null;
        setImageUri(uri); // Сохраняем URI изображения или null
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
      type: 'image/jpeg', // можно динамически определять тип, если нужно
      name: 'photo.jpg',
    };
  
    // Кладем файл
    formData.append('file', image);
  
    // Кладем userId
    formData.append('userId', '1'); // Важно: строкой, FormData ожидает текст
  
    try {
      const response = await axios.post('http://109.195.28.204/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Успех', 'Изображение успешно отправлено!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.log('Ошибка при отправке:', error);
      Alert.alert('Ошибка', 'Не удалось отправить изображение. Попробуйте снова.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Загрузите фото</Text>
      
      {/* Показ изображения, если оно выбрано */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <Text style={styles.noImageText}>Нет выбранного изображения</Text>
      )}

      {/* Кнопки для выбора изображения */}
      <TouchableOpacity style={styles.button} onPress={selectImage}>
        <Text style={styles.buttonText}>Выбрать из галереи</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Сделать фото</Text>
      </TouchableOpacity>
      
      {/* Кнопка для отправки изображения */}
      <TouchableOpacity style={styles.button} onPress={uploadImage}>
        <Text style={styles.buttonText}>Отправить</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  noImageText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 20,
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

export default QrScreen;