// src/components/DataManagement/steps/ValidationStep.tsx

'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Zap,
} from 'lucide-react';
import type {
  ValidationRule,
  DataType,
  ValidationStepProps,
} from '@/types/dataManagement';

interface ValidationResultWithDetails {
  field: string;
  row: number;
  rule: string;
  message: string;
  value?: unknown;
}

interface ValidationSummary {
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

// CORRECTED: Enhanced validation rule creation with postal code support
export const createValidationRules = (
  fieldName: string,
  dataType: DataType,
  isRequired: boolean = false
): ValidationRule[] => {
  const rules: ValidationRule[] = [];

  // Required field validation
  if (isRequired) {
    rules.push({
      field: fieldName,
      type: 'required',
      message: `${fieldName} is required`,
    });
  }

  // Type-specific validation rules
  switch (dataType) {
    case 'email':
      rules.push({
        field: fieldName,
        type: 'format',
        params: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
        message: `${fieldName} must be a valid email address`,
      });
      break;

    case 'phone':
      rules.push({
        field: fieldName,
        type: 'format',
        params: {
          pattern:
            '^(\\+?1?[-\\.\\s]?\\(?[0-9]{3}\\)?[-\\.\\s]?[0-9]{3}[-\\.\\s]?[0-9]{4}|\\([0-9]{3}\\)\\s?[0-9]{3}-[0-9]{4}|[0-9]{3}-[0-9]{3}-[0-9]{4})$',
          excludeZipLengths: true,
        },
        message: `${fieldName} must be a valid phone number (not a zip code)`,
      });
      break;

    case 'postal_code':
      rules.push({
        field: fieldName,
        type: 'postal_code',
        params: {
          formats: ['us_zip', 'canadian_postal', 'uk_postal'],
        },
        message: `${fieldName} must be a valid postal code`,
      });
      break;

    case 'date':
      rules.push({
        field: fieldName,
        type: 'format',
        params: { dateFormat: true },
        message: `${fieldName} must be a valid date`,
      });
      break;

    case 'number':
    case 'decimal':
      rules.push({
        field: fieldName,
        type: 'format',
        params: { numeric: true },
        message: `${fieldName} must be a valid number`,
      });
      break;

    case 'boolean':
      rules.push({
        field: fieldName,
        type: 'enum',
        params: {
          values: ['true', 'false', 'yes', 'no', '1', '0', 'y', 'n'],
        },
        message: `${fieldName} must be a boolean value`,
      });
      break;
  }

  return rules;
};

// CORRECTED: Complete validateValue function with postal code support
export const validateValue = (
  value: unknown,
  rules: ValidationRule[],
  rowIndex: number = 0
): ValidationResultWithDetails[] => {
  const results: ValidationResultWithDetails[] = [];
  const stringValue = value ? String(value).trim() : '';

  for (const rule of rules) {
    // Ensure field is always a string
    const fieldName = rule.field || 'unknown_field';

    switch (rule.type) {
      case 'required':
        if (!value || stringValue === '') {
          results.push({
            field: fieldName,
            row: rowIndex,
            rule: rule.type,
            message: rule.message,
            value,
          });
        }
        break;

      case 'format':
        if (stringValue && rule.params) {
          let isValid = true;

          if (rule.params.pattern) {
            const pattern = new RegExp(rule.params.pattern as string);

            if (rule.params.excludeZipLengths) {
              const cleaned = stringValue.replace(/[-.\s\(\)\+]/g, '');
              const isZipLength = cleaned.length === 5 || cleaned.length === 9;
              const isNumericOnly = /^\d+$/.test(cleaned);

              if (isZipLength && isNumericOnly) {
                isValid = false;
              } else {
                isValid = pattern.test(stringValue);
              }
            } else {
              isValid = pattern.test(stringValue);
            }
          }

          if (rule.params.dateFormat) {
            isValid = !isNaN(Date.parse(stringValue));
          }

          if (rule.params.numeric) {
            const cleaned = stringValue.replace(/[$,\s]/g, '');
            isValid = !isNaN(Number(cleaned)) && cleaned !== '';
          }

          if (!isValid) {
            results.push({
              field: fieldName,
              row: rowIndex,
              rule: rule.type,
              message: rule.message,
              value,
            });
          }
        }
        break;

      case 'postal_code':
        if (stringValue && rule.params?.formats) {
          let isValid = false;
          const formats = rule.params.formats as string[];

          for (const format of formats) {
            switch (format) {
              case 'us_zip':
                const cleaned = stringValue.replace(/[-\s]/g, '');
                if (/^\d{5}$/.test(cleaned) || /^\d{9}$/.test(cleaned)) {
                  isValid = true;
                }
                break;

              case 'canadian_postal':
                if (/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(stringValue)) {
                  isValid = true;
                }
                break;

              case 'uk_postal':
                if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(stringValue)) {
                  isValid = true;
                }
                break;
            }

            if (isValid) break;
          }

          if (!isValid) {
            results.push({
              field: fieldName,
              row: rowIndex,
              rule: rule.type,
              message: rule.message,
              value,
            });
          }
        }
        break;

      case 'enum':
        if (stringValue && rule.params?.values) {
          const validValues = rule.params.values as string[];
          const isValid = validValues.some(
            (validValue) =>
              stringValue.toLowerCase() === validValue.toLowerCase()
          );

          if (!isValid) {
            results.push({
              field: fieldName,
              row: rowIndex,
              rule: rule.type,
              message: rule.message,
              value,
            });
          }
        }
        break;

      case 'length':
        if (stringValue && rule.params) {
          const length = stringValue.length;
          let isValid = true;

          if (rule.params.min && length < (rule.params.min as number)) {
            isValid = false;
          }
          if (rule.params.max && length > (rule.params.max as number)) {
            isValid = false;
          }

          if (!isValid) {
            results.push({
              field: fieldName,
              row: rowIndex,
              rule: rule.type,
              message: rule.message,
              value,
            });
          }
        }
        break;

      case 'range':
        if (stringValue && rule.params) {
          const numValue = Number(stringValue.replace(/[$,\s]/g, ''));
          let isValid = true;

          if (!isNaN(numValue)) {
            if (rule.params.min && numValue < (rule.params.min as number)) {
              isValid = false;
            }
            if (rule.params.max && numValue > (rule.params.max as number)) {
              isValid = false;
            }
          } else {
            isValid = false;
          }

          if (!isValid) {
            results.push({
              field: fieldName,
              row: rowIndex,
              rule: rule.type,
              message: rule.message,
              value,
            });
          }
        }
        break;
    }
  }

