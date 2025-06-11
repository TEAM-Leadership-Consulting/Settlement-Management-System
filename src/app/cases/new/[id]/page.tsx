'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  DollarSign,
  Building,
  Users,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface CaseDetail {
  case_id: number;
  case_number: string;
  case_title: string;
  case_status: string;
  case_phase: string;
  jurisdiction: string;
  court_name: string | null;
  judge_name: string | null;
  filing_date: string | null;
  claim_deadline: string | null;
  settlement_approval_date: string | null;
  distribution_start_date: string | null;
  total_settlement_amount: number | null;
  administrative_costs: number | null;
  attorney_fees: number | null;
  court_costs: number | null;
  description: string | null;
  notes: string | null;
  created_date: string;
  case_types?: {
    case_type_name: string;
    description: string;
  };
}

const CaseDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseDetail = async () => {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select(
            `
            *,
            case_types (
              case_type_name,
              description
            )
          `
          )
          .eq('case_id', caseId)
          .single();

        if (error) throw error;

        setCaseData(data);
      } catch (err) {
        console.error('Error fetching case:', err);
        setError('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCaseDetail();
    }
  }, [caseId]);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'dismissed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading case details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !caseData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-red-800 text-xl font-semibold mb-2 text-center">
              {error || 'Case Not Found'}
            </h1>
            <p className="text-red-600 text-center mb-4">
              The case you&apos;re looking for could not be loaded.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => router.push('/cases')}>
                View All Cases
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {caseData.case_title}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-gray-600">Case #{caseData.case_number}</p>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                      caseData.case_status
                    )}`}
                  >
                    {caseData.case_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => router.push(`/cases/${caseId}/edit`)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Case
              </Button>
            </div>
          </div>

          {/* Success Message for New Cases */}
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-green-700">
                Case created successfully! You can now add parties, documents,
                and manage payments.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Case Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Case Type
                      </label>
                      <p className="text-gray-900">
                        {caseData.case_types?.case_type_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Phase
                      </label>
                      <p className="text-gray-900 capitalize">
                        {caseData.case_phase.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {caseData.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <p className="text-gray-900">{caseData.description}</p>
                    </div>
                  )}
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
                      <label className="text-sm font-medium text-gray-700">
                        Jurisdiction
                      </label>
                      <p className="text-gray-900">{caseData.jurisdiction}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Court Name
                      </label>
                      <p className="text-gray-900">
                        {caseData.court_name || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {caseData.judge_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Judge
                      </label>
                      <p className="text-gray-900">{caseData.judge_name}</p>
                    </div>
                  )}
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
                      <label className="text-sm font-medium text-gray-700">
                        Filing Date
                      </label>
                      <p className="text-gray-900">
                        {formatDate(caseData.filing_date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Claim Deadline
                      </label>
                      <p className="text-gray-900">
                        {formatDate(caseData.claim_deadline)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Settlement Approval
                      </label>
                      <p className="text-gray-900">
                        {formatDate(caseData.settlement_approval_date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Distribution Start
                      </label>
                      <p className="text-gray-900">
                        {formatDate(caseData.distribution_start_date)}
                      </p>
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
                    <label className="text-sm font-medium text-gray-700">
                      Total Settlement Amount
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(caseData.total_settlement_amount)}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Administrative Costs
                      </label>
                      <p className="text-gray-900">
                        {formatCurrency(caseData.administrative_costs)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Attorney Fees
                      </label>
                      <p className="text-gray-900">
                        {formatCurrency(caseData.attorney_fees)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Court Costs
                      </label>
                      <p className="text-gray-900">
                        {formatCurrency(caseData.court_costs)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {caseData.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {caseData.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/cases/${caseId}/parties/new`)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Add Party
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      router.push(`/cases/${caseId}/documents/upload`)
                    }
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/cases/${caseId}/payments/new`)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </CardContent>
              </Card>

              {/* Case Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Case Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">
                      {formatDate(caseData.created_date)}
                    </p>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Parties:</span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Documents:</span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payments:</span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CaseDetailPage;
