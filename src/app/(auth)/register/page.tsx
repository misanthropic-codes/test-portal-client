'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isValidEmail, isValidPassword } from '@/utils/validators';
import { ExamType } from '@/types';
import OTPModal from '@/components/OTPModal';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    targetYear: new Date().getFullYear() + 1,
  });
  const [examTargets, setExamTargets] = useState<ExamType[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!formData.dateOfBirth) {
      setError('Please enter your date of birth');
      return;
    }

    if (examTargets.length === 0) {
      setError('Please select at least one exam target');
      return;
    }

    try {
      setLoading(true);
      // Exclude confirmPassword from the payload
      const { confirmPassword, ...registrationData } = formData;
      await register({
        ...registrationData,
        examTargets,
      });
      // Registration successful - show OTP modal
      setShowOTPModal(true);
    } catch (err: any) {
      // Show the actual error message from the API
      const errorMessage = err?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = (otp: string) => {
    console.log('OTP verified:', otp);
    // Close modal and redirect to dashboard
    setShowOTPModal(false);
    router.push('/dashboard');
  };

  const handleOTPClose = () => {
    // Allow user to close modal if needed
    setShowOTPModal(false);
  };

  const toggleExam = (exam: ExamType) => {
    setExamTargets((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]
    );
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl transition-all ${darkMode ? "bg-[#2596be]/10" : "bg-[#2596be]/20"}`} />
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl transition-all ${darkMode ? "bg-[#4EA8DE]/15" : "bg-[#4EA8DE]/25"}`} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-2xl shadow-2xl ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
        }`}>
          <div className="text-center mb-6 sm:mb-8">
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Create Account
            </h1>
            <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Join thousands preparing for competitive exams
            </p>
          </div>

          {error && (
            <div className={`p-3 rounded-lg mb-4 ${
              darkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                  }`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                  }`}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                  }`}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                  }`}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                  }`}
                  placeholder="+919876543210"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Target Year *
              </label>
              <input
                type="number"
                value={formData.targetYear}
                onChange={(e) => setFormData({ ...formData, targetYear: parseInt(e.target.value) })}
                required
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 5}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Target Exams *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[ExamType.JEE_MAIN, ExamType.JEE_ADVANCED, ExamType.NEET, ExamType.BITSAT, ExamType.COMEDK].map((exam) => (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => toggleExam(exam)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      examTargets.includes(exam)
                        ? darkMode
                          ? 'bg-[#2596be]/20 text-[#60DFFF] border-2 border-[#2596be]'
                          : 'bg-[#2596be]/10 text-[#2596be] border-2 border-[#2596be]'
                        : darkMode
                        ? 'bg-white/5 text-gray-400 border-2 border-white/10 hover:bg-white/10'
                        : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {exam.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2596be] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1e7ca0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
            </span>
            <Link
              href="/login"
              className={`text-sm font-semibold ${darkMode ? 'text-[#60DFFF] hover:text-[#2596be]' : 'text-[#2596be] hover:text-[#1e7ca0]'}`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={handleOTPClose}
        onVerify={handleOTPVerify}
        email={formData.email}
        darkMode={darkMode}
      />
    </div>
  );
}
