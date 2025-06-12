// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string[];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requireRole = [],
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) {
      console.log('ProtectedRoute: Still loading auth state...');
      return;
    }

    // No user found - redirect to login
    if (!user) {
      console.log('ProtectedRoute: No user found, redirecting to login');
      router.replace(fallbackPath);
      return;
    }

    // Check role requirements if specified
    if (requireRole.length > 0 && userProfile) {
      if (!requireRole.includes(userProfile.role)) {
        console.log(
          `ProtectedRoute: User role '${userProfile.role}' not in required roles:`,
          requireRole
        );
        router.replace('/unauthorized');
        return;
      }
    }

    console.log('ProtectedRoute: Access granted');
  }, [user, userProfile, loading, router, requireRole, fallbackPath]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading if no user (about to redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role permissions
  if (
    requireRole.length > 0 &&
    userProfile &&
    !requireRole.includes(userProfile.role)
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h1 className="text-red-800 text-xl font-semibold mb-2">
              Access Denied
            </h1>
            <p className="text-red-600">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-red-500 text-sm mt-2">
              Required role: {requireRole.join(' or ')}
              <br />
              Your role: {userProfile.role}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
