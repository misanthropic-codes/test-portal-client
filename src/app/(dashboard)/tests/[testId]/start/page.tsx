'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { testsService, TestDetails, InProgressAttemptResponse } from '@/services/tests.service';
import { Clock, FileText, AlertCircle, Play, ArrowLeft, Award, BookOpen, Users, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestStartPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [testData, setTestData] = useState<TestDetails | null>(null);
  const [inProgressAttempt, setInProgressAttempt] = useState<InProgressAttemptResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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

    const fetchTestData = async () => {
      try {
        setLoading(true);
        const testId = params.testId as string;
        
        // Fetch test details
        const testResponse = await testsService.getTestDetails(testId);
        setTestData(testResponse.data);

        // Check for in-progress attempt
        const inProgressResponse = await testsService.getInProgressAttempt(testId);
        if (inProgressResponse.data) {
          setInProgressAttempt(inProgressResponse.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load test details');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [params.testId, isAuthenticated, router]);

  const handleStartTest = async () => {
    if (!testData) return;

    try {
      setStarting(true);
      const response = await testsService.startTest(testData.id);
      
      // Store start data in sessionStorage so attempt page can use it directly
      sessionStorage.setItem('startData', JSON.stringify(response.data));
      
      // Navigate to test attempt page
      router.push(`/tests/attempt/${response.data.attemptId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to start test. Please try again.');
      setStarting(false);
    }
  };

  const handleResumeTest = async () => {
    if (!inProgressAttempt) return;

    try {
      setResuming(true);
      const response = await testsService.resumeAttempt(inProgressAttempt.attemptId);
      
      console.log('Resume API response:', response); // Debug
      console.log('Storing data:', response.data); // Debug
      console.log('Questions in response:', response.data?.questions?.length); // Debug
      
      // Store resume data in sessionStorage so attempt page can use it directly
      sessionStorage.setItem('resumeData', JSON.stringify(response.data));
      
      // Verify it was stored
      console.log('Stored in sessionStorage:', sessionStorage.getItem('resumeData')?.substring(0, 100));
      
      // Navigate to test attempt page
      router.push(`/tests/attempt/${inProgressAttempt.attemptId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to resume test. Please try again.');
      setResuming(false);
    }
  };


  const formatRemainingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
          <AlertCircle className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          <p className={`text-lg mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {error || 'Test not found'}
          </p>
          <button
            onClick={() => router.push('/my-tests')}
            className="px-6 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0]"
          >
            Back to My Tests
          </button>
        </div>
      </div>
    );
  }

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

        {/* Test Title Card */}
        <div className={`p-8 rounded-2xl border backdrop-blur-2xl mb-6 ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <h1 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {testData.title}
          </h1>
          <p className={`text-base mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {testData.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              {testData.examType}
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
            }`}>
              {testData.testType}
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
            }`}>
              {testData.difficulty}
            </div>
            {testData.isPaid && (
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
              }`}>
                Paid - ₹{testData.price}
              </div>
            )}
          </div>
        </div>

        {/* In-Progress Attempt Alert */}
        {inProgressAttempt && (
          <div className={`p-6 rounded-2xl border mb-6 ${
            darkMode ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}>
                <RotateCcw className={`h-6 w-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>
                  Test In Progress
                </h3>
                <p className={`text-sm mb-3 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                  You have an incomplete attempt for this test. You can resume where you left off.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Started:</span>
                    <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(inProgressAttempt.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Time Remaining:</span>
                    <span className={`ml-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatRemainingTime(inProgressAttempt.remainingTime)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleResumeTest}
                  disabled={resuming}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    resuming
                      ? 'bg-gray-400 cursor-not-allowed'
                      : darkMode
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {resuming ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Resuming...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-5 w-5" />
                      Resume Test
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Details */}
        <div className={`p-6 rounded-2xl border backdrop-blur-2xl mb-6 ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Test Details
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duration</p>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {testData.duration} min
              </p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Marks</p>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {testData.totalMarks}
              </p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Questions</p>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {testData.totalQuestions}
              </p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Students</p>
              <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {testData.stats.studentsAttempted}
              </p>
            </div>
          </div>

          {/* Marking Scheme */}
          <div className={`p-4 rounded-xl mb-4 ${
            darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
          }`}>
            <h3 className={`text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Marking Scheme
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Correct:</span>
                <span className={`ml-2 font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  +{testData.markingScheme.correctMarks}
                </span>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Incorrect:</span>
                <span className={`ml-2 font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {testData.markingScheme.incorrectMarks}
                </span>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Unattempted:</span>
                <span className={`ml-2 font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {testData.markingScheme.unattemptedMarks}
                </span>
              </div>
            </div>
          </div>

          {/* Previous Attempts */}
          {testData.userAttempts && testData.userAttempts.length > 0 && (
            <div className={`p-4 rounded-xl mb-4 ${
              darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm font-bold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                Previous Attempts: {testData.attemptCount}
              </p>
              <div className="space-y-2">
                {testData.userAttempts.slice(0, 3).map((attempt, idx) => (
                  <div key={attempt.attemptId} className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    Attempt {idx + 1}: {(attempt.percentage ?? 0).toFixed(1)}% 
                    {attempt.rank && ` • Rank: ${attempt.rank}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        {testData.sections && testData.sections.length > 0 && (
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl mb-6 ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Test Sections
            </h2>
            <div className="space-y-3">
              {testData.sections.map((section) => (
                <div key={section.id} className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {section.name}
                    </h3>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {section.subject}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Questions:</span> {section.questionCount}
                    </div>
                    <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Marks:</span> {section.marks}
                    </div>
                    {section.isTimed && (
                      <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Time:</span> {section.duration} min
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={`p-6 rounded-2xl border backdrop-blur-2xl mb-6 ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <FileText className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Important Instructions
            </h2>
          </div>

          <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {testData.instructions && testData.instructions.length > 0 ? (
              testData.instructions.map((instruction, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#2596be] font-bold">•</span>
                  <span>{instruction}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-[#2596be] font-bold">•</span>
                  <span>The test duration is <strong>{testData.duration} minutes</strong>. The timer will start as soon as you begin the test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2596be] font-bold">•</span>
                  <span>Each correct answer awards <strong>+{testData.markingScheme.correctMarks} marks</strong>, and each incorrect answer deducts <strong>{testData.markingScheme.incorrectMarks} marks</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2596be] font-bold">•</span>
                  <span>You can navigate between questions using the question palette on the right side.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2596be] font-bold">•</span>
                  <span>Your answers will be automatically saved. You can mark questions for review if you want to revisit them later.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2596be] font-bold">•</span>
                  <span>The test will be <strong>auto-submitted</strong> when the timer expires. Make sure to submit before time runs out.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2596be] font-bold">•</span>
                  <span>Once submitted, you <strong>cannot change your answers</strong>.</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Start Button - Only show if no in-progress attempt */}
        {!inProgressAttempt && (
          <>
            <div className="flex justify-center">
              <button
                onClick={handleStartTest}
                disabled={starting}
                className={`flex items-center gap-3 px-8 py-4 bg-[#2596be] text-white rounded-xl font-bold text-lg transition-all ${
                  starting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1e7ca0] hover:scale-105'
                }`}
              >
                {starting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Starting Test...
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6" />
                    Start Test Now
                  </>
                )}
              </button>
            </div>

            {/* Warning Note */}
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
              darkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                <strong>Note:</strong> Make sure you have a stable internet connection and at least {testData.duration} minutes of uninterrupted time before starting the test.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
