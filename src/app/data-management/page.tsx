// src/app/data-management/page.tsx
'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
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
  FieldMapping,
  ValidationResult,
} from '@/types/dataManagement';

// This is the default export that Next.js expects for a page component
export default function DataManagementPage() {
  const dataManagement = useDataManagement();

  // Safely extract properties with fallbacks, matching the actual hook interface
  const {
    // State
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

    // Actions - using the correct method names from the hook
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

  // Convert currentFile to WorkflowProgress format
  const workflowCurrentFile = React.useMemo(() => {
    if (!currentFile) return null;

    return {
      original_filename: currentFile.original_filename,
      upload_status: currentFile.upload_status,
      total_rows: currentFile.total_rows ?? undefined, // Convert null to undefined
      uploaded_at: currentFile.uploaded_at,
      file_size: currentFile.file_size,
      file_type: currentFile.file_type,
    };
  }, [currentFile]);

  // Calculate mapping statistics for WorkflowProgress
  const mappingStats = React.useMemo(() => {
    if (!fieldMappings?.length) return undefined;

    const mapped = fieldMappings.filter((m: FieldMapping) =>
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

  // Calculate validation statistics for WorkflowProgress
  const validationStats = React.useMemo(() => {
    if (!validationResults?.length) return undefined;

    const errors = validationResults.reduce(
      (sum: number, result: ValidationResult) =>
        sum + (result.errors?.length || 0),
      0
    );
    const warnings = validationResults.reduce(
      (sum: number, result: ValidationResult) =>
        sum + (result.warnings?.length || 0),
      0
    );
    const validated = validationResults.filter(
      (result: ValidationResult) => (result.errors?.length || 0) === 0
    ).length;

    // Calculate total and valid for WorkflowProgress compatibility
    const total = validationResults.reduce(
      (sum: number, result: ValidationResult) =>
        sum + (result.recordCount || 0),
      0
    );

    const valid = validationResults.reduce(
      (sum: number, result: ValidationResult) => sum + (result.validCount ?? 0),
      0
    );

    return {
      errors,
      warnings,
      validated,
      valid,
      total,
    };
  }, [validationResults]);

  // Handle file upload wrapper
  const handleFileUploadWrapper = React.useCallback(
    async (file: File) => {
      if (!handleFileUpload) return;
      try {
        await handleFileUpload(file);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    },
    [handleFileUpload]
  );

  // Handle file processing wrapper with proper typing
  const handleProcessFileWrapper = React.useCallback(
    async (file: UploadedFile) => {
      if (!handleProcessFile) return;
      try {
        await handleProcessFile(file);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    },
    [handleProcessFile]
  );

  // Check if user can proceed to a specific step
  const canProceedToStep = React.useCallback(
    (step: string): boolean => {
      switch (step) {
        case 'staging':
          return !!currentFile && currentFile.upload_status !== 'failed';
        case 'mapping':
          return !!fileData && currentFile?.upload_status === 'staged';
        case 'validation':
          return fieldMappings.some((m: FieldMapping) =>
            Boolean(m.targetTable && m.targetField)
          );
        case 'review':
          return (
            validationResults.length === 0 ||
            validationResults.every(
              (r: ValidationResult) => (r.errors?.length || 0) === 0
            )
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

  // Handle step navigation
  const handleStepNavigationWrapper = React.useCallback(
    (step: string) => {
      // Only allow navigation to completed or current steps
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

  // Handle deployment
  const handleDeploy = React.useCallback(async () => {
    if (!handleDeployment) return false;
    try {
      const success = await handleDeployment();
      if (success) {
        handleStepNavigation?.('deploy');
      }
      return success;
    } catch (error) {
      console.error('Deployment failed:', error);
      return false;
    }
  }, [handleDeployment, handleStepNavigation]);

  // Handle validation
  const handleValidate = React.useCallback(async () => {
    if (!handleValidation) return false;
    try {
      return await handleValidation();
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  }, [handleValidation]);

  // Reset workflow for new import
  const handleStartNewImport = () => {
    handleStepNavigation?.('upload');
    clearError?.();
    clearSuccess?.();
  };

  // Handle template operations (mock implementation)
  const handleSaveMappingTemplate = async (
    templateName: string,
    mappings: FieldMapping[]
  ) => {
    try {
      // In a real implementation, you would save to database
      console.log('Saving template:', templateName, mappings);
      clearSuccess?.();
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  const handleLoadMappingTemplate = async (templateId: string) => {
    try {
      // In a real implementation, you would load from database
      console.log('Loading template:', templateId);
      clearSuccess?.();
    } catch (err) {
      console.error('Failed to load template:', err);
    }
  };

  // Mock template data
  const mockTemplates: Array<{
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    mappingCount: number;
  }> = [
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
  ];

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

        {/* Main Workflow Content */}
        <Tabs
          value={currentStep}
          onValueChange={(value) => handleStepNavigationWrapper(value)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="upload" disabled={isProcessing}>
              Upload
            </TabsTrigger>
            <TabsTrigger
              value="staging"
              disabled={isProcessing || !canProceedToStep('staging')}
            >
              Staging
            </TabsTrigger>
            <TabsTrigger
              value="mapping"
              disabled={isProcessing || !canProceedToStep('mapping')}
            >
              Mapping
            </TabsTrigger>
            <TabsTrigger
              value="validation"
              disabled={isProcessing || !canProceedToStep('validation')}
            >
              Validation
            </TabsTrigger>
            <TabsTrigger
              value="review"
              disabled={isProcessing || !canProceedToStep('review')}
            >
              Review
            </TabsTrigger>
            <TabsTrigger
              value="deploy"
              disabled={isProcessing || !canProceedToStep('deploy')}
            >
              Deploy
            </TabsTrigger>
          </TabsList>

          {/* Upload Step */}
          <TabsContent value="upload">
            <UploadStep
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUploadWrapper}
              onProcessFile={handleProcessFileWrapper}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </TabsContent>

          {/* Staging Step */}
          <TabsContent value="staging">
            {fileData ? (
              <StagingStep
                fileData={fileData}
                isProcessing={isProcessing}
                onNext={handleNext}
                onBack={handleBack}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No file data available. Please upload and process a file
                  first.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleStepNavigation?.('upload')}
                  className="mt-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Upload
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Mapping Step */}
          <TabsContent value="mapping">
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
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No mapping data available. Please complete the staging step
                  first.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleStepNavigation?.('staging')}
                  className="mt-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Staging
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Validation Step */}
          <TabsContent value="validation">
            <ValidationStep
              fieldMappings={fieldMappings}
              validationResults={validationResults}
              onValidate={handleValidate}
              onNext={handleNext}
              onBack={handleBack}
              isValidating={isValidating}
            />
          </TabsContent>

          {/* Review Step */}
          <TabsContent value="review">
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
                onDeploy={handleDeploy}
                onBack={handleBack}
                isDeploying={isDeploying}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No file selected for review.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleStepNavigation?.('validation')}
                  className="mt-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Validation
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Deploy Step */}
          <TabsContent value="deploy">
            {currentFile ? (
              <DeployStep
                currentFile={{
                  original_filename: currentFile.original_filename,
                  upload_status: currentFile.upload_status,
                  total_rows: currentFile.total_rows ?? 0, // Convert null to 0
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
                        .filter((m: FieldMapping) => Boolean(m.targetTable))
                        .map((m: FieldMapping) => m.targetTable as string)
                    )
                  ),
                  startTime: new Date().toISOString(),
                  endTime:
                    currentFile?.upload_status === 'deployed'
                      ? new Date().toISOString()
                      : undefined,
                }}
                onStartNewImport={handleStartNewImport}
                onViewData={() => {
                  // Navigate to data view
                  window.location.href = '/dashboard';
                }}
                onDownloadReport={() => {
                  // Download deployment report
                  console.log('Downloading deployment report...');
                }}
                onBack={handleBack}
                isDeploying={isDeploying}
                deploymentProgress={
                  currentFile?.upload_status === 'deployed'
                    ? 100
                    : isProcessing
                    ? 75
                    : 0
                }
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No file selected for deployment.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleStepNavigation?.('review')}
                  className="mt-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Review
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Loading Overlay */}
        {(isProcessing || isUploading || isValidating || isDeploying) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <div>
                <h3 className="font-medium">Processing...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your data
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
