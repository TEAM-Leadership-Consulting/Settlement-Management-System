'use client'

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Bell
} from 'lucide-react';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  totalParties: number;
  totalPayments: number;
  totalDocuments: number;
  pendingPayments: number;
}

const Dashboard = () => {
  // Initialize Supabase client
  
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    totalParties: 0,
    totalPayments: 0,
    totalDocuments: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentCases, setRecentCases] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch case statistics
      const { data: cases } = await supabase
        .from('cases')
        .select('case_id, case_number, case_title, case_status, created_date')
        .order('created_date', { ascending: false })
        .limit(5);

      const { count: totalCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true });

      const { count: activeCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('case_status', 'active');

      const { count: totalParties } = await supabase
        .from('parties')
        .select('*', { count: 'exact', head: true });

      const { count: totalDocuments } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalCases: totalCases || 0,
        activeCases: activeCases || 0,
        totalParties: totalParties || 0,
        totalPayments: 0, // Will update when we have payment data
        totalDocuments: totalDocuments || 0,
        pendingPayments: 0
      });

      setRecentCases(cases || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: {
  title: string;
  value: number;
  icon: any;
  color: string;
  trend?: string;
}) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Settlement Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Search className="h-6 w-6" />
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">CS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, Christina!</h2>
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
          />
          <StatCard
            title="Active Cases"
            value={stats.activeCases}
            icon={Clock}
            color="bg-green-600"
          />
          <StatCard
            title="Total Parties"
            value={stats.totalParties}
            icon={Users}
            color="bg-purple-600"
          />
          <StatCard
            title="Documents"
            value={stats.totalDocuments}
            icon={FileText}
            color="bg-orange-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Plus className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-gray-900 font-medium">New Case</span>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-gray-900 font-medium">Add Party</span>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-gray-900 font-medium">Upload Document</span>
            </button>
          </div>
        </div>

        {/* Recent Activity & Case Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Cases */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Cases</h3>
            {recentCases.length > 0 ? (
              <div className="space-y-4">
                {recentCases.map((case_item: { case_id: number; case_title: string; case_number: string; case_status: string }) => (
                  <div key={case_item.case_id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{case_item.case_title}</p>
                      <p className="text-sm text-gray-500">#{case_item.case_number}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        case_item.case_status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {case_item.case_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No cases found. Create your first case to get started!</p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
  );
};

export default Dashboard;