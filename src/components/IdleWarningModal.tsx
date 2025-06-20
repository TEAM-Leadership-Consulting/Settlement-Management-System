// components/IdleWarningModal.tsx
'use client';

import React from 'react';
import { useIdleTimeout, formatTimeRemaining } from '@/hooks/useIdleTimeout';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';

export function IdleWarningModal() {
  const { showWarning, timeRemaining, handleExtendSession, handleLogout } =
    useIdleTimeout();

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Session Expiring Soon
            </h3>
            <p className="text-sm text-gray-600">
              You will be automatically logged out in:
            </p>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {formatTimeRemaining(timeRemaining)}
          </div>
          <div className="flex items-center justify-center text-sm text-gray-600">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Your session will expire due to inactivity
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleExtendSession}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Stay Logged In
          </Button>

          <Button onClick={handleLogout} variant="outline" className="w-full">
            Log Out Now
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Security Notice:</strong> For your protection, you&apos;ll
            be automatically logged out after 15 minutes of inactivity. Move
            your mouse or press any key to reset the timer.
          </p>
        </div>
      </div>
    </div>
  );
}
