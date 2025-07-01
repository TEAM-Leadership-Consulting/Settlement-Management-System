// src/app/data-management/page.tsx
'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { WorkflowProgress } from '@/components/DataManagement/shared/WorkflowProgress';
import { UploadStep } from '@/components/DataManagement/steps/UploadStep';
import { StagingStep } from '@/components/DataManagement/steps/StagingStep';
import { MappingStep } from '@/components/DataManagement/steps/MappingStep';
import { EnhancedValidationStep } from '@/components/DataManagement/steps/EnhancedValidationStep';
import { ReviewStep } from '@/components/DataManagement/steps/ReviewStep';
import { DeployStep } from '@/components/DataManagement/steps/DeployStep';
import SmoothTransition from '@/components/DataManagement/shared/SmoothTransition';
import { useDataManagement } from '@/hooks/useDataManagement';
import type {
  WorkflowStep,
  UploadedFile,
  MappingStats,
  ValidationStats,
  WorkflowProgressFile,
  DeployStepProps,
  FileData,
} from '@/types/dataManagement';
import type { DatabaseField } from '@/constants/databaseSchema';

interface ReviewStepFile {
  original_filename: string;
  upload_status: string;
  total_rows: number;
  file_id: string;
  upload_id: number;
  uploaded_at: string;
  file_size: number;
}

// Helper function to transform FileData to match StagingStep expectations
const transformFileDataForStaging = (fileData: FileData | null) => {
  if (!fileData) return null;

  return {
    headers: fileData.headers,
    rows: fileData.rows.map((row) => row.map((cell) => String(cell || ''))), // Convert unknown[][] to string[][]
    totalRows: fileData.totalRows,
    fileName: fileData.fileName || 'unknown',
    fileType: (fileData.fileType || 'csv') as 'csv' | 'excel',
    columnTypes: fileData.columnTypes.map((col) => ({
      name: col.column || col.name || '',
      type: col.detectedType || col.type || 'text',
      sample: (col.samples || col.sample || []).map((s) => String(s || '')),
      nullCount: col.nullCount || 0,
      confidence: col.confidence || 0,
      patterns: col.detectedPatterns || col.patterns || [],
      suggestions: col.suggestions || [],
      detectedPatterns: col.detectedPatterns || col.patterns || [],
    })),
  };
};

