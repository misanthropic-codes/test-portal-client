"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function CounsellingEnrollmentsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<CounsellingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30";
      case "expired":
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
      case "cancelled":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Failed to Load Enrollments
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Counselling Enrollments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your counselling packages and book sessions
        </p>
      </div>

      {/* Enrollments List */}
      {enrollments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Active Enrollments
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don&amp;#39;t have any counselling packages yet. Purchase a package to
            get started.
          </p>
          <button
            onClick={() => {
              // Redirect back to aspiring-engineers counselling page
              window.location.href =
                process.env.NEXT_PUBLIC_MAIN_APP_URL + "/counselling/jee";
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
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
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {enrollment.packageSnapshot.title}
                  </h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(enrollment.status)}`}
                  >
                    {getStatusIcon(enrollment.status)}
                    {enrollment.status.charAt(0).toUpperCase() +
                      enrollment.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {enrollment.packageSnapshot.description}
                </p>
              </div>

              {/* Sessions Info */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Sessions Used
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {enrollment.sessionsUsed}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Sessions Remaining
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {enrollment.sessionsRemaining}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Expires: {formatDate(enrollment.expiresAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Enrolled: {formatDate(enrollment.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 flex gap-3">
                <button
                  onClick={() => router.push("/counselling/sessions")}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
                >
                  View Sessions
                </button>
                <button
                  onClick={() =>
                    router.push(`/counselling/book-session?enrollmentId=${enrollment._id}`)
                  }
                  disabled={!canBookSession(enrollment)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium inline-flex items-center justify-center gap-2 ${
                    canBookSession(enrollment)
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
    </div>
  );
}
