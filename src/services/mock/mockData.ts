import {
  ExamType,
  TestType,
  Subject,
  Difficulty,
  TestStatus,
  QuestionType,
  Test,
  Question,
  User,
  AuthResponse,
  RegisterData,
  LoginCredentials,
  TestAttempt,
  AttemptSection,
  TestResult,
  UserAnalytics,
  DashboardStats,
} from '@/types';

// Mock Users
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@test.com',
    phone: '9876543210',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    dateOfBirth: '2005-05-15',
    examTargets: [ExamType.JEE_MAIN, ExamType.JEE_ADVANCED],
    targetYear: 2025,
    stats: {
      testsAttempted: 45,
      averageScore: 245.5,
      bestRank: 123,
      totalStudyHours: 450,
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-13T10:00:00Z',
  },
];

// Sample Questions
const generateMCQQuestion = (num: number, subject: Subject): Question => ({
  id: `q${num}`,
  questionNumber: num,
  type: QuestionType.MCQ_SINGLE,
  questionText: `A particle of mass 2kg is moving with velocity $\\vec{v} = 3\\hat{i} + 4\\hat{j}$ m/s. What is the magnitude of its momentum?`,
  images: [],
  options: [
    '10 kg·m/s',
    '14 kg·m/s',
    '6 kg·m/s',
    '8 kg·m/s',
  ],
  marks: 4,
  negativeMarks: -1,
  isAnswered: false,
  isMarkedForReview: false,
  language: 'ENGLISH',
  difficulty: Difficulty.MEDIUM,
  solution: 'Momentum = mass × velocity. Magnitude = $m\\sqrt{v_x^2 + v_y^2} = 2\\sqrt{9+16} = 10$ kg·m/s',
  tags: ['Mechanics', 'Momentum'],
});

const generateNumericalQuestion = (num: number, subject: Subject): Question => ({
  id: `q${num}`,
  questionNumber: num,
  type: QuestionType.NUMERICAL,
  questionText: `The value of $\\int_0^{\\pi/2} \\sin^2(x) dx$ is equal to:`,
  marks: 4,
  negativeMarks: 0,
  isAnswered: false,
  isMarkedForReview: false,
  language: 'ENGLISH',
  difficulty: Difficulty.HARD,
  solution: 'Using the formula $\\sin^2(x) = \\frac{1-\\cos(2x)}{2}$, the integral evaluates to $\\pi/4$',
  tags: ['Calculus', 'Integration'],
});

