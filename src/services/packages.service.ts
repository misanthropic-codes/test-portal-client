import apiClient, { handleApiError } from "./api.client";

/**
 * Packages Service
 * 
 * Handles all package-related API calls including:
 * - Checking package access
 * - Getting package details
 * - Listing available packages
 */

export interface Package {
  _id: string;
  title: string;
  description: string;
  packageId: string;
  type: 'test-series' | 'course' | 'bundle';
  status: 'active' | 'inactive' | 'upcoming';
  price: number;
  discountPrice?: number;
  currency: string;
  examTypes: string[];
  subjects: string[];
  thumbnail?: string;
  features: string[];
  validityDays: number;
  totalTests: number;
  totalQuestions: number;
  tests?: {
    _id: string;
    title: string;
    category: string;
    type: string;
    duration: number;
    totalMarks: number;
  }[];
  metadata?: {
    difficulty?: string;
    rating?: number;
    totalStudents?: number;
    language?: string;
    targetYear?: number;
    instructors?: string[];
  };
  purchaseInfo?: {
    isPurchased: boolean;
    purchaseDate: string;
    validUntil: string;
    daysRemaining: number;
  };
  launchDate?: string;
  expiryDate?: string;
  createdAt: string;
}

export interface PackageAccessResponse {
  hasAccess: boolean;
  productId: string;
}

export interface PackagesListResponse {
  success: boolean;
  message: string;
  data: Package[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const packagesService = {
  /**
   * Check if user has access to a package
   * GET /payments/access/package/:productId
   */
  checkPackageAccess: async (productId: string): Promise<PackageAccessResponse> => {
    try {
      const response = await apiClient.get<PackageAccessResponse>(
        `/payments/access/package/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking package access:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get package details by packageId
   * GET /packages/id/:packageId
   */
  getPackageDetails: async (packageId: string): Promise<Package> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Package;
      }>(`/packages/id/${packageId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching package details:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get all packages with optional filters
   * GET /packages
   */
  getPackages: async (filters?: {
    type?: string;
    status?: string;
    examType?: string;
    page?: number;
    limit?: number;
  }): Promise<PackagesListResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.examType) params.append('examType', filters.examType);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = queryString ? `/packages?${queryString}` : '/packages';

      const response = await apiClient.get<PackagesListResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw new Error(handleApiError(error));
    }
  },
};

export default packagesService;
