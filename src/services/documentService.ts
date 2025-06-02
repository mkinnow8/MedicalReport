import {API_CONFIG} from './apiConfig';
import {logApiRequest, logApiResponse, logApiError} from '../utils/apiLogger';

export const uploadDocument = async (file: any): Promise<void> => {
  const url =
    API_CONFIG.BASE_URL + API_CONFIG.UPLOAD_REPORT + API_CONFIG.USER_ID;
  const formData = new FormData();
  formData.append('report', {
    uri: file.uri,
    type: file.type,
    name: file.name,
  });

  try {
    logApiRequest('POST', url, formData);
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    logApiResponse(url, response, data);
  } catch (error) {
    console.error('Upload error:', error);
    logApiError(url, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const prepareDocumentUpload = (file: any) => {
  return {
    uri: file.uri,
    onConfirm: () => uploadDocument(file),
  };
};
