// src/types/dataManagement.ts

// Core workflow types
export type WorkflowStep =
  | 'upload'
  | 'staging'
  | 'mapping'
  | 'validation'
  | 'review'
  | 'deploy';

export type UploadStatus =
  | 'uploaded'
  | 'staged'
  | 'mapped'
  | 'validated'
  | 'ready'
  | 'deployed'
  | 'failed';

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

export type DataQuality = 'excellent' | 'good' | 'fair' | 'poor';

export type FileType = 'csv' | 'excel';

// File and upload interfaces
export interface UploadedFile {
  upload_id: number;
  file_id: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  upload_status: UploadStatus;
  total_rows: number | null;
  uploaded_at: string;
  processed_at?: string;
  error_message?: string;
  mapping_config?: string;
  uploaded_by?: number;
}

export interface FileData {
  headers: string[];
  rows: unknown[][];
  totalRows: number;
  fileName: string;
  fileType: FileType;
  columnTypes: ColumnType[];
}

// Column analysis and detection
export interface ColumnType {
  name: string;
  column?: string;
  type: DataType | string;
  sample: unknown[];
  nullCount: number;
  confidence: number;
  detectedPatterns?: string[];
  patterns?: string[]; // ADDED: For compatibility with StagingStep
  suggestions?: string[];
  issues?: string[];
  qualityScore?: number;
}

export interface ColumnAnalysis extends ColumnType {
  uniqueCount: number;
  totalCount: number;
  dataQuality: DataQuality;
  issues: string[];
}

// Field mapping interfaces
export interface FieldMapping {
  sourceColumn: string;
  targetTable: string;
  targetField: string;
  transformation?: string;
  required: boolean;
  validated: boolean;
  confidence?: number;
  status?: 'mapped' | 'unmapped' | 'suggested';
}

export interface MappingRule {
  patterns: string[];
  targetTable: string;
  targetField: string;
  confidence: number;
  required?: boolean;
  transformation?: string;
}

export interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  mappings: FieldMapping[];
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  isPublic?: boolean;
  tags?: string[];
}

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

// Database schema related types (imported from constants)
import type { DatabaseField, DatabaseTable } from '@/constants/databaseSchema';
export type { DatabaseField, DatabaseTable };

// Validation interfaces
export interface ValidationRule {
  field: string;
  type: string;
  message: string;
  parameters?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

export interface ValidationIssue {
  row: number;
  column: string;
  severity: 'error' | 'warning';
  message: string;
  value?: unknown;
  suggestion?: string;
}

export interface ValidationResult {
  field: string;
  totalChecked: number;
  validCount: number;
  invalidCount: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: string[];
  recordCount: number;
}

export interface ValidationSettings {
  validateRequired: boolean;
  validateTypes: boolean;
  validateFormats: boolean;
  validateDuplicates: boolean;
  validateConstraints: boolean;
  strictMode: boolean;
  sampleSize: number;
}

export interface ValidationSummary {
  totalFields: number;
  validatedFields: number;
  passedFields: number;
  warningFields: number;
  errorFields: number;
  totalErrors: number;
  totalWarnings: number;
  validationScore: number;
  canProceed: boolean;
}

// Deployment interfaces
export interface DeploymentSettings {
  createBackup: boolean;
  runFinalValidation: boolean;
  enableRollback: boolean;
  notifyOnCompletion: boolean;
  batchSize: number;
  validateDuplicates: boolean;
  preserveExistingData: boolean;
}

export interface DeploymentStats {
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  tablesUpdated: string[];
  startTime: string;
  endTime?: string;
  estimatedDuration?: number;
}

export interface DeploymentMetrics {
  totalRecords: number;
  processedRecords: number;
  successRate: number;
  failedRecords: number;
  processingSpeed: number;
  estimatedTimeRemaining: number;
}

// Progress and statistics interfaces
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
  valid?: number; // ADDED: For compatibility with WorkflowProgress
  total?: number; // ADDED: For compatibility with WorkflowProgress
}

export interface ProcessingProgress {
  currentStep: WorkflowStep;
  stepProgress: number;
  overallProgress: number;
  estimatedTimeRemaining?: number;
}

// State management interfaces
export interface DataManagementState {
  // Data
  uploadedFiles: UploadedFile[];
  fileData: FileData | null;
  currentFile: UploadedFile | null;
  fieldMappings: FieldMapping[];
  validationResults: ValidationResult[];
  customFields: DatabaseField[];

  // UI State
  currentStep: WorkflowStep;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  success: string | null;
  uploadProgress: number;
}

// Error and response types
export interface DataManagementError {
  code: string;
  message: string;
  details?: unknown;
  field?: string;
  step?: WorkflowStep;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: DataManagementError;
  message?: string;
}

