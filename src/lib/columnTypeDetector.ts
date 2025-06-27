// src/lib/columnTypeDetector.ts

import type { FileData, ColumnType, DataType } from '@/types/dataManagement';

export interface DetectionResult {
  type: DataType;
  confidence: number;
  patterns: string[];
}

/**
 * Enhanced column type detection with guaranteed confidence scores and proper zip code detection
 */
export const detectColumnTypes = (fileData: FileData): ColumnType[] => {
  return fileData.headers.map((header) => {
    const columnIndex = fileData.headers.indexOf(header);
    const allValues = fileData.rows.map((row) => row[columnIndex]);
    const nonNullValues = allValues.filter(
      (val) => val != null && val !== '' && val !== undefined
    );
    const nullCount = allValues.length - nonNullValues.length;

    // Convert to strings for analysis
    const stringValues = nonNullValues.map((val) => String(val).trim());

    if (stringValues.length === 0) {
      return {
        name: header,
        type: 'text',
        sample: [],
        nullCount,
        confidence: 0.0,
        detectedPatterns: ['no_data'],
        suggestions: ['Consider removing this column or providing sample data'],
      };
    }

    // Get sample data (first 5 non-null values)
    const sample = stringValues.slice(0, 5);

    // Run all detection algorithms in priority order
    const detectionResults: DetectionResult[] = [
      detectZipCode(stringValues, header), // Check zip codes FIRST
      detectEmail(stringValues),
      detectPhone(stringValues), // Phone detection AFTER zip codes
      detectNumber(stringValues),
      detectDate(stringValues),
      detectBoolean(stringValues),
    ];

    // Find the highest confidence detection
    const bestDetection = detectionResults.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    // Default to text if no strong pattern detected
    const finalType =
      bestDetection.confidence >= 0.6 ? bestDetection.type : 'text';
    const finalConfidence =
      bestDetection.confidence >= 0.6
        ? bestDetection.confidence
        : stringValues.length > 0
        ? 0.8
        : 0.0;

    return {
      name: header,
      type: finalType,
      sample,
      nullCount,
      confidence: Math.round(finalConfidence * 100) / 100,
      detectedPatterns: bestDetection.patterns,
      suggestions: generateSuggestions(
        header,
        finalType,
        bestDetection.patterns
      ),
    };
  });
};

/**
 * ZIP CODE DETECTION - This should run BEFORE phone detection
 */
const detectZipCode = (
  values: string[],
  columnName: string
): DetectionResult => {
  const patterns: string[] = [];
  const lowerName = columnName.toLowerCase();

  // Check if column name suggests zip code
  const isZipCodeColumn = [
    'zip',
    'zipcode',
    'zip_code',
    'postal',
    'postalcode',
    'postal_code',
    'postcode',
  ].some((pattern) => lowerName.includes(pattern));

  // Zip code patterns
  const validZipCodes = values.filter((val) => {
    const cleaned = val.replace(/[-\s]/g, '');

    // US ZIP codes: 5 digits or 9 digits (ZIP+4)
    const isUSZip = /^\d{5}$/.test(cleaned) || /^\d{9}$/.test(cleaned);

    // Canadian postal codes: A1A 1A1 or A1A1A1
    const isCanadianPostal = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(val);

    // UK postal codes: basic pattern
    const isUKPostal = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(val);

    if (isUSZip) {
      patterns.push(cleaned.length === 5 ? 'us_zip_5' : 'us_zip_9');
      return true;
    }
    if (isCanadianPostal) {
      patterns.push('canadian_postal');
      return true;
    }
    if (isUKPostal) {
      patterns.push('uk_postal');
      return true;
    }

    return false;
  });

  // Higher confidence if column name suggests zip code
  let confidence = validZipCodes.length / values.length;
  if (isZipCodeColumn && confidence > 0.3) {
    confidence = Math.min(confidence + 0.3, 1.0); // Boost confidence for zip-named columns
  }

  return {
    type: 'text', // Zip codes are stored as text to preserve leading zeros
    confidence,
    patterns: ['postal_code', ...Array.from(new Set(patterns))],
  };
};

