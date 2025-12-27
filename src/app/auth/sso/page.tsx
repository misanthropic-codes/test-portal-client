'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { tokenManager } from '@/utils/tokenManager';
import { storage, STORAGE_KEYS } from '@/utils/storage';

/**
 * SSO Authentication Page
 * 
 * This page handles cross-domain authentication by accepting tokens via URL params.
 * Used when redirecting from aspiring-engineers platform to take tests.
 * 
 * URL format: /auth/sso?token=xxx&refreshToken=xxx&redirect=/dashboard
 */
export default function SSOAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Authenticating...');

  useEffect(() => {
    const handleSSO = async () => {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const redirect = searchParams.get('redirect') || '/dashboard';
        const packageId = searchParams.get('packageId');

        if (!token) {
          setStatus('error');
          setMessage('No authentication token provided');
          return;
        }

        // Store the tokens
        tokenManager.setAuthToken(token);
        
        if (refreshToken) {
          tokenManager.setRefreshToken(refreshToken);
        }

        console.log('🔐 SSO: Tokens stored successfully');
        setStatus('success');
        setMessage('Authenticated! Redirecting...');

        // Redirect to the intended destination
        setTimeout(() => {
          if (packageId) {
            router.push(`/tests?packageId=${packageId}`);
          } else {
            router.push(redirect);
          }
        }, 500);
      } catch (error) {
        console.error('SSO Error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    };

    handleSSO();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 rounded-2xl border bg-card">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-500 font-medium">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-500 font-medium">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
