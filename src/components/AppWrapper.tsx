// components/AppWrapper.tsx
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IdleWarningModal } from '@/components/IdleWarningModal';

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { user } = useAuth();

  return (
    <>
      {children}
      {/* Only show idle warning for authenticated users */}
      {user && <IdleWarningModal />}
    </>
  );
}
