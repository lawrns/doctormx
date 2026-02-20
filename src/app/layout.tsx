import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { StructuredData } from "@/components/StructuredData";
import { WebVitalsProvider } from "@/components/performance/WebVitalsProvider";
import { WebVitalsReporter } from "@/components/performance/WebVitalsReporter";
import { SkipLink } from "@/components/ui/skip-link";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ServiceWorkerProvider } from "@/components/performance/ServiceWorkerProvider";
import { isRTL, getTextDirection } from "@/lib/i18n/rtl";
import { CookieConsent } from "@/components/CookieConsent";
import { ConsentAwareScripts } from "@/components/ConsentAwareScripts";

// PERF-006: Optimized font loading
// - Reduced to 2 font families (max recommended for performance)
// - Using font-display: swap for faster FCP
// - Latin subset only for smaller download
// - Preload critical font (Geist Sans)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Ensures text is visible while font loads
  preload: true,   // Preload critical font for FCP improvement
  weight: ["400", "500", "600", "700"], // Only used weights
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Mono font is secondary, lazy load
  weight: ["400", "500", "600"], // Only used weights for mono
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
});

// Viewport configuration for responsive design
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0EA5E9",
  viewportFit: "cover",
};

// I18N-007: Base metadata configuration with hreflang support
const baseUrl = 'https://doctor.mx';

// Static metadata for root layout - locale-specific layouts override this
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Doctor.mx | Telemedicina y Doctores Verificados en México | 24/7",
  description:
    "Consulta médica en línea con doctores verificados en México. Telemedicina segura, videoconsultas HD, y Dr. Simeon - tu asistente de salud con IA. Más de 500 especialistas disponibles 24/7.",
  keywords:
    "telemedicina México, doctores en línea, consulta médica virtual, doctores verificados México, videoconsulta médica, Dr Simeon, salud digital México, cita médica en línea, especialistas certificados, segunda opinión médica",
  authors: [{ name: "Doctor.mx" }],
  creator: "Doctor.mx",
  publisher: "Doctor.mx",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // I18N-007: Hreflang tags for SEO - alternate language versions
  alternates: {
    canonical: baseUrl,
    languages: {
      'es': baseUrl,
      'en': `${baseUrl}/en`,
      'x-default': baseUrl,
    },
  },
  // I18N-007: OpenGraph locale will be set dynamically per page
  openGraph: {
    title: "Doctor.mx | Telemedicina y Doctores Verificados en México | 24/7",
    description:
      "Consulta médica en línea con doctores verificados en México. Telemedicina segura, videoconsultas HD, y Dr. Simeon - tu asistente de salud con IA. Más de 500 especialistas disponibles 24/7.",
    type: "website",
    locale: "es_MX",
    url: baseUrl,
    siteName: "Doctor.mx",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Doctor.mx - Telemedicina y Doctores Verificados en México",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doctor.mx | Telemedicina y Doctores Verificados en México | 24/7",
    description:
      "Consulta médica en línea con doctores verificados en México. Telemedicina segura, videoconsultas HD, y Dr. Simeon - tu asistente de salud con IA.",
    images: ["/og-image.png"],
    creator: "@doctormx",
    site: "@doctormx",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "health",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  // I18N-008: RTL support - determine text direction for locale
  const dir = getTextDirection(locale);
  const rtl = isRTL(locale);

  return (
    <html lang={locale} dir={dir} data-scroll-behavior="smooth" data-rtl={rtl}>
      <head>
        {/* PWA: Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA: Theme Color for browsers */}
        <meta name="theme-color" content="#0EA5E9" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0C4A6E" media="(prefers-color-scheme: dark)" />
        
        {/* PWA: Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.svg" />
        
        {/* PWA: Apple Mobile Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Doctor.mx" />
        
        {/* PWA: Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#0EA5E9" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.svg" />
        <meta name="msapplication-config" content="none" />
        
        {/* PERF-005: Preconnect and DNS Prefetch for External Domains */}
        {/* Preconnect to critical third-party origins for performance */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://api.supabase.co" />
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://api.stripe.com" />
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        <link rel="preconnect" href="https://browser.sentry.io" />

        {/* DNS prefetch for faster domain resolution (fallback for older browsers) */}
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.supabase.co" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        <link rel="dns-prefetch" href="https://browser.sentry.io" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerProvider>
            <WebVitalsProvider />
            <WebVitalsReporter debug={process.env.NODE_ENV === 'development'} />
            <SkipLink targetId="main-content" />
            <ToastProvider>
              {children}
            </ToastProvider>
            <StructuredData />
            <CookieConsent />
            <ConsentAwareScripts />
          </ServiceWorkerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
