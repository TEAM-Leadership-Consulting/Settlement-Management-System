// src/components/DataManagement/shared/WorkflowProgress.tsx
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Circle,
  FileText,
  Upload,
  Database,
  MapPin,
  Shield,
  Eye,
  Rocket,
  RefreshCw,
} from 'lucide-react';
import type {
  WorkflowStep,
  WorkflowProgressProps,
} from '@/types/dataManagement';

interface WorkflowStepConfig {
  id: WorkflowStep;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  estimatedTime?: string;
}

const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  {
    id: 'upload',
    title: 'Upload',
    description: 'Upload your data file',
    icon: Upload,
    estimatedTime: '1 min',
  },
  {
    id: 'staging',
    title: 'Staging',
    description: 'Analyze data structure',
    icon: Database,
    estimatedTime: '2-3 min',
  },
  {
    id: 'mapping',
    title: 'Mapping',
    description: 'Map fields to database',
    icon: MapPin,
    estimatedTime: '5-10 min',
  },
  {
    id: 'validation',
    title: 'Validation',
    description: 'Validate data quality',
    icon: Shield,
    estimatedTime: '2-5 min',
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Final review & confirmation',
    icon: Eye,
    estimatedTime: '2 min',
  },
  {
    id: 'deploy',
    title: 'Deploy',
    description: 'Deploy to production',
    icon: Rocket,
    estimatedTime: '3-5 min',
  },
];

