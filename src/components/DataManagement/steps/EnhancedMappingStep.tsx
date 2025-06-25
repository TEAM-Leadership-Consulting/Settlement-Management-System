// components/DataManagement/steps/EnhancedMappingStep.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Wand2,
} from 'lucide-react';
import { DynamicFieldCreator } from '@/components/DataManagement/shared/DynamicFieldCreator';
import {
  DatabaseField,
  getAllDatabaseFields,
  getAllTableNames,
} from '@/constants/databaseSchema';
import type { FieldMapping, MappingStepProps } from '@/types/dataManagement';

export const EnhancedMappingStep: React.FC<MappingStepProps> = ({
  fileData,
  fieldMappings,
  availableFields,
  onUpdateMapping,
  onAddCustomField,
  onNext,
  onBack,
  isProcessing = false,
}) => {
  const [customFields, setCustomFields] = useState<DatabaseField[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMappedOnly, setShowMappedOnly] = useState(false);
  const [showUnmappedOnly, setShowUnmappedOnly] = useState(false);
  const [isFieldCreatorOpen, setIsFieldCreatorOpen] = useState(false);
  const [fieldCreatorSuggestion, setFieldCreatorSuggestion] = useState({
    name: '',
    type: 'text',
    table: '',
  });

  // Combine default schema with custom fields and provided available fields
  const allFields = useMemo(() => {
    return [...availableFields, ...getAllDatabaseFields(), ...customFields];
  }, [availableFields, customFields]);

  // Filter available fields based on search and filters
  const filteredFields = useMemo(() => {
    let filtered = allFields;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (field) =>
          field.field.toLowerCase().includes(term) ||
          field.description.toLowerCase().includes(term) ||
          field.table.toLowerCase().includes(term)
      );
    }

    if (selectedTable !== 'all') {
      filtered = filtered.filter((field) => field.table === selectedTable);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (field) => field.category === selectedCategory
      );
    }

    return filtered;
  }, [allFields, searchTerm, selectedTable, selectedCategory]);

  // Get unique categories from all fields
  const categories = useMemo(() => {
    const cats = Array.from(new Set(allFields.map((field) => field.category)));
    return cats.sort();
  }, [allFields]);

  // Filter source columns based on mapping status
  const filteredMappings = useMemo(() => {
    let filtered = fieldMappings;

    if (showMappedOnly) {
      filtered = filtered.filter(
        (mapping) => mapping.targetTable && mapping.targetField
      );
    }

    if (showUnmappedOnly) {
      filtered = filtered.filter(
        (mapping) => !mapping.targetTable || !mapping.targetField
      );
    }

    return filtered;
  }, [fieldMappings, showMappedOnly, showUnmappedOnly]);

  // Statistics
  const mappingStats = useMemo(() => {
    const mapped = fieldMappings.filter(
      (m) => m.targetTable && m.targetField
    ).length;
    const unmapped = fieldMappings.length - mapped;
    const requiredMapped = fieldMappings.filter(
      (m) => m.targetTable && m.targetField && m.required
    ).length;

    return {
      mapped,
      unmapped,
      total: fieldMappings.length,
      requiredMapped,
      mappingPercentage: Math.round((mapped / fieldMappings.length) * 100),
    };
  }, [fieldMappings]);

  const handleCreateField = (newField: DatabaseField) => {
    setCustomFields((prev) => [...prev, newField]);

    // Call the provided callback if available
    if (onAddCustomField) {
      onAddCustomField(newField);
    }

    // Auto-map the current column to the new field if we have a suggestion context
    if (fieldCreatorSuggestion.name) {
      const sourceColumn = fieldCreatorSuggestion.name;
      onUpdateMapping(sourceColumn, newField.table, newField.field);
    }
  };

  const openFieldCreator = (
    sourceColumn?: string,
    suggestedType?: string,
    suggestedTable?: string
  ) => {
    setFieldCreatorSuggestion({
      name: sourceColumn || '',
      type: suggestedType || 'text',
      table: suggestedTable || 'individual_parties',
    });
    setIsFieldCreatorOpen(true);
  };

  const getFieldByTableAndName = (
    table: string,
    field: string
  ): DatabaseField | undefined => {
    return allFields.find((f) => f.table === table && f.field === field);
  };

  const getMappingStatusColor = (mapping: FieldMapping) => {
    if (!mapping.targetTable || !mapping.targetField)
      return 'bg-yellow-50 border-yellow-200';
    if (mapping.required) return 'bg-blue-50 border-blue-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Enhanced Field Mapping
          </CardTitle>
          <CardDescription>
            Map your source columns to database fields. You can create new
            fields if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {mappingStats.mapped}
              </p>
              <p className="text-sm text-muted-foreground">Mapped Fields</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {mappingStats.unmapped}
              </p>
              <p className="text-sm text-muted-foreground">Unmapped Fields</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {mappingStats.mappingPercentage}%
              </p>
              <p className="text-sm text-muted-foreground">Completion</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {allFields.length}
              </p>
              <p className="text-sm text-muted-foreground">Available Fields</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Mapping Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Source Columns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Source Columns ({fileData.fileName})</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMappedOnly(!showMappedOnly)}
                  className={showMappedOnly ? 'bg-green-100' : ''}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showMappedOnly ? 'Show All' : 'Mapped Only'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUnmappedOnly(!showUnmappedOnly)}
                  className={showUnmappedOnly ? 'bg-orange-100' : ''}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  {showUnmappedOnly ? 'Show All' : 'Unmapped Only'}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Your source data columns with type detection and mapping status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredMappings.map((mapping, index) => {
                  const columnType = fileData.columnTypes.find(
                    (col) => col.name === mapping.sourceColumn
                  );
                  const targetField = getFieldByTableAndName(
                    mapping.targetTable,
                    mapping.targetField
                  );
                  const isMapped = mapping.targetTable && mapping.targetField;

                  return (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg transition-colors ${getMappingStatusColor(
                        mapping
                      )}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-sm">
                              {mapping.sourceColumn}
                            </h4>
                            {columnType && (
                              <Badge variant="outline" className="text-xs">
                                {String(columnType.type)}
                              </Badge>
                            )}
                            {columnType?.confidence && (
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(columnType.confidence * 100)}%
                                confident
                              </Badge>
                            )}
                          </div>

                          {/* Sample Data */}
                          {columnType?.sample &&
                            columnType.sample.length > 0 && (
                              <div className="text-xs text-muted-foreground mb-2">
                                Sample:{' '}
                                {String(columnType.sample[0]).substring(0, 30)}
                                {String(columnType.sample[0]).length > 30 &&
                                  '...'}
                              </div>
                            )}

                          {/* Current Mapping */}
                          {isMapped ? (
                            <div className="text-xs">
                              <span className="text-green-600 font-medium">
                                → {mapping.targetTable}.{mapping.targetField}
                              </span>
                              {targetField && (
                                <div className="text-muted-foreground mt-1">
                                  {targetField.description}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-orange-600">
                              Not mapped - Click to select target field
                            </div>
                          )}

                          {/* Suggestions */}
                          {columnType?.suggestions &&
                            columnType.suggestions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-blue-600 mb-1">
                                  💡 Suggestions:
                                </p>
                                {columnType.suggestions
                                  .slice(0, 2)
                                  .map((suggestion, idx) => (
                                    <p
                                      key={idx}
                                      className="text-xs text-muted-foreground"
                                    >
                                      • {suggestion}
                                    </p>
                                  ))}
                              </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-2">
                          {isMapped ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openFieldCreator(
                                mapping.sourceColumn,
                                String(columnType?.type || 'text'),
                                'individual_parties'
                              )
                            }
                            className="text-xs px-2 py-1"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            New Field
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Panel - Available Database Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Available Database Fields</CardTitle>
            <CardDescription>
              Browse and search all available database fields to map your
              columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => openFieldCreator()}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Field
                </Button>
              </div>

              <div className="flex space-x-2">
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tables</SelectItem>
                    {getAllTableNames().map((table) => (
                      <SelectItem key={table} value={table}>
                        {table.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fields by Table */}
            <Tabs defaultValue={getAllTableNames()[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                {getAllTableNames()
                  .slice(0, 6)
                  .map((table) => (
                    <TabsTrigger key={table} value={table} className="text-xs">
                      {table.replace(/_/g, ' ').substring(0, 12)}
                    </TabsTrigger>
                  ))}
              </TabsList>

              {getAllTableNames().map((table) => (
                <TabsContent key={table} value={table}>
                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {filteredFields
                        .filter((field) => field.table === table)
                        .map((field, index) => {
                          const isCurrentlyMapped = fieldMappings.some(
                            (mapping) =>
                              mapping.targetTable === field.table &&
                              mapping.targetField === field.field
                          );

                          return (
                            <div
                              key={index}
                              className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                                isCurrentlyMapped
                                  ? 'bg-green-50 border-green-200'
                                  : ''
                              }`}
                              onClick={() => {
                                // Here you would implement field selection logic
                                // For now, just show an info message
                                console.log('Field selected:', field);
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="font-medium text-sm">
                                      {field.field}
                                    </h5>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {field.type}
                                    </Badge>
                                    {field.required && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        Required
                                      </Badge>
                                    )}
                                    {field.isCustomField && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Custom
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {field.description}
                                  </p>
                                  <p className="text-xs text-blue-600 mt-1">
                                    {field.category}
                                  </p>
                                </div>
                                {isCurrentlyMapped && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // Auto-map logic would go here
                console.log('Auto-mapping remaining fields...');
              }}
              className="flex items-center"
              disabled={isProcessing}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-map Remaining Fields
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // Clear mappings logic
                console.log('Clearing all mappings...');
              }}
              disabled={isProcessing}
            >
              Clear All Mappings
            </Button>

            <Button
              variant="outline"
              onClick={() => setIsFieldCreatorOpen(true)}
              disabled={isProcessing}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Field
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back to Staging
        </Button>
        <Button
          onClick={onNext}
          disabled={mappingStats.mapped === 0 || isProcessing}
          className="flex items-center"
        >
          Continue to Validation
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
        onFieldCreated={handleCreateField}
        suggestedName={fieldCreatorSuggestion.name}
        suggestedType={fieldCreatorSuggestion.type}
        suggestedTable={fieldCreatorSuggestion.table}
      />
    </div>
  );
};
