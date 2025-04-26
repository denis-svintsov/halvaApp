import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import QrScreen from './screens/QrScreen';
import AllPurchases from './screens/AllPurchases';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // убираем заголовок сверху
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} /> 
        <Stack.Screen name="QrScreen" component={QrScreen} />
        <Stack.Screen name="AllPurchases" component={AllPurchases} />
        <Stack.Screen name="Admin" component={AllPurchases} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
