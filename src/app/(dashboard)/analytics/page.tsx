'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, TrendingUp, Target, Award, Clock, CheckCircle, XCircle, BarChart3, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
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

  // Mock analytics data
  const analytics = {
    totalTests: 45,
    averageScore: 245.5,
    averagePercentile: 78.5,
    bestRank: 123,
    totalStudyHours: 450,
    strengths: ['Calculus', 'Mechanics', 'Organic Chemistry'],
    weaknesses: ['Thermodynamics', 'Probability', 'Atomic Structure'],
    subjectWise: [
      { subject: 'Physics', tests: 15, avgScore: 68.5, accuracy: 70.2, timeSpent: 180 },
      { subject: 'Chemistry', tests: 15, avgScore: 72.3, accuracy: 75.8, timeSpent: 165 },
      { subject: 'Mathematics', tests: 15, avgScore: 75.1, accuracy: 78.5, timeSpent: 195 },
    ],
    recentTests: [
      { title: 'JEE Main Mock 15', score: 265, percentile: 85.2, date: '2024-12-10' },
      { title: 'NEET Mock 8', score: 620, percentile: 82.5, date: '2024-12-08' },
      { title: 'JEE Advanced Practice', score: 180, percentile: 79.8, date: '2024-12-05' },
    ],
    progressData: [
      { week: 'Week 1', score: 65 },
      { week: 'Week 2', score: 68 },
      { week: 'Week 3', score: 72 },
      { week: 'Week 4', score: 75 },
      { week: 'Week 5', score: 78 },
    ],
  };

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
              Performance Analytics
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
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <BarChart3 className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.totalTests}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Tests
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <TrendingUp className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.averageScore}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Score
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <Target className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.averagePercentile}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Percentile
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <Award className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              #{analytics.bestRank}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Best Rank
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <Clock className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.totalStudyHours}h
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Study Hours
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subject-wise Performance */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Subject-wise Performance
            </h3>
            <div className="space-y-6">
              {analytics.subjectWise.map((subject) => (
                <div key={subject.subject}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {subject.subject}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {subject.accuracy}% accuracy
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2596be] to-[#60DFFF]"
                      style={{ width: `${subject.accuracy}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                      {subject.tests} tests · {subject.avgScore} avg
                    </span>
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                      {subject.timeSpent}min total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Chart */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Score Progress
            </h3>
            <div className="space-y-4">
              {analytics.progressData.map((data, idx) => (
                <div key={data.week} className="flex items-center gap-4">
                  <span className={`text-sm w-16 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {data.week}
                  </span>
                  <div className="flex-1">
                    <div className={`w-full h-8 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-[#2596be] to-[#60DFFF] flex items-center justify-end pr-2"
                        style={{ width: `${data.score}%` }}
                      >
                        <span className="text-xs text-white font-semibold">{data.score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Strengths
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analytics.strengths.map((strength) => (
                <span
                  key={strength}
                  className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-6 w-6 text-red-500" />
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Areas to Improve
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analytics.weaknesses.map((weakness) => (
                <span
                  key={weakness}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-medium"
                >
                  {weakness}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
            Recent Tests
          </h3>
          <div className="space-y-4">
            {analytics.recentTests.map((test, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {test.title}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(test.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Score
                      </p>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {test.score}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Percentile
                      </p>
                      <p className={`text-lg font-bold text-[#2596be]`}>
                        {test.percentile}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
