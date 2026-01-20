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

// Test Details Interfaces
export interface TestSection {
  id: string;
  name: string;
  subject: string;
  duration: number;
  questionCount: number;
  marks: number;
  isTimed: boolean;
}

export interface MarkingScheme {
  correctMarks: number;
  incorrectMarks: number;
  unattemptedMarks: number;
}

export interface TestStats {
  totalAttempts: number;
  studentsAttempted: number;
  averageScore: number;
  highestScore: number;
}

export interface UserAttempt {
  attemptId: string;
  score: number;
  percentage: number;
  rank?: number;
  attemptedAt: string;
}

export interface TestDetails {
  id: string;
  title: string;
  description: string;
  examType: string;
  testType: string;
  difficulty: string;
  subjects: string[];
  syllabus: string[];
  duration: number;
  totalMarks: number;
  totalQuestions: number;
  thumbnail: string;
  status: string;
  isPaid: boolean;
  price: number;
  instructions: string[];
  sections: TestSection[];
  markingScheme: MarkingScheme;
  prerequisites: string;
  attemptCount: number;
  isAttempted: boolean;
  userAttempts: UserAttempt[];
  stats: TestStats;
  createdAt: string;
  updatedAt: string;
}

export interface TestDetailsResponse {
  success: boolean;
  data: TestDetails;
}

// Attempt History Interfaces
export interface AttemptTestInfo {
  testId: string;
  title: string;
  category: string;
  type: string;
  duration: number;
  totalMarks: number;
}

export interface AttemptHistoryItem {
  attemptId: string;
  test: AttemptTestInfo;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  score: number;
  timeTaken: number;
  startTime: string;
  endTime?: string;
}

export interface AttemptHistoryResponse {
  success: boolean;
  data: {
    attempts: AttemptHistoryItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasMore: boolean;
    };
  };
}

export interface InProgressAttemptResponse {
  success: boolean;
  data: {
    attemptId: string;
    testId: string;
    status: 'IN_PROGRESS';
    startTime: string;
    endTime: string;
    duration: number;
    remainingTime: number;
  } | null;
}

export interface ResumeAttemptResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    testId: string;
    canResume: boolean;
    status: 'IN_PROGRESS';
    startTime: string;
    endTime: string;
    remainingTime: number;
    test: {
      title: string;
      category: string;
      type: string;
      duration: number;
      totalMarks: number;
      marksPerQuestion: number;
      negativeMarking: number;
    };
    questions: Array<{
      questionId: string;
      questionNumber: number;
      questionText: string;
      questionType: string;
      options: string[];
      questionImageUrl?: string;
      marks: number;
      negativeMarks: number;
      savedAnswer: string | null;
      isMarkedForReview: boolean;
      isAnswered: boolean;
      timeSpent: number;
    }>;
    statistics: {
      totalQuestions: number;
      answeredQuestions: number;
      markedForReview: number;
      notAnswered: number;
    };
    lastActivity: string;
  };
}

// Test Attempt Interfaces
export interface StartTestResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    testId: string;
    userId: string;
    testTitle: string;
    duration: number;
    startTime: string;
    endTime: string;
    totalQuestions: number;
    totalMarks: number;
    marksPerQuestion: number;
    negativeMarking: number;
    status: 'IN_PROGRESS';
    sections: {
      sectionId: string;
      sectionName: string;
      totalQuestions: number;
    }[];
  };
}

export interface QuestionData {
  // API returns 'id', we also support 'questionId' for resume endpoint
  id?: string;
  questionId?: string;
  questionNumber: number;
  questionText: string;
  // API returns 'type' like 'MCQ_SINGLE', resume returns 'questionType'
  type?: 'MCQ_SINGLE' | 'MCQ_MULTI' | 'NUMERICAL' | 'INTEGER';
  questionType?: 'single-correct' | 'multiple-correct' | 'numerical' | 'integer';
  images?: string[];
  options?: string[];
  questionImage?: string;
  questionImageUrl?: string; // Alternate field name from resume endpoint
  marks: number;
  negativeMarks: number;
  savedAnswer: string | null;
  isMarkedForReview: boolean;
  isAnswered: boolean;
  timeSpent?: number;
  language?: string;
}

export interface SectionData {
  sectionId: string;
  name: string;
  subject: string;
  duration: number | null;
  questions: QuestionData[];
}

export interface GetQuestionsResponse {
  success: boolean;
  data: {
    attemptId: string;
    testId: string;
    sections: SectionData[];
    totalQuestions: number;
    answeredCount: number;
    markedForReviewCount: number;
  };
}

export interface SaveAnswerResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    questionId: string;
    answer: string;
    timeSpent: number;
    savedAt: string;
  };
}

