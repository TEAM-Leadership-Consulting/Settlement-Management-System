// src/hooks/useDataManagement.ts
'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';
import { AdvancedValidator } from '@/lib/advancedValidation';
import type {
  UploadedFile,
  FileData,
  FieldMapping,
  ValidationResult,
  ValidationSettings,
  WorkflowStep,
  ColumnType,
} from '@/types/dataManagement';
import type { DatabaseField } from '@/constants/databaseSchema';
import { getAllDatabaseFields } from '@/constants/databaseSchema';

export const useDataManagement = () => {
  // State management
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Progress tracking
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationProgress, setValidationProgress] = useState(0);

  // Messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Available database fields from schema
  const [availableFields] = useState<DatabaseField[]>(getAllDatabaseFields());

  // Helper function to parse CSV content
  const parseCSVContent = useCallback(
    (csvText: string): { headers: string[]; rows: string[][] } => {
      try {
        const result = Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          dynamicTyping: false,
          delimitersToGuess: [',', '\t', '|', ';'],
        });

        if (result.errors && result.errors.length > 0) {
          console.warn('CSV parsing warnings:', result.errors);
        }

        if (!result.data || result.data.length === 0) {
          throw new Error('No data found in CSV file');
        }

        const [headerRow, ...dataRows] = result.data as string[][];
        const headers = headerRow
          .map((h) => h?.toString().trim())
          .filter(Boolean);
        const rows = dataRows
          .filter((row) => row && row.some((cell) => cell?.toString().trim()))
          .map((row) =>
            headers.map((_, index) => row[index]?.toString().trim() || '')
          );

        return { headers, rows };
      } catch (parseError) {
        throw new Error(
          `Failed to parse CSV: ${
            parseError instanceof Error ? parseError.message : 'Unknown error'
          }`
        );
      }
    },
    []
  );

  // Helper function to detect column types
  const detectColumnType = useCallback(
    (samples: string[]): { type: string; confidence: number } => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^[\+]?[1-9]?[\d\s\-\(\)\.]{7,15}$/;
      const datePattern = /^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$/;
      const numberPattern = /^\d+\.?\d*$/;

      let emailCount = 0;
      let phoneCount = 0;
      let dateCount = 0;
      let numberCount = 0;

      samples.forEach((sample) => {
        if (emailPattern.test(sample)) emailCount++;
        if (phonePattern.test(sample)) phoneCount++;
        if (datePattern.test(sample)) dateCount++;
        if (numberPattern.test(sample)) numberCount++;
      });

      const total = samples.length;
      if (emailCount / total > 0.8)
        return { type: 'email', confidence: emailCount / total };
      if (phoneCount / total > 0.8)
        return { type: 'phone', confidence: phoneCount / total };
      if (dateCount / total > 0.8)
        return { type: 'date', confidence: dateCount / total };
      if (numberCount / total > 0.8)
        return { type: 'number', confidence: numberCount / total };

      return { type: 'text', confidence: 1.0 };
    },
    []
  );

  // Process file handler (MOVED BEFORE handleFileUpload to fix declaration order)
  const handleProcessFile = useCallback(
    async (file: UploadedFile): Promise<boolean> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Download file content from Supabase Storage
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from('data-uploads')
          .download(file.file_id);

        if (downloadError) throw downloadError;

        // Read file content
        const fileText = await fileBlob.text();
        const { headers, rows } = parseCSVContent(fileText);

        // Detect column types
        const columnTypes: ColumnType[] = headers.map((header, index) => {
          const samples = rows
            .slice(0, 10)
            .map((row) => row[index])
            .filter(Boolean);
          const { type, confidence } = detectColumnType(samples);

          return {
            column: header,
            detectedType: type,
            confidence,
            samples: samples.slice(0, 3),
          };
        });

        const processedData: FileData = {
          headers,
          rows,
          totalRows: rows.length,
          preview: rows.slice(0, 5),
          columnTypes,
        };

        // Create initial field mappings
        const initialMappings: FieldMapping[] = headers.map((header) => ({
          sourceColumn: header,
          targetTable: '',
          targetField: '',
          required: false,
          validated: false,
          confidence: 0.8,
        }));

        // Update file status in database
        const { error: updateError } = await supabase
          .from('data-uploads')
          .update({
            upload_status: 'staged',
            total_rows: rows.length,
            metadata: JSON.stringify(processedData.preview),
            last_modified: new Date().toISOString(),
          })
          .eq('upload_id', file.upload_id);

        if (updateError) throw updateError;

        // Update local state
        const updatedFile: UploadedFile = {
          ...file,
          upload_status: 'staged',
          total_rows: rows.length,
          preview_data: JSON.stringify(processedData.preview),
          updated_at: new Date().toISOString(),
        };

        setFileData(processedData);
        setFieldMappings(initialMappings);
        setCurrentFile(updatedFile);
        setUploadedFiles((prev) =>
          prev.map((f) => (f.upload_id === file.upload_id ? updatedFile : f))
        );
        setSuccess('File uploaded and processed successfully');

        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to process file';
        setError(errorMessage);

        // Update file status to failed
        if (file.upload_id) {
          await supabase
            .from('data-uploads')
            .update({
              upload_status: 'failed',
              error_message: errorMessage,
              last_modified: new Date().toISOString(),
            })
            .eq('upload_id', file.upload_id);
        }

        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [parseCSVContent, detectColumnType]
  );

  // File upload handler
  // File upload handler
  const handleFileUpload = useCallback(
    async (file: File): Promise<UploadedFile> => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Add detailed logging
        console.log('=== FILE UPLOAD START ===');
        console.log('File details:', {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        // Check authentication
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        console.log('Current user:', user);
        console.log('Auth error:', authError);
        console.log('User ID:', user?.id);

        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = fileName;

        console.log('Generated filename:', fileName);
        console.log('Upload path:', filePath);

        setUploadProgress(25);

        console.log('Starting storage upload...');
        const { error: uploadError } = await supabase.storage
          .from('data-uploads')
          .upload(filePath, file);

        console.log('Storage upload result:', { error: uploadError });
        if (uploadError) throw uploadError;

        setUploadProgress(50);

        // Create file record in database
        const insertData = {
          original_filename: file.name,
          file_id: fileName,
          file_size: file.size,
          file_type: file.type,
          upload_status: 'uploaded' as const,
        };

        console.log('About to insert into database:', insertData);
        console.log('Table name: data-uploads');

        const { data: fileRecord, error: dbError } = await supabase
          .from('data-uploads')
          .insert(insertData)
          .select()
          .single();

        console.log('Database insert result:', {
          data: fileRecord,
          error: dbError,
        });

        if (dbError) {
          console.error('Database error details:', {
            message: dbError.message,
            code: dbError.code,
            hint: dbError.hint,
            details: dbError.details,
          });
          throw dbError;
        }

        const uploadedFile: UploadedFile = {
          file_id: fileRecord.file_id,
          upload_id: fileRecord.upload_id,
          original_filename: fileRecord.original_filename,
          stored_filename: fileRecord.file_id,
          file_size: fileRecord.file_size,
          file_type: fileRecord.file_type,
          upload_status: fileRecord.upload_status,
          uploaded_at: fileRecord.uploaded_at,
          total_rows: fileRecord.total_rows,
          preview_data: fileRecord.metadata,
          error_message: fileRecord.error_message,
          created_at: fileRecord.created_date,
          updated_at: fileRecord.last_modified,
        };

        setUploadedFiles((prev) => [...prev, uploadedFile]);
        setCurrentFile(uploadedFile);

        setUploadProgress(100);

        // Auto-process the file (restore this)
        await handleProcessFile(uploadedFile);

        return uploadedFile;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to upload file';
        setError(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
        setTimeout(() => {
          setUploadProgress(0);
        }, 1500);
      }
    },
    [handleProcessFile] // Add this back to dependencies
  );

  // Update field mapping
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
            m.sourceColumn === sourceColumn ? { ...m, ...newMapping } : m
          );
        } else {
          return [...prev, newMapping];
        }
      });
    },
    []
  );

  // Validation handler with settings support
  const handleValidation = useCallback(
    async (settings?: ValidationSettings): Promise<boolean> => {
      setIsValidating(true);
      setValidationProgress(0);
      setError(null);

      try {
        if (!fileData || !currentFile) {
          throw new Error('No file data available for validation');
        }

        const mappedFields = fieldMappings.filter(
          (m) => m.targetTable && m.targetField
        );
        if (mappedFields.length === 0) {
          throw new Error('No field mappings configured');
        }

        // Default settings if none provided
        const validationSettings: ValidationSettings = settings || {
          validateEmails: true,
          validatePhones: true,
          validateDates: true,
          validatePostalCodes: true,
          validateCurrency: true,
          validateSSN: true,
          validateTaxId: true,
          enableDuplicateDetection: true,
          duplicateMatchType: '100_percent',
          duplicateAction: 'flag',
          duplicateColumns: [],
          fuzzyThreshold: 85,
          customDuplicateRules: {
            exactMatchColumns: [],
            fuzzyMatchColumns: [],
            ignoreColumns: [],
          },
          handleMissingData: 'skip',
          defaultValue: '',
          trimWhitespace: false,
          standardizeCase: 'none',
          removeSpecialCharacters: false,
          strictValidation: false,
          allowPartialMatches: true,
          skipEmptyFields: true,
          batchSize: 1000,
          maxErrors: 100,
          sampleValidation: false,
          sampleSize: 10,
        };

        setValidationProgress(25);

        // Use Advanced Validator
        const validator = new AdvancedValidator(validationSettings);

        // Convert fileData to format expected by validator
        const dataArray: string[][] = [
          fileData.headers,
          ...fileData.rows.map((row) => row.map((cell) => String(cell || ''))),
        ];

        setValidationProgress(50);

        const results = await validator.validateData(dataArray, mappedFields);

        setValidationProgress(75);

        setValidationResults(results);

        // Update file status
        const hasErrors = results.some((r) => r.errors.length > 0);
        const newStatus = hasErrors ? 'failed' : 'validated';

        await supabase
          .from('data-uploads')
          .update({
            upload_status: newStatus,
            last_modified: new Date().toISOString(),
          })
          .eq('upload_id', currentFile.upload_id);

        setCurrentFile((prev) =>
          prev ? { ...prev, upload_status: newStatus } : null
        );

        setValidationProgress(100);

        if (hasErrors) {
          setError(
            'Validation completed with errors. Please review before proceeding.'
          );
        } else {
          setSuccess('Validation completed successfully');
        }

        return !hasErrors;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Validation failed';
        setError(errorMessage);
        return false;
      } finally {
        setIsValidating(false);
        setValidationProgress(0);
      }
    },
    [fieldMappings, fileData, currentFile]
  );

  // Deployment handler
  const handleDeployment = useCallback(async (): Promise<boolean> => {
    setIsDeploying(true);
    setError(null);

    try {
      if (!fileData || !currentFile) {
        throw new Error('No file data available for deployment');
      }

      const mappedFields = fieldMappings.filter(
        (m) => m.targetTable && m.targetField
      );
      if (mappedFields.length === 0) {
        throw new Error('No field mappings configured');
      }

      // Group mappings by target table
      const tableGroups = mappedFields.reduce((acc, mapping) => {
        if (!acc[mapping.targetTable]) {
          acc[mapping.targetTable] = [];
        }
        acc[mapping.targetTable].push(mapping);
        return acc;
      }, {} as Record<string, FieldMapping[]>);

      // Process each table
      for (const [tableName, mappings] of Object.entries(tableGroups)) {
        const records = fileData.rows.map((row) => {
          const record: Record<string, unknown> = {};

          mappings.forEach((mapping) => {
            const columnIndex = fileData.headers.indexOf(mapping.sourceColumn);
            if (columnIndex !== -1) {
              record[mapping.targetField] = row[columnIndex] || null;
            }
          });

          return record;
        });

        // Insert records into target table
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(records);

        if (insertError) throw insertError;
      }

      // Update file status
      await supabase
        .from('data-uploads')
        .update({
          upload_status: 'deployed',
          last_modified: new Date().toISOString(),
        })
        .eq('upload_id', currentFile.upload_id);

      const deployedFile: UploadedFile = {
        ...currentFile,
        upload_status: 'deployed',
        updated_at: new Date().toISOString(),
      };

      setCurrentFile(deployedFile);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.upload_id === currentFile.upload_id ? deployedFile : f
        )
      );

      setSuccess('Data deployed successfully to production');
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Deployment failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsDeploying(false);
    }
  }, [currentFile, fileData, fieldMappings]);

  // Add custom field handler
  const handleAddCustomField = useCallback((field: DatabaseField) => {
    // This would typically save to database and update available fields
    console.log('Adding custom field:', field);
    setSuccess('Custom field added successfully');
  }, []);

  // Step navigation
  const handleStepNavigation = useCallback((step: WorkflowStep) => {
    setCurrentStep(step);
    setError(null);
    setSuccess(null);
  }, []);

  // Clear messages
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  return {
    // State
    uploadedFiles,
    fileData,
    currentFile,
    fieldMappings,
    validationResults,
    currentStep,
    isUploading,
    isProcessing,
    isValidating,
    isDeploying,
    error,
    success,
    uploadProgress,
    validationProgress,
    availableFields,

    // Actions
    handleFileUpload,
    handleProcessFile,
    handleUpdateMapping,
    handleAddCustomField,
    handleValidation,
    handleDeployment,
    handleStepNavigation,
    clearError,
    clearSuccess,
  };
};
