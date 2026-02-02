"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get("enrollmentId");

  const [enrollment, setEnrollment] = useState<CounsellingEnrollment | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Omit<BookSessionPayload, "enrollmentId">>({
    preferredDate: "",
    preferredTimeSlot: "",
    agenda: "",
    meetingPreference: "google_meet",
  });

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && !enrollment) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Unable to Book Session
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => router.push("/counselling/enrollments")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Enrollments
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
            Session Booked Successfully!
          </h3>
          <p className="text-emerald-700 dark:text-emerald-300 mb-6">
            Your session request has been submitted. Our team will review and
            confirm your booking soon.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Redirecting to sessions page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/counselling/enrollments")}
          className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Enrollments
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Book Counselling Session
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Schedule a session with our expert counsellors
        </p>
      </div>

      {/* Enrollment Info Card */}
      {enrollment && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {enrollment.packageSnapshot.title}
          </h3>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-blue-700 dark:text-blue-300">
              Sessions Remaining: <strong>{enrollment.sessionsRemaining}</strong>
            </span>
            <span className="text-blue-700 dark:text-blue-300">
              Expires:{" "}
              <strong>
                {new Date(enrollment.expiresAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Preferred Date */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select a date between tomorrow and the next 30 days
          </p>
        </div>

        {/* Time Slot */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Preferred Time Slot *
          </label>
          <select
            name="preferredTimeSlot"
            value={formData.preferredTimeSlot}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Agenda / Topics to Discuss *
          </label>
          <textarea
            name="agenda"
            value={formData.agenda}
            onChange={handleChange}
            required
            rows={4}
            placeholder="e.g., College selection, choice filling strategy, career guidance..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Please describe what you'd like to discuss in the session
          </p>
        </div>

        {/* Meeting Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
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
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                formData.meetingPreference === "google_meet"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              Google Meet
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, meetingPreference: "zoom" }))
              }
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                formData.meetingPreference === "zoom"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              Zoom
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push("/counselling/enrollments")}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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
  );
}
