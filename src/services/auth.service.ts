import apiClient, { handleApiError } from './api.client';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/storage';

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including:
 * - User registration
 * - User login
 * - Token refresh
 * - Profile management
 */

interface ApiRegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
      examTargets: string[];
      targetYear: number;
    };
    token: string;
    refreshToken: string;
  };
  message: string;
}

interface ApiLoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      examTargets: string[];
      targetYear: number;
    };
    token: string;
    refreshToken: string;
  };
  message: string;
}

export const authService = {
  /**
   * Register a new user account
   * POST /auth/register
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiRegisterResponse>('/auth/register', data);
      
      // Success message from API
      console.log('✅ Registration successful:', response.data.message);
      
      // Map the API response to the AuthResponse format expected by the app
      const authResponse: AuthResponse = {
        user: {
          id: response.data.data.user.id,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          phone: response.data.data.user.phone,
          dateOfBirth: data.dateOfBirth,
          examTargets: data.examTargets,
          targetYear: response.data.data.user.targetYear,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
      };

      return authResponse;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Login user
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiLoginResponse>('/auth/login', credentials);
      
      // Success message from API
      console.log('✅ Login successful:', response.data.message);
      
      // Map the API response to the AuthResponse format expected by the app
      const authResponse: AuthResponse = {
        user: {
          id: response.data.data.user.id,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          phone: response.data.data.user.phone,
          dateOfBirth: '', // Not provided by login API
          examTargets: response.data.data.user.examTargets as any,
          targetYear: response.data.data.user.targetYear,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
      };

      return authResponse;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get current user profile
   * GET /auth/profile
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ _id: string; identifier: string; roles: string[] }>('/auth/profile');
      
      // API returns minimal data (_id, identifier, roles)
      // Get full user data from localStorage if available
      const savedUser = storage.get<User>(STORAGE_KEYS.USER);
      
      // Merge API data with saved user data
      const user: User = {
        ...savedUser,
        id: response.data._id,
        email: response.data.identifier,
        name: savedUser?.name || '',
        phone: savedUser?.phone || '',
        dateOfBirth: savedUser?.dateOfBirth || '',
        examTargets: savedUser?.examTargets || [],
        targetYear: savedUser?.targetYear || new Date().getFullYear(),
        createdAt: savedUser?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('✅ Profile fetched successfully');
      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    try {
      const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
        refreshToken,
      });
      
      console.log('✅ Token refresh successful');
      
      // Store the new token
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.accessToken);
      
      return { accessToken: response.data.accessToken };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      // API uses Authorization header (added by interceptor), no body needed
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/logout', {});
      console.log('✅ Logout successful:', response.data.message);
    } catch (error) {
      // Ignore logout errors, still clear local storage
      console.error('⚠️ Logout API error (will still clear local storage):', error);
    }
  },

  /**
   * Update user profile
   * PATCH /auth/profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.patch<{ success: boolean; user: User }>('/auth/profile', data);
      return response.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Upload profile picture
   * POST /auth/profile/picture
   */
  uploadProfilePicture: async (file: File): Promise<{ profilePicture: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<{ success: boolean; profilePicture: string }>(
        '/auth/profile/picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return { profilePicture: response.data.profilePicture };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default authService;
