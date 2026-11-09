"use client";

import React from "react";
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
    <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-emerald-950/60 bg-[#07130f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Minimal Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 text-xs sm:text-sm font-medium mb-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{isAr ? "مفاتيح نسك" : "Nusuk Keys"}</span>
        </div>

        {/* Heading - Solid typography, NO text gradients */}
        <h1
          className={`text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight ${
            isAr ? "font-arabic leading-[1.3] sm:leading-[1.3]" : ""
          }`}
        >
          {isAr ? (
            <>
              استكشف وشارك <span className="text-emerald-400">مفاتيح تحدي نسك</span>
            </>
          ) : (
            <>
              Discover & Share <span className="text-emerald-400">Nusuk Challenge Keys</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed ${
            isAr ? "font-arabic text-base sm:text-lg" : ""
          }`}
        >
          {t.heroDescription}
        </p>

        {/* Share Button */}
        <div className="mt-7 flex justify-center">
          <button
            onClick={onOpenSubmit}
            className="flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            <span className={isAr ? "font-arabic" : ""}>{t.shareCodeBtn}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Exact, Clean Stats Grid */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {/* Stat 1: Total Active Keys */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-950/80 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 mx-auto mb-2">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              <NumberCounter value={stats.totalKeys} />
            </div>
            <div className={`text-xs text-slate-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalKeys}
            </div>
          </div>

          {/* Stat 2: Verification Rate */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-950/80 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 mx-auto mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              <NumberCounter value={stats.successRate} suffix="%" />
            </div>
            <div className={`text-xs text-slate-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.activeRate}
            </div>
          </div>

          {/* Stat 3: Total Copies Count */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-950/80 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 mx-auto mb-2">
              <Copy className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              <NumberCounter value={stats.totalCopies} />
            </div>
            <div className={`text-xs text-slate-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalCopies}
            </div>
          </div>

          {/* Stat 4: Live Status */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-950/80 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 mx-auto mb-2">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>{isConnectedToSupabase ? "Sync" : "Active"}</span>
            </div>
            <div className={`text-xs text-slate-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.liveStatus}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
