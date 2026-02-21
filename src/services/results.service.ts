import apiClient, { handleApiError } from "./api.client";

/**
 * Results Service
 * 
 * Handles all result-related API calls including:
 * - Fetching test results
 * - Getting answer keys with solutions
 * - Viewing leaderboards
 */

// New result response from attempts/:attemptId/result
export interface AttemptResultAnswer {
  questionId: string;
  questionText: string;
  questionType: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string | null;
  isCorrect: boolean;
  marksObtained: number;
  timeSpent: number;
  explanation: string;
  solutionImageUrl?: string;
}

export interface AttemptResultResponse {
  success: boolean;
  data: {
    attemptId: string;
    test: {
      testId: string;
      title: string;
      category: string;
      type: string;
    };
    score: number;
    totalMarks: number;
    percentage: number;
    timeTaken: number;
    startTime: string;
    submittedAt: string;
    statistics: {
      totalQuestions: number;
      attempted: number;
      correct: number;
      incorrect: number;
      unattempted: number;
    };
    answers: AttemptResultAnswer[];
  };
}

export interface TestResultResponse {
  success: boolean;
  message: string;
  data: {
    resultId: string;
    attemptId: string;
    testId: string;
    testTitle: string;
    userId: string;
    userName: string;
    submittedAt: string;
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
    sectionWiseScore: {
      sectionName: string;
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      unanswered: number;
      marksObtained: number;
      totalMarks: number;
      percentage: number;
    }[];
    subjectWiseScore: {
      subject: string;
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      marksObtained: number;
      totalMarks: number;
      percentage: number;
    }[];
    difficultyWiseScore: {
      easy: {
        totalQuestions: number;
        correctAnswers: number;
        incorrectAnswers: number;
        accuracy: number;
      };
      medium: {
        totalQuestions: number;
        correctAnswers: number;
        incorrectAnswers: number;
        accuracy: number;
      };
      hard: {
        totalQuestions: number;
        correctAnswers: number;
        incorrectAnswers: number;
        accuracy: number;
      };
    };
    rank: {
      rank: number;
      totalParticipants: number;
      percentile: number;
      topPercentage: number;
    };
    timeAnalysis: {
      totalTimeSpent: number;
      averageTimePerQuestion: number;
      fastestQuestion: number;
      slowestQuestion: number;
    };
    comparison: {
      averageScore: number;
      yourScore: number;
      highestScore: number;
      lowestScore: number;
      performanceVsAverage: string;
    };
    recommendations: string[];
    strongAreas: string[];
    weakAreas: string[];
  };
}

export interface AnswerKeyQuestion {
  questionNumber: number;
  questionId: string;
  questionText: string;
  questionType: string;
  options?: string[];
  questionImage?: string;
  correctAnswer: string;
  yourAnswer: string;
  isCorrect: boolean;
  marks: number;
  marksObtained: number;
  solutionText?: string;
  solutionImage?: string;
  chapter?: string;
  topic?: string;
  difficulty?: string;
  timeSpent: number;
}

export interface AnswerKeyResponse {
  success: boolean;
  message: string;
  data: {
    attemptId: string;
    testTitle: string;
    questions: AnswerKeyQuestion[];
    summary: {
      totalQuestions: number;
      correctAnswers: number;
      incorrectAnswers: number;
      unanswered: number;
      marksObtained: number;
      totalMarks: number;
    };
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  percentage: number;
  timeSpent: number;
  submittedAt: string;
}

export interface LeaderboardResponse {
  success: boolean;
  data: {
    testId: string;
    testTitle: string;
    leaderboard: LeaderboardEntry[];
    yourRank?: {
      rank: number;
      score: number;
      percentage: number;
      percentile: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/** Normalize options from API: {text: string}[] → string[] */
function normalizeOptions(options: any[]): string[] {
  if (!Array.isArray(options)) return [];
  return options.map((opt: any) => {
    if (typeof opt === 'string') return opt;
    if (opt && typeof opt === 'object' && typeof opt.text === 'string') return opt.text;
    return String(opt);
  });
}

export const resultsService = {
  /**
   * Get test result for an attempt
   * GET /results/:attemptId
   */
  getTestResult: async (attemptId: string): Promise<TestResultResponse> => {
    try {
      const response = await apiClient.get<TestResultResponse>(
        `/results/${attemptId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching test result:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get attempt result with answers
   * GET /attempts/:attemptId/result
   */
  getAttemptResult: async (attemptId: string): Promise<AttemptResultResponse> => {
    try {
      const response = await apiClient.get<AttemptResultResponse>(
        `/attempts/${attemptId}/result`
      );
      const data = response.data;
      // Normalize options in answers from {text}[] to string[]
      if (data?.data?.answers) {
        data.data.answers = data.data.answers.map((a: any) => ({
          ...a,
          options: normalizeOptions(a.options),
        }));
      }
      return data;
    } catch (error) {
      console.error('Error fetching attempt result:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get answer key with solutions for an attempt
   * GET /results/:attemptId/answer-key
   */
  getAnswerKey: async (
    attemptId: string,
    sectionId?: string
  ): Promise<AnswerKeyResponse> => {
    try {
      const url = sectionId
        ? `/results/${attemptId}/answer-key?sectionId=${sectionId}`
        : `/results/${attemptId}/answer-key`;

      const response = await apiClient.get<AnswerKeyResponse>(url);
      const data = response.data;
      // Normalize options in questions from {text}[] to string[]
      if (data?.data?.questions) {
        data.data.questions = data.data.questions.map((q: any) => ({
          ...q,
          options: q.options ? normalizeOptions(q.options) : undefined,
        }));
      }
      return data;
    } catch (error) {
      console.error('Error fetching answer key:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get leaderboard for a test
   * GET /results/leaderboard/:testId
   */
  getLeaderboard: async (
    testId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<LeaderboardResponse> => {
    try {
      const response = await apiClient.get<LeaderboardResponse>(
        `/results/leaderboard/${testId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error(handleApiError(error));
    }
  },
};

export default resultsService;
