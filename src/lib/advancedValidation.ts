// lib/advancedValidation.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  ValidationSettings,
  FieldMapping,
  ValidationResult,
} from '@/types/dataManagement';

export class AdvancedValidator {
  private settings: ValidationSettings;

  constructor(settings: ValidationSettings) {
    this.settings = settings;
  }

  async validateData(
    data: string[][],
    fieldMappings: FieldMapping[]
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Email validation
    if (this.settings.validateEmails) {
      const emailResults = this.validateEmails(data, fieldMappings);
      results.push(...emailResults);
    }

    // Phone validation
    if (this.settings.validatePhones) {
      const phoneResults = this.validatePhones(data, fieldMappings);
      results.push(...phoneResults);
    }

    // Date validation
    if (this.settings.validateDates) {
      const dateResults = this.validateDates(data, fieldMappings);
      results.push(...dateResults);
    }

    // Duplicate detection
    if (this.settings.enableDuplicateDetection) {
      const duplicateResults = this.detectDuplicates(data, fieldMappings);
      results.push(...duplicateResults);
    }

    return results;
  }

  private validateEmails(
    data: string[][],
    fieldMappings: FieldMapping[]
  ): ValidationResult[] {
    const emailFields = fieldMappings.filter((m) =>
      m.targetField.toLowerCase().includes('email')
    );

    return emailFields.map((field) => {
      const columnIndex = data[0].indexOf(field.sourceColumn);
      const errors: string[] = [];
      const warnings: string[] = [];

      if (columnIndex >= 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let validCount = 0;

        for (let i = 1; i < data.length; i++) {
          const email = data[i][columnIndex]?.trim();
          if (email && !emailRegex.test(email)) {
            errors.push(`Row ${i + 1}: Invalid email format "${email}"`);
          } else if (email) {
            validCount++;
          }
        }

        return {
          field: field.sourceColumn,
          errors: errors.slice(0, this.settings.maxErrors),
          warnings,
          recordCount: data.length - 1,
          validCount,
        };
      }

      return {
        field: field.sourceColumn,
        errors: ['Email column not found'],
        warnings: [],
        recordCount: 0,
        validCount: 0,
      };
    });
  }

  private validatePhones(
    data: string[][],
    fieldMappings: FieldMapping[]
  ): ValidationResult[] {
    const phoneFields = fieldMappings.filter((m) =>
      m.targetField.toLowerCase().includes('phone')
    );

    return phoneFields.map((field) => {
      const columnIndex = data[0].indexOf(field.sourceColumn);
      const errors: string[] = [];
      const warnings: string[] = [];

      if (columnIndex >= 0) {
        // Various phone formats
        const phoneRegex =
          /^(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\([0-9]{3}\)\s?[0-9]{3}-[0-9]{4}|[0-9]{10})$/;
        let validCount = 0;

        for (let i = 1; i < data.length; i++) {
          let phone = data[i][columnIndex]?.trim();

          if (phone) {
            // Clean phone if setting enabled
            if (this.settings.removeSpecialCharacters) {
              phone = phone.replace(/[^\d+]/g, '');
            }

            if (!phoneRegex.test(phone)) {
              errors.push(`Row ${i + 1}: Invalid phone format "${phone}"`);
            } else {
              validCount++;
            }
          }
        }

        return {
          field: field.sourceColumn,
          errors: errors.slice(0, this.settings.maxErrors),
          warnings,
          recordCount: data.length - 1,
          validCount,
        };
      }

      return {
        field: field.sourceColumn,
        errors: ['Phone column not found'],
        warnings: [],
        recordCount: 0,
        validCount: 0,
      };
    });
  }

  private validateDates(
    data: string[][],
    fieldMappings: FieldMapping[]
  ): ValidationResult[] {
    const dateFields = fieldMappings.filter(
      (m) =>
        m.targetField.toLowerCase().includes('date') ||
        m.targetField.toLowerCase().includes('birth')
    );

    return dateFields.map((field) => {
      const columnIndex = data[0].indexOf(field.sourceColumn);
      const errors: string[] = [];
      const warnings: string[] = [];

      if (columnIndex >= 0) {
        let validCount = 0;

        for (let i = 1; i < data.length; i++) {
          const dateValue = data[i][columnIndex]?.trim();
          if (dateValue && isNaN(Date.parse(dateValue))) {
            errors.push(`Row ${i + 1}: Invalid date format "${dateValue}"`);
          } else if (dateValue) {
            validCount++;
          }
        }

        return {
          field: field.sourceColumn,
          errors: errors.slice(0, this.settings.maxErrors),
          warnings,
          recordCount: data.length - 1,
          validCount,
        };
      }

      return {
        field: field.sourceColumn,
        errors: ['Date column not found'],
        warnings: [],
        recordCount: 0,
        validCount: 0,
      };
    });
  }
  private detectDuplicates(
    data: string[][],
    fieldMappings: FieldMapping[]
  ): ValidationResult[] {
    if (this.settings.duplicateColumns.length === 0) {
      return [];
    }

    const duplicateIndices = this.settings.duplicateColumns
      .map((col) => data[0].indexOf(col))
      .filter((index) => index >= 0);

    if (duplicateIndices.length === 0) {
      return [
        {
          field: 'Duplicate Detection',
          errors: ['Selected duplicate columns not found in data'],
          warnings: [],
          recordCount: 0,
          validCount: 0,
        },
      ];
    }

    // OPTIMIZED ALGORITHM - O(n) instead of O(n²)
    const keyGroups = new Map<string, number[]>();

    // Single pass through data - O(n) complexity
    for (let i = 1; i < data.length; i++) {
      const key = duplicateIndices
        .map((idx) => {
          let value = data[i][idx]?.trim() || '';

          // Apply data cleaning if enabled
          if (this.settings.trimWhitespace) {
            value = value.trim();
          }

          if (this.settings.standardizeCase !== 'none') {
            switch (this.settings.standardizeCase) {
              case 'upper':
                value = value.toUpperCase();
                break;
              case 'lower':
                value = value.toLowerCase();
                break;
              case 'title':
                value = value.replace(
                  /\w\S*/g,
                  (txt) =>
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                break;
            }
          }

          return value;
        })
        .join('|');

      // O(1) lookup and update instead of O(n) array search
      if (keyGroups.has(key)) {
        keyGroups.get(key)!.push(i + 1); // 1-based row numbers
      } else {
        keyGroups.set(key, [i + 1]);
      }
    }

    // Filter out non-duplicates (groups with only 1 row) and format results
    const duplicateGroups: Array<{ rows: number[]; values: string }> = [];

    for (const [key, rows] of keyGroups) {
      if (rows.length > 1) {
        duplicateGroups.push({ rows, values: key });
      }
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    duplicateGroups.forEach((duplicate) => {
      const message = `Duplicate found in rows ${duplicate.rows.join(', ')}: "${
        duplicate.values
      }"`;

      if (this.settings.duplicateAction === 'error') {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    });

    return [
      {
        field: 'Duplicate Detection',
        errors: errors.slice(0, this.settings.maxErrors),
        warnings: warnings.slice(0, this.settings.maxErrors),
        recordCount: data.length - 1,
        validCount:
          data.length -
          1 -
          duplicateGroups.reduce((sum, d) => sum + d.rows.length - 1, 0),
      },
    ];
  }
}
