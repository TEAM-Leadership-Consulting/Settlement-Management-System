'use client';

import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowRight,
  ArrowLeft,
  Settings,
  Shield,
  Database,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ValidationSettings {
  removeDuplicates: boolean;
  duplicateAction: 'skip' | 'error' | 'merge';
  validateEmails: boolean;
  validatePhones: boolean;
  validateDates: boolean;
  handleMissingData: 'skip' | 'error' | 'default';
  defaultValue: string;
  transformData: boolean;
  trimWhitespace: boolean;
  standardizeCase: 'none' | 'upper' | 'lower' | 'title';
  validatePostalCodes: boolean;
  validateCurrency: boolean;
  strictValidation: boolean;
  allowPartialMatches: boolean;
}

interface ValidationSettingsStepProps {
  onNext: () => void;
  onBack: () => void;
  settings?: ValidationSettings;
  onUpdateSettings?: (settings: ValidationSettings) => void;
  isProcessing?: boolean;
}

export const ValidationSettingsStep: React.FC<ValidationSettingsStepProps> = ({
  onNext,
  onBack,
  settings,
  onUpdateSettings,
  isProcessing = false,
}) => {
  const [validationSettings, setValidationSettings] =
    useState<ValidationSettings>(
      settings || {
        removeDuplicates: true,
        duplicateAction: 'skip',
        validateEmails: true,
        validatePhones: true,
        validateDates: true,
        handleMissingData: 'skip',
        defaultValue: '',
        transformData: true,
        trimWhitespace: true,
        standardizeCase: 'none',
        validatePostalCodes: true,
        validateCurrency: true,
        strictValidation: false,
        allowPartialMatches: true,
      }
    );

  const updateSetting = <K extends keyof ValidationSettings>(
    key: K,
    value: ValidationSettings[K]
  ) => {
    const newSettings = { ...validationSettings, [key]: value };
    setValidationSettings(newSettings);
    onUpdateSettings?.(newSettings);
  };

  const handleNext = () => {
    onUpdateSettings?.(validationSettings);
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Validation Settings
          </CardTitle>
          <CardDescription>
            Configure data validation rules and processing options
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="data-quality" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data-quality">Data Quality</TabsTrigger>
          <TabsTrigger value="validation">Validation Rules</TabsTrigger>
          <TabsTrigger value="transformations">Transformations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Data Quality Tab */}
        <TabsContent value="data-quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Handling</CardTitle>
              <CardDescription>
                Configure how to handle duplicate records in your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="removeDuplicates"
                  checked={validationSettings.removeDuplicates}
                  onCheckedChange={(checked) =>
                    updateSetting('removeDuplicates', !!checked)
                  }
                />
                <label
                  htmlFor="removeDuplicates"
                  className="text-sm font-medium"
                >
                  Remove duplicate records
                </label>
              </div>

              {validationSettings.removeDuplicates && (
                <div className="ml-6 space-y-2">
                  <label className="text-sm text-muted-foreground">
                    When duplicates are found:
                  </label>
                  <Select
                    value={validationSettings.duplicateAction}
                    onValueChange={(value: 'skip' | 'error' | 'merge') =>
                      updateSetting('duplicateAction', value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip duplicates</SelectItem>
                      <SelectItem value="error">Stop with error</SelectItem>
                      <SelectItem value="merge">
                        Merge duplicate data
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Missing Data Handling</CardTitle>
              <CardDescription>
                Configure how to handle missing or empty values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  When required data is missing:
                </label>
                <Select
                  value={validationSettings.handleMissingData}
                  onValueChange={(value: 'skip' | 'error' | 'default') =>
                    updateSetting('handleMissingData', value)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip record</SelectItem>
                    <SelectItem value="error">Stop with error</SelectItem>
                    <SelectItem value="default">Use default value</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {validationSettings.handleMissingData === 'default' && (
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Default value for missing data:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter default value"
                    value={validationSettings.defaultValue}
                    onChange={(e) =>
                      updateSetting('defaultValue', e.target.value)
                    }
                    className="w-48 px-3 py-2 border rounded-md"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Rules Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Field Validation</CardTitle>
              <CardDescription>
                Enable validation for specific data types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validateEmails"
                    checked={validationSettings.validateEmails}
                    onCheckedChange={(checked) =>
                      updateSetting('validateEmails', !!checked)
                    }
                  />
                  <label htmlFor="validateEmails" className="text-sm">
                    Validate email addresses
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validatePhones"
                    checked={validationSettings.validatePhones}
                    onCheckedChange={(checked) =>
                      updateSetting('validatePhones', !!checked)
                    }
                  />
                  <label htmlFor="validatePhones" className="text-sm">
                    Validate phone numbers
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validateDates"
                    checked={validationSettings.validateDates}
                    onCheckedChange={(checked) =>
                      updateSetting('validateDates', !!checked)
                    }
                  />
                  <label htmlFor="validateDates" className="text-sm">
                    Validate date formats
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validatePostalCodes"
                    checked={validationSettings.validatePostalCodes}
                    onCheckedChange={(checked) =>
                      updateSetting('validatePostalCodes', !!checked)
                    }
                  />
                  <label htmlFor="validatePostalCodes" className="text-sm">
                    Validate postal codes
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="validateCurrency"
                    checked={validationSettings.validateCurrency}
                    onCheckedChange={(checked) =>
                      updateSetting('validateCurrency', !!checked)
                    }
                  />
                  <label htmlFor="validateCurrency" className="text-sm">
                    Validate currency amounts
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validation Strictness</CardTitle>
              <CardDescription>
                Configure how strict the validation should be
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
                <label htmlFor="strictValidation" className="text-sm">
                  Strict validation (fail on any error)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowPartialMatches"
                  checked={validationSettings.allowPartialMatches}
                  onCheckedChange={(checked) =>
                    updateSetting('allowPartialMatches', !!checked)
                  }
                />
                <label htmlFor="allowPartialMatches" className="text-sm">
                  Allow partial matches for text fields
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transformations Tab */}
        <TabsContent value="transformations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Transformations</CardTitle>
              <CardDescription>
                Configure automatic data transformations during import
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transformData"
                  checked={validationSettings.transformData}
                  onCheckedChange={(checked) =>
                    updateSetting('transformData', !!checked)
                  }
                />
                <label htmlFor="transformData" className="text-sm font-medium">
                  Enable data transformations
                </label>
              </div>

              {validationSettings.transformData && (
                <div className="ml-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trimWhitespace"
                      checked={validationSettings.trimWhitespace}
                      onCheckedChange={(checked) =>
                        updateSetting('trimWhitespace', !!checked)
                      }
                    />
                    <label htmlFor="trimWhitespace" className="text-sm">
                      Trim whitespace from text fields
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm">Standardize text case:</label>
                    <Select
                      value={validationSettings.standardizeCase}
                      onValueChange={(
                        value: 'none' | 'upper' | 'lower' | 'title'
                      ) => updateSetting('standardizeCase', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No change</SelectItem>
                        <SelectItem value="upper">UPPERCASE</SelectItem>
                        <SelectItem value="lower">lowercase</SelectItem>
                        <SelectItem value="title">Title Case</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Options</CardTitle>
              <CardDescription>
                Advanced settings for data processing and validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  These settings are for advanced users. Incorrect configuration
                  may cause data import issues.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Processing Options
                  </h4>
                  <div className="space-y-2 ml-4">
                    <div className="text-sm text-muted-foreground">
                      • Batch size: 1000 records per batch
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • Timeout: 30 seconds per batch
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • Memory limit: 500MB
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Error Handling</h4>
                  <div className="space-y-2 ml-4">
                    <div className="text-sm text-muted-foreground">
                      • Maximum errors before stopping: 100
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • Generate error report: Enabled
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • Rollback on failure: Enabled
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Settings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  validationSettings.removeDuplicates ? 'default' : 'secondary'
                }
              >
                {validationSettings.removeDuplicates ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                Duplicates
              </Badge>
              <span className="text-sm text-muted-foreground">
                {validationSettings.removeDuplicates
                  ? validationSettings.duplicateAction
                  : 'Allowed'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  validationSettings.validateEmails ? 'default' : 'secondary'
                }
              >
                {validationSettings.validateEmails ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                Email
              </Badge>
              <span className="text-sm text-muted-foreground">
                {validationSettings.validateEmails
                  ? 'Validated'
                  : 'Not validated'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  validationSettings.transformData ? 'default' : 'secondary'
                }
              >
                {validationSettings.transformData ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                Transform
              </Badge>
              <span className="text-sm text-muted-foreground">
                {validationSettings.transformData ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  validationSettings.strictValidation
                    ? 'destructive'
                    : 'default'
                }
              >
                {validationSettings.strictValidation ? (
                  <Shield className="h-3 w-3 mr-1" />
                ) : (
                  <Database className="h-3 w-3 mr-1" />
                )}
                Mode
              </Badge>
              <span className="text-sm text-muted-foreground">
                {validationSettings.strictValidation ? 'Strict' : 'Flexible'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Mapping
        </Button>
        <Button onClick={handleNext} disabled={isProcessing}>
          Continue to Validation
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
