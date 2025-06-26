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
  name: string;
  column?: string;
  type: DataType | string;
  sample: string[];
  nullCount: number;
  confidence: number;
  detectedPatterns?: string[];
  patterns?: string[];
  suggestions?: string[];
  issues?: string[];
  qualityScore?: number;
}

export interface FileData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  fileName: string;
  fileType: 'csv' | 'excel';
  columnTypes: ColumnType[];
}

// FIXED: Made confidence and transformationRule optional
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
  errors: string[];
  warnings: string[];
  recordCount: number;
  validCount?: number;
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
  uploaded_at: string;
  processed_at?: string;
  error_message?: string;
  mapping_config?: string;
  uploaded_by?: number;
  // Additional optional properties
  id?: string;
  file_path?: string;
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
  fileData: FileData;
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

export interface ValidationStepProps {
  fieldMappings: FieldMapping[];
  validationResults: ValidationResult[];
  onValidate: () => Promise<boolean>;
  onNext: () => void;
  onBack: () => void;
  isValidating?: boolean;
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

// FIXED: Updated DeployStepProps to match actual component - includes all needed fields
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
  availableFields: DatabaseField[];

  // Actions
  handleFileUpload: (file: File) => Promise<boolean>;
  handleProcessFile: (file: UploadedFile) => Promise<boolean>;
  handleUpdateMapping: (
    sourceColumn: string,
    targetTable: string,
    targetField: string
  ) => void;
  handleAddCustomField: (field: DatabaseField) => void;
  handleValidation: () => Promise<boolean>;
  handleDeployment: () => Promise<boolean>;
  handleStepNavigation: (step: WorkflowStep) => void;
  clearError: () => void;
  clearSuccess: () => void;
}
