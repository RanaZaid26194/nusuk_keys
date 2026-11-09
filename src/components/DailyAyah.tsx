"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

export const DailyAyah: React.FC<DailyAyahProps> = ({ lang, onOpenInfo }) =>
{
  const [ayah, setAyah] = useState<DailyAyahData | null>(null);
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
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="mt-6 flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-amber-500/25 hover:border-amber-500/40 cursor-pointer transition-all max-w-xl mx-auto shadow-sm group text-center min-h-[148px]"
    >
      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mb-1.5">
        <HeartHandshake className="w-4 h-4 text-amber-400" />
      </div>

      <div className="text-center w-full overflow-visible">
        {ayah && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* Arabic ayah: Amiri font, leading-[2.2] to avoid diacritic clipping */}
            <div
              dir="rtl"
              className="font-arabic font-normal text-amber-200 text-base sm:text-lg leading-[2.2] py-1 px-2 text-center group-hover:text-amber-100 transition-colors overflow-visible select-text"
            >
              «{ayah.arabic}»
            </div>

            {/* In English mode: translation, reference, and Sahih International credit */}
            {!isAr && (
              <>
                <div className="text-[11px] sm:text-xs text-zinc-400 mt-1 text-center">
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
      </div>
    </motion.div>
  );
};
