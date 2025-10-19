import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// API Response wrapper type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: number;
}

// Error response type
export interface ErrorResponse {
  success: boolean;
  message: string;
  timestamp: number;
  status?: number;
}

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    // Handle different error scenarios
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      switch (status) {
        case 401:
          toast.error('Authentication required. Please log in.');
          break;
        case 403:
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

export default api;
