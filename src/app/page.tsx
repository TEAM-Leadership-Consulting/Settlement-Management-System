'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Users, FileText, DollarSign, Shield } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleDashboardClick = () => {
    if (loading) {
      return; // Don't do anything while loading
    }

    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : user ? 'Go to Dashboard' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {!loading && !user ? (
              // Show login prompt for unauthenticated users
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Sign In to Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <Link
                  href="/test-db"
                  className="inline-flex items-center border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Test Database Connection
                </Link>
              </>
            ) : loading ? (
              // Show loading state
              <button
                disabled
                className="inline-flex items-center bg-gray-300 text-gray-500 px-8 py-4 rounded-lg text-lg font-semibold cursor-not-allowed"
              >
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
                Loading...
              </button>
            ) : (
              // Show dashboard access for authenticated users
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Access Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <Link
                  href="/test-db"
                  className="inline-flex items-center border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Test Database Connection
                </Link>
              </>
            )}
          </div>
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

        {/* User Status Section */}
        {user && !loading && (
          <div className="py-8">
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
          </div>
        )}

        {/* Login Prompt for Unauthenticated Users */}
        {!user && !loading && (
          <div className="py-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                🔐 Authentication Required
              </h3>
              <p className="text-blue-700 mb-4">
                Please sign in to access your settlement management dashboard
                and start managing your cases.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                >
                  Sign In to Continue
                </button>
                <p className="text-sm text-blue-600">
                  Demo credentials: admin@settlement.com / ChangeMe123!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Checking Authentication...
              </h3>
              <p className="text-yellow-700">
                Please wait while we verify your login status.
              </p>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              System Status
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full inline-block mb-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-gray-900">Database</h3>
                <p className="text-green-600">Connected & Operational</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full inline-block mb-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-semibold text-gray-900">Application</h3>
                <p className="text-green-600">Running Smoothly</p>
              </div>
              <div className="text-center">
                <div
                  className={`p-3 rounded-full inline-block mb-3 ${
                    loading
                      ? 'bg-yellow-100'
                      : user
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full ${
                      loading
                        ? 'bg-yellow-500'
                        : user
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                    }`}
                  ></div>
                </div>
                <h3 className="font-semibold text-gray-900">Authentication</h3>
                <p
                  className={
                    loading
                      ? 'text-yellow-600'
                      : user
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                >
                  {loading
                    ? 'Checking...'
                    : user
                    ? 'Authenticated'
                    : 'Sign In Required'}
                </p>
              </div>
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
