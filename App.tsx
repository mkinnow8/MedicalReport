/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/AppNavigator';
import {UserProvider} from './src/context/UserContext';
import {ReportsProvider} from './src/context/ReportsContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ReportsProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ReportsProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
};

export default App;
