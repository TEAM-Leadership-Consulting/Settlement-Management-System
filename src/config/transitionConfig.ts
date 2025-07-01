// src/config/transitionConfig.ts

import type { WorkflowStep } from '@/types/dataManagement';

export interface TransitionRule {
  from: WorkflowStep;
  to: WorkflowStep;
  trigger: 'auto' | 'manual' | 'conditional';
  conditions?: {
    fileStatus?: string[];
    hasData?: boolean;
    userAction?: string;
  };
  animation: {
    enabled: boolean;
    type: 'smooth' | 'instant' | 'fade';
    duration?: number; // in ms
    showProgress?: boolean;
    showFileInfo?: boolean;
  };
  delay?: number; // Auto-transition delay in ms
  skippable?: boolean;
  messages?: {
    starting?: string;
    processing?: string;
    completing?: string;
  };
}

// Define all transition rules for the data management workflow
export const TRANSITION_RULES: Record<string, TransitionRule> = {
  // Upload to Staging - The main transition we're optimizing
  'upload-to-staging': {
    from: 'upload',
    to: 'staging',
    trigger: 'conditional',
    conditions: {
      fileStatus: ['staged'],
      hasData: true,
    },
    animation: {
      enabled: true,
      type: 'smooth',
      duration: 4000, // 4 seconds total animation
      showProgress: true,
      showFileInfo: true,
    },
    delay: 500, // Small delay before starting animation
    skippable: true,
    messages: {
      starting: 'Processing uploaded file...',
      processing: 'Analyzing data structure...',
      completing: 'Preparing staging interface...',
    },
  },

  // Staging to Mapping - Quick transition
  'staging-to-mapping': {
    from: 'staging',
    to: 'mapping',
    trigger: 'manual',
    animation: {
      enabled: true,
      type: 'fade',
      duration: 500,
      showProgress: false,
      showFileInfo: false,
    },
    skippable: true,
  },

  // Mapping to Validation - Show progress
  'mapping-to-validation': {
    from: 'mapping',
    to: 'validation',
    trigger: 'conditional',
    conditions: {
      userAction: 'mappings_complete',
    },
    animation: {
      enabled: true,
      type: 'smooth',
      duration: 2000,
      showProgress: true,
      showFileInfo: false,
    },
    skippable: true,
    messages: {
      starting: 'Validating field mappings...',
      processing: 'Preparing validation rules...',
      completing: 'Loading validation interface...',
    },
  },

  // Validation to Review - Quick transition
  'validation-to-review': {
    from: 'validation',
    to: 'review',
    trigger: 'conditional',
    conditions: {
      userAction: 'validation_complete',
    },
    animation: {
      enabled: true,
      type: 'fade',
      duration: 800,
      showProgress: false,
      showFileInfo: false,
    },
    skippable: true,
  },

  // Review to Deploy - Important transition with confirmation
  'review-to-deploy': {
    from: 'review',
    to: 'deploy',
    trigger: 'manual',
    animation: {
      enabled: true,
      type: 'smooth',
      duration: 3000,
      showProgress: true,
      showFileInfo: true,
    },
    skippable: false, // Don't allow skipping deployment
    messages: {
      starting: 'Initiating deployment...',
      processing: 'Deploying data to production...',
      completing: 'Finalizing deployment...',
    },
  },

  // Back navigation transitions - Quick and simple
  'staging-to-upload': {
    from: 'staging',
    to: 'upload',
    trigger: 'manual',
    animation: {
      enabled: false,
      type: 'instant',
    },
  },

  'mapping-to-staging': {
    from: 'mapping',
    to: 'staging',
    trigger: 'manual',
    animation: {
      enabled: false,
      type: 'instant',
    },
  },

  'validation-to-mapping': {
    from: 'validation',
    to: 'mapping',
    trigger: 'manual',
    animation: {
      enabled: false,
      type: 'instant',
    },
  },

  'review-to-validation': {
    from: 'review',
    to: 'validation',
    trigger: 'manual',
    animation: {
      enabled: false,
      type: 'instant',
    },
  },

  // Reset to upload - New import
  'any-to-upload': {
    from: 'deploy', // Can be triggered from any step
    to: 'upload',
    trigger: 'manual',
    animation: {
      enabled: true,
      type: 'fade',
      duration: 500,
    },
    skippable: true,
    messages: {
      starting: 'Starting new import...',
    },
  },
};

// Helper function to get transition rule
export function getTransitionRule(
  from: WorkflowStep,
  to: WorkflowStep
): TransitionRule | null {
  const ruleKey = `${from}-to-${to}`;
  return TRANSITION_RULES[ruleKey] || null;
}

// Helper function to check if transition should be animated
export function shouldAnimateTransition(
  from: WorkflowStep,
  to: WorkflowStep
): boolean {
  const rule = getTransitionRule(from, to);
  return rule?.animation.enabled ?? false;
}

// Helper function to get transition duration
export function getTransitionDuration(
  from: WorkflowStep,
  to: WorkflowStep
): number {
  const rule = getTransitionRule(from, to);
  return rule?.animation.duration ?? 0;
}

// Helper function to check if transition conditions are met
export function checkTransitionConditions(
  rule: TransitionRule,
  context: {
    fileStatus?: string;
    hasData?: boolean;
    userAction?: string;
  }
): boolean {
  if (!rule.conditions) return true;

  // Check file status condition
  if (rule.conditions.fileStatus && context.fileStatus) {
    if (!rule.conditions.fileStatus.includes(context.fileStatus)) {
      return false;
    }
  }

  // Check data condition
  if (rule.conditions.hasData !== undefined) {
    if (rule.conditions.hasData !== context.hasData) {
      return false;
    }
  }

  // Check user action condition
  if (rule.conditions.userAction && context.userAction) {
    if (rule.conditions.userAction !== context.userAction) {
      return false;
    }
  }

  return true;
}
