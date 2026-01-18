'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { testsService, QuestionData } from '@/services/tests.service';
import { Clock, AlertCircle, Check, Flag, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const attemptId = params.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [endTime, setEndTime] = useState<string>('');
  const [testTitle, setTestTitle] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    setDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await testsService.getTestQuestions(attemptId);
        
        setQuestions(response.data.questions);
        setTestTitle(response.data.testTitle);
        setEndTime(response.data.endTime);
        
        // Calculate remaining time
        const end = new Date(response.data.endTime).getTime();
        const now = new Date().getTime();
        const remaining = Math.floor((end - now) / 1000);
        setRemainingSeconds(remaining > 0 ? remaining : 0);

        // Initialize answers and marked for review from saved state
        const initialAnswers = new Map<string, string>();
        const initialMarked = new Set<string>();
        
        response.data.questions.forEach(q => {
          if (q.savedAnswer) {
            initialAnswers.set(q.questionId, q.savedAnswer);
          }
          if (q.isMarkedForReview) {
            initialMarked.add(q.questionId);
          }
        });

        setAnswers(initialAnswers);
        setMarkedForReview(initialMarked);
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        alert('Failed to load test. Redirecting...');
        router.push('/my-tests');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [attemptId, isAuthenticated, router]);

  // Timer countdown
  useEffect(() => {
    if (remainingSeconds <=  0) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const handleAutoSubmit = async () => {
    try {
      const response = await testsService.submitTest(attemptId);
      router.push(`/results/${attemptId}`);
    } catch (err) {
      console.error('Auto-submit failed:', err);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const saveAnswer = useCallback(async (questionId: string, answer: string) => {
    try {
      await testsService.saveAnswer(attemptId, questionId, answer, 0);
    } catch (err) {
      console.error('Error saving answer:', err);
    }
  }, [attemptId]);

  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion) return;
    
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentQuestion.questionId, answer);
      return newAnswers;
    });

    // Save immediately
    saveAnswer(currentQuestion.questionId, answer);

    // Update question state
    setQuestions(prev => prev.map(q => 
      q.questionId === currentQuestion.questionId 
        ? { ...q, savedAnswer: answer, isAnswered: true }
        : q
    ));
  };

  const handleMarkForReview = async () => {
    if (!currentQuestion) return;
    
    const isMarked = markedForReview.has(currentQuestion.questionId);
    
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (isMarked) {
        newSet.delete(currentQuestion.questionId);
      } else {
        newSet.add(currentQuestion.questionId);
      }
      return newSet;
    });

    try {
      await testsService.markForReview(attemptId, currentQuestion.questionId, !isMarked);
      
      // Update question state
      setQuestions(prev => prev.map(q => 
        q.questionId === currentQuestion.questionId 
          ? { ...q, isMarkedForReview: !isMarked }
          : q
      ));
    } catch (err) {
      console.error('Error marking for review:', err);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await testsService.submitTest(attemptId);
      router.push(`/results/${attemptId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit test');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (q: QuestionData) => {
    if (q.isAnswered || answers.has(q.questionId)) {
      if (q.isMarkedForReview || markedForReview.has(q.questionId)) {
        return 'answered-marked';
      }
      return 'answered';
    }
    if (q.isMarkedForReview || markedForReview.has(q.questionId)) {
      return 'marked';
    }
    return 'not-answered';
  };

  const getQuestionStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return darkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300';
      case 'answered-marked':
        return darkMode ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-300';
      case 'marked':
        return darkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return darkMode ? 'bg-white/10 text-gray-300 border-white/20' : 'bg-white text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items- center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className={darkMode ? 'text-white' : 'text-gray-900'}>No questions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
      {/* Top Bar */}
      <div className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        darkMode ? 'bg-[#0a0f14]/95 border-white/10' : 'bg-white/95 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {testTitle}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              remainingSeconds < 300 
                ? darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                : darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="h-5 w-5" />
              <span className="font-mono font-bold">{formatTime(remainingSeconds)}</span>
            </div>
            
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] font-semibold"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      <div className='flex'>
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className={`max-w-4xl mx-auto p-6 rounded-2xl border ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            {/* Question Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentQuestion.questionText}
                </h2>
              </div>
              <div className={`ml-4 px-3 py-1 rounded-lg text-sm font-semibold ${
                darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                +{currentQuestion.marks} | {currentQuestion.negativeMarks}
              </div>
            </div>

            {/* Question Image */}
            {currentQuestion.questionImage && (
              <div className="mb-6">
                <img src={currentQuestion.questionImage} alt="Question" className="max-w-full rounded-lg" />
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options?.map((option, idx) => {
                const optionKey = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = answers.get(currentQuestion.questionId) === option;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? darkMode
                          ? 'bg-[#2596be]/20 border-[#2596be] text-white'
                          : 'bg-[#2596be]/10 border-[#2596be] text-gray-900'
                        : darkMode
                          ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        isSelected
                          ? 'bg-[#2596be] text-white'
                          : darkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {optionKey}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isSelected && <Check className="h-5 w-5 text-[#2596be]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t" style={{
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgb(229, 231, 235)'
            }}>
              <button
                onClick={handleMarkForReview}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  markedForReview.has(currentQuestion.questionId)
                    ? 'bg-yellow-500 text-white'
                    : darkMode
                      ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Flag className="h-4 w-4" />
                {markedForReview.has(currentQuestion.questionId) ? 'Unmark' : 'Mark for Review'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : darkMode
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    currentQuestionIndex === questions.length - 1
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#2596be] text-white hover:bg-[#1e7ca0]'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Question Palette */}
        <div className={`w-80 border-l p-6 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Questions
          </h3>

          {/* Legend */}
          <div className="mb-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 bg-green-100 border-green-300"></div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 bg-yellow-100 border-yellow-300"></div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Marked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 bg-white border-gray-300"></div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Not Answered</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const status = getQuestionStatus(q);
              const isCurrent = idx === currentQuestionIndex;
              
              return (
               <button
                  key={q.questionId}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded border-2 font-semibold transition-all ${
                    isCurrent 
                      ? 'ring-2 ring-[#2596be] scale-110' 
                      : ''
                  } ${getQuestionStatusColor(status)}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl ${
            darkMode ? 'bg-[#111827]' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Submit Test?
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to submit the test? You won't be able to change your answers after submission.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                  darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] font-semibold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
