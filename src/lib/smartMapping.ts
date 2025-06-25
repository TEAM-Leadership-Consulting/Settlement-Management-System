// src/lib/smartMapping.ts

import type { DatabaseField } from '@/constants/databaseSchema';
import type { FieldMapping } from '@/types/dataManagement';

export interface MappingRule {
  patterns: string[];
  targetTable: string;
  targetField: string;
  confidence: number;
  required?: boolean;
}

/**
 * Enhanced smart field mapping with comprehensive pattern matching
 */
export const generateSmartMappings = (
  headers: string[],
  availableFields: DatabaseField[]
): FieldMapping[] => {
  return headers.map((header) => {
    const bestMatch = findBestFieldMatch(header, availableFields);

    return {
      sourceColumn: header,
      targetTable: bestMatch?.table || '',
      targetField: bestMatch?.field || '',
      required: bestMatch?.required || false,
      validated: false,
      confidence: bestMatch?.confidence || 0,
    };
  });
};

/**
 * Find the best matching database field for a source column
 */
const findBestFieldMatch = (
  sourceColumn: string,
  availableFields: DatabaseField[]
): (DatabaseField & { confidence: number }) | null => {
  const normalizedSource = normalizeFieldName(sourceColumn);
  let bestMatch: (DatabaseField & { confidence: number }) | null = null;
  let highestConfidence = 0;

  for (const field of availableFields) {
    const confidence = calculateMatchConfidence(
      normalizedSource,
      field,
      sourceColumn
    );

    if (confidence > highestConfidence && confidence > 0.3) {
      // Minimum threshold
      highestConfidence = confidence;
      bestMatch = { ...field, confidence };
    }
  }

  return bestMatch;
};

/**
 * Calculate confidence score between source column and database field
 */
const calculateMatchConfidence = (
  normalizedSource: string,
  field: DatabaseField,
  originalSource: string
): number => {
  let confidence = 0;
  const normalizedField = normalizeFieldName(field.field);
  const originalLower = originalSource.toLowerCase();

  // Exact match (highest confidence)
  if (normalizedSource === normalizedField) {
    confidence = 1.0;
  }
  // Very close matches
  else if (
    normalizedSource.includes(normalizedField) ||
    normalizedField.includes(normalizedSource)
  ) {
    confidence = 0.9;
  }
  // Pattern-based matching
  else {
    confidence = Math.max(
      checkNamePatterns(originalLower, field),
      checkContactPatterns(originalLower, field),
      checkAddressPatterns(originalLower, field),
      checkBusinessPatterns(originalLower, field),
      checkPaymentPatterns(originalLower, field),
      checkDatePatterns(originalLower, field),
      checkIdentificationPatterns(originalLower, field),
      checkLegalPatterns(originalLower, field)
    );
  }

  // Boost confidence for commonly expected fields
  if (isCommonField(field.field)) {
    confidence *= 1.1;
  }

  // Reduce confidence for custom fields unless it's a very strong match
  if (field.isCustomField && confidence < 0.8) {
    confidence *= 0.7;
  }

  return Math.min(confidence, 1.0);
};

/**
 * Normalize field names for comparison
 */
const normalizeFieldName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/^(the|a|an)/, '')
    .trim();
};

/**
 * Check name-related patterns
 */
const checkNamePatterns = (source: string, field: DatabaseField): number => {
  const namePatterns = [
    // First name patterns
    {
      patterns: [
        'firstname',
        'first_name',
        'fname',
        'givenname',
        'given_name',
        'forename',
      ],
      field: 'first_name',
      confidence: 0.95,
    },
    // Last name patterns
    {
      patterns: [
        'lastname',
        'last_name',
        'lname',
        'surname',
        'familyname',
        'family_name',
      ],
      field: 'last_name',
      confidence: 0.95,
    },
    // Middle name patterns
    {
      patterns: [
        'middlename',
        'middle_name',
        'mname',
        'middleinitial',
        'middle_initial',
        'mi',
      ],
      field: 'middle_name',
      confidence: 0.9,
    },
    // Full name patterns
    {
      patterns: ['fullname', 'full_name', 'name', 'clientname', 'client_name'],
      field: 'first_name', // Could be split later
      confidence: 0.7,
    },
    // Title patterns
    {
      patterns: ['title', 'prefix', 'salutation', 'mr', 'ms', 'dr'],
      field: 'title_prefix',
      confidence: 0.85,
    },
    // Suffix patterns
    {
      patterns: ['suffix', 'jr', 'sr', 'iii', 'iv'],
      field: 'suffix',
      confidence: 0.9,
    },
    // Maiden name patterns
    {
      patterns: ['maidenname', 'maiden_name', 'birthname', 'birth_name'],
      field: 'maiden_name',
      confidence: 0.9,
    },
  ];

  return checkPatternMatch(source, field.field, namePatterns);
};

/**
 * Check contact information patterns
 */
