"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import counsellingService, {
  CounsellingEnrollment,
  BookSessionPayload,
} from "@/services/counselling.service";
import {
  Calendar,
  Clock,
  FileText,
  Video,
  Loader2,
  CheckCircle,
  ArrowLeft,
  User,
  LogOut,
  BookOpen,
  Target,
} from "lucide-react";

const timeSlots = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
];

export default function BookSessionPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get("enrollmentId");

  const [enrollment, setEnrollment] = useState<CounsellingEnrollment | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState<Omit<BookSessionPayload, "enrollmentId">>({
    preferredDate: "",
    preferredTimeSlot: "",
    agenda: "",
    meetingPreference: "google_meet",
  });

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
    const fetchEnrollment = async () => {
      if (!enrollmentId) {
        setError("No enrollment ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const enrollments = await counsellingService.getMyEnrollments();
        const found = enrollments.find((e) => e._id === enrollmentId);

        if (!found) {
          setError("Enrollment not found");
        } else if (found.status !== "active") {
          setError("This enrollment is not active");
        } else if (found.sessionsRemaining <= 0) {
          setError("No sessions remaining in this enrollment");
        } else {
          setEnrollment(found);
        }
      } catch (err: any) {
        console.error("Failed to fetch enrollment:", err);
        setError(err.message || "Failed to load enrollment details");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, [enrollmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!enrollmentId) return;

    // Validation
    if (!formData.preferredDate || !formData.preferredTimeSlot || !formData.agenda.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await counsellingService.bookSession({
        enrollmentId,
        ...formData,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/counselling/sessions");
      }, 2000);
    } catch (err: any) {
      console.error("Failed to book session:", err);
      setError(err.message || "Failed to book session");
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Get maximum date (30 days from now or enrollment expiry, whichever is earlier)
  const getMaxDate = () => {
    const maxDays = new Date();
    maxDays.setDate(maxDays.getDate() + 30);

    if (enrollment) {
      const expiryDate = new Date(enrollment.expiresAt);
      return expiryDate < maxDays
        ? expiryDate.toISOString().split("T")[0]
        : maxDays.toISOString().split("T")[0];
    }

    return maxDays.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#071219]" : "bg-gray-50"}`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (error && !enrollment) {
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
            <Link
              href="/dashboard"
              className={`font-bold text-lg sm:text-xl ${darkMode ? "text-white" : "text-[#2596be]"}`}
            >
              Test Portal
            </Link>
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

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div
            className={`p-8 rounded-2xl border backdrop-blur-2xl text-center ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? "bg-red-500/20" : "bg-red-100"}`}
            >
              <CheckCircle className={`w-8 h-8 ${darkMode ? "text-red-400" : "text-red-500"}`} />
            </div>
            <h3
              className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Unable to Book Session
            </h3>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {error}
            </p>
            <button
              onClick={() => router.push("/counselling/enrollments")}
              className="px-6 py-3 bg-[#2596be] hover:bg-[#1e7ca0] text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Enrollments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
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
            <Link
              href="/dashboard"
              className={`font-bold text-lg sm:text-xl ${darkMode ? "text-white" : "text-[#2596be]"}`}
            >
              Test Portal
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div
            className={`p-12 rounded-2xl border backdrop-blur-2xl text-center ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h3
              className={`text-2xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Session Booked Successfully!
            </h3>
            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Your session request has been submitted. Our team will review and
              confirm your booking soon.
            </p>
            <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
              Redirecting to sessions page...
            </p>
          </div>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/counselling/enrollments")}
            className={`mb-4 inline-flex items-center gap-2 transition-colors ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#2596be]"}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Enrollments
          </button>
          <h1
            className={`text-3xl sm:text-4xl font-bold mb-2 ${darkMode ? "text-white" : "text-[#2596be]"}`}
          >
            Book Counselling Session
          </h1>
          <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
            Schedule a session with our expert counsellors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrollment Info - Sidebar */}
          {enrollment && (
            <div className="lg:col-span-1">
              <div
                className={`p-6 rounded-2xl border backdrop-blur-2xl sticky top-24 ${darkMode ? "bg-white/5 border-white/10" : "bg-white/90 border-gray-200"}`}
              >
                <h3
                  className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  Package Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Package
                    </p>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {enrollment.packageSnapshot.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-3 rounded-lg ${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Remaining
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-500">
                        {enrollment.sessionsRemaining}
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-lg ${darkMode ? "bg-white/5" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-[#2596be]" />
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Total
                        </p>
                      </div>
                      <p
                        className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {enrollment.packageSnapshot.maxSessions}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Expires On
                    </p>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {new Date(enrollment.expiresAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Form */}
          <form
            onSubmit={handleSubmit}
            className={`lg:col-span-2 p-6 sm:p-8 rounded-2xl border backdrop-blur-2xl space-y-6 ${darkMode ? "bg-white/5 border-white/10" : "bg-white/90 border-gray-200"}`}
          >
            {error && (
              <div
                className={`p-4 rounded-lg border ${darkMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}
              >
                {error}
              </div>
            )}

            {/* Preferred Date */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Preferred Date *
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-white focus:border-[#2596be]/50 focus:ring-2 focus:ring-[#2596be]/20"
                    : "bg-white border-gray-300 text-gray-900 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20"
                }`}
              />
              <p className={`mt-1.5 text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                Select a date between tomorrow and the next 30 days
              </p>
            </div>

            {/* Time Slot */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Preferred Time Slot *
              </label>
              <select
                name="preferredTimeSlot"
                value={formData.preferredTimeSlot}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-white focus:border-[#2596be]/50 focus:ring-2 focus:ring-[#2596be]/20"
                    : "bg-white border-gray-300 text-gray-900 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20"
                }`}
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Agenda */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Agenda / Topics to Discuss *
              </label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleChange}
                required
                rows={5}
                placeholder="e.g., College selection, choice filling strategy, career guidance..."
                className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be]/50 focus:ring-2 focus:ring-[#2596be]/20"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20"
                }`}
              />
              <p className={`mt-1.5 text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                Please describe what you'd like to discuss in the session
              </p>
            </div>

            {/* Meeting Preference */}
            <div>
              <label
                className={`block text-sm font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                <Video className="w-4 h-4 inline mr-2" />
                Meeting Platform *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      meetingPreference: "google_meet",
                    }))
                  }
                  className={`px-4 py-4 rounded-lg border-2 transition-all font-medium ${
                    formData.meetingPreference === "google_meet"
                      ? darkMode
                        ? "border-[#2596be] bg-[#2596be]/20 text-[#60DFFF]"
                        : "border-[#2596be] bg-[#2596be]/10 text-[#2596be]"
                      : darkMode
                      ? "border-white/10 hover:border-white/20 text-gray-400"
                      : "border-gray-300 hover:border-gray-400 text-gray-600"
                  }`}
                >
                  Google Meet
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, meetingPreference: "zoom" }))
                  }
                  className={`px-4 py-4 rounded-lg border-2 transition-all font-medium ${
                    formData.meetingPreference === "zoom"
                      ? darkMode
                        ? "border-[#2596be] bg-[#2596be]/20 text-[#60DFFF]"
                        : "border-[#2596be] bg-[#2596be]/10 text-[#2596be]"
                      : darkMode
                      ? "border-white/10 hover:border-white/20 text-gray-400"
                      : "border-gray-300 hover:border-gray-400 text-gray-600"
                  }`}
                >
                  Zoom
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/counselling/enrollments")}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-[#2596be] hover:bg-[#1e7ca0] text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Book Session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
