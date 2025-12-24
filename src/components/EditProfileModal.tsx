'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { User, ExamType } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<User>) => Promise<void>;
  user: User;
  darkMode?: boolean;
}

export default function EditProfileModal({ isOpen, onClose, onSave, user, darkMode = false }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    targetYear: user.targetYear,
    examTargets: user.examTargets,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        targetYear: user.targetYear,
        examTargets: user.examTargets,
      });
      setError('');
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone) {
      setError('Name and phone are required');
      return;
    }

    if (formData.examTargets.length === 0) {
      setError('Please select at least one exam target');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleExam = (exam: ExamType) => {
    setFormData(prev => ({
      ...prev,
      examTargets: prev.examTargets.includes(exam)
        ? prev.examTargets.filter(e => e !== exam)
        : [...prev.examTargets, exam]
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
      }`}
    >
      <div className={`w-full max-w-2xl p-6 sm:p-8 rounded-2xl border shadow-2xl overflow-y-auto max-h-[90vh] transition-all duration-300 ${
        darkMode ? 'bg-[#071219] border-white/10' : 'bg-white border-gray-200'
      } ${
        isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
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
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be]'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be]'
                }`}
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
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be]'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be]'
                }`}
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
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be]'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be]'
                }`}
              />
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
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be]'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be]'
                }`}
              />
            </div>
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
                    formData.examTargets.includes(exam)
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                darkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-[#2596be] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1e7ca0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
