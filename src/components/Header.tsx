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
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 select-none">
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 shadow-sm">
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base sm:text-lg font-bold tracking-tight text-white ${lang === 'ar' ? 'font-arabic text-xl' : ''}`}>
                {t.siteTitle}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              {t.siteSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => onLanguageChange("en")}
              className={`relative px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                lang === "en" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {lang === "en" && (
                <motion.div
                  layoutId="activeLangPill"
                  className="absolute inset-0 bg-zinc-800 rounded-lg shadow-sm border border-zinc-700/60"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">EN</span>
            </button>

            <button
              onClick={() => onLanguageChange("ar")}
              className={`relative px-2.5 py-1 text-xs font-medium rounded-lg transition-colors font-arabic ${
                lang === "ar" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {lang === "ar" && (
                <motion.div
                  layoutId="activeLangPill"
                  className="absolute inset-0 bg-zinc-800 rounded-lg shadow-sm border border-zinc-700/60"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">العربية</span>
            </button>
          </div>

          {/* Share Your Key CTA Group */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSubmit}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className={lang === 'ar' ? 'font-arabic text-sm' : ''}>{t.shareCodeBtn}</span>
            </button>

            {/* Noble Motivation (i) Info Button */}
            <button
              onClick={onOpenInfo}
              aria-label={t.hook.infoButtonAria}
              title={t.hook.infoButtonAria}
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
