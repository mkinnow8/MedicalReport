import {API_CONFIG} from './apiConfig';
import {makeApiRequest} from './apiService';

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

interface ApiResponse {
  success: boolean;
  message: string;
  data: MedicalConditionResponse[];
}

interface TrackingValue {
  tracking_factor_id: string;
  value: number;
  name: string;
  unit: string;
  created_at: string;
  updated_at: string;
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

interface UserConditionTrackResponse {
  success: boolean;
  message: string;
  data: UserConditionTrack[];
}

export const getMedicalConditions = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(
      API_CONFIG.BASE_URL + API_CONFIG.MEDICAL_CONDITIONS,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching medical conditions:', error);
    throw error;
  }
};

export const getUserConditionTracks =
  async (): Promise<UserConditionTrackResponse> => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.USER_CONDITION_TRACK}/${API_CONFIG.USER_ID}`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user condition tracks:', error);
      throw error;
    }
  };

export const saveTrackingInfo = async (
  medicalConditionId: string,
  trackingFactors: Array<{id: string; value: string}>,
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.TRACKING}/${API_CONFIG.USER_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medical_condition_id: medicalConditionId,
          tracking_factors: trackingFactors.map(factor => ({
            tracking_factor_id: factor.id,
            value: parseFloat(factor.value),
          })),
        }),
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving tracking info:', error);
    throw error;
  }
};

export const deleteTrackerEntry = async (
  medicalConditionId: string,
  combinedTrackingId: string,
) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.USER_CONDITION_TRACK}/${API_CONFIG.USER_ID}/${combinedTrackingId}`,
      {
        method: 'DELETE',
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting tracker entry:', error);
    throw error;
  }
};
