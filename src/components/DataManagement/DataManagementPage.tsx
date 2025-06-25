// src/components/DataManagement/DataManagementPage.tsx
'use client';

import React, { useMemo, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { WorkflowProgress } from '@/components/DataManagement/shared/WorkflowProgress';
import { UploadStep } from '@/components/DataManagement/steps/UploadStep';
import { StagingStep } from '@/components/DataManagement/steps/StagingStep';
import { MappingStep } from '@/components/DataManagement/steps/MappingStep';
import { ValidationStep } from '@/components/DataManagement/steps/ValidationStep';
import { ReviewStep } from '@/components/DataManagement/steps/ReviewStep';
import { DeployStep } from '@/components/DataManagement/steps/DeployStep';
import { useDataManagement } from '@/hooks/useDataManagement';
import type {
  WorkflowStep,
  UploadedFile,
  MappingStats,
  ValidationStats,
} from '@/types/dataManagement';

interface DataManagementPageProps {
  className?: string;
}

// Type for WorkflowProgress component that expects specific properties
interface WorkflowProgressFile {
  original_filename: string;
  upload_status: string;
  total_rows?: number; // Changed from number | null to number | undefined
  uploaded_at: string;
}

// Extended type for components that need additional properties
interface ComponentUploadedFile {
  upload_id: number;
  file_id: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  upload_status: string;
  total_rows: number; // Required as number for DeployStep
  uploaded_at: string;
  processed_at?: string;
  error_message?: string;
  mapping_config?: string;
  uploaded_by?: number;
  // Additional properties that components might expect
  id?: string;
  file_path?: string;
  updated_at?: string;
  case_id?: string;
  user_id?: string;
}

// Type for ReviewStep currentFile prop (based on the component interface)
interface ReviewStepFile {
  original_filename: string;
  upload_status: string;
  total_rows: number; // Required for ReviewStep
  file_id: string;
  upload_id: number;
  uploaded_at: string;
}

export const DataManagementPage: React.FC<DataManagementPageProps> = ({
  className = '',
}) => {
  const dataManagement = useDataManagement();

  // Safely extract properties with fallbacks
  const {
    uploadedFiles = [],
    fileData = null,
    currentFile = null,
    fieldMappings = [],
    validationResults = [],
    currentStep = 'upload' as WorkflowStep,
    isUploading = false,
    isProcessing = false,
    isValidating = false,
    isDeploying = false,
    error = null,
    success = null,
    uploadProgress = 0,
    availableFields = [],
    handleFileUpload,
    handleProcessFile,
    handleUpdateMapping,
    handleValidation,
    handleDeployment,
    handleAddCustomField,
    handleStepNavigation,
    clearError,
    clearSuccess,
  } = dataManagement || {};

  // Convert currentFile to WorkflowProgress expected format
  const workflowCurrentFile = useMemo((): WorkflowProgressFile | null => {
    if (!currentFile) return null;

    return {
      original_filename: currentFile.original_filename,
      upload_status: currentFile.upload_status,
      total_rows: currentFile.total_rows ?? undefined, // Convert null to undefined
      uploaded_at: currentFile.uploaded_at,
    };
  }, [currentFile]);

  // Convert currentFile to ReviewStep expected format
  const reviewStepFile = useMemo((): ReviewStepFile | null => {
    if (!currentFile) return null;

    return {
      original_filename: currentFile.original_filename,
      upload_status: currentFile.upload_status,
      total_rows: currentFile.total_rows ?? 0, // Convert null to 0 for required number
      file_id: currentFile.file_id,
      upload_id: currentFile.upload_id,
      uploaded_at: currentFile.uploaded_at,
    };
  }, [currentFile]);

  // Convert currentFile to ComponentUploadedFile for DeployStep
  const componentUploadedFile = useMemo((): ComponentUploadedFile | null => {
    if (!currentFile) return null;

    return {
      upload_id: currentFile.upload_id,
      file_id: currentFile.file_id,
      original_filename: currentFile.original_filename,
      file_size: currentFile.file_size,
      file_type: currentFile.file_type,
      upload_status: currentFile.upload_status,
      total_rows: currentFile.total_rows ?? 0, // Convert null to 0 for required number
      uploaded_at: currentFile.uploaded_at,
      processed_at: currentFile.processed_at,
      error_message: currentFile.error_message,
      mapping_config: currentFile.mapping_config,
      uploaded_by: currentFile.uploaded_by,
      id: currentFile.file_id,
      file_path: undefined,
      updated_at: undefined,
      case_id: undefined,
      user_id: currentFile.uploaded_by?.toString(),
    };
  }, [currentFile]);

  // Calculate mapping statistics for WorkflowProgress
  const mappingStats = useMemo((): MappingStats | undefined => {
    if (!fieldMappings?.length) return undefined;

    const mapped = fieldMappings.filter((m) =>
      Boolean(m.targetTable && m.targetField)
    ).length;
    const total = fieldMappings.length;

    return {
      mapped,
      unmapped: total - mapped,
      total,
      percentage: total > 0 ? Math.round((mapped / total) * 100) : 0,
    };
  }, [fieldMappings]);

  // Calculate validation stats with proper ValidationStats interface
  const validationStats = useMemo((): ValidationStats | undefined => {
    if (!validationResults?.length) return undefined;

    const errors = validationResults.reduce(
      (sum, result) => sum + (result.errors?.length || 0),
      0
    );
    const warnings = validationResults.reduce(
      (sum, result) => sum + (result.warnings?.length || 0),
      0
    );
    const validated = validationResults.filter(
      (result) => (result.errors?.length || 0) === 0
    ).length;

    return {
      errors,
      warnings,
      validated,
    };
  }, [validationResults]);

  // Handler functions that match component expectations
  const handleFileUploadWrapper = useCallback(
    async (file: File): Promise<void> => {
      if (!handleFileUpload) return;
      try {
        await handleFileUpload(file);
      } catch (error: unknown) {
        console.error('Error uploading file:', error);
      }
    },
    [handleFileUpload]
  );

  const handleProcessFileWrapper = useCallback(
    async (file: UploadedFile): Promise<void> => {
      if (!handleProcessFile) return;
      try {
        await handleProcessFile(file);
      } catch (error: unknown) {
        console.error('Error processing file:', error);
      }
    },
    [handleProcessFile]
  );

  const handleValidateWrapper = useCallback(async (): Promise<boolean> => {
    if (!handleValidation) return false;
    try {
      return await handleValidation();
    } catch (error: unknown) {
      console.error('Validation failed:', error);
      return false;
    }
  }, [handleValidation]);

  const handleDeployWrapper = useCallback(async (): Promise<boolean> => {
    if (!handleDeployment) return false;
    try {
      return await handleDeployment();
    } catch (error: unknown) {
      console.error('Deployment failed:', error);
      return false;
    }
  }, [handleDeployment]);

  const handleNext = useCallback(() => {
    const stepOrder: WorkflowStep[] = [
      'upload',
      'staging',
      'mapping',
      'validation',
      'review',
      'deploy',
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      handleStepNavigation?.(stepOrder[currentIndex + 1]);
    }
  }, [currentStep, handleStepNavigation]);

  const handleBack = useCallback(() => {
    const stepOrder: WorkflowStep[] = [
      'upload',
      'staging',
      'mapping',
      'validation',
      'review',
      'deploy',
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      handleStepNavigation?.(stepOrder[currentIndex - 1]);
    }
  }, [currentStep, handleStepNavigation]);

  // Render workflow progress
  const renderWorkflowProgress = () => (
    <WorkflowProgress
      currentStep={currentStep}
      currentFile={workflowCurrentFile}
      mappingStats={mappingStats}
      validationStats={validationStats}
      isProcessing={isProcessing || isUploading || isValidating || isDeploying}
      onStepClick={handleStepNavigation}
      allowNavigation={true}
      showDetailed={true}
    />
  );

  // Render error/success alerts
  const renderAlerts = () => (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <button
              onClick={clearError}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {success}
            <button
              onClick={clearSuccess}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <UploadStep
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUploadWrapper}
            onProcessFile={handleProcessFileWrapper}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        );

      case 'staging':
        if (!fileData) {
          return (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No file data available. Please upload and process a file first.
              </AlertDescription>
            </Alert>
          );
        }
        return (
          <StagingStep
            fileData={fileData}
            isProcessing={isProcessing}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 'mapping':
        if (!fileData) {
          return (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No file data available. Please complete the staging step first.
              </AlertDescription>
            </Alert>
          );
        }
        return (
          <MappingStep
            fileData={fileData}
            fieldMappings={fieldMappings}
            availableFields={availableFields}
            onUpdateMapping={handleUpdateMapping}
            onAddCustomField={handleAddCustomField}
            onNext={handleNext}
            onBack={handleBack}
            isProcessing={isProcessing}
          />
        );

      case 'validation':
        return (
          <ValidationStep
            fieldMappings={fieldMappings}
            validationResults={validationResults}
            onValidate={handleValidateWrapper}
            onNext={handleNext}
            onBack={handleBack}
            isValidating={isValidating}
          />
        );

      case 'review':
        if (!reviewStepFile) {
          return (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No file selected for review.</AlertDescription>
            </Alert>
          );
        }

        return (
          <ReviewStep
            fileData={fileData}
            fieldMappings={fieldMappings}
            validationResults={validationResults}
            currentFile={reviewStepFile}
            onDeploy={handleDeployWrapper}
            onBack={handleBack}
            isDeploying={isDeploying}
          />
        );

      case 'deploy':
        if (!componentUploadedFile) {
          return (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No file selected for deployment.
              </AlertDescription>
            </Alert>
          );
        }

        return (
          <DeployStep
            currentFile={componentUploadedFile}
            onStartNewImport={() => handleStepNavigation?.('upload')}
            onViewData={() => {}}
            onDownloadReport={() => {}}
            onBack={handleBack}
            isDeploying={isDeploying}
            deploymentProgress={uploadProgress}
          />
        );

      default:
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unknown workflow step: {currentStep}
            </AlertDescription>
          </Alert>
        );
    }
  };

  if (!dataManagement) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to initialize data management. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`max-w-7xl mx-auto p-6 space-y-6 ${className || ''}`}>
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
          <p className="mt-2 text-gray-600">
            Import, validate, and deploy data to your settlement management
            system
          </p>
        </div>

        {/* Workflow Progress */}
        {renderWorkflowProgress()}

        {/* Alerts */}
        {renderAlerts()}

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">{renderStepContent()}</div>
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 p-4 bg-gray-50 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700">
              Debug Information
            </summary>
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <div>
                <strong>Current Step:</strong> {currentStep}
              </div>
              <div>
                <strong>Files Uploaded:</strong> {uploadedFiles.length}
              </div>
              <div>
                <strong>Current File:</strong>{' '}
                {currentFile?.original_filename || 'None'}
              </div>
              <div>
                <strong>Field Mappings:</strong> {fieldMappings.length}
              </div>
              <div>
                <strong>Validation Results:</strong> {validationResults.length}
              </div>
              <div>
                <strong>Available Fields:</strong> {availableFields.length}
              </div>
              <div>
                <strong>Is Processing:</strong> {isProcessing.toString()}
              </div>
              <div>
                <strong>Is Validating:</strong> {isValidating.toString()}
              </div>
              <div>
                <strong>Is Deploying:</strong> {isDeploying.toString()}
              </div>
            </div>
          </details>
        )}
      </div>
    </ProtectedRoute>
  );
};
