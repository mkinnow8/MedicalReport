import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {getMedicalConditions} from '../services/trackerService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTracker'>;

interface TrackingFactor {
  id: string;
  name: string;
  unit: string;
  normal_range: string;
  is_required: boolean;
  medical_condition_id: string;
}

interface MedicalCondition {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tracking_factors: TrackingFactor[];
}

interface ApiMedicalCondition {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface ApiResponse {
  medical_condition: ApiMedicalCondition;
  tracking_factors: TrackingFactor[];
}

const AddTrackerScreen: React.FC<Props> = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [medicalConditions, setMedicalConditions] = useState<
    MedicalCondition[]
  >([]);

  useEffect(() => {
    fetchMedicalConditions();
  }, []);

  const fetchMedicalConditions = async () => {
    try {
      const response = await getMedicalConditions();
      if (response.success) {
        setMedicalConditions(
          response.data.map((item: ApiResponse) => ({
            id: item.medical_condition.id,
            name: item.medical_condition.name,
            description: item.medical_condition.description,
            image_url: item.medical_condition.image_url,
            tracking_factors: item.tracking_factors,
          })),
        );
      } else {
        Alert.alert('Error', 'Failed to fetch medical conditions');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch medical conditions');
    } finally {
      setLoading(false);
    }
  };

  const getIconName = (conditionName: string): string => {
    switch (conditionName.toLowerCase()) {
      case 'blood pressure':
        return '🫀';
      case 'blood sugar':
        return '🩸';
      case 'obesity':
        return '⚖️';
      case 'temperature':
        return '🌡️';
      case 'heart_rate':
        return '💓';
      default:
        return '🧰';
    }
  };

  const handleTrackerSelect = (condition: MedicalCondition) => {
    navigation.navigate('AddRecord', {
      trackerType: condition.name.toLowerCase().replace(' ', '_'),
      trackerName: condition.name,
      medicalConditionId: condition.id,
      trackingFactors: condition.tracking_factors,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Tracker</Text>
        <Text style={styles.subtitle}>Select a medical condition to track</Text>
      </View>

      <View style={styles.content}>
        {medicalConditions.map(condition => (
          <TouchableOpacity
            key={condition.id}
            style={styles.trackerItem}
            onPress={() => handleTrackerSelect(condition)}>
            <View style={styles.trackerIconContainer}>
              <Image
                source={{uri: condition.image_url}}
                style={styles.trackerIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerName}>{condition.name}</Text>
              <Text style={styles.trackerDescription}>
                {condition.description}
              </Text>
              {condition.tracking_factors.length > 0 && (
                <Text style={styles.trackingFactors}>
                  Tracks:{' '}
                  {condition.tracking_factors.map(f => f.name).join(', ')}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  trackerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackerIconContainer: {
    width: 48,
    height: 48,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerIcon: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
  },
  trackerInfo: {
    flex: 1,
  },
  trackerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  trackerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  trackingFactors: {
    fontSize: 12,
    color: '#999',
  },
});

export default AddTrackerScreen;
