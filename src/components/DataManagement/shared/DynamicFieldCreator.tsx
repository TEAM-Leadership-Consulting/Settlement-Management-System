// components/DataManagement/shared/DynamicFieldCreator.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle, Info } from 'lucide-react';
import { DatabaseField, getAllTableNames } from '@/constants/databaseSchema';

interface DynamicFieldCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onFieldCreated: (field: DatabaseField) => void;
  suggestedName?: string;
  suggestedType?: string;
  suggestedTable?: string;
}

export const DynamicFieldCreator: React.FC<DynamicFieldCreatorProps> = ({
  isOpen,
  onClose,
  onFieldCreated,
  suggestedName = '',
  suggestedType = 'text',
  suggestedTable = '',
}) => {
  const [fieldData, setFieldData] = useState({
    table: suggestedTable,
    field: suggestedName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    type: suggestedType as DatabaseField['type'],
    required: false,
    description: '',
    category: 'Custom Fields',
    maxLength: 255,
    enumValues: [] as string[],
  });

  const [enumValueInput, setEnumValueInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldTypes: Array<{
    value: DatabaseField['type'];
    label: string;
    description: string;
  }> = [
    {
      value: 'text',
      label: 'Text',
      description: 'Short text strings (names, titles, etc.)',
    },
    {
      value: 'email',
      label: 'Email',
      description: 'Email addresses with validation',
    },
    {
      value: 'phone',
      label: 'Phone',
      description: 'Phone numbers with formatting',
    },
    {
      value: 'number',
      label: 'Number',
      description: 'Whole numbers (integers)',
    },
    {
      value: 'decimal',
      label: 'Decimal',
      description: 'Numbers with decimal places (currency, percentages)',
    },
    { value: 'date', label: 'Date', description: 'Date values' },
    {
      value: 'boolean',
      label: 'Boolean',
      description: 'True/false or yes/no values',
    },
    {
      value: 'enum',
      label: 'Dropdown/Select',
      description: 'Predefined list of options',
    },
  ];

  const categories = [
    'Personal Info',
    'Contact',
    'Address',
    'Business Info',
    'Legal',
    'Payment',
    'Classification',
    'Status',
    'Custom Fields',
    'Other',
  ];

  const handleSubmit = async () => {
    setError(null);
    setIsCreating(true);

    try {
      // Validation
      if (!fieldData.table) {
        throw new Error('Please select a table');
      }
      if (!fieldData.field) {
        throw new Error('Please enter a field name');
      }
      if (fieldData.type === 'enum' && fieldData.enumValues.length === 0) {
        throw new Error('Please add at least one option for dropdown fields');
      }

      // Clean field name (database-safe)
      const cleanFieldName = fieldData.field
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');

      if (!cleanFieldName) {
        throw new Error(
          'Field name must contain at least one letter or number'
        );
      }

      const newField: DatabaseField = {
        table: fieldData.table,
        field: cleanFieldName,
        type: fieldData.type,
        required: fieldData.required,
        description: fieldData.description || `Custom ${fieldData.type} field`,
        category: fieldData.category,
        isCustomField: true,
        ...(fieldData.type === 'text' && { maxLength: fieldData.maxLength }),
        ...(fieldData.type === 'enum' && { enumValues: fieldData.enumValues }),
      };

      // In a real implementation, you would save this to the database here
      // For now, we'll just add it to the local schema
      onFieldCreated(newField);

      // Reset form
      setFieldData({
        table: '',
        field: '',
        type: 'text',
        required: false,
        description: '',
        category: 'Custom Fields',
        maxLength: 255,
        enumValues: [],
      });
      setEnumValueInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create field');
    } finally {
      setIsCreating(false);
    }
  };

  const addEnumValue = () => {
    if (
      enumValueInput.trim() &&
      !fieldData.enumValues.includes(enumValueInput.trim())
    ) {
      setFieldData((prev) => ({
        ...prev,
        enumValues: [...prev.enumValues, enumValueInput.trim()],
      }));
      setEnumValueInput('');
    }
  };

  const removeEnumValue = (value: string) => {
    setFieldData((prev) => ({
      ...prev,
      enumValues: prev.enumValues.filter((v) => v !== value),
    }));
  };

  // Reset form when dialog opens with new suggestions
  React.useEffect(() => {
    if (isOpen) {
      setFieldData((prev) => ({
        ...prev,
        table: suggestedTable || prev.table,
        field:
          suggestedName.toLowerCase().replace(/[^a-z0-9]/g, '_') || prev.field,
        type: (suggestedType as DatabaseField['type']) || prev.type,
      }));
      setError(null);
    }
  }, [isOpen, suggestedName, suggestedType, suggestedTable]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create New Database Field
          </DialogTitle>
          <DialogDescription>
            Add a new field to the database schema to map unmapped columns. This
            field will be available for future imports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Custom fields will be added to your database schema and can be
              used in future imports. Make sure the field name and type match
              your data requirements.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Table Selection */}
            <div className="space-y-2">
              <Label htmlFor="table">Target Table *</Label>
              <Select
                value={fieldData.table}
                onValueChange={(value) =>
                  setFieldData((prev) => ({ ...prev, table: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {getAllTableNames().map((tableName) => (
                    <SelectItem key={tableName} value={tableName}>
                      {tableName
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field Name */}
            <div className="space-y-2">
              <Label htmlFor="field">Field Name *</Label>
              <Input
                id="field"
                value={fieldData.field}
                onChange={(e) =>
                  setFieldData((prev) => ({
                    ...prev,
                    field: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, '_'),
                  }))
                }
                placeholder="field_name"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Will be converted to: {fieldData.field || 'field_name'}
              </p>
            </div>
          </div>

          {/* Field Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Field Type *</Label>
            <Select
              value={fieldData.type}
              onValueChange={(value) =>
                setFieldData((prev) => ({
                  ...prev,
                  type: value as DatabaseField['type'],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type-specific options */}
          {fieldData.type === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="maxLength">Maximum Length</Label>
              <Input
                id="maxLength"
                type="number"
                value={fieldData.maxLength}
                onChange={(e) =>
                  setFieldData((prev) => ({
                    ...prev,
                    maxLength: parseInt(e.target.value) || 255,
                  }))
                }
                min="1"
                max="5000"
              />
            </div>
          )}

          {fieldData.type === 'enum' && (
            <div className="space-y-2">
              <Label>Dropdown Options *</Label>
              <div className="flex space-x-2">
                <Input
                  value={enumValueInput}
                  onChange={(e) => setEnumValueInput(e.target.value)}
                  placeholder="Add option"
                  onKeyPress={(e) => e.key === 'Enter' && addEnumValue()}
                />
                <Button type="button" onClick={addEnumValue} variant="outline">
                  Add
                </Button>
              </div>
              {fieldData.enumValues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {fieldData.enumValues.map((value, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-muted rounded px-2 py-1 text-sm"
                    >
                      <span>{value}</span>
                      <button
                        type="button"
                        onClick={() => removeEnumValue(value)}
                        className="ml-2 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={fieldData.category}
                onValueChange={(value) =>
                  setFieldData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Required Field */}
            <div className="space-y-2">
              <Label>Field Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={fieldData.required}
                  onCheckedChange={(checked) =>
                    setFieldData((prev) => ({
                      ...prev,
                      required: !!checked,
                    }))
                  }
                />
                <Label htmlFor="required" className="text-sm">
                  Required field
                </Label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={fieldData.description}
              onChange={(e) =>
                setFieldData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what this field stores..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
