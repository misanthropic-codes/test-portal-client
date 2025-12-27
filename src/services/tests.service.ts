import apiClient from './api.client';

/**
 * Tests Service
 * 
 * Handles all test-related API calls
 */

// Types for My Tests API Response
export interface MyTestsStats {
  totalTests: number;
  assignedTests: number;
  purchasedTests: number;
  attemptedTests: number;
  completedTests: number;
  notStarted: number;
  overallAverage: number;
  totalAttempts: number;
}

export interface MyTest {
  testId: string;
  title: string;
  description: string;
  category: string;
  type: string;
  duration: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarking: number;
  isPaid: boolean;
  price?: number;
  packageName?: string;
  source: 'purchased' | 'assigned';
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'upcoming';
  hasAttempted: boolean;
  attemptsCount: number;
  lastAttemptDate?: string;
  lastScore?: number;
  lastPercentage?: number;
  lastRank?: number;
  bestScore?: number;
  bestPercentage?: number;
  bestRank?: number;
  progress: 'completed' | 'in-progress' | 'not-started';
}

export interface TestCategory {
  category: string;
  totalTests: number;
  attemptedTests: number;
  completedTests: number;
  averagePercentage: number;
  tests: MyTest[];
}

export interface MyTestsResponse {
  success: boolean;
  stats: MyTestsStats;
  categories: TestCategory[];
  accessibleTestIds: string[];
}

export const testsService = {
  /**
   * Get all tests accessible to the user (purchased or assigned)
   * GET /tests/my-tests
   * Requires authentication
   */
  getMyTests: async (): Promise<MyTestsResponse> => {
    try {
      const response = await apiClient.get<MyTestsResponse>('/tests/my-tests');
      return response.data;
    } catch (error) {
      console.error('Error fetching my tests:', error);
      throw error;
    }
  },

  /**
   * Get tests filtered by package ID
   * GET /tests/my-tests?packageId=xxx
   */
  getTestsByPackage: async (packageId: string): Promise<MyTestsResponse> => {
    try {
      const response = await apiClient.get<MyTestsResponse>(`/tests/my-tests?packageId=${packageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tests by package:', error);
      throw error;
    }
  },
};

export default testsService;
