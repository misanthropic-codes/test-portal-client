'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockTestService } from '@/services/mock/mockData';
import { TestAttempt, Question, QuestionStatus, Answer } from '@/types';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [questionStatuses, setQuestionStatuses] = useState<Map<string, QuestionStatus>>(new Map());
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    setDarkMode(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadAttempt = async () => {
      try {
        const attemptId = params.attemptId as string;
        
        // Try to get attempt from localStorage (mock storage)
        const storedAttempt = localStorage.getItem(`attempt_${attemptId}`);
        if (storedAttempt) {
          const parsedAttempt = JSON.parse(storedAttempt);
          setAttempt(parsedAttempt);
          
          // Initialize question statuses
          const statusMap = new Map<string, QuestionStatus>();
          parsedAttempt.sections.forEach((section: any) => {
            section.questions.forEach((q: any) => {
              statusMap.set(q.id, QuestionStatus.NOT_VISITED);
            });
          });
          setQuestionStatuses(statusMap);
        } else {
          // Attempt not found - redirect back
          router.push('/tests');
        }
      } catch (error) {
        console.error('Error loading attempt:', error);
        router.push('/tests');
      } finally {
        setLoading(false);
      }
    };

    loadAttempt();
  }, [params.attemptId, router]);

  const currentSection = attempt?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  
  // Calculate remaining time - needs to update dynamically
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    if (!attempt) return;
    
    // Initial calculation
    const calculate = () => {
      const remaining = Math.max(0, Math.floor((new Date(attempt.endTime).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    
    calculate();
    const interval = setInterval(calculate, 1000);
    
    return () => clearInterval(interval);
  }, [attempt]);
  
  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && attempt) {
      // Submit test logic
      setShowSubmitConfirmation(false);
      router.push(`/results/${attempt?.attemptId}`);
    }
  }, [timeLeft, attempt, router]);

  const handleAnswer = (answer: Answer) => {
    if (!currentQuestion) return;
    
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, answer);
    setAnswers(newAnswers);
    
    // Update question status
    const newStatuses = new Map(questionStatuses);
    const currentStatus = newStatuses.get(currentQuestion.id);
    
    if (currentStatus === QuestionStatus.MARKED_FOR_REVIEW) {
      newStatuses.set(currentQuestion.id, QuestionStatus.ANSWERED_AND_MARKED);
    } else {
      newStatuses.set(currentQuestion.id, QuestionStatus.ANSWERED);
    }
    
    setQuestionStatuses(newStatuses);
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    
    const newStatuses = new Map(questionStatuses);
    const hasAnswer = answers.has(currentQuestion.id);
    
    if (hasAnswer) {
      newStatuses.set(currentQuestion.id, QuestionStatus.ANSWERED_AND_MARKED);
    } else {
      newStatuses.set(currentQuestion.id, QuestionStatus.MARKED_FOR_REVIEW);
    }
    
    setQuestionStatuses(newStatuses);
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    
    const newAnswers = new Map(answers);
    newAnswers.delete(currentQuestion.id);
    setAnswers(newAnswers);
    
    const newStatuses = new Map(questionStatuses);
    newStatuses.set(currentQuestion.id, QuestionStatus.NOT_ANSWERED);
    setQuestionStatuses(newStatuses);
  };

  const navigateToQuestion = (sectionIndex: number, questionIndex: number) => {
    // Mark current as visited if not already answered
    if (currentQuestion && questionStatuses.get(currentQuestion.id) === QuestionStatus.NOT_VISITED) {
      const newStatuses = new Map(questionStatuses);
      newStatuses.set(currentQuestion.id, QuestionStatus.NOT_ANSWERED);
      setQuestionStatuses(newStatuses);
    }
    
    setCurrentSectionIndex(sectionIndex);
    setCurrentQuestionIndex(questionIndex);
  };

  const handleNext = () => {
    if (!currentSection) return;
    
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      navigateToQuestion(currentSectionIndex, currentQuestionIndex + 1);
    } else if (currentSectionIndex < (attempt?.sections.length || 0) - 1) {
      navigateToQuestion(currentSectionIndex + 1, 0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentSectionIndex, currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = attempt?.sections[currentSectionIndex - 1];
      if (prevSection) {
        navigateToQuestion(currentSectionIndex - 1, prevSection.questions.length - 1);
      }
    }
  };

  const handleSubmit = async () => {
    // Submit test logic
    setShowSubmitConfirmation(false);
    router.push(`/results/${attempt?.attemptId}`);
  };

  if (loading || !attempt) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  const getQuestionStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case QuestionStatus.ANSWERED:
        return darkMode ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-green-100 border-green-500 text-green-700';
      case QuestionStatus.NOT_ANSWERED:
        return darkMode ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-red-100 border-red-500 text-red-700';
      case QuestionStatus.MARKED_FOR_REVIEW:
        return darkMode ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case QuestionStatus.ANSWERED_AND_MARKED:
        return darkMode ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-purple-100 border-purple-500 text-purple-700';
      default:
        return darkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 300) return 'text-red-500'; // Last 5 minutes
    if (timeLeft < 900) return 'text-yellow-500'; // Last 15 minutes
    return darkMode ? 'text-white' : 'text-gray-900';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
      {/* Top Bar - Timer & Test Info */}
      <div className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{
        backgroundColor: darkMode ? 'rgba(10, 15, 20, 0.58)' : 'rgba(255, 255, 255, 0.55)',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
      }}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Test Portal
            </h1>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentSection?.name}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${getTimerColor()}`} />
              <span className={`text-lg font-mono font-bold ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <button
              onClick={() => setShowSubmitConfirmation(true)}
              className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] transition-colors text-sm font-medium"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Main Content - Question Display */}
        <div className="lg:col-span-3 space-y-4">
          {/* Question Card */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Question {currentQuestionIndex + 1}
              </h2>
              <span className={`text-sm px-3 py-1 rounded-full ${
                darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {currentQuestion?.marks} Marks
              </span>
            </div>

            {/* Question Text */}
            <div className={`text-base leading-relaxed mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              {currentQuestion?.questionText ? (
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: currentQuestion.questionText
                      .replace(/\$\$([^$]+)\$\$/g, '<span class="math-display bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded font-mono text-sm">$1</span>')
                      .replace(/\$([^$]+)\$/g, '<span class="math-inline bg-blue-50 dark:bg-blue-900/20 px-1 rounded font-mono text-sm">$1</span>')
                  }} 
                />
              ) : (
                <p className="text-gray-500 italic">No question text available</p>
              )}
            </div>

            {/* Options - MCQ */}
            {currentQuestion?.type === 'MCQ_SINGLE' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers.get(currentQuestion.id)?.selectedOptions?.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer({ selectedOptions: [option.id] })}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? darkMode
                            ? 'border-[#2596be] bg-[#2596be]/20'
                            : 'border-[#2596be] bg-[#2596be]/10'
                          : darkMode
                          ? 'border-white/10 hover:border-white/20 bg-white/5'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? darkMode
                              ? 'border-[#60DFFF] bg-[#2596be]'
                              : 'border-[#2596be] bg-[#2596be]'
                            : darkMode
                            ? 'border-white/30'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {String.fromCharCode(65 + idx)}. {option.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numerical Answer */}
            {currentQuestion?.type === 'NUMERICAL' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your Answer
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={answers.get(currentQuestion.id)?.numericalAnswer || ''}
                  onChange={(e) => handleAnswer({ numericalAnswer: parseFloat(e.target.value) })}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be]'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be]'
                  }`}
                  placeholder="Enter your numerical answer"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMarkForReview}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              <Flag className="h-4 w-4" />
              Mark for Review
            </button>

            <button
              onClick={handleClearResponse}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Clear Response
            </button>

            <div className="flex-1"></div>

            <button
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] transition-colors font-medium"
            >
              Save & Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sidebar - Question Palette */}
        <div className="lg:col-span-1">
          <div className={`sticky top-24 p-4 sm:p-6 rounded-2xl border backdrop-blur-2xl max-h-[calc(100vh-120px)] overflow-y-auto ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <h3 className={`text-base sm:text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Questions
            </h3>

            {/* Legend */}
            <div className="space-y-1.5 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-500"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-yellow-500"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-purple-500"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Answered & Marked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${darkMode ? 'bg-white/20' : 'bg-gray-300'}`}></div>
                <span className={darkMode? 'text-gray-400' : 'text-gray-600'}>Not Visited</span>
              </div>
            </div>

            {/* Question Grid */}
            {attempt?.sections.map((section, sIdx) => (
              <div key={section.sectionId} className="mb-6 last:mb-0">
                <h4 className={`text-xs sm:text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {section.name}
                </h4>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {section.questions.map((q, qIdx) => {
                    const status = questionStatuses.get(q.id) || QuestionStatus.NOT_VISITED;
                    const isCurrent = sIdx === currentSectionIndex && qIdx === currentQuestionIndex;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => navigateToQuestion(sIdx, qIdx)}
                        className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                          isCurrent ? 'ring-2 ring-[#2596be] ring-offset-1' : ''
                        } ${getQuestionStatusColor(status)}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`max-w-md w-full p-6 rounded-2xl border ${
            darkMode ? 'bg-[#071219] border-white/10' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Submit Test?
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to submit the test? You won't be able to make changes after submission.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirmation(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  darkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] font-medium"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
