"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, DollarSign, Users, FileText, Mail, Phone, Plus, Trash2 } from 'lucide-react';

const EstimateForm = () => {
  const [formData, setFormData] = useState({
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
    specialRequirements: [{ description: '', hourlyRate: '', estimatedHours: '' }],
    isCappedCase: false,
    caseManagerHourlyRate: '',
    projectCoordinatorHourlyRate: '',
    otherRoleHourlyRate: '',
    otherRoleDescription: '',
    budget: '',
    startDate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleInputChange = (field: string, value: string | boolean): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (value: string): void => {
    const formatted = formatPhone(value);
    handleInputChange('phone', formatted);
  };

  const handleArrayChange = (field: string, value: string, checked: boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(item => item !== value)
    }));
  };

  const addAdditionalContact = () => {
    setFormData(prev => ({
      ...prev,
      additionalContacts: [...prev.additionalContacts, { name: '', email: '', phone: '', title: '' }]
    }));
  };

  const removeAdditionalContact = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalContacts: prev.additionalContacts.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalContact = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalContacts: prev.additionalContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addSpecialRequirement = () => {
    setFormData(prev => ({
      ...prev,
      specialRequirements: [...prev.specialRequirements, { description: '', hourlyRate: '', estimatedHours: '' }]
    }));
  };

  const removeSpecialRequirement = (index) => {
    if (formData.specialRequirements.length > 1) {
      setFormData(prev => ({
        ...prev,
        specialRequirements: prev.specialRequirements.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSpecialRequirement = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements.map((req, i) => 
        i === index ? { ...req, [field]: value } : req
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Law firm or company name is required';
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
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
    if (!formData.caseTitle.trim()) newErrors.caseTitle = 'Case title is required';
    if (!formData.caseType) newErrors.caseType = 'Case type is required';
    if (!formData.estimatedClaimants.trim()) newErrors.estimatedClaimants = 'Estimated claimants is required';
    if (!formData.projectScope.length) newErrors.projectScope = 'Please select at least one project scope';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Estimate request submitted successfully! We will contact you within 24 hours.');
      // Reset form would go here
    } catch (error) {
  	console.error('Error submitting:', error); // Now it's used!
 	 alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Settlement Management System</h1>
          <p className="text-xl text-gray-600">Build Your Case Estimate</p>
        </div>

        <div className="space-y-8">
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
                      onCheckedChange={(checked) => checked && handleInputChange('clientType', 'class-counsel')}
                    />
                    <Label htmlFor="class-counsel">Class Counsel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="defense-counsel"
                      checked={formData.clientType === 'defense-counsel'}
                      onCheckedChange={(checked) => checked && handleInputChange('clientType', 'defense-counsel')}
                    />
                    <Label htmlFor="defense-counsel">Defense Counsel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="other-client"
                      checked={formData.clientType === 'other'}
                      onCheckedChange={(checked) => checked && handleInputChange('clientType', 'other')}
                    />
                    <Label htmlFor="other-client">Other</Label>
                  </div>
                </div>
                {errors.clientType && <p className="text-red-500 text-sm mt-1">{errors.clientType}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Law Firm or Company *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Law Firm or Company"
                    className={errors.companyName ? 'border-red-500' : ''}
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                </div>
                
                <div>
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Primary Contact Person"
                    className={errors.contactName ? 'border-red-500' : ''}
                  />
                  {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
                </div>
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
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.lawfirm.com"
                  />
                </div>

                <div>
                  <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                  <Select onValueChange={(value) => handleInputChange('preferredContact', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="video-call">Video Call</SelectItem>
                      <SelectItem value="in-person">In-Person Meeting</SelectItem>
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
                  <div key={index} className="border rounded-lg p-4 mb-3 bg-gray-50">
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
                        onChange={(e) => updateAdditionalContact(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Title"
                        value={contact.title}
                        onChange={(e) => updateAdditionalContact(index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateAdditionalContact(index, 'email', e.target.value)}
                      />
                      <Input
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(e) => updateAdditionalContact(index, 'phone', formatPhone(e.target.value))}
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
                <Label htmlFor="caseTitle">Case Title (as seen on court documents) *</Label>
                <Input
                  id="caseTitle"
                  value={formData.caseTitle}
                  onChange={(e) => handleInputChange('caseTitle', e.target.value)}
                  placeholder="Smith v. ABC Corporation"
                  className={errors.caseTitle ? 'border-red-500' : ''}
                />
                {errors.caseTitle && <p className="text-red-500 text-sm mt-1">{errors.caseTitle}</p>}
              </div>

              <div>
                <Label htmlFor="caseFriendlyTitle">Case Friendly Title</Label>
                <Input
                  id="caseFriendlyTitle"
                  value={formData.caseFriendlyTitle}
                  onChange={(e) => handleInputChange('caseFriendlyTitle', e.target.value)}
                  placeholder="Shortened name for internal use"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseType">Case Type *</Label>
                  <Select onValueChange={(value) => handleInputChange('caseType', value)}>
                    <SelectTrigger className={errors.caseType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class-action">Class Action</SelectItem>
                      <SelectItem value="mass-tort">Mass Tort</SelectItem>
                      <SelectItem value="antitrust">Antitrust</SelectItem>
                      <SelectItem value="securities">Securities Fraud</SelectItem>
                      <SelectItem value="employment">Employment</SelectItem>
                      <SelectItem value="consumer-protection">Consumer Protection</SelectItem>
                      <SelectItem value="data-breach">Data Breach</SelectItem>
                      <SelectItem value="pharmaceutical">Pharmaceutical</SelectItem>
                      <SelectItem value="medical-device">Medical Device</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.caseType && <p className="text-red-500 text-sm mt-1">{errors.caseType}</p>}
                </div>

                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                    placeholder="Federal, California, New York, etc."
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedClaimants">Estimated Number of Claimants *</Label>
                  <Input
                    id="estimatedClaimants"
                    value={formData.estimatedClaimants}
                    onChange={(e) => handleInputChange('estimatedClaimants', e.target.value)}
                    placeholder="e.g., 50, 1,000, 50,000"
                    className={errors.estimatedClaimants ? 'border-red-500' : ''}
                  />
                  {errors.estimatedClaimants && <p className="text-red-500 text-sm mt-1">{errors.estimatedClaimants}</p>}
                </div>

                <div>
                  <Label htmlFor="estimatedSettlement">Estimated Settlement Amount</Label>
                  <Input
                    id="estimatedSettlement"
                    value={formData.estimatedSettlement}
                    onChange={(e) => handleInputChange('estimatedSettlement', e.target.value)}
                    placeholder="$10,000,000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="courtName">Court Name</Label>
                <Input
                  id="courtName"
                  value={formData.courtName}
                  onChange={(e) => handleInputChange('courtName', e.target.value)}
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
                      checked={formData.projectScope.includes('Notice Design & Distribution')}
                      onCheckedChange={(checked) => handleArrayChange('projectScope', 'Notice Design & Distribution', checked)}
                    />
                    <Label htmlFor="notice-design">Notice Design & Distribution</Label>
                  </div>
                  {formData.projectScope.includes('Notice Design & Distribution') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="noticeFormsCount">How many forms will need to be created?</Label>
                          <Input
                            id="noticeFormsCount"
                            value={formData.noticeFormsCount}
                            onChange={(e) => handleInputChange('noticeFormsCount', e.target.value)}
                            placeholder="e.g., 3 (postcard, check stub, notice mailing)"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="costPerForm">Cost per form</Label>
                          <Input
                            id="costPerForm"
                            value={formData.costPerForm}
                            onChange={(e) => handleInputChange('costPerForm', e.target.value)}
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
                      checked={formData.projectScope.includes('Claims Processing')}
                      onCheckedChange={(checked) => handleArrayChange('projectScope', 'Claims Processing', checked)}
                    />
                    <Label htmlFor="claims-processing">Claims Processing</Label>
                  </div>
                  {formData.projectScope.includes('Claims Processing') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="claimsToProcess">Estimated number of claims to process</Label>
                          <Input
                            id="claimsToProcess"
                            value={formData.claimsToProcess}
                            onChange={(e) => handleInputChange('claimsToProcess', e.target.value)}
                            placeholder="e.g., 1,000"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="costPerProcessedClaim">Cost per processed claim</Label>
                          <Input
                            id="costPerProcessedClaim"
                            value={formData.costPerProcessedClaim}
                            onChange={(e) => handleInputChange('costPerProcessedClaim', e.target.value)}
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
                      checked={formData.projectScope.includes('Payment Distribution')}
                      onCheckedChange={(checked) => handleArrayChange('projectScope', 'Payment Distribution', checked)}
                    />
                    <Label htmlFor="payment-distribution">Payment Distribution</Label>
                  </div>
                  {formData.projectScope.includes('Payment Distribution') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="paymentsToDistribute">Estimated number of payments</Label>
                          <Input
                            id="paymentsToDistribute"
                            value={formData.paymentsToDistribute}
                            onChange={(e) => handleInputChange('paymentsToDistribute', e.target.value)}
                            placeholder="e.g., 500"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="costPerPayment">Cost per payment</Label>
                          <Input
                            id="costPerPayment"
                            value={formData.costPerPayment}
                            onChange={(e) => handleInputChange('costPerPayment', e.target.value)}
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
                      checked={formData.projectScope.includes('Call Center Services')}
                      onCheckedChange={(checked) => handleArrayChange('projectScope', 'Call Center Services', checked)}
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
                              checked={formData.callCenterTypes && formData.callCenterTypes.includes('live-agents')}
                              onCheckedChange={(checked) => handleArrayChange('callCenterTypes', 'live-agents', checked)}
                            />
                            <Label htmlFor="live-agents">Live Agents</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ivr"
                              checked={formData.callCenterTypes && formData.callCenterTypes.includes('ivr')}
                              onCheckedChange={(checked) => handleArrayChange('callCenterTypes', 'ivr', checked)}
                            />
                            <Label htmlFor="ivr">IVR</Label>
                          </div>
                        </div>
                      </div>

                      {formData.callCenterTypes && formData.callCenterTypes.includes('live-agents') && (
                        <div className="border rounded-lg p-3 bg-blue-50">
                          <h4 className="font-medium mb-2">Live Agents</h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="liveAgentHourlyRate">Hourly Cost</Label>
                              <Input
                                id="liveAgentHourlyRate"
                                value={formData.liveAgentHourlyRate}
                                onChange={(e) => handleInputChange('liveAgentHourlyRate', e.target.value)}
                                placeholder="$25/hour"
                              />
                            </div>
                            <div>
                              <Label htmlFor="liveAgentEstimatedHours">Estimated Hours Needed</Label>
                              <Input
                                id="liveAgentEstimatedHours"
                                value={formData.liveAgentEstimatedHours}
                                onChange={(e) => handleInputChange('liveAgentEstimatedHours', e.target.value)}
                                placeholder="40 hours"
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="multipleLanguagesCallCenter"
                                checked={formData.multipleLanguagesCallCenter}
                                onCheckedChange={(checked) => handleInputChange('multipleLanguagesCallCenter', checked)}
                              />
                              <Label htmlFor="multipleLanguagesCallCenter">Multiple languages needed</Label>
                            </div>

                            {formData.multipleLanguagesCallCenter && (
                              <div className="mt-2 space-y-3">
                                <div>
                                  <Label htmlFor="costPerAdditionalLanguage">Cost per additional language</Label>
                                  <Input
                                    id="costPerAdditionalLanguage"
                                    value={formData.costPerAdditionalLanguage}
                                    onChange={(e) => handleInputChange('costPerAdditionalLanguage', e.target.value)}
                                    placeholder="$5/hour per language"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label>Required Languages</Label>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                    {['Spanish', 'French', 'Chinese', 'Korean', 'Vietnamese', 'Portuguese', 'Russian', 'Arabic'].map((language) => (
                                      <div key={language} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`call-center-${language}`}
                                          checked={formData.callCenterLanguages && formData.callCenterLanguages.includes(language)}
                                          onCheckedChange={(checked) => handleArrayChange('callCenterLanguages', language, checked)}
                                        />
                                        <Label htmlFor={`call-center-${language}`}>{language}</Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {formData.callCenterTypes && formData.callCenterTypes.includes('ivr') && (
                        <div className="border rounded-lg p-3 bg-green-50">
                          <h4 className="font-medium mb-2">IVR</h4>
                          <div>
                            <Label htmlFor="ivrCost">Cost for IVR</Label>
                            <Input
                              id="ivrCost"
                              value={formData.ivrCost}
                              onChange={(e) => handleInputChange('ivrCost', e.target.value)}
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
                      checked={formData.projectScope.includes('Website Development')}
                      onCheckedChange={(checked) => handleArrayChange('projectScope', 'Website Development', checked)}
                    />
                    <Label htmlFor="website-development">Website Development</Label>
                  </div>
                  {formData.projectScope.includes('Website Development') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div>
                        <Label>Website Type</Label>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="static-site"
                              checked={formData.websiteTypes && formData.websiteTypes.includes('static')}
                              onCheckedChange={(checked) => handleArrayChange('websiteTypes', 'static', checked)}
                            />
                            <Label htmlFor="static-site">Static Site</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="data-capture-site"
                              checked={formData.websiteTypes && formData.websiteTypes.includes('data-capture')}
                              onCheckedChange={(checked) => handleArrayChange('websiteTypes', 'data-capture', checked)}
                            />
                            <Label htmlFor="data-capture-site">Data Capture Site</Label>
                          </div>
                        </div>
                      </div>

                      {formData.websiteTypes && formData.websiteTypes.includes('static') && (
                        <div className="border rounded-lg p-3 bg-blue-50">
                          <h4 className="font-medium mb-2">Static Site</h4>
                          <div>
                            <Label htmlFor="staticSiteCost">Cost per static site</Label>
                            <Input
                              id="staticSiteCost"
                              value={formData.staticSiteCost}
                              onChange={(e) => handleInputChange('staticSiteCost', e.target.value)}
                              placeholder="$5,000"
                            />
                          </div>
                        </div>
                      )}

                      {formData.websiteTypes && formData.websiteTypes.includes('data-capture') && (
                        <div className="border rounded-lg p-3 bg-green-50">
                          <h4 className="font-medium mb-2">Data Capture Site</h4>
                          <div>
                            <Label htmlFor="dataCaptureSiteCost">Cost per data capture site</Label>
                            <Input
                              id="dataCaptureSiteCost"
                              value={formData.dataCaptureSiteCost}
                              onChange={(e) => handleInputChange('dataCaptureSiteCost', e.target.value)}
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
                      checked={formData.projectScope.includes('Reporting & Analytics')}
                      onCheckedChange={(checked) => handleArrayChange('projectScope', 'Reporting & Analytics', checked)}
                    />
                    <Label htmlFor="reporting-analytics">Reporting & Analytics</Label>
                  </div>
                  {formData.projectScope.includes('Reporting & Analytics') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div>
                        <Label>Reporting Type</Label>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="standard-reporting"
                              checked={formData.reportingTypes && formData.reportingTypes.includes('standard')}
                              onCheckedChange={(checked) => handleArrayChange('reportingTypes', 'standard', checked)}
                            />
                            <Label htmlFor="standard-reporting">Standard</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="custom-reporting"
                              checked={formData.reportingTypes && formData.reportingTypes.includes('custom')}
                              onCheckedChange={(checked) => handleArrayChange('reportingTypes', 'custom', checked)}
                            />
                            <Label htmlFor="custom-reporting">Custom</Label>
                          </div>
                        </div>
                      </div>

                      {formData.reportingTypes && formData.reportingTypes.includes('standard') && (
                        <div className="border rounded-lg p-3 bg-blue-50">
                          <h4 className="font-medium mb-2">Standard Suite of Reports</h4>
                          <div>
                            <Label htmlFor="standardReportsCost">Cost for standard suite of reports</Label>
                            <Input
                              id="standardReportsCost"
                              value={formData.standardReportsCost}
                              onChange={(e) => handleInputChange('standardReportsCost', e.target.value)}
                              placeholder="$3,500"
                            />
                          </div>
                        </div>
                      )}

                      {formData.reportingTypes && formData.reportingTypes.includes('custom') && (
                        <div className="border rounded-lg p-3 bg-green-50">
                          <h4 className="font-medium mb-2">Custom Reporting</h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="customReportingHourlyRate">Hourly rate for custom report creation</Label>
                              <Input
                                id="customReportingHourlyRate"
                                value={formData.customReportingHourlyRate}
                                onChange={(e) => handleInputChange('customReportingHourlyRate', e.target.value)}
                                placeholder="$150/hour"
                              />
                            </div>
                            <div>
                              <Label htmlFor="customReportingEstimatedHours">Estimated hours needed</Label>
                              <Input
                                id="customReportingEstimatedHours"
                                value={formData.customReportingEstimatedHours}
                                onChange={(e) => handleInputChange('customReportingEstimatedHours', e.target.value)}
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
                      checked={formData.projectScope.includes('Data Import/Migration')}
                      onCheckedChange={(checked) => handleArrayChange('projectScope', 'Data Import/Migration', checked)}
                    />
                    <Label htmlFor="data-import">Data Import/Migration</Label>
                  </div>
                  {formData.projectScope.includes('Data Import/Migration') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="filesToImport">How many files will need to be imported?</Label>
                          <Input
                            id="filesToImport"
                            value={formData.filesToImport}
                            onChange={(e) => handleInputChange('filesToImport', e.target.value)}
                            placeholder="e.g., 5 files"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dataImportCost">Cost for data import</Label>
                          <Input
                            id="dataImportCost"
                            value={formData.dataImportCost}
                            onChange={(e) => handleInputChange('dataImportCost', e.target.value)}
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
                            onCheckedChange={(checked) => handleInputChange('needDataCleaning', checked)}
                          />
                          <Label htmlFor="needDataCleaning">Need to clean/scrub/remove duplicates from data</Label>
                        </div>

                        {formData.needDataCleaning && (
                          <div className="mt-2 border rounded-lg p-3 bg-yellow-50">
                            <h4 className="font-medium mb-2">Data Cleaning</h4>
                            <div>
                              <Label htmlFor="dataCleaningHourlyRate">Hourly rate for data cleaning work</Label>
                              <Input
                                id="dataCleaningHourlyRate"
                                value={formData.dataCleaningHourlyRate}
                                onChange={(e) => handleInputChange('dataCleaningHourlyRate', e.target.value)}
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
                            onCheckedChange={(checked) => handleInputChange('needNCOA', checked)}
                          />
                          <Label htmlFor="needNCOA">Need to run NCOA or ACS</Label>
                        </div>

                        {formData.needNCOA && (
                          <div className="mt-2 border rounded-lg p-3 bg-purple-50">
                            <h4 className="font-medium mb-2">NCOA/ACS Processing</h4>
                            <div>
                              <Label htmlFor="ncoaCostPerRecord">Cost per record</Label>
                              <Input
                                id="ncoaCostPerRecord"
                                value={formData.ncoaCostPerRecord}
                                onChange={(e) => handleInputChange('ncoaCostPerRecord', e.target.value)}
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
                      onCheckedChange={(checked) => handleArrayChange('projectScope', 'Email Campaign', checked)}
                    />
                    <Label htmlFor="email-campaign">Email Campaign</Label>
                  </div>
                  {formData.projectScope.includes('Email Campaign') && (
                    <div className="ml-6 mt-2 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="emailsToSend">Estimated number of emails to send</Label>
                          <Input
                            id="emailsToSend"
                            value={formData.emailsToSend}
                            onChange={(e) => handleInputChange('emailsToSend', e.target.value)}
                            placeholder="e.g., 10,000"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emailCostPer">Estimated cost per email</Label>
                          <Input
                            id="emailCostPer"
                            value={formData.emailCostPer}
                            onChange={(e) => handleInputChange('emailCostPer', e.target.value)}
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
                <p className="text-red-500 text-sm mt-2">{errors.projectScope}</p>
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
                    onValueChange={(value) => handleInputChange('timeline', value)}
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
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
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
                    <Label className="font-medium">Requirement {index + 1}</Label>
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
                        onChange={(e) => updateSpecialRequirement(index, 'description', e.target.value)}
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
                          onChange={(e) => updateSpecialRequirement(index, 'hourlyRate', e.target.value)}
                          placeholder="$100/hour"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Estimated Hours</Label>
                        <Input
                          value={requirement.estimatedHours}
                          onChange={(e) => updateSpecialRequirement(index, 'estimatedHours', e.target.value)}
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
                    onCheckedChange={(checked) => handleInputChange('isCappedCase', checked)}
                  />
                  <Label htmlFor="isCappedCase">This is a capped case</Label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseManagerHourlyRate">Case Manager Hourly Rate</Label>
                  <Input
                    id="caseManagerHourlyRate"
                    value={formData.caseManagerHourlyRate}
                    onChange={(e) => handleInputChange('caseManagerHourlyRate', e.target.value)}
                    placeholder="$125/hour"
                  />
                </div>
                <div>
                  <Label htmlFor="projectCoordinatorHourlyRate">Project Coordinator Hourly Rate</Label>
                  <Input
                    id="projectCoordinatorHourlyRate"
                    value={formData.projectCoordinatorHourlyRate}
                    onChange={(e) => handleInputChange('projectCoordinatorHourlyRate', e.target.value)}
                    placeholder="$85/hour"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Estimated Budget Range</Label>
                <Select onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-50k">Under $50,000</SelectItem>
                    <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                    <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                    <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                    <SelectItem value="over-1m">Over $1,000,000</SelectItem>
                    <SelectItem value="tbd">To be determined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
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
                  Our team is here to help you with your settlement administration needs.
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