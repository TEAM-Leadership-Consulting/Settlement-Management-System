'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Clock,
  DollarSign,
  Users,
  FileText,
  Mail,
  Phone,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Download,
} from 'lucide-react';

interface FormData {
  clientType: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  preferredContact: string;
  additionalContacts: Array<{
    name: string;
    email: string;
    phone: string;
    title: string;
  }>;
  caseTitle: string;
  caseFriendlyTitle: string;
  caseType: string;
  estimatedClaimants: string;
  estimatedSettlement: string;
  jurisdiction: string;
  courtName: string;
  projectScope: string[];
  noticeFormsCount: string;
  costPerForm: string;
  claimsToProcess: string;
  costPerProcessedClaim: string;
  costPerPayment: string;
  callCenterTypes: string[];
  liveAgentHourlyRate: string;
  liveAgentEstimatedHours: string;
  ivrCost: string;
  multipleLanguagesCallCenter: boolean;
  callCenterLanguages: string[];
  costPerAdditionalLanguage: string;
  websiteTypes: string[];
  staticSiteCost: string;
  dataCaptureSiteCost: string;
  reportingTypes: string[];
  standardReportsCost: string;
  customReportingHourlyRate: string;
  customReportingEstimatedHours: string;
  filesToImport: string;
  dataImportCost: string;
  needDataCleaning: boolean;
  dataCleaningHourlyRate: string;
  needNCOA: boolean;
  ncoaCostPerRecord: string;
  emailsToSend: string;
  emailCostPer: string;
  timeline: string;
  specialRequirements: Array<{
    description: string;
    hourlyRate: string;
    estimatedHours: string;
  }>;
  isCappedCase: boolean;
  caseManagerHourlyRate: string;
  projectCoordinatorHourlyRate: string;
  otherRoleHourlyRate: string;
  otherRoleDescription: string;
  budget: string;
  startDate: string;
  paymentsToDistribute?: string;
}

interface FormErrors {
  [key: string]: string;
}

// Define the type for estimate data used in PDF generation
interface EstimateData {
  client_type?: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  case_title?: string;
  case_type?: string;
  jurisdiction?: string;
  estimated_claimants?: string;
  estimated_settlement?: string;
  project_scope?: string[];
  timeline?: string;
  budget?: string;
  start_date?: string;
  special_requirements?: Array<{
    description: string;
    hourlyRate: string;
    estimatedHours: string;
  }>;
}

