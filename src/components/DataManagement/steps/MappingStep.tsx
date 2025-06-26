// src/components/DataManagement/steps/MappingStep.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  MapPin,
  Database,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Plus,
} from 'lucide-react';

// Import types from shared types file instead of defining locally
import type { MappingStepProps } from '@/types/dataManagement';
import type { DatabaseField } from '@/constants/databaseSchema';

interface AutoMappingSuggestion {
  sourceColumn: string;
  targetTable: string;
  targetField: string;
  confidence: number;
  reason: string;
}

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
  const [activeTab, setActiveTab] = useState('mapping');
  const [autoMappingSuggestions, setAutoMappingSuggestions] = useState<
    AutoMappingSuggestion[]
  >([]);

  // Calculate mapping statistics
  const mappingStats = useMemo(() => {
    const mapped = fieldMappings.filter(
      (m) => m.targetTable && m.targetField
    ).length;
    const total = fieldMappings.length;
    return {
      mapped,
      unmapped: total - mapped,
      total,
      percentage: total > 0 ? Math.round((mapped / total) * 100) : 0,
    };
  }, [fieldMappings]);

  // Group available fields by table
  const fieldsByTable = useMemo(() => {
    return availableFields.reduce((acc, field) => {
      if (!acc[field.table]) {
        acc[field.table] = [];
      }
      acc[field.table].push(field);
      return acc;
    }, {} as Record<string, typeof availableFields>);
  }, [availableFields]);

  // Get sample data for preview
  const sampleData = useMemo(() => {
    return fileData.rows.slice(0, 5);
  }, [fileData.rows]);

  // Generate auto-mapping suggestions
  const generateAutoMappingSuggestions = useMemo(() => {
    const suggestions: AutoMappingSuggestion[] = [];

    fileData.headers.forEach((header) => {
      const columnType = fileData.columnTypes.find((ct) => ct.name === header);
      const headerLower = header.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // Smart mapping based on column names and types
      availableFields.forEach((field) => {
        const fieldLower = field.field.toLowerCase();
        const descLower = field.description.toLowerCase();

        let confidence = 0;
        let reason = '';

        // Exact name match
        if (headerLower === fieldLower) {
          confidence = 0.95;
          reason = 'Exact field name match';
        }
        // Partial name match
        else if (
          headerLower.includes(fieldLower) ||
          fieldLower.includes(headerLower)
        ) {
          confidence = 0.8;
          reason = 'Partial field name match';
        }
        // Description match
        else if (
          descLower.includes(headerLower) ||
          headerLower.includes(descLower.replace(/\s+/g, '_'))
        ) {
          confidence = 0.7;
          reason = 'Description match';
        }
        // Type-based matching
        else if (columnType && String(columnType.type) === field.type) {
          if (headerLower.includes('email') && field.type === 'email') {
            confidence = 0.9;
            reason = 'Email field type match';
          } else if (headerLower.includes('phone') && field.type === 'phone') {
            confidence = 0.9;
            reason = 'Phone field type match';
          } else if (headerLower.includes('date') && field.type === 'date') {
            confidence = 0.85;
            reason = 'Date field type match';
          } else if (headerLower.includes('zip') && field.type === 'text') {
            // postal_code might be stored as text
            confidence = 0.9;
            reason = 'Postal code type match';
          } else if (field.type === String(columnType.type)) {
            confidence = 0.6;
            reason = `Data type match (${field.type})`;
          }
        }

        // Common field patterns
        if (confidence === 0) {
          const commonMappings = {
            first_name: ['firstname', 'fname', 'first', 'given_name'],
            last_name: ['lastname', 'lname', 'last', 'surname', 'family_name'],
            email_address: ['email', 'mail', 'email_addr'],
            home_phone: ['phone', 'telephone', 'tel', 'phone_number'],
            street_address: ['address', 'addr', 'street', 'address_line_1'],
            city: ['city', 'town'],
            state: ['state', 'province', 'region'],
            zip_code: ['zip', 'postal', 'postcode', 'zipcode'],
            business_name: ['company', 'business', 'organization', 'org'],
            amount_due: ['amount', 'payment', 'balance', 'total'],
          };

          Object.entries(commonMappings).forEach(([targetField, patterns]) => {
            if (field.field === targetField) {
              patterns.forEach((pattern) => {
                if (headerLower.includes(pattern)) {
                  confidence = 0.75;
                  reason = `Common field pattern match (${pattern})`;
                }
              });
            }
          });
        }

        if (confidence > 0.5) {
          suggestions.push({
            sourceColumn: header,
            targetTable: field.table,
            targetField: field.field,
            confidence,
            reason,
          });
        }
      });
    });

    // Sort by confidence and keep only the best match per source column
    const bestSuggestions = fileData.headers
      .map((header) => {
        const headerSuggestions = suggestions
          .filter((s) => s.sourceColumn === header)
          .sort((a, b) => b.confidence - a.confidence);
        return headerSuggestions[0];
      })
      .filter(Boolean);

    return bestSuggestions;
  }, [fileData.headers, fileData.columnTypes, availableFields]);

  // Auto-apply high confidence mappings on load
  useEffect(() => {
    setAutoMappingSuggestions(generateAutoMappingSuggestions);

    // Auto-apply high confidence mappings (> 0.8)
    generateAutoMappingSuggestions.forEach((suggestion) => {
      if (suggestion.confidence > 0.8) {
        const existingMapping = fieldMappings.find(
          (m) => m.sourceColumn === suggestion.sourceColumn
        );
        if (
          !existingMapping ||
          (!existingMapping.targetTable && !existingMapping.targetField)
        ) {
          onUpdateMapping(
            suggestion.sourceColumn,
            suggestion.targetTable,
            suggestion.targetField
          );
        }
      }
    });
  }, [generateAutoMappingSuggestions, fieldMappings, onUpdateMapping]);

  // Apply auto-mapping suggestion
  const applyAutoMapping = (suggestion: AutoMappingSuggestion) => {
    onUpdateMapping(
      suggestion.sourceColumn,
      suggestion.targetTable,
      suggestion.targetField
    );
  };

  // Apply all auto-mapping suggestions
  const applyAllAutoMappings = () => {
    autoMappingSuggestions.forEach((suggestion) => {
      applyAutoMapping(suggestion);
    });
  };

  // Generate mapped data preview
  const mappedDataPreview = useMemo(() => {
    const activeMappings = fieldMappings.filter(
      (m) => m.targetTable && m.targetField
    );

    return sampleData.map((row, rowIndex) => {
      const mappedRow: Record<string, unknown> = { _rowNumber: rowIndex + 1 };

      activeMappings.forEach((mapping) => {
        const sourceIndex = fileData.headers.indexOf(mapping.sourceColumn);
        if (sourceIndex !== -1) {
          const key = `${mapping.targetTable}.${mapping.targetField}`;
          const rowArray = row as unknown[];
          mappedRow[key] = rowArray[sourceIndex] || '';
        }
      });

      return mappedRow;
    });
  }, [sampleData, fieldMappings, fileData.headers]);

  // Handle custom field creation - convert to DatabaseField format
  const handleCustomFieldCreation = (sourceColumn: string) => {
    if (onAddCustomField) {
      // Create a mock DatabaseField for the custom field
      const customField: DatabaseField = {
        table: 'individual_parties', // Default table
        field: sourceColumn.toLowerCase().replace(/\s+/g, '_'),
        type: 'text',
        required: false,
        description: `Custom field for ${sourceColumn}`,
        category: 'Custom',
        isCustomField: true,
      };
      onAddCustomField(customField);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Field Mapping
              </CardTitle>
              <CardDescription>
                Map your source data columns to database fields
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {mappingStats.mapped}/{mappingStats.total}
              </div>
              <div className="text-sm text-muted-foreground">Fields Mapped</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Mapping Progress</span>
              <span>{mappingStats.percentage}%</span>
            </div>
            <Progress value={mappingStats.percentage} className="h-2" />

            {/* Auto-mapping actions */}
            {autoMappingSuggestions.length > 0 && (
              <div className="flex items-center space-x-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyAllAutoMappings}
                  disabled={isProcessing}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Apply All Auto-Mappings ({autoMappingSuggestions.length})
                </Button>
                <span className="text-sm text-muted-foreground">
                  {
                    autoMappingSuggestions.filter((s) => s.confidence > 0.8)
                      .length
                  }{' '}
                  high confidence matches
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
        </TabsList>

        {/* Field Mapping Tab */}
        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Source to Target Field Mapping</CardTitle>
              <CardDescription>
                Map each source column to a target database field
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source Column</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Sample Data</TableHead>
                      <TableHead>Target Table</TableHead>
                      <TableHead>Target Field</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fieldMappings.map((mapping) => {
                      const columnType = fileData.columnTypes.find(
                        (ct) => ct.name === mapping.sourceColumn
                      );
                      const sourceIndex = fileData.headers.indexOf(
                        mapping.sourceColumn
                      );
                      const sampleValue =
                        sourceIndex !== -1
                          ? (fileData.rows[0] as unknown[])?.[sourceIndex]
                          : '';
                      const suggestion = autoMappingSuggestions.find(
                        (s) => s.sourceColumn === mapping.sourceColumn
                      );

                      return (
                        <TableRow key={mapping.sourceColumn}>
                          <TableCell className="font-medium">
                            <span>{mapping.sourceColumn}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {String(columnType?.type) || 'text'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-32 truncate">
                            <span>{String(sampleValue) || 'N/A'}</span>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={mapping.targetTable}
                              onValueChange={(table) => {
                                onUpdateMapping(
                                  mapping.sourceColumn,
                                  table,
                                  ''
                                );
                              }}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select table" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(fieldsByTable).map((table) => (
                                  <SelectItem key={table} value={table}>
                                    {table
                                      .replace(/_/g, ' ')
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={mapping.targetField}
                              onValueChange={(field) => {
                                onUpdateMapping(
                                  mapping.sourceColumn,
                                  mapping.targetTable,
                                  field
                                );
                              }}
                              disabled={!mapping.targetTable}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {mapping.targetTable &&
                                  fieldsByTable[mapping.targetTable]?.map(
                                    (field) => (
                                      <SelectItem
                                        key={field.field}
                                        value={field.field}
                                      >
                                        {field.description} ({field.field} -{' '}
                                        {field.type})
                                      </SelectItem>
                                    )
                                  )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {mapping.targetTable && mapping.targetField ? (
                              <Badge variant="default">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mapped
                              </Badge>
                            ) : suggestion ? (
                              <Badge variant="secondary">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Suggested
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Unmapped
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {suggestion &&
                                (!mapping.targetTable ||
                                  !mapping.targetField) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyAutoMapping(suggestion)}
                                    disabled={isProcessing}
                                    title={`${suggestion.reason} (${Math.round(
                                      suggestion.confidence * 100
                                    )}% confidence)`}
                                  >
                                    <Zap className="h-4 w-4 mr-1" />
                                    Auto
                                  </Button>
                                )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleCustomFieldCreation(
                                    mapping.sourceColumn
                                  )
                                }
                                disabled={
                                  !!mapping.targetTable && !!mapping.targetField
                                }
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Custom
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Auto-mapping suggestions */}
          {autoMappingSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Auto-Mapping Suggestions</CardTitle>
                <CardDescription>
                  Recommended field mappings based on column names and data
                  types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {autoMappingSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {suggestion.sourceColumn}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          → {suggestion.targetTable}.{suggestion.targetField}
                        </div>
                        <div className="text-xs text-blue-600">
                          {suggestion.reason} (
                          {Math.round(suggestion.confidence * 100)}% confidence)
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyAutoMapping(suggestion)}
                        disabled={isProcessing}
                      >
                        Apply
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
              {mappingStats.mapped > 0 ? (
                <div className="space-y-4">
                  {/* Mapping Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {mappingStats.mapped}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Mapped Fields
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {mappingStats.unmapped}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Unmapped Fields
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {fileData.totalRows}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Data Rows
                      </div>
                    </div>
                  </div>

                  {/* Mapped Data Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">#</TableHead>
                          {fieldMappings
                            .filter((m) => m.targetTable && m.targetField)
                            .map((mapping) => (
                              <TableHead
                                key={`${mapping.targetTable}.${mapping.targetField}`}
                              >
                                <div>
                                  <div className="font-medium">
                                    {mapping.targetField.replace(/_/g, ' ')}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {mapping.targetTable}
                                  </div>
                                </div>
                              </TableHead>
                            ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mappedDataPreview.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              <span>{String(row._rowNumber || index + 1)}</span>
                            </TableCell>
                            {fieldMappings
                              .filter((m) => m.targetTable && m.targetField)
                              .map((mapping) => {
                                const key = `${mapping.targetTable}.${mapping.targetField}`;
                                const value = row[key];
                                const displayValue =
                                  value != null ? String(value) : '';
                                return (
                                  <TableCell
                                    key={key}
                                    className="max-w-48 truncate"
                                  >
                                    {displayValue ? (
                                      displayValue
                                    ) : (
                                      <span className="text-muted-foreground italic">
                                        (empty)
                                      </span>
                                    )}
                                  </TableCell>
                                );
                              })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Showing preview of first 5 rows. All {fileData.totalRows}{' '}
                      rows will be processed during deployment.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Mappings Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Map some fields in the Field Mapping tab to see a preview of
                    your data.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('mapping')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Go to Field Mapping
                  </Button>
                </div>
              )}
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
          disabled={mappingStats.mapped === 0 || isProcessing}
        >
          Continue to Validation
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
