import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportComparison'>;

interface ComparisonResult {
  comparison_summary: string;
  similarities: string;
  differences: string;
  improvements: string;
  recommendations: string;
}

const ReportComparisonScreen: React.FC<Props> = ({route}) => {
  const {comparison, reportTitles} = route.params;

  if (!comparison?.comparison_result) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const result: ComparisonResult = comparison.comparison_result;

  const renderComparisonSection = (
    title: string,
    content: string | undefined,
  ) => {
    if (!content || content.trim() === '') {
      return null;
    }
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionContent}>{content}</Text>
      </View>
    );
  };

  const hasAnyContent = () => {
    return (
      comparison?.summary?.trim() ||
      comparison?.symptoms?.trim() ||
      comparison?.precautionary_measures?.trim() ||
      comparison?.medications?.trim() ||
      comparison?.vitals?.trim() ||
      comparison?.comparison_summary?.trim()
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Report Comparison</Text>
          <Text style={styles.subtitle}>
            Comparing: {reportTitles.join(' vs ')}
          </Text>
        </View>

        <View style={styles.reportsInfo}>
          <View style={styles.reportCard}>
            <Text style={styles.reportLabel}>Report 1</Text>
            <Text style={styles.reportTitle} numberOfLines={2}>
              {reportTitles[0]}
            </Text>
          </View>
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={styles.reportCard}>
            <Text style={styles.reportLabel}>Report 2</Text>
            <Text style={styles.reportTitle} numberOfLines={2}>
              {reportTitles[1]}
            </Text>
          </View>
        </View>

        <View style={styles.comparisonContainer}>
          {hasAnyContent() ? (
            <>
              {renderComparisonSection('Summary', comparison?.summary)}
              {renderComparisonSection('Symptoms', comparison?.symptoms)}
              {renderComparisonSection(
                'Precautionary Measures',
                comparison?.precautionary_measures,
              )}
              {renderComparisonSection('Medications', comparison?.medications)}
              {renderComparisonSection('Vitals', comparison?.vitals)}
              {renderComparisonSection(
                'Comparison Summary',
                comparison?.comparison_summary,
              )}
            </>
          ) : (
            <Text style={styles.emptyMessage}>No comparison possible</Text>
          )}
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
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  reportsInfo: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    alignItems: 'center',
  },
  reportCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  reportLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  vsContainer: {
    paddingHorizontal: 12,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  content: {
    padding: 16,
  },
  comparisonContainer: {
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default ReportComparisonScreen;
