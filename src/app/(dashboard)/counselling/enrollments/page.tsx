"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import counsellingService, {
  CounsellingEnrollment,
} from "@/services/counselling.service";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  ArrowRight,
  Target,
  TrendingUp,
  User,
  LogOut,
} from "lucide-react";

export default function CounsellingEnrollmentsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [enrollments, setEnrollments] = useState<CounsellingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await counsellingService.getMyEnrollments();
        setEnrollments(data);
      } catch (err: any) {
        console.error("Failed to fetch enrollments:", err);
        setError(err.message || "Failed to load enrollments");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return darkMode
          ? "text-emerald-400 bg-emerald-500/20"
          : "text-emerald-700 bg-emerald-100";
      case "expired":
        return darkMode
          ? "text-gray-400 bg-gray-500/20"
          : "text-gray-700 bg-gray-100";
      case "cancelled":
        return darkMode
          ? "text-red-400 bg-red-500/20"
          : "text-red-700 bg-red-100";
      default:
        return darkMode
          ? "text-gray-400 bg-gray-500/20"
          : "text-gray-700 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "expired":
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canBookSession = (enrollment: CounsellingEnrollment) => {
    return enrollment.status === "active" && enrollment.sessionsRemaining > 0;
  };

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const expiredEnrollments = enrollments.filter((e) => e.status !== "active");
  const totalSessions = enrollments.reduce(
    (sum, e) => sum + e.packageSnapshot.maxSessions,
    0
  );
  const usedSessions = enrollments.reduce((sum, e) => sum + e.sessionsUsed, 0);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#071219]" : "bg-gray-50"}`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#071219]" : "bg-gray-50"}`}
      >
        <div
          className={`p-8 rounded-2xl border backdrop-blur-2xl text-center ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
        >
          <XCircle
            className={`w-12 h-12 mx-auto mb-4 ${darkMode ? "text-red-400" : "text-red-500"}`}
          />
          <h3
            className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Failed to Load Enrollments
          </h3>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#2596be] hover:bg-[#1e7ca0] text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
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
                className={`transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"}`}
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
              <Link
                href="/counselling/enrollments"
                className={`font-medium transition-colors ${darkMode ? "text-white" : "text-[#2596be]"}`}
              >
                Counselling
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
                  html.classList.contains("dark") ? "dark" : "light"
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
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl sm:text-4xl font-bold mb-2 ${darkMode ? "text-white" : "text-[#2596be]"}`}
          >
            My Counselling Enrollments
          </h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Manage your counselling packages and book sessions
          </p>
        </div>

        {/* Stats Cards */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div
              className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${darkMode ? "bg-[#2596be]/20" : "bg-[#2596be]/10"}`}
                >
                  <BookOpen className="w-5 h-5 text-[#2596be]" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {activeEnrollments.length}
                  </p>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    Active
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${darkMode ? "bg-green-500/20" : "bg-green-500/10"}`}
                >
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {totalSessions - usedSessions}
                  </p>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    Remaining
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${darkMode ? "bg-yellow-500/20" : "bg-yellow-500/10"}`}
                >
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {usedSessions}
                  </p>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    Used
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${darkMode ? "bg-purple-500/20" : "bg-purple-500/10"}`}
                >
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {totalSessions}
                  </p>
                  <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                    Total
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enrollments List */}
        {enrollments.length === 0 ? (
          <div
            className={`p-12 rounded-2xl border backdrop-blur-2xl text-center ${darkMode ? "bg-white/5 border-white/10" : "bg-white/80 border-gray-200"}`}
          >
            <BookOpen
              className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              No Active Enrollments
            </h3>
            <p
              className={`text-sm mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              You don't have any counselling packages yet. Purchase a package
              to get started.
            </p>
            <button
              onClick={() => {
                window.location.href =
                  process.env.NEXT_PUBLIC_MAIN_APP_URL + "/counselling/jee";
              }}
              className="px-6 py-3 bg-[#2596be] hover:bg-[#1e7ca0] text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Browse Packages
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className={`rounded-2xl border backdrop-blur-2xl overflow-hidden hover:scale-[1.02] transition-all ${
                  darkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-white/90 border-gray-200 hover:shadow-lg"
                }`}
              >
                {/* Header with Package Name */}
                <div className="p-6 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}">
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {enrollment.packageSnapshot.name}
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(enrollment.status)}`}
                    >
                      {getStatusIcon(enrollment.status)}
                      {enrollment.status.charAt(0).toUpperCase() +
                        enrollment.status.slice(1)}
                    </span>
                  </div>
                  <p
                    className={`text-sm uppercase tracking-wide font-medium ${darkMode ? "text-[#60DFFF]" : "text-[#2596be]"}`}
                  >
                    {enrollment.packageSnapshot.examType}
                  </p>
                  {enrollment.packageId?.shortDescription && (
                    <p
                      className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {enrollment.packageId.shortDescription}
                    </p>
                  )}
                </div>

                {/* Sessions Info */}
                <div
                  className={`p-6 ${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p
                        className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Sessions Used
                      </p>
                      <p
                        className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {enrollment.sessionsUsed}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Sessions Left
                      </p>
                      <p className="text-3xl font-bold text-emerald-500">
                        {enrollment.sessionsRemaining}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {formatDate(enrollment.expiresAt)}</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Enrolled: {formatDate(enrollment.enrolledAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 flex gap-3">
                  <button
                    onClick={() => router.push("/counselling/sessions")}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                      darkMode
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    View Sessions
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/counselling/book-session?enrollmentId=${enrollment._id}`
                      )
                    }
                    disabled={!canBookSession(enrollment)}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm inline-flex items-center justify-center gap-2 ${
                      canBookSession(enrollment)
                        ? "bg-[#2596be] hover:bg-[#1e7ca0] text-white hover:shadow-lg"
                        : darkMode
?                          "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                          : "bg-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
