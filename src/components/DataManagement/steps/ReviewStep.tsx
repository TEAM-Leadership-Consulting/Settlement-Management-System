// src/components/DataManagement/steps/ReviewStep.tsx
'use client';

import React, { useState, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Database,
  FileCheck,
  Shield,
  Rocket,
  Settings,
  Info,
  Activity,
} from 'lucide-react';
import {
  FileData,
  FieldMapping,
  ValidationResult,
} from '@/types/dataManagement';

interface ReviewStepProps {
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
  onDeploy: () => void;
  onBack: () => void;
  isDeploying?: boolean;
}

interface DeploymentSettings {
  createBackup: boolean;
  runFinalValidation: boolean;
  enableRollback: boolean;
  notifyOnCompletion: boolean;
  batchSize: number;
  validateDuplicates: boolean;
  preserveExistingData: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  fileData,
  fieldMappings,
  validationResults,
  currentFile,
  onDeploy,
  onBack,
  isDeploying = false,
}) => {
  const [deploymentSettings, setDeploymentSettings] =
    useState<DeploymentSettings>({
      createBackup: true,
      runFinalValidation: true,
      enableRollback: true,
      notifyOnCompletion: false,
      batchSize: 1000,
      validateDuplicates: true,
      preserveExistingData: true,
    });

  const [deploymentNotes, setDeploymentNotes] = useState('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [confirmationChecks, setConfirmationChecks] = useState({
    dataReviewed: false,
    mappingsVerified: false,
    settingsConfirmed: false,
    backupAcknowledged: false,
  });

  // Calculate deployment summary
  const deploymentSummary = useMemo(() => {
    if (!fileData || !currentFile) return null;

    const mappedFields = fieldMappings.filter(
      (m) => m.targetTable && m.targetField
    );
    const targetTables = Array.from(
      new Set(mappedFields.map((m) => m.targetTable))
    );
    const hasErrors = validationResults.some((r) => r.errors.length > 0);
    const hasWarnings = validationResults.some((r) => r.warnings.length > 0);
    const customFields = mappedFields.filter(
      (m) =>
        // Check if field is custom (this would need to be passed from parent or calculated)
        m.targetField.includes('custom_') || false
    );

    // Estimate deployment time based on record count
    const estimatedMinutes = Math.ceil(currentFile.total_rows / 10000) * 2; // 2 min per 10k records
    const estimatedDuration =
      estimatedMinutes < 1
        ? '< 1 minute'
        : estimatedMinutes < 60
        ? `${estimatedMinutes} minutes`
        : `${Math.ceil(estimatedMinutes / 60)} hours`;

    return {
      totalRecords: currentFile.total_rows,
      mappedFields: mappedFields.length,
      targetTables: targetTables.length,
      tableNames: targetTables,
      hasErrors,
      hasWarnings,
      customFields: customFields.length,
      estimatedDuration,
      validationStatus: hasErrors
        ? 'failed'
        : hasWarnings
        ? 'warnings'
        : 'passed',
      readyForDeployment: !hasErrors && mappedFields.length > 0,
    };
  }, [fileData, fieldMappings, validationResults, currentFile]);

  // Calculate deployment readiness
  const isReadyForDeployment = useMemo(() => {
    return (
      deploymentSummary?.readyForDeployment &&
      Object.values(confirmationChecks).every(Boolean)
    );
  }, [deploymentSummary, confirmationChecks]);

  // Handle confirmation check changes
  const updateConfirmationCheck = (
    key: keyof typeof confirmationChecks,
    value: boolean
  ) => {
    setConfirmationChecks((prev) => ({ ...prev, [key]: value }));
  };

  // Handle deployment settings changes
  const updateDeploymentSetting = <K extends keyof DeploymentSettings>(
    key: K,
    value: DeploymentSettings[K]
  ) => {
    setDeploymentSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Generate deployment preview data
  const previewData = useMemo(() => {
    if (!fileData) return [];

    return fileData.headers.slice(0, 10).map((header, index) => {
      const mapping = fieldMappings.find((m) => m.sourceColumn === header);
      const sampleValue = fileData.rows[0]?.[index];

      return {
        sourceColumn: header,
        sampleValue: sampleValue ? String(sampleValue).substring(0, 30) : '',
        targetField:
          mapping?.targetTable && mapping?.targetField
            ? `${mapping.targetTable}.${mapping.targetField}`
            : 'Not mapped',
        isMapped: !!(mapping?.targetTable && mapping?.targetField),
      };
    });
  }, [fileData, fieldMappings]);

  if (!deploymentSummary || !currentFile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No data available for review.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Validation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Deployment Review
          </CardTitle>
          <CardDescription>
            Final review and confirmation before deploying data to production
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {deploymentSummary.totalRecords.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Records to Import
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {deploymentSummary.mappedFields}
              </div>
              <div className="text-sm text-muted-foreground">Mapped Fields</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {deploymentSummary.targetTables}
              </div>
              <div className="text-sm text-muted-foreground">Target Tables</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {deploymentSummary.estimatedDuration}
              </div>
              <div className="text-sm text-muted-foreground">Est. Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Status */}
      {deploymentSummary.validationStatus !== 'passed' && (
        <Alert
          variant={
            deploymentSummary.validationStatus === 'failed'
              ? 'destructive'
              : 'default'
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">
              {deploymentSummary.validationStatus === 'failed'
                ? 'Validation Errors Found'
                : 'Validation Warnings Present'}
            </div>
            {deploymentSummary.hasErrors && (
              <p className="text-sm">
                Critical errors must be resolved before deployment. Please
                return to the validation step.
              </p>
            )}
            {deploymentSummary.hasWarnings && !deploymentSummary.hasErrors && (
              <p className="text-sm">
                Warnings detected but deployment can proceed. Review the
                validation results carefully.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Review Content */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
          <TabsTrigger value="settings">Deployment Settings</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileCheck className="h-5 w-5 mr-2" />
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Filename:</span>
                  <span className="font-medium">
                    {currentFile.original_filename}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Records:</span>
                  <span className="font-medium">
                    {deploymentSummary.totalRecords.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-medium">
                    {fileData
                      ? `${fileData.headers.length} columns`
                      : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="font-medium">
                    {new Date(currentFile.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary">{currentFile.upload_status}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Mapping Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Mapping Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mapped Fields:</span>
                  <span className="font-medium">
                    {deploymentSummary.mappedFields}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target Tables:</span>
                  <span className="font-medium">
                    {deploymentSummary.targetTables}
                  </span>
                </div>
                {deploymentSummary.customFields > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Custom Fields:
                    </span>
                    <span className="font-medium text-blue-600">
                      {deploymentSummary.customFields}
                    </span>
                  </div>
                )}
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Tables to be updated:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {deploymentSummary.tableNames.map((table) => (
                      <Badge key={table} variant="outline" className="text-xs">
                        {table.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Results Summary */}
          {validationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="font-semibold text-green-600">
                      {
                        validationResults.filter((r) => r.errors.length === 0)
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded">
                    <div className="font-semibold text-yellow-600">
                      {validationResults.reduce(
                        (sum, r) => sum + r.warnings.length,
                        0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Warnings
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded">
                    <div className="font-semibold text-red-600">
                      {validationResults.reduce(
                        (sum, r) => sum + r.errors.length,
                        0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Field Mappings Tab */}
        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Overview</CardTitle>
              <CardDescription>
                Review all field mappings before deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {fieldMappings
                    .filter((m) => m.targetTable && m.targetField)
                    .map((mapping, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium text-sm">
                              {mapping.sourceColumn}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Source column from {currentFile.original_filename}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">
                            {mapping.targetTable}.{mapping.targetField}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {mapping.required && (
                              <Badge
                                variant="destructive"
                                className="text-xs mr-1"
                              >
                                Required
                              </Badge>
                            )}
                            Database field
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Preview of how your data will be imported (first 10 columns)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left font-medium">
                        Source Column
                      </th>
                      <th className="border border-border p-2 text-left font-medium">
                        Sample Data
                      </th>
                      <th className="border border-border p-2 text-left font-medium">
                        Target Field
                      </th>
                      <th className="border border-border p-2 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="border border-border p-2 font-mono text-sm">
                          {row.sourceColumn}
                        </td>
                        <td className="border border-border p-2 text-sm max-w-32 truncate">
                          {row.sampleValue || '-'}
                        </td>
                        <td className="border border-border p-2 text-sm font-mono">
                          {row.targetField}
                        </td>
                        <td className="border border-border p-2">
                          {row.isMapped ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mapped
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Unmapped
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deployment Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Deployment Configuration
              </CardTitle>
              <CardDescription>
                Configure deployment options and safety measures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Safety Options */}
              <div>
                <h4 className="font-medium mb-3">Safety & Backup Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="createBackup"
                      checked={deploymentSettings.createBackup}
                      onCheckedChange={(checked) =>
                        updateDeploymentSetting('createBackup', !!checked)
                      }
                    />
                    <Label htmlFor="createBackup" className="text-sm">
                      Create database backup before deployment
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableRollback"
                      checked={deploymentSettings.enableRollback}
                      onCheckedChange={(checked) =>
                        updateDeploymentSetting('enableRollback', !!checked)
                      }
                    />
                    <Label htmlFor="enableRollback" className="text-sm">
                      Enable automatic rollback on critical errors
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="runFinalValidation"
                      checked={deploymentSettings.runFinalValidation}
                      onCheckedChange={(checked) =>
                        updateDeploymentSetting('runFinalValidation', !!checked)
                      }
                    />
                    <Label htmlFor="runFinalValidation" className="text-sm">
                      Run final validation during deployment
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Data Processing Options */}
              <div>
                <h4 className="font-medium mb-3">Data Processing Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="validateDuplicates"
                      checked={deploymentSettings.validateDuplicates}
                      onCheckedChange={(checked) =>
                        updateDeploymentSetting('validateDuplicates', !!checked)
                      }
                    />
                    <Label htmlFor="validateDuplicates" className="text-sm">
                      Check for duplicate records during import
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preserveExistingData"
                      checked={deploymentSettings.preserveExistingData}
                      onCheckedChange={(checked) =>
                        updateDeploymentSetting(
                          'preserveExistingData',
                          !!checked
                        )
                      }
                    />
                    <Label htmlFor="preserveExistingData" className="text-sm">
                      Preserve existing data (append mode)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifyOnCompletion"
                      checked={deploymentSettings.notifyOnCompletion}
                      onCheckedChange={(checked) =>
                        updateDeploymentSetting('notifyOnCompletion', !!checked)
                      }
                    />
                    <Label htmlFor="notifyOnCompletion" className="text-sm">
                      Send email notification when deployment completes
                    </Label>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
                </Button>

                {showAdvancedSettings && (
                  <div className="mt-4 p-4 border rounded-lg space-y-4">
                    <div>
                      <Label
                        htmlFor="batchSize"
                        className="text-sm font-medium"
                      >
                        Batch Size (records per transaction)
                      </Label>
                      <input
                        id="batchSize"
                        type="number"
                        min="100"
                        max="10000"
                        step="100"
                        value={deploymentSettings.batchSize}
                        onChange={(e) =>
                          updateDeploymentSetting(
                            'batchSize',
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1 w-full px-3 py-1 border rounded text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Smaller batches are safer but slower. Recommended:
                        1000-5000
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Deployment Notes */}
              <div>
                <Label
                  htmlFor="deploymentNotes"
                  className="text-sm font-medium"
                >
                  Deployment Notes (Optional)
                </Label>
                <Textarea
                  id="deploymentNotes"
                  placeholder="Add any notes about this deployment..."
                  value={deploymentNotes}
                  onChange={(e) => setDeploymentNotes(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Final Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Deployment Confirmation
          </CardTitle>
          <CardDescription>
            Please confirm the following before proceeding with deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dataReviewed"
                checked={confirmationChecks.dataReviewed}
                onCheckedChange={(checked) =>
                  updateConfirmationCheck('dataReviewed', !!checked)
                }
              />
              <Label htmlFor="dataReviewed" className="text-sm">
                I have reviewed the data and field mappings
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mappingsVerified"
                checked={confirmationChecks.mappingsVerified}
                onCheckedChange={(checked) =>
                  updateConfirmationCheck('mappingsVerified', !!checked)
                }
              />
              <Label htmlFor="mappingsVerified" className="text-sm">
                I have verified that all field mappings are correct
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="settingsConfirmed"
                checked={confirmationChecks.settingsConfirmed}
                onCheckedChange={(checked) =>
                  updateConfirmationCheck('settingsConfirmed', !!checked)
                }
              />
              <Label htmlFor="settingsConfirmed" className="text-sm">
                I have configured the deployment settings appropriately
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="backupAcknowledged"
                checked={confirmationChecks.backupAcknowledged}
                onCheckedChange={(checked) =>
                  updateConfirmationCheck('backupAcknowledged', !!checked)
                }
              />
              <Label htmlFor="backupAcknowledged" className="text-sm">
                I understand this will modify the production database
              </Label>
            </div>
          </div>

          {deploymentSummary.hasWarnings && !deploymentSummary.hasErrors && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Proceeding with warnings. Please ensure you have reviewed all
                validation warnings.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isDeploying}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Validation
        </Button>

        <Button
          onClick={onDeploy}
          disabled={
            !isReadyForDeployment || isDeploying || deploymentSummary.hasErrors
          }
          className="bg-green-600 hover:bg-green-700"
        >
          {isDeploying ? (
            <>
              <Activity className="h-4 w-4 mr-2 animate-pulse" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4 mr-2" />
              Deploy to Production
            </>
          )}
          {deploymentSummary.totalRecords && (
            <Badge variant="secondary" className="ml-2">
              {deploymentSummary.totalRecords.toLocaleString()} records
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};