// Event and callback types
export type FileUploadCallback = (file: File) => Promise<void>;
export type FileProcessCallback = (file: UploadedFile) => Promise<void>;
export type MappingUpdateCallback = (
  sourceColumn: string,
  targetTable: string,
  targetField: string
) => void;
export type ValidationCallback = () => Promise<boolean>;
export type DeploymentCallback = () => Promise<boolean>;
export type StepNavigationCallback = (step: WorkflowStep) => void;
export type FieldCreationCallback = (field: DatabaseField) => void;
export type TemplateCallback = (templateId: string) => Promise<void>;
export type TemplateSaveCallback = (
  templateName: string,
  mappings: FieldMapping[]
) => Promise<void>;

// Component prop types
export interface BaseStepProps {
  onNext: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export interface UploadStepProps
  extends Omit<BaseStepProps, 'onNext' | 'onBack'> {
  uploadedFiles: UploadedFile[];
  onFileUpload: FileUploadCallback;
  onProcessFile: FileProcessCallback;
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface StagingStepProps extends BaseStepProps {
  fileData: FileData;
  onReprocessFile?: () => void;
}

export interface MappingStepProps extends BaseStepProps {
  fileData: FileData;
  fieldMappings: FieldMapping[];
  availableFields: DatabaseField[];
  onUpdateMapping: MappingUpdateCallback;
  onAddCustomField: FieldCreationCallback;
  onSaveMappingTemplate?: TemplateSaveCallback;
  onLoadMappingTemplate?: TemplateCallback;
  mappingTemplates?: TemplateMetadata[];
}

export interface ValidationStepProps extends BaseStepProps {
  fieldMappings: FieldMapping[];
  validationResults: ValidationResult[];
  onValidate: ValidationCallback;
  isValidating?: boolean;
}

export interface ReviewStepProps extends BaseStepProps {
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
  } | null;
  onDeploy: DeploymentCallback;
  isDeploying?: boolean;
}

export interface DeployStepProps {
  currentFile: {
    original_filename: string;
    upload_status: string;
    total_rows: number; // FIXED: Back to number (not nullable) to match actual component
    file_id: string;
    upload_id: number;
  };
  deploymentStats?: DeploymentStats;
  onStartNewImport: () => void;
  onViewData: () => void;
  onDownloadReport: () => void;
  onBack?: () => void;
  isDeploying?: boolean;
  deploymentProgress?: number;
}

export interface WorkflowProgressProps {
  currentStep: WorkflowStep;
  currentFile?: {
    original_filename: string;
    upload_status: string;
    total_rows?: number; // Changed from number | null to number | undefined
    uploaded_at: string;
    file_size?: number; // ADDED: Missing property
    file_type?: string; // ADDED: Missing property
  } | null;
  onStepClick?: (step: WorkflowStep) => void;
  mappingStats?: MappingStats;
  validationStats?: ValidationStats;
  isProcessing?: boolean;
  allowNavigation?: boolean;
  showDetailed?: boolean;
}

export interface FieldMappingTableProps {
  sourceColumns?: string[];
  columnTypes: ColumnType[];
  fieldMappings: FieldMapping[];
  availableFields: DatabaseField[];
  onUpdateMapping: (
    sourceColumn: string,
    targetTable: string,
    targetField: string
  ) => void;
  onCreateField?: (sourceColumn: string, suggestedType: string) => void;
  sampleData?: Record<string, unknown[]>;
  showSampleData?: boolean;
}

// Data quality interfaces
export interface DataQualityMetrics {
  overallScore: number;
  completenessScore: number;
  consistencyScore: number;
  validityScore: number;
  totalColumns: number;
  highQualityColumns: number;
  issuesFound: number;
  recommendations: string[];
}

// Utility types
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Filter and search types
export interface FilterOptions {
  type?: DataType | 'all';
  quality?: DataQuality | 'all';
  table?: string | 'all';
  required?: boolean;
  mapped?: boolean;
}

export interface SearchOptions {
  query: string;
  fields: ('name' | 'description' | 'table')[];
  caseSensitive?: boolean;
}

// Utility functions
export const parseMapping = (mappingString: string): FieldMapping[] => {
  try {
    return JSON.parse(mappingString) as FieldMapping[];
  } catch {
    return [];
  }
};

export const parseTableField = (
  combined: string
): { table: string; field: string } => {
  const [table, field] = combined.split('.');
  return { table: table || '', field: field || '' };
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[-.\s\(\)\+]/g, '');
  const excludeZipLengths = cleaned.length === 5 || cleaned.length === 9;
  const isValidLength =
    cleaned.length >= 10 && cleaned.length <= 15 && !excludeZipLengths;
  const isNumeric = /^\d+$/.test(cleaned);

  const phonePatterns = [
    /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
    /^\([0-9]{3}\)\s?[0-9]{3}[-.\s]?[0-9]{4}$/,
    /^[0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
  ];

  return (
    isValidLength &&
    isNumeric &&
    phonePatterns.some((pattern) => pattern.test(phone))
  );
};

export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const validateNumber = (value: string): boolean => {
  const cleaned = value.replace(/[$,\s]/g, '');
  return !isNaN(Number(cleaned)) && cleaned !== '';
};
