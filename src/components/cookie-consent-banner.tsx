'use client';

import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings, BarChart3 } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      essential: true,
      functional: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('cookie-consent', JSON.stringify(fullConsent));
    setIsVisible(false);

    // Initialize analytics or other services here
    initializeServices(fullConsent);
  };

  const handleAcceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);

    // Initialize only consented services
    initializeServices(consent);
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      essential: true,
      functional: false,
      analytics: false,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('cookie-consent', JSON.stringify(minimalConsent));
    setIsVisible(false);

    // Only initialize essential services
    initializeServices(minimalConsent);
  };

  const initializeServices = (
    consent: CookiePreferences & { timestamp: string }
  ) => {
    // Initialize Supabase analytics if consented
    if (consent.analytics) {
      // Enable analytics tracking
      console.log('Analytics enabled');
    }

    // Initialize functional features if consented
    if (consent.functional) {
      // Enable functional cookies
      console.log('Functional cookies enabled');
    }
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'essential') return; // Can't disable essential cookies

    setPreferences((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Cookie className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Cookie Preferences
            </h2>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            We use cookies to enhance your experience, provide essential
            services, and analyze usage. You can customize your preferences
            below or accept all cookies to continue.
          </p>

          {/* Simple View */}
          {!showDetails && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Essential cookies</strong> are required for core
                  functionality and cannot be disabled.
                  <strong> Optional cookies</strong> help us improve our service
                  and can be customized below.
                </p>
              </div>

              <button
                onClick={() => setShowDetails(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Customize Cookie Settings
              </button>
            </div>
          )}

          {/* Detailed View */}
          {showDetails && (
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-gray-800">
                      Essential Cookies
                    </h3>
                  </div>
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                    Always Active
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Required for authentication, security, and core functionality.
                  Cannot be disabled.
                </p>
                <p className="text-xs text-gray-600">
                  Examples: Login sessions, CSRF protection, user authentication
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">
                      Functional Cookies
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        updatePreference('functional', e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Remember your preferences and provide enhanced features like
                  saved filters and dashboard layouts.
                </p>
                <p className="text-xs text-gray-600">
                  Examples: User preferences, saved dashboard configurations,
                  theme settings
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-800">
                      Analytics Cookies
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        updatePreference('analytics', e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Help us understand how you use our service to improve
                  performance and user experience.
                </p>
                <p className="text-xs text-gray-600">
                  Examples: Page views, feature usage, performance metrics
                  (anonymized)
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Hide Details
              </button>
            </div>
          )}

          {/* Privacy Policy Link */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              For more information, please read our{' '}
              <a
                href="/privacy"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Privacy Policy
              </a>{' '}
              and{' '}
              <a
                href="/cookies"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Cookie Policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleRejectAll}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Reject All
          </button>
          <button
            onClick={handleAcceptSelected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Preferences
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
