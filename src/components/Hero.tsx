"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Copy, Activity, ArrowRight, ArrowLeft, Info, HeartHandshake } from "lucide-react";
import { Language, Stats } from "@/lib/types";
import { translations } from "@/lib/translations";
import { NumberCounter } from "./NumberCounter";
import { playHapticSound } from "@/lib/audio";

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
    <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-zinc-800/80 bg-[#09090b] overflow-hidden">
      {/* Background Ambient Radial Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-500/5 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Minimal Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-medium mb-5 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>{isAr ? "مفاتيح نسك" : "Nusuk Keys"}</span>
        </motion.div>

        {/* Heading with Motion */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
          className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight ${
            isAr ? "font-arabic leading-[1.3] sm:leading-[1.3]" : ""
          }`}
        >
          {isAr ? (
            <>
              استكشف وشارك <span className="text-zinc-100">مفاتيح تحدي نسك</span>
            </>
          ) : (
            <>
              Discover & Share <span className="text-zinc-100">Nusuk Challenge Keys</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
          className={`mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed ${
            isAr ? "font-arabic text-base sm:text-lg" : ""
          }`}
        >
          {t.heroDescription}
        </motion.p>

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
              className="flex items-center gap-2.5 px-7 sm:px-9 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-emerald-950/60 transition-all"
            >
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className={isAr ? "font-arabic text-base sm:text-lg" : ""}>{t.shareCodeBtn}</span>
              <ArrowIcon className="w-4 h-4" />
            </motion.button>

            {/* Noble motivation info button (top right corner of the share button) */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenInfo();
              }}
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.9 }}
              aria-label={t.hook.infoButtonAria}
              title={t.hook.infoButtonAria}
              className="absolute -top-1.5 -right-2 sm:-top-2 sm:-right-2.5 w-6 h-6 rounded-full bg-zinc-950 border border-amber-500/60 hover:border-amber-400 text-amber-400 hover:text-amber-300 flex items-center justify-center text-xs font-bold shadow-md transition-all z-10"
            >
              <Info className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>

        {/* Spiritual Hook Callout: Interactive Refined Ayah Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
          onClick={handleOpenInfo}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="mt-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-amber-500/25 hover:border-amber-500/50 cursor-pointer transition-all max-w-xl mx-auto shadow-sm group"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xs text-zinc-300 truncate text-left rtl:text-right">
            <span dir="rtl" className="font-nastaliq font-bold text-amber-200 text-sm sm:text-base group-hover:text-amber-100 transition-colors">
              «{t.hook.ayahArabic}»
            </span>
            {!isAr && <span className="opacity-80 ml-2 text-[11px] text-zinc-400">— {t.hook.ayahTranslation}</span>}
          </p>
        </motion.div>

        {/* Exact, Clean Minimalist Stats Grid with Staggered Entrance */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {/* Stat 1: Total Active Keys */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            whileHover={{ y: -4 }}
            className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 text-center transition-all shadow-sm"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 mx-auto mb-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              <NumberCounter value={stats.totalKeys} />
            </div>
            <div className={`text-xs text-zinc-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalKeys}
            </div>
          </motion.div>

          {/* Stat 2: Verification Rate */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38 }}
            whileHover={{ y: -4 }}
            className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 text-center transition-all shadow-sm"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 mx-auto mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              <NumberCounter value={stats.successRate} suffix="%" />
            </div>
            <div className={`text-xs text-zinc-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.activeRate}
            </div>
          </motion.div>

          {/* Stat 3: Total Copies Count */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.44 }}
            whileHover={{ y: -4 }}
            className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 text-center transition-all shadow-sm"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 mx-auto mb-2">
              <Copy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              <NumberCounter value={stats.totalCopies} />
            </div>
            <div className={`text-xs text-zinc-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalCopies}
            </div>
          </motion.div>

          {/* Stat 4: Live Status with Radar Wave */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.50 }}
            whileHover={{ y: -4 }}
            className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 text-center transition-all shadow-sm"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 mx-auto mb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
              </span>
              <span>{isConnectedToSupabase ? "Sync" : "Active"}</span>
            </div>
            <div className={`text-xs text-zinc-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.liveStatus}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