const EstimateForm = () => {
  const { userProfile } = useAuth();
  const router = useRouter();

  // State declarations
  const [formData, setFormData] = useState<FormData>({
    clientType: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    preferredContact: '',
    additionalContacts: [],
    caseTitle: '',
    caseFriendlyTitle: '',
    caseType: '',
    estimatedClaimants: '',
    estimatedSettlement: '',
    jurisdiction: '',
    courtName: '',
    projectScope: [],
    noticeFormsCount: '',
    costPerForm: '',
    claimsToProcess: '',
    costPerProcessedClaim: '',
    costPerPayment: '',
    callCenterTypes: [],
    liveAgentHourlyRate: '',
    liveAgentEstimatedHours: '',
    ivrCost: '',
    multipleLanguagesCallCenter: false,
    callCenterLanguages: [],
    costPerAdditionalLanguage: '',
    websiteTypes: [],
    staticSiteCost: '',
    dataCaptureSiteCost: '',
    reportingTypes: [],
    standardReportsCost: '',
    customReportingHourlyRate: '',
    customReportingEstimatedHours: '',
    filesToImport: '',
    dataImportCost: '',
    needDataCleaning: false,
    dataCleaningHourlyRate: '',
    needNCOA: false,
    ncoaCostPerRecord: '',
    emailsToSend: '',
    emailCostPer: '',
    timeline: '',
    specialRequirements: [
      { description: '', hourlyRate: '', estimatedHours: '' },
    ],
    isCappedCase: false,
    caseManagerHourlyRate: '',
    projectCoordinatorHourlyRate: '',
    otherRoleHourlyRate: '',
    otherRoleDescription: '',
    budget: '',
    startDate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return cleanPhone.length >= 10 && phoneRegex.test(cleanPhone);
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
      6,
      10
    )}`;
  };

  // Event handlers
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | string[]
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (value: string): void => {
    const formatted = formatPhone(value);
    handleInputChange('phone', formatted);
  };

  const handleArrayChange = (
    field: keyof FormData,
    value: string,
    checked: boolean
  ): void => {
    setFormData((prev) => {
      const currentArray = (prev[field] as string[]) || [];
      return {
        ...prev,
        [field]: checked
          ? [...currentArray, value]
          : currentArray.filter((item: string) => item !== value),
      } as FormData;
    });
  };

  const addAdditionalContact = (): void => {
    setFormData((prev) => ({
      ...prev,
      additionalContacts: [
        ...prev.additionalContacts,
        { name: '', email: '', phone: '', title: '' },
      ],
    }));
  };

  const removeAdditionalContact = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      additionalContacts: prev.additionalContacts.filter((_, i) => i !== index),
    }));
  };

  const updateAdditionalContact = (
    index: number,
    field: string,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      additionalContacts: prev.additionalContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  const addSpecialRequirement = (): void => {
    setFormData((prev) => ({
      ...prev,
      specialRequirements: [
        ...prev.specialRequirements,
        { description: '', hourlyRate: '', estimatedHours: '' },
      ],
    }));
  };

  const removeSpecialRequirement = (index: number): void => {
    if (formData.specialRequirements.length > 1) {
      setFormData((prev) => ({
        ...prev,
        specialRequirements: prev.specialRequirements.filter(
          (_, i) => i !== index
        ),
      }));
    }
  };

  const updateSpecialRequirement = (
    index: number,
    field: string,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      specialRequirements: prev.specialRequirements.map((req, i) =>
        i === index ? { ...req, [field]: value } : req
      ),
    }));
  };

  const handleCancel = () => {
    if (
      confirm('Are you sure you want to cancel? All progress will be lost.')
    ) {
      router.push('/dashboard');
    }
  };

  const generatePDF = async (
    estimateData: EstimateData,
    estimateNumber: string
  ) => {
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Settlement Management System - Estimate ${estimateNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
            .field-group { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #374151; }
            .field-value { margin-left: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .list-item { margin-left: 20px; margin-bottom: 5px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Settlement Management System</h1>
            <h2>Project Estimate ${estimateNumber}</h2>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <div class="section-title">Client Information</div>
            <div class="grid">
              <div class="field-group">
                <span class="field-label">Client Type:</span>
                <span class="field-value">${
                  estimateData.client_type || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Company:</span>
                <span class="field-value">${
                  estimateData.company_name || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Contact Name:</span>
                <span class="field-value">${
                  estimateData.contact_name || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Email:</span>
                <span class="field-value">${
                  estimateData.email || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Phone:</span>
                <span class="field-value">${
                  estimateData.phone || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Website:</span>
                <span class="field-value">${
                  estimateData.website || 'Not specified'
                }</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Case Information</div>
            <div class="field-group">
              <span class="field-label">Case Title:</span>
              <span class="field-value">${
                estimateData.case_title || 'Not specified'
              }</span>
            </div>
            <div class="grid">
              <div class="field-group">
                <span class="field-label">Case Type:</span>
                <span class="field-value">${
                  estimateData.case_type || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Jurisdiction:</span>
                <span class="field-value">${
                  estimateData.jurisdiction || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Estimated Claimants:</span>
                <span class="field-value">${
                  estimateData.estimated_claimants || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Estimated Settlement:</span>
                <span class="field-value">${
                  estimateData.estimated_settlement || 'Not specified'
                }</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Project Scope</div>
            ${
              estimateData.project_scope &&
              estimateData.project_scope.length > 0
                ? estimateData.project_scope
                    .map(
                      (scope: string) =>
                        `<div class="list-item">• ${scope}</div>`
                    )
                    .join('')
                : '<div class="field-value">No project scope specified</div>'
            }
          </div>

          <div class="section">
            <div class="section-title">Timeline & Budget</div>
            <div class="grid">
              <div class="field-group">
                <span class="field-label">Timeline:</span>
                <span class="field-value">${
                  estimateData.timeline || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Budget Range:</span>
                <span class="field-value">${
                  estimateData.budget || 'Not specified'
                }</span>
              </div>
              <div class="field-group">
                <span class="field-label">Preferred Start Date:</span>
                <span class="field-value">${
                  estimateData.start_date || 'Not specified'
                }</span>
              </div>
            </div>
          </div>

          ${
            estimateData.special_requirements &&
            estimateData.special_requirements.length > 0 &&
            estimateData.special_requirements[0]?.description
              ? `
            <div class="section">
              <div class="section-title">Special Requirements</div>
              ${estimateData.special_requirements
                .map(
                  (req, index) => `
                <div class="field-group">
                  <span class="field-label">Requirement ${index + 1}:</span>
                  <div class="field-value">${
                    req?.description || 'No description'
                  }</div>
                  ${
                    req?.hourlyRate
                      ? `<div class="field-value">Rate: ${req.hourlyRate}</div>`
                      : ''
                  }
                  ${
                    req?.estimatedHours
                      ? `<div class="field-value">Hours: ${req.estimatedHours}</div>`
                      : ''
                  }
                </div>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }

          <div class="footer">
            <p>Settlement Management System - Professional Legal Administration</p>
            <p>Contact: (555) 123-4567 | estimates@settlement.com</p>
            <p>This estimate is valid for 30 days from the date of generation.</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estimate-${estimateNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      alert(
        `Estimate ${estimateNumber} has been downloaded as an HTML file. You can open this file in any browser and print it as a PDF, or use online HTML-to-PDF converters for sharing.`
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.companyName.trim())
      newErrors.companyName = 'Law firm or company name is required';
    if (!formData.contactName.trim())
      newErrors.contactName = 'Contact name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.clientType) newErrors.clientType = 'Client type is required';
    if (!formData.caseTitle.trim())
      newErrors.caseTitle = 'Case title is required';
    if (!formData.caseType) newErrors.caseType = 'Case type is required';
    if (!formData.estimatedClaimants.trim())
      newErrors.estimatedClaimants = 'Estimated claimants is required';
    if (!formData.projectScope.length)
      newErrors.projectScope = 'Please select at least one project scope';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate estimate number
      const estimateNumber = `EST-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

      // Prepare data for database - map form fields to database schema
      const estimateData = {
        estimate_number: estimateNumber,
        // Map form fields to existing database columns
        client_type: formData.clientType,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || null,
        preferred_contact: formData.preferredContact || null,
        case_title: formData.caseTitle,
        case_friendly_title: formData.caseFriendlyTitle || null,
        case_type: formData.caseType,
        estimated_claimants: formData.estimatedClaimants,
        estimated_settlement: formData.estimatedSettlement || null,
        jurisdiction: formData.jurisdiction || null,
        court_name: formData.courtName || null,
        project_scope: formData.projectScope,
        timeline: formData.timeline || null,
        budget: formData.budget || null,
        start_date: formData.startDate || null,
        special_requirements: formData.specialRequirements,
        additional_contacts: formData.additionalContacts,
        form_data: formData, // Store complete form data as backup

        // Map to legacy database columns for backward compatibility
        client_company: formData.companyName,
        client_contact_name: formData.contactName,
        client_email: formData.email,
        client_phone: formData.phone,
        case_name: formData.caseTitle,
        case_description: formData.caseFriendlyTitle || null,
        estimated_class_size: formData.estimatedClaimants
          ? parseInt(formData.estimatedClaimants.replace(/[^\d]/g, '')) || null
          : null,
        estimated_settlement_amount: formData.estimatedSettlement
          ? parseFloat(formData.estimatedSettlement.replace(/[^\d.]/g, '')) ||
            null
          : null,

        // Default values for required fields
        estimate_status: 'draft',
        created_by: userProfile?.user_id || null,
        notes: `Timeline: ${formData.timeline || 'Not specified'}\nBudget: ${
          formData.budget || 'Not specified'
        }`,
      };

      // Insert into Supabase
      const { error: dbError } = await supabase
        .from('estimates')
        .insert([estimateData])
        .select()
        .single();

      if (dbError) throw dbError;

      // Generate PDF
      await generatePDF(
        {
          client_type: formData.clientType,
          company_name: formData.companyName,
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          case_title: formData.caseTitle,
          case_type: formData.caseType,
          jurisdiction: formData.jurisdiction,
          estimated_claimants: formData.estimatedClaimants,
          estimated_settlement: formData.estimatedSettlement,
          project_scope: formData.projectScope,
          timeline: formData.timeline,
          budget: formData.budget,
          start_date: formData.startDate,
          special_requirements: formData.specialRequirements,
        },
        estimateNumber
      );

      alert(
        `Estimate ${estimateNumber} submitted successfully! We will contact you within 24 hours.`
      );

      // Reset form completely
      setFormData({
        clientType: '',
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        preferredContact: '',
        additionalContacts: [],
        caseTitle: '',
        caseFriendlyTitle: '',
        caseType: '',
        estimatedClaimants: '',
        estimatedSettlement: '',
        jurisdiction: '',
        courtName: '',
        projectScope: [],
        noticeFormsCount: '',
        costPerForm: '',
        claimsToProcess: '',
        costPerProcessedClaim: '',
        costPerPayment: '',
        callCenterTypes: [],
        liveAgentHourlyRate: '',
        liveAgentEstimatedHours: '',
        ivrCost: '',
        multipleLanguagesCallCenter: false,
        callCenterLanguages: [],
        costPerAdditionalLanguage: '',
        websiteTypes: [],
        staticSiteCost: '',
        dataCaptureSiteCost: '',
        reportingTypes: [],
        standardReportsCost: '',
        customReportingHourlyRate: '',
        customReportingEstimatedHours: '',
        filesToImport: '',
        dataImportCost: '',
        needDataCleaning: false,
        dataCleaningHourlyRate: '',
        needNCOA: false,
        ncoaCostPerRecord: '',
        emailsToSend: '',
        emailCostPer: '',
        timeline: '',
        specialRequirements: [
          { description: '', hourlyRate: '', estimatedHours: '' },
        ],
        isCappedCase: false,
        caseManagerHourlyRate: '',
        projectCoordinatorHourlyRate: '',
        otherRoleHourlyRate: '',
        otherRoleDescription: '',
        budget: '',
        startDate: '',
      });

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting estimate:', error);
      setError('Error submitting estimate. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                generatePDF(
                  {
                    client_type: formData.clientType,
                    company_name: formData.companyName,
                    contact_name: formData.contactName,
                    email: formData.email,
                    phone: formData.phone,
                    website: formData.website,
                    case_title: formData.caseTitle,
                    case_type: formData.caseType,
                    jurisdiction: formData.jurisdiction,
                    estimated_claimants: formData.estimatedClaimants,
                    estimated_settlement: formData.estimatedSettlement,
                    project_scope: formData.projectScope,
                    timeline: formData.timeline,
                    budget: formData.budget,
                    start_date: formData.startDate,
                    special_requirements: formData.specialRequirements,
                  },
                  'PREVIEW'
                )
              }
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Download className="h-4 w-4" />
              Preview/Download
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Settlement Management System
          </h1>
          <p className="text-xl text-gray-600">Build Your Case Estimate</p>
        </div>

        <div className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Client Type *</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="class-counsel"
                      checked={formData.clientType === 'class-counsel'}
                      onCheckedChange={(checked) =>
                        checked &&
                        handleInputChange('clientType', 'class-counsel')
                      }
                    />
                    <Label htmlFor="class-counsel">Class Counsel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="defense-counsel"
                      checked={formData.clientType === 'defense-counsel'}
                      onCheckedChange={(checked) =>
                        checked &&
                        handleInputChange('clientType', 'defense-counsel')
                      }
                    />
                    <Label htmlFor="defense-counsel">Defense Counsel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="other-client"
                      checked={formData.clientType === 'other'}
                      onCheckedChange={(checked) =>
                        checked && handleInputChange('clientType', 'other')
                      }
                    />
                    <Label htmlFor="other-client">Other</Label>
                  </div>
                </div>
                {errors.clientType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.clientType}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@lawfirm.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(555) 123-4567"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange('website', e.target.value)
                    }
                    placeholder="https://www.lawfirm.com"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredContact">
                    Preferred Contact Method
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange('preferredContact', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="video-call">Video Call</SelectItem>
                      <SelectItem value="in-person">
                        In-Person Meeting
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Contacts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Additional Contacts</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAdditionalContact}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </Button>
                </div>

                {formData.additionalContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 mb-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Label className="font-medium">Contact {index + 1}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAdditionalContact(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Name"
                        value={contact.name}
                        onChange={(e) =>
                          updateAdditionalContact(index, 'name', e.target.value)
                        }
                      />
                      <Input
                        placeholder="Title"
                        value={contact.title}
                        onChange={(e) =>
                          updateAdditionalContact(
                            index,
                            'title',
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={contact.email}
                        onChange={(e) =>
                          updateAdditionalContact(
                            index,
                            'email',
                            e.target.value
                          )
                        }
                      />
                      <Input
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(e) =>
                          updateAdditionalContact(
                            index,
                            'phone',
                            formatPhone(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Case Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="caseTitle">
                  Case Title (as seen on court documents) *
                </Label>
                <Input
                  id="caseTitle"
                  value={formData.caseTitle}
                  onChange={(e) =>
                    handleInputChange('caseTitle', e.target.value)
                  }
                  placeholder="Smith v. ABC Corporation"
                  className={errors.caseTitle ? 'border-red-500' : ''}
                />
                {errors.caseTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.caseTitle}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="caseFriendlyTitle">Case Friendly Title</Label>
                <Input
                  id="caseFriendlyTitle"
                  value={formData.caseFriendlyTitle}
                  onChange={(e) =>
                    handleInputChange('caseFriendlyTitle', e.target.value)
                  }
                  placeholder="Shortened name for internal use"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseType">Case Type *</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange('caseType', value)
                    }
                  >
                    <SelectTrigger
                      className={errors.caseType ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class-action">Class Action</SelectItem>
                      <SelectItem value="mass-tort">Mass Tort</SelectItem>
                      <SelectItem value="antitrust">Antitrust</SelectItem>
                      <SelectItem value="securities">
                        Securities Fraud
                      </SelectItem>
                      <SelectItem value="employment">Employment</SelectItem>
                      <SelectItem value="consumer-protection">
                        Consumer Protection
                      </SelectItem>
                      <SelectItem value="data-breach">Data Breach</SelectItem>
                      <SelectItem value="pharmaceutical">
                        Pharmaceutical
                      </SelectItem>
                      <SelectItem value="medical-device">
                        Medical Device
                      </SelectItem>
                      <SelectItem value="environmental">
                        Environmental
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.caseType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.caseType}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={(e) =>
                      handleInputChange('jurisdiction', e.target.value)
                    }
                    placeholder="Federal, California, New York, etc."
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedClaimants">
                    Estimated Number of Claimants *
                  </Label>
                  <Input
                    id="estimatedClaimants"
                    value={formData.estimatedClaimants}
                    onChange={(e) =>
                      handleInputChange('estimatedClaimants', e.target.value)
                    }
                    placeholder="e.g., 50, 1,000, 50,000"
                    className={
                      errors.estimatedClaimants ? 'border-red-500' : ''
                    }
                  />
                  {errors.estimatedClaimants && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.estimatedClaimants}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="estimatedSettlement">
                    Estimated Settlement Amount
                  </Label>
                  <Input
                    id="estimatedSettlement"
                    value={formData.estimatedSettlement}
                    onChange={(e) =>
                      handleInputChange('estimatedSettlement', e.target.value)
                    }
                    placeholder="$10,000,000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="courtName">Court Name</Label>
                <Input
                  id="courtName"
                  value={formData.courtName}
                  onChange={(e) =>
                    handleInputChange('courtName', e.target.value)
                  }
                  placeholder="U.S. District Court for the Central District of California"
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Scope */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Project Scope *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Notice Design & Distribution */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notice-design"
                      checked={formData.projectScope.includes(
                        'Notice Design & Distribution'
                      )}
                      onCheckedChange={(checked) =>
                        handleArrayChange(
                          'projectScope',
                          'Notice Design & Distribution',
                          !!checked
                        )
                      }
                    />
                    <Label htmlFor="notice-design">
                      Notice Design & Distribution
                    </Label>
                  </div>
                  {formData.projectScope.includes(
                    'Notice Design & Distribution'
                  ) && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="noticeFormsCount">
                            How many forms will need to be created?
                          </Label>
                          <Input
                            id="noticeFormsCount"
                            value={formData.noticeFormsCount}
                            onChange={(e) =>
                              handleInputChange(
                                'noticeFormsCount',
                                e.target.value
                              )
                            }
                            placeholder="e.g., 3 (postcard, check stub, notice mailing)"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="costPerForm">Cost per form</Label>
                          <Input
                            id="costPerForm"
                            value={formData.costPerForm}
                            onChange={(e) =>
                              handleInputChange('costPerForm', e.target.value)
                            }
                            placeholder="$2,500 per form"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Claims Processing */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="claims-processing"
                      checked={formData.projectScope.includes(
                        'Claims Processing'
                      )}
                      onCheckedChange={(checked) =>
                        handleArrayChange(
                          'projectScope',
                          'Claims Processing',
                          !!checked
                        )
                      }
                    />
                    <Label htmlFor="claims-processing">Claims Processing</Label>
                  </div>
                  {formData.projectScope.includes('Claims Processing') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="claimsToProcess">
                            Estimated number of claims to process
                          </Label>
                          <Input
                            id="claimsToProcess"
                            value={formData.claimsToProcess}
                            onChange={(e) =>
                              handleInputChange(
                                'claimsToProcess',
                                e.target.value
                              )
                            }
                            placeholder="e.g., 1,000"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="costPerProcessedClaim">
                            Cost per processed claim
                          </Label>
                          <Input
                            id="costPerProcessedClaim"
                            value={formData.costPerProcessedClaim}
                            onChange={(e) =>
                              handleInputChange(
                                'costPerProcessedClaim',
                                e.target.value
                              )
                            }
                            placeholder="$15 per claim"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Distribution */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="payment-distribution"
                      checked={formData.projectScope.includes(
                        'Payment Distribution'
                      )}
                      onCheckedChange={(checked) =>
                        handleArrayChange(
                          'projectScope',
                          'Payment Distribution',
                          !!checked
                        )
                      }
                    />
                    <Label htmlFor="payment-distribution">
                      Payment Distribution
                    </Label>
                  </div>
                  {formData.projectScope.includes('Payment Distribution') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="paymentsToDistribute">
                            Estimated number of payments
                          </Label>
                          <Input
                            id="paymentsToDistribute"
                            value={formData.paymentsToDistribute || ''}
                            onChange={(e) =>
                              handleInputChange(
                                'paymentsToDistribute',
                                e.target.value
                              )
                            }
                            placeholder="e.g., 500"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="costPerPayment">
                            Cost per payment
                          </Label>
                          <Input
                            id="costPerPayment"
                            value={formData.costPerPayment}
                            onChange={(e) =>
                              handleInputChange(
                                'costPerPayment',
                                e.target.value
                              )
                            }
                            placeholder="$3.50 per payment"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Call Center Services */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="call-center"
                      checked={formData.projectScope.includes(
                        'Call Center Services'
                      )}
                      onCheckedChange={(checked) =>
                        handleArrayChange(
                          'projectScope',
                          'Call Center Services',
                          !!checked
                        )
                      }
                    />
                    <Label htmlFor="call-center">Call Center Services</Label>
                  </div>
                  {formData.projectScope.includes('Call Center Services') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div>
                        <Label>Service Type (select all that apply)</Label>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="live-agents"
                              checked={
                                formData.callCenterTypes &&
                                formData.callCenterTypes.includes('live-agents')
                              }
                              onCheckedChange={(checked) =>
                                handleArrayChange(
                                  'callCenterTypes',
                                  'live-agents',
                                  !!checked
                                )
                              }
                            />
                            <Label htmlFor="live-agents">Live Agents</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ivr"
                              checked={
                                formData.callCenterTypes &&
                                formData.callCenterTypes.includes('ivr')
                              }
                              onCheckedChange={(checked) =>
                                handleArrayChange(
                                  'callCenterTypes',
                                  'ivr',
                                  !!checked
                                )
                              }
                            />
                            <Label htmlFor="ivr">IVR</Label>
                          </div>
                        </div>
                      </div>

                      {formData.callCenterTypes &&
                        formData.callCenterTypes.includes('live-agents') && (
                          <div className="border rounded-lg p-3 bg-blue-50">
                            <h4 className="font-medium mb-2">Live Agents</h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="liveAgentHourlyRate">
                                  Hourly Cost
                                </Label>
                                <Input
                                  id="liveAgentHourlyRate"
                                  value={formData.liveAgentHourlyRate}
                                  onChange={(e) =>
                                    handleInputChange(
                                      'liveAgentHourlyRate',
                                      e.target.value
                                    )
                                  }
                                  placeholder="$25/hour"
                                />
                              </div>
                              <div>
                                <Label htmlFor="liveAgentEstimatedHours">
                                  Estimated Hours Needed
                                </Label>
                                <Input
                                  id="liveAgentEstimatedHours"
                                  value={formData.liveAgentEstimatedHours}
                                  onChange={(e) =>
                                    handleInputChange(
                                      'liveAgentEstimatedHours',
                                      e.target.value
                                    )
                                  }
                                  placeholder="40 hours"
                                />
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="multipleLanguagesCallCenter"
                                  checked={formData.multipleLanguagesCallCenter}
                                  onCheckedChange={(checked) =>
                                    handleInputChange(
                                      'multipleLanguagesCallCenter',
                                      checked
                                    )
                                  }
                                />
                                <Label htmlFor="multipleLanguagesCallCenter">
                                  Multiple languages needed
                                </Label>
                              </div>

                              {formData.multipleLanguagesCallCenter && (
                                <div className="mt-2 space-y-3">
                                  <div>
                                    <Label htmlFor="costPerAdditionalLanguage">
                                      Cost per additional language
                                    </Label>
                                    <Input
                                      id="costPerAdditionalLanguage"
                                      value={formData.costPerAdditionalLanguage}
                                      onChange={(e) =>
                                        handleInputChange(
                                          'costPerAdditionalLanguage',
                                          e.target.value
                                        )
                                      }
                                      placeholder="$5/hour per language"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label>Required Languages</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                      {[
                                        'Spanish',
                                        'French',
                                        'Chinese',
                                        'Korean',
                                        'Vietnamese',
                                        'Portuguese',
                                        'Russian',
                                        'Arabic',
                                      ].map((language) => (
                                        <div
                                          key={language}
                                          className="flex items-center space-x-2"
                                        >
                                          <Checkbox
                                            id={`call-center-${language}`}
                                            checked={
                                              formData.callCenterLanguages &&
                                              formData.callCenterLanguages.includes(
                                                language
                                              )
                                            }
                                            onCheckedChange={(checked) =>
                                              handleArrayChange(
                                                'callCenterLanguages',
                                                language,
                                                !!checked
                                              )
                                            }
                                          />
                                          <Label
                                            htmlFor={`call-center-${language}`}
                                          >
                                            {language}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {formData.callCenterTypes &&
                        formData.callCenterTypes.includes('ivr') && (
                          <div className="border rounded-lg p-3 bg-green-50">
                            <h4 className="font-medium mb-2">IVR</h4>
                            <div>
                              <Label htmlFor="ivrCost">Cost for IVR</Label>
                              <Input
                                id="ivrCost"
                                value={formData.ivrCost}
                                onChange={(e) =>
                                  handleInputChange('ivrCost', e.target.value)
                                }
                                placeholder="$2,500 setup + $500/month"
                              />
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Website Development */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="website-development"
                      checked={formData.projectScope.includes(
                        'Website Development'
                      )}
                      onCheckedChange={(checked) =>
                        handleArrayChange(
                          'projectScope',
                          'Website Development',
                          !!checked
                        )
                      }
                    />
                    <Label htmlFor="website-development">
                      Website Development
                    </Label>
                  </div>
                  {formData.projectScope.includes('Website Development') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div>
                        <Label>Website Type</Label>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="static-site"
                              checked={
                                formData.websiteTypes &&
                                formData.websiteTypes.includes('static')
                              }
                              onCheckedChange={(checked) =>
                                handleArrayChange(
                                  'websiteTypes',
                                  'static',
                                  !!checked
                                )
                              }
                            />
                            <Label htmlFor="static-site">Static Site</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="data-capture-site"
                              checked={
                                formData.websiteTypes &&
                                formData.websiteTypes.includes('data-capture')
                              }
                              onCheckedChange={(checked) =>
                                handleArrayChange(
                                  'websiteTypes',
                                  'data-capture',
                                  !!checked
                                )
                              }
                            />
                            <Label htmlFor="data-capture-site">
                              Data Capture Site
                            </Label>
                          </div>
                        </div>
                      </div>

                      {formData.websiteTypes &&
                        formData.websiteTypes.includes('static') && (
                          <div className="border rounded-lg p-3 bg-blue-50">
                            <h4 className="font-medium mb-2">Static Site</h4>
                            <div>
                              <Label htmlFor="staticSiteCost">
                                Cost per static site
                              </Label>
                              <Input
                                id="staticSiteCost"
                                value={formData.staticSiteCost}
                                onChange={(e) =>
                                  handleInputChange(
                                    'staticSiteCost',
                                    e.target.value
                                  )
                                }
                                placeholder="$5,000"
                              />
                            </div>
                          </div>
                        )}

                      {formData.websiteTypes &&
                        formData.websiteTypes.includes('data-capture') && (
                          <div className="border rounded-lg p-3 bg-green-50">
                            <h4 className="font-medium mb-2">
                              Data Capture Site
                            </h4>
                            <div>
                              <Label htmlFor="dataCaptureSiteCost">
                                Cost per data capture site
                              </Label>
                              <Input
                                id="dataCaptureSiteCost"
                                value={formData.dataCaptureSiteCost}
                                onChange={(e) =>
                                  handleInputChange(
                                    'dataCaptureSiteCost',
                                    e.target.value
                                  )
                                }
                                placeholder="$15,000"
                              />
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Reporting & Analytics */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reporting-analytics"
                      checked={formData.projectScope.includes(
                        'Reporting & Analytics'
                      )}
                      onCheckedChange={(checked) =>
                        handleArrayChange(
                          'projectScope',
                          'Reporting & Analytics',
                          !!checked
                        )
                      }
                    />
                    <Label htmlFor="reporting-analytics">
                      Reporting & Analytics
                    </Label>
                  </div>
                  {formData.projectScope.includes('Reporting & Analytics') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div>
                        <Label>Reporting Type</Label>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="standard-reporting"
                              checked={
                                formData.reportingTypes &&
                                formData.reportingTypes.includes('standard')
                              }
                              onCheckedChange={(checked) =>
                                handleArrayChange(
                                  'reportingTypes',
                                  'standard',
                                  !!checked
                                )
                              }
                            />
                            <Label htmlFor="standard-reporting">Standard</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="custom-reporting"
                              checked={
                                formData.reportingTypes &&
                                formData.reportingTypes.includes('custom')
                              }
                              onCheckedChange={(checked) =>
                                handleArrayChange(
                                  'reportingTypes',
                                  'custom',
                                  !!checked
                                )
                              }
                            />
                            <Label htmlFor="custom-reporting">Custom</Label>
                          </div>
                        </div>
                      </div>

                      {formData.reportingTypes &&
                        formData.reportingTypes.includes('standard') && (
                          <div className="border rounded-lg p-3 bg-blue-50">
                            <h4 className="font-medium mb-2">
                              Standard Suite of Reports
                            </h4>
                            <div>
                              <Label htmlFor="standardReportsCost">
                                Cost for standard suite of reports
                              </Label>
                              <Input
                                id="standardReportsCost"
                                value={formData.standardReportsCost}
                                onChange={(e) =>
                                  handleInputChange(
                                    'standardReportsCost',
                                    e.target.value
                                  )
                                }
                                placeholder="$3,500"
                              />
                            </div>
                          </div>
                        )}

                      {formData.reportingTypes &&
                        formData.reportingTypes.includes('custom') && (
                          <div className="border rounded-lg p-3 bg-green-50">
                            <h4 className="font-medium mb-2">
                              Custom Reporting
                            </h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="customReportingHourlyRate">
                                  Hourly rate for custom report creation
                                </Label>
                                <Input
                                  id="customReportingHourlyRate"
                                  value={formData.customReportingHourlyRate}
                                  onChange={(e) =>
                                    handleInputChange(
                                      'customReportingHourlyRate',
                                      e.target.value
                                    )
                                  }
                                  placeholder="$150/hour"
                                />
                              </div>
                              <div>
                                <Input
                                  id="customReportingEstimatedHours"
                                  value={formData.customReportingEstimatedHours}
                                  onChange={(e) =>
                                    handleInputChange(
                                      'customReportingEstimatedHours',
                                      e.target.value
                                    )
                                  }
                                  placeholder="20 hours"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Data Import/Migration */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="data-import"
                      checked={formData.projectScope.includes(
                        'Data Import/Migration'
                      )}
                      onCheckedChange={(checked) =>
                        handleArrayChange(
                          'projectScope',
                          'Data Import/Migration',
                          !!checked
                        )
                      }
                    />
                    <Label htmlFor="data-import">Data Import/Migration</Label>
                  </div>
                  {formData.projectScope.includes('Data Import/Migration') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="filesToImport">
                            How many files will need to be imported?
                          </Label>
                          <Input
                            id="filesToImport"
                            value={formData.filesToImport}
                            onChange={(e) =>
                              handleInputChange('filesToImport', e.target.value)
                            }
                            placeholder="e.g., 5 files"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dataImportCost">
                            Cost for data import
                          </Label>
                          <Input
                            id="dataImportCost"
                            value={formData.dataImportCost}
                            onChange={(e) =>
                              handleInputChange(
                                'dataImportCost',
                                e.target.value
                              )
                            }
                            placeholder="$500 per file"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="needDataCleaning"
                            checked={formData.needDataCleaning}
                            onCheckedChange={(checked) =>
                              handleInputChange('needDataCleaning', checked)
                            }
                          />
                          <Label htmlFor="needDataCleaning">
                            Need to clean/scrub/remove duplicates from data
                          </Label>
                        </div>

                        {formData.needDataCleaning && (
                          <div className="mt-2 border rounded-lg p-3 bg-yellow-50">
                            <h4 className="font-medium mb-2">Data Cleaning</h4>
                            <div>
                              <Label htmlFor="dataCleaningHourlyRate">
                                Hourly rate for data cleaning work
                              </Label>
                              <Input
                                id="dataCleaningHourlyRate"
                                value={formData.dataCleaningHourlyRate}
                                onChange={(e) =>
                                  handleInputChange(
                                    'dataCleaningHourlyRate',
                                    e.target.value
                                  )
                                }
                                placeholder="$75/hour"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="needNCOA"
                            checked={formData.needNCOA}
                            onCheckedChange={(checked) =>
                              handleInputChange('needNCOA', checked)
                            }
                          />
                          <Label htmlFor="needNCOA">
                            Need to run NCOA or ACS
                          </Label>
                        </div>

                        {formData.needNCOA && (
                          <div className="mt-2 border rounded-lg p-3 bg-purple-50">
                            <h4 className="font-medium mb-2">
                              NCOA/ACS Processing
                            </h4>
                            <div>
                              <Label htmlFor="ncoaCostPerRecord">
                                Cost per record
                              </Label>
                              <Input
                                id="ncoaCostPerRecord"
                                value={formData.ncoaCostPerRecord}
                                onChange={(e) =>
                                  handleInputChange(
                                    'ncoaCostPerRecord',
                                    e.target.value
                                  )
                                }
                                placeholder="$0.15 per record"
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Campaign */}
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-campaign"
                      checked={formData.projectScope.includes('Email Campaign')}
                      onCheckedChange={(checked) =>
                        handleArrayChange(
                          'projectScope',
                          'Email Campaign',
                          !!checked
                        )
                      }
                    />
                    <Label htmlFor="email-campaign">Email Campaign</Label>
                  </div>
                  {formData.projectScope.includes('Email Campaign') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="emailsToSend">
                            Estimated number of emails to send
                          </Label>
                          <Input
                            id="emailsToSend"
                            value={formData.emailsToSend}
                            onChange={(e) =>
                              handleInputChange('emailsToSend', e.target.value)
                            }
                            placeholder="e.g., 10,000"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emailCostPer">
                            Estimated cost per email
                          </Label>
                          <Input
                            id="emailCostPer"
                            value={formData.emailCostPer}
                            onChange={(e) =>
                              handleInputChange('emailCostPer', e.target.value)
                            }
                            placeholder="$0.05 per email"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errors.projectScope && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.projectScope}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline & Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Expected Timeline</Label>
                  <RadioGroup
                    value={formData.timeline}
                    onValueChange={(value) =>
                      handleInputChange('timeline', value)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <Label htmlFor="immediate">Immediate (1-2 weeks)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="urgent" />
                      <Label htmlFor="urgent">Urgent (3-4 weeks)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard">Standard (1-2 months)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flexible" id="flexible" />
                      <Label htmlFor="flexible">Flexible (3+ months)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="startDate">Preferred Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange('startDate', e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Special Requirements</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecialRequirement}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Requirement
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.specialRequirements.map((requirement, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="font-medium">
                      Requirement {index + 1}
                    </Label>
                    {formData.specialRequirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecialRequirement(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={requirement.description}
                        onChange={(e) =>
                          updateSpecialRequirement(
                            index,
                            'description',
                            e.target.value
                          )
                        }
                        placeholder="Describe the special requirement..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label>Hourly Rate</Label>
                        <Input
                          value={requirement.hourlyRate}
                          onChange={(e) =>
                            updateSpecialRequirement(
                              index,
                              'hourlyRate',
                              e.target.value
                            )
                          }
                          placeholder="$100/hour"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Estimated Hours</Label>
                        <Input
                          value={requirement.estimatedHours}
                          onChange={(e) =>
                            updateSpecialRequirement(
                              index,
                              'estimatedHours',
                              e.target.value
                            )
                          }
                          placeholder="10 hours"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCappedCase"
                    checked={formData.isCappedCase}
                    onCheckedChange={(checked) =>
                      handleInputChange('isCappedCase', checked)
                    }
                  />
                  <Label htmlFor="isCappedCase">This is a capped case</Label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseManagerHourlyRate">
                    Case Manager Hourly Rate
                  </Label>
                  <Input
                    id="caseManagerHourlyRate"
                    value={formData.caseManagerHourlyRate}
                    onChange={(e) =>
                      handleInputChange('caseManagerHourlyRate', e.target.value)
                    }
                    placeholder="$125/hour"
                  />
                </div>
                <div>
                  <Label htmlFor="projectCoordinatorHourlyRate">
                    Project Coordinator Hourly Rate
                  </Label>
                  <Input
                    id="projectCoordinatorHourlyRate"
                    value={formData.projectCoordinatorHourlyRate}
                    onChange={(e) =>
                      handleInputChange(
                        'projectCoordinatorHourlyRate',
                        e.target.value
                      )
                    }
                    placeholder="$85/hour"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Estimated Budget Range</Label>
                <Select
                  onValueChange={(value) => handleInputChange('budget', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-50k">Under $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k-250k">
                      $100,000 - $250,000
                    </SelectItem>
                    <SelectItem value="250k-500k">
                      $250,000 - $500,000
                    </SelectItem>
                    <SelectItem value="500k-1m">
                      $500,000 - $1,000,000
                    </SelectItem>
                    <SelectItem value="over-1m">Over $1,000,000</SelectItem>
                    <SelectItem value="tbd">To be determined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-8 py-3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              size="lg"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Estimate Request'}
            </Button>
          </div>

          {/* Contact Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Our team is here to help you with your settlement
                  administration needs.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-4 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>estimates@settlement.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EstimateForm;
