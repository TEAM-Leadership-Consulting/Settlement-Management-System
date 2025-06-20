export interface CookieConsent {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: string;
}

export class CookieConsentManager {
  private static readonly CONSENT_KEY = 'cookie-consent';

  static getConsent(): CookieConsent | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(this.CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static setConsent(consent: CookieConsent): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consent));

    // Trigger consent update event
    window.dispatchEvent(
      new CustomEvent('cookie-consent-updated', {
        detail: consent,
      })
    );
  }

  static hasConsent(type: keyof Omit<CookieConsent, 'timestamp'>): boolean {
    const consent = this.getConsent();
    return consent ? consent[type] : false;
  }

  static needsConsent(): boolean {
    return this.getConsent() === null;
  }

  static revokeConsent(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.CONSENT_KEY);

    // Clear non-essential cookies
    this.clearNonEssentialCookies();
  }

  private static clearNonEssentialCookies(): void {
    if (typeof document === 'undefined') return;

    // Clear functional cookies
    const functionalCookies = ['user-preferences', 'dashboard-config', 'theme'];
    functionalCookies.forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Clear analytics cookies
    const analyticsCookies = ['_ga', '_gid', 'analytics-session'];
    analyticsCookies.forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }
}
