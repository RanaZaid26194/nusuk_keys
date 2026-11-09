"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Copy, Activity, ArrowRight, ArrowLeft } from "lucide-react";
import { Language, Stats } from "@/lib/types";
import { translations } from "@/lib/translations";

interface HeroProps {
  lang: Language;
  stats: Stats;
  onOpenSubmit: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, stats, onOpenSubmit }) => {
  const t = translations[lang];
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 bg-islamic-pattern">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-gold-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-gold-400/30 text-gold-300 text-xs sm:text-sm font-medium mb-5 shadow-inner"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isAr ? "تحديث مباشر لتحدي نسك 1447هـ / 2026م" : "Nusuk App Umrah Challenge 2026"}</span>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-gold-300">
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-gold-950/40 border border-gold-300/40 hover:shadow-gold-500/30 transition-all"
          >
            <KeyRound className="w-5 h-5 text-slate-950" />
            <span className={isAr ? "font-arabic text-base sm:text-lg" : ""}>{t.shareCodeBtn}</span>
            <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {/* Card 1 */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-emerald-900/40 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 mx-auto mb-2">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {stats.totalKeys}+
            </div>
            <div className={`text-xs text-slate-400 mt-0.5 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalKeys}
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-emerald-900/40 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold-500/10 text-gold-400 mx-auto mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gold-300 tracking-tight">
              {stats.successRate}%
            </div>
            <div className={`text-xs text-slate-400 mt-0.5 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.activeRate}
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-emerald-900/40 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 mx-auto mb-2">
              <Copy className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-teal-300 tracking-tight">
              {stats.totalCopies}+
            </div>
            <div className={`text-xs text-slate-400 mt-0.5 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalCopies}
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-emerald-900/40 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 mx-auto mb-2">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xl sm:text-2xl font-bold text-white tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active</span>
            </div>
            <div className={`text-xs text-slate-400 mt-0.5 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.liveStatus}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
