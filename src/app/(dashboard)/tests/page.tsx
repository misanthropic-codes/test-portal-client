'use client';

import { useState, useEffect } from 'react';
import testsService, { MyTestsResponse, MyTest, TestCategory } from '@/services/tests.service';
import Link from 'next/link';
import { Search, User, LogOut, FileText, Clock, Target, Award, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestsPage() {
  const { logout } = useAuth();
  const [testsData, setTestsData] = useState<MyTestsResponse | null>(null);
  const [filteredTests, setFilteredTests] = useState<MyTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
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
        setLoading(true);
        setError('');
        const data = await testsService.getMyTests();
        setTestsData(data);
        
        // Flatten all tests from categories
        const allTests = data.categories.flatMap(cat => cat.tests);
        setFilteredTests(allTests);
      } catch (err: any) {
        console.error('Error loading tests:', err);
        setError('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    if (!testsData) return;
    
    let filtered: MyTest[] = [];
    
    if (selectedCategory === 'ALL') {
      filtered = testsData.categories.flatMap(cat => cat.tests);
    } else {
      const category = testsData.categories.find(c => c.category === selectedCategory);
      filtered = category?.tests || [];
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTests(filtered);
  }, [searchQuery, selectedCategory, testsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = testsData?.stats;
  const categories = testsData?.categories || [];

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
            My Tests
          </h1>
          <p className={`text-base sm:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            All your purchased and assigned tests in one place
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-[#2596be]/20' : 'bg-[#2596be]/10'}`}>
                  <BookOpen className="w-5 h-5 text-[#2596be]" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalTests}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total Tests</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.completedTests}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Completed</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
                  <Target className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.notStarted}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Not Started</p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.overallAverage}%</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Average Score</p>
                </div>
              </div>
            </div>
          </div>
        )}

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

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'ALL'
                    ? darkMode
                      ? 'bg-[#2596be]/20 text-[#60DFFF]'
                      : 'bg-[#2596be]/10 text-[#2596be]'
                    : darkMode
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({testsData?.stats.totalTests || 0})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.category
                      ? darkMode
                        ? 'bg-[#2596be]/20 text-[#60DFFF]'
                        : 'bg-[#2596be]/10 text-[#2596be]'
                      : darkMode
                      ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.category} ({cat.totalTests})
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
              <TestCard key={test.testId} test={test} darkMode={darkMode} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Test Card Component
function TestCard({ test, darkMode }: { test: MyTest; darkMode: boolean }) {
  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'in-progress': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getProgressText = (progress: string) => {
    switch (progress) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  return (
    <Link
      href={`/tests/${test.testId}`}
      className={`block p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        darkMode 
          ? 'bg-white/5 border-white/10 hover:border-[#2596be]/50' 
          : 'bg-white border-gray-200 hover:border-[#2596be]'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          darkMode ? 'bg-[#2596be]/20 text-[#60DFFF]' : 'bg-[#2596be]/10 text-[#2596be]'
        }`}>
          {test.category}
        </span>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getProgressColor(test.progress)}`}>
          {getProgressText(test.progress)}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {test.title}
      </h3>
      <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {test.description}
      </p>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <Clock className={`w-4 h-4 mx-auto mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{test.duration} min</p>
        </div>
        <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <Target className={`w-4 h-4 mx-auto mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{test.totalMarks} marks</p>
        </div>
        <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <Award className={`w-4 h-4 mx-auto mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {test.attemptsCount > 0 ? `${test.attemptsCount} attempts` : 'No attempts'}
          </p>
        </div>
      </div>

      {/* Best Score (if attempted) */}
      {test.hasAttempted && test.bestPercentage !== undefined && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Best Score</span>
            <span className="text-green-500 font-bold">{(test.bestPercentage ?? 0).toFixed(1)}%</span>
          </div>
          {test.bestRank && (
            <div className="flex items-center justify-between mt-1">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Best Rank</span>
              <span className="text-[#2596be] font-bold">#{test.bestRank}</span>
            </div>
          )}
        </div>
      )}

      {/* Package Name */}
      {test.packageName && (
        <p className={`mt-3 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          From: {test.packageName}
        </p>
      )}
    </Link>
  );
}
