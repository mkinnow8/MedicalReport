import React, {createContext, useContext, useState, useEffect} from 'react';
import {getMedicalConditions} from '../services/trackerService';
import {Alert} from 'react-native';

interface TrackingFactor {
  id: string;
  description: string;
  normal_range: string;
  created_at: string;
  name: string;
  medical_condition_id: string;
  unit: string;
  is_required: boolean;
  updated_at: string;
}

interface MedicalCondition {
  id: string;
  created_at: string;
  description: string;
  name: string;
  updated_at: string;
}

interface MedicalConditionResponse {
  medical_condition: MedicalCondition;
  tracking_factors: TrackingFactor[];
}

interface MedicalConditionsContextType {
  conditions: MedicalConditionResponse[];
  loading: boolean;
  error: string | null;
  refreshConditions: () => Promise<void>;
}

const MedicalConditionsContext = createContext<
  MedicalConditionsContextType | undefined
>(undefined);

export const MedicalConditionsProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const [conditions, setConditions] = useState<MedicalConditionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConditions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMedicalConditions();
      if (response.success) {
        setConditions(response.data);
      } else {
        setError('Failed to fetch medical conditions');
        Alert.alert('Error', 'Failed to fetch medical conditions');
      }
    } catch (error) {
      setError('Failed to fetch medical conditions');
      Alert.alert('Error', 'Failed to fetch medical conditions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  return (
    <MedicalConditionsContext.Provider
      value={{
        conditions,
        loading,
        error,
        refreshConditions: fetchConditions,
      }}>
      {children}
    </MedicalConditionsContext.Provider>
  );
};

export const useMedicalConditions = () => {
  const context = useContext(MedicalConditionsContext);
  if (context === undefined) {
    throw new Error(
      'useMedicalConditions must be used within a MedicalConditionsProvider',
    );
  }
  return context;
};
