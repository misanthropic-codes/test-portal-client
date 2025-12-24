import { create } from 'zustand';
import { User } from '@/types';
import userService from '@/services/user.service';
import { storage, STORAGE_KEYS } from '@/utils/storage';

interface UserStore {
  profile: User | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  fetchProfile: (force?: boolean) => Promise<void>;
  clearProfile: () => void;
  updateProfile: (profile: User) => void;
  updateProfileData: (data: Partial<User>) => Promise<User>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchProfile: async (force = false) => {
    const { lastFetched, loading } = get();
    
    // Check if cache is still valid
    const now = Date.now();
    const cacheValid = lastFetched && (now - lastFetched) < CACHE_DURATION;
    
    if (!force && cacheValid && !loading) {
      console.log('📦 Using cached user profile');
      return;
    }
    
    // Prevent duplicate requests
    if (loading) {
      console.log('⏳ Profile fetch already in progress');
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const profile = await userService.getUserProfile();
      set({ 
        profile, 
        loading: false, 
        error: null,
        lastFetched: Date.now()
      });
      
      // Update localStorage
      storage.set(STORAGE_KEYS.USER, profile);
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to fetch profile'
      });
      throw error;
    }
  },

  clearProfile: () => {
    set({ 
      profile: null, 
      loading: false, 
      error: null,
      lastFetched: null
    });
  },

  updateProfile: (profile: User) => {
    set({ profile, lastFetched: Date.now() });
    storage.set(STORAGE_KEYS.USER, profile);
  },

  updateProfileData: async (data: Partial<User>) => {
    set({ loading: true, error: null });
    
    try {
      const updatedProfile = await userService.updateUserProfile(data);
      
      set({ 
        profile: updatedProfile, 
        loading: false, 
        error: null,
        lastFetched: Date.now()
      });
      
      // Update localStorage
      storage.set(STORAGE_KEYS.USER, updatedProfile);
      
      return updatedProfile;
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to update profile'
      });
      throw error;
    }
  },
}));
