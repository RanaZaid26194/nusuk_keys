"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, Plus, Info } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";

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
    <header className="sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 select-none"
        >
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
        </motion.div>

        {/* Action Controls */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Language Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
            <button
              onClick={() => handleLang("en")}
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
              onClick={() => handleLang("ar")}
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

          {/* Share Your Key Button with Apple-style corner (i) button */}
          <div className="relative inline-flex items-center">
            <motion.button
              onClick={handleOpenSubmit}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className={lang === 'ar' ? 'font-arabic text-sm' : ''}>{t.shareCodeBtn}</span>
            </motion.button>

            {/* Apple-style corner accessory (i) button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenInfo();
              }}
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.9 }}
              aria-label={t.hook.infoButtonAria}
              title={t.hook.infoButtonAria}
              className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-5 h-5 rounded-full bg-zinc-950 border border-amber-500/60 hover:border-amber-400 text-amber-400 hover:text-amber-300 flex items-center justify-center text-[10px] font-bold shadow-md transition-all z-10"
            >
              <Info className="w-2.5 h-2.5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </header>
  );
};
