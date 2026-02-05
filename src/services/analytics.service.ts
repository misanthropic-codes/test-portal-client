/**
 * Analytics Service - Test Portal Client
 * 
 * Handles analytics-related API calls for user performance data.
 */

import apiClient from './api.client';

// Type definitions for the analytics response
export interface AnalyticsOverview {
  testsAttempted: number;
  averageScore: number;
  bestScore: number;
  lowestScore: number;
  bestRank: number;
  totalStudyTime: string;
  totalStudyTimeSeconds: number;
  totalQuestionsAttempted: number;
  overallAccuracy: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  totalUnattempted: number;
}

export interface SubjectAnalyticsData {
  subject: string;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  accuracy: number;
  score: number;
  totalMarks: number;
  percentage: number;
  avgTimePerQuestion: number;
  totalTimeSpent: number;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface TopicAnalyticsData {
  topic: string;
  subject: string;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  avgTimePerQuestion: number;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface DifficultyLevel {
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  avgTime: number;
}

export interface DifficultyAnalytics {
  easy: DifficultyLevel;
  medium: DifficultyLevel;
  hard: DifficultyLevel;
}

export interface TimeAnalytics {
  totalTimeSpent: number;
  totalTimeFormatted: string;
  avgTimePerTest: number;
  avgTimePerQuestion: number;
  questionsPerMinute: number;
}

export interface RecentPerformance {
  testId: string;
  title: string;
  score: number;
  percentage: number;
  date: string;
  timeTaken: number;
}

export interface AnalyticsTrends {
  scoreProgression: number[];
  accuracyProgression: number[];
  improvement: string;
  trend: 'improving' | 'declining' | 'stable';
}

export interface StrengthsAndWeaknesses {
  strongestSubjects: string[];
  weakestSubjects: string[];
  strongestTopics: string[];
  weakestTopics: string[];
  recommendations: string[];
}

export interface UserAnalytics {
  overview: AnalyticsOverview;
  subjectAnalytics: SubjectAnalyticsData[];
  topicAnalytics: TopicAnalyticsData[];
  difficultyAnalytics: DifficultyAnalytics;
  timeAnalytics: TimeAnalytics;
  recentPerformance: RecentPerformance[];
  trends: AnalyticsTrends;
  strengthsAndWeaknesses: StrengthsAndWeaknesses;
}

interface AnalyticsApiResponse {
  success: boolean;
  data: UserAnalytics;
}

export const analyticsService = {
  /**
   * Get comprehensive user analytics
   * Fetches all performance data including overview, subject/topic analytics,
   * difficulty breakdown, time analytics, and personalized recommendations.
   */
  getUserAnalytics: async (): Promise<UserAnalytics> => {
    const response = await apiClient.get<AnalyticsApiResponse>('/users/analytics');
    return response.data.data;
  },
};

export default analyticsService;
