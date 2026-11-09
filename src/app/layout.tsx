import type { Metadata, Viewport } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";

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

export const viewport: Viewport = {
  themeColor: "#064e3b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Nusuk Keys | Challenge Keys Directory",
  description: "Discover and share active Nusuk Challenge keys (NG-...). One-tap copy and instant deep-linking into the official Nusuk App.",
  keywords: ["Nusuk", "Nusuk App", "Umrah Challenge", "Nusuk Keys", "Saudi Arabia", "Hajj", "Umrah", "NG Code"],
  authors: [{ name: "Nusuk Keys" }],
  openGraph: {
    title: "Nusuk Keys | Challenge Keys Directory",
    description: "Browse verified Nusuk challenge keys, check working status, and open directly in the Nusuk app.",
    type: "website",
    locale: "en_US",
    siteName: "Nusuk Keys",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nusuk Keys | Challenge Keys Directory",
    description: "Nusuk challenge keys directory for pilgrims.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${amiri.variable} font-sans antialiased bg-[#07130f] text-slate-100 min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200`}>
        {children}
      </body>
    </html>
  );
}