export interface AttemptStatusResponse {
  success: boolean;
  data: {
    attemptId: string;
    testId: string;
    testTitle: string;
    status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED';
    startTime: string;
    endTime: string;
    currentTime: string;
    remainingTime: number;
    duration: number;
    elapsedTime: number;
    totalQuestions: number;
    answeredQuestions: number;
    notAnswered: number;
    markedForReview: number;
    notVisited: number;
    progress: {
      percentage: number;
      answeredPercentage: number;
      visitedPercentage: number;
    };
  };
}

export interface SubmitTestResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    testId: string;
    userId: string;
    status: 'SUBMITTED';
    submittedAt: string;
    timeSpent: number;
    score: {
      totalQuestions: number;
      attemptedQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      unanswered: number;
      marksObtained: number;
      totalMarks: number;
      percentage: number;
      accuracy: number;
    };
    evaluationStatus: 'COMPLETED';
    resultId: string;
  };
}

// Submit answers payload
export interface SubmitAnswerItem {
  questionId: string;
  sectionId?: string;
  answer: {
    selectedOptions?: string[];
    numericalAnswer?: number;
  };
  timeSpent: number;
}

export interface SubmitTestPayload {
  answers: SubmitAnswerItem[];
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

  /**
   * Get detailed test information
   * GET /tests/:testId
   */
  getTestDetails: async (testId: string): Promise<TestDetailsResponse> => {
    try {
      const response = await apiClient.get<TestDetailsResponse>(`/tests/${testId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching test details:', error);
      throw error;
    }
  },

  /**
   * Get attempt history for the logged-in user
   * GET /attempts/history
   */
  getAttemptHistory: async (page: number = 1, limit: number = 10): Promise<AttemptHistoryResponse> => {
    try {
      const response = await apiClient.get<AttemptHistoryResponse>(
        `/attempts/history?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching attempt history:', error);
      throw error;
    }
  },

  /**
   * Check if test has an in-progress attempt
   * GET /attempts/test/:testId/in-progress
   */
  getInProgressAttempt: async (testId: string): Promise<InProgressAttemptResponse> => {
    try {
      const response = await apiClient.get<InProgressAttemptResponse>(
        `/attempts/test/${testId}/in-progress`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking in-progress attempt:', error);
      throw error;
    }
  },

  /**
   * Resume an in-progress attempt
   * GET /attempts/:attemptId/resume
   */
  resumeAttempt: async (attemptId: string): Promise<ResumeAttemptResponse> => {
    try {
      const response = await apiClient.get<ResumeAttemptResponse>(
        `/attempts/${attemptId}/resume`
      );
      return response.data;
    } catch (error) {
      console.error('Error resuming attempt:', error);
      throw error;
    }
  },

  /**
   * Start a new test attempt
   * POST /tests/:testId/start
   */
  startTest: async (testId: string): Promise<StartTestResponse> => {
    try {
      const response = await apiClient.post<StartTestResponse>(`/tests/${testId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting test:', error);
      throw error;
    }
  },

  /**
   * Get questions for an attempt
   * GET /attempts/:attemptId/questions
   */
  getTestQuestions: async (attemptId: string, sectionId?: string): Promise<GetQuestionsResponse> => {
    try {
      const url = sectionId 
        ? `/attempts/${attemptId}/questions?sectionId=${sectionId}`
        : `/attempts/${attemptId}/questions`;
      
      const response = await apiClient.get<GetQuestionsResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching test questions:', error);
      throw error;
    }
  },

  /**
   * Save answer for a question
   * POST /attempts/:attemptId/answer
   */
  saveAnswer: async (
    attemptId: string,
    questionId: string,
    answer: string,
    timeSpent: number
  ): Promise<SaveAnswerResponse> => {
    try {
      const response = await apiClient.post<SaveAnswerResponse>(
        `/attempts/${attemptId}/answer`,
        { questionId, answer, timeSpent }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving answer:', error);
      throw error;
    }
  },

  /**
   * Mark question for review
   * POST /attempts/:attemptId/mark-review
   */
  markForReview: async (
    attemptId: string,
    questionId: string,
    isMarkedForReview: boolean
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `/attempts/${attemptId}/mark-review`,
        { questionId, isMarkedForReview }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking for review:', error);
      throw error;
    }
  },

  /**
   * Get current status of test attempt
   * GET /attempts/:attemptId/status
   */
  getAttemptStatus: async (attemptId: string): Promise<AttemptStatusResponse> => {
    try {
      const response = await apiClient.get<AttemptStatusResponse>(
        `/attempts/${attemptId}/status`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching attempt status:', error);
      throw error;
    }
  },

  /**
   * Submit test with all answers
   * POST /attempts/:attemptId/submit
   */
  submitTest: async (attemptId: string, payload?: SubmitTestPayload): Promise<SubmitTestResponse> => {
    try {
      const response = await apiClient.post<SubmitTestResponse>(
        `/attempts/${attemptId}/submit`,
        payload || {}
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting test:', error);
      throw error;
    }
  },
};


export default testsService;
