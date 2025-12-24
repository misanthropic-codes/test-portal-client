import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage, STORAGE_KEYS } from '@/utils/storage';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and log requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API request
    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors and log responses
apiClient.interceptors.response.use(
  (response) => {
    // Log API response
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          // Try to refresh token
          console.log('🔄 Attempting to refresh token...');
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://nhgj9d2g-8080.inc1.devtunnels.ms/api/v1'}/auth/refresh`,
            { refreshToken }
          );

          // API returns { accessToken: "..." }
          const { accessToken } = response.data;
          storage.set(STORAGE_KEYS.AUTH_TOKEN, accessToken);
          console.log('✅ Token refreshed successfully');

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        storage.remove(STORAGE_KEYS.USER);
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error: { message: string } }>;
    
    if (axiosError.response) {
      return axiosError.response.data?.error?.message || 'An error occurred';
    } else if (axiosError.request) {
      return 'No response from server. Please check your connection.';
    }
  }
  
  return 'An unexpected error occurred';
};
