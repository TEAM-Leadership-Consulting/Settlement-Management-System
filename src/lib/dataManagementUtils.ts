// src/lib/dataManagement.ts

export interface FileData {
  headers: string[];
  rows: unknown[][];
  totalRows: number;
  fileName: string;
  fileType: 'csv' | 'excel';
  columnTypes: ColumnType[];
}

export interface ColumnType {
  name: string;
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'boolean' | 'decimal';
  sample: unknown[];
  nullCount: number;
  confidence: number;
  detectedPatterns?: string[];
  suggestions?: string[];
}

export interface FieldMapping {
  sourceColumn: string;
  targetTable: string;
  targetField: string;
  transformation?: string;
  required: boolean;
  validated: boolean;
  confidence?: number;
}

export interface ValidationResult {
  field: string;
  errors: string[];
  warnings: string[];
  recordCount: number;
}

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
    | 'failed';
  total_rows: number | null;
  uploaded_at: string;
  processed_at?: string;
  error_message?: string;
  mapping_config?: string;
}

export type WorkflowStep =
  | 'upload'
  | 'staging'
  | 'mapping'
  | 'validation'
  | 'review'
  | 'deploy';

// File processing utilities
export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];

  return (
    allowedTypes.includes(file.type) ||
    file.name.toLowerCase().endsWith('.csv') ||
    file.name.toLowerCase().endsWith('.xlsx') ||
    file.name.toLowerCase().endsWith('.xls')
  );
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// CSV parsing utility
export const parseCSVContent = (
  csvText: string
): { headers: string[]; rows: string[][] } => {
  const lines = csvText.split('\n').filter((line) => line.trim());

  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]);
  const dataLines = lines.slice(1);
  const rows = dataLines.map((line) => parseCSVLine(line));

  return { headers, rows };
};

// Data type detection utilities
export const detectDataType = (
  values: string[]
): { type: ColumnType['type']; confidence: number } => {
  if (values.length === 0) {
    return { type: 'text', confidence: 0 };
  }

  const nonEmptyValues = values.filter((val) => val && val.trim() !== '');
  if (nonEmptyValues.length === 0) {
    return { type: 'text', confidence: 0 };
  }

  // Email detection
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailMatches = nonEmptyValues.filter((val) =>
    emailPattern.test(val)
  ).length;
  if (emailMatches / nonEmptyValues.length > 0.7) {
    return { type: 'email', confidence: emailMatches / nonEmptyValues.length };
  }

  // Phone detection
  const phoneMatches = nonEmptyValues.filter((val) => {
    const cleaned = val.replace(/[-.\s\(\)\+]/g, '');
    return /^\d{10,15}$/.test(cleaned);
  }).length;
  if (phoneMatches / nonEmptyValues.length > 0.7) {
    return { type: 'phone', confidence: phoneMatches / nonEmptyValues.length };
  }

  // Date detection
  const dateMatches = nonEmptyValues.filter(
    (val) => !isNaN(Date.parse(val))
  ).length;
  if (dateMatches / nonEmptyValues.length > 0.7) {
    return { type: 'date', confidence: dateMatches / nonEmptyValues.length };
  }

  // Number detection
  const numberMatches = nonEmptyValues.filter((val) => {
    const cleaned = val.replace(/[$,\s]/g, '');
    return !isNaN(Number(cleaned)) && cleaned !== '';
  }).length;
  if (numberMatches === nonEmptyValues.length) {
    // Check if decimal
    const hasDecimals = nonEmptyValues.some((val) => val.includes('.'));
    return {
      type: hasDecimals ? 'decimal' : 'number',
      confidence: 1,
    };
  }

  // Boolean detection
  const booleanValues = new Set([
    'true',
    'false',
    'yes',
    'no',
    '1',
    '0',
    'y',
    'n',
  ]);
  const booleanMatches = nonEmptyValues.filter((val) =>
    booleanValues.has(val.toLowerCase())
  ).length;
  if (booleanMatches / nonEmptyValues.length > 0.8) {
    return {
      type: 'boolean',
      confidence: booleanMatches / nonEmptyValues.length,
    };
  }

  // Default to text
  return { type: 'text', confidence: 0.8 };
};

// Field mapping utilities
export const generateFieldId = (table: string, field: string): string => {
  return `${table}.${field}`;
};

