import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const QrScreen = () => {
  const navigation = useNavigation<any>();

  const purchases = [
    { id: 1, shop: 'Магнит', time: 'Сегодня, 12:30', amount: '450₽' },
    { id: 2, shop: 'Пятёрочка', time: 'Вчера, 18:00', amount: '320₽' },
    { id: 3, shop: 'OZON', time: '12 апр, 10:15', amount: '1 200₽' },
  ];

  const categories = ['Продукты', 'Одежда', 'Техника', 'Дом', 'Спорт'];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {/* <Image source={require('../assets/icons/user.png')} style={styles.icon} /> */}
          <Text style={styles.username}>Алексей</Text>
        </View>
        <TouchableOpacity style={styles.qrBox} onPress={() => navigation.navigate('QrScreen')}>
          {/* <Image source={require('../assets/icons/qr.png')} style={styles.icon} /> */}
        </TouchableOpacity>
      </View>

      {/* Траты */}
      <Text style={styles.sectionTitle}>Траты</Text>
      <View>
        {purchases.map((item) => (
          <View key={item.id} style={styles.purchaseCard}>
            {/* <Image source={require('../assets/icons/shop.png')} style={styles.icon} /> */}
            <View style={styles.purchaseInfo}>
              <Text style={styles.purchaseShop}>{item.shop}</Text>
              <Text style={styles.purchaseTime}>{item.time}</Text>
            </View>
            <Text style={styles.purchaseAmount}>{item.amount}</Text>
          </View>
        ))}
        <TouchableOpacity onPress={() => navigation.navigate('AllPurchases')}>
          <Text style={styles.moreButton}>Ещё →</Text>
        </TouchableOpacity>
      </View>

      {/* Категории */}
      <Text style={styles.sectionTitle}>Категории</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat, idx) => (
          <View key={idx} style={styles.categoryBox}>
            <Text>{cat}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Акции */}
      <Text style={styles.sectionTitle}>Акции</Text>
    </ScrollView>
  );
};

export default QrScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F9',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  qrBox: {
    backgroundColor: '#EFEFEF',
    padding: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  purchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  purchaseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  purchaseShop: {
    fontSize: 16,
    fontWeight: '600',
  },
  purchaseTime: {
    fontSize: 12,
    color: '#777',
  },
  purchaseAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  moreButton: {
    color: '#007AFF',
    fontSize: 16,
    marginTop: 6,
    textAlign: 'right',
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryBox: {
    backgroundColor: '#FEFEFE',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
