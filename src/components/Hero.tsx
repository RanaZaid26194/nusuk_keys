"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Copy, Activity, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { Language, Stats } from "@/lib/types";
import { translations } from "@/lib/translations";
import { NumberCounter } from "./NumberCounter";
import { playHapticSound } from "@/lib/audio";
import { DailyAyah } from "./DailyAyah";

interface HeroProps {
  lang: Language;
  stats: Stats;
  isConnectedToSupabase?: boolean;
  onOpenSubmit: () => void;
  onOpenInfo: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  stats,
  isConnectedToSupabase = false,
  onOpenSubmit,
  onOpenInfo,
}) => {
  const t = translations[lang];
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const handleOpenSubmit = () => {
    playHapticSound('click');
    onOpenSubmit();
  };

  const handleOpenInfo = () => {
    playHapticSound('click');
    onOpenInfo();
  };

  return (
    <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#09090b] transition-colors overflow-hidden">
      {/* Background Ambient Radial Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Minimal Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-medium mb-5 shadow-sm transition-colors">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>{isAr ? "مفاتيح نسك" : "Nusuk Keys"}</span>
        </div>

        {/* Immediate Semantic Heading for Instant LCP */}
        <h1
          className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-3xl mx-auto leading-tight transition-colors ${
            isAr ? "font-arabic leading-[1.3] sm:leading-[1.3]" : ""
          }`}
        >
          {isAr ? (
            <>
              استكشف وشارك <span className="text-zinc-900 dark:text-zinc-100">مفاتيح تحدي نسك</span>
            </>
          ) : (
            <>
              Discover & Share <span className="text-zinc-900 dark:text-zinc-100">Nusuk Challenge Keys</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed transition-colors ${
            isAr ? "font-arabic text-base sm:text-lg" : ""
          }`}
        >
          {t.heroDescription}
        </p>

        {/* Share Button with Apple-style Corner (i) Button */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22, ease: "easeOut" }}
          className="mt-7 flex items-center justify-center"
        >
          <div className="relative inline-flex items-center">
            <motion.button
              onClick={handleOpenSubmit}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              aria-label={t.shareCodeBtn}
              className="flex items-center gap-2.5 px-7 sm:px-9 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-emerald-600/25 dark:shadow-emerald-950/60 transition-all"
            >
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className={isAr ? "font-arabic text-base sm:text-lg" : ""}>{t.shareCodeBtn}</span>
              <ArrowIcon className="w-4 h-4" />
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
              className="absolute -top-0.5 right-0 rtl:left-0 rtl:right-auto sm:-top-1.5 sm:-right-2 sm:rtl:-left-2 sm:rtl:right-auto w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-emerald-950 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-400/50 shadow-md flex items-center justify-center transition-colors z-10"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="6" cy="2.5" r="1.1" />
                <path d="M5 5h1.6v4.2H7.6v.8H4.4v-.8h1.2V5.8H5V5z" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* Spiritual Hook Callout: Daily Ayah Banner */}
        <DailyAyah lang={lang} onOpenInfo={onOpenInfo} />

        {/* Exact, Clean Minimalist Stats Grid with Staggered Entrance */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto">
          {/* Stat 1: Total Active Keys */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            whileHover={{ y: -4 }}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 text-center transition-all shadow-sm"
          >
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mx-auto mb-1.5 sm:mb-2 transition-colors">
              <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight font-mono transition-colors">
              <NumberCounter value={stats.totalKeys} />
            </div>
            <div className={`text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 sm:mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalKeys}
            </div>
          </motion.div>

          {/* Stat 2: Verification Rate */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38 }}
            whileHover={{ y: -4 }}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 text-center transition-all shadow-sm"
          >
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mx-auto mb-1.5 sm:mb-2 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight font-mono transition-colors">
              <NumberCounter value={stats.successRate} suffix="%" />
            </div>
            <div className={`text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 sm:mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.activeRate}
            </div>
          </motion.div>

          {/* Stat 3: Total Copies Count */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.44 }}
            whileHover={{ y: -4 }}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 text-center transition-all shadow-sm"
          >
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mx-auto mb-1.5 sm:mb-2 transition-colors">
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight font-mono transition-colors">
              <NumberCounter value={stats.totalCopies} />
            </div>
            <div className={`text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 sm:mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalCopies}
            </div>
          </motion.div>

          {/* Stat 4: Live Status with Radar Wave */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.50 }}
            whileHover={{ y: -4 }}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 text-center transition-all shadow-sm"
          >
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mx-auto mb-1.5 sm:mb-2 transition-colors">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight transition-colors">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500" />
              </span>
              <span>{isConnectedToSupabase ? "Sync" : "Active"}</span>
            </div>
            <div className={`text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 sm:mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.liveStatus}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
