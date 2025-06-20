import { useState, useEffect } from 'react';
import { CookieConsentManager, type CookieConsent } from '@/lib/cookie-consent';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [needsConsent, setNeedsConsent] = useState(false);

  useEffect(() => {
    const currentConsent = CookieConsentManager.getConsent();
    setConsent(currentConsent);
    setNeedsConsent(currentConsent === null);

    const handleConsentUpdate = (event: CustomEvent<CookieConsent>) => {
      setConsent(event.detail);
      setNeedsConsent(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(
        'cookie-consent-updated',
        handleConsentUpdate as EventListener
      );

      return () => {
        window.removeEventListener(
          'cookie-consent-updated',
          handleConsentUpdate as EventListener
        );
      };
    }
  }, []);

  return {
    consent,
    needsConsent,
    hasConsent: (type: 'essential' | 'functional' | 'analytics') =>
      CookieConsentManager.hasConsent(type),
    setConsent: CookieConsentManager.setConsent,
    revokeConsent: CookieConsentManager.revokeConsent,
  };
}
