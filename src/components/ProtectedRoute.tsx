'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  fallbackPath?: string; // Custom redirect path
  showUnauthorized?: boolean; // Whether to show unauthorized message instead of redirect
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallbackPath = '/login',
  showUnauthorized = false
}: ProtectedRouteProps) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      // If no user is logged in
      if (!user) {
        setIsAuthorized(false);
        if (!showUnauthorized) {
          router.push(fallbackPath);
        }
        return;
      }

      // If specific roles are required, check if user has permission
      if (requiredRole && requiredRole.length > 0) {
        const hasRequiredRole = userRole && requiredRole.includes(userRole);
        setIsAuthorized(hasRequiredRole);
        
        if (!hasRequiredRole && !showUnauthorized) {
          router.push('/unauthorized');
        }
      } else {
        // No specific role required, just need to be authenticated
        setIsAuthorized(true);
      }
    }
  }, [user, loading, userRole, requiredRole, router, fallbackPath, showUnauthorized]);

  // Show loading spinner while checking auth
  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and we should show unauthorized message
  if (!user && showUnauthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-bold text-foreground">Authentication Required</h1>
          <p className="text-muted-foreground max-w-md">
            You need to be logged in to access this page.
          </p>
          <button 
            onClick={() => router.push(fallbackPath)}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If role check fails and we should show unauthorized message
  if (isAuthorized === false && user && showUnauthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl">⛔</div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don't have the required permissions to access this page.
            {requiredRole && (
              <span className="block mt-2 text-sm">
                Required role{requiredRole.length > 1 ? 's' : ''}: {requiredRole.join(', ')}
              </span>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => router.back()}
              className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated or not authorized, don't render children (will redirect)
  if (!user || isAuthorized === false) {
    return null;
  }

  // User is authenticated and authorized, render the protected content
  return <>{children}</>;
}