'use client';

import { useState, useEffect } from 'react';
import { mockTestService } from '@/services/mock/mockData';
import { Test, ExamType } from '@/types';
import Link from 'next/link';
import { formatExamType, formatTestType } from '@/utils/formatters';
import ContentCard from '@/components/ui/ContentCard';
import { Search, User, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestsPage() {
  const { logout } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamType | 'ALL'>('ALL');
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
    const loadTests = async () => {
      try {
        const data = await mockTestService.getAllTests();
        setTests(data.tests);
        setFilteredTests(data.tests);
      } catch (error) {
        console.error('Error loading tests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    let filtered = tests;

    if (selectedExam !== 'ALL') {
      filtered = filtered.filter((test) => test.examType === selectedExam);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTests(filtered);
  }, [searchQuery, selectedExam, tests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
            All Tests
          </h1>
          <p className={`text-base sm:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Browse and start practicing with our comprehensive test series
          </p>
        </div>

        {/* Filters */}
        <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-2xl mb-6 sm:mb-8 ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-3 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Exam Filter */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedExam('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedExam === 'ALL'
                    ? darkMode
                      ? 'bg-[#2596be]/20 text-[#60DFFF]'
                      : 'bg-[#2596be]/10 text-[#2596be]'
                    : darkMode
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {Object.values(ExamType).map((exam) => (
                <button
                  key={exam}
                  onClick={() => setSelectedExam(exam)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedExam === exam
                      ? darkMode
                        ? 'bg-[#2596be]/20 text-[#60DFFF]'
                        : 'bg-[#2596be]/10 text-[#2596be]'
                      : darkMode
                      ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {formatExamType(exam)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className={`p-8 sm:p-12 rounded-2xl border backdrop-blur-2xl text-center ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-gray-200'
          }`}>
            <FileText className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-base sm:text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No tests found
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTests.map((test) => (
              <ContentCard
                key={test.id}
                href={`/tests/${test.id}`}
                title={test.title}
                description={test.description}
                badge={formatExamType(test.examType)}
                metadata={[
                  { label: "Duration", value: `${test.duration} min` },
                  { label: "Questions", value: `${test.totalQuestions}` },
                  { label: "Marks", value: `${test.totalMarks}` },
                ]}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
