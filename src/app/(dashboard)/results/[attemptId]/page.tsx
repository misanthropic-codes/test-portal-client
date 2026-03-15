'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { resultsService, AnswerKeyResponse, TestResultResponse } from '@/services/results.service';
import { ArrowLeft, Trophy, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MathRenderer } from '@/components/MathRenderer';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState<{
    answerKey: AnswerKeyResponse['data'];
    summary: TestResultResponse['data'] | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

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
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadResult = async () => {
      try {
        const attemptId = params.attemptId as string;
        
        // Fetch answer key
        const answerKeyRes = await resultsService.getAnswerKey(attemptId);
        
        // Try to fetch test result for summary, fallback to null if it fails
        let summaryData = null;
        try {
          const testResultRes = await resultsService.getTestResult(attemptId);
          summaryData = testResultRes.data;
        } catch (e) {
          console.warn('Could not fetch test result summary:', e);
        }

        setResult({
          answerKey: answerKeyRes.data,
          summary: summaryData
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [params.attemptId, isAuthenticated, router]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getOptionLabel = (optionId: string) => {
    return optionId.toUpperCase();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (!result || error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {error || 'Result Not Found'}
          </h2>
          <button
            onClick={() => router.push('/my-tests')}
            className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0]"
          >
            Back to My Tests
          </button>
        </div>
      </div>
    );
  }

  const answerKey = result.answerKey;
  const summary = result.summary;

  // Calculate statistics from answer key sections if summary is missing
  let totalMarks = 0;
  let marksObtained = 0;
  let totalQuestions = 0;
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;
  let timeTaken = 0;

  answerKey.sections.forEach(section => {
    section.questions.forEach(q => {
      totalQuestions++;
      totalMarks += q.marks || 4;
      marksObtained += q.marksObtained || 0;
      timeTaken += q.timeSpent || 0;

      const attempted = q.yourAnswer && 
        (q.yourAnswer.selectedOptions?.length > 0 || q.yourAnswer.numericalAnswer !== null);

      if (attempted) {
        if (q.isCorrect) correct++;
        else incorrect++;
      } else {
        unattempted++;
      }
    });
  });

  const pct = summary?.score.percentage ?? (totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0);
  const percentageColor = pct >= 75 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500';
  
  const testTitle = summary?.testTitle || answerKey.testTitle || 'Test Result';
  const displayMarksObtained = summary?.score.marksObtained ?? marksObtained;
  const displayTotalMarks = summary?.score.totalMarks ?? totalMarks;
  const displayTimeTaken = summary?.timeAnalysis.totalTimeSpent ?? timeTaken;
  
  const statsTotal = summary?.score.totalQuestions ?? totalQuestions;
  const statsAttempted = summary?.score.attemptedQuestions ?? (correct + incorrect);
  const statsCorrect = summary?.score.correctAnswers ?? correct;
  const statsIncorrect = summary?.score.incorrectAnswers ?? incorrect;
  const statsUnattempted = summary?.score.unanswered ?? unattempted;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/my-tests')}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
            darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Tests
        </button>

        {/* Score Card */}
        <div className={`p-8 rounded-2xl border backdrop-blur-2xl mb-6 ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-full ${
              pct >= 75 ? 'bg-green-500/20' : pct >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
            }`}>
              <Trophy className={`h-8 w-8 ${percentageColor}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {testTitle}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Score</p>
              <p className={`text-2xl font-bold ${percentageColor}`}>
                {displayMarksObtained}/{displayTotalMarks}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Percentage</p>
              <p className={`text-2xl font-bold ${percentageColor}`}>
                {pct.toFixed(1)}%
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time Taken</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatTime(displayTimeTaken)}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Accuracy</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {statsAttempted > 0 
                  ? ((statsCorrect / statsAttempted) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className={`p-6 rounded-2xl border backdrop-blur-2xl mb-6 ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Question Summary
          </h2>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {statsTotal}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{statsAttempted}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Attempted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{statsCorrect}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{statsIncorrect}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Incorrect</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {statsUnattempted}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unattempted</p>
            </div>
          </div>
        </div>

        {/* Answers Review */}
        <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Question Review
          </h2>
          
          <div className="space-y-6">
            {answerKey.sections.map((section, sIndex) => (
              <div key={section.sectionId} className="space-y-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {section.sectionName}
                </h3>
                {section.questions.map((answer, index) => {
                  const isExpanded = expandedQuestions.has(answer.questionId);
                  
                  return (
                    <div 
                      key={answer.questionId}
                      className={`rounded-xl border overflow-hidden ${
                        darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {/* Question Header */}
                      <button
                        onClick={() => toggleQuestion(answer.questionId)}
                        className="w-full p-4 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 ${
                            answer.isCorrect 
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}>
                            {answer.questionNumber || index + 1}
                          </span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                            {(answer.questionText || '').replace(/<[^>]+>/g, '')}
                          </span>
                        </div>
                    <div className="flex items-center gap-2">
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className={`font-semibold ${
                        answer.marksObtained >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {answer.marksObtained > 0 ? '+' : ''}{answer.marksObtained}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      ) : (
                        <ChevronDown className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      )}
                    </div>
                  </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                          <div className={`mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <MathRenderer content={answer.questionText} />
                          </div>

                          {/* Question Image (if any) */}
                          {answer.questionImageUrl && (
                            <div className="mb-4">
                              <img 
                                src={answer.questionImageUrl} 
                                alt="Question" 
                                className="max-w-full rounded-lg object-contain border bg-white"
                                style={{ maxHeight: '300px' }}
                              />
                            </div>
                          )}

                          {/* Options */}
                          {answer.options && answer.options.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {answer.options.map((option, optIndex) => {
                                const optionLabel = getOptionLabel(option.id);
                                const isSelected = answer.yourAnswer?.selectedOptions?.includes(option.id);
                                const isCorrectOpt = answer.correctAnswer?.selectedOptions?.includes(option.id) || option.isCorrect;
                          
                                let optionClass = darkMode ? 'bg-white/5 text-gray-300' : 'bg-white text-gray-700';
                                if (isCorrectOpt) {
                                  optionClass = 'bg-green-500/20 text-green-500 border-green-500';
                                } else if (isSelected && !isCorrectOpt) {
                                  optionClass = 'bg-red-500/20 text-red-500 border-red-500';
                                }
                                
                                return (
                                  <div 
                                    key={option.id}
                                    className={`p-3 rounded-lg border flex flex-col gap-2 ${optionClass} ${
                                      darkMode ? 'border-white/10' : 'border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-start">
                                      <span className="font-bold mr-2 mt-1">{optionLabel}.</span>
                                      <div className="flex-1">
                                        <MathRenderer content={option.text} />
                                      </div>
                                      {isCorrectOpt && <span className="ml-2 text-green-500 whitespace-nowrap">✓ Correct</span>}
                                      {isSelected && !isCorrectOpt && <span className="ml-2 text-red-500 whitespace-nowrap">✗ Your answer</span>}
                                    </div>
                                    {option.imageUrl && (
                                      <div className="mt-2 pl-6">
                                        <img 
                                          src={option.imageUrl} 
                                          alt={`Option ${optionLabel}`} 
                                          className="max-h-32 rounded border bg-white object-contain"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Numerical Answer */}
                          {answer.type === 'NUMERICAL' && (
                            <div className="space-y-2 mb-4">
                              <div className={`p-3 rounded-lg border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your answer: </span>
                                <span className={answer.isCorrect ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                  {answer.yourAnswer?.numericalAnswer ?? 'Not attempted'}
                                </span>
                              </div>
                              <div className={`p-3 rounded-lg border ${darkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                                <span className="font-semibold text-green-600">Correct answer: </span>
                                <span className="text-green-600 font-bold">
                                  {answer.correctAnswer?.numericalAnswer ?? 'N/A'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Explanation */}
                          {(answer.solutionText || (answer as any).explanation) && (
                            <div className={`p-4 rounded-lg mt-4 ${
                              darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                            }`}>
                              <p className={`text-sm font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                Explanation
                              </p>
                              <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                <MathRenderer content={answer.solutionText || (answer as any).explanation || ''} />
                              </div>
                            </div>
                          )}

                          {/* Solution Image */}
                          {answer.solutionImageUrl && (
                            <div className="mt-4">
                              <img 
                                src={answer.solutionImageUrl} 
                                alt="Solution" 
                                className="max-w-full rounded-lg border bg-white object-contain"
                                style={{ maxHeight: '400px' }}
                              />
                            </div>
                          )}

                          {/* Time Spent */}
                          <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Clock className="inline h-4 w-4 mr-1" />
                            Time spent: {answer.timeSpent}s
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => router.push('/my-tests')}
            className={`px-6 py-3 rounded-xl font-semibold ${
              darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Back to My Tests
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-[#2596be] text-white rounded-xl font-semibold hover:bg-[#1e7ca0]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
