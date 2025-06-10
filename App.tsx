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
import {MedicalConditionsProvider} from './src/context/MedicalConditionsContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ReportsProvider>
          <MedicalConditionsProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </MedicalConditionsProvider>
        </ReportsProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
};

export default App;
