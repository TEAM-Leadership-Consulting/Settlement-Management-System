'use client';

import React from 'react';
import {
  FileText,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Shield,
  Users,
  CreditCard,
  Scale,
} from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
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
              <FileText className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Terms of Service</h1>
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
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Terms of Service
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
                These Terms of Service (&quot;Terms&quot;) govern your use of
                the Settlement Management System provided by T.E.A.M. Consulting
                (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By
                accessing or using our Service, you agree to be bound by these
                Terms.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4">
                By creating an account, accessing, or using the Settlement
                Management System (&quot;Service&quot;), you acknowledge that
                you have read, understood, and agree to be bound by these Terms
                and our Privacy Policy. If you do not agree to these Terms, you
                may not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Description of Service
              </h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.1 Service Overview
              </h3>
              <p className="text-gray-700 mb-4">
                The Settlement Management System is a comprehensive legal case
                management platform designed for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Settlement case tracking and administration</li>
                <li>Party and claimant management</li>
                <li>Financial distribution and payment processing</li>
                <li>Legal notice distribution and tracking</li>
                <li>Compliance reporting and documentation</li>
                <li>Secure document management</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2.2 Service Features
              </h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">
                      Security & Access
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Enterprise-grade data protection</li>
                    <li>• Role-based access controls</li>
                    <li>• Comprehensive audit trails</li>
                    <li>• Multi-factor authentication</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">
                      Case Management
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Complete lifecycle tracking</li>
                    <li>• Party and stakeholder management</li>
                    <li>• Document management system</li>
                    <li>• Deadline and milestone tracking</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. User Accounts and Access
              </h2>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  3.1 Account Registration
                </h3>
                <p className="text-gray-700 mb-3">
                  To access the Service, you must:
                </p>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>
                    Provide accurate and complete registration information
                  </li>
                  <li>Maintain the security of your account credentials</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                3.2 User Roles and Permissions
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-gray-800 mb-2">Admin</h4>
                  <p className="text-sm text-gray-700">
                    Full system access and user management
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Case Manager
                  </h4>
                  <p className="text-sm text-gray-700">
                    Case creation and management capabilities
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-gray-800 mb-2">Attorney</h4>
                  <p className="text-sm text-gray-700">
                    Legal case access and client management
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Acceptable Use Policy
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    ✓ Permitted Uses
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Legitimate legal settlement administration</li>
                    <li>• Authorized case management activities</li>
                    <li>• Compliance with court orders</li>
                    <li>• Professional legal practice purposes</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    ✗ Prohibited Uses
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Violating applicable laws or regulations</li>
                    <li>• Infringing on intellectual property rights</li>
                    <li>• Uploading malicious software</li>
                    <li>• Unauthorized system access attempts</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Financial Terms
              </h2>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    5.1 Subscription Plans
                  </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Professional
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      $2,500
                      <span className="text-sm text-gray-600">/month</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Basic features for small firms
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-500">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Premium
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      $5,000
                      <span className="text-sm text-gray-600">/month</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Advanced features and unlimited users
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Enterprise
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      Custom
                    </p>
                    <p className="text-sm text-gray-700">
                      Tailored solutions for large organizations
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  5.2 Payment Terms
                </h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>Subscription fees are billed monthly in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>Late payments may result in service suspension</li>
                  <li>Price changes require 30 days advance notice</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Data Protection and Confidentiality
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  6.1 Confidential Information
                </h3>
                <p className="text-gray-700 mb-3">
                  All information processed through the Service is considered
                  confidential and may include:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>Personal identifying information (PII)</li>
                    <li>Financial and payment data</li>
                    <li>Legal case information and documentation</li>
                  </ul>
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>Attorney-client privileged communications</li>
                    <li>Settlement terms and conditions</li>
                    <li>Court filings and legal documents</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Limitation of Liability
              </h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Scale className="w-6 h-6 text-red-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Important Legal Disclaimers
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold mb-2">
                      7.1 Service Disclaimer
                    </h4>
                    <p>
                      THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT
                      WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
                      NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR
                      A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">7.2 Liability Limits</h4>
                    <p>
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL
                      LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU FOR THE
                      SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Termination
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    8.1 Termination by You
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Providing 30 days written notice</li>
                    <li>• Completing data export procedures</li>
                    <li>• Settling all outstanding fees</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    8.2 Termination by Us
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Material breach of these Terms</li>
                    <li>• Non-payment after 30 days notice</li>
                    <li>• Violation of acceptable use policies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Contact Information
              </h2>

              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Legal Department
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>legal@settlementmanagement.com</span>
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
                      Quick Links
                    </h3>
                    <div className="space-y-1">
                      <Link
                        href="/privacy"
                        className="block text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        href="/cookies"
                        className="block text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Cookie Policy
                      </Link>
                      <Link
                        href="/#contact"
                        className="block text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-gray-900 text-white rounded-lg p-6 text-center">
              <p className="text-sm">
                <strong>
                  By using the Settlement Management System, you acknowledge
                  that you have read, understood, and agree to be bound by these
                  Terms of Service.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