const checkContactPatterns = (source: string, field: DatabaseField): number => {
  const contactPatterns = [
    // Email patterns
    {
      patterns: [
        'email',
        'emailaddress',
        'email_address',
        'e_mail',
        'electronic_mail',
      ],
      field: 'email_address',
      confidence: 0.95,
    },
    // Phone patterns
    {
      patterns: ['phone', 'phonenumber', 'phone_number', 'telephone', 'tel'],
      field: 'home_phone',
      confidence: 0.8,
    },
    {
      patterns: [
        'cellphone',
        'cell_phone',
        'cellular',
        'mobile',
        'mobilenumber',
        'mobile_number',
      ],
      field: 'cell_phone',
      confidence: 0.95,
    },
    {
      patterns: ['homephone', 'home_phone', 'homenumber', 'home_number'],
      field: 'home_phone',
      confidence: 0.95,
    },
    {
      patterns: [
        'workphone',
        'work_phone',
        'businessphone',
        'business_phone',
        'officephone',
        'office_phone',
      ],
      field: 'work_phone',
      confidence: 0.9,
    },
    {
      patterns: ['fax', 'faxnumber', 'fax_number', 'facsimile'],
      field: 'fax_number',
      confidence: 0.95,
    },
  ];

  return checkPatternMatch(source, field.field, contactPatterns);
};

/**
 * Check address patterns
 */
const checkAddressPatterns = (source: string, field: DatabaseField): number => {
  const addressPatterns = [
    {
      patterns: [
        'address',
        'streetaddress',
        'street_address',
        'addr',
        'address1',
        'address_1',
      ],
      field: 'street_address',
      confidence: 0.9,
    },
    {
      patterns: ['city', 'municipality', 'town'],
      field: 'city',
      confidence: 0.95,
    },
    {
      patterns: ['state', 'province', 'region'],
      field: 'state',
      confidence: 0.95,
    },
    {
      patterns: [
        'zip',
        'zipcode',
        'zip_code',
        'postal',
        'postalcode',
        'postal_code',
        'postcode',
      ],
      field: 'zip_code',
      confidence: 0.95,
    },
    {
      patterns: ['country', 'nation'],
      field: 'country',
      confidence: 0.9,
    },
    {
      patterns: ['mailingaddress', 'mailing_address', 'mail_address'],
      field: 'mailing_address',
      confidence: 0.85,
    },
    {
      patterns: [
        'alternateaddress',
        'alternate_address',
        'secondaddress',
        'second_address',
      ],
      field: 'alternate_address',
      confidence: 0.85,
    },
  ];

  return checkPatternMatch(source, field.field, addressPatterns);
};

/**
 * Check business-related patterns
 */
const checkBusinessPatterns = (
  source: string,
  field: DatabaseField
): number => {
  const businessPatterns = [
    {
      patterns: [
        'businessname',
        'business_name',
        'companyname',
        'company_name',
        'company',
        'corporation',
        'corp',
      ],
      field: 'business_name',
      confidence: 0.95,
    },
    {
      patterns: [
        'dba',
        'doingbusinessas',
        'doing_business_as',
        'tradename',
        'trade_name',
      ],
      field: 'dba_name',
      confidence: 0.9,
    },
    {
      patterns: [
        'ein',
        'employeridentification',
        'employer_identification',
        'taxid',
        'tax_id',
        'federalid',
        'federal_id',
      ],
      field: 'ein',
      confidence: 0.95,
    },
    {
      patterns: [
        'businesstype',
        'business_type',
        'entitytype',
        'entity_type',
        'companytype',
        'company_type',
      ],
      field: 'business_type',
      confidence: 0.9,
    },
    {
      patterns: [
        'industry',
        'industryclass',
        'industry_class',
        'businesscategory',
        'business_category',
      ],
      field: 'industry_classification',
      confidence: 0.85,
    },
  ];

  return checkPatternMatch(source, field.field, businessPatterns);
};

/**
 * Check payment-related patterns
 */
const checkPaymentPatterns = (source: string, field: DatabaseField): number => {
  const paymentPatterns = [
    {
      patterns: [
        'amount',
        'amountdue',
        'amount_due',
        'payment',
        'paymentamount',
        'payment_amount',
      ],
      field: 'amount_due',
      confidence: 0.9,
    },
    {
      patterns: [
        'settlementclass',
        'settlement_class',
        'class',
        'claimclass',
        'claim_class',
      ],
      field: 'settlement_class',
      confidence: 0.95,
    },
    {
      patterns: [
        'paymentstatus',
        'payment_status',
        'status',
        'claimstatus',
        'claim_status',
      ],
      field: 'payment_status',
      confidence: 0.9,
    },
    {
      patterns: [
        'bankname',
        'bank_name',
        'bank',
        'financialinstitution',
        'financial_institution',
      ],
      field: 'bank_name',
      confidence: 0.9,
    },
    {
      patterns: ['accountnumber', 'account_number', 'acctnum', 'acct_num'],
      field: 'account_number_encrypted',
      confidence: 0.9,
    },
    {
      patterns: [
        'routingnumber',
        'routing_number',
        'routing',
        'aba',
        'abanumber',
        'aba_number',
      ],
      field: 'routing_number',
      confidence: 0.95,
    },
  ];

  return checkPatternMatch(source, field.field, paymentPatterns);
};

