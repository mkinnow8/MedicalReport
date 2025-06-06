import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardTypeOptions,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddRecord'>;

interface InputField {
  id: string;
  label: string;
  placeholder: string;
  keyboardType: KeyboardTypeOptions;
}

const AddRecordScreen: React.FC<Props> = ({route, navigation}) => {
  const {trackerType, trackerName} = route.params;
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const getInputFields = (): InputField[] => {
    switch (trackerType) {
      case 'blood_pressure':
        return [
          {
            id: 'systolic',
            label: 'Systolic (mmHg)',
            placeholder: 'Enter systolic pressure',
            keyboardType: 'numeric',
          },
          {
            id: 'diastolic',
            label: 'Diastolic (mmHg)',
            placeholder: 'Enter diastolic pressure',
            keyboardType: 'numeric',
          },
          {
            id: 'pulse',
            label: 'Pulse Rate (bpm)',
            placeholder: 'Enter pulse rate',
            keyboardType: 'numeric',
          },
        ];
      case 'blood_sugar':
        return [
          {
            id: 'glucose',
            label: 'Blood Glucose (mg/dL)',
            placeholder: 'Enter blood glucose level',
            keyboardType: 'numeric',
          },
          {
            id: 'time',
            label: 'Time of Reading',
            placeholder: 'e.g., Before breakfast',
            keyboardType: 'default',
          },
        ];
      case 'heart_rate':
        return [
          {
            id: 'rate',
            label: 'Heart Rate (bpm)',
            placeholder: 'Enter heart rate',
            keyboardType: 'numeric',
          },
        ];
      case 'weight':
        return [
          {
            id: 'weight',
            label: 'Weight (kg)',
            placeholder: 'Enter weight',
            keyboardType: 'numeric',
          },
        ];
      case 'temperature':
        return [
          {
            id: 'temperature',
            label: 'Temperature (°C)',
            placeholder: 'Enter temperature',
            keyboardType: 'numeric',
          },
        ];
      default:
        return [];
    }
  };

  const handleSave = () => {
    // Validate inputs
    const inputFields = getInputFields();
    const missingFields = inputFields.filter(field => !values[field.id]);

    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // TODO: Save the record to the database
    console.log('Saving record:', {
      type: trackerType,
      values,
      notes,
      timestamp: new Date().toISOString(),
    });

    // Navigate back to trackers screen
    navigation.navigate('Trackers');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add {trackerName} Record</Text>
        <Text style={styles.subtitle}>
          Enter your {trackerName.toLowerCase()} reading
        </Text>
      </View>

      <View style={styles.content}>
        {getInputFields().map(field => (
          <View key={field.id} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{field.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              keyboardType={field.keyboardType}
              value={values[field.id]}
              onChangeText={text => setValues({...values, [field.id]: text})}
            />
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Record</Text>
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddRecordScreen;
