'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { packagesService, Package } from '@/services/packages.service';
import { Clock, BookOpen, ArrowLeft, ChevronRight, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PackageDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const packageId = params.packageId as string;
        
        // Fetch package details from packages service
        const pkg = await packagesService.getPackageDetails(packageId);
        
        if (!pkg) {
          setError('Package not found');
          return;
        }

        setPackageData(pkg);
      } catch (err: any) {
        setError(err.message || 'Failed to load package details');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [params.packageId, isAuthenticated, router]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
        <div className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
          <p className={`text-lg mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {error || 'Package not found'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-[#2596be] text-white rounded-lg hover:bg-[#1e7ca0]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'} p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
            darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Package Header */}
        <div className={`overflow-hidden rounded-2xl border backdrop-blur-2xl mb-8 ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          {/* Thumbnail */}
          {packageData.thumbnail && (
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src={packageData.thumbnail}
                alt={packageData.title}
                className="w-full h-full object-cover"
              />
              {packageData.examTypes && packageData.examTypes.length > 0 && (
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md ${
                    darkMode ? 'bg-[#2596be]/80 text-white' : 'bg-[#2596be] text-white'
                  }`}>
                    {packageData.examTypes[0]}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="p-8">
            <h1 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {packageData.title}
            </h1>

            {packageData.description && (
              <p className={`text-base mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {packageData.description}
              </p>
            )}

            {packageData.purchaseInfo?.isPurchased ? (
              <div className={`inline-block px-4 py-2 rounded-lg mb-6 ${
                darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
              }`}>
                ✓ Purchased & Active
              </div>
            ) : (
              <div className={`inline-block px-4 py-2 rounded-lg mb-6 ${
                darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
               Available for Purchase (₹{packageData.discountPrice || packageData.price})
              </div>
            )}

            {/* Package Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgb(229, 231, 235)'
            }}>
              <div>
                <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Tests</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {packageData.totalTests || packageData.tests?.length || 0}
                </p>
              </div>
              <div>
                <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</p>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                  {packageData.type}
                </p>
              </div>
              <div>
                <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Validity</p>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                  {packageData.validityDays} days
                </p>
              </div>
              <div>
                <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                  {packageData.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tests List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              All Tests ({packageData.tests?.length || 0})
            </h2>
          </div>

          {packageData.tests && packageData.tests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {packageData.tests.map((test, idx) => (
                <div
                  key={test._id}
                  onClick={() => router.push(`/tests/${test._id}/start`)}
                  className={`p-6 rounded-2xl border backdrop-blur-2xl cursor-pointer transition-all hover:scale-[1.01] ${
                    darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-lg font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {idx + 1}.
                        </span>
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {test.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm ml-8">
                        <div className="flex items-center gap-1">
                          <Clock className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {test.duration} min
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {test.totalMarks} marks
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {test.category}
                          </span>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-xs ${
                          darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {test.type}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className={`h-5 w-5 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 rounded-2xl border ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <BookOpen className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No tests available in this package yet.
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Tests will be added soon. Please check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
