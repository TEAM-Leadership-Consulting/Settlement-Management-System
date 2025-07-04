import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import CookieConsentBanner from '@/components/cookie-consent-banner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Settlement Management System',
    template: '%s | Settlement Management System',
  },
  description:
    'Professional settlement case management system for efficient case administration and party management',
  keywords: ['settlement', 'case management', 'legal', 'administration'],
  authors: [{ name: 'Settlement Management Team' }],
  creator: 'Settlement Management System',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Settlement Management System',
    title: 'Settlement Management System',
    description: 'Professional settlement case management system',
  },
  robots: {
    index: false,
    follow: false,
  },
};

// Separate viewport export (fixes Next.js 15 warning)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-background text-foreground font-sans`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