  return results;
};

export const ValidationStep: React.FC<ValidationStepProps> = ({
  fieldMappings,
  validationResults,
  onValidate,
  onNext,
  onBack,
  isValidating = false,
}) => {
  // Calculate validation summary
  const validationSummary = useMemo((): ValidationSummary => {
    const mappedFields = fieldMappings.filter(
      (m) => m.targetTable && m.targetField
    );
    const totalFields = mappedFields.length;

    const errorFields = validationResults.filter(
      (r) => r.errors.length > 0
    ).length;
    const warningFields = validationResults.filter(
      (r) => r.warnings.length > 0 && r.errors.length === 0
    ).length;
    const passedFields = validationResults.filter(
      (r) => r.errors.length === 0 && r.warnings.length === 0
    ).length;
    const validatedFields = validationResults.length;

    const totalErrors = validationResults.reduce(
      (sum, r) => sum + r.errors.length,
      0
    );
    const totalWarnings = validationResults.reduce(
      (sum, r) => sum + r.warnings.length,
      0
    );

    const validationScore =
      totalFields > 0 ? (passedFields / totalFields) * 100 : 0;
    const canProceed = errorFields === 0 && validatedFields > 0;

    return {
      totalFields,
      validatedFields,
      passedFields,
      warningFields,
      errorFields,
      totalErrors,
      totalWarnings,
      validationScore,
      canProceed,
    };
  }, [fieldMappings, validationResults]);

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Data Validation
          </CardTitle>
          <CardDescription>
            Validate your field mappings and data quality before deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Validation Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {validationSummary.validatedFields}/
                {validationSummary.totalFields}
              </div>
              <div className="text-sm text-muted-foreground">Validated</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {validationSummary.passedFields}
              </div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {validationSummary.warningFields}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {validationSummary.errorFields}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(validationSummary.validationScore)}%
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
          </div>

          {/* Validation Progress */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Validation Progress</span>
              <span>{Math.round(validationSummary.validationScore)}%</span>
            </div>
            <Progress
              value={validationSummary.validationScore}
              className="h-2"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onValidate}
              disabled={isValidating || validationSummary.totalFields === 0}
              className="flex items-center"
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
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {validationSummary.errorFields > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Validation Errors Found</div>
            <p className="text-sm">
              {validationSummary.totalErrors} error(s) found in{' '}
              {validationSummary.errorFields} field(s). These must be resolved
              before deployment.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {validationSummary.warningFields > 0 &&
        validationSummary.errorFields === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Validation Warnings</div>
              <p className="text-sm">
                {validationSummary.totalWarnings} warning(s) found in{' '}
                {validationSummary.warningFields} field(s). Review these issues
                but deployment can proceed.
              </p>
            </AlertDescription>
          </Alert>
        )}

      {validationSummary.canProceed &&
        validationSummary.warningFields === 0 &&
        validationResults.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Validation Successful!</div>
              <p className="text-sm">
                All {validationSummary.passedFields} field(s) passed validation.
                Your data is ready for deployment.
              </p>
            </AlertDescription>
          </Alert>
        )}

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Validation Results ({validationResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {validationResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      result.errors.length > 0
                        ? 'border-red-200 bg-red-50'
                        : result.warnings.length > 0
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-sm">
                            {result.field}
                          </h4>
                          {result.errors.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {result.errors.length} Error(s)
                            </Badge>
                          )}
                          {result.warnings.length > 0 &&
                            result.errors.length === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {result.warnings.length} Warning(s)
                              </Badge>
                            )}
                          {result.errors.length === 0 &&
                            result.warnings.length === 0 && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Passed
                              </Badge>
                            )}
                        </div>

                        {/* Errors */}
                        {result.errors.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-red-600 mb-1">
                              Errors:
                            </div>
                            <ul className="text-xs text-red-600 space-y-1">
                              {result.errors.map((error, idx) => (
                                <li key={idx}>
                                  •{' '}
                                  {typeof error === 'object' &&
                                  error !== null &&
                                  'message' in error
                                    ? String(error.message)
                                    : String(error)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Warnings */}
                        {result.warnings.length > 0 && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-yellow-600 mb-1">
                              Warnings:
                            </div>
                            <ul className="text-xs text-yellow-600 space-y-1">
                              {result.warnings.map((warning, idx) => (
                                <li key={idx}>
                                  •{' '}
                                  {typeof warning === 'object' &&
                                  warning !== null &&
                                  'message' in warning
                                    ? String(warning.message)
                                    : String(warning)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="text-right text-xs text-muted-foreground ml-4">
                        <div>
                          Records: {result.recordCount.toLocaleString()}
                        </div>
                        {result.errors.length === 0 &&
                          result.warnings.length === 0 && (
                            <div className="text-green-600 mt-1">✓ Valid</div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {validationResults.length === 0 && !isValidating && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Validate</h3>
              <p className="text-muted-foreground mb-6">
                Click &quot;Run Validation&quot; to check your field mappings
                and data quality
              </p>
              <Button
                onClick={onValidate}
                disabled={validationSummary.totalFields === 0}
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Validation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing State */}
      {isValidating && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium mb-2">Running Validation</h3>
              <p className="text-muted-foreground mb-4">
                Validating {validationSummary.totalFields} field mappings...
              </p>
              <div className="max-w-xs mx-auto">
                <Progress value={66} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  This may take a few moments for large datasets
                </p>
              </div>
            </div>
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

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isValidating}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mapping
        </Button>

        <Button
          onClick={onNext}
          disabled={!validationSummary.canProceed || isValidating}
        >
          Continue to Review
          <ArrowRight className="h-4 w-4 ml-2" />
          {validationSummary.validatedFields > 0 && (
            <Badge variant="secondary" className="ml-2">
              {validationSummary.passedFields} passed
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};
