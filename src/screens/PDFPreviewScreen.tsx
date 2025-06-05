import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';

type Props = NativeStackScreenProps<RootStackParamList, 'PDFPreview'>;

const PDFPreviewScreen: React.FC<Props> = ({route, navigation}) => {
  const {uri, onConfirm} = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('ONCONFIRM', onConfirm);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        if (!uri) {
          throw new Error('No URI provided');
        }

        console.log('Original URI:', uri);
        let fileUri = uri;
        let tempFilePath = '';

        // Convert content:// URI to file:// URI on Android
        if (Platform.OS === 'android' && uri.startsWith('content://')) {
          console.log('Converting content:// URI to file:// URI');
          tempFilePath = `${RNFS.CachesDirectoryPath}/temp_${Date.now()}.pdf`;
          console.log('Temp file path:', tempFilePath);

          try {
            await RNFS.copyFile(uri, tempFilePath);
            fileUri = `file://${tempFilePath}`; // Add file:// prefix for PDF viewer
            console.log('Converted file URI:', fileUri);
          } catch (copyError) {
            console.error('Error copying file:', copyError);
            throw new Error('Failed to copy PDF file');
          }
        }

        // Verify file exists
        const exists = await RNFS.exists(fileUri.replace('file://', ''));
        if (!exists) {
          console.error('File does not exist at path:', fileUri);
          throw new Error('PDF file not found');
        }

        setPdfUri(fileUri);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load PDF file',
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [uri]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const uploadedReport = await onConfirm();
      if (uploadedReport) {
        // Reset the navigation stack and navigate to report detail
        navigation.reset({
          index: 0,
          routes: [
            {name: 'Reports'},
            {name: 'ReportDetail', params: {report: uploadedReport}},
          ],
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!pdfUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No PDF data available</Text>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Preview Document</Text>
      </View> */}

      <View style={styles.pdfContainer}>
        <Pdf
          source={{uri: pdfUri}}
          style={styles.pdf}
          onLoadComplete={(_numberOfPages, _filePath) => {
            console.log(`Number of pages: ${_numberOfPages}`);
          }}
          onPageChanged={(page, _numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={error => {
            console.error('PDF Error:', error);
            setError('Failed to load PDF');
          }}
          enablePaging={true}
          horizontal={false}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={handleConfirm}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Upload Document</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: 'grey',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 20,
    padding: 20,
  },
});

export default PDFPreviewScreen;
