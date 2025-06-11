'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Simple icon components to avoid import issues
const ArrowLeftIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.368M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
    />
  </svg>
);

const UserCheckIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const UserXIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AlertCircleIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

interface User {
  user_id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  department: string | null;
  active: boolean | null;
  last_login: string | null;
  created_date: string | null;
  created_by: string | null;
}

interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  active: boolean;
  password: string;
  confirmPassword: string;
}

const UserManagement = () => {
  const { userProfile } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    department: '',
    active: true,
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roles = [
    {
      value: 'admin',
      label: 'Administrator',
      color: 'bg-red-100 text-red-800',
    },
    {
      value: 'case_manager',
      label: 'Case Manager',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'attorney',
      label: 'Attorney',
      color: 'bg-purple-100 text-purple-800',
    },
    { value: 'clerk', label: 'Clerk', color: 'bg-green-100 text-green-800' },
    { value: 'viewer', label: 'Viewer', color: 'bg-gray-100 text-gray-800' },
  ];

  const departments = [
    'Administration',
    'Legal',
    'Case Management',
    'IT',
    'Finance',
    'Operations',
    'Human Resources',
    'Other',
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roleObj = roles.find((r) => r.value === role);
    return roleObj?.label || role;
  };

  const getRoleColor = (role: string) => {
    const roleObj = roles.find((r) => r.value === role);
    return roleObj?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredUsers = users.filter((user) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const department = user.department || '';
    const active = user.active ?? true;

    const matchesSearch =
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesDepartment =
      departmentFilter === 'all' || department === departmentFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && active) ||
      (statusFilter === 'inactive' && !active);

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const validateForm = (isEdit = false) => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!isEdit) {
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof UserFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: '',
      department: '',
      active: true,
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleAddUser = () => {
    resetForm();
    setShowAddUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      department: user.department || '',
      active: user.active ?? true,
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
    setShowEditUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteAlert(true);
  };

  const submitAddUser = async () => {
    if (!validateForm(false)) return;

    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
        });

      if (authError) throw authError;

      const { error: dbError } = await supabase.from('users').insert([
        {
          user_id: authData.user.id,
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          department: formData.department,
          active: formData.active,
          created_by: userProfile?.user_id,
        },
      ]);

      if (dbError) throw dbError;

      await fetchUsers();
      setShowAddUserModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitEditUser = async () => {
    if (!validateForm(true) || !selectedUser) return;

    setIsSubmitting(true);
    try {
      const { error: dbError } = await supabase
        .from('users')
        .update({
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          department: formData.department,
          active: formData.active,
        })
        .eq('user_id', selectedUser.user_id);

      if (dbError) throw dbError;

      if (formData.password) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          selectedUser.user_id,
          { password: formData.password }
        );
        if (authError) console.warn('Password update failed:', authError);
      }

      await fetchUsers();
      setShowEditUserModal(false);
      resetForm();
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userToDelete.user_id);

      if (error) throw error;

      await fetchUsers();
      setShowDeleteAlert(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const currentStatus = user.active ?? true;
      const { error } = await supabase
        .from('users')
        .update({ active: !currentStatus })
        .eq('user_id', user.user_id);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user management...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeftIcon />
              <span className="ml-2">Back</span>
            </button>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage system users, roles, and permissions
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Refresh
                </button>
                <button
                  onClick={handleAddUser}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon />
                  <span className="ml-2">Add User</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircleIcon />
                <p className="text-red-700 ml-3">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-blue-100">
                      <UsersIcon />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-green-100">
                      <UserCheckIcon />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.filter((u) => u.active ?? true).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <UserXIcon />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Inactive Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.filter((u) => !(u.active ?? true)).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-purple-100">
                      <UsersIcon />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Administrators
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {users.filter((u) => u.role === 'admin').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Search Users
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search by name, email, username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="role-filter"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Filter by Role
                  </label>
                  <select
                    id="role-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="department-filter"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Filter by Department
                  </label>
                  <select
                    id="department-filter"
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status-filter"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Filter by Status
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Users ({filteredUsers.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {(user.first_name || '?').charAt(0)}
                                  {(user.last_name || '?').charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name || ''} {user.last_name || ''}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.department || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.active ?? true ? (
                              <>
                                <CheckCircleIcon />
                                <span className="text-green-700 text-sm ml-2">
                                  Active
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircleIcon />
                                <span className="text-red-700 text-sm ml-2">
                                  Inactive
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon />
                            <span className="ml-1">
                              {formatDateTime(user.last_login)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon />
                            <span className="ml-1">
                              {formatDate(user.created_date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit user"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user)}
                              className={
                                user.active ?? true
                                  ? 'text-orange-600 hover:text-orange-900'
                                  : 'text-green-600 hover:text-green-900'
                              }
                              title={
                                user.active ?? true
                                  ? 'Deactivate user'
                                  : 'Activate user'
                              }
                            >
                              {user.active ?? true ? (
                                <UserXIcon />
                              ) : (
                                <UserCheckIcon />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete user"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <UsersIcon />
                    <p className="text-gray-500 mt-4">
                      No users found matching your criteria
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showAddUserModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add New User
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Create a new user account with specified role and permissions.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="add-first-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="add-first-name"
                        value={formData.first_name}
                        onChange={(e) =>
                          handleInputChange('first_name', e.target.value)
                        }
                        className={`mt-1 block w-full border ${
                          formErrors.first_name
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3`}
                      />
                      {formErrors.first_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.first_name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="add-last-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="add-last-name"
                        value={formData.last_name}
                        onChange={(e) =>
                          handleInputChange('last_name', e.target.value)
                        }
                        className={`mt-1 block w-full border ${
                          formErrors.last_name
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3`}
                      />
                      {formErrors.last_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.last_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="add-username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Username *
                    </label>
                    <input
                      type="text"
                      id="add-username"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange('username', e.target.value)
                      }
                      className={`mt-1 block w-full border ${
                        formErrors.username
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3`}
                    />
                    {formErrors.username && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="add-email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="add-email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      className={`mt-1 block w-full border ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3`}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="add-role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Role *
                      </label>
                      <select
                        id="add-role"
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange('role', e.target.value)
                        }
                        className={`mt-1 block w-full border ${
                          formErrors.role ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3`}
                      >
                        <option value="">Select role</option>
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.role && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.role}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="add-department"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Department *
                      </label>
                      <select
                        id="add-department"
                        value={formData.department}
                        onChange={(e) =>
                          handleInputChange('department', e.target.value)
                        }
                        className={`mt-1 block w-full border ${
                          formErrors.department
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3`}
                      >
                        <option value="">Select department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      {formErrors.department && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.department}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="add-password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="add-password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange('password', e.target.value)
                        }
                        className={`block w-full border ${
                          formErrors.password
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="add-confirm-password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirm Password *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="add-confirm-password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange('confirmPassword', e.target.value)
                        }
                        className={`block w-full border ${
                          formErrors.confirmPassword
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="add-active"
                      checked={formData.active}
                      onChange={(e) =>
                        handleInputChange('active', e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="add-active"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Account is active
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUserModal(false);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitAddUser}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditUserModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit User
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Update user information and permissions.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="edit-first-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="edit-first-name"
                        value={formData.first_name}
                        onChange={(e) =>
                          handleInputChange('first_name', e.target.value)
                        }
                        className={`mt-1 block w-full border ${
                          formErrors.first_name
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3`}
                      />
                      {formErrors.first_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.first_name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="edit-last-name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="edit-last-name"
                        value={formData.last_name}
                        onChange={(e) =>
                          handleInputChange('last_name', e.target.value)
                        }
                        className={`mt-1 block w-full border ${
                          formErrors.last_name
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3`}
                      />
                      {formErrors.last_name && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.last_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-username"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Username *
                    </label>
                    <input
                      type="text"
                      id="edit-username"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange('username', e.target.value)
                      }
                      className={`mt-1 block w-full border ${
                        formErrors.username
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3`}
                    />
                    {formErrors.username && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="edit-email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      className={`mt-1 block w-full border ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3`}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="edit-role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Role *
                      </label>
                      <select
                        id="edit-role"
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange('role', e.target.value)
                        }
                        className={`mt-1 block w-full border ${
                          formErrors.role ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3`}
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.role && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.role}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="edit-department"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Department *
                      </label>
                      <select
                        id="edit-department"
                        value={formData.department}
                        onChange={(e) =>
                          handleInputChange('department', e.target.value)
                        }
                        className={`mt-1 block w-full border ${
                          formErrors.department
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3`}
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      {formErrors.department && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.department}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New Password (leave blank to keep current)
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="edit-password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange('password', e.target.value)
                        }
                        placeholder="Enter new password"
                        className={`block w-full border ${
                          formErrors.password
                            ? 'border-red-500'
                            : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 pr-10`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  {formData.password && (
                    <div>
                      <label
                        htmlFor="edit-confirm-password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="edit-confirm-password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange('confirmPassword', e.target.value)
                          }
                          placeholder="Confirm new password"
                          className={`block w-full border ${
                            formErrors.confirmPassword
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } rounded-md shadow-sm py-2 px-3 pr-10`}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-active"
                      checked={formData.active}
                      onChange={(e) =>
                        handleInputChange('active', e.target.checked)
                      }
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="edit-active"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Account is active
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false);
                      resetForm();
                      setSelectedUser(null);
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitEditUser}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteAlert && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertCircleIcon />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">
                  Are you sure?
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    This will permanently delete the user account for{' '}
                    <strong>
                      {userToDelete?.first_name} {userToDelete?.last_name}
                    </strong>
                    . This action cannot be undone.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteAlert(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default UserManagement;
