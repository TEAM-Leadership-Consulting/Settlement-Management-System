// src/components/DataManagement/shared/FieldMappingTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Plus,
  Search,
  Wand2,
  X,
  Info,
  Eye,
  EyeOff,
} from 'lucide-react';

// Define interfaces directly in this file
interface ColumnType {
  name: string;
  type: string;
  sample: string[];
  nullCount: number;
  confidence: number;
  patterns?: string[];
  suggestions?: string[];
  detectedPatterns?: string[];
  qualityScore?: number;
  issues?: string[];
  column?: string;
}

interface FieldMapping {
  sourceColumn: string;
  targetTable: string;
  targetField: string;
  required: boolean;
  validated: boolean;
  confidence: number;
  transformationRule?: string;
}

interface DatabaseField {
  table: string;
  field: string;
  type: string;
  description: string;
  required?: boolean;
  category?: string;
}

interface FieldMappingTableProps {
  columnTypes?: ColumnType[];
  fieldMappings?: FieldMapping[];
  availableFields?: DatabaseField[];
  onUpdateMapping: (
    sourceColumn: string,
    targetTable: string,
    targetField: string
  ) => void;
  onCreateField?: (sourceColumn: string, suggestedType: string) => void;
  sampleData?: Record<string, unknown[]>;
  showSampleData?: boolean;
}

