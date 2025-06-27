// src/app/data-management/page.tsx
'use client';

import React from 'react';
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
import type { WorkflowStep, UploadedFile } from '@/types/dataManagement';

export default function DataManagementPage() {
  const dataManagement = useDataManagement();

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
    handleAddCustomField,
    handleValidation,
    handleDeployment,
    handleStepNavigation,
    clearError,
    clearSuccess,
  } = dataManagement || {};

  // Auto-navigate to staging when file is processed
  React.useEffect(() => {
    if (
      currentFile?.upload_status === 'staged' &&
      currentStep === 'upload' &&
      fileData
    ) {
      setTimeout(() => {
        handleStepNavigation?.('staging');
      }, 1000);
    }
  }, [currentFile?.upload_status, currentStep, fileData, handleStepNavigation]);

  // Convert currentFile to WorkflowProgress format
  const workflowCurrentFile = React.useMemo(() => {
    if (!currentFile) return null;
    return {
      original_filename: currentFile.original_filename,
      upload_status: currentFile.upload_status,
      total_rows: currentFile.total_rows ?? undefined,
      uploaded_at: currentFile.uploaded_at,
      file_size: currentFile.file_size,
      file_type: currentFile.file_type,
    };
  }, [currentFile]);

  // Calculate mapping statistics
  const mappingStats = React.useMemo(() => {
    if (!fieldMappings?.length) return undefined;
    const mapped = fieldMappings.filter(
      (m) => m.targetTable && m.targetField
    ).length;
    const total = fieldMappings.length;
    return {
      mapped,
      unmapped: total - mapped,
      total,
      percentage: total > 0 ? Math.round((mapped / total) * 100) : 0,
    };
  }, [fieldMappings]);

  // Calculate validation stats
  const validationStats = React.useMemo(() => {
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
    return { errors, warnings, validated };
  }, [validationResults]);

  // Determine if user can proceed to a step
  const canProceedToStep = React.useCallback(
    (step: string) => {
      switch (step) {
        case 'upload':
          return true;
        case 'staging':
          return !!currentFile && currentFile.upload_status !== 'failed';
        case 'mapping':
          return !!fileData && currentFile?.upload_status === 'staged';
        case 'validation':
          return fieldMappings.some((m) => m.targetTable && m.targetField);
        case 'review':
          return (
            validationResults.length === 0 ||
            validationResults.every((r) => (r.errors?.length || 0) === 0)
          );
        case 'deploy':
          return (
            currentFile?.upload_status === 'validated' ||
            currentFile?.upload_status === 'ready'
          );
        default:
          return true;
      }
    },
    [currentFile, fileData, fieldMappings, validationResults]
  );

  // Handle step navigation wrapper
  const handleStepNavigationWrapper = React.useCallback(
    (step: string) => {
      const stepOrder = [
        'upload',
        'staging',
        'mapping',
        'validation',
        'review',
        'deploy',
      ];
      const currentIndex = stepOrder.indexOf(currentStep);
      const targetIndex = stepOrder.indexOf(step);

      if (
        targetIndex <= currentIndex ||
        (targetIndex === currentIndex + 1 && canProceedToStep(step))
      ) {
        handleStepNavigation?.(step as WorkflowStep);
      }
    },
    [currentStep, handleStepNavigation, canProceedToStep]
  );

  // Navigation helpers
  const handleNext = React.useCallback(() => {
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

  const handleBack = React.useCallback(() => {
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

  // File upload wrapper
  const handleFileUploadWrapper = React.useCallback(
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

  // Process file wrapper
  const handleProcessFileWrapper = React.useCallback(
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

  // Validation wrapper
  const handleValidateWrapper =
    React.useCallback(async (): Promise<boolean> => {
      if (!handleValidation) return false;
      try {
        return await handleValidation();
      } catch (error: unknown) {
        console.error('Validation failed:', error);
        return false;
      }
    }, [handleValidation]);

  // Deploy wrapper
  const handleDeployWrapper = React.useCallback(async (): Promise<boolean> => {
    if (!handleDeployment) return false;
    try {
      const success = await handleDeployment();
      if (success) {
        handleStepNavigation?.('deploy');
      }
      return success;
    } catch (error: unknown) {
      console.error('Deployment failed:', error);
      return false;
    }
  }, [handleDeployment, handleStepNavigation]);

  // Handle template operations (mock implementation)
  const handleSaveMappingTemplate = React.useCallback(
    async (templateName: string, mappings: typeof fieldMappings) => {
      try {
        console.log('Saving template:', templateName, mappings);
        clearSuccess?.();
      } catch (err) {
        console.error('Failed to save template:', err);
      }
    },
    [clearSuccess]
  );

  const handleLoadMappingTemplate = React.useCallback(
    async (templateId: string) => {
      try {
        console.log('Loading template:', templateId);
        clearSuccess?.();
      } catch (err) {
        console.error('Failed to load template:', err);
      }
    },
    [clearSuccess]
  );

  // Mock template data
  const mockTemplates = React.useMemo(
    () => [
      {
        id: '1',
        name: 'Individual Contact Import',
        description: 'Standard mapping for individual contact data',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        mappingCount: 15,
      },
      {
        id: '2',
        name: 'Business Entity Import',
        description: 'Business party and payment information',
        createdAt: '2024-01-10T15:30:00Z',
        updatedAt: '2024-01-10T15:30:00Z',
        mappingCount: 20,
      },
    ],
    []
  );

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground mt-2">
            Import, process, and deploy your data with advanced field mapping
            and validation
          </p>
        </div>

        {/* Workflow Progress Component */}
        <WorkflowProgress
          currentStep={currentStep}
          currentFile={workflowCurrentFile}
          onStepClick={handleStepNavigationWrapper}
          mappingStats={mappingStats}
          validationStats={validationStats}
          isProcessing={
            isProcessing || isUploading || isValidating || isDeploying
          }
          allowNavigation={true}
          showDetailed={true}
        />

        {/* Global Alerts */}
        {error && (
          <Alert className="mb-6" variant="destructive">
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
          <Alert className="mb-6" variant="default">
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

        {/* Main Workflow Content - Conditional rendering based on currentStep */}
        <div className="space-y-6">
          {currentStep === 'upload' && (
            <UploadStep
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUploadWrapper}
              onProcessFile={handleProcessFileWrapper}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          )}

          {currentStep === 'staging' && (
            <>
              {fileData ? (
                <StagingStep
                  fileData={fileData}
                  isProcessing={isProcessing}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No file data available. Please upload and process a file
                    first.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {currentStep === 'mapping' && (
            <>
              {fileData && fieldMappings.length >= 0 ? (
                <MappingStep
                  fileData={fileData}
                  fieldMappings={fieldMappings}
                  availableFields={availableFields}
                  onUpdateMapping={handleUpdateMapping || (() => {})}
                  onAddCustomField={handleAddCustomField || (() => {})}
                  onNext={handleNext}
                  onBack={handleBack}
                  onSaveMappingTemplate={handleSaveMappingTemplate}
                  onLoadMappingTemplate={handleLoadMappingTemplate}
                  mappingTemplates={mockTemplates}
                  isProcessing={isProcessing}
                />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No mapping data available. Please complete the staging step
                    first.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {currentStep === 'validation' && (
            <ValidationStep
              fieldMappings={fieldMappings}
              validationResults={validationResults}
              onValidate={handleValidateWrapper}
              onNext={handleNext}
              onBack={handleBack}
              isValidating={isValidating}
            />
          )}

          {currentStep === 'review' && (
            <>
              {currentFile ? (
                <ReviewStep
                  fileData={fileData}
                  fieldMappings={fieldMappings}
                  validationResults={validationResults}
                  currentFile={{
                    original_filename: currentFile.original_filename,
                    upload_status: currentFile.upload_status,
                    total_rows: currentFile.total_rows ?? 0,
                    file_id: currentFile.file_id,
                    upload_id: currentFile.upload_id,
                    uploaded_at: currentFile.uploaded_at,
                  }}
                  onDeploy={handleDeployWrapper}
                  onBack={handleBack}
                  isDeploying={isDeploying}
                />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No file selected for review.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {currentStep === 'deploy' && (
            <>
              {currentFile ? (
                <DeployStep
                  currentFile={{
                    original_filename: currentFile.original_filename,
                    upload_status: currentFile.upload_status,
                    total_rows: currentFile.total_rows ?? 0,
                    file_id: currentFile.file_id,
                    upload_id: currentFile.upload_id,
                  }}
                  deploymentStats={{
                    recordsProcessed: fileData?.totalRows || 0,
                    recordsSuccessful: fileData?.totalRows || 0,
                    recordsFailed: 0,
                    tablesUpdated: Array.from(
                      new Set(
                        fieldMappings
                          .filter((m) => m.targetTable)
                          .map((m) => m.targetTable)
                      )
                    ),
                    startTime: new Date().toISOString(),
                    endTime:
                      currentFile?.upload_status === 'deployed'
                        ? new Date().toISOString()
                        : undefined,
                  }}
                  onStartNewImport={() => handleStepNavigation?.('upload')}
                  onViewData={() => {}}
                  onDownloadReport={() => {}}
                  onBack={handleBack}
                  isDeploying={isDeploying}
                  deploymentProgress={uploadProgress}
                />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No file selected for deployment.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
