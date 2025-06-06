import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTracker'>;

const TRACKER_TYPES = [
  {
    id: 'blood_pressure',
    name: 'Blood Pressure',
    description: 'Track your systolic and diastolic blood pressure readings',
    icon: '🫀',
  },
  {
    id: 'blood_sugar',
    name: 'Blood Sugar',
    description: 'Monitor your blood glucose levels',
    icon: '🩸',
  },
  {
    id: 'heart_rate',
    name: 'Heart Rate',
    description: 'Track your heart rate and pulse',
    icon: '💓',
  },
  {
    id: 'weight',
    name: 'Weight',
    description: 'Monitor your body weight',
    icon: '⚖️',
  },
  {
    id: 'temperature',
    name: 'Temperature',
    description: 'Track your body temperature',
    icon: '🌡️',
  },
];

const AddTrackerScreen: React.FC<Props> = ({navigation}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelectTracker = (typeId: string) => {
    setSelectedType(typeId);
    const selectedTracker = TRACKER_TYPES.find(type => type.id === typeId);
    if (selectedTracker) {
      navigation.navigate('AddRecord', {
        trackerType: typeId,
        trackerName: selectedTracker.name,
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Tracker</Text>
        <Text style={styles.subtitle}>
          Select the type of health metric you want to track
        </Text>
      </View>

      <View style={styles.content}>
        {TRACKER_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.trackerTypeCard,
              selectedType === type.id && styles.selectedCard,
            ]}
            onPress={() => handleSelectTracker(type.id)}>
            <Text style={styles.trackerIcon}>{type.icon}</Text>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerName}>{type.name}</Text>
              <Text style={styles.trackerDescription}>{type.description}</Text>
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
  trackerTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
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
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  trackerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  trackerInfo: {
    flex: 1,
  },
  trackerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  trackerDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default AddTrackerScreen;
