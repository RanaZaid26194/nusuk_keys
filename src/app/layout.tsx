import type { Metadata, Viewport } from "next";
import { Inter, Amiri } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Next.js automatically self-hosts Google Fonts at build time (zero external requests)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const siteUrl = "https://keys-nusuk.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nusuk Keys | Challenge Keys Directory (مفاتيح نسك)",
    template: "%s | Nusuk Keys",
  },
  description: "Discover and share active Nusuk Challenge keys (NG-...). Community-verified directory for Umrah pilgrims with one-tap copy and instant deep-linking into the official Nusuk App.",
  keywords: [
    "Nusuk",
    "Nusuk App",
    "Nusuk Challenge Keys",
    "Nusuk Keys",
    "Umrah Challenge",
    "Saudi Arabia",
    "Hajj",
    "Umrah",
    "NG Code",
    "مفاتيح نسك",
    "تحدي نسك",
    "رموز نسك",
  ],
  authors: [{ name: "Nusuk Keys", url: siteUrl }],
  creator: "Nusuk Keys",
  publisher: "Nusuk Keys",
  applicationName: "Nusuk Keys",
  manifest: "/manifest.webmanifest",
  verification: {
    google: "googlea2294fd447f1f41b",
  },
  alternates: {
    canonical: "/",
    languages: {
      "en": "/?lang=en",
      "ar": "/?lang=ar",
    },
  },
  openGraph: {
    title: "Nusuk Keys | Challenge Keys Directory (مفاتيح نسك)",
    description: "Discover and share live verified Nusuk referral keys to complete Umrah challenges and unlock rewards in the official Nusuk app.",
    url: siteUrl,
    siteName: "Nusuk Keys",
    locale: "en_US",
    alternateLocale: ["ar_SA"],
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Nusuk Keys - Live Verified Challenge Keys Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nusuk Keys | Challenge Keys Directory (مفاتيح نسك)",
    description: "Live verified referral keys to unlock rewards and complete challenges in the official Nusuk Umrah App.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@nusuk_keys",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nusuk Keys",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

// Rich Structured Data (JSON-LD) for Search Engines & LLM Crawlers
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#app`,
      "name": "Nusuk Keys",
      "alternateName": "مفاتيح نسك",
      "url": siteUrl,
      "image": `${siteUrl}/og-image.png`,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All",
      "description": "Live directory of challenge referral keys for the official Saudi Nusuk Umrah App.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "SAR",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Nusuk Keys",
      "description": "Directory of Nusuk challenge keys shared by pilgrims for pilgrims.",
      "inLanguage": ["en", "ar"],
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What are Nusuk Challenge Keys (NG codes)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nusuk Challenge Keys are referral codes starting with 'NG-' used in the official Saudi Nusuk application (services.nusuk.sa) to complete Umrah milestone challenges and unlock app rewards.",
          },
        },
        {
          "@type": "Question",
          "name": "Are Nusuk Challenge Keys time limited?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, Nusuk challenge referral keys are not time-restricted by specific years and can be used by pilgrims globally as long as they have not previously entered that specific key.",
          },
        },
        {
          "@type": "Question",
          "name": "How does sharing a challenge key act as Sadaqah Jariyah?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "By sharing a valid challenge key, pilgrims help others complete religious milestones and challenges in the holy lands, embodying the Hadith: 'Allah helps His servant as long as the servant is helping his brother' (Sahih Muslim 2699).",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Critical Origins & Preload Nastaliq Font */}
        <link rel="preconnect" href="https://dttwxygghtdxokcebwta.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://dttwxygghtdxokcebwta.supabase.co" />
        <link rel="preconnect" href="https://api.alquran.cloud" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.alquran.cloud" />
        <link rel="preload" href="/fonts/NotoNastaliqUrdu.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

        {/* Synchronous inline script to prevent theme flash (FOUT) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('nusuk_theme_mode');
                  var isDark = mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${amiri.variable} font-sans antialiased bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors duration-200`}
      >
        {children}

        {/* Vercel Web Analytics */}
        <Analytics />

        {/* Vercel Speed Insights (Core Web Vitals monitoring) */}
        <SpeedInsights />
      </body>
    </html>
  );
}
