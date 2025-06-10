import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {getUserConditionTracks} from '../services/trackerService';

type Props = NativeStackScreenProps<RootStackParamList, 'Trackers'>;

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

const TrackersScreen: React.FC<Props> = ({navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<UserConditionTrack[]>([]);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const response = await getUserConditionTracks();
      if (response.success) {
        setTracks(response.data);
      } else {
        Alert.alert('Error', 'Failed to fetch tracking data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch tracking data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTracks();
  };

  const getStatusColor = (_values: TrackingValue[]) => {
    // TODO: Implement proper status logic based on values and normal ranges
    return '#4CAF50'; // Default to normal for now
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

  const renderTrackerItem = (track: UserConditionTrack) => {
    const latestReadings = track.condition_values[0]?.values || [];
    const latestTimestamp = latestReadings[0]?.created_at;

    return (
      <TouchableOpacity
        key={track.medical_condition_id}
        style={styles.trackerCard}
        onPress={() => {
          navigation.navigate('TrackerHistory', {
            trackingId: track.medical_condition_id,
            conditionName: track.medical_condition_name,
          });
        }}>
        <View style={styles.trackerHeader}>
          <Text style={styles.trackerName}>{track.medical_condition_name}</Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.title}>Active Trackers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTracker')}>
          <Text style={styles.addButtonText}>Add Tracker</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>{tracks.map(renderTrackerItem)}</View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
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
});

export default TrackersScreen;