type StepStatus = 'completed' | 'current' | 'upcoming' | 'blocked';

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentStep,
  currentFile,
  onStepClick,
  mappingStats,
  validationStats,
  isProcessing = false,
  allowNavigation = false,
  showDetailed = true,
}) => {
  // Get step status based on current progress
  const getStepStatus = (stepId: WorkflowStep): StepStatus => {
    if (!currentFile) {
      return stepId === 'upload' ? 'current' : 'upcoming';
    }

    const stepIndex = WORKFLOW_STEPS.findIndex((step) => step.id === stepId);
    const currentStepIndex = WORKFLOW_STEPS.findIndex(
      (step) => step.id === currentStep
    );

    if (stepIndex < currentStepIndex) {
      return 'completed';
    } else if (stepIndex === currentStepIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  // Calculate overall progress percentage
  const getOverallProgress = (): number => {
    const currentStepIndex = WORKFLOW_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    let progress = (currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 100;

    // Add partial progress based on current step
    if (currentStep === 'mapping' && mappingStats) {
      progress +=
        (mappingStats.percentage / 100) * (100 / WORKFLOW_STEPS.length);
    }

    return Math.min(Math.round(progress), 100);
  };

  // Get step icon with status styling
  const getStepIcon = (step: WorkflowStepConfig, status: StepStatus) => {
    const IconComponent = step.icon;

    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (status === 'current') {
      return isProcessing ? (
        <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      ) : (
        <IconComponent className="h-5 w-5 text-blue-600" />
      );
    } else {
      return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get step styling classes
  const getStepStyling = (status: StepStatus): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'current':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'blocked':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  // Handle step click
  const handleStepClick = (step: WorkflowStep) => {
    if (allowNavigation && onStepClick) {
      const status = getStepStatus(step);
      if (status === 'completed' || status === 'current') {
        onStepClick(step);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleTimeString();
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {currentFile
                ? `Processing: ${currentFile.original_filename}`
                : 'Data Import Workflow'}
            </CardTitle>
            <CardDescription>
              {currentFile
                ? `${getOverallProgress()}% complete • ${
                    currentFile.total_rows?.toLocaleString() || 'Unknown'
                  } rows`
                : 'Follow the steps below to import your data'}
            </CardDescription>
          </div>
          {currentFile && (
            <div className="flex flex-col items-end space-y-1">
              <Badge variant="outline" className="text-sm">
                Status: {currentFile.upload_status}
              </Badge>
              {currentFile.file_size && (
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(currentFile.file_size)}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Overall Progress Bar */}
        {currentFile && (
          <div className="mb-6">
            <Progress value={getOverallProgress()} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Started {formatDate(currentFile.uploaded_at)}</span>
              <span>{getOverallProgress()}% Complete</span>
            </div>
          </div>
        )}

        {/* Step Navigation */}
        <div className="space-y-4">
          {/* Desktop View - Horizontal Steps */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              {WORKFLOW_STEPS.map((step, index) => {
                const status = getStepStatus(step.id);
                const isClickable =
                  allowNavigation &&
                  (status === 'completed' || status === 'current');

                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`flex flex-col items-center space-y-2 ${
                        isClickable ? 'cursor-pointer hover:opacity-80' : ''
                      }`}
                      onClick={() => handleStepClick(step.id)}
                      role={isClickable ? 'button' : undefined}
                      tabIndex={isClickable ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (
                          isClickable &&
                          (e.key === 'Enter' || e.key === ' ')
                        ) {
                          e.preventDefault();
                          handleStepClick(step.id);
                        }
                      }}
                    >
                      {/* Step Icon */}
                      <div
                        className={`
                        flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors
                        ${getStepStyling(status)}
                      `}
                      >
                        {getStepIcon(step, status)}
                      </div>

                      {/* Step Info */}
                      <div className="text-center">
                        <div
                          className={`font-medium text-sm ${
                            status === 'current'
                              ? 'text-blue-600'
                              : status === 'completed'
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                        {step.estimatedTime && status === 'upcoming' && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ~{step.estimatedTime}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connector Line */}
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-4 ${
                          status === 'completed'
                            ? 'bg-green-300'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Mobile View - Vertical Steps */}
          <div className="md:hidden space-y-3">
            {WORKFLOW_STEPS.map((step) => {
              const status = getStepStatus(step.id);
              const isClickable =
                allowNavigation &&
                (status === 'completed' || status === 'current');

              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${getStepStyling(
                    status
                  )} ${isClickable ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => handleStepClick(step.id)}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleStepClick(step.id);
                    }
                  }}
                >
                  {/* Step Icon */}
                  <div className="shrink-0">{getStepIcon(step, status)}</div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium text-sm ${
                        status === 'current'
                          ? 'text-blue-600'
                          : status === 'completed'
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                      {step.estimatedTime && status === 'upcoming' && (
                        <span className="ml-2">• ~{step.estimatedTime}</span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="shrink-0">
                    {status === 'current' && isProcessing && (
                      <Badge variant="secondary" className="text-xs">
                        Processing...
                      </Badge>
                    )}
                    {status === 'completed' && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Details */}
        {showDetailed && currentFile && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {/* Current Step Info */}
              <div>
                <h4 className="font-medium text-blue-600 mb-2">Current Step</h4>
                <div className="space-y-1">
                  <div>
                    <span className="text-muted-foreground">Step:</span>{' '}
                    {WORKFLOW_STEPS.find((s) => s.id === currentStep)?.title ||
                      'Unknown'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    {isProcessing ? 'Processing...' : 'Ready'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">File Type:</span>{' '}
                    {currentFile.file_type || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Mapping Progress */}
              {mappingStats && (
                <div>
                  <h4 className="font-medium text-green-600 mb-2">
                    Field Mapping
                  </h4>
                  <div className="space-y-1">
                    <div>
                      <span className="text-muted-foreground">Mapped:</span>{' '}
                      {mappingStats.mapped} / {mappingStats.total}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress:</span>{' '}
                      {mappingStats.percentage}%
                    </div>
                    <div>
                      <span className="text-muted-foreground">Remaining:</span>{' '}
                      {mappingStats.unmapped}
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Results */}
              {validationStats && (
                <div>
                  <h4 className="font-medium text-orange-600 mb-2">
                    Validation
                  </h4>
                  <div className="space-y-1">
                    <div>
                      <span className="text-muted-foreground">Valid:</span>{' '}
                      {validationStats.valid || 0} /{' '}
                      {validationStats.total || 0}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Errors:</span>{' '}
                      {validationStats.errors}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warnings:</span>{' '}
                      {validationStats.warnings}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
