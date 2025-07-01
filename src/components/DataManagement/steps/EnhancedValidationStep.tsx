// src/components/DataManagement/steps/EnhancedValidationStep.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  Settings,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  RefreshCw,
  Copy,
  AlertCircle,
  Clock,
} from 'lucide-react';

// Types - matching your existing interfaces
interface ValidationSettings {
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

interface EnhancedValidationStepProps {
  fieldMappings: Array<{
    sourceColumn: string;
    targetTable: string;
    targetField: string;
    required: boolean;
    validated: boolean;
    confidence?: number;
  }>;
  validationResults: Array<{
    field: string;
    errors: Array<string | { message: string }>;
    warnings: Array<string | { message: string }>;
    recordCount: number;
    validCount?: number;
  }>;
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

// Replace the existing useValidationTimeEstimate function (lines 139-184) with this optimized version:

const useValidationTimeEstimate = (
  fileData: { totalRows: number } | null,
  validationSettings: {
    validateEmails: boolean;
    validatePhones: boolean;
    validateDates: boolean;
    validatePostalCodes: boolean;
    validateCurrency: boolean;
    validateSSN: boolean;
    validateTaxId: boolean;
    enableDuplicateDetection: boolean;
    duplicateMatchType: '100_percent' | 'fuzzy' | 'custom';
    sampleValidation: boolean;
    sampleSize: number;
    batchSize: number;
  }
): number => {
  return useMemo((): number => {
    if (!fileData) return 60000; // 1 minute default

    const rows = fileData.totalRows;

    // Apply sample reduction first
    const effectiveRows = validationSettings.sampleValidation
      ? Math.ceil(rows * (validationSettings.sampleSize / 100))
      : rows;

    const activeValidations = [
      validationSettings.validateEmails,
      validationSettings.validatePhones,
      validationSettings.validateDates,
      validationSettings.validatePostalCodes,
      validationSettings.validateCurrency,
      validationSettings.validateSSN,
      validationSettings.validateTaxId,
    ].filter(Boolean).length;

    let totalSeconds = 0;

    // Field validation time (much faster with optimizations)
    if (activeValidations > 0) {
      const validationTime = effectiveRows / 10000; // 10k rows per second
      totalSeconds += validationTime * activeValidations;
    }

    // Optimized duplicate detection time
    if (validationSettings.enableDuplicateDetection) {
      let duplicateTime: number;

      if (validationSettings.duplicateMatchType === 'fuzzy') {
        // Fuzzy matching is still expensive but much better than before
        duplicateTime = effectiveRows / 1000; // 1k rows per second
      } else {
        // Exact matching with hash map optimization - much faster!
        duplicateTime = effectiveRows / 15000; // 15k rows per second
      }

      totalSeconds += duplicateTime;
    }

    // Batch processing overhead
    const numberOfBatches = Math.ceil(
      effectiveRows / (validationSettings.batchSize || 1000)
    );
    const batchOverhead = numberOfBatches * 0.1; // 100ms per batch
    totalSeconds += batchOverhead;

    // Add 20% safety margin for browser performance variability
    totalSeconds = totalSeconds * 1.2;

    // Convert to milliseconds and ensure minimum of 10 seconds
    return Math.max(10000, Math.ceil(totalSeconds * 1000));
  }, [fileData, validationSettings]);
};
const SmoothValidationProgress: React.FC<{
  isValidating: boolean;
  actualProgress: number;
  estimatedTimeMs: number;
  fileData: {
    headers: string[];
    rows: string[][];
    totalRows: number;
  } | null;
  validationSettings: ValidationSettings;
}> = ({
  isValidating,
  actualProgress,
  estimatedTimeMs,
  fileData,
  validationSettings,
}) => {
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when validation starts
  useEffect(() => {
    if (isValidating && actualProgress === 0) {
      setSmoothProgress(0);
      setTimeElapsed(0);
      startTimeRef.current = Date.now();
    }
  }, [isValidating, actualProgress]);

  // Smooth progress calculation
  useEffect(() => {
    if (!isValidating) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      setTimeElapsed(elapsed);

      // Calculate time-based progress (never exceeds 95% until actual completion)
      const timeBasedProgress = Math.min(95, (elapsed / estimatedTimeMs) * 100);

      // Calculate stage-based progress zones
      const getStageProgress = () => {
        if (actualProgress >= 100) return 100;
        if (actualProgress >= 75) {
          // In the final heavy processing stage (75-100%)
          const stageProgress = 75 + (timeBasedProgress - 75) * 0.23;
          return Math.min(98, stageProgress);
        }
        if (actualProgress >= 50) {
          // In data conversion stage (50-75%)
          const stageProgress = 50 + (timeBasedProgress - 50) * 0.5;
          return Math.min(75, Math.max(actualProgress, stageProgress));
        }
        if (actualProgress >= 25) {
          // In setup stage (25-50%)
          const stageProgress = 25 + (timeBasedProgress - 25) * 0.5;
          return Math.min(50, Math.max(actualProgress, stageProgress));
        }
        // Initial stage (0-25%)
        return Math.min(25, Math.max(actualProgress, timeBasedProgress));
      };

      const newProgress = getStageProgress();
      setSmoothProgress(newProgress);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isValidating, actualProgress, estimatedTimeMs]);

  // Format time remaining
  const getTimeRemaining = () => {
    if (!isValidating) return '';

    const remainingMs = Math.max(0, estimatedTimeMs - timeElapsed);
    const remainingMinutes = Math.ceil(remainingMs / 60000);

    if (remainingMinutes < 1) return '< 1 min remaining';
    if (remainingMinutes === 1) return '1 min remaining';
    return `${remainingMinutes} mins remaining`;
  };

  // Get current stage description
  const getCurrentStage = () => {
    if (actualProgress >= 100) return 'Validation complete!';
    if (actualProgress >= 75)
      return 'Running validation checks... (this may take a while)';
    if (actualProgress >= 50) return 'Converting data format...';
    if (actualProgress >= 25) return 'Setting up data validator...';
    return 'Initializing validation settings...';
  };

  if (!isValidating && actualProgress === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {actualProgress >= 100 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            )}
            <span className="font-medium">
              {actualProgress >= 100
                ? 'Validation Complete'
                : 'Validating Data'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{Math.round(smoothProgress)}%</Badge>
            {isValidating && actualProgress < 100 && (
              <Badge variant="outline" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {getTimeRemaining()}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Progress value={smoothProgress} className="w-full h-3" />
            <div className="absolute top-0 left-0 w-full h-3 pointer-events-none">
              {[25, 50, 75, 100].map((checkpoint) => (
                <div
                  key={checkpoint}
                  className={`absolute top-0 w-0.5 h-3 ${
                    actualProgress >= checkpoint
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                  style={{ left: `${checkpoint}%` }}
                />
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {getCurrentStage()}
          </div>

          <div className="text-sm text-muted-foreground">
            Processing{' '}
            {validationSettings?.sampleValidation ? 'sample of ' : ''}
            {fileData?.totalRows || 0} rows
          </div>
        </div>

        {actualProgress >= 75 && actualProgress < 100 && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <div className="text-sm">
              <div className="font-medium text-orange-800 mb-1">
                Heavy Processing Stage
              </div>
              <div className="text-orange-700">
                The validation is now processing duplicate detection and complex
                rules. This stage typically takes{' '}
                {Math.round((estimatedTimeMs * 0.6) / 60000)} -{' '}
                {Math.round((estimatedTimeMs * 0.8) / 60000)} minutes of the
                total validation time.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const EnhancedValidationStep: React.FC<EnhancedValidationStepProps> = ({
  fieldMappings,
  validationResults,
  fileData,
  onValidate,
  onNext,
  onBack,
  isValidating = false,
  validationProgress = 0,
}) => {
  const [validationSettings, setValidationSettings] =
    useState<ValidationSettings>({
      // Performance Optimizations - Auto-detect from mappings
      validateEmails: false,
      validatePhones: false,
      validateDates: false,
      validatePostalCodes: false,
      validateCurrency: false,
      validateSSN: false,
      validateTaxId: false,

      // Duplicate Detection
      enableDuplicateDetection: true,
      duplicateMatchType: '100_percent',
      duplicateAction: 'flag',
      duplicateColumns: [],
      fuzzyThreshold: 85,

      // Custom Duplicate Rules
      customDuplicateRules: {
        exactMatchColumns: [],
        fuzzyMatchColumns: [],
        ignoreColumns: [],
      },

      // Data Quality
      handleMissingData: 'skip',
      defaultValue: '',
      trimWhitespace: true,
      standardizeCase: 'none',
      removeSpecialCharacters: false,

      // Validation Strictness
      strictValidation: false,
      allowPartialMatches: true,
      skipEmptyFields: true,

      // Performance Settings
      batchSize: 1000,
      maxErrors: 100,
      sampleValidation: false,
      sampleSize: 10,
    });
  const estimatedTimeMs = useValidationTimeEstimate(
    fileData,
    validationSettings
  );
  // Auto-detect validation types needed based on field mappings
  const detectedValidationTypes = useMemo(() => {
    const types = {
      emails: 0,
      phones: 0,
      dates: 0,
      postalCodes: 0,
      currency: 0,
      ssn: 0,
      taxId: 0,
    };

    fieldMappings.forEach((mapping) => {
      const fieldName = mapping.targetField.toLowerCase();
      if (fieldName.includes('email')) types.emails++;
      if (fieldName.includes('phone')) types.phones++;
      if (fieldName.includes('date') || fieldName.includes('birth'))
        types.dates++;
      if (fieldName.includes('zip') || fieldName.includes('postal'))
        types.postalCodes++;
      if (
        fieldName.includes('amount') ||
        fieldName.includes('payment') ||
        fieldName.includes('cost')
      )
        types.currency++;
      if (fieldName.includes('ssn')) types.ssn++;
      if (fieldName.includes('ein') || fieldName.includes('tax_id'))
        types.taxId++;
    });

    return types;
  }, [fieldMappings]);

  // Available columns for duplicate detection
  const availableColumns = useMemo(() => {
    return fileData?.headers || [];
  }, [fileData]);

  // Validation summary
  const validationSummary = useMemo(() => {
    const mappedFields = fieldMappings.filter(
      (m) => m.targetTable && m.targetField
    );
    const totalFields = mappedFields.length;
    const errorFields = validationResults.filter(
      (r) => r.errors.length > 0
    ).length;
    const passedFields = validationResults.filter(
      (r) => r.errors.length === 0
    ).length;
    const canProceed = errorFields === 0 && validationResults.length > 0;

    return {
      totalFields,
      errorFields,
      passedFields,
      canProceed,
      validationScore: totalFields > 0 ? (passedFields / totalFields) * 100 : 0,
    };
  }, [fieldMappings, validationResults]);

  const activeValidations = useMemo(() => {
    return [
      validationSettings.validateEmails,
      validationSettings.validatePhones,
      validationSettings.validateDates,
      validationSettings.validatePostalCodes,
      validationSettings.validateCurrency,
      validationSettings.validateSSN,
      validationSettings.validateTaxId,
    ].filter(Boolean).length;
  }, [validationSettings]);

  // Auto-set validation settings based on detected types
  React.useEffect(() => {
    setValidationSettings((prev) => ({
      ...prev,
      validateEmails: detectedValidationTypes.emails > 0,
      validatePhones: detectedValidationTypes.phones > 0,
      validateDates: detectedValidationTypes.dates > 0,
      validatePostalCodes: detectedValidationTypes.postalCodes > 0,
      validateCurrency: detectedValidationTypes.currency > 0,
      validateSSN: detectedValidationTypes.ssn > 0,
      validateTaxId: detectedValidationTypes.taxId > 0,
    }));
  }, [detectedValidationTypes]);

  // Remove unused imports and variables
  const updateSetting = <K extends keyof ValidationSettings>(
    key: K,
    value: ValidationSettings[K]
  ) => {
    setValidationSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleValidate = async () => {
    await onValidate(validationSettings);
  };

  const addDuplicateColumn = (column: string) => {
    if (!validationSettings.duplicateColumns.includes(column)) {
      updateSetting('duplicateColumns', [
        ...validationSettings.duplicateColumns,
        column,
      ]);
    }
  };

  const removeDuplicateColumn = (column: string) => {
    updateSetting(
      'duplicateColumns',
      validationSettings.duplicateColumns.filter((col) => col !== column)
    );
  };

  // Rough estimation based on rows and active validations
  // Replace the getEstimatedTime function (lines 527-563) with this optimized version:

  const getEstimatedTime = () => {
    if (!fileData) return '< 1 minute';

    const rows = fileData.totalRows;

    // Apply sample reduction first
    const effectiveRows = validationSettings.sampleValidation
      ? Math.ceil(rows * (validationSettings.sampleSize / 100))
      : rows;

    const activeValidations = [
      validationSettings.validateEmails,
      validationSettings.validatePhones,
      validationSettings.validateDates,
      validationSettings.validatePostalCodes,
      validationSettings.validateCurrency,
      validationSettings.validateSSN,
      validationSettings.validateTaxId,
    ].filter(Boolean).length;

    let estimatedSeconds = 0;

    // Field validation time (optimized)
    if (activeValidations > 0) {
      const validationTime = effectiveRows / 10000; // Much faster now
      estimatedSeconds += validationTime * activeValidations;
    }

    // Optimized duplicate detection time
    if (validationSettings.enableDuplicateDetection) {
      let duplicateTime: number;

      if (validationSettings.duplicateMatchType === 'fuzzy') {
        duplicateTime = effectiveRows / 1000; // Still slower but manageable
      } else {
        duplicateTime = effectiveRows / 15000; // Much faster with hash optimization
      }

      estimatedSeconds += duplicateTime;
    }

    // Add processing overhead and safety margin
    estimatedSeconds = estimatedSeconds * 1.3; // 30% buffer

    // Format the time
    if (estimatedSeconds < 10) return '< 10 seconds';
    if (estimatedSeconds < 60) return `${Math.ceil(estimatedSeconds)} seconds`;
    if (estimatedSeconds < 300)
      return `${Math.ceil(estimatedSeconds / 60)} minute(s)`;
    return `${Math.ceil(estimatedSeconds / 60)} minutes`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Enhanced Validation
          </CardTitle>
          <CardDescription>
            Optimize validation performance by choosing which validations to run
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {validationSummary.totalFields}
              </div>
              <div className="text-sm text-muted-foreground">
                Fields to Validate
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {fileData?.totalRows || 0}
              </div>
              <div className="text-sm text-muted-foreground">Data Rows</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {getEstimatedTime()}
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated Time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Performance Optimization Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Validation Types
              </CardTitle>
              <CardDescription>
                Skip validations for data types not in your file to speed up
                processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="validateEmails"
                        checked={validationSettings.validateEmails}
                        onCheckedChange={(checked) =>
                          updateSetting('validateEmails', !!checked)
                        }
                      />
                      <Label htmlFor="validateEmails">Email Validation</Label>
                    </div>
                    <Badge
                      variant={
                        detectedValidationTypes.emails > 0
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {detectedValidationTypes.emails} fields
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="validatePhones"
                        checked={validationSettings.validatePhones}
                        onCheckedChange={(checked) =>
                          updateSetting('validatePhones', !!checked)
                        }
                      />
                      <Label htmlFor="validatePhones">Phone Validation</Label>
                    </div>
                    <Badge
                      variant={
                        detectedValidationTypes.phones > 0
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {detectedValidationTypes.phones} fields
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="validateDates"
                        checked={validationSettings.validateDates}
                        onCheckedChange={(checked) =>
                          updateSetting('validateDates', !!checked)
                        }
                      />
                      <Label htmlFor="validateDates">Date Validation</Label>
                    </div>
                    <Badge
                      variant={
                        detectedValidationTypes.dates > 0
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {detectedValidationTypes.dates} fields
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="validateCurrency"
                        checked={validationSettings.validateCurrency}
                        onCheckedChange={(checked) =>
                          updateSetting('validateCurrency', !!checked)
                        }
                      />
                      <Label htmlFor="validateCurrency">Currency/Amount</Label>
                    </div>
                    <Badge
                      variant={
                        detectedValidationTypes.currency > 0
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {detectedValidationTypes.currency} fields
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="validatePostalCodes"
                        checked={validationSettings.validatePostalCodes}
                        onCheckedChange={(checked) =>
                          updateSetting('validatePostalCodes', !!checked)
                        }
                      />
                      <Label htmlFor="validatePostalCodes">
                        ZIP/Postal Code
                      </Label>
                    </div>
                    <Badge
                      variant={
                        detectedValidationTypes.postalCodes > 0
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {detectedValidationTypes.postalCodes} fields
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sampleValidation"
                      checked={validationSettings.sampleValidation}
                      onCheckedChange={(checked) =>
                        updateSetting('sampleValidation', !!checked)
                      }
                    />
                    <Label htmlFor="sampleValidation">
                      Sample Validation ({validationSettings.sampleSize}%)
                    </Label>
                  </div>
                </div>
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Performance Tip:</strong> Disable validations for data
                  types not in your file. This can reduce processing time by
                  50-80% for large datasets.
                </AlertDescription>
              </Alert>
              {/* Performance Recommendations */}
              {fileData && fileData.totalRows > 50000 && (
                <Alert className="mt-4">
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>
                      Large Dataset Detected (
                      {fileData.totalRows.toLocaleString()} rows):
                    </strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      {!validationSettings.sampleValidation && (
                        <li>
                          • Consider enabling Sample Validation (10%) to reduce
                          processing time to ~
                          {Math.ceil((fileData.totalRows * 0.1) / 15000)}{' '}
                          seconds
                        </li>
                      )}
                      {validationSettings.enableDuplicateDetection &&
                        validationSettings.duplicateMatchType === 'fuzzy' && (
                          <li>
                            • Fuzzy matching on large datasets can be slow. Try
                            Exact Match first for faster results
                          </li>
                        )}
                      {(validationSettings.batchSize || 1000) < 2000 &&
                        fileData.totalRows > 100000 && (
                          <li>
                            • Increase batch size to 2000-5000 in Advanced
                            settings for better performance
                          </li>
                        )}
                      {activeValidations > 5 && (
                        <li>
                          • Consider disabling unused validation types to
                          improve speed
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Duplicate Detection Tab */}
        <TabsContent value="duplicates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Copy className="h-5 w-5 mr-2" />
                Duplicate Detection
              </CardTitle>
              <CardDescription>
                Configure how to detect and handle duplicate records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Two column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Controls */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableDuplicateDetection"
                      checked={validationSettings.enableDuplicateDetection}
                      onCheckedChange={(checked) =>
                        updateSetting('enableDuplicateDetection', !!checked)
                      }
                    />
                    <Label htmlFor="enableDuplicateDetection">
                      Enable duplicate detection
                    </Label>
                  </div>

                  {validationSettings.enableDuplicateDetection && (
                    <>
                      <div className="space-y-2">
                        <Label>Match Type</Label>
                        <Select
                          value={validationSettings.duplicateMatchType}
                          onValueChange={(
                            value: '100_percent' | 'fuzzy' | 'custom'
                          ) => updateSetting('duplicateMatchType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100_percent">
                              100% Exact Match
                            </SelectItem>
                            <SelectItem value="fuzzy">
                              Fuzzy Matching
                            </SelectItem>
                            <SelectItem value="custom">Custom Rules</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Action for Duplicates</Label>
                        <Select
                          value={validationSettings.duplicateAction}
                          onValueChange={(
                            value: 'skip' | 'error' | 'merge' | 'flag'
                          ) => updateSetting('duplicateAction', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flag">
                              Flag as Warning
                            </SelectItem>
                            <SelectItem value="skip">
                              Skip Duplicates
                            </SelectItem>
                            <SelectItem value="error">
                              Treat as Error
                            </SelectItem>
                            <SelectItem value="merge">Merge Records</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                {/* Right column - Dynamic descriptions */}
                <div className="space-y-4">
                  {!validationSettings.enableDuplicateDetection ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Duplicate Detection Disabled</strong>
                        <br />
                        No duplicate checking will be performed. This is faster
                        but won&apos;t catch duplicate records in your data.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {/* Match Type Description */}
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>
                            {validationSettings.duplicateMatchType ===
                              '100_percent' && '100% Exact Match'}
                            {validationSettings.duplicateMatchType ===
                              'fuzzy' && 'Fuzzy Matching'}
                            {validationSettings.duplicateMatchType ===
                              'custom' && 'Custom Rules'}
                          </strong>
                          <br />
                          {validationSettings.duplicateMatchType ===
                            '100_percent' &&
                            'Records must match exactly (case-sensitive). Fastest but may miss obvious duplicates due to typos or formatting differences.'}
                          {validationSettings.duplicateMatchType === 'fuzzy' &&
                            'Finds similar records even with typos or formatting differences. Slower but catches more duplicates (John Smith vs Jon Smith).'}
                          {validationSettings.duplicateMatchType === 'custom' &&
                            'Define specific rules for different field types. Some fields require exact matches (SSN) while others allow similarities (names).'}
                        </AlertDescription>
                      </Alert>

                      {/* Action Description */}
                      <Alert
                        variant={
                          validationSettings.duplicateAction === 'error'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>
                            {validationSettings.duplicateAction === 'flag' &&
                              'Flag as Warning'}
                            {validationSettings.duplicateAction === 'skip' &&
                              'Skip Duplicates'}
                            {validationSettings.duplicateAction === 'error' &&
                              'Treat as Error'}
                            {validationSettings.duplicateAction === 'merge' &&
                              'Merge Records'}
                          </strong>
                          <br />
                          {validationSettings.duplicateAction === 'flag' &&
                            'Import all records but show warnings for duplicates. Good when duplicates might be legitimate (family members).'}
                          {validationSettings.duplicateAction === 'skip' &&
                            'Automatically remove duplicate records, keeping only the first occurrence. Good for data cleaning.'}
                          {validationSettings.duplicateAction === 'error' &&
                            'Stop the import process if duplicates are found. Forces manual resolution. Best for critical unique fields (SSN, ID numbers).'}
                          {validationSettings.duplicateAction === 'merge' &&
                            'Attempt to combine duplicate records into a single record. Use with caution - may combine unrelated data.'}
                        </AlertDescription>
                      </Alert>

                      {/* Best Practices */}
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Top 4 Common Settings:</strong>
                          <br />
                          • Names/Addresses: Fuzzy + Flag as Warning
                          <br />
                          • Unique IDs (SSN): Exact + Treat as Error
                          <br />
                          • Email addresses: Exact + Skip Duplicates
                          <br />• Data cleanup: Any method + Skip Duplicates
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </div>

              {/* Column selection sections below the two-column layout */}
              {validationSettings.enableDuplicateDetection && (
                <>
                  {/* Custom Rules Configuration */}
                  {validationSettings.duplicateMatchType === 'custom' && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Custom Duplicate Rules Configuration
                      </div>

                      <div className="space-y-2">
                        <Label>Exact Match Columns (must be identical)</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                          {availableColumns.map((column) => (
                            <div
                              key={column}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`exact-${column}`}
                                checked={validationSettings.customDuplicateRules.exactMatchColumns.includes(
                                  column
                                )}
                                onCheckedChange={(checked) => {
                                  const current =
                                    validationSettings.customDuplicateRules
                                      .exactMatchColumns;
                                  updateSetting('customDuplicateRules', {
                                    ...validationSettings.customDuplicateRules,
                                    exactMatchColumns: checked
                                      ? [...current, column]
                                      : current.filter((c) => c !== column),
                                  });
                                }}
                              />
                              <Label
                                htmlFor={`exact-${column}`}
                                className="text-sm"
                              >
                                {column}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {validationSettings.customDuplicateRules
                          .exactMatchColumns.length === 0 && (
                          <div className="text-xs text-muted-foreground">
                            No exact match columns selected
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Fuzzy Match Columns (allow similarities)</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                          {availableColumns.map((column) => (
                            <div
                              key={column}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`fuzzy-${column}`}
                                checked={validationSettings.customDuplicateRules.fuzzyMatchColumns.includes(
                                  column
                                )}
                                onCheckedChange={(checked) => {
                                  const current =
                                    validationSettings.customDuplicateRules
                                      .fuzzyMatchColumns;
                                  updateSetting('customDuplicateRules', {
                                    ...validationSettings.customDuplicateRules,
                                    fuzzyMatchColumns: checked
                                      ? [...current, column]
                                      : current.filter((c) => c !== column),
                                  });
                                }}
                              />
                              <Label
                                htmlFor={`fuzzy-${column}`}
                                className="text-sm"
                              >
                                {column}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {validationSettings.customDuplicateRules
                          .fuzzyMatchColumns.length === 0 && (
                          <div className="text-xs text-muted-foreground">
                            No fuzzy match columns selected
                          </div>
                        )}
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Custom Rules:</strong> Records are duplicates
                          if ALL exact match columns are identical AND fuzzy
                          match columns are similar above the threshold.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Regular duplicate columns - only show for non-custom methods */}
                  {validationSettings.duplicateMatchType !== 'custom' && (
                    <div className="space-y-2 border-t pt-4">
                      <Label>Columns to Check for Duplicates</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                        {availableColumns.map((column) => (
                          <div
                            key={column}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`dup-${column}`}
                              checked={validationSettings.duplicateColumns.includes(
                                column
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  addDuplicateColumn(column);
                                } else {
                                  removeDuplicateColumn(column);
                                }
                              }}
                            />
                            <Label
                              htmlFor={`dup-${column}`}
                              className="text-sm"
                            >
                              {column}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {validationSettings.duplicateColumns.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          Select at least one column to check for duplicates
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Additional validation and performance options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="strictValidation"
                  checked={validationSettings.strictValidation}
                  onCheckedChange={(checked) =>
                    updateSetting('strictValidation', !!checked)
                  }
                />
                <Label htmlFor="strictValidation">
                  Strict validation (fail on any error)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trimWhitespace"
                  checked={validationSettings.trimWhitespace}
                  onCheckedChange={(checked) =>
                    updateSetting('trimWhitespace', !!checked)
                  }
                />
                <Label htmlFor="trimWhitespace">
                  Remove leading/trailing spaces
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxErrors">
                  Maximum Errors (stop after this many errors)
                </Label>
                <Input
                  id="maxErrors"
                  type="number"
                  min="1"
                  max="10000"
                  value={validationSettings.maxErrors}
                  onChange={(e) =>
                    updateSetting('maxErrors', parseInt(e.target.value) || 100)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Progress */}

      <SmoothValidationProgress
        isValidating={isValidating}
        actualProgress={validationProgress}
        estimatedTimeMs={estimatedTimeMs}
        fileData={fileData}
        validationSettings={validationSettings}
      />

      {/* Validation Results Summary */}
      {validationResults.length > 0 && !isValidating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validationSummary.passedFields}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {validationSummary.errorFields}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(validationSummary.validationScore)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Success Rate
                </div>
              </div>
            </div>

            {validationSummary.canProceed ? (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Validation Successful!</strong> All validations
                  passed. Your data is ready for deployment.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Validation Issues Found.</strong> Please review and
                  fix the errors before proceeding.
                </AlertDescription>
              </Alert>
            )}

            {/* Show validation results details */}
            {validationResults.length > 0 && (
              <div className="mt-4">
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {validationResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded ${
                          result.errors.length > 0
                            ? 'border-red-200 bg-red-50'
                            : result.warnings.length > 0
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-green-200 bg-green-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {result.field}
                          </span>
                          {result.errors.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {result.errors.length} errors
                            </Badge>
                          )}
                          {result.warnings.length > 0 &&
                            result.errors.length === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {result.warnings.length} warnings
                              </Badge>
                            )}
                          {result.errors.length === 0 &&
                            result.warnings.length === 0 && (
                              <Badge variant="default" className="text-xs">
                                ✓ Passed
                              </Badge>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Requirements Check */}
      {validationSummary.totalFields === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">No Field Mappings Found</div>
            <p className="text-sm">
              You need to complete field mapping before validation can be
              performed.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} disabled={isValidating}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mapping
        </Button>

        <div className="flex space-x-2">
          <Button
            onClick={handleValidate}
            disabled={isValidating || validationSummary.totalFields === 0}
            className="min-w-[120px]"
          >
            {isValidating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Validation
              </>
            )}
          </Button>

          {validationResults.length > 0 && (
            <Button
              onClick={onNext}
              disabled={!validationSummary.canProceed || isValidating}
            >
              Continue to Review
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
