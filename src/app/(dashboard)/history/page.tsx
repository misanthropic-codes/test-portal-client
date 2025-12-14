'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockTests } from '@/services/mock/mockData';
import { Test } from '@/types';
import { ArrowLeft, Clock, Award, Calendar, TrendingUp, FileText } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [attemptedTests, setAttemptedTests] = useState<Test[]>([]);

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
    // Get tests that user has attempted
    const attempted = mockTests.filter(t => t.isAttempted);
    setAttemptedTests(attempted);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{
        backgroundColor: darkMode ? 'rgba(10, 15, 20, 0.58)' : 'rgba(255, 255, 255, 0.55)',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Test History
            </h1>
          </div>
          <button
            onClick={() => {
              document.documentElement.classList.toggle('dark');
              localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
            }}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            {darkMode ? (
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {attemptedTests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No Tests Attempted Yet
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Start taking tests to see your history here
            </p>
            <button
              onClick={() => router.push('/tests')}
              className="px-6 py-3 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] font-medium"
            >
              Browse Tests
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {attemptedTests.map((test) => (
              <div
                key={test.id}
                className={`p-6 rounded-2xl border backdrop-blur-2xl hover:scale-[1.01] transition-all ${
                  darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/90 border-gray-200 hover:bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {test.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Calendar className="h-4 w-4" />
                        {test.userAttempts && test.userAttempts.length > 0
                          ? new Date(test.userAttempts[0].completedAt).toLocaleDateString()
                          : 'Recently'}
                      </span>
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock className="h-4 w-4" />
                        {test.duration} minutes
                      </span>
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <FileText className="h-4 w-4" />
                        {test.totalQuestions} questions
                      </span>
                    </div>
                  </div>

                  {test.userAttempts && test.userAttempts.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Score
                        </p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {test.userAttempts[0].score}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Rank
                        </p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          #{test.userAttempts[0].rank}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/results/${test.userAttempts![0].attemptId}`)}
                        className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] font-medium"
                      >
                        View Result
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
