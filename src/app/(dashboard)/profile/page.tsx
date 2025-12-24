'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Award,
  Edit2,
  RefreshCw,
  User,
  Target,
  TrendingUp,
  Clock,
  FileText,
  BarChart3,
  LogOut,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useUserStore } from '@/stores/useUserStore';
import EditProfileModal from '@/components/EditProfileModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import type { User as UserType } from '@/types';
import { formatExamType } from '@/utils/formatters';
import userService from '@/services/user.service';

type RefreshMessage = {
  type: 'success' | 'error';
  text: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile, fetchProfile, updateProfileData } = useUserStore();

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [refreshingProfile, setRefreshingProfile] = useState<boolean>(false);
  const [refreshMessage, setRefreshMessage] = useState<RefreshMessage | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

  /** Theme sync */
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    setDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  /** Profile bootstrap */
  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  const handleRefreshProfile = async () => {
    try {
      setRefreshingProfile(true);
      setRefreshMessage(null);
      await fetchProfile(true);
      setRefreshMessage({ type: 'success', text: 'Profile refreshed successfully' });
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile refresh failed';
      setRefreshMessage({ type: 'error', text: message });
      setTimeout(() => setRefreshMessage(null), 5000);
    } finally {
      setRefreshingProfile(false);
    }
  };

  const handleUpdateProfile = async (data: Partial<UserType>) => {
    try {
      setRefreshMessage(null);
      await updateProfileData(data);
      setRefreshMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      setRefreshMessage({ type: 'error', text: message });
      setTimeout(() => setRefreshMessage(null), 5000);
      throw err;
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setRefreshMessage(null);
      await userService.changePassword(currentPassword, newPassword);
      setRefreshMessage({ type: 'success', text: 'Password changed successfully' });
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setRefreshMessage({ type: 'error', text: message });
      setTimeout(() => setRefreshMessage(null), 5000);
      throw err;
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#2596be]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
      {/* Header */}
      <header 
        className="sticky top-0 z-50 w-full border-b backdrop-blur-xl" 
        style={{
          backgroundColor: darkMode ? 'rgba(10, 15, 20, 0.58)' : 'rgba(255, 255, 255, 0.55)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className={`p-2 rounded-lg transition-all duration-200 active:scale-95 ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              My Profile
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const html = document.documentElement;
                html.classList.toggle('dark');
                localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
              }}
              className={`p-2 rounded-lg transition-all duration-200 active:scale-95 ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
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
            <button 
              onClick={logout}
              className={`p-2 rounded-lg transition-all duration-200 active:scale-95 ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Success/Error Message */}
        {refreshMessage && (
          <div 
            className={`mb-6 p-4 rounded-lg border backdrop-blur-sm animate-in slide-in-from-top duration-300 ${
              refreshMessage.type === 'success'
                ? darkMode
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-green-50 border-green-200 text-green-700'
                : darkMode
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">{refreshMessage.text}</p>
            </div>
          </div>
        )}

        {/* Profile Header Card */}
        <div 
          className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 mb-6 ${
            darkMode 
              ? 'bg-gradient-to-br from-[#2596be]/10 via-[#071219]/50 to-[#4EA8DE]/10 border-white/10' 
              : 'bg-gradient-to-br from-white via-gray-50 to-[#2596be]/5 border-gray-200 shadow-lg'
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Avatar */}
            <div 
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold transition-transform duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-[#2596be] to-[#60DFFF] text-white shadow-xl shadow-[#2596be]/20' 
                  : 'bg-gradient-to-br from-[#2596be] to-[#4EA8DE] text-white shadow-xl shadow-[#2596be]/30'
              }`}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>

            {/* Name & Role */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.name}
              </h2>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Student • Target Year {profile.targetYear}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                {profile.examTargets.map((exam) => (
                  <span
                    key={exam}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      darkMode
                        ? 'bg-[#2596be]/20 text-[#60DFFF] border border-[#2596be]/30'
                        : 'bg-[#2596be]/10 text-[#2596be] border border-[#2596be]/20'
                    }`}
                  >
                    {formatExamType(exam)}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleRefreshProfile}
                disabled={refreshingProfile}
                className={`p-3 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                  darkMode
                    ? 'bg-[#2596be]/20 text-[#60DFFF] hover:bg-[#2596be]/30 disabled:opacity-50'
                    : 'bg-[#2596be]/10 text-[#2596be] hover:bg-[#2596be]/20 disabled:opacity-50'
                }`}
                title="Refresh Profile"
              >
                <RefreshCw className={`h-5 w-5 ${refreshingProfile ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className={`p-3 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                  darkMode
                    ? 'bg-[#60DFFF]/20 text-[#60DFFF] hover:bg-[#60DFFF]/30'
                    : 'bg-[#60DFFF]/10 text-[#2596be] hover:bg-[#60DFFF]/20'
                }`}
                title="Edit Profile"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <StatCard
            icon={FileText}
            label="Tests Attempted"
            value={profile.stats?.testsAttempted?.toString() || '0'}
            darkMode={darkMode}
            gradient="from-[#2596be]/10 to-[#2596be]/5"
          />
          <StatCard
            icon={TrendingUp}
            label="Average Score"
            value={`${profile.stats?.averageScore?.toFixed(1) || '0'}%`}
            darkMode={darkMode}
            gradient="from-[#4EA8DE]/10 to-[#4EA8DE]/5"
          />
          <StatCard
            icon={BarChart3}
            label="Best Rank"
            value={profile.stats?.bestRank ? `#${profile.stats.bestRank}` : '-'}
            darkMode={darkMode}
            gradient="from-[#60DFFF]/10 to-[#60DFFF]/5"
          />
          <StatCard
            icon={Clock}
            label="Study Hours"
            value={`${profile.stats?.totalStudyHours || '0'}h`}
            darkMode={darkMode}
            gradient="from-purple-500/10 to-purple-500/5"
          />
        </div>

        {/* Personal Information */}
        <div 
          className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-sm mb-6 ${
            darkMode 
              ? 'bg-[#071219]/50 border-white/10' 
              : 'bg-white border-gray-200 shadow-lg'
          }`}
        >
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <InfoCard icon={Mail} label="Email Address" value={profile.email} darkMode={darkMode} />
            <InfoCard icon={Phone} label="Phone Number" value={profile.phone} darkMode={darkMode} />
            <InfoCard 
              icon={Calendar} 
              label="Date of Birth" 
              value={new Date(profile.dateOfBirth).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} 
              darkMode={darkMode} 
            />
            <InfoCard icon={Target} label="Target Year" value={profile.targetYear.toString()} darkMode={darkMode} />
          </div>
        </div>

        {/* Account Details */}
        <div 
          className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-sm ${
            darkMode 
              ? 'bg-[#071219]/50 border-white/10' 
              : 'bg-white border-gray-200 shadow-lg'
          }`}
        >
          <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Account Details
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Account ID
              </span>
              <span className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {profile.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Member Since
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Last Updated
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {new Date(profile.updatedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div 
          className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-sm ${
            darkMode 
              ? 'bg-[#071219]/50 border-white/10' 
              : 'bg-white border-gray-200 shadow-lg'
          }`}
        >
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Security
          </h3>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Keep your account secure by regularly updating your password
          </p>
          <button
            onClick={() => setShowPasswordModal(true)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 ${
              darkMode
                ? 'bg-[#2596be]/20 text-[#60DFFF] hover:bg-[#2596be]/30 border border-[#2596be]/30'
                : 'bg-[#2596be]/10 text-[#2596be] hover:bg-[#2596be]/20 border border-[#2596be]/20'
            }`}
          >
            <KeyRound className="h-5 w-5" />
            Change Password
          </button>
        </div>
      </main>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateProfile}
        user={profile}
        darkMode={darkMode}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
        darkMode={darkMode}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  darkMode,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  darkMode: boolean;
  gradient: string;
}) {
  return (
    <div 
      className={`p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        darkMode 
          ? `bg-gradient-to-br ${gradient} border-white/10` 
          : `bg-gradient-to-br ${gradient} border-gray-200 shadow-md hover:shadow-lg`
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`h-5 w-5 ${darkMode ? 'text-[#60DFFF]' : 'text-[#2596be]'}`} />
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </span>
      </div>
      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  darkMode,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  darkMode: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg transition-all duration-200 ${
      darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <div className="flex gap-3 items-start">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-[#60DFFF]' : 'text-[#2596be]'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </p>
          <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
