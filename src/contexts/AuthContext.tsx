"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthResponse, LoginCredentials, RegisterData } from "@/types";
import { storage, STORAGE_KEYS } from "@/utils/storage";
import { tokenManager } from "@/utils/tokenManager";
import authService, { RegisterResponse } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const hasTokens = tokenManager.hasTokens();
    const savedUser = storage.get<User>(STORAGE_KEYS.USER);

    if (hasTokens && savedUser) {
      setUser(savedUser);
    }

    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await authService.login(credentials);

      tokenManager.setAuthToken(response.token);
      tokenManager.setRefreshToken(response.refreshToken);
      storage.set(STORAGE_KEYS.USER, response.user);

      setUser(response.user);
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      // Registration returns email/name but NO tokens (user must verify email first)
      const response = await authService.register(data);

      // Don't store tokens or user - they need to verify email first
      // The OTP modal will handle the verification flow
      console.log("✅ Registration successful, OTP sent to:", response.email);

      return response;
    } catch (error) {
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("🔄 Refreshing session...");
      const response = await authService.refreshToken(refreshToken);

      // If API returns a new refresh token (token rotation), it's already stored by authService
      if (response.refreshToken) {
        console.log("✅ Session refreshed with new refresh token");
      } else {
        console.log("✅ Session refreshed with same refresh token");
      }
    } catch (error) {
      console.error("❌ Session refresh failed:", error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const updatedUser = await authService.getCurrentUser();

      // Update state and localStorage
      storage.set(STORAGE_KEYS.USER, updatedUser);
      setUser(updatedUser);

      console.log("✅ Profile refreshed successfully");
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API fails
      console.error("Logout error:", error);
    } finally {
      // Always clear tokens and local storage, then redirect
      tokenManager.clearTokens();
      storage.remove(STORAGE_KEYS.USER);
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshSession,
        refreshProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