// Mock Tests
export const mockTests: Test[] = [
  {
    id: 'test1',
    title: 'JEE Main 2025 Full Test 1',
    description: 'Complete JEE Main pattern test covering all subjects with detailed solutions.',
    examType: ExamType.JEE_MAIN,
    testType: TestType.MOCK,
    difficulty: Difficulty.MEDIUM,
    duration: 180,
    totalMarks: 300,
    totalQuestions: 75,
    subjects: [Subject.PHYSICS, Subject.CHEMISTRY, Subject.MATHEMATICS],
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    status: TestStatus.LIVE,
    isPaid: false,
    instructions: '<h2>Instructions</h2><ul><li>Total duration: 3 hours</li><li>Each correct answer: +4 marks</li><li>Each incorrect answer: -1 mark</li></ul>',
    sections: [
      {
        id: 'sec1',
        name: 'Physics',
        subject: Subject.PHYSICS,
        duration: 60,
        questionCount: 25,
        marks: 100,
        isTimed: true,
      },
      {
        id: 'sec2',
        name: 'Chemistry',
        subject: Subject.CHEMISTRY,
        duration: 60,
        questionCount: 25,
        marks: 100,
        isTimed: true,
      },
      {
        id: 'sec3',
        name: 'Mathematics',
        subject: Subject.MATHEMATICS,
        duration: 60,
        questionCount: 25,
        marks: 100,
        isTimed: true,
      },
    ],
    markingScheme: {
      correctMarks: 4,
      incorrectMarks: -1,
      unattemptedMarks: 0,
    },
    syllabus: ['Mechanics', 'Thermodynamics', 'Organic Chemistry', 'Calculus', 'Algebra'],
    attemptCount: 1245,
    isAttempted: false,
    stats: {
      totalAttempts: 1245,
      averageScore: 185.5,
      highestScore: 295,
    },
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z',
  },
  {
    id: 'test2',
    title: 'NEET 2025 Mock Test - Biology Focus',
    description: 'Comprehensive NEET test with emphasis on Biology topics.',
    examType: ExamType.NEET,
    testType: TestType.MOCK,
    difficulty: Difficulty.MEDIUM,
    duration: 180,
    totalMarks: 720,
    totalQuestions: 180,
    subjects: [Subject.PHYSICS, Subject.CHEMISTRY, Subject.BIOLOGY],
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
    status: TestStatus.UPCOMING,
    scheduledAt: '2025-01-15T09:00:00Z',
    isPaid: false,
    instructions: '<h2>Instructions</h2><p>Total 180 questions, 3 hours duration.</p>',
    sections: [
      {
        id: 'sec1',
        name: 'Physics',
        subject: Subject.PHYSICS,
        questionCount: 45,
        marks: 180,
        isTimed: false,
      },
      {
        id: 'sec2',
        name: 'Chemistry',
        subject: Subject.CHEMISTRY,
        questionCount: 45,
        marks: 180,
        isTimed: false,
      },
      {
        id: 'sec3',
        name: 'Biology',
        subject: Subject.BIOLOGY,
        questionCount: 90,
        marks: 360,
        isTimed: false,
      },
    ],
    markingScheme: {
      correctMarks: 4,
      incorrectMarks: -1,
      unattemptedMarks: 0,
    },
    attemptCount: 856,
    isAttempted: false,
    stats: {
      totalAttempts: 856,
      averageScore: 450.2,
      highestScore: 700,
    },
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2024-12-10T00:00:00Z',
  },
  {
    id: 'test3',
    title: 'JEE Advanced Previous Year 2024',
    description: 'Complete JEE Advanced 2024 Paper with authentic solutions.',
    examType: ExamType.JEE_ADVANCED,
    testType: TestType.PREVIOUS_YEAR,
    difficulty: Difficulty.HARD,
    duration: 180,
    totalMarks: 264,
    totalQuestions: 54,
    subjects: [Subject.PHYSICS, Subject.CHEMISTRY, Subject.MATHEMATICS],
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
    status: TestStatus.LIVE,
    isPaid: false,
    instructions: '<h2>JEE Advanced Pattern</h2><p>Challenging questions from 2024.</p>',
    sections: [
      {
        id: 'sec1',
        name: 'Physics',
        subject: Subject.PHYSICS,
        questionCount: 18,
        marks: 88,
        isTimed: false,
      },
      {
        id: 'sec2',
        name: 'Chemistry',
        subject: Subject.CHEMISTRY,
        questionCount: 18,
        marks: 88,
        isTimed: false,
      },
      {
        id: 'sec3',
        name: 'Mathematics',
        subject: Subject.MATHEMATICS,
        questionCount: 18,
        marks: 88,
        isTimed: false,
      },
    ],
    markingScheme: {
      correctMarks: 4,
      incorrectMarks: -2,
      unattemptedMarks: 0,
    },
    attemptCount: 2340,
    isAttempted: true,
    userAttempts: [
      {
        attemptId: 'attempt1',
        attemptNumber: 1,
        score: 156,
        rank: 450,
        completedAt: '2024-12-10T15:30:00Z',
      },
    ],
    stats: {
      totalAttempts: 2340,
      averageScore: 125.5,
      highestScore: 250,
    },
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z',
  },
];

// Mock Auth Service
export const mockAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
    
    const user = mockUsers[0];
    const response: AuthResponse = {
      user,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    };
    return response;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: String(Date.now()),
      ...data,
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      stats: {
        testsAttempted: 0,
        averageScore: 0,
        bestRank: 0,
        totalStudyHours: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: AuthResponse = {
      user: newUser,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    };
    return response;
  },
};