/**
 * Email detection with pattern analysis
 */
const detectEmail = (values: string[]): DetectionResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const patterns: string[] = [];

  const validEmails = values.filter((val) => {
    const isValid = emailRegex.test(val);
    if (isValid) {
      const domain = val.split('@')[1];
      if (domain) patterns.push(`domain_${domain.split('.')[0]}`);
    }
    return isValid;
  });

  const confidence = validEmails.length / values.length;

  return {
    type: 'email',
    confidence,
    patterns: ['email_format', ...Array.from(new Set(patterns))],
  };
};

/**
 * IMPROVED Phone number detection - excludes zip codes
 */
const detectPhone = (values: string[]): DetectionResult => {
  const patterns: string[] = [];

  const validPhones = values.filter((val) => {
    // Remove common phone chars and check if mostly digits
    const cleaned = val.replace(/[-.\s\(\)\+]/g, '');
    const isNumeric = /^\d+$/.test(cleaned);

    // IMPORTANT: Exclude common zip code lengths to prevent false positives
    const excludeZipLengths = cleaned.length === 5 || cleaned.length === 9;

    // Phone numbers should be 10-15 digits, but NOT 5 or 9 (zip codes)
    const hasPhoneLength =
      cleaned.length >= 10 && cleaned.length <= 15 && !excludeZipLengths;

    // Additional validation: check for phone-like patterns
    const hasPhonePattern =
      /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(val) || // US format
      /^\+?[1-9]\d{1,14}$/.test(val) || // International format
      /^\([0-9]{3}\)\s?[0-9]{3}-[0-9]{4}$/.test(val) || // (xxx) xxx-xxxx
      /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(val); // xxx-xxx-xxxx

    if (isNumeric && hasPhoneLength) {
      patterns.push(`length_${cleaned.length}`);
      return true;
    }

    if (hasPhonePattern) {
      patterns.push('formatted_phone');
      return true;
    }

    return false;
  });

  const confidence = validPhones.length / values.length;

  return {
    type: 'phone',
    confidence,
    patterns: ['phone_format', ...Array.from(new Set(patterns))],
  };
};

/**
 * Number detection with decimal/integer analysis
 */
const detectNumber = (values: string[]): DetectionResult => {
  const patterns: string[] = [];
  let decimalCount = 0;
  let integerCount = 0;

  const validNumbers = values.filter((val) => {
    // Remove common number formatting
    const cleaned = val.replace(/[$,\s]/g, '');
    const isNumber = !isNaN(Number(cleaned)) && cleaned !== '';

    if (isNumber) {
      if (cleaned.includes('.')) {
        decimalCount++;
        patterns.push('decimal');
      } else {
        integerCount++;
        patterns.push('integer');
      }

      // Detect currency
      if (val.includes('$')) patterns.push('currency');
      if (val.includes(',')) patterns.push('thousands_separator');
    }

    return isNumber;
  });

  const confidence = validNumbers.length / values.length;
  const finalType: DataType =
    decimalCount > integerCount ? 'decimal' : 'number';

  return {
    type: finalType,
    confidence,
    patterns: Array.from(new Set(patterns)),
  };
};

/**
 * IMPROVED Date detection - excludes reference IDs and case numbers
 */
