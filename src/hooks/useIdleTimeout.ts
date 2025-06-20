// hooks/useIdleTimeout.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UseIdleTimeoutReturn {
  showWarning: boolean;
  timeRemaining: number;
  handleExtendSession: () => void;
  handleLogout: () => void;
}

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before timeout

export function useIdleTimeout(): UseIdleTimeoutReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(WARNING_TIME / 1000); // in seconds

  const router = useRouter();
  const { signOut } = useAuth();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = useCallback(async () => {
    console.log('Idle timeout - logging out user');

    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowWarning(false);

    try {
      await signOut();
      router.push('/login?reason=idle');
    } catch (error) {
      console.error('Error during idle logout:', error);
      // Force redirect even if signOut fails
      router.push('/login?reason=idle');
    }
  }, [signOut, router]);

  const startCountdown = useCallback(() => {
    setTimeRemaining(WARNING_TIME / 1000);
    setShowWarning(true);

    // Start countdown timer
    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set final logout timer
    timeoutRef.current = setTimeout(handleLogout, WARNING_TIME);
  }, [handleLogout]);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Hide warning if shown
    setShowWarning(false);

    // Update last activity
    lastActivityRef.current = Date.now();

    // Set new warning timer
    const timeToWarning = IDLE_TIMEOUT - WARNING_TIME;
    warningTimeoutRef.current = setTimeout(startCountdown, timeToWarning);
  }, [startCountdown]);

  const handleExtendSession = useCallback(() => {
    console.log('User extended session');
    resetTimer();
  }, [resetTimer]);

  // Activity event listeners
  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
    ];

    const handleActivity = () => {
      const now = Date.now();
      // Only reset if it's been more than 1 second since last activity (debounce)
      if (now - lastActivityRef.current > 1000) {
        resetTimer();
      }
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer]);

  return {
    showWarning,
    timeRemaining,
    handleExtendSession,
    handleLogout,
  };
}

// Utility function to format time remaining
export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `0:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
