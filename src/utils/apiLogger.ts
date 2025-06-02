interface ApiLog {
  timestamp: string;
  method: string;
  url: string;
  requestBody?: any;
  responseStatus?: number;
  responseData?: any;
  error?: string;
}

const apiLogs: ApiLog[] = [];

export const logApiRequest = (
  method: string,
  url: string,
  requestBody?: any,
) => {
  const log: ApiLog = {
    timestamp: new Date().toISOString(),
    method,
    url,
    requestBody,
  };
  apiLogs.push(log);
  console.log('📤 API Request:', {
    timestamp: log.timestamp,
    method,
    url,
    body: requestBody,
  });
};

export const logApiResponse = (
  url: string,
  response: Response,
  responseData?: any,
) => {
  const log = apiLogs.find(l => l.url === url && !l.responseStatus);
  if (log) {
    log.responseStatus = response.status;
    log.responseData = responseData;
    console.log('📥 API Response:', {
      timestamp: log.timestamp,
      method: log.method,
      url,
      status: response.status,
      data: responseData,
    });
  }
};

export const logApiError = (url: string, error: string) => {
  const log = apiLogs.find(l => l.url === url && !l.responseStatus);
  if (log) {
    log.error = error;
    console.log('❌ API Error:', {
      timestamp: log.timestamp,
      method: log.method,
      url,
      error,
    });
  }
};

export const getApiLogs = () => apiLogs;
