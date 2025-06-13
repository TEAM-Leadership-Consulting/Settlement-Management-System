'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { ArrowRight, Users, FileText, DollarSign, Shield } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [forceShowAuth, setForceShowAuth] = useState(false);

  // Force show auth section after 3 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Forcing auth section display due to timeout');
        setForceShowAuth(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [loading]);

  const handleDashboardClick = () => {
    if (loading && !forceShowAuth) {
      return;
    }

    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  // Debug: Log authentication state
  console.log('Home page auth state:', {
    loading,
    user: user?.email || null,
    forceShowAuth,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Debug Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gray-100 border rounded-lg p-3 text-sm mb-4">
          <strong>Debug Info:</strong>
          <span className="ml-2">Loading: {loading ? 'true' : 'false'}</span>
          <span className="ml-4">User: {user ? user.email : 'null'}</span>
          <span className="ml-4">
            Force Show: {forceShowAuth ? 'true' : 'false'}
          </span>
          <button
            onClick={() => setForceShowAuth(true)}
            className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
          >
            Force Show Auth
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Settlement Management System
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/test-db"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Test Database
              </Link>
              <button
                onClick={handleDashboardClick}
                disabled={loading && !forceShowAuth}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && !forceShowAuth
                  ? 'Loading...'
                  : user
                  ? 'Dashboard'
                  : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Settlement Management
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your legal settlement processes with our comprehensive
            management system. Track cases, manage parties, process payments,
            and generate reports all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {loading && !forceShowAuth ? (
              // Show loading state
              <button
                disabled
                className="inline-flex items-center bg-gray-300 text-gray-500 px-8 py-4 rounded-lg text-lg font-semibold cursor-not-allowed"
              >
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
                Loading...
              </button>
            ) : user ? (
              // Show dashboard access for authenticated users
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Access Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            ) : (
              // Show login for unauthenticated users
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign In to Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            )}

            <Link
              href="/test-db"
              className="inline-flex items-center border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Test Database Connection
            </Link>
          </div>
        </div>

        {/* Authentication Status Section */}
        <div className="py-8">
          {loading && !forceShowAuth ? (
            // Loading State
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Checking Authentication...
              </h3>
              <p className="text-yellow-700 mb-4">
                Please wait while we verify your login status.
              </p>
              <button
                onClick={() => setForceShowAuth(true)}
                className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
              >
                Skip Loading (Force Continue)
              </button>
            </div>
          ) : user ? (
            // User is authenticated
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Welcome back, {user.email}!
              </h3>
              <p className="text-green-700 mb-4">
                You&apos;re logged in and ready to access the settlement
                management system.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to Your Dashboard
              </button>
            </div>
          ) : (
            // User is NOT authenticated - SHOW LOGIN PROMPT
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                🔐 Authentication Required
              </h3>
              <p className="text-red-700 mb-4">
                You must sign in to access the settlement management system.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
                >
                  Sign In Now
                </button>
                <p className="text-sm text-red-600">
                  Demo credentials: admin@settlement.com / ChangeMe123!
                </p>
                <div className="text-xs text-red-500 bg-red-100 p-2 rounded">
                  Debug: loading={loading ? 'true' : 'false'}, user=
                  {user ? 'exists' : 'null'}, forced=
                  {forceShowAuth ? 'true' : 'false'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Settlement Management
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Case Management
              </h3>
              <p className="text-gray-600">
                Create, track, and manage settlement cases from filing to final
                distribution.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="bg-green-100 p-3 rounded-lg inline-block mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Party Management
              </h3>
              <p className="text-gray-600">
                Manage claimants, defendants, attorneys, and other parties
                involved in settlements.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="bg-purple-100 p-3 rounded-lg inline-block mb-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Processing
              </h3>
              <p className="text-gray-600">
                Handle settlement distributions, track payments, and manage
                financial workflows.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="bg-orange-100 p-3 rounded-lg inline-block mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Compliance & Security
              </h3>
              <p className="text-gray-600">
                Built-in compliance tools and secure data handling for legal
                requirements.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              Settlement Management System - Built with Next.js, Supabase &
              Tailwind CSS
            </p>
            <p className="text-gray-500 mt-2">
              © 2025 TEAM Leadership Consulting. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