export const FieldMappingTable: React.FC<FieldMappingTableProps> = ({
  columnTypes = [],
  fieldMappings = [],
  availableFields = [],
  onUpdateMapping,
  onCreateField,
  sampleData = {},
  showSampleData = true,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMappedOnly, setShowMappedOnly] = useState<boolean>(false);
  const [showUnmappedOnly, setShowUnmappedOnly] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get unique tables and categories for filters
  const availableTables = useMemo<string[]>(() => {
    const tables = Array.from(
      new Set(availableFields.map((field: DatabaseField) => field.table))
    );
    return tables.sort();
  }, [availableFields]);

  const availableCategories = useMemo<string[]>(() => {
    const categories = Array.from(
      new Set(
        availableFields.map(
          (field: DatabaseField) => field.category || 'General'
        )
      )
    );
    return categories.sort();
  }, [availableFields]);

  // Filter mappings based on current filters
  const filteredMappings = useMemo<FieldMapping[]>(() => {
    let filtered = fieldMappings;

    if (showMappedOnly) {
      filtered = filtered.filter(
        (mapping: FieldMapping) => mapping.targetTable && mapping.targetField
      );
    }

    if (showUnmappedOnly) {
      filtered = filtered.filter(
        (mapping: FieldMapping) => !mapping.targetTable || !mapping.targetField
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (mapping: FieldMapping) =>
          mapping.sourceColumn.toLowerCase().includes(term) ||
          mapping.targetTable?.toLowerCase().includes(term) ||
          mapping.targetField?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [fieldMappings, showMappedOnly, showUnmappedOnly, searchTerm]);

  // Filter available fields based on selected filters
  const filteredFields = useMemo<DatabaseField[]>(() => {
    let filtered = availableFields;

    if (selectedTable !== 'all') {
      filtered = filtered.filter(
        (field: DatabaseField) => field.table === selectedTable
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (field: DatabaseField) =>
          (field.category || 'General') === selectedCategory
      );
    }

    return filtered;
  }, [availableFields, selectedTable, selectedCategory]);

  // Calculate mapping statistics
  const mappingStats = useMemo(() => {
    const total = fieldMappings.length;
    const mapped = fieldMappings.filter(
      (m: FieldMapping) => m.targetTable && m.targetField
    ).length;
    const unmapped = total - mapped;
    const percentage = total > 0 ? Math.round((mapped / total) * 100) : 0;

    // Check for duplicate mappings
    const duplicateMappings: { target: string; sources: string[] }[] = [];
    const targetFieldCounts = new Map<string, string[]>();

    fieldMappings.forEach((mapping) => {
      if (mapping.targetTable && mapping.targetField) {
        const targetKey = `${mapping.targetTable}.${mapping.targetField}`;
        if (targetFieldCounts.has(targetKey)) {
          targetFieldCounts.get(targetKey)!.push(mapping.sourceColumn);
        } else {
          targetFieldCounts.set(targetKey, [mapping.sourceColumn]);
        }
      }
    });

    // Find duplicates
    for (const [target, sources] of targetFieldCounts) {
      if (sources.length > 1) {
        duplicateMappings.push({ target, sources });
      }
    }

    return { total, mapped, unmapped, percentage, duplicateMappings };
  }, [fieldMappings]);

  // Helper functions with explicit types
  const getColumnType = (sourceColumn: string): ColumnType | undefined => {
    return columnTypes.find(
      (col: ColumnType) =>
        col.name === sourceColumn || col.column === sourceColumn
    );
  };

  const getTargetField = (mapping: FieldMapping): DatabaseField | undefined => {
    return availableFields.find(
      (field: DatabaseField) =>
        field.table === mapping.targetTable &&
        field.field === mapping.targetField
    );
  };

  const clearMapping = (sourceColumn: string): void => {
    onUpdateMapping(sourceColumn, '', '');
  };

  // Auto-map unmapped fields based on name similarity
  const autoMapUnmapped = (): void => {
    const unmappedFields = fieldMappings.filter(
      (mapping: FieldMapping) => !mapping.targetTable || !mapping.targetField
    );

    unmappedFields.forEach((mapping: FieldMapping) => {
      const sourceColumn = mapping.sourceColumn.toLowerCase();

      // Find the best matching field
      const possibleMatches = availableFields.filter((field: DatabaseField) => {
        const fieldName = field.field.toLowerCase();
        return (
          fieldName.includes(sourceColumn) ||
          sourceColumn.includes(fieldName) ||
          fieldName
            .replace(/_/g, '')
            .includes(sourceColumn.replace(/[\s_]/g, '')) ||
          sourceColumn
            .replace(/[\s_]/g, '')
            .includes(fieldName.replace(/_/g, ''))
        );
      });

      if (possibleMatches.length > 0) {
        const bestMatch = possibleMatches[0];
        onUpdateMapping(mapping.sourceColumn, bestMatch.table, bestMatch.field);
      }
    });
  };

  const toggleRowExpansion = (sourceColumn: string): void => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(sourceColumn)) {
      newExpanded.delete(sourceColumn);
    } else {
      newExpanded.add(sourceColumn);
    }
    setExpandedRows(newExpanded);
  };

  const handleTableChange = (mapping: FieldMapping, value: string): void => {
    if (value === 'none') {
      clearMapping(mapping.sourceColumn);
    } else {
      onUpdateMapping(mapping.sourceColumn, value, '');
    }
  };

  const handleFieldChange = (mapping: FieldMapping, value: string): void => {
    onUpdateMapping(
      mapping.sourceColumn,
      mapping.targetTable,
      value === 'none' ? '' : value
    );
  };

  const handleCreateField = (
    mapping: FieldMapping,
    columnType: ColumnType | undefined
  ): void => {
    if (onCreateField) {
      onCreateField(mapping.sourceColumn, columnType?.type || 'text');
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {mappingStats.total}
          </div>
          <div className="text-sm text-gray-600">Total Fields</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {mappingStats.mapped}
          </div>
          <div className="text-sm text-gray-600">Mapped</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {mappingStats.unmapped}
          </div>
          <div className="text-sm text-gray-600">Unmapped</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {mappingStats.percentage}%
          </div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
        {/* Warning for duplicate mappings */}
        {mappingStats.duplicateMappings &&
          mappingStats.duplicateMappings.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <div className="font-medium text-red-800">
                    Duplicate Mappings Detected!
                  </div>
                  <div className="text-sm text-red-700 mt-1">
                    Multiple source columns are mapped to the same target field:
                  </div>
                  <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                    {mappingStats.duplicateMappings.map((duplicate, index) => (
                      <li key={index}>
                        <strong>{duplicate.target}</strong> ←{' '}
                        {duplicate.sources.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        {/* Search and Actions */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mappings..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-8 w-64"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMappedOnly(!showMappedOnly)}
              className={showMappedOnly ? 'bg-green-100' : ''}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showMappedOnly ? 'Show All' : 'Mapped'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUnmappedOnly(!showUnmappedOnly)}
              className={showUnmappedOnly ? 'bg-orange-100' : ''}
            >
              <EyeOff className="h-4 w-4 mr-1" />
              {showUnmappedOnly ? 'Show All' : 'Unmapped'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={autoMapUnmapped}
              disabled={mappingStats.unmapped === 0}
            >
              <Wand2 className="h-4 w-4 mr-1" />
              Auto-map
            </Button>
          </div>
        </div>

        {/* Target Field Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tables</SelectItem>
              {availableTables.map((table: string) => (
                <SelectItem key={table} value={table}>
                  {table.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedTable !== 'all' || selectedCategory !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTable('all');
                setSelectedCategory('all');
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Mapping Table */}
      <div className="bg-white rounded-lg border">
        <ScrollArea className="h-[500px]">
          <div className="p-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 pb-3 border-b font-medium text-sm text-gray-600">
              <div className="col-span-3">Source Column</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Target Table</div>
              <div className="col-span-3">Target Field</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Rows */}
            <div className="space-y-2 mt-3">
              {filteredMappings.map((mapping: FieldMapping) => {
                const columnType = getColumnType(mapping.sourceColumn);
                const targetField = getTargetField(mapping);
                const isMapped = Boolean(
                  mapping.targetTable && mapping.targetField
                );
                const isExpanded = expandedRows.has(mapping.sourceColumn);

                return (
                  <div key={mapping.sourceColumn} className="border rounded-lg">
                    <div className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-gray-50">
                      {/* Source Column */}
                      <div className="col-span-3">
                        <div className="font-medium text-sm">
                          {mapping.sourceColumn}
                        </div>
                        {columnType?.qualityScore && (
                          <div className="text-xs text-gray-500">
                            Quality: {Math.round(columnType.qualityScore * 100)}
                            %
                          </div>
                        )}
                      </div>

                      {/* Type */}
                      <div className="col-span-2">
                        <Badge variant="outline" className="text-xs">
                          {columnType?.type || 'Unknown'}
                        </Badge>
                        {columnType?.confidence && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(columnType.confidence * 100)}%
                            confidence
                          </div>
                        )}
                      </div>

                      {/* Target Table */}
                      <div className="col-span-2">
                        <Select
                          value={mapping.targetTable || 'none'}
                          onValueChange={(value: string) =>
                            handleTableChange(mapping, value)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select table" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">
                                Don&apos;t map
                              </span>
                            </SelectItem>
                            {availableTables.map((table: string) => (
                              <SelectItem key={table} value={table}>
                                {table.replace(/_/g, ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Target Field */}
                      <div className="col-span-3">
                        <Select
                          value={mapping.targetField || 'none'}
                          onValueChange={(value: string) =>
                            handleFieldChange(mapping, value)
                          }
                          disabled={!mapping.targetTable}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">
                                Select field
                              </span>
                            </SelectItem>
                            {filteredFields
                              .filter(
                                (field: DatabaseField) =>
                                  field.table === mapping.targetTable
                              )
                              .map((field: DatabaseField) => (
                                <SelectItem
                                  key={field.field}
                                  value={field.field}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>
                                      {field.field.replace(/_/g, ' ')}
                                    </span>
                                    {field.required && (
                                      <Badge
                                        variant="destructive"
                                        className="ml-2 text-xs"
                                      >
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 flex flex-col space-y-1">
                        {(() => {
                          // Check for mapping conflicts
                          const targetKey =
                            mapping.targetTable && mapping.targetField
                              ? `${mapping.targetTable}.${mapping.targetField}`
                              : null;

                          const hasConflict =
                            targetKey &&
                            fieldMappings.filter(
                              (m) =>
                                m.targetTable === mapping.targetTable &&
                                m.targetField === mapping.targetField &&
                                m.sourceColumn !== mapping.sourceColumn
                            ).length > 0;

                          if (hasConflict) {
                            return (
                              <div className="flex flex-col items-center">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <div className="text-xs text-red-600">
                                  Conflict
                                </div>
                              </div>
                            );
                          } else if (isMapped) {
                            return (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            );
                          } else {
                            return (
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                            );
                          }
                        })()}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleRowExpansion(mapping.sourceColumn)
                            }
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                          {onCreateField && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCreateField(mapping, columnType)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t p-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {/* Sample Data */}
                          {showSampleData &&
                            sampleData[mapping.sourceColumn] && (
                              <div>
                                <div className="font-medium mb-2">
                                  Sample Data:
                                </div>
                                <div className="space-y-1">
                                  {sampleData[mapping.sourceColumn]
                                    .slice(0, 5)
                                    .map((value: unknown, idx: number) => (
                                      <div
                                        key={idx}
                                        className="px-2 py-1 bg-white rounded text-xs border"
                                      >
                                        {String(value)}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                          {/* Quality Issues */}
                          {columnType?.issues &&
                            columnType.issues.length > 0 && (
                              <div>
                                <div className="font-medium mb-2 text-orange-600">
                                  Quality Issues:
                                </div>
                                <div className="space-y-1">
                                  {columnType.issues.map(
                                    (issue: string, idx: number) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-orange-700"
                                      >
                                        • {issue}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Field Information */}
                          {targetField && (
                            <div>
                              <div className="font-medium mb-2">
                                Field Information:
                              </div>
                              <div className="space-y-1 text-xs">
                                <div>
                                  <span className="font-medium">Type:</span>{' '}
                                  {targetField.type}
                                </div>
                                <div>
                                  <span className="font-medium">Required:</span>{' '}
                                  {targetField.required ? 'Yes' : 'No'}
                                </div>
                                {targetField.description && (
                                  <div>
                                    <span className="font-medium">
                                      Description:
                                    </span>{' '}
                                    {targetField.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredMappings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No mappings found matching your criteria.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
