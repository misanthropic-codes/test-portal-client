// Calculation utilities for scores, percentiles, and rankings

export const calculatePercentage = (score: number, totalMarks: number): number => {
  if (totalMarks === 0) return 0;
  return (score / totalMarks) * 100;
};

export const calculatePercentile = (rank: number, totalAttempts: number): number => {
  if (totalAttempts === 0) return 0;
  return ((totalAttempts - rank + 1) / totalAttempts) * 100;
};

export const calculateAccuracy = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return (correct / total) * 100;
};

export const calculateSpeed = (questionsAttempted: number, timeInMinutes: number): number => {
  if (timeInMinutes === 0) return 0;
  return questionsAttempted / timeInMinutes;
};

export const calculateMarks = (
  correct: number,
  incorrect: number,
  correctMarks: number,
  negativeMarks: number
): number => {
  return correct * correctMarks + incorrect * negativeMarks;
};

export const getQuestionStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    NOT_VISITED: 'bg-gray-200 dark:bg-gray-700',
    NOT_ANSWERED: 'bg-red-100 dark:bg-red-900/30 border-red-500',
    ANSWERED: 'bg-green-100 dark:bg-green-900/30 border-green-500',
    MARKED_FOR_REVIEW: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500',
    ANSWERED_AND_MARKED: 'bg-purple-100 dark:bg-purple-900/30 border-purple-500',
  };
  return colorMap[status] || colorMap.NOT_VISITED;
};

export const getDifficultyColor = (difficulty: string): string => {
  const colorMap: Record<string, string> = {
    EASY: 'text-green-600 dark:text-green-400',
    MEDIUM: 'text-yellow-600 dark:text-yellow-400',
    HARD: 'text-red-600 dark:text-red-400',
  };
  return colorMap[difficulty] || '';
};

export const getSubjectColor = (subject: string): string => {
  const colorMap: Record<string, string> = {
    PHYSICS: 'text-blue-600 dark:text-blue-400',
    CHEMISTRY: 'text-green-600 dark:text-green-400',
    MATHEMATICS: 'text-purple-600 dark:text-purple-400',
    BIOLOGY: 'text-pink-600 dark:text-pink-400',
  };
  return colorMap[subject] || '';
};

export const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

export const getPerformanceLevel = (percentile: number): string => {
  if (percentile >= 99) return 'Outstanding';
  if (percentile >= 95) return 'Excellent';
  if (percentile >= 85) return 'Very Good';
  if (percentile >= 70) return 'Good';
  if (percentile >= 50) return 'Average';
  return 'Needs Improvement';
};
