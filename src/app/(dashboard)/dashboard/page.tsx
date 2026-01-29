"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { mockDashboardService } from "@/services/mock/mockData";
import {
  purchasesService,
  PurchasedPackage,
} from "@/services/purchases.service";
import { DashboardStats } from "@/types";
import Link from "next/link";
import ContentCard from "@/components/ui/ContentCard";
import {
  Clock,
  FileText,
  TrendingUp,
  BookOpen,
  BarChart3,
  User,
  LogOut,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

export default function DashboardPage() {
  const { logout } = useAuth();
  const { profile, loading: profileLoading, fetchProfile } = useUserStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [packages, setPackages] = useState<PurchasedPackage[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
        // Fetch user profile from API with caching
        await fetchProfile();

        // Load dashboard stats (still using mock for now)
        const statsData = await mockDashboardService.getStats();
        setStats(statsData);

        // Fetch purchased packages from payments API
        const purchasedData = await purchasesService.getPurchasedContent();
        setPackages(purchasedData.purchasedPackages);
        setTotalSpent(purchasedData.totalSpent);
        setTotalPurchases(purchasedData.totalPurchases);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProfile(true); // Force refresh
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#071219]" : "bg-gray-50"}`}>
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 w-full border-b backdrop-blur-xl"
        style={{
          backgroundColor: darkMode
            ? "rgba(10, 15, 20, 0.58)"
            : "rgba(255, 255, 255, 0.55)",
          borderColor: darkMode
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link
              href="/dashboard"
              className={`font-bold text-lg sm:text-xl ${darkMode ? "text-white" : "text-[#2596be]"}`}
            >
              Test Portal
            </Link>
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm">
              <Link
                href="/dashboard"
                className={`font-medium transition-colors ${darkMode ? "text-white" : "text-[#2596be]"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/tests"
                className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"}`}
              >
                Tests
              </Link>
              <Link
                href="/analytics"
                className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"}`}
              >
                Analytics
              </Link>
              <Link
                href="/history"
                className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"}`}
              >
                History
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                const html = document.documentElement;
                html.classList.toggle("dark");
                localStorage.setItem(
                  "theme",
                  html.classList.contains("dark") ? "dark" : "light",
                );
              }}
              className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <Link
              href="/profile"
              className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={logout}
              className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 ${darkMode ? "text-white" : "text-[#2596be]"}`}
              >
                Welcome back, {profile?.name}!
              </h1>
              <p
                className={`text-base sm:text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Track your progress and continue preparing for your exams
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"
              } disabled:opacity-50`}
              title="Refresh profile data"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <ContentCard
            icon={FileText}
            title="Tests Attempted"
            description={`${profile?.stats?.testsAttempted || 0} tests completed`}
            metadata={[{ label: "Status", value: "Active" }]}
          />

          <ContentCard
            icon={TrendingUp}
            title="Average Score"
            description={`${profile?.stats?.averageScore?.toFixed(1) || 0}%`}
            metadata={[
              {
                label: "Performance",
                value:
                  profile?.stats?.averageScore &&
                  profile.stats.averageScore >= 75
                    ? "Excellent"
                    : "Good",
              },
            ]}
          />

          <ContentCard
            icon={BarChart3}
            title="Best Rank"
            description={`Rank #${profile?.stats?.bestRank || "-"}`}
            metadata={[{ label: "Achievement", value: "Top Performer" }]}
          />

          <ContentCard
            icon={Clock}
            title="Study Hours"
            description={`${profile?.stats?.totalStudyHours || 0} hours total`}
            metadata={[
              {
                label: "This Month",
                value: `${Math.floor((profile?.stats?.totalStudyHours || 0) / 4)} hrs`,
              },
            ]}
          />
        </div>

        {/* Purchased Packages Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h2
                className={`text-2xl sm:text-2xl font-bold ${darkMode ? "text-white" : "text-[#2596be]"}`}
              >
                My Purchased Packages
              </h2>
              <p
                className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Total Spent: ₹{totalSpent} • {totalPurchases} Purchase
                {totalPurchases !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href="/my-tests"
              className={`px-4 py-2 rounded-lg font-medium transition-colors text-center ${
                darkMode
                  ? "bg-[#2596be]/20 text-[#60DFFF] hover:bg-[#2596be]/30"
                  : "bg-[#2596be]/10 text-[#2596be] hover:bg-[#2596be]/20"
              }`}
            >
              View All Tests
            </Link>
          </div>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {packages.map((pkg) => (
                <Link
                  key={pkg.packageId}
                  href={`/packages/${pkg.packageId}`}
                  className={`overflow-hidden rounded-2xl border backdrop-blur-2xl transition-all hover:scale-[1.02] ${
                    darkMode
                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                      : "bg-white border-gray-200 hover:shadow-lg"
                  }`}
                >
                  {/* Thumbnail */}
                  {pkg.thumbnail && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={pkg.thumbnail}
                        alt={pkg.packageName}
                        className="w-full h-full object-cover"
                      />
                      {pkg.category && (
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
                              darkMode
                                ? "bg-[#2596be]/80 text-white"
                                : "bg-[#2596be] text-white"
                            }`}
                          >
                            {pkg.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <h3
                      className={`text-lg font-bold mb-2 line-clamp-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {pkg.packageName}
                    </h3>

                    {pkg.hasTests ? (
                      <p
                        className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {pkg.tests.length} test
                        {pkg.tests.length !== 1 ? "s" : ""} available
                      </p>
                    ) : (
                      <p
                        className={`text-sm mb-4 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                      >
                        No tests available yet
                      </p>
                    )}

                    <div
                      className={`grid grid-cols-1 gap-3 pt-4 border-t ${
                        darkMode ? "border-white/10" : "border-gray-200"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Package Slug
                        </p>
                        <p
                          className={`text-sm font-mono font-semibold ${darkMode ? "text-white" : "text-gray-900"} truncate`}
                        >
                          {pkg.packageSlug}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-3 pt-3 border-t ${darkMode ? "border-white/10" : "border-gray-200"}`}
                    >
                      <p
                        className={`text-xs ${darkMode ? "text-green-400" : "text-green-600"}`}
                      >
                        ✓ Purchased & Active
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-12 rounded-2xl border ${
                darkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-200"
              }`}
            >
              <ShoppingBag
                className={`h-16 w-16 mx-auto mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              />
              <h3
                className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                No Purchased Packages Yet
              </h3>
              <p
                className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Purchase test series packages from the main site to get started
              </p>
              <a
                href={process.env.NEXT_PUBLIC_MAIN_SITE_URL}
                className="inline-block px-6 py-3 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0] font-medium"
              >
                Browse Packages
              </a>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <ContentCard
            href="/tests"
            icon={BookOpen}
            title="Browse Tests"
            description="Explore all available test series"
            className={darkMode ? "bg-[#2596be]/10" : " bg-[#2596be]/5"}
          />

          <ContentCard
            href="/analytics"
            icon={BarChart3}
            title="Analytics"
            description="Track your performance and progress"
            className={darkMode ? "bg-[#4EA8DE]/10" : "bg-[#4EA8DE]/5"}
          />

          <ContentCard
            href="/profile"
            icon={User}
            title="My Profile"
            description="View and edit your profile"
            className={darkMode ? "bg-[#60DFFF]/10" : "bg-[#60DFFF]/5"}
          />
        </div>
      </main>
    </div>
  );
}
