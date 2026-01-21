'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { testsService, QuestionData, SectionData, SubmitAnswerItem } from '@/services/tests.service';
import { Clock, AlertCircle, Check, Flag, X, Save, Cloud, CloudOff, Loader2 } from 'lucide-react';
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [unsavedAnswers, setUnsavedAnswers] = useState<SubmitAnswerItem[]>([]);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false); // Prevent double loading in Strict Mode

  // Helper to get consistent question ID from either 'id' or 'questionId' field
  const getQuestionId = (q: QuestionData): string => q.id || q.questionId || '';

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

    // Prevent double loading in React Strict Mode
    if (hasLoadedRef.current) return;

    const loadTestData = async () => {
      try {
        hasLoadedRef.current = true; // Mark as loading
        setLoading(true);
        
        // Check if we have start data in sessionStorage (from new start API)
        const storedStartData = sessionStorage.getItem('startData');
        // Check if we have resume data in sessionStorage
        const storedResumeData = sessionStorage.getItem('resumeData');
        
        if (storedStartData) {
          // Use start data directly - new API returns questions in sections
          const startData = JSON.parse(storedStartData);
          sessionStorage.removeItem('startData'); // Clear after use
          
          console.log('Start data loaded:', startData);
          
          // Flatten questions from all sections
          const allQuestions: QuestionData[] = [];
          startData.sections?.forEach((section: any) => {
            section.questions?.forEach((q: any) => {
              allQuestions.push({
                ...q,
                questionId: q.id || q.questionId,
                timeSpent: q.timeSpent || 0,
              });
            });
          });
          
          console.log('Questions loaded from start:', allQuestions.length);
          
          setQuestions(allQuestions);
          setTestTitle(startData.test?.title || 'Test');
          setEndTime(startData.timing?.endTime || '');
          setRemainingSeconds(startData.timing?.remainingTime || 0);

          // Initialize answers and marked for review (should be empty for new start)
          const initialAnswers = new Map<string, string>();
          const initialMarked = new Set<string>();
          
          allQuestions.forEach((q: any) => {
            const qId = q.id || q.questionId || '';
            if (q.savedAnswer) {
              initialAnswers.set(qId, q.savedAnswer);
            }
            if (q.isMarkedForReview) {
              initialMarked.add(qId);
            }
          });

          setAnswers(initialAnswers);
          setMarkedForReview(initialMarked);
        } else if (storedResumeData) {
          // Use resume data directly - stored response is { success, data, message }
          const response = JSON.parse(storedResumeData);
          sessionStorage.removeItem('resumeData'); // Clear after use
          
          // The actual data is in response.data or response directly depending on how it was stored
          const resumeData = response.data || response;
          
          console.log('Resume data loaded:', resumeData); // Debug log
          
          const questionsData = resumeData.questions || [];
          console.log('Questions found:', questionsData.length); // Debug log
          
          setQuestions(questionsData);
          setTestTitle(resumeData.test?.title || 'Test');
          setEndTime(resumeData.endTime || '');
          setRemainingSeconds(resumeData.remainingTime || 0);

          // Initialize answers and marked for review
          const initialAnswers = new Map<string, string>();
          const initialMarked = new Set<string>();
          
          questionsData.forEach((q: any) => {
            if (q.savedAnswer) {
              initialAnswers.set(q.questionId, q.savedAnswer);
            }
            if (q.isMarkedForReview) {
              initialMarked.add(q.questionId);
            }
          });

          setAnswers(initialAnswers);
          setMarkedForReview(initialMarked);
        } else {
          // Fetch from API - new format returns questions inside sections
          const response = await testsService.getTestQuestions(attemptId);
          
          if (!response?.data) {
            throw new Error('Invalid response from server');
          }
          
          // Flatten questions from all sections and normalize field names
          const allQuestions: QuestionData[] = [];
          response.data.sections?.forEach(section => {
            section.questions.forEach(q => {
              allQuestions.push({
                ...q,
                // Normalize to use questionId consistently
                questionId: q.id || q.questionId,
                // Normalize question type if needed
                timeSpent: q.timeSpent || 0,
              });
            });
          });
          
          console.log('Questions loaded from API:', allQuestions.length);
          setQuestions(allQuestions);
          setTestTitle('Test'); // Title not in new response, using default
          
          // Get remaining time from status endpoint if needed
          try {
            const statusResponse = await testsService.getAttemptStatus(attemptId);
            if (statusResponse?.data) {
              setRemainingSeconds(statusResponse.data.remainingTime || 0);
              setEndTime(statusResponse.data.endTime || '');
              if (statusResponse.data.testTitle) {
                setTestTitle(statusResponse.data.testTitle);
              }
            }
          } catch (statusErr) {
            console.error('Could not fetch status for timer:', statusErr);
            // Default to 3 hours if we can't get the time
            setRemainingSeconds(3 * 60 * 60);
          }

          // Initialize answers and marked for review
          const initialAnswers = new Map<string, string>();
          const initialMarked = new Set<string>();
          
          allQuestions.forEach(q => {
            const qId = q.id || q.questionId || '';
            if (q.savedAnswer) {
              initialAnswers.set(qId, q.savedAnswer);
            }
            if (q.isMarkedForReview) {
              initialMarked.add(qId);
            }
          });

          setAnswers(initialAnswers);
          setMarkedForReview(initialMarked);
        }
      } catch (err: any) {
        console.error('Error loading test data:', err);
        alert('Failed to load test. Redirecting...');
        router.push('/my-tests');
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, [attemptId, isAuthenticated, router]);

  // Timer countdown
  useEffect(() => {
    if (remainingSeconds <= 0 || loading) return;

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
  }, [remainingSeconds, loading]);

  const handleAutoSubmit = async () => {
    try {
      // Build answers payload
      const answersPayload: SubmitAnswerItem[] = questions
        .filter(q => answers.has(getQuestionId(q)))
        .map(q => {
          const qId = getQuestionId(q);
          return {
            questionId: qId,
            sectionId: 'default',
            answer: { selectedOptions: [answers.get(qId)!] },
            timeSpent: q.timeSpent || 0
          };
        });

      await testsService.submitTest(attemptId, { answers: answersPayload });
      router.push(`/results/${attemptId}`);
    } catch (err) {
      console.error('Auto-submit failed:', err);
    }
  };

  // Auto-save effect: triggers when 2+ unsaved answers are collected
  useEffect(() => {
    if (unsavedAnswers.length >= 2) {
      handleSaveProgress();
    }
  }, [unsavedAnswers]);

  // Save progress function
  const handleSaveProgress = async () => {
    if (unsavedAnswers.length === 0) return;
    
    setSaveStatus('saving');
    try {
      await testsService.saveProgress(attemptId, unsavedAnswers);
      setUnsavedAnswers([]); // Clear after successful save
      setSaveStatus('saved');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error saving progress:', err);
      setSaveStatus('error');
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  // Manual save button handler
  const handleManualSave = async () => {
    // Build payload with all current answers
    const allAnswersPayload: SubmitAnswerItem[] = questions
      .filter(q => answers.has(getQuestionId(q)))
      .map(q => {
        const qId = getQuestionId(q);
        return {
          questionId: qId,
          sectionId: 'default',
          answer: { selectedOptions: [answers.get(qId)!] },
          timeSpent: q.timeSpent || 0
        };
      });
    
    if (allAnswersPayload.length === 0) return;
    
    setSaveStatus('saving');
    try {
      await testsService.saveProgress(attemptId, allAnswersPayload);
      setUnsavedAnswers([]); // Clear unsaved
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Error saving progress:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const qId = getQuestionId(currentQuestion);
    
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(qId, answer);
      return newAnswers;
    });

    // Update question state locally (saved to server on submit)
    setQuestions(prev => prev.map(q => 
      getQuestionId(q) === qId
        ? { ...q, savedAnswer: answer, isAnswered: true }
        : q
    ));

    // Track for auto-save
    const answerItem: SubmitAnswerItem = {
      questionId: qId,
      sectionId: 'default',
      answer: { selectedOptions: [answer] },
      timeSpent: currentQuestion.timeSpent || 0
    };
    setUnsavedAnswers(prev => {
      // Replace if already exists, otherwise add
      const existing = prev.findIndex(a => a.questionId === qId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = answerItem;
        return updated;
      }
      return [...prev, answerItem];
    });
  };

  const handleMarkForReview = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const qId = getQuestionId(currentQuestion);
    const isMarked = markedForReview.has(qId);
    
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (isMarked) {
        newSet.delete(qId);
      } else {
        newSet.add(qId);
      }
      return newSet;
    });

    try {
      await testsService.markForReview(attemptId, qId, !isMarked);
      
      // Update question state
      setQuestions(prev => prev.map(q => 
        getQuestionId(q) === qId
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
      // Build answers payload from current state
      const answersPayload: SubmitAnswerItem[] = questions
        .filter(q => answers.has(getQuestionId(q)))
        .map(q => {
          const qId = getQuestionId(q);
          const selectedAnswer = answers.get(qId)!;
          
          return {
            questionId: qId,
            sectionId: 'default', // Default section ID
            answer: {
              selectedOptions: [selectedAnswer] // For single-correct questions
            },
            timeSpent: q.timeSpent || 0
          };
        });

      console.log('Submitting answers:', answersPayload);

      const response = await testsService.submitTest(attemptId, { answers: answersPayload });
      // Use resultId from response for redirect
      router.push(`/results/${response.data.resultId}`);
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
    const qId = getQuestionId(q);
    if (q.isAnswered || answers.has(qId)) {
      if (q.isMarkedForReview || markedForReview.has(qId)) {
        return 'answered-marked';
      }
      return 'answered';
    }
    if (q.isMarkedForReview || markedForReview.has(qId)) {
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

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

  // No questions state
  if (!currentQuestion || questions.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className={darkMode ? 'text-white' : 'text-gray-900'}>No questions found</p>
          <button
            onClick={() => router.push('/my-tests')}
            className="mt-4 px-4 py-2 bg-[#2596be] text-white rounded-lg"
          >
            Back to My Tests
          </button>
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
            {/* Save Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              saveStatus === 'saving' 
                ? darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                : saveStatus === 'saved'
                  ? darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                  : saveStatus === 'error'
                    ? darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                    : darkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
              {saveStatus === 'saved' && <Cloud className="h-4 w-4" />}
              {saveStatus === 'error' && <CloudOff className="h-4 w-4" />}
              {saveStatus === 'idle' && <Cloud className="h-4 w-4" />}
              <span>
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved ✓'}
                {saveStatus === 'error' && 'Save failed'}
                {saveStatus === 'idle' && (unsavedAnswers.length > 0 ? `${unsavedAnswers.length} unsaved` : 'Saved')}
              </span>
            </div>

            {/* Manual Save Button */}
            <button
              onClick={handleManualSave}
              disabled={saveStatus === 'saving' || answers.size === 0}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                saveStatus === 'saving' || answers.size === 0
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : darkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Save className="h-4 w-4" />
              Save
            </button>

            {/* Timer */}
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
            {(currentQuestion.questionImage || currentQuestion.questionImageUrl) && (
              <div className="mb-6">
                <img 
                  src={currentQuestion.questionImage || currentQuestion.questionImageUrl} 
                  alt="Question" 
                  className="max-w-full rounded-lg" 
                />
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options?.map((option, idx) => {
                const optionKey = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = answers.get(getQuestionId(currentQuestion)) === option;
                
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
                  markedForReview.has(getQuestionId(currentQuestion))
                    ? 'bg-yellow-500 text-white'
                    : darkMode
                      ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Flag className="h-4 w-4" />
                {markedForReview.has(getQuestionId(currentQuestion)) ? 'Unmark' : 'Mark for Review'}
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
                  key={getQuestionId(q)}
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
