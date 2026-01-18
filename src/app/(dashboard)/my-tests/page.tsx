'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { testsService, MyTestsResponse, MyTest } from '@/services/tests.service';
import { Clock, Target, TrendingUp, BookOpen, ChevronRight, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function MyTestsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<MyTestsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
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

    const fetchMyTests = async () => {
      try {
        setLoading(true);
        const response = await testsService.getMyTests();
        setData(response);
      } catch (err: any) {
        setError(err.message || 'Failed to load tests');
      } finally {
        setLoading(false);
      }
    };

    fetchMyTests();
  }, [isAuthenticated, router]);

  const handleTestClick = (testId: string) => {
    router.push(`/tests/${testId}/start`);
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'completed':
        return darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
      case 'in-progress':
        return darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      default:
        return darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
    }
  };

  const filteredCategories = data?.categories.filter(cat => 
    selectedCategory === 'all' || cat.category === selectedCategory
  );

  const filterTests = (tests: MyTest[]) => {
    if (selectedStatus === 'all') return tests;
    return tests.filter(test => test.progress === selectedStatus);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
          <p className={`text-lg ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Tests
          </h1>
          <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            All your accessible tests from purchased packages and assignments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Tests
              </span>
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {data?.stats.totalTests || 0}
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Target className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </span>
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {data?.stats.completedTests || 0}
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <Clock className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Not Started
              </span>
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {data?.stats.notStarted || 0}
            </p>
          </div>

          <div className={`p-6 rounded-2xl border backdrop-blur-2xl ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className={`h-5 w-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Average Score
              </span>
            </div>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {data?.stats.overallAverage ? `${data.stats.overallAverage.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className={`flex flex-wrap gap-4 mb-6 p-4 rounded-xl border ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <Filter className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filters:
            </span>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${
              darkMode
                ? 'bg-white/10 border-white/10 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Categories</option>
            {data?.categories.map(cat => (
              <option key={cat.category} value={cat.category}>{cat.category}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${
              darkMode
                ? 'bg-white/10 border-white/10 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Test Categories */}
        {filteredCategories?.map((category) => {
          const filteredTestsList = filterTests(category.tests);
          if (filteredTestsList.length === 0) return null;

          return (
            <div key={category.category} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {category.category}
                </h2>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filteredTestsList.length} test{filteredTestsList.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTestsList.map((test) => (
                  <div
                    key={test.testId}
                    onClick={() => handleTestClick(test.testId)}
                    className={`p-6 rounded-2xl border backdrop-blur-2xl cursor-pointer transition-all hover:scale-[1.02] ${
                      darkMode
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white/90 border-gray-200 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {test.title}
                      </h3>
                      <ChevronRight className={`h-5 w-5 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>

                    <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {test.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getProgressColor(test.progress)}`}>
                        {test.progress.replace('-', ' ').toUpperCase()}
                      </span>
                      {test.packageName && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {test.packageName}
                        </span>
                      )}
                    </div>

                    <div className={`grid grid-cols-3 gap-4 pt-4 border-t ${
                      darkMode ? 'border-white/10' : 'border-gray-200'
                    }`}>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duration</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {test.duration} min
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Marks</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {test.totalMarks}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Attempts</p>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {test.attemptsCount}
                        </p>
                      </div>
                    </div>

                    {test.bestScore !== undefined && (
                      <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Best Score: <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {test.bestPercentage?.toFixed(1)}%
                          </span>
                          {test.bestRank && ` • Rank: ${test.bestRank}`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredCategories?.every(cat => filterTests(cat.tests).length === 0) && (
          <div className={`text-center py-12 rounded-2xl border ${
            darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No tests found with the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
