import {API_CONFIG} from './apiConfig';

interface UserInfo {
  id: string;
  name: string;
  height: number;
  weight: number;
  gender: string;
  age: number;
}

interface UserInfoResponse {
  success: boolean;
  message: string;
  data: UserInfo;
}

export const getUserInfo = async (): Promise<UserInfoResponse> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.USER_INFO}/${API_CONFIG.USER_ID}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};
