"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";
import { DailyAyahData, getDayKey, resolveDailyAyah } from "@/lib/dailyAyah";

interface DailyAyahProps
{
  lang: Language;
  onOpenInfo: () => void;
}

// helper to calculate exact word stagger and total reveal time in ms
export function computeRevealTimeMs(
  wordCount: number,
  reducedMotion: boolean = false
): { staggerMs: number; fadeMs: number; totalMs: number }
{
  if (reducedMotion || wordCount <= 0)
    return { staggerMs: 0, fadeMs: 150, totalMs: 150 };
  const maxStaggerTotal = 0.40;
  const stagger = Math.min(0.04, wordCount > 1 ? maxStaggerTotal / (wordCount - 1) : 0.04);
  const fade = 0.15;
  const total = (wordCount - 1) * stagger + fade;
  return {
    staggerMs: Math.round(stagger * 1000),
    fadeMs: Math.round(fade * 1000),
    totalMs: Math.round(total * 1000)
  };
}

export const DailyAyah: React.FC<DailyAyahProps> = ({ lang, onOpenInfo }) =>
{
  const [ayah, setAyah] = useState<DailyAyahData | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const t = translations[lang];
  const isAr = lang === "ar";

  // click trigger with haptics
  const handleClick = () =>
  {
    playHapticSound('click');
    onOpenInfo();
  };

  // keyboard support for a11y
  const handleKeyDown = (e: React.KeyboardEvent) =>
  {
    if (e.key === "Enter" || e.key === " ")
    {
      e.preventDefault();
      handleClick();
    }
  };

  // mount resolver and visibility listener
  useEffect(() =>
  {
    let activeDayKey = getDayKey();
    let isMounted = true;

    const syncAyah = async () =>
    {
      const res = await resolveDailyAyah();
      if (isMounted)
        setAyah(res.ayah);
    };

    syncAyah();

    const handleVisibility = () =>
    {
      if (document.visibilityState === "visible")
      {
        const latestKey = getDayKey();
        if (latestKey !== activeDayKey)
        {
          activeDayKey = latestKey;
          syncAyah();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
    {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // split into whole words so arabic cursive ligatures never break
  const arabicWords = ayah ? ayah.arabic.trim().split(/\s+/) : [];
  const revealMetrics = computeRevealTimeMs(arabicWords.length, Boolean(shouldReduceMotion));
  const staggerStep = revealMetrics.staggerMs / 1000;
  const wordFadeSec = revealMetrics.fadeMs / 1000;

  const containerVariants =
  {
    hidden: {},
    visible:
    {
      transition:
      {
        staggerChildren: shouldReduceMotion ? 0 : staggerStep,
        delayChildren: shouldReduceMotion ? 0 : 0.04
      }
    }
  };

  const wordVariants =
  {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 2 },
    visible:
    {
      opacity: 1,
      y: 0,
      transition: { duration: wordFadeSec, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={t.hook.infoButtonAria}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.28, ease: "easeOut" }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="mt-6 flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-amber-500/25 hover:border-amber-500/40 cursor-pointer transition-all max-w-xl mx-auto shadow-sm group text-center min-h-[176px]"
    >
      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mb-1.5">
        <HeartHandshake className="w-4 h-4 text-amber-400" />
      </div>

      <div className="text-center w-full overflow-visible">
        <AnimatePresence mode="wait">
          {ayah && (
            <motion.div
              key={`${ayah.surah}:${ayah.numberInSurah}-${lang}`}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -3 }}
              transition={{ duration: shouldReduceMotion ? 0.15 : 0.22, ease: "easeInOut" }}
              className="w-full"
            >
              {/* 1. Small uppercase label above the ayah */}
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span
                  className={
                    isAr
                      ? "font-arabic text-xs text-amber-400/90 font-medium tracking-normal select-none"
                      : "text-[10px] uppercase tracking-widest text-amber-400/90 font-semibold font-mono select-none"
                  }
                >
                  {isAr ? "آية اليوم" : "Ayah of the Day"}
                </span>
              </div>

              {/* 2. Arabic ayah: whole word stagger with ligatures preserved, lang='ar' */}
              <motion.div
                dir="rtl"
                lang="ar"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="font-arabic font-normal text-amber-200 text-base sm:text-lg leading-[2.2] py-1 px-2 text-center group-hover:text-amber-100 transition-colors overflow-visible select-text"
              >
                «{arabicWords.map((word, idx) => (
                  <React.Fragment key={idx}>
                    <motion.span variants={wordVariants} className="inline-block">
                      {word}
                    </motion.span>
                    {idx < arabicWords.length - 1 ? " " : ""}
                  </React.Fragment>
                ))}»
              </motion.div>

              {/* 4. Hairline divider with tiny amber diamond (EN mode only) */}
              {!isAr && (
                <div className="flex items-center justify-center gap-2.5 my-2 max-w-[200px] mx-auto opacity-75">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-amber-500/40" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-amber-400/80 shadow-[0_0_6px_rgba(251,191,36,0.4)] flex-shrink-0" />
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-amber-500/25 to-amber-500/40" />
                </div>
              )}

              {/* English translation and reference */}
              {!isAr && (
                <>
                  <div className="text-[11px] sm:text-xs text-zinc-400 text-center">
                    “{ayah.english}” — [Surah {ayah.surahNameEn} ({ayah.surah}:{ayah.numberInSurah})]
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 text-center">
                    Sahih International
                  </div>
                </>
              )}

              {/* In Arabic mode: Arabic reference only, zero English text */}
              {isAr && (
                <div
                  dir="rtl"
                  className="text-[11px] sm:text-xs text-amber-400/80 font-arabic mt-1 text-center"
                >
                  [{ayah.surahNameAr} ({ayah.numberInSurah})]
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
