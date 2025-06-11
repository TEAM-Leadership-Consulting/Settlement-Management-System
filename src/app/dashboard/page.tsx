'use client';

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
  Clock,
  Search,
  Bell,
  LogOut,
  DollarSign,
  AlertTriangle,
  Database,
  Briefcase,
  Building,
  Contact,
  Globe,
  BarChart3,
  Award,
  Mail,
  CheckSquare,
  UserCheck,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  X,
  Trash2,
} from 'lucide-react';

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

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'task' | 'meeting';
  time?: string;
  description?: string;
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
    pendingDocuments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>(
    'month'
  );
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<
    'all' | 'deadline' | 'task' | 'meeting'
  >('all');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'meeting' as 'deadline' | 'task' | 'meeting',
    description: '',
  });

  useEffect(() => {
    fetchDashboardData();
    fetchCalendarEvents();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);

      const [
        totalCasesResponse,
        activeCasesResponse,
        partiesResponse,
        documentsResponse,
        pendingDocsResponse,
        paymentsResponse,
        pendingPaymentsResponse,
      ] = await Promise.allSettled([
        supabase.from('cases').select('*', { count: 'exact', head: true }),
        supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('case_status', 'active'),
        supabase.from('parties').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('document_status', 'pending'),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
        supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .in('payment_status', ['pending', 'approved']),
      ]);

      const totalCases =
        totalCasesResponse.status === 'fulfilled'
          ? totalCasesResponse.value.count || 0
          : 0;
      const activeCases =
        activeCasesResponse.status === 'fulfilled'
          ? activeCasesResponse.value.count || 0
          : 0;
      const totalParties =
        partiesResponse.status === 'fulfilled'
          ? partiesResponse.value.count || 0
          : 0;
      const totalDocuments =
        documentsResponse.status === 'fulfilled'
          ? documentsResponse.value.count || 0
          : 0;
      const pendingDocuments =
        pendingDocsResponse.status === 'fulfilled'
          ? pendingDocsResponse.value.count || 0
          : 0;
      const totalPayments =
        paymentsResponse.status === 'fulfilled'
          ? paymentsResponse.value.count || 0
          : 0;
      const pendingPayments =
        pendingPaymentsResponse.status === 'fulfilled'
          ? pendingPaymentsResponse.value.count || 0
          : 0;

      setStats({
        totalCases,
        activeCases,
        totalParties,
        totalPayments,
        totalDocuments,
        pendingPayments,
        pendingDocuments,
      });

      const newAlerts: Alert[] = [];
      if (pendingDocuments > 0) {
        newAlerts.push({
          id: 'pending-docs',
          type: 'warning',
          message: `${pendingDocuments} documents require review`,
          action: 'Review Documents',
        });
      }
      if (pendingPayments > 0) {
        newAlerts.push({
          id: 'pending-payments',
          type: 'warning',
          message: `${pendingPayments} payments are pending approval`,
          action: 'Review Payments',
        });
      }
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(
        'Failed to load dashboard data. Please try refreshing the page.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    // Mock calendar events - in real implementation, fetch from database
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Final Approval Hearing - Smith v. ABC Corp',
        date: new Date(2025, 5, 15),
        type: 'deadline',
        time: '10:00 AM',
        description: 'Court hearing for final settlement approval',
      },
      {
        id: '2',
        title: 'Claim Deadline - Johnson Case',
        date: new Date(2025, 5, 20),
        type: 'deadline',
        time: '11:59 PM',
        description: 'Final deadline for claim submissions',
      },
      {
        id: '3',
        title: 'Review Settlement Documents',
        date: new Date(2025, 5, 18),
        type: 'task',
        time: '2:00 PM',
        description: 'Review and approve settlement documentation',
      },
      {
        id: '4',
        title: 'Client Meeting - ABC Settlement',
        date: new Date(2025, 5, 22),
        type: 'meeting',
        time: '9:00 AM',
        description: 'Meeting with client to discuss distribution timeline',
      },
      {
        id: '5',
        title: 'Document Review Deadline',
        date: new Date(2025, 5, 25),
        type: 'deadline',
        time: '5:00 PM',
        description: 'Final deadline for document submissions',
      },
      {
        id: '6',
        title: 'Team Standup Meeting',
        date: new Date(2025, 5, 16),
        type: 'meeting',
        time: '11:00 AM',
        description: 'Weekly team coordination meeting',
      },
      {
        id: '7',
        title: 'Complete Payment Processing',
        date: new Date(2025, 5, 19),
        type: 'task',
        time: '3:00 PM',
        description: 'Process pending settlement payments',
      },
    ];
    setCalendarEvents(mockEvents);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    // Fix timezone issue by creating date in local timezone
    const dateParts = newEvent.date.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2]);
    const eventDate = new Date(year, month, day);

    const newCalendarEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: eventDate,
      type: newEvent.type,
      time: newEvent.time || undefined,
      description: newEvent.description || undefined,
    };

    setCalendarEvents([...calendarEvents, newCalendarEvent]);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      type: 'meeting',
      description: '',
    });
    setShowAddEventModal(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setCalendarEvents(calendarEvents.filter((event) => event.id !== eventId));
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    onClick,
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: string;
    onClick?: () => void;
  }) => (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getFilteredEvents = () => {
    if (eventFilter === 'all') return calendarEvents;
    return calendarEvents.filter((event) => event.type === eventFilter);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const filteredEvents = getFilteredEvents();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-28 border border-gray-200"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = filteredEvents.filter(
        (event) => event.date.toDateString() === dayDate.toDateString()
      );

      days.push(
        <div
          key={day}
          className="h-28 border border-gray-200 p-1 overflow-y-auto"
        >
          <div className="font-medium text-sm mb-1">{day}</div>
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className={`text-xs p-1 mb-1 rounded truncate cursor-pointer group ${
                event.type === 'deadline'
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : event.type === 'task'
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
              title={`${event.title} - ${event.time || ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1 truncate">{event.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 text-red-600 hover:text-red-800 transition-opacity"
                  title="Delete event"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-3 font-semibold text-center bg-gray-50 border border-gray-200"
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const filteredEvents = getFilteredEvents();
    return (
      <div className="space-y-3">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="text-sm text-gray-500 min-w-[100px]">
              {event.date.toLocaleDateString()}
            </div>
            <div className="text-sm font-medium min-w-[80px]">{event.time}</div>
            <div className="flex-1 font-medium">{event.title}</div>
            {event.description && (
              <div className="text-sm text-gray-600 max-w-xs">
                {event.description}
              </div>
            )}
            <div
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                event.type === 'deadline'
                  ? 'bg-red-100 text-red-800'
                  : event.type === 'task'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {event.type}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const filteredEvents = getFilteredEvents();
    const todayEvents = filteredEvents.filter(
      (event) => event.date.toDateString() === currentDate.toDateString()
    );

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h3>
        {todayEvents.length > 0 ? (
          todayEvents.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{event.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{event.time}</p>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-2">
                      {event.description}
                    </p>
                  )}
                </div>
                <div
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    event.type === 'deadline'
                      ? 'bg-red-100 text-red-800'
                      : event.type === 'task'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {event.type}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-12">
            No events scheduled for this day
          </p>
        )}
      </div>
    );
  };

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
                <h1 className="text-2xl font-bold text-gray-900">
                  Settlement Management System
                </h1>
              </div>
              <div className="flex items-center space-x-4">
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

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userProfile?.role}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {userProfile?.first_name?.charAt(0)}
                      {userProfile?.last_name?.charAt(0)}
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
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : alert.type === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle
                        className={`h-5 w-5 mr-3 ${
                          alert.type === 'warning'
                            ? 'text-yellow-500'
                            : alert.type === 'error'
                            ? 'text-red-500'
                            : 'text-blue-500'
                        }`}
                      />
                      <span
                        className={
                          alert.type === 'warning'
                            ? 'text-yellow-800'
                            : alert.type === 'error'
                            ? 'text-red-800'
                            : 'text-blue-800'
                        }
                      >
                        {alert.message}
                      </span>
                    </div>
                    {alert.action && (
                      <button
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          alert.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : alert.type === 'error'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
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
            <p className="text-gray-600">
              Here&apos;s what&apos;s happening with your settlements today.
            </p>
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

          {/* Quick Actions - Horizontal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigateTo('/estimates/new')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-900 font-medium">
                  Create Estimate
                </span>
              </button>
              <button
                onClick={() => navigateTo('/documents/upload')}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <FileText className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-gray-900 font-medium">
                  Upload Document
                </span>
              </button>
            </div>
          </div>

          {/* Settlement Management - Horizontal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Settlement Management
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <button
                onClick={() => navigateTo('/data-management')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Database className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  Data Management
                </span>
              </button>
              <button
                onClick={() => navigateTo('/cases')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Briefcase className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  Case Management
                </span>
              </button>
              <button
                onClick={() => navigateTo('/vendor-management')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Building className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  Vendor Management
                </span>
              </button>
              <button
                onClick={() => navigateTo('/contact-management')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Contact className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  Contact Management
                </span>
              </button>
              <button
                onClick={() => navigateTo('/website-management')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Globe className="h-5 w-5 text-cyan-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  Website Management
                </span>
              </button>
              <button
                onClick={() => navigateTo('/report-management')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <BarChart3 className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  Report Management
                </span>
              </button>
              <button
                onClick={() => navigateTo('/award-management')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Award className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  Award Management
                </span>
              </button>
              <button
                onClick={() => navigateTo('/notice-management')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Mail className="h-5 w-5 text-pink-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  Notice Management
                </span>
              </button>
              <button
                onClick={() => navigateTo('/task-management')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <CheckSquare className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  Task Management
                </span>
              </button>
              <button
                onClick={() => navigateTo('/UserManagement')}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <UserCheck className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-gray-900 font-medium text-sm">
                  User Management
                </span>
              </button>
            </div>
          </div>

          {/* Calendar - Full Width */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {userProfile?.first_name
                  ? `${userProfile.first_name}'s Calendar`
                  : 'Calendar'}
              </h3>
              <div className="flex items-center space-x-4">
                {/* Add Event Button */}
                <button
                  onClick={() => setShowAddEventModal(true)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </button>
                {/* Event Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={eventFilter}
                    onChange={(e) =>
                      setEventFilter(
                        e.target.value as
                          | 'all'
                          | 'deadline'
                          | 'task'
                          | 'meeting'
                      )
                    }
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Events</option>
                    <option value="deadline">Deadlines Only</option>
                    <option value="task">Tasks Only</option>
                    <option value="meeting">Meetings Only</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-gray-200">
                  <button
                    onClick={() => setCalendarView('month')}
                    className={`px-3 py-1 text-sm font-medium rounded-l-lg ${
                      calendarView === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setCalendarView('week')}
                    className={`px-3 py-1 text-sm font-medium ${
                      calendarView === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setCalendarView('day')}
                    className={`px-3 py-1 text-sm font-medium rounded-r-lg ${
                      calendarView === 'day'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Day
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (calendarView === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                  } else if (calendarView === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                  } else {
                    newDate.setDate(newDate.getDate() - 1);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <h4 className="text-xl font-semibold">
                {calendarView === 'month' &&
                  currentDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                {calendarView === 'week' &&
                  `Week of ${currentDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}`}
                {calendarView === 'day' &&
                  currentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
              </h4>

              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (calendarView === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                  } else if (calendarView === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                  } else {
                    newDate.setDate(newDate.getDate() + 1);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Status */}
            {eventFilter !== 'all' && (
              <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-800 text-sm font-medium">
                    Showing only {eventFilter}s
                  </span>
                </div>
                <button
                  onClick={() => setEventFilter('all')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear Filter
                </button>
              </div>
            )}

            {/* Calendar Content */}
            <div className="min-h-[600px]">
              {calendarView === 'month' && renderMonthView()}
              {calendarView === 'week' && renderWeekView()}
              {calendarView === 'day' && renderDayView()}
            </div>

            {/* Calendar Legend */}
            <div className="mt-6 flex items-center justify-center space-x-8 text-sm border-t pt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                <span className="text-gray-600 font-medium">Deadlines</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2"></div>
                <span className="text-gray-600 font-medium">Tasks</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                <span className="text-gray-600 font-medium">Meetings</span>
              </div>
            </div>
          </div>

          {/* Add Event Modal */}
          {showAddEventModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add New Event
                  </h3>
                  <button
                    onClick={() => setShowAddEventModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter event title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, date: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, time: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          type: e.target.value as
                            | 'deadline'
                            | 'task'
                            | 'meeting',
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="task">Task</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional description"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddEventModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEvent}
                    disabled={!newEvent.title || !newEvent.date}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Event
                  </button>
                </div>
              </div>
            </div>
          )}

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
