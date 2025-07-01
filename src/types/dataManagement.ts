// src/types/dataManagement.ts

import type { DatabaseField, DatabaseTable } from '@/constants/databaseSchema';
export type { DatabaseField, DatabaseTable };

export type DataType =
  | 'text'
  | 'number'
  | 'date'
  | 'email'
  | 'phone'
  | 'postal_code'
  | 'boolean'
  | 'decimal'
  | 'enum';

export interface BaseStepProps {
  onNext: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export type MappingUpdateCallback = (
  sourceColumn: string,
  targetTable: string,
  targetField: string
) => void;

export type FieldCreationCallback = (field: DatabaseField) => void;

export type TemplateSaveCallback = (
  templateName: string,
  mappings: FieldMapping[]
) => Promise<void>;

export type TemplateCallback = (templateId: string) => Promise<void>;

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  mappingCount: number;
  usageCount?: number;
  isPublic?: boolean;
  tags?: string[];
}

export interface ColumnType {
  column?: string; // For compatibility with your hook
  name?: string; // For compatibility with StagingStep
  detectedType?: string; // For compatibility with your hook
  type?: DataType | string; // For compatibility with StagingStep
  samples?: string[]; // For compatibility with your hook
  sample?: unknown[]; // For compatibility with StagingStep
  nullCount?: number;
  confidence: number;
  detectedPatterns?: string[];
  patterns?: string[]; // For compatibility with StagingStep
  suggestions?: string[];
  issues?: string[];
  qualityScore?: number;
}

// FIXED: FileData interface to match your usage
export interface FileData {
  headers: string[];
  rows: unknown[][]; // Changed from string[][] to unknown[][]
  totalRows: number;
  preview?: unknown[][]; // Made optional
  fileName?: string; // Made optional since your hook doesn't always set it
  fileType?: 'csv' | 'excel'; // Made optional
  columnTypes: ColumnType[];
}

// FIXED: Made confidence optional and added status
export interface FieldMapping {
  sourceColumn: string;
  targetTable: string;
  targetField: string;
  transformation?: string;
  transformationRule?: string;
  required: boolean;
  validated: boolean;
  confidence?: number; // Made optional
  status?: 'mapped' | 'unmapped' | 'suggested';
}

export interface ValidationResult {
  field: string;
  errors: (string | { message: string })[]; // Updated to match EnhancedValidationStep
  warnings: (string | { message: string })[]; // Updated to match EnhancedValidationStep
  recordCount: number;
  validCount?: number;
}

export interface ValidationSettings {
  // Performance Optimizations
  validateEmails: boolean;
  validatePhones: boolean;
  validateDates: boolean;
  validatePostalCodes: boolean;
  validateCurrency: boolean;
  validateSSN: boolean;
  validateTaxId: boolean;

  // Duplicate Detection
  enableDuplicateDetection: boolean;
  duplicateMatchType: '100_percent' | 'fuzzy' | 'custom';
  duplicateAction: 'skip' | 'error' | 'merge' | 'flag';
  duplicateColumns: string[];
  fuzzyThreshold: number;

  // Custom Duplicate Rules
  customDuplicateRules: {
    exactMatchColumns: string[];
    fuzzyMatchColumns: string[];
    ignoreColumns: string[];
  };

  // Data Quality
  handleMissingData: 'skip' | 'error' | 'default' | 'remove_row';
  defaultValue: string;
  trimWhitespace: boolean;
  standardizeCase: 'none' | 'upper' | 'lower' | 'title';
  removeSpecialCharacters: boolean;

  // Validation Strictness
  strictValidation: boolean;
  allowPartialMatches: boolean;
  skipEmptyFields: boolean;

  // Performance Settings
  batchSize: number;
  maxErrors: number;
  sampleValidation: boolean;
  sampleSize: number;
}

export interface ValidationStepProps extends BaseStepProps {
  fieldMappings: FieldMapping[];
  validationResults: ValidationResult[];
  fileData: {
    headers: string[];
    rows: string[][];
    totalRows: number;
  } | null;
  onValidate: (settings?: ValidationSettings) => Promise<boolean>;
  onNext: () => void;
  onBack: () => void;
  isValidating?: boolean;
  validationProgress?: number;
}

export interface AvailableField {
  table: string;
  field: string;
  type: string;
  description: string;
  required?: boolean;
  category: string;
  isCustomField?: boolean;
}

// Standardized UploadedFile interface
export interface UploadedFile {
  upload_id: number;
  file_id: string;
  original_filename: string;
  stored_filename?: string; // Made optional since not always present
  file_size: number;
  file_type: string;
  upload_status:
    | 'uploaded'
    | 'staged'
    | 'mapped'
    | 'validated'
    | 'ready'
    | 'deployed'
    | 'failed'
    | 'processing';
  total_rows: number | null;
  preview_data?: string | null; // Made optional
  uploaded_at: string;
  processed_at?: string;
  error_message?: string;
  mapping_config?: string;
  uploaded_by?: number;
  // Additional optional properties
  id?: string;
  file_path?: string;
  created_at?: string; // Made optional
  updated_at?: string;
  case_id?: string;
  user_id?: string;
}

