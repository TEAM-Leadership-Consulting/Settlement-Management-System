// contexts/AuthContext.tsx - Debug Version
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

interface UserProfile {
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
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: unknown }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
        });
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

  const signIn = async (email: string, password: string) => {
    debugLog('signIn called', { email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        debugLog('signIn failed', error);
        return { user: null, error };
      }

      debugLog('signIn successful', { userId: data.user?.id });

      // Update last login time in users table
      if (data.user) {
        try {
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('email', data.user.email);
        } catch (updateError) {
          debugLog('Failed to update last_login', updateError);
        }
      }

      return { user: data.user, error: null };
    } catch (err) {
      debugLog('signIn exception', err);
      return { user: null, error: err };
    }
  };

  const signOut = async () => {
    debugLog('signOut called');

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        debugLog('signOut failed', error);
      } else {
        debugLog('signOut successful');
        setUser(null);
        setSession(null);
        setUserProfile(null);
      }
    } catch (err) {
      debugLog('signOut exception', err);
    }
  };

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

        // Test basic Supabase connection first
        debugLog('Testing Supabase connection');
        const { data: testData, error: testError } = await supabase
          .from('case_types')
          .select('count', { count: 'exact', head: true });

        debugLog('Supabase connection test', {
          success: !testError,
          error: testError?.message,
          count: testData,
        });

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
    });
  }, [loading, user, session, userProfile]);

  const value = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signOut,
    refreshProfile,
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
