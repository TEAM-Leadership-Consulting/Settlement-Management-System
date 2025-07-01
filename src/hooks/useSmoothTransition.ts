// src/hooks/useSmoothTransition.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { WorkflowStep } from '@/types/dataManagement';

interface TransitionConfig {
  from: WorkflowStep;
  to: WorkflowStep;
  trigger: 'auto' | 'manual';
  delay?: number; // For auto transitions
  showAnimation?: boolean;
}

interface TransitionState {
  isTransitioning: boolean;
  fromStep: WorkflowStep | null;
  toStep: WorkflowStep | null;
  showAnimation: boolean;
}

interface UseSmoothTransitionReturn {
  transitionState: TransitionState;
  startTransition: (config: TransitionConfig) => void;
  completeTransition: () => void;
  skipTransition: () => void;
  cancelTransition: () => void;
}

export function useSmoothTransition(
  onNavigate: (step: WorkflowStep) => void,
  clearMessages?: () => void
): UseSmoothTransitionReturn {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    fromStep: null,
    toStep: null,
    showAnimation: false,
  });

  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const startTransition = useCallback(
    (config: TransitionConfig) => {
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      setTransitionState({
        isTransitioning: true,
        fromStep: config.from,
        toStep: config.to,
        showAnimation: config.showAnimation ?? true,
      });

      // For auto transitions with delay
      if (config.trigger === 'auto' && config.delay) {
        transitionTimeoutRef.current = setTimeout(() => {
          // Complete transition directly here to avoid circular dependency
          const toStep = config.to;
          if (toStep) {
            clearMessages?.();
            onNavigate(toStep);
          }

          setTransitionState({
            isTransitioning: false,
            fromStep: null,
            toStep: null,
            showAnimation: false,
          });
        }, config.delay);
      }
    },
    [onNavigate, clearMessages]
  );

  const completeTransition = useCallback(() => {
    const { toStep } = transitionState;

    if (toStep) {
      // Clear messages before navigation
      clearMessages?.();

      // Navigate to the target step
      onNavigate(toStep);
    }

    // Reset transition state
    setTransitionState({
      isTransitioning: false,
      fromStep: null,
      toStep: null,
      showAnimation: false,
    });

    // Clear timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, [transitionState, onNavigate, clearMessages]);

  const skipTransition = useCallback(() => {
    // Immediately complete the transition without animation
    completeTransition();
  }, [completeTransition]);

  const cancelTransition = useCallback(() => {
    // Cancel the transition without navigating
    setTransitionState({
      isTransitioning: false,
      fromStep: null,
      toStep: null,
      showAnimation: false,
    });

    // Clear timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  return {
    transitionState,
    startTransition,
    completeTransition,
    skipTransition,
    cancelTransition,
  };
}
