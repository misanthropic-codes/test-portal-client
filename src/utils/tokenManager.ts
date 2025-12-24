/**
 * Secure In-Memory Token Manager
 * 
 * Stores authentication tokens in memory instead of localStorage
 * to prevent XSS attacks from stealing tokens.
 * 
 * Note: Tokens will be cleared on page refresh or tab close.
 */

// In-memory storage for tokens
let authToken: string | null = null;
let refreshToken: string | null = null;

export const tokenManager = {
  /**
   * Get the current authentication token
   */
  getAuthToken: (): string | null => {
    return authToken;
  },

  /**
   * Set the authentication token
   */
  setAuthToken: (token: string): void => {
    authToken = token;
    console.log('🔐 Auth token stored in memory');
  },

  /**
   * Get the current refresh token
   */
  getRefreshToken: (): string | null => {
    return refreshToken;
  },

  /**
   * Set the refresh token
   */
  setRefreshToken: (token: string): void => {
    refreshToken = token;
    console.log('🔐 Refresh token stored in memory');
  },

  /**
   * Clear all tokens (used on logout)
   */
  clearTokens: (): void => {
    authToken = null;
    refreshToken = null;
    console.log('🔓 All tokens cleared from memory');
  },

  /**
   * Check if user has valid tokens
   */
  hasTokens: (): boolean => {
    return authToken !== null && refreshToken !== null;
  },
};

export default tokenManager;
