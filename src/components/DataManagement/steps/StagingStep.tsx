// src/components/DataManagement/steps/StagingStep.tsx

'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  BarChart3,
  TrendingUp,
  Info,
} from 'lucide-react';

// Define interfaces directly in this file to avoid import issues

type DataQuality = 'excellent' | 'good' | 'fair' | 'poor';

interface StagingStepProps {
  fileData: {
    headers: string[];
    rows: string[][];
    totalRows: number;
    fileName: string;
    fileType: 'csv' | 'excel';
    columnTypes: Array<{
      name: string;
      type: string;
      sample: string[];
      nullCount: number;
      confidence: number;
      patterns?: string[];
      suggestions?: string[];
      detectedPatterns?: string[];
    }>;
  };
  isProcessing?: boolean;
  onNext: () => void;
  onBack: () => void;
}

// Use extended interface that's compatible with the imported ColumnType
interface ColumnAnalysis {
  name: string;
  type: string; // Use string for simplicity
  confidence: number;
  patterns: string[];
  suggestions: string[];
  sample: (string | number | boolean | null)[];
  nullCount: number;
  uniqueCount: number;
  totalCount: number;
  dataQuality: DataQuality;
  issues: string[];
}

interface IssueSummary {
  column: string;
  type: 'data_quality' | 'format' | 'completeness' | 'consistency';
  count: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface StagingAnalysis {
  totalRows: number;
  totalColumns: number;
  columnAnalysis: ColumnAnalysis[];
  dataQualityScore: number;
  issuesSummary: IssueSummary[];
  recommendations: string[];
}

export const StagingStep: React.FC<StagingStepProps> = ({
  fileData,
  isProcessing = false,
  onNext,
  onBack,
}) => {
  // Enhanced column analysis with postal code support
  const analysis = useMemo((): StagingAnalysis => {
    const columnAnalysis: ColumnAnalysis[] = fileData.columnTypes.map(
      (columnType) => {
        const columnIndex = fileData.headers.indexOf(columnType.name);
        const columnData = fileData.rows.map((row) => row[columnIndex]);
        const nonNullValues = columnData.filter(
          (val) => val != null && val !== ''
        );
        const uniqueValues = new Set(
          nonNullValues.map((val) => String(val).trim())
        ).size;
        const totalRows = fileData.rows.length;

        // Calculate metrics
        const completeness = nonNullValues.length / totalRows;
        const uniqueness = totalRows > 0 ? uniqueValues / totalRows : 0;

        // Enhanced pattern analysis with postal code awareness
        const patterns: string[] = [
          ...(columnType.detectedPatterns || columnType.patterns || []),
        ];
        const issues: string[] = [];
        const suggestions: string[] = [...(columnType.suggestions || [])];

        // Quality checks with improved validation
        if (completeness < 0.5) {
          issues.push(
            `High missing data rate: ${Math.round((1 - completeness) * 100)}%`
          );
        }

        // Convert type to string for consistency
        const typeString = String(columnType.type);

        // OVERRIDE: Force ZIP code columns to be treated as postal_code instead of phone
        const isZipCodeColumn = [
          'zip',
          'zipcode',
          'zip_code',
          'postal',
          'postalcode',
          'postal_code',
          'postcode',
        ].some((pattern) => columnType.name.toLowerCase().includes(pattern));

        // OVERRIDE: Force reference ID columns to be treated as text instead of date
        const isReferenceIdColumn = [
          'case',
          'case_id',
          'caseid',
          'reference',
          'ref_id',
          'refid',
          'id',
          'identifier',
          'number',
          'case_number',
          'casenumber',
        ].some((pattern) => columnType.name.toLowerCase().includes(pattern));

        // Check if data looks like reference IDs (CA-2024-001 pattern)
        const hasReferenceIdData = columnData.some((val) => {
          if (!val) return false;
          const str = String(val);
          return (
            /^[A-Z]{2,3}-\d{4}-\d+$/i.test(str) ||
            /^[A-Z]+[-_]?\d+[-_]?[A-Z\d]*$/i.test(str)
          );
        });

        let finalTypeString = typeString;
        if (isZipCodeColumn && typeString === 'phone') {
          finalTypeString = 'postal_code';
          patterns.push('postal_code');
        }

        if (
          (isReferenceIdColumn || hasReferenceIdData) &&
          typeString === 'date'
        ) {
          finalTypeString = 'text';
          patterns.push('reference_id');
        }

        // EMAIL validation
        if (finalTypeString === 'email') {
          const invalidEmails = columnData.filter(
            (val) => val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))
          ).length;
          if (invalidEmails > 0) {
            issues.push(`${invalidEmails} invalid email format(s)`);
          }
        }

        // POSTAL CODE validation (NEW - replaces incorrect phone validation for zip codes)
        if (
          finalTypeString === 'postal_code' ||
          patterns.includes('postal_code')
        ) {
          const invalidPostalCodes = columnData.filter((val) => {
            if (!val) return false;
            const cleaned = String(val).replace(/[-\s]/g, '');

            // US ZIP codes: 5 or 9 digits
            const isUSZip = /^\d{5}$/.test(cleaned) || /^\d{9}$/.test(cleaned);

            // Canadian postal codes: A1A 1A1 or A1A1A1
            const isCanadianPostal = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(
              String(val)
            );

            // UK postal codes: basic pattern
            const isUKPostal = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(
              String(val)
            );

            return !(isUSZip || isCanadianPostal || isUKPostal);
          }).length;

          if (invalidPostalCodes > 0) {
            issues.push(`${invalidPostalCodes} invalid postal code format(s)`);
          }
        }

        // In StagingStep.tsx, replace the column analysis logic with this fixed version:

        // PHONE validation
        if (finalTypeString === 'phone' && !patterns.includes('postal_code')) {
          const invalidPhones = columnData.filter((val) => {
            if (!val) return false;
            const cleaned = String(val).replace(/[-.\s\(\)\+]/g, '');

            // Exclude zip code lengths to prevent false positives
            const excludeZipLengths =
              cleaned.length === 5 || cleaned.length === 9;

            // Phone validation: 10-15 digits but not zip code lengths
            const hasValidLength =
              cleaned.length >= 10 &&
              cleaned.length <= 15 &&
              !excludeZipLengths;
            const isNumeric = /^\d+$/.test(cleaned);

            // Also check common phone patterns
            const phonePatterns = [
              /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, // US format
              /^\([0-9]{3}\)\s?[0-9]{3}-[0-9]{4}$/, // (xxx) xxx-xxxx
              /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/, // xxx-xxx-xxxx
            ];

            const hasPhonePattern = phonePatterns.some((pattern) =>
              pattern.test(String(val))
            );

            return !((isNumeric && hasValidLength) || hasPhonePattern);
          }).length;

          if (invalidPhones > 0) {
            issues.push(`${invalidPhones} inconsistent phone format(s)`);
          }
        }

        // DATE validation
        if (finalTypeString === 'date') {
          const invalidDates = columnData.filter(
            (val) => val && isNaN(Date.parse(String(val)))
          ).length;
          if (invalidDates > 0) {
            issues.push(`${invalidDates} invalid date format(s)`);
          }
        }

        // Determine data quality
        let dataQuality: DataQuality = 'excellent';
        if (
          issues.length > 0 ||
          completeness < 0.8 ||
          columnType.confidence < 0.7
        ) {
          dataQuality = 'good';
        }
        if (
          issues.length > 2 ||
          completeness < 0.6 ||
          columnType.confidence < 0.5
        ) {
          dataQuality = 'fair';
        }
        if (
          issues.length > 3 ||
          completeness < 0.4 ||
          columnType.confidence < 0.3
        ) {
          dataQuality = 'poor';
        }

        // Generate enhanced suggestions
        if (completeness < 0.8) {
          suggestions.push('Consider data cleaning to fill missing values');
        }
        if (columnType.confidence < 0.7) {
          suggestions.push('Review column content for consistent data type');
        }
        if (uniqueness < 0.1 && nonNullValues.length > 10) {
          suggestions.push('Low data variety - verify this is expected');
        }

        // Specific suggestions for postal codes
        if (patterns.includes('postal_code')) {
          suggestions.push(
            'Postal code detected - will be stored as text to preserve formatting'
          );
          if (patterns.includes('us_zip_5')) {
            suggestions.push('Standard US ZIP code format');
          }
          if (patterns.includes('us_zip_9')) {
            suggestions.push('Extended US ZIP+4 format detected');
          }
        }

        return {
          name: columnType.name,
          type: finalTypeString, // Use string version consistently
          confidence: columnType.confidence,
          patterns,
          suggestions: Array.from(new Set(suggestions)),
          sample: columnType.sample as (string | number | boolean | null)[],
          nullCount: columnType.nullCount,
          uniqueCount: uniqueValues,
          totalCount: totalRows,
          dataQuality,
          issues,
        };
      }
    );

    // Generate issues summary with improved categorization
    const issuesSummary: IssueSummary[] = [];

    columnAnalysis.forEach((col) => {
      col.issues.forEach((issue) => {
        // Categorize issues properly
        let type: IssueSummary['type'] = 'data_quality';
        let severity: IssueSummary['severity'] = 'medium';

        if (
          issue.includes('email format') ||
          issue.includes('phone format') ||
          issue.includes('postal code format') ||
          issue.includes('date format')
        ) {
          type = 'format';
          severity = 'high';
        } else if (issue.includes('missing data')) {
          type = 'completeness';
          severity = issue.includes('High') ? 'high' : 'medium';
        } else if (issue.includes('inconsistent')) {
          type = 'consistency';
          severity = 'medium';
        }

        // Extract count from issue message
        const countMatch = issue.match(/(\d+)/);
        const count = countMatch ? parseInt(countMatch[1]) : 1;

        issuesSummary.push({
          column: col.name,
          type,
          count,
          description: issue,
          severity,
        });
      });
    });

    // Calculate overall data quality score
    const qualityScores = columnAnalysis.map((col) => {
      switch (col.dataQuality) {
        case 'excellent':
          return 100;
        case 'good':
          return 80;
        case 'fair':
          return 60;
        case 'poor':
          return 40;
        default:
          return 60;
      }
    });

    const dataQualityScore =
      qualityScores.length > 0
        ? Math.round(
            qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
          )
        : 0;

    // Generate recommendations
    const recommendations: string[] = [];

    const hasPostalCodeIssues = issuesSummary.some((issue) =>
      issue.description.includes('postal code format')
    );

    const hasPhoneIssues = issuesSummary.some((issue) =>
      issue.description.includes('phone format')
    );

    if (hasPostalCodeIssues) {
      recommendations.push(
        'Review postal code formats - ensure ZIP codes are not being validated as phone numbers'
      );
    }

    if (hasPhoneIssues) {
      recommendations.push('Standardize phone number formats before import');
    }

    const highMissingDataColumns = columnAnalysis.filter(
      (col) => col.nullCount / col.totalCount > 0.3
    ).length;

    if (highMissingDataColumns > 0) {
      recommendations.push(
        `${highMissingDataColumns} columns have significant missing data - consider data cleaning`
      );
    }

    if (dataQualityScore < 70) {
      recommendations.push(
        'Overall data quality is below optimal - review data sources'
      );
    }

    return {
      totalRows: fileData.totalRows,
      totalColumns: fileData.headers.length,
      columnAnalysis,
      dataQualityScore,
      issuesSummary,
      recommendations,
    };
  }, [fileData]);

  const getQualityBadgeColor = (quality: DataQuality) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: IssueSummary['severity']) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Filter and sort columns
  const filteredColumns = useMemo(() => {
    return analysis.columnAnalysis;
  }, [analysis.columnAnalysis]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Data Quality Analysis
          </h2>
          <p className="text-gray-600 mt-1">
            Review data structure and quality before mapping to database fields
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Quality Score</div>
            <div className="text-2xl font-bold text-blue-600">
              {analysis.dataQualityScore}%
            </div>
          </div>
          <Progress value={analysis.dataQualityScore} className="w-24" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-500">Total Rows</div>
                <div className="text-xl font-semibold">
                  {analysis.totalRows.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm text-gray-500">Columns</div>
                <div className="text-xl font-semibold">
                  {analysis.totalColumns}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm text-gray-500">Issues Found</div>
                <div className="text-xl font-semibold">
                  {analysis.issuesSummary.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-500">Quality Score</div>
                <div className="text-xl font-semibold">
                  {analysis.dataQualityScore}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="columns">Column Analysis</TabsTrigger>
          <TabsTrigger value="issues">Issues Summary</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['excellent', 'good', 'fair', 'poor'] as const).map(
                    (quality) => {
                      const count = analysis.columnAnalysis.filter(
                        (col) => col.dataQuality === quality
                      ).length;
                      const percentage = Math.round(
                        (count / analysis.totalColumns) * 100
                      );

                      return (
                        <div
                          key={quality}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <Badge className={getQualityBadgeColor(quality)}>
                              {quality.charAt(0).toUpperCase() +
                                quality.slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {count} columns
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={percentage} className="w-20" />
                            <span className="text-sm font-medium">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Types Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    analysis.columnAnalysis.reduce((acc, col) => {
                      const typeKey = String(col.type);
                      acc[typeKey] = (acc[typeKey] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm capitalize">
                        {type.replace('_', ' ')}
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="columns" className="space-y-4">
          <div className="grid gap-4">
            {filteredColumns.map((column, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {column.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {String(column.type).replace('_', ' ')}
                        </Badge>
                        <Badge
                          className={getQualityBadgeColor(column.dataQuality)}
                        >
                          {column.dataQuality}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Confidence:</span>
                          <span className="ml-1 font-medium">
                            {Math.round(column.confidence * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Completeness:</span>
                          <span className="ml-1 font-medium">
                            {Math.round(
                              ((column.totalCount - column.nullCount) /
                                column.totalCount) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Unique Values:</span>
                          <span className="ml-1 font-medium">
                            {column.uniqueCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Issues:</span>
                          <span className="ml-1 font-medium">
                            {column.issues.length}
                          </span>
                        </div>
                      </div>

                      {column.sample.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500">
                            Sample values:{' '}
                          </span>
                          <span className="text-sm">
                            {column.sample
                              .slice(0, 3)
                              .map((val) => String(val))
                              .join(', ')}
                            {column.sample.length > 3 && '...'}
                          </span>
                        </div>
                      )}

                      {column.issues.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm text-red-600">
                            Issues: {column.issues.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {analysis.issuesSummary.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Issues Found
                </h3>
                <p className="text-gray-600">
                  Your data appears to be in excellent condition!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {analysis.issuesSummary.map((issue, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {issue.column}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {issue.type.replace('_', ' ')}
                            </Badge>
                            <Badge
                              className={
                                issue.severity === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : issue.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {issue.severity}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {issue.description}
                        </p>
                        {issue.count > 1 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Affects {issue.count} records
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Data Ready for Processing
                  </h3>
                  <p className="text-gray-600">
                    No specific recommendations - proceed to field mapping.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back to Upload
        </Button>
        <Button
          onClick={onNext}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue to Field Mapping
        </Button>
      </div>
    </div>
  );
};
