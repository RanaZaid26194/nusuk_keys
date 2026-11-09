"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HeartHandshake } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";
import { DailyAyahData, getDayKey, resolveDailyAyah, getFallbackAyah } from "@/lib/dailyAyah";
import { useCanHover } from "@/lib/useCanHover";

interface DailyAyahProps
{
  lang: Language;
  onOpenInfo: () => void;
  mockFriday?: boolean;
}

// helper to convert ascii digits to arabic-indic digits for mushaf ayah marker
function toArabicIndic(num?: number | null): string
{
  if (typeof num !== "number" || isNaN(num) || num <= 0)
    return "";
  const digits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (d) => digits[Number(d)]);
}

// helper to clean quotation marks safely
function cleanEnglishAyah(text?: string | null): string
{
  if (!text || typeof text !== "string")
    return "";
  return text.trim().replace(/^["“'”]+|["“'”]+$/g, "");
}

// helper to calculate exact word stagger and total reveal time in ms
export function computeRevealTimeMs(
  wordCount: number,
  reducedMotion: boolean = false
): { staggerMs: number; fadeMs: number; totalMs: number }
{
  if (reducedMotion || wordCount <= 0)
    return { staggerMs: 0, fadeMs: 180, totalMs: 180 };
  const maxStaggerTotal = 0.65;
  const stagger = Math.min(0.055, wordCount > 1 ? maxStaggerTotal / (wordCount - 1) : 0.055);
  const fade = 0.22;
  const total = (wordCount - 1) * stagger + fade;
  return {
    staggerMs: Math.round(stagger * 1000),
    fadeMs: Math.round(fade * 1000),
    totalMs: Math.round(total * 1000)
  };
}

export const DailyAyah: React.FC<DailyAyahProps> = ({ lang, onOpenInfo, mockFriday = false }) =>
{
  const [ayah, setAyah] = useState<DailyAyahData | null>(null);
  const [isFriday, setIsFriday] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();
  const canHover = useCanHover();
  const t = translations[lang];
  const isAr = lang === "ar";

  useEffect(() =>
  {
    if (typeof navigator !== "undefined")
    {
      const isAppleMobile =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setIsIOS(isAppleMobile);
    }
  }, []);

  // Platform-aware Ayah End Marker:
  // Desktop & Android remain 100% untouched using native HarfBuzz ligature.
  // iOS Safari CoreText (which renders U+06DD and digits side-by-side) uses precision composite centering.
  const renderAyahMarker = (num?: number | null) =>
  {
    const arabicDigits = toArabicIndic(num);
    if (!arabicDigits)
      return null;

    if (isIOS)
    {
      const digitLen = arabicDigits.length;
      const digitSizeClass =
        digitLen >= 3
          ? "text-[0.40em] tracking-tighter"
          : digitLen === 2
            ? "text-[0.50em] tracking-normal"
            : "text-[0.52em] tracking-normal";

      return (
        <span
          className="inline-flex items-center justify-center relative select-none align-middle font-arabic text-gold-700/80 dark:text-gold-accent/80 mx-0.5 w-[1.3em] h-[1.3em] leading-none"
          aria-hidden="true"
        >
          <span className="absolute inset-0 flex items-center justify-center text-[1.3em] leading-none select-none">
            &#x06DD;
          </span>
          <span
            className={`relative z-10 flex items-center justify-center font-arabic font-bold ${digitSizeClass} leading-none pt-[0.12em] text-gold-700/95 dark:text-gold-accent/95 select-none`}
          >
            {arabicDigits}
          </span>
        </span>
      );
    }

    return (
      <span className="font-arabic text-gold-700/80 dark:text-gold-accent/80 select-none text-[1.05em] leading-none" aria-hidden="true">
        &#x06DD;{arabicDigits}
      </span>
    );
  };

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

    // gate friday check strictly after mount to prevent hydration mismatch
    const now = new Date();
    setIsFriday(mockFriday || now.getDay() === 5);

    const syncAyah = async () =>
    {
      // 1. Instantly paint fallback or cached ayah so the card is never blank!
      const initial = await getFallbackAyah(activeDayKey);
      if (isMounted && initial)
        setAyah(initial);

      // 2. Resolve or upgrade quietly in background
      const res = await resolveDailyAyah();
      if (isMounted && res.ayah)
        setAyah(res.ayah);
    };

    syncAyah();

    const handleVisibility = () =>
    {
      const currentNow = new Date();
      setIsFriday(mockFriday || currentNow.getDay() === 5);

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
  }, [mockFriday]);

  // split into whole words so arabic cursive ligatures never break
  const arabicWords = ayah && typeof ayah.arabic === "string" ? ayah.arabic.trim().split(/\s+/) : [];
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
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 3 },
    visible:
    {
      opacity: 1,
      y: 0,
      transition: { duration: wordFadeSec, ease: "easeOut" }
    }
  };

  // friday badge label or daily ayah label
  const labelText = isFriday
    ? isAr
      ? "جمعة مباركة"
      : "Jumu'ah Mubarak"
    : isAr
      ? "آية اليوم"
      : "Ayah of the Day";

  // ayah entrance variants so delay stays isolated to initial load
  const ayahVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, delay: 0.2, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={
        ayah
          ? (isAr ? `آية اليوم: ${ayah.arabic} - ${ayah.surahNameAr}` : `Daily Ayah: ${ayah.english} - Surah ${ayah.surahNameEn}`)
          : t.hook.infoButtonAria
      }
      variants={ayahVariants}
      initial="hidden"
      animate="visible"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      whileHover={canHover ? {
        y: -3,
        scale: 1.006,
        transition: { duration: 0.16, ease: "easeOut" }
      } : undefined}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className={`mt-6 relative overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-white/90 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-900 border ${
        isFriday
          ? "border-gold-accent/40 dark:border-gold-accent/35 hover:border-gold-accent/60 dark:hover:border-gold-accent/50 shadow-[0_0_20px_rgba(212,175,55,0.12)] dark:shadow-[0_0_20px_rgba(212,175,55,0.06)]"
          : "border-gold-accent/30 dark:border-gold-accent/20 hover:border-gold-accent/45 dark:hover:border-gold-accent/35 shadow-xs hover:shadow-md"
      } cursor-pointer transition-colors duration-150 max-w-xl mx-auto group text-center min-h-[160px] sm:min-h-[176px]`}
    >
      {/* 3. Soft gold ambient radial glow at the top */}
      <div
        className="absolute inset-x-0 top-0 h-28 pointer-events-none -z-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.02) 50%, transparent 100%)"
        }}
      />

      {/* 4. Eight-pointed star geometric pattern (Rub el Hizb) with soft radial mask */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.035] -z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48' fill='none' stroke='%23d4af37' stroke-width='0.75'%3E%3Crect x='15' y='15' width='18' height='18'/%3E%3Crect x='15' y='15' width='18' height='18' transform='rotate(45 24 24)'/%3E%3Ccircle cx='24' cy='24' r='2' fill='%23d4af37'/%3E%3Cpath d='M0 24h48M24 0v48' stroke='%23d4af37' stroke-dasharray='2 3' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)"
        }}
      />

      {/* Scripture Header Icon Circle */}
      <div className="relative z-10 w-8 h-8 rounded-full bg-gold-accent/10 border border-gold-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200 mb-1.5">
        <HeartHandshake className="w-4 h-4 text-gold-accent" />
      </div>

      <div className="relative z-10 text-center w-full overflow-visible">
        <AnimatePresence mode="wait">
          {ayah && (
            <motion.div
              key={`${ayah.surah}:${ayah.numberInSurah}-${lang}-${isFriday ? 'fri' : 'reg'}`}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -3 }}
              transition={{ duration: shouldReduceMotion ? 0.15 : 0.22, ease: "easeInOut" }}
              className="w-full flex flex-col items-center justify-center text-center"
            >
              {/* 1 & 6. Label above the ayah with Friday conditional */}
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span
                  className={
                    isAr
                      ? "font-arabic text-xs text-gold-700 dark:text-gold-accent/90 font-medium tracking-normal select-none"
                      : "text-[10px] uppercase tracking-widest text-gold-700 dark:text-gold-accent/90 font-semibold font-mono select-none"
                  }
                >
                  {labelText}
                </span>
              </div>

              {/* 1 & 2. Arabic ayah: gold-800 in light, gold-200 in dark, Amiri font, whole word stagger, lang='ar' */}
              <motion.div
                dir="rtl"
                lang="ar"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ textAlign: "center", textWrap: "balance" }}
                className="w-full font-arabic font-normal text-gold-800 dark:text-gold-200 text-base sm:text-lg leading-[2.2] sm:leading-[2.3] py-1 px-2 text-center !text-center mx-auto group-hover:text-gold-950 dark:group-hover:text-gold-100 transition-colors overflow-visible select-text"
              >
                {arabicWords.map((word, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === arabicWords.length - 1;

                  if (isFirst && isLast)
                  {
                    return (
                      <motion.span key={idx} variants={wordVariants} className="inline-block whitespace-nowrap">
                        «{word}&nbsp;{renderAyahMarker(ayah.numberInSurah)}»
                      </motion.span>
                    );
                  }

                  if (isFirst)
                  {
                    return (
                      <React.Fragment key={idx}>
                        <motion.span variants={wordVariants} className="inline-block whitespace-nowrap">
                          «{word}
                        </motion.span>
                        {" "}
                      </React.Fragment>
                    );
                  }

                  if (isLast)
                  {
                    return (
                      <motion.span key={idx} variants={wordVariants} className="inline-block whitespace-nowrap">
                        {word}&nbsp;{renderAyahMarker(ayah.numberInSurah)}»
                      </motion.span>
                    );
                  }

                  return (
                    <React.Fragment key={idx}>
                      <motion.span variants={wordVariants} className="inline-block whitespace-nowrap">
                        {word}
                      </motion.span>
                      {" "}
                    </React.Fragment>
                  );
                })}
              </motion.div>

              {/* English translation and reference in high-contrast zinc */}
              {!isAr && (
                <div className="mt-1.5">
                  <div
                    style={{ textAlign: "center" }}
                    className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium text-center !text-center transition-colors mx-auto leading-relaxed"
                  >
                    “{cleanEnglishAyah(ayah.english)}” — [Surah {ayah.surahNameEn} ({ayah.surah}:{ayah.numberInSurah})]
                  </div>
                  <div
                    style={{ textAlign: "center" }}
                    className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 text-center !text-center mx-auto"
                  >
                    Sahih International
                  </div>
                </div>
              )}

              {/* 2. In Arabic mode: Arabic reference only, in high-contrast zinc */}
              {isAr && (
                <div
                  dir="rtl"
                  style={{ textAlign: "center" }}
                  className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-arabic font-medium mt-1.5 text-center !text-center transition-colors mx-auto"
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
