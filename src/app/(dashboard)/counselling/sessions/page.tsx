"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import counsellingService, {
  CounsellingSession,
} from "@/services/counselling.service";
import {
  Calendar,
  Clock,
  Video,
  User,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function CounsellingSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CounsellingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"all" | "pending" | "scheduled" | "completed" | "cancelled">("all");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await counsellingService.getMySessions();
      // Sort by creation date, most recent first
      setSessions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      console.error("Failed to fetch sessions:", err);
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    const reason = window.prompt("Please provide a  reason for cancellation:");
    if (!reason) return;

    try {
      setCancelling(sessionId);
      await counsellingService.cancelSession(sessionId, reason);
      // Refresh sessions list
      await fetchSessions();
    } catch (err: any) {
      console.error("Failed to cancel session:", err);
      alert(err.message || "Failed to cancel session");
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "completed":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30";
      case "cancelled":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      case "pending":
      default:
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "pending":
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSessions = selectedTab === "all"
    ? sessions
    : sessions.filter((s) => s.status === selectedTab);

  const canCancelSession = (session: CounsellingSession) => {
    return session.status === "pending" || session.status === "scheduled";
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
            Failed to Load Sessions
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => fetchSessions()}
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
          My Sessions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your counselling sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {["all", "pending", "scheduled", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as typeof selectedTab)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== "all" && (
                <span className="ml-2 text-xs">
                  ({sessions.filter((s) => s.status === tab).length})
                </span>
              )}
              {tab === "all" && (
                <span className="ml-2 text-xs">
                  ({sessions.length})
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Sessions Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don&apos;t have any {selectedTab === "all" ? "" : selectedTab} sessions yet.
          </p>
          <button
            onClick={() => router.push("/counselling/enrollments")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            View My Enrollments
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div
              key={session._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(session.status)}`}
                    >
                      {getStatusIcon(session.status)}
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                    {session.status === "scheduled" && session.scheduledDate && (
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDateTime(session.scheduledDate)}
                      </span>
                    )}
                  </div>

                  {/* Enrollment Info */}
                  {typeof session.enrollment !== "string" && (
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {session.enrollment.packageSnapshot.title}
                    </h3>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {session.meetingLink && session.status === "scheduled" && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium inline-flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {canCancelSession(session) && (
                    <button
                      onClick={() => handleCancelSession(session._id)}
                      disabled={cancelling === session._id}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling === session._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Cancel"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Preferred: {formatDate(session.preferredDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{session.preferredTimeSlot}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Video className="w-4 h-4" />
                  <span>
                    {session.meetingPreference === "google_meet"
                      ? "Google Meet"
                      : "Zoom"}
                  </span>
                </div>
                {session.counsellor && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{session.counsellor.name}</span>
                  </div>
                )}
              </div>

              {/* Agenda */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Agenda:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {session.agenda}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Reason */}
              {session.status === "cancelled" && session.cancellationReason && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                    Cancellation Reason:
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {session.cancellationReason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
