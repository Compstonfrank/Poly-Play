import React from 'react';
import { createStackNavigator } from 'react-navigation';
import HomeScreen from '../screens/HomeScreen';

export default (HomeStack = createStackNavigator(
  {
    Home: HomeScreen
  },
  { headerMode: 'none' }
));
