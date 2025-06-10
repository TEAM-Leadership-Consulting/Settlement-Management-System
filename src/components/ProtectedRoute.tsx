'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If no user is logged in, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // If specific roles are required, check if user has permission
      if (requiredRole && requiredRole.length > 0) {
        if (!userRole || !requiredRole.includes(userRole)) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [user, loading, userRole, requiredRole, router]);

  // Show loading spinner while checking auth
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

  // If not authenticated, don't render children (will redirect)
  if (!user) {
    return null;
  }

  // If role check fails, don't render children (will redirect)
  if (requiredRole && requiredRole.length > 0 && (!userRole || !requiredRole.includes(userRole))) {
    return null;
  }

  // User is authenticated and authorized, render the protected content
  return <>{children}</>;
}