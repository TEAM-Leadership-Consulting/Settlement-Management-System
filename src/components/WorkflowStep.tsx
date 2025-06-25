// src/components/DataManagement/shared/WorkflowStep.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';

export interface WorkflowStepProps {
  // Step identification
  stepNumber: number;
  stepTitle: string;
  stepDescription: string;
  totalSteps: number;

  // Navigation
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;

  // Step state
  isCompleted?: boolean;
  isProcessing?: boolean;
  canProceed?: boolean;
  completionMessage?: string;

  // Progress tracking
  progressPercentage?: number;
  progressLabel?: string;

  // Validation and alerts
  validationErrors?: string[];
  warnings?: string[];
  infoMessages?: string[];

  // Content
  children: React.ReactNode;

  // Customization
  hideNavigation?: boolean;
  hideProgress?: boolean;
  customActions?: React.ReactNode;
  icon?: React.ReactNode;
}

export const WorkflowStep: React.FC<WorkflowStepProps> = ({
  stepNumber,
  stepTitle,
  stepDescription,
  totalSteps,
  onNext,
  onBack,
  nextLabel = 'Next',
  backLabel = 'Back',
  isCompleted = false,
  isProcessing = false,
  canProceed = true,
  completionMessage,
  progressPercentage,
  progressLabel,
  validationErrors = [],
  warnings = [],
  infoMessages = [],
  children,
  hideNavigation = false,
  hideProgress = false,
  customActions,
  icon,
}) => {
  // Calculate overall workflow progress
  const workflowProgress = ((stepNumber - 1) / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon && <div className="text-primary">{icon}</div>}
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{stepTitle}</span>
                  {isCompleted && (
                    <Badge variant="default" className="ml-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                  {isProcessing && (
                    <Badge variant="secondary" className="ml-2">
                      <Clock className="h-3 w-3 mr-1" />
                      Processing
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {stepDescription}
                </p>
              </div>
            </div>

            {/* Step Counter */}
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {stepNumber}
              </div>
              <div className="text-xs text-muted-foreground">
                of {totalSteps}
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Progress Bars */}
        {!hideProgress && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Workflow Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">
                    Overall Progress
                  </span>
                  <span className="font-medium">
                    {Math.round(workflowProgress)}%
                  </span>
                </div>
                <Progress value={workflowProgress} className="h-2" />
              </div>

              {/* Step-specific Progress */}
              {progressPercentage !== undefined && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      {progressLabel || 'Step Progress'}
                    </span>
                    <span className="font-medium">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Validation Messages */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Please address these issues:</div>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  • {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="font-medium mb-2 text-yellow-800">Warnings:</div>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700">
                  • {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {infoMessages.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <ul className="space-y-1">
              {infoMessages.map((message, index) => (
                <li key={index} className="text-sm">
                  • {message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Completion Message */}
      {isCompleted && completionMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">{completionMessage}</div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div>{children}</div>

      {/* Navigation */}
      {!hideNavigation && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              {/* Back Button */}
              <div>
                {onBack ? (
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {backLabel}
                  </Button>
                ) : (
                  <div /> // Spacer
                )}
              </div>

              {/* Custom Actions */}
              {customActions && (
                <div className="flex items-center space-x-2">
                  {customActions}
                </div>
              )}

              {/* Next Button */}
              <div className="flex items-center space-x-2">
                {onNext && (
                  <Button
                    onClick={onNext}
                    disabled={!canProceed || isProcessing}
                    className="flex items-center"
                  >
                    {nextLabel}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Step Status Bar */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalSteps }, (_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-2 rounded-full ${
                        index + 1 < stepNumber
                          ? 'bg-green-500' // Completed
                          : index + 1 === stepNumber
                          ? 'bg-blue-500' // Current
                          : 'bg-gray-200' // Future
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
