'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockTestService } from '@/services/mock/mockData';
import { Test } from '@/types';
import Link from 'next/link';
import { formatExamType, formatTestType, formatDifficulty } from '@/utils/formatters';
import { ArrowLeft, Clock, FileText, Award, AlertCircle, CheckCircle, User, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { logout } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
    const loadTest = async () => {
      try {
        const testId = params.testId as string;
        const data = await mockTestService.getTestById(testId);
        setTest(data);
      } catch (error) {
        console.error('Error loading test:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [params.testId]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Test Not Found</h2>
          <Link href="/tests" className="text-[#2596be] hover:underline">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur-xl" style={{
        backgroundColor: darkMode ? 'rgba(10, 15, 20, 0.58)' : 'rgba(255, 255, 255, 0.55)',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
      }}>
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/dashboard" className={`font-bold text-lg sm:text-xl ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Test Portal
            </Link>
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm">
              <Link href="/dashboard" className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-[#2596be]'}`}>
                Dashboard
              </Link>
              <Link href="/tests" className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Tests
              </Link>
              <Link href="/analytics" className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-[#2596be]'}`}>
                Analytics
              </Link>
              <Link href="/history" className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-[#2596be]'}`}>
                History
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                const html = document.documentElement;
                html.classList.toggle('dark');
                localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
              }}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link href="/profile" className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              <User className="h-5 w-5" />
            </Link>
            <button onClick={logout} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 mb-6 transition-colors ${
            darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-[#2596be]'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Tests</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Header */}
            <div className={`p-6 rounded-2xl border backdrop-blur-2xl shadow-lg ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
            }`}>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  darkMode ? 'bg-[#2596be]/20 text-[#60DFFF]' : 'bg-[#2596be]/10 text-[#2596be]'
                }`}>
                  {formatExamType(test.examType)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {formatTestType(test.testType)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {formatDifficulty(test.difficulty)}
                </span>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                {test.title}
              </h1>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {test.description}
              </p>
            </div>

            {/* Test Stats */}
            <div className={`p-6 rounded-2xl border backdrop-blur-2xl shadow-lg ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Test Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Duration
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {test.duration} min
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Questions
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {test.totalQuestions}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Total Marks
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {test.totalMarks}
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            {test.sections && test.sections.length > 0 && (
              <div className={`p-6 rounded-2xl border backdrop-blur-2xl shadow-lg ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                  Test Sections
                </h2>
                <div className="space-y-3">
                  {test.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        darkMode ? 'bg-white/5' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {section.name}
                        </h3>
                        {section.isTimed && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            darkMode ? 'bg-[#2596be]/20 text-[#60DFFF]' : 'bg-[#2596be]/10 text-[#2596be]'
                          }`}>
                            Timed Section
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {section.questionCount} questions
                        </span>
                        {section.duration && (
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {section.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className={`p-6 rounded-2xl border backdrop-blur-2xl shadow-lg ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Instructions
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-[#60DFFF]' : 'text-[#2596be]'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Read all questions carefully before answering
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-[#60DFFF]' : 'text-[#2596be]'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Each question carries equal marks unless specified
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-[#60DFFF]' : 'text-[#2596be]'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Negative marking may apply for incorrect answers
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-[#60DFFF]' : 'text-[#2596be]'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    You can mark questions for review and return to them later
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-[#60DFFF]' : 'text-[#2596be]'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Test will auto-submit when time expires
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Start Test Card */}
              <div className={`p-6 rounded-2xl border backdrop-blur-2xl shadow-lg ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                  Ready to Start?
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Duration:</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {test.duration} min
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Questions:</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {test.totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Marks:</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {test.totalMarks}
                    </span>
                  </div>
                </div>

                <button
              onClick={async () => {
                if (!test) return;
                try {
                  const attempt = await mockTestService.startTest(test.id);
                  // Store attempt in localStorage for the test page to retrieve
                  localStorage.setItem(`attempt_${attempt.attemptId}`, JSON.stringify(attempt));
                  router.push(`/test/${attempt.attemptId}`);
                } catch (error) {
                  console.error('Error starting test:', error);
                }
              }}
              className="w-full py-3 px-4 bg-[#2596be] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1e7ca0] transition-colors"
            >
              Start Test Now
            </button>

                <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  By starting, you agree to complete the test in one sitting
                </p>
              </div>

              {/* Quick Stats */}
              <div className={`p-6 rounded-2xl border backdrop-blur-2xl shadow-lg ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                  Quick Stats
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Verified Test
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {test.attemptCount || 0} students attempted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
