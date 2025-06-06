import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Trackers'>;

const TrackersScreen: React.FC<Props> = ({navigation}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [trackers, setTrackers] = React.useState([
    {
      id: '1',
      name: 'Blood Pressure',
      lastReading: '120/80',
      lastUpdated: '2024-03-14T10:30:00',
      status: 'normal',
    },
    {
      id: '2',
      name: 'Blood Sugar',
      lastReading: '95 mg/dL',
      lastUpdated: '2024-03-14T08:15:00',
      status: 'normal',
    },
    {
      id: '3',
      name: 'Heart Rate',
      lastReading: '72 bpm',
      lastUpdated: '2024-03-14T09:45:00',
      status: 'normal',
    },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Implement actual data fetching
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#4CAF50';
      case 'warning':
        return '#FFC107';
      case 'critical':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const renderTrackerItem = (tracker: any) => (
    <TouchableOpacity
      key={tracker.id}
      style={styles.trackerCard}
      onPress={() => {
        // TODO: Navigate to tracker detail screen
      }}>
      <View style={styles.trackerHeader}>
        <Text style={styles.trackerName}>{tracker.name}</Text>
        <View
          style={[
            styles.statusIndicator,
            {backgroundColor: getStatusColor(tracker.status)},
          ]}
        />
      </View>
      <View style={styles.trackerInfo}>
        <Text style={styles.readingLabel}>Last Reading:</Text>
        <Text style={styles.readingValue}>{tracker.lastReading}</Text>
      </View>
      <Text style={styles.lastUpdated}>
        Last updated: {new Date(tracker.lastUpdated).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

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
      <View style={styles.content}>{trackers.map(renderTrackerItem)}</View>
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
