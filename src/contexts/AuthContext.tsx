// contexts/AuthContext.tsx - Enhanced with Password Management
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  needsPasswordReset,
  isAccountLocked,
  getMinutesUntilUnlock,
  type UserProfile,
} from 'src/lib/userManagement';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  needsPasswordReset: boolean;
  isAccountLocked: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    user: User | null;
    error: unknown;
    needsPasswordReset?: boolean;
    lockoutMinutes?: number;
    remainingAttempts?: number;
  }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkPasswordExpiry: () => boolean;
  updateLastActivity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPasswordResetState, setNeedsPasswordResetState] = useState(false);
  const [isAccountLockedState, setIsAccountLockedState] = useState(false);

  // Debug function to log state changes
  const debugLog = (message: string, data?: unknown) => {
    const timestamp = new Date().toISOString();
    console.log(`[AuthContext ${timestamp}] ${message}`, data || '');
  };

  const fetchUserProfile = useCallback(
    async (userId: string, userEmail?: string) => {
      debugLog('fetchUserProfile called', { userId, userEmail });

      try {
        // First try to find user by email (more reliable)
        let { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', userEmail)
          .single();

        debugLog('Profile query by email result', {
          data: !!data,
          error: error?.message,
        });

        // If not found by email, try by user_id
        if (error && userId) {
          debugLog('Trying profile query by user_id', userId);
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();

          debugLog('Profile query by user_id result', {
            data: !!userData,
            error: userError?.message,
          });

          if (!userError) {
            data = userData;
            error = null;
          }
        }

        if (error) {
          debugLog('Profile fetch failed', error);
          return null;
        }

        debugLog('Profile fetch successful', {
          role: data.role,
          active: data.active,
          mustResetPassword: data.must_reset_password,
        });

        // Check if account is locked
        const locked = isAccountLocked(data.locked_until);
        setIsAccountLockedState(locked);

        // Check if password reset is needed
        const passwordResetNeeded = needsPasswordReset(
          data.password_last_changed,
          data.must_reset_password
        );
        setNeedsPasswordResetState(passwordResetNeeded);

        return data;
      } catch (err) {
        debugLog('Profile fetch exception', err);
        return null;
      }
    },
    []
  );

  const refreshProfile = async () => {
    if (user) {
      debugLog('refreshProfile called');
      const profile = await fetchUserProfile(user.id, user.email);
      setUserProfile(profile);
    }
  };

  const checkPasswordExpiry = useCallback(() => {
    if (!userProfile) return false;
    return needsPasswordReset(
      userProfile.password_last_changed,
      userProfile.must_reset_password
    );
  }, [userProfile]);

  const updateLastActivity = useCallback(async () => {
    if (userProfile && user) {
      try {
        // Update last activity in user_sessions table if exists
        await supabase
          .from('user_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('auth_user_id', user.id)
          .eq('is_active', true);
      } catch (error) {
        debugLog('Failed to update last activity', error);
      }
    }
  }, [userProfile, user]);

  const signIn = async (email: string, password: string) => {
    debugLog('signIn called', { email });

    try {
      // Check if user exists and is not locked before attempting login
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(
          'user_id, active, locked_until, failed_login_attempts, must_reset_password, password_last_changed'
        )
        .eq('email', email.toLowerCase())
        .single();

      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 is "not found" - other errors are more serious
        throw userError;
      }

      if (userData) {
        // Check if account is locked
        if (isAccountLocked(userData.locked_until)) {
          const minutesRemaining = getMinutesUntilUnlock(userData.locked_until);
          return {
            user: null,
            error: `Account is locked due to failed login attempts. Try again in ${minutesRemaining} minutes.`,
            lockoutMinutes: minutesRemaining,
          };
        }

        // Check if account is active
        if (!userData.active) {
          return {
            user: null,
            error:
              'Your account has been deactivated. Please contact an administrator.',
          };
        }
      }

      // Attempt to sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        debugLog('signIn failed', error);

        // If user exists, handle failed login attempt
        if (userData) {
          try {
            const { data: failedLoginResult } = await supabase.rpc(
              'handle_failed_login',
              {
                p_user_id: userData.user_id,
              }
            );

            if (failedLoginResult?.locked) {
              return {
                user: null,
                error: `Too many failed login attempts. Account locked for ${failedLoginResult.lockout_minutes} minutes.`,
                lockoutMinutes: failedLoginResult.lockout_minutes,
              };
            } else if (failedLoginResult?.remaining_attempts !== undefined) {
              return {
                user: null,
                error: `Invalid credentials. ${failedLoginResult.remaining_attempts} attempts remaining before account lock.`,
                remainingAttempts: failedLoginResult.remaining_attempts,
              };
            }
          } catch (failedLoginError) {
            debugLog('Failed to handle failed login', failedLoginError);
          }
        }

        return { user: null, error: error.message };
      }

      debugLog('signIn successful', { userId: data.user?.id });

      // Reset failed login attempts on successful login
      if (userData) {
        try {
          await supabase.rpc('reset_failed_login_attempts', {
            p_user_id: userData.user_id,
          });

          // Create session record
          await supabase.rpc('create_user_session', {
            p_user_id: userData.user_id,
            p_auth_user_id: data.user.id,
            p_expires_at: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        } catch (sessionError) {
          debugLog('Failed to create session record', sessionError);
        }

        // Check if password reset is needed
        const passwordResetNeeded = needsPasswordReset(
          userData.password_last_changed,
          userData.must_reset_password
        );

        return {
          user: data.user,
          error: null,
          needsPasswordReset: passwordResetNeeded,
        };
      }

      return { user: data.user, error: null };
    } catch (err) {
      debugLog('signIn exception', err);
      return { user: null, error: err };
    }
  };

  const signOut = useCallback(async () => {
    debugLog('signOut called');

    try {
      // Log the logout activity
      if (userProfile) {
        await supabase.rpc('log_user_activity', {
          p_user_id: userProfile.user_id,
          p_action_type: 'logout',
          p_description: 'User logged out',
        });

        // End session
        await supabase.rpc('end_user_session', {
          p_auth_user_id: user?.id,
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        debugLog('signOut failed', error);
      } else {
        debugLog('signOut successful');
        setUser(null);
        setSession(null);
        setUserProfile(null);
        setNeedsPasswordResetState(false);
        setIsAccountLockedState(false);
      }
    } catch (err) {
      debugLog('signOut exception', err);
    }
  }, [userProfile, user]);

  // Set up idle timeout monitoring
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;
    let warningShown = false;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      warningShown = false;

      if (userProfile?.idle_timeout_minutes && user) {
        const idleTimeoutMs = userProfile.idle_timeout_minutes * 60 * 1000;
        const warningTimeMs = idleTimeoutMs - 2 * 60 * 1000; // 2 minutes before timeout

        // Set warning timer
        warningTimer = setTimeout(() => {
          if (!warningShown) {
            warningShown = true;
            const remainingTime = Math.ceil(
              (idleTimeoutMs - warningTimeMs) / 1000 / 60
            );

            if (
              confirm(
                `Your session will expire in ${remainingTime} minutes due to inactivity. Do you want to stay logged in?`
              )
            ) {
              resetIdleTimer(); // Reset if user wants to stay
              updateLastActivity();
            }
          }
        }, warningTimeMs);

        // Set logout timer
        idleTimer = setTimeout(() => {
          alert('You have been logged out due to inactivity.');
          signOut();
          window.location.href = '/login?reason=idle';
        }, idleTimeoutMs);
      }
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const resetTimer = () => {
      resetIdleTimer();
      updateLastActivity();
    };

    if (userProfile && user) {
      events.forEach((event) => {
        document.addEventListener(event, resetTimer, true);
      });
      resetIdleTimer();
    }

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [userProfile, user, signOut, updateLastActivity]);

  useEffect(() => {
    let mounted = true;
    let initializationTimer: NodeJS.Timeout;

    const initialize = async () => {
      debugLog('Starting initialization');

      try {
        // Set a fallback timer to ensure loading doesn't get stuck
        initializationTimer = setTimeout(() => {
          if (mounted) {
            debugLog('Initialization timeout - forcing completion');
            setLoading(false);
          }
        }, 10000); // 10 second fallback

        // Get initial session
        debugLog('Getting initial session');
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          debugLog('Error getting initial session', error);
        } else {
          debugLog('Initial session retrieved', {
            hasSession: !!initialSession,
            userId: initialSession?.user?.id,
            email: initialSession?.user?.email,
          });
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            debugLog('User authenticated, fetching profile');
            try {
              const profile = await fetchUserProfile(
                initialSession.user.id,
                initialSession.user.email
              );
              if (mounted) {
                setUserProfile(profile);
                debugLog('Profile set successfully', { hasProfile: !!profile });
              }
            } catch (profileError) {
              debugLog('Profile fetch failed during init', profileError);
            }
          } else {
            debugLog('No authenticated user found');
          }
        }
      } catch (err) {
        debugLog('Initialization error', err);
      } finally {
        if (mounted) {
          debugLog('Initialization complete - setting loading to false');
          clearTimeout(initializationTimer);
          setLoading(false);
        }
      }
    };

    initialize();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      debugLog('Auth state change', { event, hasSession: !!newSession });

      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user && event === 'SIGNED_IN') {
          debugLog('User signed in via state change, fetching profile');
          try {
            const profile = await fetchUserProfile(
              newSession.user.id,
              newSession.user.email
            );
            if (mounted) {
              setUserProfile(profile);
              debugLog('Profile updated after sign in', {
                hasProfile: !!profile,
              });
            }
          } catch (profileError) {
            debugLog('Profile fetch failed after sign in', profileError);
          }
        } else if (event === 'SIGNED_OUT') {
          debugLog('User signed out via state change');
          setUserProfile(null);
          setNeedsPasswordResetState(false);
          setIsAccountLockedState(false);
        }
      }
    });

    return () => {
      debugLog('Cleanup called');
      mounted = false;
      clearTimeout(initializationTimer);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Log state changes
  useEffect(() => {
    debugLog('State updated', {
      loading,
      hasUser: !!user,
      hasSession: !!session,
      hasProfile: !!userProfile,
      userEmail: user?.email,
      profileRole: userProfile?.role,
      needsPasswordReset: needsPasswordResetState,
      isAccountLocked: isAccountLockedState,
    });
  }, [
    loading,
    user,
    session,
    userProfile,
    needsPasswordResetState,
    isAccountLockedState,
  ]);

  const value = {
    user,
    session,
    userProfile,
    loading,
    needsPasswordReset: needsPasswordResetState,
    isAccountLocked: isAccountLockedState,
    signIn,
    signOut,
    refreshProfile,
    checkPasswordExpiry,
    updateLastActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
