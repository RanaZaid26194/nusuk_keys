"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { playHapticSound } from "@/lib/audio";

interface ErrorProps
{
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps)
{
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() =>
  {
    // read stored language preference on mount safely
    try
    {
      const savedLang = localStorage.getItem("nusuk_keys_lang_v1") || localStorage.getItem("nusuk_lang");
      if (savedLang === "ar" || savedLang === "en")
        setLang(savedLang);
    }
    catch
    {
      // ignore
    }

    console.error("Application error caught by boundary:", error);
  }, [error]);

  const isAr = lang === "ar";

  const handleReset = () =>
  {
    playHapticSound('click');
    reset();
  };

  const handleGoHome = () =>
  {
    playHapticSound('click');
    window.location.href = "/";
  };

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors"
    >
      {/* Soft emerald and gold ambient radial glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none -z-0 opacity-40 dark:opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.25) 0%, rgba(212, 175, 55, 0.15) 50%, transparent 80%)"
        }}
      />

      {/* Islamic geometric pattern (Rub el Hizb) watermark with soft radial mask */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.025] -z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none' stroke='%23d4af37' stroke-width='0.75'%3E%3Crect x='15' y='15' width='18' height='18'/%3E%3Crect x='15' y='15' width='18' height='18' transform='rotate(45 24 24)'/%3E%3Ccircle cx='24' cy='24' r='2' fill='%23d4af37'/%3E%3Cpath d='M0 24h48M24 0v48' stroke='%23d4af37' stroke-dasharray='2 3' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg rounded-3xl bg-white/95 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center"
      >
        {/* Warning Icon Ornament */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
          <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        {/* Bilingual Header */}
        <div className="space-y-1.5 mb-3">
          <h1
            className={`text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white ${
              isAr ? "font-arabic" : ""
            }`}
          >
            {isAr ? "حدث خطأ غير متوقع" : "Something Went Wrong"}
          </h1>
          <p
            className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto ${
              isAr ? "font-arabic" : ""
            }`}
          >
            {isAr
              ? "واجهنا خطأ عارض أثناء معالجة الصفحة. بياناتك ومفاتيحك المحفوظة بأمان تام."
              : "An unexpected error occurred while loading this page. Your saved keys and history are safe."}
          </p>
        </div>

        {/* Scripture / Reminder of Ease */}
        <div className="my-5 py-3 px-4 rounded-xl bg-gold-accent/5 dark:bg-zinc-950/60 border border-gold-accent/20">
          <p className="font-arabic text-sm sm:text-base text-gold-800 dark:text-gold-200 leading-relaxed">
            «إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا»
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            {isAr ? "سورة الشرح (٦)" : "“Indeed, with hardship comes ease.” — [Ash-Sharh 94:6]"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all ${
              isAr ? "font-arabic" : ""
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isAr ? "إعادة المحاولة" : "Try Again"}</span>
          </motion.button>

          <motion.button
            onClick={handleGoHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm font-medium transition-colors ${
              isAr ? "font-arabic" : ""
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{isAr ? "الرئيسية" : "Home"}</span>
          </motion.button>
        </div>

        {/* Subtle toggle for technical details */}
        {error?.message && (
          <div className="mt-6 pt-4 border-t border-zinc-200/70 dark:border-zinc-800/60">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>{showDetails ? (isAr ? "إخفاء التفاصيل" : "Hide details") : (isAr ? "تفاصيل الخطأ" : "Error details")}</span>
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2.5 text-left p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto select-all"
              >
                <div>{error.message}</div>
                {error.digest && (
                  <div className="text-[10px] text-zinc-400 mt-1">Digest: {error.digest}</div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