// This is the default export that Next.js expects for a page component
export default function DataManagementPage() {
  const dataManagement = useDataManagement();

  // Add state for smooth transition
  const [showTransition, setShowTransition] = useState(false);

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
    validationProgress = 0,
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

  const handleViewData = useCallback(() => {
    if (!currentFile) return;

    // Navigate to data view page with file context
    window.open(`/data-management/view/${currentFile.file_id}`, '_blank');
  }, [currentFile]);

  const handleDownloadReport = useCallback(() => {
    if (!currentFile) return;

    // Create and download CSV report
    const csvContent = [
      'Import Report',
      `File: ${currentFile.original_filename}`,
      `Upload Date: ${new Date(currentFile.uploaded_at).toLocaleString()}`,
      `Total Rows: ${currentFile.total_rows}`,
      `Status: ${currentFile.upload_status}`,
      '',
      'Field Mappings:',
      'Source Column,Target Table,Target Field,Confidence',
      ...fieldMappings.map(
        (m) =>
          `"${m.sourceColumn}","${m.targetTable || 'Unmapped'}","${
            m.targetField || 'Unmapped'
          }","${(m.confidence || 0) * 100}%"`
      ),
      '',
      'Validation Results:',
      'Field,Records,Errors,Warnings',
      ...validationResults.map(
        (r) =>
          `"${r.field}","${r.recordCount}","${r.errors.length}","${r.warnings.length}"`
      ),
    ].join('\n');

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `import-report-${currentFile.file_id}-${
        new Date().toISOString().split('T')[0]
      }.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentFile, fieldMappings, validationResults]);

  // Convert currentFile to WorkflowProgress expected format
  const workflowCurrentFile = useMemo((): WorkflowProgressFile | null => {
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

  // Convert currentFile to ReviewStep expected format
  const reviewStepFile = useMemo((): ReviewStepFile | null => {
    if (!currentFile) return null;

    return {
      original_filename: currentFile.original_filename,
      upload_status: currentFile.upload_status,
      total_rows: currentFile.total_rows ?? 0,
      file_id: currentFile.file_id,
      upload_id: currentFile.upload_id,
      uploaded_at: currentFile.uploaded_at,
      file_size: currentFile.file_size || 0,
    };
  }, [currentFile]);

  // Convert currentFile to ComponentUploadedFile for DeployStep
  const componentUploadedFile = useMemo(():
    | DeployStepProps['currentFile']
    | null => {
    if (!currentFile) return null;

    return {
      upload_id: currentFile.upload_id,
      file_id: currentFile.file_id,
      original_filename: currentFile.original_filename,
      file_size: currentFile.file_size,
      file_type: currentFile.file_type,
      upload_status: currentFile.upload_status,
      total_rows: currentFile.total_rows ?? 0,
      uploaded_at: currentFile.uploaded_at,
      processed_at: currentFile.processed_at,
      error_message: currentFile.error_message,
      mapping_config: currentFile.mapping_config,
    };
  }, [currentFile]);

  // Transform fileData for StagingStep
  const stagingFileData = useMemo(() => {
    return transformFileDataForStaging(fileData);
  }, [fileData]);

  // Calculate mapping statistics for WorkflowProgress
  const mappingStats = useMemo((): MappingStats => {
    if (!fieldMappings?.length)
      return { mapped: 0, unmapped: 0, total: 0, percentage: 0 };

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

        // After successful processing, show transition instead of jarring jump
        if (currentStep === 'upload') {
          setShowTransition(true);
        }
      } catch (error: unknown) {
        console.error('Error processing file:', error);
      }
    },
    [handleProcessFile, currentStep]
  );

  const handleDeployWrapper = useCallback(async (): Promise<boolean> => {
    if (!handleDeployment) return false;
    try {
      return await handleDeployment();
    } catch (error: unknown) {
      console.error('Deployment failed:', error);
      return false;
    }
  }, [handleDeployment]);

  const handleAddCustomFieldWrapper = useCallback(
    (field: DatabaseField): void => {
      if (!handleAddCustomField) return;
      try {
        handleAddCustomField(field);
      } catch (error: unknown) {
        console.error('Error adding custom field:', error);
      }
    },
    [handleAddCustomField]
  );

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

  // Handle transition completion
  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    clearError?.();
    clearSuccess?.();
    handleStepNavigation?.('staging');
  }, [handleStepNavigation, clearError, clearSuccess]);

  // Handle transition skip
  const handleTransitionSkip = useCallback(() => {
    setShowTransition(false);
    clearError?.();
    clearSuccess?.();
    handleStepNavigation?.('staging');
  }, [handleStepNavigation, clearError, clearSuccess]);

  // REPLACED: Old jarring auto-navigation with smooth transition trigger
  React.useEffect(() => {
    if (
      currentFile?.upload_status === 'staged' &&
      currentStep === 'upload' &&
      fileData &&
      !showTransition
    ) {
      // Small delay before showing transition
      setTimeout(() => {
        setShowTransition(true);
      }, 500);
    }
  }, [currentFile?.upload_status, currentStep, fileData, showTransition]);

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
          onStepClick={handleStepNavigation}
          mappingStats={mappingStats}
          validationStats={validationStats}
          isProcessing={
            isProcessing ||
            isUploading ||
            isValidating ||
            isDeploying ||
            showTransition
          }
          allowNavigation={!showTransition}
          showDetailed={false}
        />

        {/* Global Alerts - Hidden during transition */}
        {error && !showTransition && (
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

        {success && !showTransition && (
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

        {/* Step Content - Hidden during transition */}
        {!showTransition && (
          <>
            {currentStep === 'upload' && (
              <UploadStep
                uploadedFiles={uploadedFiles}
                onFileUpload={handleFileUploadWrapper}
                onProcessFile={handleProcessFileWrapper}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            )}

            {currentStep === 'staging' && stagingFileData && (
              <StagingStep
                fileData={stagingFileData}
                isProcessing={isProcessing}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === 'mapping' && fileData && (
              <MappingStep
                fileData={fileData}
                fieldMappings={fieldMappings}
                availableFields={availableFields as DatabaseField[]}
                onUpdateMapping={handleUpdateMapping || (() => {})}
                onAddCustomField={handleAddCustomFieldWrapper}
                onNext={handleNext}
                onBack={handleBack}
                isProcessing={isProcessing}
              />
            )}

            {currentStep === 'validation' && (
              <EnhancedValidationStep
                fieldMappings={fieldMappings}
                validationResults={validationResults}
                fileData={
                  fileData
                    ? {
                        headers: fileData.headers,
                        rows: fileData.rows.map((row) =>
                          row.map((cell) => String(cell || ''))
                        ),
                        totalRows: fileData.totalRows,
                      }
                    : null
                }
                onValidate={handleValidation || (() => Promise.resolve(false))}
                onNext={handleNext}
                onBack={handleBack}
                isValidating={isValidating}
                validationProgress={validationProgress}
              />
            )}

            {currentStep === 'review' && reviewStepFile && (
              <ReviewStep
                fileData={fileData}
                fieldMappings={fieldMappings}
                validationResults={validationResults}
                currentFile={reviewStepFile}
                onDeploy={handleDeployWrapper}
                onBack={handleBack}
                isDeploying={isDeploying}
              />
            )}

            {currentStep === 'deploy' && componentUploadedFile && (
              <DeployStep
                currentFile={componentUploadedFile}
                onStartNewImport={() => handleStepNavigation?.('upload')}
                onViewData={handleViewData}
                onDownloadReport={handleDownloadReport}
                onBack={handleBack}
              />
            )}

            {/* Fallback for missing data */}
            {!fileData &&
              (currentStep === 'staging' || currentStep === 'mapping') && (
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

        {/* Smooth Transition Overlay */}
        {showTransition && (
          <SmoothTransition
            isVisible={true}
            onTransitionComplete={handleTransitionComplete}
            onSkip={handleTransitionSkip}
            fileName={currentFile?.original_filename || 'Unknown File'}
            fileSize={currentFile?.file_size || 0}
            totalRows={currentFile?.total_rows || 0}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
