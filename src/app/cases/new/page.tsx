'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  FileText,
  Calendar,
  DollarSign,
  Building,
  AlertCircle,
  ArrowLeft,
  Save,
  Plus,
} from 'lucide-react';

interface CaseType {
  case_type_id: number;
  case_type_code: string;
  case_type_name: string;
  description: string;
}

interface FormData {
  case_number: string;
  case_title: string;
  case_type_id: string;
  court_name: string;
  judge_name: string;
  jurisdiction: string;
  filing_date: string;
  case_status: string;
  case_phase: string;
  total_settlement_amount: string;
  settlement_approval_date: string;
  distribution_start_date: string;
  claim_deadline: string;
  statute_limitations: string;
  final_approval_hearing: string;
  case_closure_date: string;
  administrative_costs: string;
  attorney_fees: string;
  court_costs: string;
  description: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const NewCasePage = () => {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCaseTypes, setLoadingCaseTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    case_number: '',
    case_title: '',
    case_type_id: '',
    court_name: '',
    judge_name: '',
    jurisdiction: '',
    filing_date: '',
    case_status: 'active',
    case_phase: 'discovery',
    total_settlement_amount: '',
    settlement_approval_date: '',
    distribution_start_date: '',
    claim_deadline: '',
    statute_limitations: '',
    final_approval_hearing: '',
    case_closure_date: '',
    administrative_costs: '',
    attorney_fees: '',
    court_costs: '',
    description: '',
    notes: '',
  });

  // Load case types on component mount
  useEffect(() => {
    const fetchCaseTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('case_types')
          .select('case_type_id, case_type_code, case_type_name, description')
          .eq('active', true)
          .order('case_type_name');

        if (error) throw error;

        setCaseTypes(data || []);
      } catch (err) {
        console.error('Error fetching case types:', err);
        setError('Failed to load case types');
      } finally {
        setLoadingCaseTypes(false);
      }
    };

    fetchCaseTypes();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const formatCurrency = (value: string): string => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');

    // Convert to number and format as currency
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';

    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCurrencyChange = (field: keyof FormData, value: string) => {
    const formatted = formatCurrency(value);
    handleInputChange(field, formatted);
  };

  const generateCaseNumber = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `CASE-${year}-${random}`;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.case_number.trim()) {
      newErrors.case_number = 'Case number is required';
    }
    if (!formData.case_title.trim()) {
      newErrors.case_title = 'Case title is required';
    }
    if (!formData.case_type_id) {
      newErrors.case_type_id = 'Case type is required';
    }
    if (!formData.jurisdiction.trim()) {
      newErrors.jurisdiction = 'Jurisdiction is required';
    }

    // Date validations
    if (formData.filing_date && formData.claim_deadline) {
      const filingDate = new Date(formData.filing_date);
      const claimDeadline = new Date(formData.claim_deadline);
      if (claimDeadline <= filingDate) {
        newErrors.claim_deadline = 'Claim deadline must be after filing date';
      }
    }

    // Currency validations
    const currencyFields = [
      'total_settlement_amount',
      'administrative_costs',
      'attorney_fees',
      'court_costs',
    ];
    currencyFields.forEach((field) => {
      const value = formData[field as keyof FormData];
      if (value && isNaN(parseFloat(value.replace(/[^\d.]/g, '')))) {
        newErrors[field] = 'Please enter a valid amount';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for database
      const caseData = {
        case_number: formData.case_number,
        case_title: formData.case_title,
        case_type_id: parseInt(formData.case_type_id),
        court_name: formData.court_name || null,
        judge_name: formData.judge_name || null,
        jurisdiction: formData.jurisdiction,
        filing_date: formData.filing_date || null,
        case_status: formData.case_status,
        case_phase: formData.case_phase,
        total_settlement_amount: formData.total_settlement_amount
          ? parseFloat(formData.total_settlement_amount.replace(/[^\d.]/g, ''))
          : null,
        settlement_approval_date: formData.settlement_approval_date || null,
        distribution_start_date: formData.distribution_start_date || null,
        claim_deadline: formData.claim_deadline || null,
        statute_limitations: formData.statute_limitations || null,
        final_approval_hearing: formData.final_approval_hearing || null,
        case_closure_date: formData.case_closure_date || null,
        administrative_costs: formData.administrative_costs
          ? parseFloat(formData.administrative_costs.replace(/[^\d.]/g, ''))
          : null,
        attorney_fees: formData.attorney_fees
          ? parseFloat(formData.attorney_fees.replace(/[^\d.]/g, ''))
          : null,
        court_costs: formData.court_costs
          ? parseFloat(formData.court_costs.replace(/[^\d.]/g, ''))
          : null,
        description: formData.description || null,
        notes: formData.notes || null,
        created_by: userProfile?.user_id || null,
        last_modified_by: userProfile?.user_id || null,
      };

      const { data, error } = await supabase
        .from('cases')
        .insert([caseData])
        .select()
        .single();

      if (error) throw error;

      // Success - redirect to case detail or cases list
      router.push(`/cases/${data.case_id}`);
    } catch (err) {
      console.error('Error creating case:', err);
      setError('Failed to create case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCaseNumber = () => {
    const newCaseNumber = generateCaseNumber();
    handleInputChange('case_number', newCaseNumber);
  };

  if (loadingCaseTypes) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading form...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Case
            </h1>
            <p className="text-gray-600 mt-2">
              Enter the case information to create a new settlement case.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Basic Case Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Case Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="case_number">Case Number *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="case_number"
                        value={formData.case_number}
                        onChange={(e) =>
                          handleInputChange('case_number', e.target.value)
                        }
                        placeholder="CASE-2025-0001"
                        className={errors.case_number ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateCaseNumber}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.case_number && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.case_number}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="case_type_id">Case Type *</Label>
                    <Select
                      value={formData.case_type_id}
                      onValueChange={(value) =>
                        handleInputChange('case_type_id', value)
                      }
                    >
                      <SelectTrigger
                        className={errors.case_type_id ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                      <SelectContent>
                        {caseTypes.map((type) => (
                          <SelectItem
                            key={type.case_type_id}
                            value={type.case_type_id.toString()}
                          >
                            {type.case_type_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.case_type_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.case_type_id}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="case_title">Case Title *</Label>
                  <Input
                    id="case_title"
                    value={formData.case_title}
                    onChange={(e) =>
                      handleInputChange('case_title', e.target.value)
                    }
                    placeholder="Smith v. ABC Corporation et al."
                    className={errors.case_title ? 'border-red-500' : ''}
                  />
                  {errors.case_title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.case_title}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Case Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Brief description of the case..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Court Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Court Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                    <Input
                      id="jurisdiction"
                      value={formData.jurisdiction}
                      onChange={(e) =>
                        handleInputChange('jurisdiction', e.target.value)
                      }
                      placeholder="Federal, California, New York, etc."
                      className={errors.jurisdiction ? 'border-red-500' : ''}
                    />
                    {errors.jurisdiction && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.jurisdiction}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="court_name">Court Name</Label>
                    <Input
                      id="court_name"
                      value={formData.court_name}
                      onChange={(e) =>
                        handleInputChange('court_name', e.target.value)
                      }
                      placeholder="U.S. District Court for the Central District of California"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="judge_name">Judge Name</Label>
                  <Input
                    id="judge_name"
                    value={formData.judge_name}
                    onChange={(e) =>
                      handleInputChange('judge_name', e.target.value)
                    }
                    placeholder="The Honorable John Smith"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Case Status & Phase */}
            <Card>
              <CardHeader>
                <CardTitle>Case Status & Phase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="case_status">Case Status</Label>
                    <Select
                      value={formData.case_status}
                      onValueChange={(value) =>
                        handleInputChange('case_status', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending_approval">
                          Pending Approval
                        </SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="case_phase">Case Phase</Label>
                    <Select
                      value={formData.case_phase}
                      onValueChange={(value) =>
                        handleInputChange('case_phase', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discovery">Discovery</SelectItem>
                        <SelectItem value="motion_practice">
                          Motion Practice
                        </SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="settlement_negotiation">
                          Settlement Negotiation
                        </SelectItem>
                        <SelectItem value="settlement_approval">
                          Settlement Approval
                        </SelectItem>
                        <SelectItem value="distribution">
                          Distribution
                        </SelectItem>
                        <SelectItem value="administration">
                          Administration
                        </SelectItem>
                        <SelectItem value="final_closure">
                          Final Closure
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="filing_date">Filing Date</Label>
                    <Input
                      id="filing_date"
                      type="date"
                      value={formData.filing_date}
                      onChange={(e) =>
                        handleInputChange('filing_date', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="claim_deadline">Claim Deadline</Label>
                    <Input
                      id="claim_deadline"
                      type="date"
                      value={formData.claim_deadline}
                      onChange={(e) =>
                        handleInputChange('claim_deadline', e.target.value)
                      }
                      className={errors.claim_deadline ? 'border-red-500' : ''}
                    />
                    {errors.claim_deadline && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.claim_deadline}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="settlement_approval_date">
                      Settlement Approval Date
                    </Label>
                    <Input
                      id="settlement_approval_date"
                      type="date"
                      value={formData.settlement_approval_date}
                      onChange={(e) =>
                        handleInputChange(
                          'settlement_approval_date',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="distribution_start_date">
                      Distribution Start Date
                    </Label>
                    <Input
                      id="distribution_start_date"
                      type="date"
                      value={formData.distribution_start_date}
                      onChange={(e) =>
                        handleInputChange(
                          'distribution_start_date',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="statute_limitations">
                      Statute of Limitations
                    </Label>
                    <Input
                      id="statute_limitations"
                      type="date"
                      value={formData.statute_limitations}
                      onChange={(e) =>
                        handleInputChange('statute_limitations', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="final_approval_hearing">
                      Final Approval Hearing
                    </Label>
                    <Input
                      id="final_approval_hearing"
                      type="date"
                      value={formData.final_approval_hearing}
                      onChange={(e) =>
                        handleInputChange(
                          'final_approval_hearing',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="total_settlement_amount">
                    Total Settlement Amount
                  </Label>
                  <Input
                    id="total_settlement_amount"
                    value={formData.total_settlement_amount}
                    onChange={(e) =>
                      handleCurrencyChange(
                        'total_settlement_amount',
                        e.target.value
                      )
                    }
                    placeholder="0.00"
                    className={
                      errors.total_settlement_amount ? 'border-red-500' : ''
                    }
                  />
                  {errors.total_settlement_amount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.total_settlement_amount}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="administrative_costs">
                      Administrative Costs
                    </Label>
                    <Input
                      id="administrative_costs"
                      value={formData.administrative_costs}
                      onChange={(e) =>
                        handleCurrencyChange(
                          'administrative_costs',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className={
                        errors.administrative_costs ? 'border-red-500' : ''
                      }
                    />
                    {errors.administrative_costs && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.administrative_costs}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="attorney_fees">Attorney Fees</Label>
                    <Input
                      id="attorney_fees"
                      value={formData.attorney_fees}
                      onChange={(e) =>
                        handleCurrencyChange('attorney_fees', e.target.value)
                      }
                      placeholder="0.00"
                      className={errors.attorney_fees ? 'border-red-500' : ''}
                    />
                    {errors.attorney_fees && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.attorney_fees}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="court_costs">Court Costs</Label>
                    <Input
                      id="court_costs"
                      value={formData.court_costs}
                      onChange={(e) =>
                        handleCurrencyChange('court_costs', e.target.value)
                      }
                      placeholder="0.00"
                      className={errors.court_costs ? 'border-red-500' : ''}
                    />
                    {errors.court_costs && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.court_costs}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Case Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes or important information about this case..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Case
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NewCasePage;
