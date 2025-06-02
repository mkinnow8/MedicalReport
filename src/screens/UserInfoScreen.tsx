import React, {useState} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {FormInput} from '../components/FormInput';
import {GenderSelector} from '../components/GenderSelector';
import {useUser} from '../context/UserContext';
import {logApiRequest, logApiResponse, logApiError} from '../utils/apiLogger';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserInfo'>;

const UserInfoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {setUserInfo} = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    weight: '',
    height: '',
    age: '',
    gender: '',
  });

  const handleSubmit = async () => {
    if (
      !formData.email ||
      !formData.phone ||
      !formData.name ||
      !formData.weight ||
      !formData.height ||
      !formData.age ||
      !formData.gender
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const url =
      'https://mongrel-absolute-mongrel.ngrok-free.app/api/v1/user/info/c9bded98-2233-42ce-9c2b-a353980a7b01';
    const requestBody = {
      name: formData.name,
      age: parseInt(formData.age, 10),
      gender: formData.gender,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
    };

    try {
      logApiRequest('PUT', url, requestBody);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to submit user information');
      }

      const userData = await response.json();
      logApiResponse(url, response, userData);
      setUserInfo(userData);
      navigation.navigate('BMI');
    } catch (error) {
      logApiError(
        url,
        error instanceof Error ? error.message : 'Unknown error',
      );
      Alert.alert(
        'Error',
        'Failed to submit user information. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>User Information</Text>

      <FormInput
        label="Name"
        value={formData.name}
        onChangeText={text => setFormData({...formData, name: text})}
        placeholder="Enter your name"
      />

      <FormInput
        label="Email"
        value={formData.email}
        onChangeText={text => setFormData({...formData, email: text})}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormInput
        label="Phone Number"
        value={formData.phone}
        onChangeText={text => setFormData({...formData, phone: text})}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
      />

      <FormInput
        label="Weight (kg)"
        value={formData.weight}
        onChangeText={text => setFormData({...formData, weight: text})}
        placeholder="Enter your weight"
        keyboardType="numeric"
      />

      <FormInput
        label="Height (cm)"
        value={formData.height}
        onChangeText={text => setFormData({...formData, height: text})}
        placeholder="Enter your height"
        keyboardType="numeric"
      />

      <FormInput
        label="Age"
        value={formData.age}
        onChangeText={text => setFormData({...formData, age: text})}
        placeholder="Enter your age"
        keyboardType="numeric"
      />

      <GenderSelector
        value={formData.gender}
        onChange={gender => setFormData({...formData, gender})}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserInfoScreen;
