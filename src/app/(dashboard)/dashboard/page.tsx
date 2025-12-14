'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { mockDashboardService, mockTestService } from '@/services/mock/mockData';
import { DashboardStats, Test } from '@/types';
import Link from 'next/link';
import { formatExamType, formatMinutes } from '@/utils/formatters';
import ContentCard from '@/components/ui/ContentCard';
import { Clock, FileText, TrendingUp, Zap, BookOpen, BarChart3, User, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
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
    const loadData = async () => {
      try {
        const [statsData, testsData] = await Promise.all([
          mockDashboardService.getStats(),
          mockTestService.getAllTests(),
        ]);
        setStats(statsData);
        setTests(testsData.tests.slice(0, 6));
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Test Portal
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/dashboard" className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Dashboard
              </Link>
              <Link href="/tests" className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-[#2596be]'}`}>
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

          <div className="flex items-center gap-4">
            <Link href="/profile" className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              <User className="h-5 w-5" />
            </Link>
            <button onClick={logout} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
            Welcome back, {user?.name}!
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your progress and continue preparing for your exams
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ContentCard
            icon={Clock}
            title="Today's Study Time"
            description={`${stats?.todayStudyTime || 0} minutes of focused practice`}
            metadata={[{ label: "Status", value: "Active" }]}
          />

          <ContentCard
            icon={FileText}
            title="Tests This Week"
            description={`${stats?.testsThisWeek || 0} tests completed`}
            metadata={[{ label: "Progress", value: "+2 from last week" }]}
          />

          <ContentCard
            icon={TrendingUp}
            title="Average Score"
            description={`${stats?.averageScoreThisWeek || 0} out of 300 marks`}
            metadata={[{ label: "Improvement", value: "↑ 12%" }]}
          />

          <ContentCard
            icon={Zap}
            title="Week Study Time"
            description={formatMinutes(stats?.weekStudyTime || 0)}
            metadata={[{ label: "Goal", value: "20 hours" }]}
          />
        </div>

        {/* Available Tests Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
                Available Tests
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Start practicing with our comprehensive test series
              </p>
            </div>
            <Link 
              href="/tests"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-[#2596be]/20 text-[#60DFFF] hover:bg-[#2596be]/30'
                  : 'bg-[#2596be]/10 text-[#2596be] hover:bg-[#2596be]/20'
              }`}
            >
              View All
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
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
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <ContentCard
            href="/tests"
            icon={BookOpen}
            title="Browse Tests"
            description="Explore all available test series"
            className={darkMode ? 'bg-[#2596be]/10' : ' bg-[#2596be]/5'}
          />

          <ContentCard
            href="/analytics"
            icon={BarChart3}
            title="Analytics"
            description="Track your performance and progress"
            className={darkMode ? 'bg-[#4EA8DE]/10' : 'bg-[#4EA8DE]/5'}
          />

          <ContentCard
            href="/profile"
            icon={User}
            title="My Profile"
            description="View and edit your profile"
            className={darkMode ? 'bg-[#60DFFF]/10' : 'bg-[#60DFFF]/5'}
          />
        </div>
      </main>
    </div>
  );
}
