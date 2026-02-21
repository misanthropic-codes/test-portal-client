// Enums and Constants
export enum ExamType {
  JEE_MAIN = 'JEE_MAIN',
  JEE_ADVANCED = 'JEE_ADVANCED',
  NEET = 'NEET',
  BITSAT = 'BITSAT',
  COMEDK = 'COMEDK',
}

export enum TestType {
  MOCK = 'MOCK',
  PRACTICE = 'PRACTICE',
  PREVIOUS_YEAR = 'PREVIOUS_YEAR',
  TOPIC_WISE = 'TOPIC_WISE',
  CHAPTER_WISE = 'CHAPTER_WISE',
}

export enum QuestionType {
  MCQ_SINGLE = 'MCQ_SINGLE',
  MCQ_MULTIPLE = 'MCQ_MULTIPLE',
  NUMERICAL = 'NUMERICAL',
  INTEGER = 'INTEGER',
}

export enum Subject {
  PHYSICS = 'PHYSICS',
  CHEMISTRY = 'CHEMISTRY',
  MATHEMATICS = 'MATHEMATICS',
  BIOLOGY = 'BIOLOGY',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum TestStatus {
  UPCOMING = 'UPCOMING',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  AUTO_SUBMITTED = 'AUTO_SUBMITTED',
}

export enum QuestionStatus {
  NOT_VISITED = 'NOT_VISITED',
  NOT_ANSWERED = 'NOT_ANSWERED',
  ANSWERED = 'ANSWERED',
  MARKED_FOR_REVIEW = 'MARKED_FOR_REVIEW',
  ANSWERED_AND_MARKED = 'ANSWERED_AND_MARKED',
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  dateOfBirth: string;
  examTargets: ExamType[];
  targetYear: number;
  stats?: UserStats;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  testsAttempted: number;
  averageScore: number;
  bestRank: number;
  totalStudyHours: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  examTargets: ExamType[];
  targetYear: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Test Types
export interface Test {
  id: string;
  title: string;
  description: string;
  examType: ExamType;
  testType: TestType;
  difficulty: Difficulty;
  duration: number; // in minutes
  totalMarks: number;
  totalQuestions: number;
  subjects: Subject[];
  thumbnail?: string;
  scheduledAt?: string;
  startTime?: string;
  endTime?: string;
  status: TestStatus;
  isPaid: boolean;
  price?: number;
  instructions: string;
  sections: TestSection[];
  markingScheme: MarkingScheme;
  syllabus?: string[];
  prerequisites?: string;
  attemptCount: number;
  isAttempted: boolean;
  userAttempts?: AttemptSummary[];
  stats?: TestStats;
  createdAt: string;
  updatedAt: string;
}

export interface TestSection {
  id: string;
  name: string;
  subject: Subject;
  duration?: number; // in minutes (for timed sections)
  questionCount: number;
  marks: number;
  isTimed: boolean;
}

export interface MarkingScheme {
  correctMarks: number;
  incorrectMarks: number; // negative value
  unattemptedMarks: number;
}

export interface TestStats {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
}

export interface AttemptSummary {
  attemptId: string;
  attemptNumber: number;
  score: number;
  rank: number;
  completedAt: string;
}

// Question Types
export interface Question {
  id: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string;
  images?: string[];
  options?: string[];
  marks: number;
  negativeMarks: number;
  isAnswered: boolean;
  isMarkedForReview: boolean;
  savedAnswer?: Answer;
  language: 'ENGLISH' | 'HINDI';
  difficulty?: Difficulty;
  solution?: string;
  solutionVideo?: string;
  tags?: string[];
  timeSpent?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  image?: string;
  isCorrect?: boolean; // Only available in solutions
}

export interface Answer {
  selectedOptions?: string[];
  numericalAnswer?: number;
}

// Test Attempt Types
export interface TestAttempt {
  attemptId: string;
  testId: string;
  startTime: string;
  endTime: string;
  duration: number;
  sections: AttemptSection[];
  canResume: boolean;
  status: AttemptStatus;
}

export interface AttemptSection {
  sectionId: string;
  name: string;
  duration?: number;
  startTime?: string;
  questions: Question[];
}

export interface AttemptProgress {
  totalQuestions: number;
  answeredCount: number;
  notAnsweredCount: number;
  markedForReviewCount: number;
  answeredAndMarkedCount: number;
  notVisitedCount: number;
}

export interface AttemptStatus_API {
  attemptId: string;
  testId: string;
  status: AttemptStatus;
  startTime: string;
  endTime: string;
  remainingTime: number; // in seconds
  currentSection: {
    sectionId: string;
    name: string;
    remainingTime?: number;
  };
  progress: AttemptProgress;
}

// Results Types
export interface TestResult {
  attemptId: string;
  testId: string;
  testTitle: string;
  userId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank: number;
  totalAttempts: number;
  percentile: number;
  timeTaken: number; // in minutes
  submittedAt: string;
  sectionWise: SectionResult[];
  subjectWise: SubjectResult[];
  difficultyWise: DifficultyResult;
  speedAccuracy: SpeedAccuracy;
  comparison: Comparison;
}

export interface SectionResult {
  sectionId: string;
  sectionName: string;
  subject: Subject;
  score: number;
  totalMarks: number;
  accuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
}

export interface SubjectResult {
  subject: Subject;
  score: number;
  totalMarks: number;
  accuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  timeTaken: number;
}

export interface DifficultyResult {
  easy: { correct: number; incorrect: number; unattempted: number };
  medium: { correct: number; incorrect: number; unattempted: number };
  hard: { correct: number; incorrect: number; unattempted: number };
}

export interface SpeedAccuracy {
  speed: number; // questions per minute
  accuracy: number; // percentage
}

export interface Comparison {
  averageScore: number;
  topperScore: number;
  yourScore: number;
}

// Analytics Types
export interface UserAnalytics {
  totalTests: number;
  averageScore: number;
  averagePercentile: number;
  bestRank: number;
  totalStudyHours: number;
  strengths: string[];
  weaknesses: string[];
  subjectWise: SubjectAnalytics[];
  progressChart: ProgressDataPoint[];
  topicWise: TopicAnalytics[];
  recentTests: RecentTest[];
}

export interface SubjectAnalytics {
  subject: Subject;
  testsAttempted: number;
  averageScore: number;
  accuracy: number;
  timeSpent: number;
}

export interface TopicAnalytics {
  topic: string;
  questionsAttempted: number;
  accuracy: number;
  averageTime: number;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ProgressDataPoint {
  date: string;
  score: number;
  percentile: number;
}

export interface RecentTest {
  testId: string;
  testTitle: string;
  score: number;
  rank: number;
  completedAt: string;
}

// Dashboard Types
export interface DashboardStats {
  todayStudyTime: number;
  weekStudyTime: number;
  testsThisWeek: number;
  averageScoreThisWeek: number;
  upcomingTests: UpcomingTest[];
  recentActivity: Activity[];
  recommendations: TestRecommendation[];
}

export interface UpcomingTest {
  testId: string;
  title: string;
  scheduledAt: string;
  duration: number;
  isRegistered: boolean;
  thumbnail?: string;
}

export interface Activity {
  type: 'TEST_COMPLETED' | 'TEST_STARTED';
  testId: string;
  testTitle: string;
  timestamp: string;
}

export interface TestRecommendation {
  testId: string;
  title: string;
  reason: string;
}

// Leaderboard Types
export interface Leaderboard {
  testId: string;
  testTitle: string;
  topRankers: RankEntry[];
  yourRank?: RankEntry;
}

export interface RankEntry {
  rank: number;
  userId: string;
  userName: string;
  profilePicture?: string;
  score: number;
  percentage: number;
  timeTaken: number;
}

// Bookmark Types
export interface Bookmark {
  bookmarkId: string;
  questionId: string;
  testId: string;
  testTitle: string;
  questionText: string;
  subject: Subject;
  topic: string;
  note?: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'TEST_SCHEDULED' | 'RESULT_PUBLISHED' | 'REMINDER';
  title: string;
  message: string;
  isRead: boolean;
  data?: {
    testId?: string;
    attemptId?: string;
  };
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

// Filter Types
export interface TestFilters {
  examType?: ExamType;
  testType?: TestType;
  difficulty?: Difficulty;
  subject?: Subject;
  status?: TestStatus;
  search?: string;
  page?: number;
  limit?: number;
}
