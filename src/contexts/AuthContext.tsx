'use client'

import React, { createContext, useContext } from 'react';

interface AuthContextProps {
  user: any;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: string | null;
  userProfile: any;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Simple hardcoded values - no state changes to cause reloads
  const value = {
    user: { id: 'test-user', email: 'admin@settlement.com' },
    session: { user: { id: 'test-user' } },
    loading: false,
    signIn: async () => ({ error: null }),
    signOut: async () => { window.location.href = '/'; },
    userRole: 'admin',
    userProfile: {
      user_id: 'test-user',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      email: 'admin@settlement.com'
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}