// Mock Test Service  
export const mockTestService = {
  getAllTests: async (filters?: any): Promise<{ tests: Test[]; pagination: any }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    let filteredTests = [...mockTests];
    
    if (filters?.examType) {
      filteredTests = filteredTests.filter((t) => t.examType === filters.examType);
    }
    if (filters?.testType) {
      filteredTests = filteredTests.filter((t) => t.testType === filters.testType);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredTests = filteredTests.filter((t) => 
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search)
      );
    }
    
    return {
      tests: filteredTests,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalTests: filteredTests.length,
        hasMore: false,
      },
    };
  },

  getTestById: async (testId: string): Promise<Test> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const test = mockTests.find((t) => t.id === testId);
    if (!test) throw new Error('Test not found');
    return test;
  },

  startTest: async (testId: string): Promise<TestAttempt> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const test = mockTests.find((t) => t.id === testId);
    if (!test) throw new Error('Test not found');

    // Generate questions for each section
    const sections: AttemptSection[] = test.sections.map((section, index) => {
      const questions: Question[] = [];
      for (let i = 0; i < section.questionCount; i++) {
        const questionNum = index * section.questionCount + i + 1;
        if (i < section.questionCount - 5) {
          questions.push(generateMCQQuestion(questionNum, section.subject));
        } else {
          questions.push(generateNumericalQuestion(questionNum, section.subject));
        }
      }

      return {
        sectionId: section.id,
        name: section.name,
        duration: section.duration,
        questions,
      };
    });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + test.duration * 60 * 1000);

    return {
      attemptId: 'attempt_' + Date.now(),
      testId: test.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: test.duration,
      sections,
      canResume: true,
      status: 'IN_PROGRESS' as any,
    };
  },
};

// Mock Dashboard Service
export const mockDashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      todayStudyTime: 120,
      weekStudyTime: 650,
      testsThisWeek: 5,
      averageScoreThisWeek: 245.5,
      upcomingTests: [
        {
          testId: 'test2',
          title: 'NEET 2025 Mock Test',
          scheduledAt: '2025-01-15T09:00:00Z',
          duration: 180,
          isRegistered: true,
        },
      ],
      recentActivity: [
        {
          type: 'TEST_COMPLETED',
          testId: 'test3',
          testTitle: 'JEE Advanced Previous Year 2024',
          timestamp: '2024-12-10T15:30:00Z',
        },
      ],
      recommendations: [
        {
          testId: 'test1',
          title: 'JEE Main 2025 Full Test 1',
          reason: 'Based on your performance in Physics',
        },
      ],
    };
  },
};

// Mock Results Service
export const mockResultsService = {
  getResult: async (attemptId: string): Promise<TestResult> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return {
      attemptId,
      testId: 'test3',
      testTitle: 'JEE Advanced Previous Year 2024',
      userId: '1',
      score: 156,
      totalMarks: 264,
      percentage: 59.09,
      rank: 450,
      totalAttempts: 2340,
      percentile: 80.77,
      timeTaken: 165,
      submittedAt: '2024-12-10T15:30:00Z',
      sectionWise: [
        {
          sectionId: 'sec1',
          sectionName: 'Physics',
          subject: Subject.PHYSICS,
          score: 52,
          totalMarks: 88,
          accuracy: 65.0,
          correctAnswers: 14,
          incorrectAnswers: 3,
          unattempted: 1,
        },
        {
          sectionId: 'sec2',
          sectionName: 'Chemistry',
          subject: Subject.CHEMISTRY,
          score: 48,
          totalMarks: 88,
          accuracy: 61.11,
          correctAnswers: 13,
          incorrectAnswers: 4,
          unattempted: 1,
        },
        {
          sectionId: 'sec3',
          sectionName: 'Mathematics',
          subject: Subject.MATHEMATICS,
          score: 56,
          totalMarks: 88,
          accuracy: 68.75,
          correctAnswers: 15,
          incorrectAnswers: 2,
          unattempted: 1,
        },
      ],
      subjectWise: [
        {
          subject: Subject.PHYSICS,
          score: 52,
          totalMarks: 88,
          accuracy: 65.0,
          correctAnswers: 14,
          incorrectAnswers: 3,
          unattempted: 1,
          timeTaken: 55 * 60,
        },
        {
          subject: Subject.CHEMISTRY,
          score: 48,
          totalMarks: 88,
          accuracy: 61.11,
          correctAnswers: 13,
          incorrectAnswers: 4,
          unattempted: 1,
          timeTaken: 52 * 60,
        },
        {
          subject: Subject.MATHEMATICS,
          score: 56,
          totalMarks: 88,
          accuracy: 68.75,
          correctAnswers: 15,
          incorrectAnswers: 2,
          unattempted: 1,
          timeTaken: 58 * 60,
        },
      ],
      difficultyWise: {
        easy: { correct: 12, incorrect: 1, unattempted: 0 },
        medium: { correct: 22, incorrect: 6, unattempted: 2 },
        hard: { correct: 8, incorrect: 2, unattempted: 1 },
      },
      speedAccuracy: {
        speed: 0.327,
        accuracy: 77.78,
      },
      comparison: {
        averageScore: 125.5,
        topperScore: 250,
        yourScore: 156,
      },
    };
  },
};
