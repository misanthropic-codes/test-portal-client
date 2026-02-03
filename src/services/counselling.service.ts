import apiClient, { handleApiError } from "./api.client";

/**
 * Counselling Service
 * Handles all counselling-related API calls for the test portal client
 */

// Types
export interface CounsellingEnrollment {
  _id: string;
  userId: string;
  packageId?: {
    _id: string;
    name: string;
    slug: string;
    examType: string;
    description: string;
    shortDescription: string;
    price: number;
    discountPrice: number;
    validityDays: number;
    maxSessions: number;
    sessionDuration: number;
  };
  packageSnapshot: {
    name: string;
    examType: string;
    maxSessions: number;
  };
  sessionsUsed: number;
  sessionsRemaining: number;
  status: "active" | "expired" | "cancelled" | "refunded";
  paymentId: string;
  amountPaid: number;
  enrolledAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CounsellingSession {
  _id: string;
  enrollment: string | CounsellingEnrollment;
  user: string;
  preferredDate: string;
  preferredTimeSlot: string;
  agenda: string;
  meetingPreference: "google_meet" | "zoom";
  status: "pending_assignment" | "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  meetingLink?: string;
  scheduledDate?: string;
  counsellor?: {
    _id: string;
    name: string;
    email: string;
    title: string;
  };
  counsellorId?: {
    _id: string;
    name: string;
    email: string;
    title: string;
    image?: string;
  } | string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookSessionPayload {
  enrollmentId: string;
  preferredDate: string;
  preferredTimeSlot: string;
  agenda: string;
  meetingPreference: "google_meet" | "zoom";
}

export interface GetSessionsParams {
  status?: "pending_assignment" | "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  limit?: number;
  page?: number;
}

export interface Counsellor {
  _id: string;
  name: string;
  image: string;
  specialization: string;
  experience: number;
  rating: number;
  totalSessions: number;
  about: string;
}

export interface ReviewPayload {
  sessionId: string;
  counsellorId: string;
  rating: number;
  review: string;
}

const counsellingService = {
  /**
   * Get current user's counselling enrollments
   * GET /counselling/enrollments/my
   */
  getMyEnrollments: async (): Promise<CounsellingEnrollment[]> => {
    try {
      console.log(
        "🚀 [counsellingService] GET /counselling/enrollments/my",
      );
      const response = await apiClient.get<
        | { success: boolean; data: CounsellingEnrollment[] }
        | CounsellingEnrollment[]
      >("/counselling/enrollments/my");

      console.log("✅ [counsellingService] Response:", response.data);
      
      // Handle both wrapped and direct array responses
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data || [];
    } catch (error) {
      console.error(
        "❌ [counsellingService] Failed to fetch enrollments:",
        error,
      );
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Book a counselling session
   * POST /counselling/sessions
   */
  bookSession: async (
    payload: BookSessionPayload,
  ): Promise<CounsellingSession> => {
    try {
      console.log(
        "🚀 [counsellingService] POST /counselling/sessions",
        payload,
      );
      const response = await apiClient.post<{
        success: boolean;
        data: CounsellingSession;
      }>("/counselling/sessions", payload);

      console.log("✅ [counsellingService] Response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error(
        "❌ [counsellingService] Failed to book session:",
        error,
      );
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get current user's counselling sessions
   * GET /counselling/sessions/my
   */
  getMySessions: async (
    params?: GetSessionsParams,
  ): Promise<CounsellingSession[]> => {
    try {
      console.log(
        "🚀 [counsellingService] GET /counselling/sessions/my",
        params,
      );
      const response = await apiClient.get<{
        success: boolean;
        data: CounsellingSession[];
      }>("/counselling/sessions/my", { params });

      console.log("✅ [counsellingService] Response:", response.data);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.data || [];
    } catch (error) {
      console.error(
        "❌ [counsellingService] Failed to fetch sessions:",
        error,
      );
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Cancel a counselling session
   * PATCH /counselling/sessions/:id/cancel
   */
  cancelSession: async (
    sessionId: string,
    reason: string,
  ): Promise<CounsellingSession> => {
    try {
      console.log(
        `🚀 [counsellingService] PATCH /counselling/sessions/${sessionId}/cancel`,
        { reason },
      );
      const response = await apiClient.patch<{
        success: boolean;
        data: CounsellingSession;
      }>(`/counselling/sessions/${sessionId}/cancel`, { reason });

      console.log("✅ [counsellingService] Response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error(
        "❌ [counsellingService] Failed to cancel session:",
        error,
      );
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Submit a review for a completed session
   * POST /counselling/reviews
   */
  submitReview: async (payload: ReviewPayload): Promise<any> => {
    try {
      console.log("🚀 [counsellingService] POST /counselling/reviews", payload);
      const response = await apiClient.post<{
        success: boolean;
        data: any;
      }>("/counselling/reviews", payload);

      console.log("✅ [counsellingService] Response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ [counsellingService] Failed to submit review:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get list of available counsellors
   * GET /counselling/counsellors
   */
  getAvailableCounsellors: async (): Promise<Counsellor[]> => {
    try {
      console.log("🚀 [counsellingService] GET /counselling/counsellors");
      const response = await apiClient.get<{
        success: boolean;
        data: Counsellor[];
      }>("/counselling/counsellors");

      console.log("✅ [counsellingService] Response:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error(
        "❌ [counsellingService] Failed to fetch counsellors:",
        error,
      );
      throw new Error(handleApiError(error));
    }
  },
};

export default counsellingService;
