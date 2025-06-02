import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {calculateBMI, getBMICategory} from '../utils/bmiCalculator';
import {ReportTab} from '../components/ReportTab';
import {Images} from '../assets/images';
import {useUser} from '../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'BMI'>;

const BMIScreen: React.FC<Props> = ({navigation}) => {
  const {userInfo} = useUser();
  const [isLoading, setIsLoading] = useState(true);
  console.log('USER INFO:', userInfo);
  useEffect(() => {
    console.log('BMIScreen - userInfo updated:', userInfo);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [userInfo]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user information available</Text>
      </View>
    );
  }

  // Validate user data
  if (
    !userInfo?.data?.weight ||
    !userInfo?.data?.height ||
    isNaN(userInfo?.data?.weight) ||
    isNaN(userInfo?.data?.height) ||
    userInfo?.data?.weight <= 0 ||
    userInfo?.data?.height <= 0
  ) {
    console.error('Invalid user data:', userInfo);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Invalid user data. Please check your information.
        </Text>
      </View>
    );
  }

  const bmi = calculateBMI(userInfo?.data?.weight, userInfo?.data?.height);
  console.log('BMIScreen - BMI calculated:', {
    bmi,
    weight: userInfo?.data?.weight,
    height: userInfo?.data?.height,
  });

  const bmiCategory = getBMICategory(bmi);

  const getBMIColor = (bmi: number) => {
    if (isNaN(bmi) || bmi <= 0) return '#666'; // Gray for invalid BMI
    if (bmi < 18.5) return '#FFA500'; // Orange for underweight
    if (bmi < 25) return '#4CAF50'; // Green for normal
    if (bmi < 30) return '#FFC107'; // Yellow for overweight
    return '#F44336'; // Red for obese
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.bmiBarContainer}>
        <View style={styles.bmiBar}>
          <View
            style={[
              styles.bmiIndicator,
              {
                left: `${Math.min(Math.max((bmi - 10) * 5, 0), 100)}%`,
                backgroundColor: getBMIColor(bmi),
              },
            ]}
          />
        </View>
        <View style={styles.bmiLabels}>
          <Text style={styles.bmiLabel}>Underweight</Text>
          <Text style={styles.bmiLabel}>Normal</Text>
          <Text style={styles.bmiLabel}>Overweight</Text>
          <Text style={styles.bmiLabel}>Obese</Text>
        </View>
      </View>

      <View style={styles.bmiResultContainer}>
        <View style={styles.bmiValueContainer}>
          <Text style={styles.bmiLabel}>BMI</Text>
          <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
        </View>
        <Text style={styles.bmiCategory}>{bmiCategory}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Name: {userInfo?.data?.name}</Text>
        <Text style={styles.infoText}>Age: {userInfo?.data?.age}</Text>
        <Text style={styles.infoText}>Gender: {userInfo?.data?.gender}</Text>
        <Text style={styles.infoText}>Weight: {userInfo?.data?.weight} kg</Text>
        <Text style={styles.infoText}>Height: {userInfo?.data?.height} cm</Text>
      </View>

      <ReportTab
        icon={Images.report}
        title="Reports"
        description="View your detailed health reports and history"
        onPress={() => navigation.navigate('Reports')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 20,
  },
  bmiBarContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  bmiBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    position: 'relative',
  },
  bmiIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -4,
    transform: [{translateX: -8}],
  },
  bmiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bmiLabel: {
    fontSize: 12,
    color: '#666',
  },
  bmiResultContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 1,
  },
  bmiValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 8,
  },
  bmiCategory: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 1,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
});

export default BMIScreen;
