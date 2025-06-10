import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {
  getUserConditionTracks,
  deleteTrackerEntry,
} from '../services/trackerService';
// @ts-ignore

type Props = NativeStackScreenProps<RootStackParamList, 'TrackerHistory'>;

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

const TrackerHistoryScreen: React.FC<Props> = ({route}) => {
  const {trackingId, conditionName} = route.params;
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
        Alert.alert('Error', 'Failed to fetch tracking history');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch tracking history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (combinedTrackingId: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await deleteTrackerEntry(
              trackingId,
              combinedTrackingId,
            );
            if (response.success) {
              // Refresh the tracks after successful deletion
              fetchTracks();
            } else {
              Alert.alert('Error', 'Failed to delete entry');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete entry');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const track = tracks.find(t => t.medical_condition_id === trackingId);
  if (!track) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No tracking history found</Text>
      </View>
    );
  }

  // Group entries by date
  const groupedEntries = track.condition_values.reduce((groups, entry) => {
    const date = new Date(entry.values[0]?.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, CombinedTracking[]>);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{conditionName}</Text>
        <Text style={styles.subtitle}>Tracking History</Text>
      </View>

      <View style={styles.content}>
        {Object.entries(groupedEntries).map(([date, entries]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>
            {entries.map(entry => (
              <View key={entry.combined_tracking_id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.timeContainer}>
                    {/* <Icon name="clock-outline" size={16} color="#666" /> */}
                    <Text style={styles.timeText}>
                      {new Date(
                        entry.values[0]?.created_at,
                      ).toLocaleTimeString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(entry.combined_tracking_id)}
                    style={styles.deleteButton}>
                    <Image
                      source={require('../assets/images/deleteIcon.png')}
                      style={styles.deleteIcon}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.readingsContainer}>
                  {entry.values.map(value => (
                    <View key={value.tracking_factor_id} style={styles.reading}>
                      <Text style={styles.readingName}>{value.name}</Text>
                      <Text style={styles.readingValue}>
                        {value.value} {value.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
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
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  readingsContainer: {
    gap: 8,
  },
  reading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  readingName: {
    fontSize: 14,
    color: '#333',
  },
  readingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default TrackerHistoryScreen;