export type WorkflowStep =
  | 'upload'
  | 'staging'
  | 'mapping'
  | 'validation'
  | 'review'
  | 'deploy';

export interface MappingStats {
  mapped: number;
  unmapped: number;
  total: number;
  percentage: number;
}

export interface ValidationStats {
  errors: number;
  warnings: number;
  validated: number;
  valid?: number;
  total?: number;
}

export interface WorkflowProgressFile {
  original_filename: string;
  upload_status: string;
  total_rows?: number;
  uploaded_at: string;
  file_size?: number;
  file_type?: string;
}

export interface WorkflowProgressProps {
  currentStep: WorkflowStep;
  currentFile: WorkflowProgressFile | null;
  onStepClick?: (step: WorkflowStep) => void;
  mappingStats?: MappingStats;
  validationStats?: ValidationStats;
  isProcessing?: boolean;
  allowNavigation?: boolean;
  showDetailed?: boolean;
}

export interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  mappingCount: number;
  mappings?: FieldMapping[];
}

// Component prop interfaces
export interface UploadStepProps {
  uploadedFiles: UploadedFile[];
  onFileUpload: (file: File) => Promise<void>;
  onProcessFile: (file: UploadedFile) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface StagingStepProps {
  fileData: {
    headers: string[];
    rows: string[][];
    totalRows: number;
    fileName: string;
    fileType: 'csv' | 'excel';
    columnTypes: Array<{
      name: string;
      type: string;
      sample: string[];
      nullCount: number;
      confidence: number;
      patterns?: string[];
      suggestions?: string[];
      detectedPatterns?: string[];
    }>;
  };
  isProcessing?: boolean;
  onNext: () => void;
  onBack: () => void;
}

export interface MappingStepProps extends BaseStepProps {
  fileData: FileData;
  fieldMappings: FieldMapping[];
  availableFields: DatabaseField[];
  onUpdateMapping: MappingUpdateCallback;
  onAddCustomField?: FieldCreationCallback;
  onSaveMappingTemplate?: TemplateSaveCallback;
  onLoadMappingTemplate?: TemplateCallback;
  mappingTemplates?: TemplateMetadata[];
}

export interface ReviewStepProps {
  fileData: FileData | null;
  fieldMappings: FieldMapping[];
  validationResults: ValidationResult[];
  currentFile: {
    original_filename: string;
    upload_status: string;
    total_rows: number;
    file_id: string;
    upload_id: number;
    uploaded_at: string;
  };
  onDeploy: () => Promise<boolean>;
  onBack: () => void;
  isDeploying?: boolean;
}

export interface DeployStepProps {
  currentFile: {
    upload_id: number;
    file_id: string;
    original_filename: string;
    file_size: number;
    file_type: string;
    upload_status: string;
    total_rows: number;
    uploaded_at: string;
    processed_at?: string;
    error_message?: string;
    mapping_config?: string;
    uploaded_by?: number;
    id?: string;
    file_path?: string;
    updated_at?: string;
    case_id?: string;
    user_id?: string;
  };
  deploymentStats?: {
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    tablesUpdated: string[];
    startTime: string;
    endTime?: string;
    estimatedDuration?: number;
  };
  onStartNewImport: () => void;
  onViewData: () => void;
  onDownloadReport: () => void;
  onBack?: () => void;
  isDeploying?: boolean;
  deploymentProgress?: number;
}

// Hook return type
export interface UseDataManagementReturn {
  // State
  uploadedFiles: UploadedFile[];
  fileData: FileData | null;
  currentFile: UploadedFile | null;
  fieldMappings: FieldMapping[];
  validationResults: ValidationResult[];
  currentStep: WorkflowStep;
  isUploading: boolean;
  isProcessing: boolean;
  isValidating: boolean;
  isDeploying: boolean;
  error: string | null;
  success: string | null;
  uploadProgress: number;
  validationProgress: number; // ADDED: Missing property
  availableFields: DatabaseField[];

  // Actions
  handleFileUpload: (file: File) => Promise<UploadedFile>; // FIXED: Return type
  handleProcessFile: (file: UploadedFile) => Promise<boolean>;
  handleUpdateMapping: (
    sourceColumn: string,
    targetTable: string,
    targetField: string
  ) => void;
  handleAddCustomField: (field: DatabaseField) => void;
  handleValidation: (settings?: ValidationSettings) => Promise<boolean>; // FIXED: Added settings parameter
  handleDeployment: () => Promise<boolean>;
  handleStepNavigation: (step: WorkflowStep) => void;
  clearError: () => void;
  clearSuccess: () => void;
}
