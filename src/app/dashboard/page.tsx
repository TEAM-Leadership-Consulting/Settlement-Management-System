'use client'

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Bell,
  LogOut,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface RecentCase {
  case_id: number;
  case_number: string;
  case_title: string;
  case_status: string;
  created_date: string;
  case_type?: string;
}

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  totalParties: number;
  totalPayments: number;
  totalDocuments: number;
  pendingPayments: number;
  pendingDocuments: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  action?: string;
}

const Dashboard = () => {
  const { signOut, userProfile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    totalParties: 0,
    totalPayments: 0,
    totalDocuments: 0,
    pendingPayments: 0,
    pendingDocuments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch case statistics with error handling
      const [
        casesResponse,
        totalCasesResponse,
        activeCasesResponse,
        partiesResponse,
        documentsResponse,
        pendingDocsResponse,
        paymentsResponse,
        pendingPaymentsResponse
      ] = await Promise.allSettled([
        supabase
          .from('cases')
          .select('case_id, case_number, case_title, case_status, created_date')
          .order('created_date', { ascending: false })
          .limit(5),
        supabase
          .from('cases')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('case_status', 'active'),
        supabase
          .from('parties')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('documents')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('document_status', 'pending'),
        supabase
          .from('payments')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .in('payment_status', ['pending', 'approved'])
      ]);

      // Process results and handle errors
      const cases = casesResponse.status === 'fulfilled' ? casesResponse.value.data || [] : [];
      const totalCases = totalCasesResponse.status === 'fulfilled' ? totalCasesResponse.value.count || 0 : 0;
      const activeCases = activeCasesResponse.status === 'fulfilled' ? activeCasesResponse.value.count || 0 : 0;
      const totalParties = partiesResponse.status === 'fulfilled' ? partiesResponse.value.count || 0 : 0;
      const totalDocuments = documentsResponse.status === 'fulfilled' ? documentsResponse.value.count || 0 : 0;
      const pendingDocuments = pendingDocsResponse.status === 'fulfilled' ? pendingDocsResponse.value.count || 0 : 0;
      const totalPayments = paymentsResponse.status === 'fulfilled' ? paymentsResponse.value.count || 0 : 0;
      const pendingPayments = pendingPaymentsResponse.status === 'fulfilled' ? pendingPaymentsResponse.value.count || 0 : 0;

      setStats({
        totalCases,
        activeCases,
        totalParties,
        totalPayments,
        totalDocuments,
        pendingPayments,
        pendingDocuments
      });

      setRecentCases(cases);

      // Generate alerts based on data
      const newAlerts: Alert[] = [];
      if (pendingDocuments > 0) {
        newAlerts.push({
          id: 'pending-docs',
          type: 'warning',
          message: `${pendingDocuments} documents require review`,
          action: 'Review Documents'
        });
      }
      if (pendingPayments > 0) {
        newAlerts.push({
          id: 'pending-payments',
          type: 'warning',
          message: `${pendingPayments} payments are pending approval`,
          action: 'Review Payments'
        });
      }
      setAlerts(newAlerts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, onClick }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: string;
    onClick?: () => void;
  }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Settlement Management System</h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Notification Bell with Badge */}
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-gray-500">
                    <Bell className="h-6 w-6" />
                    {alerts.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {alerts.length}
                      </span>
                    )}
                  </button>
                </div>
                
                <button 
                  className="p-2 text-gray-400 hover:text-gray-500"
                  onClick={() => navigateTo('/search')}
                >
                  <Search className="h-6 w-6" />
                </button>
                
                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{userProfile?.role}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {userProfile?.first_name?.charAt(0)}{userProfile?.last_name?.charAt(0)}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="ml-auto text-red-600 hover:text-red-800 font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  alert.type === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className={`h-5 w-5 mr-3 ${
                        alert.type === 'warning' ? 'text-yellow-500' :
                        alert.type === 'error' ? 'text-red-500' :
                        'text-blue-500'
                      }`} />
                      <span className={
                        alert.type === 'warning' ? 'text-yellow-800' :
                        alert.type === 'error' ? 'text-red-800' :
                        'text-blue-800'
                      }>
                        {alert.message}
                      </span>
                    </div>
                    {alert.action && (
                      <button className={`px-3 py-1 rounded text-sm font-medium ${
                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                        alert.type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}>
                        {alert.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {userProfile?.first_name}!
            </h2>
            <p className="text-gray-600">Here&apos;s what&apos;s happening with your settlements today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Cases"
              value={stats.totalCases}
              icon={FileText}
              color="bg-blue-600"
              trend="+12% from last month"
              onClick={() => navigateTo('/cases')}
            />
            <StatCard
              title="Active Cases"
              value={stats.activeCases}
              icon={Clock}
              color="bg-green-600"
              onClick={() => navigateTo('/cases?status=active')}
            />
            <StatCard
              title="Total Parties"
              value={stats.totalParties}
              icon={Users}
              color="bg-purple-600"
              onClick={() => navigateTo('/parties')}
            />
            <StatCard
              title="Documents"
              value={stats.totalDocuments}
              icon={FileText}
              color="bg-orange-600"
              onClick={() => navigateTo('/documents')}
            />
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Pending Documents"
              value={stats.pendingDocuments}
              icon={AlertCircle}
              color="bg-yellow-600"
              onClick={() => navigateTo('/documents?status=pending')}
            />
            <StatCard
              title="Total Payments"
              value={stats.totalPayments}
              icon={DollarSign}
              color="bg-green-600"
              onClick={() => navigateTo('/payments')}
            />
            <StatCard
              title="Pending Payments"
              value={stats.pendingPayments}
              icon={Clock}
              color="bg-red-600"
              onClick={() => navigateTo('/payments?status=pending')}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => navigateTo('/cases/new')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-900 font-medium">New Case</span>
              </button>
              <button 
                onClick={() => navigateTo('/estimates/new')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-900 font-medium">Create Estimate</span>
              </button>
              <button 
                onClick={() => navigateTo('/parties/new')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-gray-900 font-medium">Add Party</span>
              </button>
              <button 
                onClick={() => navigateTo('/documents/upload')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-gray-900 font-medium">Upload Document</span>
              </button>
            </div>
          </div>

          {/* Recent Activity & Case Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Cases */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Cases</h3>
                <button 
                  onClick={() => navigateTo('/cases')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {recentCases.length > 0 ? (
                <div className="space-y-4">
                  {recentCases.map((case_item: RecentCase) => (
                    <div 
                      key={case_item.case_id} 
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigateTo(`/cases/${case_item.case_id}`)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{case_item.case_title}</p>
                        <p className="text-sm text-gray-500">#{case_item.case_number}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          case_item.case_status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : case_item.case_status === 'pending_approval'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {case_item.case_status.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(case_item.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No cases found. Create your first case to get started!</p>
                  <button 
                    onClick={() => navigateTo('/cases/new')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Case
                  </button>
                </div>
              )}
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-900">Database Connection</span>
                  </div>
                  <span className="text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-900">Payment Processing</span>
                  </div>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-900">Document Storage</span>
                  </div>
                  <span className="text-green-600 font-medium">Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-gray-900">Email Notifications</span>
                  </div>
                  <span className="text-yellow-600 font-medium">Setup Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500">
            <p>Settlement Management System - Built with Next.js & Supabase</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;