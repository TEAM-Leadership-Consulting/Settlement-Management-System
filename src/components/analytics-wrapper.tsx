'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '@/hooks/use-cookie-consent';

export function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const { hasConsent } = useCookieConsent();

  useEffect(() => {
    if (hasConsent('analytics')) {
      // Initialize your analytics here
      // Example: Google Analytics, Mixpanel, etc.
      console.log('Analytics initialized');
    }
  }, [hasConsent]);

  return <>{children}</>;
}
