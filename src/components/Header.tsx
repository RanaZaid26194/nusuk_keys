"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, Plus } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenSubmit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onOpenSubmit,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer select-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-emerald-950 border border-gold-400/30 shadow-lg shadow-emerald-950/50">
            <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-gold-300" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-[#07130f]"
              animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
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
        </motion.div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
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

          {/* Share Key Primary CTA */}
          <motion.button
            onClick={onOpenSubmit}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-900/40 border border-emerald-300/30 transition-all hover:shadow-emerald-500/25"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className={lang === 'ar' ? 'font-arabic text-sm' : ''}>{t.shareCodeBtn}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
