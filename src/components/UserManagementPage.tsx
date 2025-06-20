'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  UserPlus,
  Shield,
  Clock,
  UserX,
  CheckCircle,
  ArrowLeft,
  Search,
  AlertCircle,
  Key,
  Calendar,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface User {
  user_id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  department: string | null;
  active: boolean;
  last_login: string | null;
  created_date: string;
  created_by: number | null;
  password_last_changed: string | null;
  must_reset_password: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  idle_timeout_minutes: number;
  page_permissions: string[];
  phone: string | null;
  notes: string | null;
}

interface NewUserForm {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  phone: string;
  idleTimeout: number;
  pagePermissions: string[];
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const availablePages = [
  { id: 'dashboard', name: 'Dashboard', description: 'Main dashboard access' },
  {
    id: 'cases',
    name: 'Case Management',
    description: 'View and manage cases',
  },
  {
    id: 'parties',
    name: 'Party Management',
    description: 'Manage case parties',
  },
  {
    id: 'documents',
    name: 'Document Management',
    description: 'Upload and manage documents',
  },
  {
    id: 'payments',
    name: 'Payment Management',
    description: 'Handle payments and distributions',
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Generate reports and view analytics',
  },
  {
    id: 'communications',
    name: 'Communications',
    description: 'Send notifications and track communications',
  },
  {
    id: 'estimates',
    name: 'Estimates',
    description: 'Create and manage project estimates',
  },
  {
    id: 'user-management',
    name: 'User Management',
    description: 'Manage system users (Admin only)',
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    description: 'Configure system settings',
  },
];

const roles = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  {
    value: 'case_manager',
    label: 'Case Manager',
    description: 'Manage cases and parties',
  },
  {
    value: 'attorney',
    label: 'Attorney',
    description: 'Legal review and case oversight',
  },
  {
    value: 'clerk',
    label: 'Clerk',
    description: 'Data entry and basic operations',
  },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

const UserManagementPage = () => {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    department: '',
    phone: '',
    idleTimeout: 15,
    pagePermissions: ['dashboard'],
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${user.first_name} ${user.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter((user) => user.active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((user) => !user.active);
    } else if (filterStatus === 'locked') {
      filtered = filtered.filter(
        (user) => user.locked_until && new Date(user.locked_until) > new Date()
      );
    } else if (filterStatus === 'password-reset') {
      filtered = filtered.filter((user) => user.must_reset_password);
    }

    // Show inactive users toggle
    if (!showInactiveUsers) {
      filtered = filtered.filter((user) => user.active);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterStatus, showInactiveUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!newUserForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!newUserForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!newUserForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!newUserForm.role) {
      errors.role = 'Role is required';
    }

    if (newUserForm.idleTimeout < 5 || newUserForm.idleTimeout > 120) {
      errors.idleTimeout = 'Idle timeout must be between 5 and 120 minutes';
    }

    if (newUserForm.pagePermissions.length === 0) {
      errors.pagePermissions = 'At least one page permission is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateTemporaryPassword = (): string => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleInputChange = (
    field: keyof NewUserForm,
    value: string | number | string[]
  ) => {
    setNewUserForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePagePermissionChange = (pageId: string, checked: boolean) => {
    setNewUserForm((prev) => ({
      ...prev,
      pagePermissions: checked
        ? [...prev.pagePermissions, pageId]
        : prev.pagePermissions.filter((p) => p !== pageId),
    }));
  };

  const handleAddUser = async () => {
    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', newUserForm.email.toLowerCase())
        .single();

      if (existingUser) {
        setFormErrors({ email: 'A user with this email already exists' });
        setError('User already exists');
        return;
      }

      // Generate temporary password
      const tempPassword = generateTemporaryPassword();

      // Create user in Supabase Auth
      const { error: authError } = await supabase.auth.admin.createUser({
        email: newUserForm.email.toLowerCase(),
        password: tempPassword,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create user record in users table
      const userData = {
        username: newUserForm.email.toLowerCase(),
        email: newUserForm.email.toLowerCase(),
        first_name: newUserForm.firstName,
        last_name: newUserForm.lastName,
        role: newUserForm.role,
        department: newUserForm.department || null,
        phone: newUserForm.phone || null,
        active: true,
        must_reset_password: true,
        password_last_changed: new Date().toISOString(),
        failed_login_attempts: 0,
        idle_timeout_minutes: newUserForm.idleTimeout,
        page_permissions: newUserForm.pagePermissions,
        notes: newUserForm.notes || null,
        created_by: userProfile?.user_id,
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert([userData]);

      if (insertError) throw insertError;

      // Send welcome email with temporary password (in real implementation)
      console.log(
        'Temporary password for',
        newUserForm.email,
        ':',
        tempPassword
      );

      alert(
        `User created successfully! Temporary password: ${tempPassword}\n\nPlease share this password securely with the user. They will be required to change it on first login.`
      );

      // Reset form and refresh users
      setNewUserForm({
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        department: '',
        phone: '',
        idleTimeout: 15,
        pagePermissions: ['dashboard'],
        notes: '',
      });
      setShowAddUser(false);
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    if (
      !confirm(
        'Are you sure you want to deactivate this user? They will no longer be able to access the system.'
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ active: false })
        .eq('user_id', userId);

      if (error) throw error;

      fetchUsers();
    } catch (err) {
      console.error('Error deactivating user:', err);
      setError('Failed to deactivate user');
    }
  };

  const handleReactivateUser = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: true })
        .eq('user_id', userId);

      if (error) throw error;

      fetchUsers();
    } catch (err) {
      console.error('Error reactivating user:', err);
      setError('Failed to reactivate user');
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (
      !confirm('Are you sure you want to force a password reset for this user?')
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ must_reset_password: true })
        .eq('user_id', userId);

      if (error) throw error;

      // In a real implementation, you would send a password reset email
      alert(
        'Password reset has been forced. The user will be required to reset their password on next login.'
      );

      fetchUsers();
    } catch (err) {
      console.error('Error forcing password reset:', err);
      setError('Failed to force password reset');
    }
  };