export const parseFieldId = (
  fieldId: string
): { table: string; field: string } => {
  const [table, field] = fieldId.split('.');
  return { table, field };
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[-.\s\(\)\+]/g, '');
  return /^\d{10,15}$/.test(cleaned);
};

export const validateDate = (date: string): boolean => {
  return !isNaN(Date.parse(date));
};

export const validateNumber = (value: string): boolean => {
  const cleaned = value.replace(/[$,\s]/g, '');
  return !isNaN(Number(cleaned)) && cleaned !== '';
};

// Data quality scoring
export const calculateDataQuality = (
  columnTypes: ColumnType[],
  validationResults: ValidationResult[]
): number => {
  if (columnTypes.length === 0) return 0;

  const confidenceSum = columnTypes.reduce(
    (sum, col) => sum + col.confidence,
    0
  );
  const avgConfidence = confidenceSum / columnTypes.length;

  const errorCount = validationResults.reduce(
    (sum, result) => sum + result.errors.length,
    0
  );
  const warningCount = validationResults.reduce(
    (sum, result) => sum + result.warnings.length,
    0
  );

  const totalIssues = errorCount + warningCount * 0.5; // Warnings count as half
  const maxIssues = columnTypes.length * 2; // Assume max 2 issues per column

  const issueScore = Math.max(0, 1 - totalIssues / maxIssues);

  return (avgConfidence + issueScore) / 2;
};

// Template utilities
export interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  mappings: FieldMapping[];
  createdAt: string;
  updatedAt: string;
}

export const serializeMappingTemplate = (
  name: string,
  description: string,
  mappings: FieldMapping[]
): MappingTemplate => {
  return {
    id: generateTemplateId(),
    name,
    description,
    mappings: mappings.filter((m) => m.targetTable && m.targetField),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const generateTemplateId = (): string => {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Progress calculation utilities
export const calculateMappingProgress = (mappings: FieldMapping[]): number => {
  if (mappings.length === 0) return 0;
  const mapped = mappings.filter((m) => m.targetTable && m.targetField).length;
  return Math.round((mapped / mappings.length) * 100);
};

export const calculateValidationProgress = (
  mappings: FieldMapping[],
  validationResults: ValidationResult[]
): number => {
  const mappedFields = mappings.filter(
    (m) => m.targetTable && m.targetField
  ).length;
  if (mappedFields === 0) return 0;

  const validatedFields = validationResults.length;
  return Math.round((validatedFields / mappedFields) * 100);
};

// Error handling utilities
export const createValidationError = (
  field: string,
  message: string,
  recordCount: number = 0
): ValidationResult => {
  return {
    field,
    errors: [message],
    warnings: [],
    recordCount,
  };
};

export const createValidationWarning = (
  field: string,
  message: string,
  recordCount: number = 0
): ValidationResult => {
  return {
    field,
    errors: [],
    warnings: [message],
    recordCount,
  };
};

// Data transformation utilities
export const cleanColumnName = (name: string): string => {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
};

export const normalizeValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

// File status utilities
export const getNextStatus = (
  currentStatus: UploadedFile['upload_status']
): UploadedFile['upload_status'] => {
  const statusFlow: Record<
    UploadedFile['upload_status'],
    UploadedFile['upload_status']
  > = {
    uploaded: 'staged',
    staged: 'mapped',
    mapped: 'validated',
    validated: 'ready',
    ready: 'deployed',
    deployed: 'deployed',
    failed: 'failed',
  };

  return statusFlow[currentStatus] || currentStatus;
};

export const canProceedFromStatus = (
  status: UploadedFile['upload_status']
): boolean => {
  return !['deployed', 'failed'].includes(status);
};

// Export utility functions for external use
export const DataManagementUtils = {
  validateFileType,
  formatFileSize,
  parseCSVContent,
  detectDataType,
  generateFieldId,
  parseFieldId,
  validateEmail,
  validatePhone,
  validateDate,
  validateNumber,
  calculateDataQuality,
  serializeMappingTemplate,
  generateTemplateId,
  calculateMappingProgress,
  calculateValidationProgress,
  createValidationError,
  createValidationWarning,
  cleanColumnName,
  normalizeValue,
  getNextStatus,
  canProceedFromStatus,
};
