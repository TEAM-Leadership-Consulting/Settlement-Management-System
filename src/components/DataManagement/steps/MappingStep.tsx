// src/components/DataManagement/steps/MappingStep.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Wand2,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Download,
  Upload,
  Eye,
} from 'lucide-react';
import { FieldMappingTable } from '@/components/DataManagement/shared/FieldMappingTable';
import { DynamicFieldCreator } from '@/components/DataManagement/shared/DynamicFieldCreator';
import type { MappingStepProps } from '@/types/dataManagement';

export const MappingStep: React.FC<MappingStepProps> = ({
  fileData,
  fieldMappings,
  availableFields,
  onUpdateMapping,
  onAddCustomField,
  onNext,
  onBack,
  onSaveMappingTemplate,
  onLoadMappingTemplate,
  mappingTemplates = [],
  isProcessing = false,
}) => {
  const [isFieldCreatorOpen, setIsFieldCreatorOpen] = useState(false);
  const [fieldCreatorContext, setFieldCreatorContext] = useState({
    sourceColumn: '',
    suggestedType: 'text',
    suggestedTable: 'individual_parties',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateName, setTemplateName] = useState('');
  const [activeTab, setActiveTab] = useState('mapping');
  const [isInitialMappingDone, setIsInitialMappingDone] = useState(false);

  // Simple field matching function
  const findFieldMatch = useCallback(
    (sourceColumn: string) => {
      const normalizedSource = sourceColumn
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      for (const field of availableFields) {
        const normalizedField = field.field
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

        // Exact match
        if (normalizedSource === normalizedField) {
          return { field, confidence: 1.0 };
        }

        // Partial match for common patterns
        if (
          (normalizedSource.includes('first') &&
            normalizedField.includes('first')) ||
          (normalizedSource.includes('last') &&
            normalizedField.includes('last')) ||
          (normalizedSource.includes('email') &&
            normalizedField.includes('email')) ||
          (normalizedSource.includes('phone') &&
            normalizedField.includes('phone')) ||
          (normalizedSource.includes('address') &&
            normalizedField.includes('address')) ||
          (normalizedSource.includes('city') &&
            normalizedField.includes('city')) ||
          (normalizedSource.includes('state') &&
            normalizedField.includes('state')) ||
          (normalizedSource.includes('zip') && normalizedField.includes('zip'))
        ) {
          return { field, confidence: 0.8 };
        }
      }

      return null;
    },
    [availableFields]
  );

  // Auto-generate mappings on component mount
  useEffect(() => {
    if (
      !isInitialMappingDone &&
      fileData?.headers &&
      availableFields.length > 0
    ) {
      fileData.headers.forEach((header) => {
        const match = findFieldMatch(header);
        if (match && match.field && match.confidence > 0.7) {
          onUpdateMapping(header, match.field.table, match.field.field);
        }
      });
      setIsInitialMappingDone(true);
    }
  }, [
    fileData?.headers,
    availableFields,
    isInitialMappingDone,
    onUpdateMapping,
    findFieldMatch,
  ]);

  // Calculate mapping statistics
  const mappingStats = useMemo(() => {
    const total = fieldMappings.length;
    const mapped = fieldMappings.filter(
      (m) => m.targetTable && m.targetField
    ).length;
    const unmapped = total - mapped;
    const percentage = total > 0 ? Math.round((mapped / total) * 100) : 0;

    const requiredFields = availableFields.filter((field) => field.required);
    const missingRequiredFields = requiredFields.filter(
      (requiredField) =>
        !fieldMappings.some(
          (mapping) =>
            mapping.targetTable === requiredField.table &&
            mapping.targetField === requiredField.field
        )
    );

    return {
      total,
      mapped,
      unmapped,
      percentage,
      missingRequiredFields,
      canProceed: missingRequiredFields.length === 0 && mapped > 0,
    };
  }, [fieldMappings, availableFields]);

  // Get sample data for each column
  const sampleData = useMemo(() => {
    const samples: Record<string, unknown[]> = {};
    fileData.headers.forEach((header, index) => {
      samples[header] = fileData.rows
        .slice(0, 5)
        .map((row) => row[index])
        .filter((val) => val != null && val !== '');
    });
    return samples;
  }, [fileData]);

  // Handle field creation
  const handleCreateField = (newField: {
    table: string;
    field: string;
    type: string;
    description: string;
    required: boolean;
    category: string;
  }) => {
    if (newField && onAddCustomField) {
      onAddCustomField(newField as never);
      if (fieldCreatorContext.sourceColumn) {
        onUpdateMapping(
          fieldCreatorContext.sourceColumn,
          newField.table,
          newField.field
        );
      }
    }
    setIsFieldCreatorOpen(false);
    setFieldCreatorContext({
      sourceColumn: '',
      suggestedType: 'text',
      suggestedTable: 'individual_parties',
    });
  };

  // Open field creator with context
  const openFieldCreator = (sourceColumn?: string, suggestedType?: string) => {
    setFieldCreatorContext({
      sourceColumn: sourceColumn || '',
      suggestedType: suggestedType || 'text',
      suggestedTable: 'individual_parties',
    });
    setIsFieldCreatorOpen(true);
  };

  // Auto-map unmapped fields
  const handleAutoMap = () => {
    if (fileData?.headers) {
      fileData.headers.forEach((header) => {
        const currentMapping = fieldMappings.find(
          (m) => m.sourceColumn === header
        );
        if (!currentMapping?.targetTable || !currentMapping?.targetField) {
          const match = findFieldMatch(header);
          if (match && match.field && match.confidence > 0.5) {
            onUpdateMapping(header, match.field.table, match.field.field);
          }
        }
      });
    }
  };

  // Clear all mappings
  const handleClearAll = () => {
    fieldMappings.forEach((mapping) => {
      onUpdateMapping(mapping.sourceColumn, '', '');
    });
  };

  // Load mapping template
  const handleLoadTemplate = () => {
    if (selectedTemplate && onLoadMappingTemplate) {
      onLoadMappingTemplate(selectedTemplate);
    }
  };

  // Save mapping template
  const handleSaveTemplate = () => {
    if (templateName.trim() && onSaveMappingTemplate) {
      onSaveMappingTemplate(templateName.trim(), fieldMappings);
      setTemplateName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning for missing required fields */}
      {mappingStats.missingRequiredFields.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Missing required fields:{' '}
            {mappingStats.missingRequiredFields
              .map((f) => `${f.table}.${f.field}`)
              .join(', ')}
            . Map these fields to continue or create custom fields if needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Success message for auto-mapping */}
      {mappingStats.mapped > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {mappingStats.mapped} fields were automatically mapped. Review and
            adjust mappings as needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mapping">
            Source to Target Field Mapping
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
        </TabsList>

        {/* Source to Target Field Mapping Tab */}
        <TabsContent value="mapping" className="space-y-4">
          {/* Quick Actions Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={handleAutoMap}
                    disabled={isProcessing}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Auto-map Remaining Fields
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    disabled={isProcessing}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All Mappings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openFieldCreator()}
                    disabled={isProcessing}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Field
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary" className="text-xs">
                    {mappingStats.mapped}/{mappingStats.total} mapped (
                    {mappingStats.percentage}%)
                  </Badge>
                  {mappingStats.missingRequiredFields.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {mappingStats.missingRequiredFields.length} required
                      fields missing
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Mapping Table */}
          <FieldMappingTable
            columnTypes={fileData.columnTypes}
            fieldMappings={fieldMappings as never}
            availableFields={availableFields}
            onUpdateMapping={onUpdateMapping}
            onCreateField={openFieldCreator}
            sampleData={sampleData}
            showSampleData={true}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Load Mapping Template
                </CardTitle>
                <CardDescription>
                  Apply a previously saved mapping configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {mappingTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleLoadTemplate}
                  disabled={!selectedTemplate || isProcessing}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Save Mapping Template
                </CardTitle>
                <CardDescription>
                  Save current mapping configuration for future use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    disabled={isProcessing}
                  />
                </div>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={
                    !templateName.trim() ||
                    mappingStats.mapped === 0 ||
                    isProcessing
                  }
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </CardContent>
            </Card>
          </div>

          {mappingTemplates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Existing Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mappingTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created{' '}
                          {new Date(template.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          handleLoadTemplate();
                        }}
                        disabled={isProcessing}
                      >
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Data Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Mapping Preview
              </CardTitle>
              <CardDescription>
                Preview how your data will be mapped to database fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">
                        Source Column
                      </th>
                      <th className="border border-border p-2 text-left">
                        Sample Data
                      </th>
                      <th className="border border-border p-2 text-left">
                        Target Field
                      </th>
                      <th className="border border-border p-2 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldMappings.slice(0, 10).map((mapping) => {
                      const isMapped =
                        mapping.targetTable && mapping.targetField;
                      const samples = sampleData[mapping.sourceColumn] || [];

                      return (
                        <tr
                          key={mapping.sourceColumn}
                          className="hover:bg-muted/50"
                        >
                          <td className="border border-border p-2 font-medium">
                            {mapping.sourceColumn}
                          </td>
                          <td className="border border-border p-2">
                            <div className="text-xs text-muted-foreground">
                              {samples.slice(0, 3).map((sample, i) => (
                                <div key={i} className="truncate max-w-[150px]">
                                  {String(sample)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="border border-border p-2">
                            {isMapped ? (
                              <span className="font-mono">
                                {mapping.targetTable}.{mapping.targetField}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Not mapped
                              </span>
                            )}
                          </td>
                          <td className="border border-border p-2">
                            {isMapped ? (
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
                      );
                    })}
                  </tbody>
                </table>
                {fieldMappings.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Showing 10 of {fieldMappings.length} columns
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Staging
        </Button>
        <Button
          onClick={onNext}
          disabled={!mappingStats.canProceed || isProcessing}
        >
          Continue to Validation
          <ArrowRight className="h-4 w-4 ml-2" />
          {mappingStats.mapped > 0 && (
            <Badge variant="secondary" className="ml-2">
              {mappingStats.mapped} mapped
            </Badge>
          )}
        </Button>
      </div>

      {/* Dynamic Field Creator Dialog */}
      <DynamicFieldCreator
        isOpen={isFieldCreatorOpen}
        onClose={() => setIsFieldCreatorOpen(false)}
        onFieldCreated={handleCreateField as never}
        suggestedName={fieldCreatorContext.sourceColumn}
        suggestedType={fieldCreatorContext.suggestedType}
        suggestedTable={fieldCreatorContext.suggestedTable}
      />
    </div>
  );
};
