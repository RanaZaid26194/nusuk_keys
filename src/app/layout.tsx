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
  themeColor: "#09090b",
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
    description: "Browse verified Nusuk challenge keys, check working status, and open directly in the official Nusuk app.",
    url: siteUrl,
    siteName: "Nusuk Keys",
    locale: "en_US",
    alternateLocale: ["ar_SA"],
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Nusuk Keys Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Nusuk Keys | Challenge Keys Directory",
    description: "Live verified challenge keys for the official Nusuk Umrah App.",
    images: ["/icon-512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nusuk Keys",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
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
    <html lang="en" className="dark">
      <head>
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${amiri.variable} font-sans antialiased bg-[#09090b] text-zinc-100 min-h-screen selection:bg-emerald-500/20 selection:text-emerald-200`}
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
