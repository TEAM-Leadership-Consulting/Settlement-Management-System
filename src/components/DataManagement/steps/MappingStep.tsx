// src/components/DataManagement/steps/MappingStep.tsx
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
  MapPin,
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
  Settings,
  Info,
} from 'lucide-react';
import { DatabaseField } from '@/constants/databaseSchema';
import { FieldMapping, FileData } from '@/types/dataManagement';
import { FieldMappingTable } from '../shared/FieldMappingTable';
import { DynamicFieldCreator } from '../shared/DynamicFieldCreator';

interface MappingStepProps {
  fileData: FileData;
  fieldMappings: FieldMapping[];
  availableFields: DatabaseField[];
  onUpdateMapping: (
    sourceColumn: string,
    targetTable: string,
    targetField: string
  ) => void;
  onAddCustomField: (field: DatabaseField) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveMappingTemplate?: (
    templateName: string,
    mappings: FieldMapping[]
  ) => void;
  onLoadMappingTemplate?: (templateId: string) => void;
  mappingTemplates?: Array<{
    id: string;
    name: string;
    description: string;
    createdAt: string;
  }>;
  isProcessing?: boolean;
}

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
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState('mapping');

  // Calculate mapping statistics
  const mappingStats = useMemo(() => {
    const total = fieldMappings.length;
    const mapped = fieldMappings.filter(
      (m) => m.targetTable && m.targetField
    ).length;
    const unmapped = total - mapped;
    const percentage = total > 0 ? Math.round((mapped / total) * 100) : 0;

    // Required field analysis
    const requiredFields = availableFields.filter((field) => field.required);
    const mappedRequiredFields = requiredFields.filter((requiredField) =>
      fieldMappings.some(
        (mapping) =>
          mapping.targetTable === requiredField.table &&
          mapping.targetField === requiredField.field
      )
    );
    const missingRequiredFields = requiredFields.filter(
      (requiredField) =>
        !fieldMappings.some(
          (mapping) =>
            mapping.targetTable === requiredField.table &&
            mapping.targetField === requiredField.field
        )
    );

    // Quality analysis
    const highConfidenceMappings = fieldMappings.filter(
      (m) =>
        m.confidence && m.confidence > 0.8 && m.targetTable && m.targetField
    ).length;

    const customFieldMappings = fieldMappings.filter(
      (m) =>
        m.targetTable &&
        m.targetField &&
        availableFields.find(
          (f) => f.table === m.targetTable && f.field === m.targetField
        )?.isCustomField
    ).length;

    return {
      total,
      mapped,
      unmapped,
      percentage,
      requiredFields: requiredFields.length,
      mappedRequiredFields: mappedRequiredFields.length,
      missingRequiredFields,
      highConfidenceMappings,
      customFieldMappings,
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
  const handleCreateField = (newField: DatabaseField) => {
    onAddCustomField(newField);

    // Auto-map if we have context
    if (fieldCreatorContext.sourceColumn) {
      onUpdateMapping(
        fieldCreatorContext.sourceColumn,
        newField.table,
        newField.field
      );
    }

    setIsFieldCreatorOpen(false);
    resetFieldCreatorContext();
  };

  // Open field creator with context
  const openFieldCreator = (
    sourceColumn?: string,
    suggestedType?: string,
    suggestedTable?: string
  ) => {
    setFieldCreatorContext({
      sourceColumn: sourceColumn || '',
      suggestedType: suggestedType || 'text',
      suggestedTable: suggestedTable || 'individual_parties',
    });
    setIsFieldCreatorOpen(true);
  };

  // Reset field creator context
  const resetFieldCreatorContext = () => {
    setFieldCreatorContext({
      sourceColumn: '',
      suggestedType: 'text',
      suggestedTable: 'individual_parties',
    });
  };

  // Auto-map unmapped fields
  const handleAutoMap = () => {
    fieldMappings
      .filter((mapping) => !mapping.targetTable || !mapping.targetField)
      .forEach((mapping) => {
        // Simple auto-mapping logic - find best match by name similarity
        const sourceColumnLower = mapping.sourceColumn
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

        const bestMatch = availableFields.find((field) => {
          const fieldNameLower = field.field
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
          return (
            sourceColumnLower.includes(fieldNameLower) ||
            fieldNameLower.includes(sourceColumnLower)
          );
        });

        if (bestMatch) {
          onUpdateMapping(
            mapping.sourceColumn,
            bestMatch.table,
            bestMatch.field
          );
        }
      });
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
      setShowSaveTemplate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Field Mapping Configuration
          </CardTitle>
          <CardDescription>
            Map your source columns to database fields. Create custom fields if
            needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mapping Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {mappingStats.mapped}
              </p>
              <p className="text-sm text-muted-foreground">Mapped</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {mappingStats.unmapped}
              </p>
              <p className="text-sm text-muted-foreground">Unmapped</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {mappingStats.percentage}%
              </p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {mappingStats.mappedRequiredFields}/
                {mappingStats.requiredFields}
              </p>
              <p className="text-sm text-muted-foreground">Required</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-teal-600">
                {mappingStats.highConfidenceMappings}
              </p>
              <p className="text-sm text-muted-foreground">High Confidence</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${mappingStats.percentage}%` }}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoMap}
              disabled={isProcessing || mappingStats.unmapped === 0}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-map Remaining ({mappingStats.unmapped})
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => openFieldCreator()}
              disabled={isProcessing}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Field
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isProcessing || mappingStats.mapped === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All Mappings
            </Button>

            {mappingTemplates.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('templates')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Templates ({mappingTemplates.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Alerts */}
      {mappingStats.missingRequiredFields.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Missing Required Fields:</div>
            <div className="space-y-1">
              {mappingStats.missingRequiredFields
                .slice(0, 5)
                .map((field, index) => (
                  <div key={index} className="text-sm">
                    • {field.table}.{field.field} - {field.description}
                  </div>
                ))}
              {mappingStats.missingRequiredFields.length > 5 && (
                <div className="text-sm text-muted-foreground">
                  + {mappingStats.missingRequiredFields.length - 5} more
                  required fields
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {mappingStats.customFieldMappings > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {mappingStats.customFieldMappings} custom field(s) will be created
            in your database schema.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
        </TabsList>

        {/* Field Mapping Tab */}
        <TabsContent value="mapping" className="space-y-4">
          <FieldMappingTable
            sourceColumns={fileData.headers}
            columnTypes={fileData.columnTypes}
            fieldMappings={fieldMappings}
            availableFields={availableFields}
            onUpdateMapping={onUpdateMapping}
            onCreateField={(
              sourceColumn: string | undefined,
              suggestedType: string | undefined
            ) => openFieldCreator(sourceColumn, suggestedType)}
            sampleData={sampleData}
            showSampleData={true}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Load Template */}
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
                            {template.description} •{' '}
                            {new Date(template.createdAt).toLocaleDateString()}
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

            {/* Save Template */}
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
                {!showSaveTemplate ? (
                  <Button
                    onClick={() => setShowSaveTemplate(true)}
                    disabled={mappingStats.mapped === 0 || isProcessing}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Save Current Mapping
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Input
                      placeholder="Template name..."
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSaveTemplate}
                        disabled={!templateName.trim()}
                        className="flex-1"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowSaveTemplate(false);
                          setTemplateName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Templates include field mappings and custom field definitions.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template List */}
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
                    {fieldMappings.slice(0, 10).map((mapping, index) => {
                      const sample = sampleData[mapping.sourceColumn]?.[0];
                      const isMapped =
                        mapping.targetTable && mapping.targetField;

                      return (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="border border-border p-2 font-mono text-sm">
                            {mapping.sourceColumn}
                          </td>
                          <td className="border border-border p-2 text-sm max-w-32 truncate">
                            {sample ? String(sample) : '-'}
                          </td>
                          <td className="border border-border p-2 text-sm">
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
        onClose={() => {
          setIsFieldCreatorOpen(false);
          resetFieldCreatorContext();
        }}
        onFieldCreated={handleCreateField}
        suggestedName={fieldCreatorContext.sourceColumn}
        suggestedType={fieldCreatorContext.suggestedType}
        suggestedTable={fieldCreatorContext.suggestedTable}
      />
    </div>
  );
};
