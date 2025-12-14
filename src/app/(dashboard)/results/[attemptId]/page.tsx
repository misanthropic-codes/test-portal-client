'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockResultsService } from '@/services/mock/mockData';
import { TestResult } from '@/types';
import { ArrowLeft, Trophy, TrendingUp, Clock, Target, Award, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<TestResult | null>(null);
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
    const loadResult = async () => {
      try {
        const attemptId = params.attemptId as string;
        const resultData = await mockResultsService.getResult(attemptId);
        setResult(resultData);
      } catch (error) {
        console.error('Error loading result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [params.attemptId]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Result Not Found
          </h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const percentageColor = result.percentage >= 75 ? 'text-green-500' : result.percentage >= 50 ? 'text-yellow-500' : 'text-red-500';

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
              Test Results
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
        {/* Score Card */}
        <div className={`mb-8 p-8 rounded-2xl border backdrop-blur-2xl text-center ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
        }`}>
          <Trophy className={`h-16 w-16 mx-auto mb-4 ${percentageColor}`} />
          <h2 className={`text-3xl sm:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {result.score} / {result.totalMarks}
          </h2>
          <p className={`text-xl ${percentageColor} font-semibold mb-4`}>
            {result.percentage.toFixed(2)}%
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {result.testTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Rank Card */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-5 w-5 text-[#2596be]" />
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Your Rank
              </h3>
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              #{result.rank}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              out of {result.totalAttempts} students
            </p>
          </div>

          {/* Percentile Card */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-[#2596be]" />
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Percentile
              </h3>
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {result.percentile.toFixed(2)}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Better than {result.percentile.toFixed(0)}% students
            </p>
          </div>

          {/* Time Card */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-[#2596be]" />
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Time Taken
              </h3>
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {result.timeTaken}m
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Speed: {result.speedAccuracy.speed.toFixed(2)} q/min
            </p>
          </div>
        </div>

        {/* Subject-wise Performance */}
        <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-2xl ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
            Subject-wise Performance
          </h3>
          <div className="space-y-4">
            {result.subjectWise.map((subject) => (
              <div key={subject.subject}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {subject.subject}
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {subject.score} / {subject.totalMarks} ({subject.accuracy.toFixed(1)}%)
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2596be] to-[#60DFFF]"
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-green-500">
                    <CheckCircle className="h-3 w-3" />
                    {subject.correctAnswers} Correct
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <XCircle className="h-3 w-3" />
                    {subject.incorrectAnswers} Incorrect
                  </span>
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <AlertCircle className="h-3 w-3" />
                    {subject.unattempted} Unattempted
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Comparison */}
        <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-2xl ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
            Performance Comparison
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your Score
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {result.comparison.yourScore}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Average Score
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {result.comparison.averageScore}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Topper Score
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {result.comparison.topperScore}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              darkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/tests')}
            className="px-6 py-3 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] font-medium"
          >
            Take Another Test
          </button>
        </div>
      </main>
    </div>
  );
}
