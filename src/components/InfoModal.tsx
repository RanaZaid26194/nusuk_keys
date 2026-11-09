"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HeartHandshake, BookOpen, Quote } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";

interface InfoModalProps {
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
}) => {
  const t = translations[lang];
  const isAr = lang === "ar";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleActionSubmit = () => {
    playHapticSound('click');
    onClose();
    onOpenSubmit();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-7 shadow-2xl z-10"
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-400 flex items-center justify-center shadow-sm">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg sm:text-xl font-bold text-white ${isAr ? "font-arabic" : ""}`}>
                  {t.hook.title}
                </h3>
              </div>
            </div>

            {/* Quranic Ayah Card in Nastaliq Style */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/25 mb-4 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isAr ? "آية قرآنية كريمة" : "Quranic Ayah"} — {t.hook.ayahRef}</span>
              </div>
              <p
                dir="rtl"
                className="font-nastaliq text-2xl sm:text-3xl text-amber-200 leading-[2.3] sm:leading-[2.4] text-center py-1 select-text"
              >
                «{t.hook.ayahArabic}»
              </p>
              {!isAr && (
                <p className="text-xs sm:text-sm text-zinc-300 italic text-center mt-1">
                  “And cooperate in righteousness and piety...” — [Surah Al-Ma&apos;idah 5:2]
                </p>
              )}
            </div>

            {/* Authentic Hadith Card in Nastaliq Style */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 mb-4 shadow-inner">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-1">
                <Quote className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAr ? "حديث نبوي شريف" : "Authentic Hadith"} — {t.hook.hadithRef}</span>
              </div>
              <p
                dir="rtl"
                className="font-nastaliq text-xl sm:text-2xl text-zinc-100 leading-[2.2] sm:leading-[2.3] text-center py-1 select-text"
              >
                «{t.hook.hadithArabic}»
              </p>
              {!isAr && (
                <p className="text-xs sm:text-sm text-zinc-300 italic text-center mt-1">
                  “Allah helps His servant as long as the servant is helping his brother.” — [Sahih Muslim 2699]
                </p>
              )}
            </div>

            {/* Sadaqah Jariyah Motivation */}
            <p className={`text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 ${isAr ? "font-arabic text-sm" : ""}`}>
              {t.hook.rewardMessage}
            </p>

            {/* Action Buttons with Spring Feedback */}
            <div className="flex items-center justify-end gap-2.5">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs sm:text-sm font-medium transition-colors"
              >
                {t.hook.close}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleActionSubmit}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
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