  const handleUnlockUser = async (userId: number) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          locked_until: null,
          failed_login_attempts: 0,
        })
        .eq('user_id', userId);

      if (error) throw error;

      fetchUsers();
    } catch (err) {
      console.error('Error unlocking user:', err);
      setError('Failed to unlock user');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPasswordExpired = (passwordDate: string | null) => {
    if (!passwordDate) return true;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(passwordDate) < sixMonthsAgo;
  };

  const isUserLocked = (lockedUntil: string | null) => {
    if (!lockedUntil) return false;
    return new Date(lockedUntil) > new Date();
  };

  const getUserStatusBadge = (user: User) => {
    if (!user.active) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Inactive
        </span>
      );
    }
    if (isUserLocked(user.locked_until)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          Locked
        </span>
      );
    }
    if (
      user.must_reset_password ||
      isPasswordExpired(user.password_last_changed)
    ) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Password Reset Required
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute requireRole={['admin']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireRole={['admin']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage system users, roles, and permissions
                </p>
              </div>

              <Button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add New User
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Search by email, name, or department..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="roleFilter">Filter by Role</Label>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="statusFilter">Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="locked">Locked</SelectItem>
                      <SelectItem value="password-reset">
                        Password Reset Required
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showInactive"
                      checked={showInactiveUsers}
                      onCheckedChange={(checked) =>
                        setShowInactiveUsers(!!checked)
                      }
                    />
                    <Label htmlFor="showInactive" className="text-sm">
                      Show inactive users
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">User</th>
                      <th className="text-left py-3 px-4 font-medium">Role</th>
                      <th className="text-left py-3 px-4 font-medium">
                        Department
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Last Login
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Created
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.user_id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="capitalize font-medium">
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4">{user.department || '—'}</td>
                        <td className="py-4 px-4">
                          {getUserStatusBadge(user)}
                          {isPasswordExpired(user.password_last_changed) && (
                            <div className="flex items-center mt-1 text-xs text-orange-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              Password expired
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(user.last_login)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(user.created_date)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {isUserLocked(user.locked_until) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnlockUser(user.user_id)}
                                title="Unlock user"
                              >
                                <Key className="h-3 w-3" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetPassword(user.user_id)}
                              title="Force password reset"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>

                            {user.active ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeactivateUser(user.user_id)
                                }
                                className="text-red-600 hover:text-red-700"
                                title="Deactivate user"
                              >
                                <UserX className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleReactivateUser(user.user_id)
                                }
                                className="text-green-600 hover:text-green-700"
                                title="Reactivate user"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No users found matching your criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add User Modal */}
          {showAddUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Add New User
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddUser(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Basic Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUserForm.email}
                            onChange={(e) =>
                              handleInputChange('email', e.target.value)
                            }
                            placeholder="user@company.com"
                            className={formErrors.email ? 'border-red-500' : ''}
                          />
                          {formErrors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={newUserForm.phone}
                            onChange={(e) =>
                              handleInputChange('phone', e.target.value)
                            }
                            placeholder="(555) 123-4567"
                          />
                        </div>

                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={newUserForm.firstName}
                            onChange={(e) =>
                              handleInputChange('firstName', e.target.value)
                            }
                            className={
                              formErrors.firstName ? 'border-red-500' : ''
                            }
                          />
                          {formErrors.firstName && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={newUserForm.lastName}
                            onChange={(e) =>
                              handleInputChange('lastName', e.target.value)
                            }
                            className={
                              formErrors.lastName ? 'border-red-500' : ''
                            }
                          />
                          {formErrors.lastName && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Role and Department */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Role and Access
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="role">Role *</Label>
                          <Select
                            value={newUserForm.role}
                            onValueChange={(value) =>
                              handleInputChange('role', value)
                            }
                          >
                            <SelectTrigger
                              className={
                                formErrors.role ? 'border-red-500' : ''
                              }
                            >
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  <div>
                                    <div className="font-medium">
                                      {role.label}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {role.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.role && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.role}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={newUserForm.department}
                            onChange={(e) =>
                              handleInputChange('department', e.target.value)
                            }
                            placeholder="Legal, Operations, IT, etc."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Security Settings
                      </h3>
                      <div>
                        <Label htmlFor="idleTimeout">
                          Idle Timeout (minutes) *
                        </Label>
                        <Input
                          id="idleTimeout"
                          type="number"
                          min="5"
                          max="120"
                          value={newUserForm.idleTimeout}
                          onChange={(e) =>
                            handleInputChange(
                              'idleTimeout',
                              parseInt(e.target.value) || 15
                            )
                          }
                          className={
                            formErrors.idleTimeout ? 'border-red-500' : ''
                          }
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          User will be automatically logged out after this many
                          minutes of inactivity (5-120 minutes)
                        </p>
                        {formErrors.idleTimeout && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.idleTimeout}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Page Permissions */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        Page Permissions *
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {availablePages.map((page) => (
                          <div
                            key={page.id}
                            className="flex items-start space-x-3"
                          >
                            <Checkbox
                              id={page.id}
                              checked={newUserForm.pagePermissions.includes(
                                page.id
                              )}
                              onCheckedChange={(checked) =>
                                handlePagePermissionChange(page.id, !!checked)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={page.id} className="font-medium">
                                {page.name}
                              </Label>
                              <p className="text-sm text-gray-500">
                                {page.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {formErrors.pagePermissions && (
                        <p className="text-red-500 text-sm mt-2">
                          {formErrors.pagePermissions}
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newUserForm.notes}
                        onChange={(e) =>
                          handleInputChange('notes', e.target.value)
                        }
                        placeholder="Additional notes about this user..."
                        rows={3}
                      />
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">
                            Security Notice
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>
                              • A temporary password will be generated for the
                              user
                            </li>
                            <li>
                              • The user must change their password on first
                              login
                            </li>
                            <li>
                              • Passwords must be reset every 6 months for
                              security
                            </li>
                            <li>
                              • Failed login attempts will lock the account
                              temporarily
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddUser(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddUser}
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </div>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create User
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Security Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Password Policy</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Minimum 8 characters required
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Must contain uppercase, lowercase, numbers, and symbols
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Password history: Cannot reuse last 5 passwords
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-orange-500 mr-2" />
                      Password expires every 6 months
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Account Security
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Account locked after 5 failed login attempts
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Auto-unlock after 30 minutes
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-500 mr-2" />
                      Default idle timeout: 15 minutes
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-500 mr-2" />
                      Two-minute warning before auto-logout
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      User Statistics
                    </h4>
                    <p className="text-sm text-gray-600">
                      Current user account status overview
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {users.filter((u) => u.active).length}
                      </div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {users.filter((u) => !u.active).length}
                      </div>
                      <div className="text-sm text-gray-600">Inactive</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {
                          users.filter((u) => isUserLocked(u.locked_until))
                            .length
                        }
                      </div>
                      <div className="text-sm text-gray-600">Locked</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {
                          users.filter(
                            (u) =>
                              u.must_reset_password ||
                              isPasswordExpired(u.password_last_changed)
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        Password Reset
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users
                  .filter((u) => u.last_login)
                  .sort(
                    (a, b) =>
                      new Date(b.last_login!).getTime() -
                      new Date(a.last_login!).getTime()
                  )
                  .slice(0, 5)
                  .map((user) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {user.first_name?.charAt(0)}
                            {user.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Last login: {formatDate(user.last_login)}
                      </div>
                    </div>
                  ))}

                {users.filter((u) => u.last_login).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No recent login activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserManagementPage;
