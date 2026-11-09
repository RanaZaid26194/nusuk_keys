"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, Plus } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenSubmit: () => void;
  onOpenInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onOpenSubmit,
  onOpenInfo,
}) => {
  const t = translations[lang];

  const handleLang = (newLang: Language) => {
    playHapticSound('click');
    onLanguageChange(newLang);
  };

  const handleOpenSubmit = () => {
    playHapticSound('click');
    onOpenSubmit();
  };

  const handleOpenInfo = () => {
    playHapticSound('click');
    onOpenInfo();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3 select-none flex-shrink-0"
        >
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm transition-colors">
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap ${lang === 'ar' ? 'font-arabic text-base sm:text-xl' : ''}`}>
                {t.siteTitle}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block whitespace-nowrap">
              {t.siteSubtitle}
            </p>
          </div>
        </motion.div>

        {/* Action Controls */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0"
        >
          {/* Theme Switcher (Light / Dark) */}
          <ThemeToggle isAr={lang === 'ar'} />

          {/* Language Switcher */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors" role="group" aria-label="Language selection">
            <button
              onClick={() => handleLang("en")}
              aria-label="Switch to English"
              className={`relative px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-lg transition-colors ${
                lang === "en" ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {lang === "en" && (
                <motion.div
                  layoutId="activeLangPill"
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700/60"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">EN</span>
            </button>

            <button
              onClick={() => handleLang("ar")}
              aria-label="التغيير إلى العربية"
              className={`relative px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-lg transition-colors font-arabic ${
                lang === "ar" ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {lang === "ar" && (
                <motion.div
                  layoutId="activeLangPill"
                  className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700/60"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">العربية</span>
            </button>
          </div>

          {/* Share Your Key Button with Apple-style corner (i) button */}
          <div className="relative inline-flex items-center">
            <motion.button
              onClick={handleOpenSubmit}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              aria-label={t.shareCodeBtn}
              title={t.shareCodeBtn}
              className="flex items-center justify-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className={`hidden sm:inline ${lang === 'ar' ? 'font-arabic text-sm' : ''}`}>{t.shareCodeBtn}</span>
            </motion.button>

            {/* Apple-style single circle (i) button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenInfo();
              }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              aria-label={t.hook.infoButtonAria}
              title={t.hook.infoButtonAria}
              className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 rtl:-left-1 rtl:right-auto sm:rtl:-left-1.5 w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-emerald-950 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-400/50 shadow-md flex items-center justify-center transition-colors z-10"
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="6" cy="2.5" r="1.1" />
                <path d="M5 5h1.6v4.2H7.6v.8H4.4v-.8h1.2V5.8H5V5z" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </header>
  );
};
