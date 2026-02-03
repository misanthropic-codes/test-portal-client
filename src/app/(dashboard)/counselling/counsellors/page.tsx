"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import counsellingService, { Counsellor } from "@/services/counselling.service";
import {
  User,
  Star,
  Briefcase,
  Award,
  BookOpen,
  ArrowRight,
  LogOut,
  Loader2,
  XCircle,
} from "lucide-react";

export default function CounsellorsPage() {
  const { logout } = useAuth();
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
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
    const fetchCounsellors = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await counsellingService.getAvailableCounsellors();
        setCounsellors(data);
      } catch (err: any) {
        console.error("Failed to fetch counsellors:", err);
        setError(err.message || "Failed to load counsellors");
      } finally {
        setLoading(false);
      }
    };

    fetchCounsellors();
  }, []);

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
            Failed to Load Counsellors
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
           <Link
              href="/counselling/enrollments"
              className={`text-sm font-medium mb-2 inline-flex items-center gap-1 ${
                darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"
              }`}
            >
              ← Back to Enrollments
            </Link>
          <h1
            className={`text-3xl sm:text-4xl font-bold mt-2 mb-2 ${darkMode ? "text-white" : "text-[#2596be]"}`}
          >
            Meet Our Counsellors
          </h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Expert guidance from experienced professionals to help you succeed
          </p>
        </div>

        {/* Counsellors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counsellors.map((counsellor) => (
            <div
              key={counsellor._id}
              className={`rounded-2xl border backdrop-blur-2xl overflow-hidden hover:scale-[1.02] transition-all ${
                darkMode
                  ? "bg-white/5 border-white/10 hover:bg-white/10"
                  : "bg-white/90 border-gray-200 hover:shadow-lg"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {counsellor.image ? (
                    <img
                      src={counsellor.image}
                      alt={counsellor.name}
                      className="w-full h-full object-cover"
                    />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#2596be] text-white text-xl font-bold">
                        {counsellor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {counsellor.name}
                    </h3>
                    <p
                      className={`text-sm font-medium ${darkMode ? "text-[#60DFFF]" : "text-[#2596be]"}`}
                    >
                      {counsellor.specialization}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <Briefcase className="w-4 h-4" />
                    <span>{counsellor.experience} Years Experience</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{counsellor.rating} Rating ({counsellor.totalSessions} Sessions)</span>
                  </div>
                   <div className={`text-sm leading-relaxed line-clamp-3 ${darkMode ? "text-gray-500" : "text-gray-600"}`}>
                     {counsellor.about}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
