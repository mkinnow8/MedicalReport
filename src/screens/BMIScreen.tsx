import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {calculateBMI, getBMICategory} from '../utils/bmiCalculator';
import {Tab} from '../components/Tab';
import {Images} from '../assets/images';
import {getUserConditionTracks} from '../services/trackerService';
import {getUserInfo} from '../services/userService';
import {useMedicalConditions} from '../context/MedicalConditionsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'BMI'>;

interface TrackingValue {
  tracking_factor_id: string;
  value: number;
  name: string;
  created_at: string;
  updated_at: string;
  unit: string;
}

interface CombinedTracking {
  combined_tracking_id: string;
  values: TrackingValue[];
}

interface UserConditionTrack {
  medical_condition_id: string;
  medical_condition_name: string;
  medical_condition_description: string;
  condition_values: CombinedTracking[];
}

interface UserInfo {
  id: string;
  name: string;
  height: number;
  weight: number;
  gender: string;
  age: number;
}

const BMIScreen: React.FC<Props> = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<UserConditionTrack[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const {conditions, loading: conditionsLoading} = useMedicalConditions();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tracksResponse, userInfoResponse] = await Promise.all([
        getUserConditionTracks(),
        getUserInfo(),
      ]);

      if (tracksResponse.success) {
        setTracks(tracksResponse.data);
      } else {
        Alert.alert('Error', 'Failed to fetch tracking data');
      }

      if (userInfoResponse.success) {
        setUserInfo(userInfoResponse.data);
      } else {
        Alert.alert('Error', 'Failed to fetch user information');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getBloodPressureTrack = () => {
    return tracks.find(track =>
      track.medical_condition_name.toLowerCase().includes('blood pressure'),
    );
  };

  const getBloodSugarTrack = () => {
    return tracks.find(
      track =>
        track.medical_condition_name.toLowerCase().includes('blood sugar') ||
        track.medical_condition_name.toLowerCase().includes('glucose'),
    );
  };

  const formatReading = (values: TrackingValue[]) => {
    if (values.length === 0) return 'No readings';

    // For blood pressure, combine systolic and diastolic
    const systolic = values.find(v =>
      v.name.toLowerCase().includes('systolic'),
    );
    const diastolic = values.find(v =>
      v.name.toLowerCase().includes('diastolic'),
    );
    if (systolic && diastolic) {
      return `${systolic.value}/${diastolic.value} ${systolic.unit}`;
    }

    // For single value readings
    return `${values[0].value} ${values[0].unit}`;
  };

  const getStatusColor = (_values: TrackingValue[]) => {
    // TODO: Implement proper status logic based on values and normal ranges
    return '#4CAF50'; // Default to normal for now
  };

  const renderTrackerCard = (
    title: string,
    track: UserConditionTrack | undefined,
    onPress: () => void,
  ) => {
    const latestReadings = track?.condition_values[0]?.values || [];
    const latestTimestamp = latestReadings[0]?.created_at;

    return (
      <TouchableOpacity style={styles.trackerCard} onPress={onPress}>
        <View style={styles.trackerHeader}>
          <Text style={styles.trackerName}>{title}</Text>
          <View
            style={[
              styles.statusIndicator,
              {backgroundColor: getStatusColor(latestReadings)},
            ]}
          />
        </View>
        <View style={styles.trackerInfo}>
          <Text style={styles.readingLabel}>Last Reading:</Text>
          <Text style={styles.readingValue}>
            {formatReading(latestReadings)}
          </Text>
        </View>
        <Text style={styles.lastUpdated}>
          Last updated:{' '}
          {latestTimestamp
            ? new Date(latestTimestamp).toLocaleString()
            : 'Never'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading || conditionsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const bloodPressureTrack = getBloodPressureTrack();
  const bloodSugarTrack = getBloodSugarTrack();

  // Calculate BMI using the user info from API
  const bmi = userInfo ? calculateBMI(userInfo.weight, userInfo.height) : 0;
  const bmiCategory = getBMICategory(bmi);

  const handleAddTracker = (conditionName: string) => {
    const condition = conditions.find(
      c =>
        c.medical_condition.name.toLowerCase() === conditionName.toLowerCase(),
    );
    if (condition) {
      navigation.navigate('AddRecord', {
        trackerType: condition.medical_condition.name
          .toLowerCase()
          .replace(' ', '_'),
        trackerName: condition.medical_condition.name,
        medicalConditionId: condition.medical_condition.id,
        trackingFactors: condition.tracking_factors,
      });
    } else {
      navigation.navigate('AddTracker');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BMI Calculator</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.bmiCard}>
          <Text style={styles.bmiTitle}>Your BMI</Text>
          <Text style={styles.bmiValue}>{bmi > 0 ? bmi.toFixed(1) : '--'}</Text>
          <Text style={styles.bmiCategory}>{bmiCategory}</Text>
        </View>

        {userInfo && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Name: {userInfo.name}</Text>
            <Text style={styles.infoText}>Age: {userInfo.age}</Text>
            <Text style={styles.infoText}>Gender: {userInfo.gender}</Text>
            <Text style={styles.infoText}>Weight: {userInfo.weight} kg</Text>
            <Text style={styles.infoText}>Height: {userInfo.height} cm</Text>
          </View>
        )}

        <Tab
          icon={Images.report}
          title="Reports"
          description="View your detailed health reports and history"
          onPress={() => navigation.navigate('Reports')}
        />
        <Tab
          icon={Images.report}
          title="Trackers"
          description="View your trackers and history"
          onPress={() => navigation.navigate('Trackers')}
        />
        <View style={styles.trackersSection}>
          <Text style={styles.sectionTitle}>Health Trackers</Text>
          {renderTrackerCard('Blood Pressure', bloodPressureTrack, () => {
            if (bloodPressureTrack) {
              navigation.navigate('TrackerHistory', {
                trackingId: bloodPressureTrack.medical_condition_id,
                conditionName: bloodPressureTrack.medical_condition_name,
              });
            } else {
              handleAddTracker('blood pressure');
            }
          })}
          {renderTrackerCard('Blood Sugar', bloodSugarTrack, () => {
            if (bloodSugarTrack) {
              navigation.navigate('TrackerHistory', {
                trackingId: bloodSugarTrack.medical_condition_id,
                conditionName: bloodSugarTrack.medical_condition_name,
              });
            } else {
              handleAddTracker('blood sugar');
            }
          })}
        </View>
      </View>
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
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  bmiCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bmiTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bmiCategory: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  trackersSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  trackerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  trackerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  readingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
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
