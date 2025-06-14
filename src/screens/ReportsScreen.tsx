import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {FloatingActionButton} from '../components/FloatingActionButton';
import DocumentPicker from 'react-native-document-picker';
import {
  uploadDocument,
  prepareDocumentUpload,
  deleteReport,
  compareReports,
} from '../services/documentService';
import {useReports} from '../context/ReportsContext';
import {useFocusEffect} from '@react-navigation/native';
import {API_CONFIG} from '../services/apiConfig';
import {Images} from '../assets/images';
import {launchCamera} from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

const ReportsScreen: React.FC<Props> = ({navigation}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [capturedImages, setCapturedImages] = useState<Array<{uri: string}>>(
    [],
  );
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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
        mode: 'open',
      });

      const file = result[0];
      if (file.type === 'application/pdf') {
        navigation.navigate('PDFPreview', prepareDocumentUpload(file));
      } else {
        setIsLoading(true);
        try {
          const uploadedReport = await uploadDocument(file);
          await fetchReports();
          if (uploadedReport) {
            navigation.navigate('ReportDetail', {report: uploadedReport});
          }
        } catch (err) {
          if (!DocumentPicker.isCancel(err)) {
            Alert.alert('Error', 'Failed to upload document');
          }
        } finally {
          setIsLoading(false);
          setIsModalVisible(false);
        }
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to upload document');
      }
    } finally {
      setIsModalVisible(false);
    }
  };

  const handleCameraPress = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1280,
        maxHeight: 1280,
        saveToPhotos: true,
      });
      console.log('Result:', result);
      if (result.assets && result.assets.length > 0) {
        const newImage = {uri: result.assets[0].uri!};
        setCapturedImages(prev => [...prev, newImage]);
        setIsPreviewModalVisible(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to capture image');
    }
    setIsModalVisible(false);
  };

  const handleAddMoreImages = () => {
    setIsPreviewModalVisible(false);
    handleCameraPress();
  };

  const handleUploadImages = async () => {
    if (capturedImages.length === 0) {
      Alert.alert('Error', 'No images to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();

      // Append each image to the form data
      capturedImages.forEach((image, index) => {
        formData.append('reports', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        });
      });
      console.log('Form data:', formData);
      const response = await fetch(
        API_CONFIG.BASE_URL + API_CONFIG.UPLOAD_REPORT + API_CONFIG.USER_ID,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Upload failed:', errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      // Fetch the updated reports list
      await fetchReports();

      // Navigate to the newly uploaded report
      if (data.data) {
        navigation.navigate('ReportDetail', {report: data.data});
      }

      setCapturedImages([]);
      setIsPreviewModalVisible(false);
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Error', 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClosePreview = () => {
    setCapturedImages([]);
    setIsPreviewModalVisible(false);
  };

  const handleDeleteImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteReport = async (reportId: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteReport(reportId);
              fetchReports(); // Refresh the list after deletion
            } catch (err) {
              Alert.alert('Error', 'Failed to delete report');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleComparePress = () => {
    setIsCompareMode(!isCompareMode);
    setSelectedReports([]);
  };

  const handleReportSelect = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    } else if (selectedReports.length < 2) {
      setSelectedReports(prev => [...prev, reportId]);
    }
  };

  const handleCompareReports = async () => {
    if (selectedReports.length !== 2) {
      Alert.alert('Error', 'Please select exactly two reports to compare');
      return;
    }

    try {
      setIsLoading(true);
      const comparisonResult = await compareReports(selectedReports);
      const selectedReportDetails = reportsData?.reports.filter(report =>
        selectedReports.includes(report.report_id),
      );
      navigation.navigate('ReportComparison', {
        comparison: comparisonResult,
        reportTitles: selectedReportDetails?.map(report => report.title) || [],
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to compare reports');
    } finally {
      setIsLoading(false);
      setIsCompareMode(false);
      setSelectedReports([]);
    }
  };

  const renderOptionButton = (
    imageSource: any,
    title: string,
    onPress: () => void,
  ) => (
    <TouchableOpacity style={styles.optionButton} onPress={onPress}>
      <Image source={imageSource} style={styles.optionIcon} />
      <Text style={styles.optionText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderReportItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={[
        styles.reportItem,
        isCompareMode &&
          selectedReports.includes(item.report_id) &&
          styles.selectedReport,
      ]}
      onPress={() => {
        if (isCompareMode) {
          handleReportSelect(item.report_id);
        } else {
          navigation.navigate('ReportDetail', {report: item});
        }
      }}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle} numberOfLines={2}>
          {item?.title}
        </Text>
        <View style={styles.reportActions}>
          <Text style={styles.reportDate}>
            {new Date(item.updated_at).toLocaleString()}
          </Text>
        </View>
      </View>
      <View style={styles.reportActions}>
        <Text style={styles.reportDescription} numberOfLines={3}>
          {item.report_description.summary}
        </Text>
        {!isCompareMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteReport(item.report_id)}>
            <Image source={Images.deleteIcon} style={styles.reportDeleteIcon} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderImagePreview = () => (
    <Modal
      visible={isPreviewModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClosePreview}>
      <View style={styles.previewModalOverlay}>
        <View style={styles.previewModalContent}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Image Preview</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClosePreview}>
              <Image source={Images.close} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.previewScrollView}>
            {capturedImages.map((image, index) => (
              <View key={index} style={styles.previewImageContainer}>
                <Image source={{uri: image.uri}} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.deleteImageButton}
                  onPress={() => handleDeleteImage(index)}>
                  <Image source={Images.close} style={styles.deleteIcon} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.previewButton, styles.addMoreButton]}
              onPress={handleAddMoreImages}
              disabled={isUploading}>
              <Text style={styles.previewButtonText}>Add More</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewButton, styles.uploadButton]}
              onPress={handleUploadImages}
              disabled={isUploading}>
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.previewButtonText}>Upload</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
      <View style={styles.header}>
        <Text style={styles.title}>Your Reports</Text>
        <TouchableOpacity
          style={[
            styles.compareButton,
            isCompareMode && styles.compareButtonActive,
          ]}
          onPress={handleComparePress}>
          <Text style={styles.compareButtonText}>
            {isCompareMode ? 'Cancel' : 'Compare'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={reportsData?.reports}
        renderItem={renderReportItem}
        keyExtractor={item => item.report_id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={fetchReports} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>No reports available</Text>
          ) : null
        }
      />
      {isCompareMode && selectedReports.length === 2 && (
        <TouchableOpacity
          style={styles.compareActionButton}
          onPress={handleCompareReports}>
          <Text style={styles.compareActionButtonText}>
            Compare Selected Reports
          </Text>
        </TouchableOpacity>
      )}
      {!isCompareMode && (
        <FloatingActionButton onPress={() => setIsModalVisible(true)} />
      )}
      {isLoading && !isPreviewModalVisible && !isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Report</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}>
                <Image source={Images.close} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsContainer}>
              {renderOptionButton(
                Images.report,
                'Pick Document',
                handleDocumentPick,
              )}
              {renderOptionButton(
                Images.camera,
                'Take Photo',
                handleCameraPress,
              )}
            </View>
          </View>
        </View>
      </Modal>
      {renderImagePreview()}
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: '50%',
    marginRight: 6,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    width: '90%',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  optionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    width: '45%',
  },
  optionText: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
  },
  optionIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  closeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  previewModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  previewScrollView: {
    maxHeight: '70%',
  },
  previewImageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  previewButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  addMoreButton: {
    backgroundColor: '#f0f0f0',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 8,
  },
  deleteIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderwidth: 1,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  reportDeleteIcon: {
    width: 20,
    height: 20,
    tintColor: '#FF3B30',
    resizeMode: 'contain',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  compareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  compareButtonActive: {
    backgroundColor: '#FF3B30',
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedReport: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  compareActionButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  compareActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportsScreen;
