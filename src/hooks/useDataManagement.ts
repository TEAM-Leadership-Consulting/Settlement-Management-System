// src/hooks/useDataManagement.ts

import { useState, useCallback, useEffect } from 'react';
import type {
  WorkflowStep,
  UploadedFile,
  FileData,
  FieldMapping,
  ValidationResult,
  ValidationIssue,
} from '@/types/dataManagement';
import {
  DatabaseField,
  getAllDatabaseFields,
} from '@/constants/databaseSchema';

export const useDataManagement = () => {
  // Core state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [availableFields, setAvailableFields] = useState<DatabaseField[]>([]);

  // Status states
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize available fields
  useEffect(() => {
    setAvailableFields(getAllDatabaseFields());
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(async (file: File): Promise<boolean> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      // Simulate file upload API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create uploaded file record
      const uploadedFile: UploadedFile = {
        upload_id: Date.now(),
        file_id: `file_${Date.now()}`,
        original_filename: file.name,
        file_size: file.size,
        file_type: file.type,
        upload_status: 'uploaded',
        total_rows: null,
        uploaded_at: new Date().toISOString(),
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);
      setCurrentFile(uploadedFile);
      setSuccess('File uploaded successfully');

      return true;
    } catch {
      setError('Failed to upload file');
      return false;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // File processing handler
  const handleProcessFile = useCallback(
    async (file: UploadedFile): Promise<boolean> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Simulate file processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Create mock file data
        const mockFileData: FileData = {
          headers: ['first_name', 'last_name', 'email', 'phone', 'zip_code'],
          rows: [
            ['John', 'Doe', 'john@example.com', '555-123-4567', '12345'],
            ['Jane', 'Smith', 'jane@example.com', '555-987-6543', '67890'],
          ],
          totalRows: 2,
          fileName: file.original_filename,
          fileType: 'csv',
          columnTypes: [
            {
              name: 'first_name',
              type: 'text',
              sample: ['John', 'Jane'],
              nullCount: 0,
              confidence: 0.95,
            },
            {
              name: 'last_name',
              type: 'text',
              sample: ['Doe', 'Smith'],
              nullCount: 0,
              confidence: 0.95,
            },
            {
              name: 'email',
              type: 'email',
              sample: ['john@example.com', 'jane@example.com'],
              nullCount: 0,
              confidence: 0.98,
            },
            {
              name: 'phone',
              type: 'phone',
              sample: ['555-123-4567', '555-987-6543'],
              nullCount: 0,
              confidence: 0.92,
            },
            {
              name: 'zip_code',
              type: 'postal_code',
              sample: ['12345', '67890'],
              nullCount: 0,
              confidence: 0.98,
            },
          ],
        };

        setFileData(mockFileData);
        setCurrentFile((prev) =>
          prev
            ? {
                ...prev,
                upload_status: 'staged',
                total_rows: mockFileData.totalRows,
              }
            : null
        );
        setSuccess('File processed successfully');

        return true;
      } catch {
        setError('Failed to process file');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Step navigation handler
  const handleStepNavigation = useCallback((step: WorkflowStep) => {
    setCurrentStep(step);
    setError(null);
    setSuccess(null);
  }, []);

  // Mapping update handler
  const handleUpdateMapping = useCallback(
    (sourceColumn: string, targetTable: string, targetField: string) => {
      setFieldMappings((prev) => {
        const existing = prev.find((m) => m.sourceColumn === sourceColumn);
        const newMapping: FieldMapping = {
          sourceColumn,
          targetTable,
          targetField,
          required: false,
          validated: false,
          confidence: 0.8,
        };

        if (existing) {
          return prev.map((m) =>
            m.sourceColumn === sourceColumn ? newMapping : m
          );
        } else {
          return [...prev, newMapping];
        }
      });
    },
    []
  );

  // Validation handler - FIXED: Create proper ValidationResult objects
  const handleValidation = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    setError(null);

    try {
      // Simulate validation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create mock validation results with proper ValidationIssue objects
      const warningIssue: ValidationIssue = {
        row: 1,
        column: 'email_address',
        severity: 'warning',
        message: 'Common email domain detected',
        value: 'user@gmail.com',
        suggestion: 'Verify email accuracy',
      };

      const mockResults: ValidationResult[] = [
        {
          field: 'individual_parties.first_name',
          totalChecked: 2,
          validCount: 2,
          invalidCount: 0,
          errors: [],
          warnings: [],
          suggestions: [],
          recordCount: 2,
        },
        {
          field: 'individual_parties.email_address',
          totalChecked: 2,
          validCount: 2,
          invalidCount: 0,
          errors: [],
          warnings: [warningIssue],
          suggestions: ['Consider validating email domains'],
          recordCount: 2,
        },
      ];

      setValidationResults(mockResults);
      setSuccess('Validation completed successfully');

      return true;
    } catch {
      setError('Validation failed');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Deployment handler
  const handleDeployment = useCallback(async (): Promise<boolean> => {
    setIsDeploying(true);
    setError(null);

    try {
      // Simulate deployment
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setCurrentFile((prev) =>
        prev ? { ...prev, upload_status: 'deployed' } : null
      );
      setSuccess('Data deployed successfully');

      return true;
    } catch {
      setError('Deployment failed');
      return false;
    } finally {
      setIsDeploying(false);
    }
  }, []);

  // Add custom field handler
  const handleAddCustomField = useCallback((field: DatabaseField) => {
    setAvailableFields((prev) => [...prev, field]);
    setSuccess('Custom field added successfully');
  }, []);

  // Error/success handlers
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  return {
    // State
    currentStep,
    uploadedFiles,
    currentFile,
    fileData,
    fieldMappings,
    validationResults,
    availableFields,

    // Status
    isUploading,
    isProcessing,
    isValidating,
    isDeploying,
    uploadProgress,
    error,
    success,

    // Actions
    handleFileUpload,
    handleProcessFile,
    handleStepNavigation,
    handleUpdateMapping,
    handleValidation,
    handleDeployment,
    handleAddCustomField,
    clearError,
    clearSuccess,
  };
};