const detectDate = (values: string[]): DetectionResult => {
  const patterns: string[] = [];

  const validDates = values.filter((val) => {
    // Skip values that look like reference IDs or case numbers
    const hasReferencePattern = /^[A-Z]{2,3}-\d{4}-\d+$/i.test(val); // CA-2024-001 pattern
    const hasAlphaNumeric = /^[A-Z]+[-_]?\d+[-_]?[A-Z\d]*$/i.test(val); // General alphanumeric IDs

    if (hasReferencePattern || hasAlphaNumeric) {
      return false; // Not a date
    }

    // Only consider values that could actually be dates
    const couldBeDate =
      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(val) || // MM/DD/YYYY or MM-DD-YYYY
      /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(val) || // YYYY/MM/DD or YYYY-MM-DD
      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2}$/.test(val) || // MM/DD/YY
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val) || // ISO format
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(val); // Month names

    if (!couldBeDate) {
      return false;
    }

    // Try to parse as date
    const dateValue = new Date(val);
    const isValidDate = !isNaN(dateValue.getTime());

    if (isValidDate) {
      // Detect common date patterns
      if (/^\d{4}-\d{2}-\d{2}/.test(val)) patterns.push('iso_format');
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) patterns.push('us_format');
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(val)) patterns.push('dash_format');
      if (val.includes('T') && val.includes(':')) patterns.push('datetime');
    }

    return isValidDate;
  });

  const confidence = validDates.length / values.length;

  return {
    type: 'date',
    confidence,
    patterns: ['date_format', ...Array.from(new Set(patterns))],
  };
};

/**
 * Boolean detection with common true/false patterns
 */
const detectBoolean = (values: string[]): DetectionResult => {
  const patterns: string[] = [];
  const booleanValues = new Set([
    'true',
    'false',
    'yes',
    'no',
    'y',
    'n',
    '1',
    '0',
  ]);

  const validBooleans = values.filter((val) => {
    const lower = val.toLowerCase();
    const isBoolean = booleanValues.has(lower);

    if (isBoolean) {
      if (['true', 'false'].includes(lower)) patterns.push('true_false');
      if (['yes', 'no'].includes(lower)) patterns.push('yes_no');
      if (['1', '0'].includes(lower)) patterns.push('binary');
      if (['y', 'n'].includes(lower)) patterns.push('y_n');
    }

    return isBoolean;
  });

  const confidence = validBooleans.length / values.length;

  return {
    type: 'boolean',
    confidence,
    patterns: Array.from(new Set(patterns)),
  };
};

/**
 * Generate suggestions based on detected patterns
 */
const generateSuggestions = (
  columnName: string,
  type: string,
  patterns: string[]
): string[] => {
  const suggestions: string[] = [];
  const lowerName = columnName.toLowerCase();

  if (type === 'text' && patterns.includes('no_data')) {
    suggestions.push(
      'Column appears to be empty - consider removing or providing sample data'
    );
  }

  if (type === 'email' && patterns.some((p) => p.startsWith('domain_'))) {
    suggestions.push('Email domain detected - consider validation rules');
  }

  if (type === 'phone' && patterns.includes('length_10')) {
    suggestions.push('US phone number format detected');
  }

  if (type === 'number' && patterns.includes('currency')) {
    suggestions.push('Currency values detected - consider decimal type');
  }

  if (type === 'date' && patterns.includes('iso_format')) {
    suggestions.push('ISO date format detected - good for database storage');
  }

  // ZIP CODE specific suggestions
  if (patterns.includes('postal_code')) {
    if (patterns.includes('us_zip_5')) {
      suggestions.push('US 5-digit ZIP code detected');
    }
    if (patterns.includes('us_zip_9')) {
      suggestions.push('US ZIP+4 format detected');
    }
    if (patterns.includes('canadian_postal')) {
      suggestions.push('Canadian postal code format detected');
    }
    suggestions.push('Store as text to preserve leading zeros');
  }

  // Smart mapping suggestions based on name
  if (lowerName.includes('email')) {
    suggestions.push('Maps well to email fields in database');
  }

  if (lowerName.includes('phone') || lowerName.includes('cell')) {
    suggestions.push('Maps well to phone fields in database');
  }

  if (lowerName.includes('zip') || lowerName.includes('postal')) {
    suggestions.push('Maps well to zip_code fields in database');
  }

  if (lowerName.includes('name')) {
    suggestions.push('Maps well to name fields in database');
  }

  return suggestions;
};
