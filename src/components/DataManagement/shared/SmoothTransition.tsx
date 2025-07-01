'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  ArrowRight,
  FileCheck,
  BarChart3,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface TransitionState {
  phase:
    | 'upload-complete'
    | 'processing'
    | 'analyzing'
    | 'ready'
    | 'transitioning';
  progress: number;
  message: string;
  subMessage?: string;
}

interface SmoothTransitionProps {
  isVisible: boolean;
  onTransitionComplete: () => void;
  onSkip: () => void;
  fileName: string;
  fileSize: number;
  totalRows: number;
}

export default function SmoothTransition({
  isVisible,
  onTransitionComplete,
  onSkip,
  fileName,
  fileSize,
  totalRows,
}: SmoothTransitionProps) {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    phase: 'upload-complete',
    progress: 0,
    message: 'Upload Complete',
    subMessage: 'Preparing data for analysis...',
  });

  const [showSkipOption, setShowSkipOption] = useState(false);

  // Simulate the processing phases with realistic timing
  useEffect(() => {
    if (!isVisible) return;

    const phases: Array<{
      phase: TransitionState['phase'];
      message: string;
      subMessage: string;
      duration: number;
      targetProgress: number;
    }> = [
      {
        phase: 'upload-complete',
        message: 'Upload Complete',
        subMessage: 'File successfully uploaded and verified',
        duration: 800,
        targetProgress: 20,
      },
      {
        phase: 'processing',
        message: 'Processing Data',
        subMessage: 'Parsing file structure and content...',
        duration: 1200,
        targetProgress: 50,
      },
      {
        phase: 'analyzing',
        message: 'Analyzing Structure',
        subMessage: 'Detecting column types and data patterns...',
        duration: 1000,
        targetProgress: 80,
      },
      {
        phase: 'ready',
        message: 'Analysis Complete',
        subMessage: 'Ready to proceed to staging',
        duration: 600,
        targetProgress: 100,
      },
      {
        phase: 'transitioning',
        message: 'Transitioning to Staging',
        subMessage: 'Loading staging interface...',
        duration: 400,
        targetProgress: 100,
      },
    ];

    let currentPhaseIndex = 0;
    let animationFrame: number;

    const animateProgress = () => {
      const currentPhase = phases[currentPhaseIndex];
      if (!currentPhase) return;

      setTransitionState((prevState) => {
        const progressIncrement =
          (currentPhase.targetProgress - prevState.progress) * 0.1;
        const newProgress = Math.min(
          currentPhase.targetProgress,
          prevState.progress + progressIncrement
        );

        return {
          phase: currentPhase.phase,
          progress: newProgress,
          message: currentPhase.message,
          subMessage: currentPhase.subMessage,
        };
      });

      animationFrame = requestAnimationFrame(animateProgress);
    };

    const startPhase = (phaseIndex: number) => {
      if (phaseIndex >= phases.length) {
        // All phases complete, trigger transition
        setTimeout(() => {
          onTransitionComplete();
        }, 300);
        return;
      }

      currentPhaseIndex = phaseIndex;
      const phase = phases[phaseIndex];

      // Start progress animation
      animateProgress();

      // Move to next phase after duration
      setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        startPhase(phaseIndex + 1);
      }, phase.duration);
    };

    // Start the transition sequence
    startPhase(0);

    // Show skip option after 2 seconds
    const skipTimer = setTimeout(() => {
      setShowSkipOption(true);
    }, 2000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(skipTimer);
    };
  }, [isVisible, onTransitionComplete]);

  const getPhaseIcon = () => {
    switch (transitionState.phase) {
      case 'upload-complete':
        return <FileCheck className="h-8 w-8 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />;
      case 'analyzing':
        return <BarChart3 className="h-8 w-8 text-purple-600 animate-pulse" />;
      case 'ready':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'transitioning':
        return <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />;
      default:
        return <RefreshCw className="h-8 w-8 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-2xl border animate-in zoom-in-95 duration-300">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">{getPhaseIcon()}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {transitionState.message}
            </h3>
            <p className="text-sm text-gray-600">
              {transitionState.subMessage}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(transitionState.progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${transitionState.progress}%` }}
              />
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File:</span>
              <span className="text-sm font-medium text-gray-900 truncate ml-2 max-w-48">
                {fileName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Size:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatFileSize(fileSize)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rows:</span>
              <span className="text-sm font-medium text-gray-900">
                {totalRows.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="space-y-2 mb-6">
            {[
              {
                key: 'upload-complete',
                label: 'File Upload',
                completed: transitionState.progress >= 20,
              },
              {
                key: 'processing',
                label: 'Data Processing',
                completed: transitionState.progress >= 50,
              },
              {
                key: 'analyzing',
                label: 'Structure Analysis',
                completed: transitionState.progress >= 80,
              },
              {
                key: 'ready',
                label: 'Staging Ready',
                completed: transitionState.progress >= 100,
              },
            ].map((step) => (
              <div key={step.key} className="flex items-center space-x-3">
                <div
                  className={`
                  flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                  ${
                    step.completed
                      ? 'bg-green-100 border-2 border-green-500'
                      : transitionState.phase === step.key
                      ? 'bg-blue-100 border-2 border-blue-500 animate-pulse'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }
                `}
                >
                  {step.completed && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                  {transitionState.phase === step.key && !step.completed && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span
                  className={`
                  text-sm transition-colors duration-300
                  ${
                    step.completed
                      ? 'text-green-700 font-medium'
                      : transitionState.phase === step.key
                      ? 'text-blue-700 font-medium'
                      : 'text-gray-500'
                  }
                `}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            {showSkipOption ? (
              <button
                onClick={onSkip}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                Skip Animation
              </button>
            ) : (
              <div></div>
            )}

            {transitionState.phase === 'ready' && (
              <button
                onClick={onTransitionComplete}
                className="ml-auto flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <span>Continue to Staging</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Processing Animation */}
          {transitionState.phase === 'processing' && (
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
