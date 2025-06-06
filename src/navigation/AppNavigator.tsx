import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import UserInfoScreen from '../screens/UserInfoScreen';
import BMIScreen from '../screens/BMIScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import PDFPreviewScreen from '../screens/PDFPreviewScreen';
import ReportComparisonScreen from '../screens/ReportComparisonScreen';
import TrackersScreen from '../screens/TrackersScreen';
import AddTrackerScreen from '../screens/AddTrackerScreen';
import AddRecordScreen from '../screens/AddRecordScreen';

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
        options={{title: 'Report Comparison'}}
      />
      <Stack.Screen
        name="Trackers"
        component={TrackersScreen}
        options={{title: 'Health Trackers'}}
      />
      <Stack.Screen
        name="AddTracker"
        component={AddTrackerScreen}
        options={{title: 'Add New Tracker'}}
      />
      <Stack.Screen
        name="AddRecord"
        component={AddRecordScreen}
        options={{title: 'Add Record'}}
      />
    </Stack.Navigator>
  );
};
