"use client";

import React from "react";
import { KeyRound, ShieldCheck, Copy, Activity, ArrowRight, ArrowLeft, Info, HeartHandshake } from "lucide-react";
import { Language, Stats } from "@/lib/types";
import { translations } from "@/lib/translations";
import { NumberCounter } from "./NumberCounter";

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

  return (
    <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-zinc-800/80 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Minimal Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-medium mb-5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isAr ? "مفاتيح نسك" : "Nusuk Keys"}</span>
        </div>

        {/* Heading */}
        <h1
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
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed ${
            isAr ? "font-arabic text-base sm:text-lg" : ""
          }`}
        >
          {t.heroDescription}
        </p>

        {/* Share Button & Info Trigger */}
        <div className="mt-7 flex items-center justify-center gap-2.5">
          <button
            onClick={onOpenSubmit}
            className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span className={isAr ? "font-arabic text-base" : ""}>{t.shareCodeBtn}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>

          {/* Noble motivation info button */}
          <button
            onClick={onOpenInfo}
            aria-label={t.hook.infoButtonAria}
            title={t.hook.infoButtonAria}
            className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 transition-colors shadow-sm"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Spiritual Hook Callout: Refined Ayah Banner */}
        <div
          onClick={onOpenInfo}
          className="mt-5 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-amber-500/25 hover:border-amber-500/40 cursor-pointer transition-all max-w-xl mx-auto shadow-sm"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xs text-zinc-300 truncate text-left rtl:text-right">
            <span className="font-arabic font-semibold text-amber-200 text-sm">{t.hook.ayahArabic}</span>
            {!isAr && <span className="opacity-80 ml-2 text-[11px] text-zinc-400">— {t.hook.ayahTranslation}</span>}
          </p>
        </div>

        {/* Exact, Clean Minimalist Stats Grid */}
        <div className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {/* Stat 1: Total Active Keys */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 text-center transition-all shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 mx-auto mb-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              <NumberCounter value={stats.totalKeys} />
            </div>
            <div className={`text-xs text-zinc-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalKeys}
            </div>
          </div>

          {/* Stat 2: Verification Rate */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 text-center transition-all shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 mx-auto mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              <NumberCounter value={stats.successRate} suffix="%" />
            </div>
            <div className={`text-xs text-zinc-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.activeRate}
            </div>
          </div>

          {/* Stat 3: Total Copies Count */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 text-center transition-all shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 mx-auto mb-2">
              <Copy className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
              <NumberCounter value={stats.totalCopies} />
            </div>
            <div className={`text-xs text-zinc-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.totalCopies}
            </div>
          </div>

          {/* Stat 4: Live Status */}
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 text-center transition-all shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 mx-auto mb-2">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isConnectedToSupabase ? "Sync" : "Active"}</span>
            </div>
            <div className={`text-xs text-zinc-400 mt-1 ${isAr ? "font-arabic" : ""}`}>
              {t.stats.liveStatus}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
