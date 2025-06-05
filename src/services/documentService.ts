import {API_CONFIG} from './apiConfig';
import {logApiRequest, logApiResponse, logApiError} from '../utils/apiLogger';

export const uploadDocument = async (file: any): Promise<any> => {
  const url =
    API_CONFIG.BASE_URL + API_CONFIG.UPLOAD_REPORT + API_CONFIG.USER_ID;
  const formData = new FormData();
  formData.append('reports', {
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
    return data.data;
  } catch (error) {
    console.error('Upload error:', error);
    logApiError(url, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const prepareDocumentUpload = (file: any) => {
  return {
    uri: file.uri,
    onConfirm: async () => {
      const uploadedReport = await uploadDocument(file);
      return uploadedReport;
    },
  };
};

export const deleteReport = async (reportId: string) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.DELETE_REPORT}${API_CONFIG.USER_ID}/${reportId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete report');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};

export const compareReports = async (reportIds: string[]) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.COMPARE_REPORTS}${API_CONFIG.USER_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_ids: reportIds,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to compare reports');
    }

    const data = await response.json();
    console.log('Compare successful:', data);

    return data?.data;
  } catch (error) {
    console.error('Error comparing reports:', error);
    throw error;
  }
};