/**
 * Check date patterns
 */
const checkDatePatterns = (source: string, field: DatabaseField): number => {
  const datePatterns = [
    {
      patterns: [
        'dateofbirth',
        'date_of_birth',
        'birthdate',
        'birth_date',
        'dob',
        'birthday',
      ],
      field: 'date_of_birth',
      confidence: 0.95,
    },
    {
      patterns: [
        'dateofdeath',
        'date_of_death',
        'deathdate',
        'death_date',
        'dod',
      ],
      field: 'date_of_death',
      confidence: 0.95,
    },
    {
      patterns: [
        'incorporationdate',
        'incorporation_date',
        'formationdate',
        'formation_date',
      ],
      field: 'articles_of_incorporation_date',
      confidence: 0.9,
    },
  ];

  return checkPatternMatch(source, field.field, datePatterns);
};

/**
 * Check identification patterns
 */
const checkIdentificationPatterns = (
  source: string,
  field: DatabaseField
): number => {
  const idPatterns = [
    {
      patterns: [
        'ssn',
        'socialsecurity',
        'social_security',
        'socialsecuritynumber',
        'social_security_number',
      ],
      field: 'ssn_encrypted',
      confidence: 0.95,
    },
    {
      patterns: ['gender', 'sex'],
      field: 'gender',
      confidence: 0.95,
    },
    {
      patterns: [
        'maritalstatus',
        'marital_status',
        'marriagestatus',
        'marriage_status',
      ],
      field: 'marital_status',
      confidence: 0.9,
    },
  ];

  return checkPatternMatch(source, field.field, idPatterns);
};

/**
 * Check legal patterns
 */
const checkLegalPatterns = (source: string, field: DatabaseField): number => {
  const legalPatterns = [
    {
      patterns: [
        'attorney',
        'lawyer',
        'attorneyname',
        'attorney_name',
        'counsel',
      ],
      field: 'attorney_name',
      confidence: 0.9,
    },
    {
      patterns: ['guardian', 'legalguardian', 'legal_guardian'],
      field: 'guardian',
      confidence: 0.95,
    },
    {
      patterns: [
        'representative',
        'legalrepresentative',
        'legal_representative',
      ],
      field: 'representative',
      confidence: 0.9,
    },
  ];

  return checkPatternMatch(source, field.field, legalPatterns);
};

/**
 * Generic pattern matching function
 */
const checkPatternMatch = (
  source: string,
  fieldName: string,
  patterns: Array<{ patterns: string[]; field: string; confidence: number }>
): number => {
  for (const pattern of patterns) {
    if (pattern.field === fieldName) {
      for (const p of pattern.patterns) {
        if (source.includes(p) || p.includes(source)) {
          // Exact match within pattern
          if (source === p) return pattern.confidence;
          // Partial match
          if (source.includes(p)) return pattern.confidence * 0.9;
          // Reverse partial match
          if (p.includes(source)) return pattern.confidence * 0.8;
        }
      }
    }
  }
  return 0;
};

/**
 * Check if a field is commonly expected in imports
 */
const isCommonField = (fieldName: string): boolean => {
  const commonFields = [
    'first_name',
    'last_name',
    'email_address',
    'phone_number',
    'home_phone',
    'cell_phone',
    'street_address',
    'city',
    'state',
    'zip_code',
    'business_name',
    'amount_due',
  ];
  return commonFields.includes(fieldName);
};

/**
 * Auto-map remaining unmapped fields
 */
export const autoMapRemainingFields = (
  currentMappings: FieldMapping[],
  availableFields: DatabaseField[]
): FieldMapping[] => {
  return currentMappings.map((mapping) => {
    // Skip already mapped fields
    if (mapping.targetTable && mapping.targetField) {
      return mapping;
    }

    // Try to find a match for unmapped fields
    const bestMatch = findBestFieldMatch(mapping.sourceColumn, availableFields);
    if (bestMatch && bestMatch.confidence > 0.5) {
      return {
        ...mapping,
        targetTable: bestMatch.table,
        targetField: bestMatch.field,
        required: bestMatch.required,
        confidence: bestMatch.confidence,
      };
    }

    return mapping;
  });
};

/**
 * Get mapping suggestions for a specific source column
 */
export const getMappingSuggestions = (
  sourceColumn: string,
  availableFields: DatabaseField[],
  limit: number = 5
): Array<DatabaseField & { confidence: number }> => {
  const normalizedSource = normalizeFieldName(sourceColumn);

  const suggestions = availableFields
    .map((field) => ({
      ...field,
      confidence: calculateMatchConfidence(
        normalizedSource,
        field,
        sourceColumn
      ),
    }))
    .filter((field) => field.confidence > 0.1)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);

  return suggestions;
};
