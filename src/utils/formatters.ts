import { format, formatDistance, formatDuration, intervalToDuration } from 'date-fns';

// Date formatters
export const formatDate = (date: string | Date, formatString: string = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatString);
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const formatTime = (date: string | Date): string => {
  return format(new Date(date), 'hh:mm a');
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

// Time formatters
export const formatSeconds = (seconds: number): string => {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  
  if (duration.hours) {
    return `${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
  } else if (duration.minutes) {
    return `${duration.minutes}m ${duration.seconds}s`;
  } else {
    return `${duration.seconds}s`;
  }
};

export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatTimerDisplay = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Number formatters
export const formatScore = (score: number, totalMarks: number): string => {
  return `${score.toFixed(2)} / ${totalMarks}`;
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatRank = (rank: number): string => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
};

export const formatPercentile = (percentile: number): string => {
  return `${percentile.toFixed(2)}%ile`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Exam type formatters
export const formatExamType = (examType: string): string => {
  const mapping: Record<string, string> = {
    JEE_MAIN: 'JEE Main',
    JEE_ADVANCED: 'JEE Advanced',
    NEET: 'NEET',
    BITSAT: 'BITSAT',
    COMEDK: 'COMEDK',
  };
  return mapping[examType] || examType;
};

export const formatTestType = (testType: string): string => {
  const mapping: Record<string, string> = {
    MOCK: 'Mock Test',
    PRACTICE: 'Practice Test',
    PREVIOUS_YEAR: 'Previous Year',
    TOPIC_WISE: 'Topic Wise',
    CHAPTER_WISE: 'Chapter Wise',
  };
  return mapping[testType] || testType;
};

export const formatSubject = (subject: string): string => {
  const mapping: Record<string, string> = {
    PHYSICS: 'Physics',
    CHEMISTRY: 'Chemistry',
    MATHEMATICS: 'Mathematics',
    BIOLOGY : 'Biology',
  };
  return mapping[subject] || subject;
};

export const formatDifficulty = (difficulty: string): string => {
  const mapping: Record<string, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
  };
  return mapping[difficulty] || difficulty;
};

// Question status formatters
export const formatQuestionStatus = (status: string): string => {
  const mapping: Record<string, string> = {
    NOT_VISITED: 'Not Visited',
    NOT_ANSWERED: 'Not Answered',
    ANSWERED: 'Answered',
    MARKED_FOR_REVIEW: 'Marked for Review',
    ANSWERED_AND_MARKED: 'Answered & Marked',
  };
  return mapping[status] || status;
};
