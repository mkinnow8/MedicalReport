import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardTypeOptions,
  ActivityIndicator,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {saveTrackingInfo, updateTrackingInfo} from '../services/trackerService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddRecord'>;

interface InputField {
  id: string;
  label: string;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
  unit: string;
  normalRange: string;
  isRequired: boolean;
}

const AddRecordScreen: React.FC<Props> = ({route, navigation}) => {
  const {trackerName, trackingFactors, isEditing, combinedTrackingId} =
    route.params;
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && trackingFactors) {
      const initialValues: Record<string, string> = {};
      trackingFactors.forEach(factor => {
        initialValues[factor.id] = factor.value;
      });
      setValues(initialValues);
    }
  }, [isEditing, trackingFactors]);

  const getInputFields = (): InputField[] => {
    return trackingFactors.map(factor => ({
      id: factor.id,
      label: `${factor.name} (${
        factor.unit ? factor.unit : factor?.normal_range
      })`,
      placeholder: `Enter ${factor.name.toLowerCase()}`,
      keyboardType: 'numeric',
      unit: factor.unit,
      normalRange: factor.normal_range,
      isRequired: factor.is_required,
    }));
  };

  const handleSave = async () => {
    // Validate inputs
    const inputFields = getInputFields();
    const missingFields = inputFields.filter(
      field => field.isRequired && !values[field.id],
    );

    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const trackingData = Object.entries(values).map(([id, value]) => ({
        id,
        value,
      }));
      const response = isEditing
        ? await updateTrackingInfo(
            route.params.medicalConditionId,
            combinedTrackingId!,
            trackingData,
          )
        : await saveTrackingInfo(route.params.medicalConditionId, trackingData);

      if (response.success) {
        Alert.alert(
          'Success',
          `Record ${isEditing ? 'updated' : 'saved'} successfully`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Trackers'),
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          response.message ||
            `Failed to ${isEditing ? 'update' : 'save'} record`,
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to ${isEditing ? 'update' : 'save'} record. Please try again.`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? 'Edit' : 'Add'} {trackerName} Record
        </Text>
        <Text style={styles.subtitle}>
          {isEditing ? 'Update' : 'Enter'} your {trackerName.toLowerCase()}{' '}
          reading
        </Text>
      </View>

      <View style={styles.content}>
        {getInputFields().map(field => (
          <View key={field.id} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {field.label}
              {field.isRequired && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              keyboardType={field.keyboardType}
              value={values[field.id]}
              onChangeText={text => setValues({...values, [field.id]: text})}
            />
            {field.normalRange && (
              <Text style={styles.normalRange}>
                Normal range: {field.normalRange} {field.unit}
              </Text>
            )}
          </View>
        ))}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add any additional notes"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update' : 'Save'} Record
            </Text>
          )}
        </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  normalRange: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddRecordScreen;
