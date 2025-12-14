'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, User, Mail, Phone, Calendar, Award, Edit2 } from 'lucide-react';

export default function ProfilePage() {
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

  if (!user) {
    return null;
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
              Profile
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Profile Card */}
        <div className={`mb-8 p-8 rounded-2xl border backdrop-blur-2xl ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
              darkMode ? 'bg-[#2596be]/20 text-[#60DFFF]' : 'bg-[#2596be]/10 text-[#2596be]'
            }`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.name}
              </h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Student
              </p>
            </div>
            <button
              className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] font-medium flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date of Birth</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Target Year</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.targetYear}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Targets */}
        <div className={`mb-8 p-6 rounded-2xl border backdrop-blur-2xl ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
            Exam Targets
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.examTargets.map((exam) => (
              <span
                key={exam}
                className={`px-4 py-2 rounded-lg font-medium ${
                  darkMode ? 'bg-[#2596be]/20 text-[#60DFFF]' : 'bg-[#2596be]/10 text-[#2596be]'
                }`}
              >
                {exam.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        {user.stats && (
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Performance Stats
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.stats.testsAttempted}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tests Attempted
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.stats.averageScore.toFixed(1)}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg Score
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  #{user.stats.bestRank}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Best Rank
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.stats.totalStudyHours}h
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Study Hours
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
