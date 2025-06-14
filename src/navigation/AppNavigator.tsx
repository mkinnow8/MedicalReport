import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import UserInfoScreen from '../screens/UserInfoScreen';
import BMIScreen from '../screens/BMIScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import PDFPreviewScreen from '../screens/PDFPreviewScreen';
import ReportComparisonScreen from '../screens/ReportComparisonScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="UserInfo"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="UserInfo"
        component={UserInfoScreen}
        options={{title: 'User Information'}}
      />
      <Stack.Screen
        name="BMI"
        component={BMIScreen}
        options={{title: 'Home'}}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{title: 'Health Reports'}}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{title: 'Report Detail'}}
      />
      <Stack.Screen
        name="PDFPreview"
        component={PDFPreviewScreen}
        options={{title: 'Preview Document'}}
      />
      <Stack.Screen
        name="ReportComparison"
        component={ReportComparisonScreen}
      />
    </Stack.Navigator>
  );
};
