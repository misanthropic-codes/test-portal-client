import apiClient, { handleApiError } from './api.client';
import { User } from '@/types';

/**
 * User Service
 * 
 * Handles user profile and user-related API calls
 */

interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
    dateOfBirth: string;
    examTargets: string[];
    targetYear: number;
    stats: {
      testsAttempted: number;
      averageScore: number;
      bestRank: number;
      totalStudyHours: number;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export const userService = {
  /**
   * Get current user's detailed profile with statistics
   * GET /users/profile
   */
  getUserProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<UserProfileResponse>('/users/profile');
      
      console.log('✅ User profile fetched successfully');
      
      // Map API response to User type
      const user: User = {
        id: response.data.data.id,
        name: response.data.data.name,
        email: response.data.data.email,
        phone: response.data.data.phone,
        profilePicture: response.data.data.profilePicture,
        dateOfBirth: response.data.data.dateOfBirth,
        examTargets: response.data.data.examTargets as any,
        targetYear: response.data.data.targetYear,
        stats: response.data.data.stats,
        createdAt: response.data.data.createdAt,
        updatedAt: response.data.data.updatedAt,
      };
      
      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default userService;
