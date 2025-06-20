// lib/userManagement.ts
import { supabase } from '@/lib/supabase';

export interface UserProfile {
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
  // New properties for password management
  password_last_changed: string | null;
  must_reset_password: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  idle_timeout_minutes: number;
}

export interface CreateUserData {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  department?: string;
  active?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  department?: string;
  active?: boolean;
}

export interface SecuritySettings {
  require_password_change: boolean;
  two_factor_enabled: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  password_expiry_days: number;
}

// User CRUD operations
export async function getAllUsers(): Promise<{
  data: UserProfile[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_date', { ascending: false });

    return { data, error };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function getUserById(
  userId: number
): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function getUserByEmail(
  email: string
): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    return { data, error };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function createUser(
  userData: CreateUserData
): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          ...userData,
          active: userData.active ?? true,
          created_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return { data, error };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function updateUser(
  userId: number,
  userData: UpdateUserData
): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function deleteUser(
  userId: number
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId);

    return { error };
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function activateUser(
  userId: number
): Promise<{ data: UserProfile | null; error: Error | null }> {
  return updateUser(userId, { active: true });
}

export async function deactivateUser(
  userId: number
): Promise<{ data: UserProfile | null; error: Error | null }> {
  return updateUser(userId, { active: false });
}

// Security settings (mock implementation - you can expand this)
export async function getSecuritySettings(): Promise<{
  data: SecuritySettings | null;
  error: Error | null;
}> {
  try {
    // This could come from a settings table or config
    const defaultSettings: SecuritySettings = {
      require_password_change: false,
      two_factor_enabled: false,
      session_timeout_minutes: 15,
      max_login_attempts: 5,
      password_expiry_days: 90,
    };

    return { data: defaultSettings, error: null };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function updateSecuritySettings(
  settings: Partial<SecuritySettings>
): Promise<{ data: SecuritySettings | null; error: Error | null }> {
  try {
    // This would typically save to a settings table
    // For now, we'll just return the updated settings
    const currentSettings = await getSecuritySettings();
    if (currentSettings.error) {
      return currentSettings;
    }

    const updatedSettings = {
      ...currentSettings.data!,
      ...settings,
    };

    return { data: updatedSettings, error: null };
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

// Role management
export const USER_ROLES = {
  ADMIN: 'admin',
  CASE_MANAGER: 'case_manager',
  ATTORNEY: 'attorney',
  CLERK: 'clerk',
  VIEWER: 'viewer',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    admin: 'Administrator',
    case_manager: 'Case Manager',
    attorney: 'Attorney',
    clerk: 'Clerk',
    viewer: 'Viewer',
  };

  return roleMap[role] || role;
}

export function canUserPerformAction(
  userRole: string,
  action: string
): boolean {
  const permissions: Record<string, string[]> = {
    admin: [
      'create',
      'read',
      'update',
      'delete',
      'manage_users',
      'system_settings',
    ],
    case_manager: ['create', 'read', 'update', 'delete'],
    attorney: ['create', 'read', 'update'],
    clerk: ['create', 'read', 'update'],
    viewer: ['read'],
  };

  return permissions[userRole]?.includes(action) || false;
}

// Password and security management functions
export function needsPasswordReset(
  passwordLastChanged: string | null,
  mustResetPassword: boolean = false
): boolean {
  // If explicitly marked for password reset
  if (mustResetPassword) {
    return true;
  }
  // If password has never been changed
  if (!passwordLastChanged) {
    return true;
  }

  // Check if password is older than 90 days (configurable)
  const passwordAge = Date.now() - new Date(passwordLastChanged).getTime();
  const maxPasswordAge = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

  return passwordAge > maxPasswordAge;
}

export function isAccountLocked(lockedUntil: string | null): boolean {
  if (!lockedUntil) {
    return false;
  }

  const lockExpiry = new Date(lockedUntil);
  return lockExpiry > new Date();
}

export function getMinutesUntilUnlock(lockedUntil: string | null): number {
  if (!lockedUntil) {
    return 0;
  }

  const lockExpiry = new Date(lockedUntil);
  const now = new Date();

  if (lockExpiry <= now) {
    return 0;
  }

  const diffMs = lockExpiry.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60)); // Convert to minutes
}

// Password validation
export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
}

export function validatePasswordStrength(
  password: string
): PasswordStrengthResult {
  const feedback: string[] = [];
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  // Check requirements and add feedback
  if (!requirements.minLength) {
    feedback.push('Password must be at least 8 characters long');
  }
  if (!requirements.hasUppercase) {
    feedback.push('Password must contain at least one uppercase letter');
  }
  if (!requirements.hasLowercase) {
    feedback.push('Password must contain at least one lowercase letter');
  }
  if (!requirements.hasNumbers) {
    feedback.push('Password must contain at least one number');
  }
  if (!requirements.hasSpecialChars) {
    feedback.push('Password must contain at least one special character');
  }

  // Calculate score
  let score = 0;
  if (requirements.minLength) score++;
  if (requirements.hasUppercase) score++;
  if (requirements.hasLowercase) score++;
  if (requirements.hasNumbers) score++;
  if (requirements.hasSpecialChars) score++;

  // Additional scoring for length
  if (password.length >= 12) score = Math.min(score + 1, 4);
  if (password.length >= 16) score = Math.min(score + 1, 4);

  const isValid = Object.values(requirements).every((req) => req);

  // Add positive feedback for strong passwords
  if (isValid) {
    if (score >= 4) {
      feedback.push('Very strong password!');
    } else if (score >= 3) {
      feedback.push('Strong password');
    } else {
      feedback.push('Good password');
    }
  }

  return {
    isValid,
    score,
    feedback,
    requirements,
  };
}
