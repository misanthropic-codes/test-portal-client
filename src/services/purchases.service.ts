import apiClient, { handleApiError } from "./api.client";

/**
 * Payments/Purchases Service
 * 
 * Handles all payment and purchase-related API calls
 */

export interface PurchasedPackage {
  packageId: string;
  packageName: string;
  packageSlug: string;
  category: string;
  thumbnail: string;
  tests: {
    testId: string;
    title: string;
    description: string;
    category: string;
    type: string;
    duration: number;
    totalMarks: number;
  }[];
  hasTests: boolean;
}

export interface Purchase {
  packageId?: string;
  amount: number;
  currency: string;
  purchaseDate: string;
  paymentId: string;
}

export interface PurchasedContentResponse {
  totalPurchases: number;
  totalSpent: number;
  purchasedPackages: PurchasedPackage[];
  accessibleTestIds: string[];
  purchases: Purchase[];
}

export const purchasesService = {
  /**
   * Get all purchased content (packages and tests)
   * GET /payments/purchased/content
   */
  getPurchasedContent: async (): Promise<PurchasedContentResponse> => {
    try {
      const response = await apiClient.get<PurchasedContentResponse>(
        '/payments/purchased/content'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching purchased content:', error);
      throw new Error(handleApiError(error));
    }
  },
};

export default purchasesService;
