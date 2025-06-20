'use client';

import React from 'react';
import { Shield, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-600">
              <span>
                <strong>Effective Date:</strong> [Insert Date]
              </span>
              <span>
                <strong>Last Updated:</strong> [Insert Date]
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                Settlement Management System by T.E.A.M. Consulting
                (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
                committed to protecting your privacy and the confidentiality of
                all information you provide through our settlement case
                management platform (&quot;Service&quot;). This Privacy Policy
                explains how we collect, use, protect, and disclose information
                when you use our Service.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                1.1 Account Information
              </h3>
              <p className="text-gray-700 mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Username and email address</li>
                <li>Password (securely hashed)</li>
                <li>First and last name</li>
                <li>
                  Role designation (admin, case manager, attorney, clerk,
                  viewer)
                </li>
                <li>Department affiliation</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                1.2 Case and Settlement Data
              </h3>
              <p className="text-gray-700 mb-4">
                Our platform is designed to manage sensitive legal settlement
                information, including:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Individual Party Information:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Personal identifiers (names, titles, suffixes)</li>
                    <li>
                      • Contact information (addresses, phone numbers, email)
                    </li>
                    <li>• Date of birth and demographic information</li>
                    <li>• Social Security Numbers (encrypted)</li>
                    <li>• Employment and marital status</li>
                    <li>• Guardian or representative information</li>
                    <li>• Disability status and language preferences</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Business Party Information:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Business names and DBA information</li>
                    <li>• Employer Identification Numbers (EIN)</li>
                    <li>• Business contact information and addresses</li>
                    <li>• Business registration details</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Financial Information:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Settlement amounts and payment details</li>
                    <li>• Banking information for disbursements</li>
                    <li>• Tax withholding information</li>
                    <li>• Administrative costs and attorney fees</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Legal Information:
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Case numbers and court information</li>
                    <li>• Legal documentation and filings</li>
                    <li>• Communication records and notes</li>
                    <li>• Compliance and regulatory data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. How We Use Your Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    2.1 Primary Purposes
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>Provide settlement case management services</li>
                    <li>Process and distribute settlement payments</li>
                    <li>Generate compliance and regulatory reports</li>
                    <li>Facilitate legal notice distribution</li>
                    <li>Maintain audit trails for legal compliance</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    2.2 Secondary Purposes
                  </h3>
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>System security and fraud prevention</li>
                    <li>Service improvement and development</li>
                    <li>Customer support and training</li>
                    <li>Legal compliance and regulatory reporting</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Information Sharing and Disclosure
              </h2>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  3.1 Authorized Sharing
                </h3>
                <p className="text-gray-700 mb-3">
                  We may share information with:
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    <strong>Court Systems:</strong> As required for legal
                    proceedings and compliance
                  </li>
                  <li>
                    <strong>Regulatory Bodies:</strong> Including CFPB, FTC,
                    EEOC, and other agencies as legally required
                  </li>
                  <li>
                    <strong>Financial Institutions:</strong> For payment
                    processing and disbursements
                  </li>
                  <li>
                    <strong>Legal Representatives:</strong> Attorneys and legal
                    counsel involved in cases
                  </li>
                  <li>
                    <strong>Service Providers:</strong> Third-party vendors
                    supporting our operations (under strict confidentiality
                    agreements)
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Data Security
              </h2>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  4.1 Security Measures
                </h3>
                <p className="text-gray-700 mb-3">
                  We implement comprehensive security measures including:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>
                      <strong>Encryption:</strong> Field-level encryption for
                      sensitive data
                    </li>
                    <li>
                      <strong>Access Controls:</strong> Role-based permissions
                      and MFA
                    </li>
                    <li>
                      <strong>Audit Trails:</strong> Comprehensive logging of
                      all access
                    </li>
                  </ul>
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>
                      <strong>Secure Infrastructure:</strong> Bank-grade
                      security protocols
                    </li>
                    <li>
                      <strong>Regular Backups:</strong> Encrypted backup systems
                    </li>
                    <li>
                      <strong>Data Hosting:</strong> Secure Supabase with
                      PostgreSQL RLS
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Your Rights and Choices
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Access Rights
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Access your personal information</li>
                    <li>• Request corrections to inaccurate data</li>
                    <li>• Export your data in a portable format</li>
                    <li>• Request deletion (subject to legal requirements)</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Data Subject Rights (GDPR/CCPA)
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Right to rectification and erasure</li>
                    <li>• Right to restrict processing</li>
                    <li>• Right to data portability</li>
                    <li>• Right to object to processing</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Contact Information
              </h2>

              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  For privacy-related questions, concerns, or requests, please
                  contact us:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Privacy Officer
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>privacy@settlementmanagement.com</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>[Insert Phone Number]</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>[Insert Business Address]</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Data Protection Officer (EU)
                    </h3>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Mail className="w-4 h-4" />
                      <span>dpo@settlementmanagement.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-gray-900 text-white rounded-lg p-6 text-center">
              <p className="text-sm">
                This Privacy Policy is effective as of the date listed above. By
                using our Service, you acknowledge that you have read,
                understood, and agree to be bound by this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
