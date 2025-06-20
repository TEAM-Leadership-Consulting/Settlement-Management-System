// lib/supabase.ts (or lib/supabase-client.ts)
import { createClient } from '@supabase/supabase-js';
// Alternative import if using SSR:
// import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// If you need cookie-aware client (for when you have consent):
export const createConsentAwareSupabaseClient = () => {
  if (typeof window === 'undefined') {
    return supabase;
  }

  try {
    const consent = localStorage.getItem('cookie-consent');
    const hasConsent = consent ? JSON.parse(consent).functional : false;

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: hasConsent,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: hasConsent ? window.localStorage : undefined,
      },
    });
  } catch {
    return supabase;
  }
};
