'use client';

import React from 'react';
import {
  Cookie,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Settings,
  Shield,
  BarChart3,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

interface CookieTableRow {
  name: string;
  purpose: string;
  duration: string;
  type: string;
}

export default function CookiePolicy() {
  const essentialCookies: CookieTableRow[] = [
    {
      name: 'session_token',
      purpose: 'User authentication and session management',
      duration: 'Session',
      type: 'Essential',
    },
    {
      name: 'csrf_token',
      purpose: 'Cross-site request forgery protection',
      duration: 'Session',
      type: 'Essential',
    },
    {
      name: 'auth_state',
      purpose: 'Authentication state tracking',
      duration: '24 hours',
      type: 'Essential',
    },
    {
      name: 'supabase.auth.token',
      purpose: 'Supabase authentication token',
      duration: 'Session',
      type: 'Essential',
    },
  ];

  const functionalCookies: CookieTableRow[] = [
    {
      name: 'user_preferences',
      purpose: 'Store user interface preferences',
      duration: '1 year',
      type: 'Functional',
    },
    {
      name: 'language_preference',
      purpose: 'Remember selected language',
      duration: '1 year',
      type: 'Functional',
    },
    {
      name: 'theme_setting',
      purpose: 'Remember dark/light mode preference',
      duration: '1 year',
      type: 'Functional',
    },
    {
      name: 'dashboard_layout',
      purpose: 'Save dashboard configuration',
      duration: '6 months',
      type: 'Functional',
    },
  ];

  const analyticsCookies: CookieTableRow[] = [
    {
      name: '_ga',
      purpose: 'Google Analytics - distinguish users',
      duration: '2 years',
      type: 'Analytics',
    },
    {
      name: '_ga_*',
      purpose: 'Google Analytics - session tracking',
      duration: '2 years',
      type: 'Analytics',
    },
    {
      name: '_gid',
      purpose: 'Google Analytics - distinguish users',
      duration: '24 hours',
      type: 'Analytics',
    },
  ];

  const CookieTable = ({
    cookies,
    title,
    icon: Icon,
    bgColor,
  }: {
    cookies: CookieTableRow[];
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
  }) => (
    <div className={`${bgColor} rounded-lg p-6 mb-6`}>
      <div className="flex items-center mb-4">
        <Icon className="w-6 h-6 mr-2" />
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Cookie Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Purpose
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {cookies.map((cookie, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="px-4 py-3 text-sm font-mono text-gray-900">
                  {cookie.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {cookie.purpose}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {cookie.duration}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {cookie.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
              <Cookie className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Cookie Policy</h1>
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
              <Cookie className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cookie Policy
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-600">
              <span>
                <strong>Effective Date:</strong> [6/21/2025]
              </span>
              <span>
                <strong>Last Updated:</strong> [6/21/2025]
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                This Cookie Policy explains how T.E.A.M. Consulting
                (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses
                cookies and similar tracking technologies on our Settlement
                Management System (&quot;Service&quot;). This policy should be
                read in conjunction with our Privacy Policy and Terms of
                Service.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. What Are Cookies?
              </h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are placed on your device
                (computer, smartphone, or tablet) when you visit our website or
                use our Service. They are widely used to make websites and
                applications work more efficiently and to provide information to
                website owners.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                1.1 Types of Cookies
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="text-gray-700 space-y-2">
                    <li>
                      <strong>Session Cookies:</strong> Temporary cookies that
                      expire when you close your browser
                    </li>
                    <li>
                      <strong>Persistent Cookies:</strong> Cookies that remain
                      on your device for a specified period
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="text-gray-700 space-y-2">
                    <li>
                      <strong>First-Party Cookies:</strong> Cookies set by our
                      domain
                    </li>
                    <li>
                      <strong>Third-Party Cookies:</strong> Cookies set by
                      external services we use
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. How We Use Cookies
              </h2>

              <CookieTable
                cookies={essentialCookies}
                title="2.1 Essential Cookies"
                icon={Shield}
                bgColor="bg-red-50 border border-red-200"
              />

              <CookieTable
                cookies={functionalCookies}
                title="2.2 Functional Cookies"
                icon={Settings}
                bgColor="bg-blue-50 border border-blue-200"
              />

              <CookieTable
                cookies={analyticsCookies}
                title="2.3 Analytics Cookies"
                icon={BarChart3}
                bgColor="bg-green-50 border border-green-200"
              />
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Specific Use Cases
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">
                      Authentication & Security
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Maintain secure user sessions</li>
                    <li>• Prevent unauthorized access</li>
                    <li>• Protect against CSRF attacks</li>
                    <li>• Enable multi-factor authentication</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">
                      User Experience
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Remember your preferences and settings</li>
                    <li>• Maintain dashboard configurations</li>
                    <li>• Preserve search filters and sorting</li>
                    <li>• Provide personalized interfaces</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Zap className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">
                      System Performance
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Monitor application performance</li>
                    <li>• Track system response times</li>
                    <li>• Identify and resolve technical issues</li>
                    <li>• Optimize database operations</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <BarChart3 className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="font-semibold text-gray-800">
                      Compliance & Audit
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Maintain audit trails for compliance</li>
                    <li>• Track user actions for legal requirements</li>
                    <li>• Generate usage reports for regulators</li>
                    <li>• Ensure GDPR and CCPA compliance</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Third-Party Services
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Supabase (Database and Authentication)
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Purpose:</strong> Authentication, database
                    operations, real-time updates
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Data:</strong> User sessions, authentication tokens
                  </p>
                  <a
                    href="https://supabase.com/privacy"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Privacy Policy
                  </a>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Google Analytics (Optional)
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Purpose:</strong> Website usage analytics and
                    performance monitoring
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Data:</strong> Anonymized usage statistics
                  </p>
                  <div className="flex space-x-4">
                    <a
                      href="https://policies.google.com/privacy"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Privacy Policy
                    </a>
                    <a
                      href="https://tools.google.com/dlpage/gaoptout"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Opt-out
                    </a>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Vercel (Hosting and CDN)
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Purpose:</strong> Content delivery and performance
                    optimization
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Data:</strong> Anonymous performance metrics
                  </p>
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Privacy Policy
                  </a>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Managing Your Cookie Preferences
              </h2>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  5.1 Browser Settings
                </h3>
                <p className="text-gray-700 mb-3">
                  You can control cookies through your browser settings:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Chrome</h4>
                    <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                      <li>Click the three dots menu → Settings</li>
                      <li>
                        Privacy and security → Cookies and other site data
                      </li>
                      <li>Choose your preferred cookie settings</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Firefox
                    </h4>
                    <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
                      <li>Click the menu button → Settings</li>
                      <li>Privacy & Security → Cookies and Site Data</li>
                      <li>Manage your cookie preferences</li>
                    </ol>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                5.2 Impact of Disabling Cookies
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Essential Cookies
                  </h4>
                  <p className="text-sm text-gray-700">
                    Disabling will prevent login and make the Service
                    non-functional
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Functional Cookies
                  </h4>
                  <p className="text-sm text-gray-700">
                    May reset preferences and reduce personalization features
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Analytics Cookies
                  </h4>
                  <p className="text-sm text-gray-700">
                    Will not affect functionality but limits our improvement
                    insights
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Legal Compliance
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    GDPR Compliance
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Under GDPR, our legal basis for using cookies includes:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • <strong>Consent:</strong> For non-essential cookies
                    </li>
                    <li>
                      • <strong>Legitimate Interest:</strong> For functional
                      cookies
                    </li>
                    <li>
                      • <strong>Contractual Necessity:</strong> For
                      authentication
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    CCPA Compliance
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    California residents have rights regarding:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Knowledge of information collection</li>
                    <li>• Deletion of personal information</li>
                    <li>• Opt-out of sale of information</li>
                    <li>• Non-discrimination for exercising rights</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Contact Information
              </h2>

              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  For questions about our Cookie Policy, please contact us:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Privacy Officer
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Info@settlementmanagementsystem.com</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>[503-858-8889]</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          [2197 SE Minter Bridge Rd Hillsboro, OR 97123]
                        </span>
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
                        href="/terms"
                        className="block text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Terms of Service
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
                  By continuing to use our Service, you consent to our use of
                  cookies as described in this Cookie Policy.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
