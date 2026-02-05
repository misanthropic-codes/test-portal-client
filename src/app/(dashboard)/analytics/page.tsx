'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, TrendingUp, Target, Award, Clock, CheckCircle, XCircle, BarChart3, Activity, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { analyticsService, UserAnalytics } from '@/services/analytics.service';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getUserAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'text-green-500';
      case 'moderate':
        return 'text-yellow-500';
      case 'weak':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStrengthBgColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-500/20';
      case 'moderate':
        return 'bg-yellow-500/20';
      case 'weak':
        return 'bg-red-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{
          backgroundColor: darkMode ? 'rgba(10, 15, 20, 0.58)' : 'rgba(255, 255, 255, 0.55)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
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
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className={`h-12 w-12 animate-spin mx-auto mb-4 ${darkMode ? 'text-white/50' : 'text-gray-400'}`} />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{
          backgroundColor: darkMode ? 'rgba(10, 15, 20, 0.58)' : 'rgba(255, 255, 255, 0.55)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
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
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className={`h-12 w-12 mx-auto mb-4 text-red-500`} />
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 rounded-lg bg-[#2596be] text-white hover:bg-[#1d7a9a] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{
          backgroundColor: darkMode ? 'rgba(10, 15, 20, 0.58)' : 'rgba(255, 255, 255, 0.55)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
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
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BarChart3 className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-white/30' : 'text-gray-300'}`} />
            <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Analytics Yet</h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Complete some tests to see your performance analytics</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnalytics}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <BarChart3 className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.overview.testsAttempted}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tests Taken
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <Target className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.overview.overallAccuracy.toFixed(1)}%
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Accuracy
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <TrendingUp className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.overview.bestScore.toFixed(1)}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Best Score
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <Award className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              #{analytics.overview.bestRank || '-'}
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
              {analytics.overview.totalStudyTime}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Study Time
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <Activity className="h-8 w-8 text-[#2596be] mb-2" />
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {analytics.overview.totalQuestionsAttempted}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Questions
            </p>
          </div>
        </div>

        {/* Questions Overview */}
        <div className={`p-6 rounded-2xl border backdrop-blur-2xl mb-8 ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
            Questions Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.overview.totalQuestionsAttempted}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Attempted</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">
                {analytics.overview.totalCorrectAnswers}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Correct</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">
                {analytics.overview.totalIncorrectAnswers}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Incorrect</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {analytics.overview.totalUnattempted}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skipped</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subject-wise Performance */}
          {analytics.subjectAnalytics.length > 0 && (
            <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Subject-wise Performance
              </h3>
              <div className="space-y-6">
                {analytics.subjectAnalytics.map((subject) => (
                  <div key={subject.subject}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {subject.subject}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStrengthBgColor(subject.strength)} ${getStrengthColor(subject.strength)}`}>
                          {subject.strength}
                        </span>
                      </div>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {subject.accuracy.toFixed(1)}% accuracy
                      </span>
                    </div>
                    <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full rounded-full ${
                          subject.strength === 'strong' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                          subject.strength === 'moderate' ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                          'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(subject.accuracy, 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                        {subject.correctAnswers}/{subject.questionsAttempted} correct
                      </span>
                      <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                        Avg: {subject.avgTimePerQuestion}s/q
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Breakdown */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Difficulty Breakdown
            </h3>
            <div className="space-y-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => {
                const data = analytics.difficultyAnalytics[level];
                const colors = {
                  easy: { bar: 'from-green-500 to-green-400', text: 'text-green-500' },
                  medium: { bar: 'from-yellow-500 to-yellow-400', text: 'text-yellow-500' },
                  hard: { bar: 'from-red-500 to-red-400', text: 'text-red-500' }
                };
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold capitalize ${colors[level].text}`}>
                        {level}
                      </span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {data.accuracy.toFixed(1)}% ({data.correct}/{data.attempted})
                      </span>
                    </div>
                    <div className={`w-full h-8 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full rounded-lg bg-gradient-to-r ${colors[level].bar} flex items-center justify-end pr-2`}
                        style={{ width: `${Math.max(5, data.accuracy)}%` }}
                      >
                        {data.accuracy > 15 && (
                          <span className="text-xs text-white font-semibold">{data.accuracy.toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Topic Analytics */}
          {analytics.topicAnalytics.length > 0 && (
            <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Topic Performance
              </h3>
              <div className="space-y-3">
                {analytics.topicAnalytics.map((topic, idx) => (
                  <div key={`${topic.topic}-${idx}`} className={`p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{topic.topic}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{topic.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getStrengthColor(topic.strength)}`}>{topic.accuracy.toFixed(1)}%</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {topic.correctAnswers}/{topic.questionsAttempted}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Analytics */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Time Analytics
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.timeAnalytics.totalTimeFormatted}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Time</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(analytics.timeAnalytics.avgTimePerTest)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg/Test</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.timeAnalytics.avgTimePerQuestion}s
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg/Question</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {analytics.timeAnalytics.questionsPerMinute.toFixed(2)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Q/min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trend & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Trend */}
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Performance Trend
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                analytics.trends.trend === 'improving' ? 'bg-green-500/20 text-green-500' :
                analytics.trends.trend === 'declining' ? 'bg-red-500/20 text-red-500' :
                `${darkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'}`
              }`}>
                {analytics.trends.trend === 'improving' ? '↑' : analytics.trends.trend === 'declining' ? '↓' : '→'} {analytics.trends.trend}
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Improvement: {analytics.trends.improvement}
            </p>
            {analytics.trends.scoreProgression.length > 0 && (
              <div className="mt-4 flex items-end gap-1 h-20">
                {analytics.trends.scoreProgression.map((score, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-t bg-gradient-to-t ${
                      score >= 0 ? 'from-[#2596be] to-[#60DFFF]' : 'from-red-500 to-red-400'
                    }`}
                    style={{ height: `${Math.max(10, Math.min(100, Math.abs(score) * 10 + 20))}%` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {analytics.strengthsAndWeaknesses.recommendations.length > 0 && (
            <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                  Recommendations
                </h3>
              </div>
              <div className="space-y-3">
                {analytics.strengthsAndWeaknesses.recommendations.slice(0, 5).map((rec, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              {analytics.strengthsAndWeaknesses.strongestTopics.length > 0 ? (
                analytics.strengthsAndWeaknesses.strongestTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Complete more tests to identify your strengths
                </p>
              )}
            </div>
            {analytics.strengthsAndWeaknesses.strongestSubjects.length > 0 && (
              <div className="mt-4">
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Strong Subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {analytics.strengthsAndWeaknesses.strongestSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
              {analytics.strengthsAndWeaknesses.weakestTopics.length > 0 ? (
                analytics.strengthsAndWeaknesses.weakestTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-medium"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  No weak areas identified yet
                </p>
              )}
            </div>
            {analytics.strengthsAndWeaknesses.weakestSubjects.length > 0 && (
              <div className="mt-4">
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Focus on these subjects:</p>
                <div className="flex flex-wrap gap-2">
                  {analytics.strengthsAndWeaknesses.weakestSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tests */}
        {analytics.recentPerformance.length > 0 && (
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Recent Tests
            </h3>
            <div className="space-y-4">
              {analytics.recentPerformance.slice(0, 5).map((test, idx) => (
                <div
                  key={`${test.testId}-${idx}`}
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
                        <p className={`text-lg font-bold ${test.score >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {test.score}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Time
                        </p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatTime(test.timeTaken)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
