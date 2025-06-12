// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);

      // First try to find user by auth ID
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      // If not found by user_id, try by email
      if (error && userEmail) {
        console.log('Trying to find user by email:', userEmail);
        const { data: emailData, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', userEmail)
          .single();

        if (!emailError) {
          data = emailData;
          error = null;
        }
      }

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log('User profile fetched successfully:', data);
      return data;
    } catch (err) {
      console.error('Exception fetching user profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id, user.email);
      setUserProfile(profile);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { user: null, error };
      }

      console.log('Sign in successful:', data.user?.email);

      // Update last login time in users table
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('email', data.user.email);
      }

      return { user: data.user, error: null };
    } catch (err) {
      console.error('Sign in exception:', err);
      return { user: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Sign out successful');
        setUser(null);
        setSession(null);
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Sign out exception:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        console.log('Initializing auth context...');

        // Get initial session
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session found:', !!initialSession);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            console.log('User authenticated, fetching profile...');
            const profile = await fetchUserProfile(
              initialSession.user.id,
              initialSession.user.email
            );
            if (mounted) {
              setUserProfile(profile);
            }
          } else {
            console.log('No authenticated user found');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          console.log('Auth initialization complete');
          setLoading(false);
        }
      }
    };

    initialize();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state change:', event, !!newSession);

      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user && event === 'SIGNED_IN') {
          console.log('User signed in, fetching profile...');
          const profile = await fetchUserProfile(
            newSession.user.id,
            newSession.user.email
          );
          if (mounted) {
            setUserProfile(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing profile...');
          setUserProfile(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove session from dependencies since we're not using it directly in the effect

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
