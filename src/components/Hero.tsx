"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Copy, Activity, ArrowRight, ArrowLeft } from "lucide-react";
import { Language, Stats } from "@/lib/types";
import { translations } from "@/lib/translations";
import { NumberCounter } from "./NumberCounter";

interface HeroProps {
  lang: Language;
  stats: Stats;
  isConnectedToSupabase?: boolean;
  onOpenSubmit: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  stats,
  isConnectedToSupabase = false,
  onOpenSubmit,
}) => {
  const t = translations[lang];
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20 bg-islamic-pattern">
      {/* Dynamic Animated Ambient Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[680px] h-[340px] sm:h-[480px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-gold-accent/15 rounded-full blur-[100px] pointer-events-none animate-pulse-subtle" />
      
      {/* Floating secondary decorative lights */}
      <motion.div
        className="absolute -top-12 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
        animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 right-1/4 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none"
        animate={{ y: [0, -25, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Live Badge with Radar Ping */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-medium mb-6 shadow-lg shadow-emerald-950/50 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span>{isAr ? "تحديث مباشر لتحدي نسك 1447هـ / 2026م" : "Live Umrah Challenge Portal 2026"}</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight ${
            isAr ? "font-arabic leading-[1.3] sm:leading-[1.3]" : ""
          }`}
        >
          {isAr ? (
            <>
              استكشف وشارك{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-200">
                مفاتيح تحدي نسك
              </span>
            </>
          ) : (
            <>
              Discover & Share{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-gold-300">
                Nusuk Challenge Keys
              </span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-4 sm:mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed ${
            isAr ? "font-arabic text-base sm:text-xl" : ""
          }`}
        >
          {t.heroDescription}
        </motion.p>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            onClick={onOpenSubmit}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-600 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-gold-950/50 border border-gold-300/60 hover:shadow-gold-500/40 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
            <KeyRound className="w-5 h-5 text-slate-950" />
            <span className={isAr ? "font-arabic text-base sm:text-lg" : ""}>{t.shareCodeBtn}</span>
            <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>

        {/* Exact, Real-Time Dynamic Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {/* Exact Stat 1: Total Active Keys */}
          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            className="glass-panel p-4 sm:p-5 rounded-2xl border border-emerald-900/50 hover:border-emerald-500/40 text-center transition-all shadow-lg"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 mx-auto mb-2.5">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              <NumberCounter value={stats.totalKeys} />
            </div>
            <div className={`text-xs text-slate-400 font-medium mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalKeys}
            </div>
          </motion.div>

          {/* Exact Stat 2: Verification Rate */}
          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            className="glass-panel p-4 sm:p-5 rounded-2xl border border-emerald-900/50 hover:border-gold-500/40 text-center transition-all shadow-lg"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold-500/10 text-gold-400 mx-auto mb-2.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gold-300 tracking-tight font-mono">
              <NumberCounter value={stats.successRate} suffix="%" />
            </div>
            <div className={`text-xs text-slate-400 font-medium mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.activeRate}
            </div>
          </motion.div>

          {/* Exact Stat 3: Total Copies Count */}
          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            className="glass-panel p-4 sm:p-5 rounded-2xl border border-emerald-900/50 hover:border-teal-500/40 text-center transition-all shadow-lg"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 mx-auto mb-2.5">
              <Copy className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 tracking-tight font-mono">
              <NumberCounter value={stats.totalCopies} />
            </div>
            <div className={`text-xs text-slate-400 font-medium mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalCopies}
            </div>
          </motion.div>

          {/* Exact Stat 4: Live Status */}
          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            className="glass-panel p-4 sm:p-5 rounded-2xl border border-emerald-900/50 hover:border-emerald-500/40 text-center transition-all shadow-lg"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 mx-auto mb-2.5">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
              </span>
              <span>{isConnectedToSupabase ? "Sync" : "Active"}</span>
            </div>
            <div className={`text-xs text-slate-400 font-medium mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.liveStatus}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
