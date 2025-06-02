import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {FloatingActionButton} from '../components/FloatingActionButton';
import DocumentPicker from 'react-native-document-picker';
import {
  uploadDocument,
  prepareDocumentUpload,
} from '../services/documentService';
import {useReports} from '../context/ReportsContext';
import {useFocusEffect} from '@react-navigation/native';
import {API_CONFIG} from '../services/apiConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

const ReportsScreen: React.FC<Props> = ({navigation}) => {
  const {
    reportsData,
    setReportsData,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useReports();

  const fetchReports = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        API_CONFIG.BASE_URL +
          API_CONFIG.GET_REPORTS +
          'c9bded98-2233-42ce-9c2b-a353980a7b01',
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      console.log(data);
      setReportsData(data?.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      Alert.alert('Error', 'Failed to fetch reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setReportsData]);

  // Fetch reports on initial mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Fetch reports when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchReports();
    }, [fetchReports]),
  );

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
        mode: 'open', // ✅ Required for ACTION_OPEN_DOCUMENT style URI access
      });

      const file = result[0];
      if (file.type === 'application/pdf') {
        navigation.navigate('PDFPreview', prepareDocumentUpload(file));
      } else {
        setIsLoading(true);
        await uploadDocument(file);
        fetchReports();
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to upload document');
      }
    } finally {
      setIsLoading(false);
    }
  };
  console.log('REPORTS DATA', reportsData?.reports);

  const renderReportItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => navigation.navigate('ReportDetail', {report: item})}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{item?.title}</Text>
        <Text style={styles.reportDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.reportDescription} numberOfLines={3}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Reports</Text>
      <FlatList
        data={reportsData?.reports}
        renderItem={renderReportItem}
        keyExtractor={item => item.report_id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchReports} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>No reports available</Text>
          ) : null
        }
      />
      <FloatingActionButton onPress={handleDocumentPick} />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  reportItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ReportsScreen;
