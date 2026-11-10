"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, PlusSquare, X } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";
import { safeGet, safeSet } from "@/lib/safeStorage";

interface PWAInstallPromptProps
{
  lang: Language;
}

const VISIT_COUNT_KEY = "nusuk_pwa_visit_count";
const DISMISSED_KEY = "nusuk_pwa_install_dismissed";

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ lang }) =>
{
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  const t = translations[lang];
  const isAr = lang === "ar";

  useEffect(() =>
  {
    if (typeof window === "undefined")
      return;

    // Check if already running in standalone mode (installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    if (isStandalone)
      return;

    // Check if user has permanently dismissed it
    const dismissed = safeGet(DISMISSED_KEY);
    if (dismissed === "true")
      return;

    // Increment and evaluate visit count
    const visits = parseInt(safeGet(VISIT_COUNT_KEY) || "0", 10) + 1;
    safeSet(VISIT_COUNT_KEY, String(visits));

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Chrome/Android beforeinstallprompt event
    const handleBeforeInstall = (e: Event) =>
    {
      e.preventDefault();
      setDeferredPrompt(e);
      if (visits >= 2)
        setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // On iOS Safari, show prompt after second visit after a short delay
    if (isIosDevice && visits >= 2)
    {
      const timer = setTimeout(() =>
      {
        setShowPrompt(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleDismiss = () =>
  {
    playHapticSound("click");
    setShowPrompt(false);
    safeSet(DISMISSED_KEY, "true");
  };

  const handleInstallClick = async () =>
  {
    playHapticSound("click");
    if (deferredPrompt)
    {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted")
        safeSet(DISMISSED_KEY, "true");
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.aside
          role="region"
          aria-label={t.install?.title || "Install App"}
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-50 p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                {isIOS ? <Share2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
              </div>
              <div>
                <h4 className={`text-sm font-bold text-zinc-900 dark:text-white ${isAr ? "font-arabic" : ""}`}>
                  {t.install?.title || "Add to Home Screen"}
                </h4>
                <p className={`text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
                  {isIOS
                    ? (t.install?.iosInstruction || "Tap Share below, then 'Add to Home Screen'")
                    : (t.install?.desc || "Install for instant one-tap access on your pilgrimage")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label={t.install?.dismiss || "Dismiss"}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={handleDismiss}
              className={`px-3 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium transition-colors ${
                isAr ? "font-arabic" : ""
              }`}
            >
              {t.install?.dismiss || "Not now"}
            </button>

            {!isIOS && deferredPrompt && (
              <motion.button
                type="button"
                onClick={handleInstallClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors ${
                  isAr ? "font-arabic" : ""
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.install?.button || "Install App"}</span>
              </motion.button>
            )}

            {isIOS && (
              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <PlusSquare className="w-3.5 h-3.5" />
                <span className={isAr ? "font-arabic" : ""}>Share → Add to Home Screen</span>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
