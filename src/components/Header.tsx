"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, Plus, Info } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";

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

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-950 border border-emerald-800/80">
            <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg sm:text-xl font-bold tracking-tight text-white ${lang === 'ar' ? 'font-arabic text-xl' : ''}`}>
                {t.siteTitle}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.siteSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-emerald-900/50">
            <button
              onClick={() => onLanguageChange("en")}
              className={`relative px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                lang === "en" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === "en" && (
                <motion.div
                  layoutId="activeLangPill"
                  className="absolute inset-0 bg-emerald-700/80 rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">EN</span>
            </button>

            <button
              onClick={() => onLanguageChange("ar")}
              className={`relative px-2.5 py-1 text-xs font-medium rounded-lg transition-colors font-arabic ${
                lang === "ar" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === "ar" && (
                <motion.div
                  layoutId="activeLangPill"
                  className="absolute inset-0 bg-emerald-700/80 rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">العربية</span>
            </button>
          </div>

          {/* Share Your Key CTA Group */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSubmit}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className={lang === 'ar' ? 'font-arabic text-sm' : ''}>{t.shareCodeBtn}</span>
            </button>

            {/* Noble Motivation (i) Info Button */}
            <button
              onClick={onOpenInfo}
              aria-label={t.hook.infoButtonAria}
              title={t.hook.infoButtonAria}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-emerald-950 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
