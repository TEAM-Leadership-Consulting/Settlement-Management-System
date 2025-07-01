// src/components/DataManagement/steps/MappingStep.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
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
  isProcessing = false,
}) => {
  const [isFieldCreatorOpen, setIsFieldCreatorOpen] = useState(false);
  const [fieldCreatorContext, setFieldCreatorContext] = useState({
    sourceColumn: '',
    suggestedType: 'text',
    suggestedTable: 'individual_parties',
  });
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

      {/* Field Mapping Table */}
      <FieldMappingTable
        columnTypes={fileData.columnTypes.map((col) => ({
          name: col.name || col.column || '',
          type: col.type || col.detectedType || 'text',
          sample: (col.sample || col.samples || []).map((item) =>
            String(item || '')
          ),
          nullCount: col.nullCount || 0,
          confidence: col.confidence,
          patterns: col.patterns || col.detectedPatterns || [],
          suggestions: col.suggestions || [],
        }))}
        fieldMappings={fieldMappings as never}
        availableFields={availableFields}
        onUpdateMapping={onUpdateMapping}
        onCreateField={openFieldCreator}
        sampleData={sampleData}
        showSampleData={true}
      />

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
