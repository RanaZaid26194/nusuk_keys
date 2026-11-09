"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HeartHandshake, BookOpen } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-900/60 p-6 sm:p-7 shadow-2xl z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg sm:text-xl font-bold text-white ${isAr ? "font-arabic" : ""}`}>
                  {t.hook.title}
                </h3>
              </div>
            </div>

            {/* Ayah Card */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-emerald-950 mb-3.5">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.hook.ayahRef}</span>
              </div>
              <p className="font-arabic text-xl sm:text-2xl text-emerald-200 leading-relaxed text-center py-1">
                {t.hook.ayahArabic}
              </p>
              {!isAr && (
                <p className="text-xs sm:text-sm text-slate-300 italic text-center mt-1">
                  {t.hook.ayahTranslation}
                </p>
              )}
            </div>

            {/* Hadith Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
                <span>{t.hook.hadithRef}</span>
              </div>
              <p className="font-arabic text-lg sm:text-xl text-slate-100 leading-relaxed text-center py-1">
                {t.hook.hadithArabic}
              </p>
              {!isAr && (
                <p className="text-xs sm:text-sm text-slate-300 italic text-center mt-1">
                  {t.hook.hadithTranslation}
                </p>
              )}
            </div>

            {/* Reward / Sadaqah Jariyah explanation */}
            <p className={`text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 ${isAr ? "font-arabic text-sm" : ""}`}>
              {t.hook.rewardMessage}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors"
              >
                {t.hook.close}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSubmit();
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-md"
              >
                {t.shareCodeBtn}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
