"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HeartHandshake, BookOpen, Quote } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";

interface InfoModalProps
{
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onOpenSubmit: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  lang,
  onClose,
  onOpenSubmit,
}) =>
{
  const t = translations[lang];
  const isAr = lang === "ar";
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() =>
  {
    if (isOpen)
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    else if (previousFocusRef.current)
    {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // lock page scroll while modal is open
  useEffect(() =>
  {
    if (!isOpen)
      return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () =>
    {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // trap keyboard focus and handle escape
  useEffect(() =>
  {
    if (!isOpen)
      return;

    const handleKeyDown = (e: KeyboardEvent) =>
    {
      if (e.key === "Escape")
      {
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current)
      {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0)
          return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey)
        {
          if (document.activeElement === first)
          {
            e.preventDefault();
            last.focus();
          }
        }
        else
        {
          if (document.activeElement === last)
          {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleActionSubmit = () =>
  {
    playHapticSound('click');
    onClose();
    onOpenSubmit();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-7 shadow-2xl z-10 transition-colors"
          >
            {/* Close Button - positioned on left in RTL, right in LTR to avoid header overlap */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={t.hook.close}
              className={`absolute top-4 sm:top-5 ${isAr ? "left-4 sm:left-5" : "right-4 sm:right-5"} p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-20`}
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 id="info-modal-title" className={`text-base sm:text-xl font-bold text-zinc-900 dark:text-white ${isAr ? "font-arabic text-lg sm:text-xl" : ""}`}>
                  {t.hook.title}
                </h3>
              </div>
            </div>

            {/* Quranic Ayah Card in Nastaliq Style with generous breathing room */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-zinc-950 border border-amber-500/25 mb-3.5 sm:mb-4 shadow-xs text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium mb-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.hook.ayahRef}</span>
              </div>
              <div
                dir="rtl"
                className="font-nastaliq text-xl sm:text-3xl text-amber-800 dark:text-amber-200 leading-[2.6] sm:leading-[3] text-center py-2 sm:py-3 px-1 sm:px-2 select-text overflow-visible"
              >
                «{t.hook.ayahArabic}»
              </div>
              {!isAr && (
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 italic text-center mt-2">
                  “And cooperate in righteousness and piety...” — [{t.hook.ayahRef}]
                </p>
              )}
            </div>

            {/* Authentic Hadith Card in Nastaliq Style with generous breathing room */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 mb-3.5 sm:mb-4 shadow-xs text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1.5">
                <Quote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.hook.hadithRef}</span>
              </div>
              <div
                dir="rtl"
                className="font-nastaliq text-lg sm:text-2xl text-zinc-800 dark:text-zinc-100 leading-[2.6] sm:leading-[2.9] text-center py-2 sm:py-3 px-1 sm:px-2 select-text overflow-visible"
              >
                «{t.hook.hadithArabic}»
              </div>
              {!isAr && (
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 italic text-center mt-2">
                  “Allah helps His servant as long as the servant is helping his brother.” — [{t.hook.hadithRef}]
                </p>
              )}
            </div>

            {/* Sadaqah Jariyah Motivation */}
            <p className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 sm:mb-6 text-center ${isAr ? "font-arabic text-sm" : ""}`}>
              {t.hook.rewardMessage}
            </p>

            {/* Action Buttons with Spring Feedback */}
            <div className="flex items-center justify-end gap-2.5">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-medium transition-colors"
              >
                {t.hook.close}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleActionSubmit}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              >
                {t.shareCodeBtn}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
