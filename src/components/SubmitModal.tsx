"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound, CheckCircle2, AlertCircle, Send, HeartHandshake } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { sanitizeAndValidateCode, checkSubmissionRateLimit, recordSubmissionRateLimit } from "@/lib/security";
import { playHapticSound } from "@/lib/audio";

interface SubmitModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onSubmit: (code: string) => Promise<{ success: boolean; error?: string }>;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  lang,
  onClose,
  onSubmit,
}) => {
  const [code, setCode] = useState("NG-");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = translations[lang];
  const isAr = lang === "ar";

  useEffect(() => {
    if (isOpen) {
      setCode("NG-");
      setErrorMessage(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith("NG-")) {
      val = "NG-" + val.replace(/^NG-?/i, "");
    }
    // Prevent invalid characters right as user types
    val = val.replace(/[^A-Z0-9_-]/g, "");
    setCode(val);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check Rate Limit
    const rateCheck = checkSubmissionRateLimit();
    if (!rateCheck.allowed) {
      setErrorMessage(
        isAr
          ? `يرجى الانتظار ${rateCheck.waitSeconds} ثانية قبل مشاركة رمز آخر لمنع التكرار.`
          : `Please wait ${rateCheck.waitSeconds}s before submitting another key (anti-spam protection).`
      );
      return;
    }

    // 2. Strict Input Sanitization & Format Validation
    const validation = sanitizeAndValidateCode(code);
    if (!validation.isValid || !validation.sanitizedCode) {
      setErrorMessage(validation.errorMessage || t.modal.errorGeneric);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const res = await onSubmit(validation.sanitizedCode);
    setSubmitting(false);

    if (res.success) {
      recordSubmissionRateLimit();
      setIsSuccess(true);
      playHapticSound('click');
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setErrorMessage(res.error || t.modal.errorGeneric);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-2xl z-10 transition-colors"
          >
            {/* Close Button - positioned on left in RTL, right in LTR to avoid header overlap */}
            <button
              onClick={onClose}
              aria-label={t.hook.close}
              className={`absolute top-5 ${isAr ? "left-5" : "right-5"} p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-20`}
            >
              <X className="w-4 h-4" />
            </button>

            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-1.5 ${isAr ? "font-arabic" : ""}`}>
                  {t.modal.successTitle}
                </h3>
                <p className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-xs mx-auto ${isAr ? "font-arabic" : ""}`}>
                  {t.modal.successDesc}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg font-bold text-zinc-900 dark:text-white ${isAr ? "font-arabic" : ""}`}>
                      {t.modal.title}
                    </h3>
                    <p className={`text-xs text-zinc-500 dark:text-zinc-400 ${isAr ? "font-arabic" : ""}`}>
                      {t.modal.subtitle}
                    </p>
                  </div>
                </div>

                {/* Noble Spiritual Hook Reminder Card - Centered Symmetric Layout */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-zinc-950 border border-amber-500/25 mb-4 flex flex-col items-center justify-center text-center shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="w-full text-center overflow-visible">
                    <div dir="rtl" className="font-nastaliq font-bold text-amber-800 dark:text-amber-200 block text-base sm:text-lg leading-[2.8] py-1.5 px-1 text-center overflow-visible">
                      «{t.hook.hadithArabic}»
                    </div>
                    <span className={`text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 block text-center mt-1.5 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
                      {t.hook.rewardMessage}
                    </span>
                  </div>
                </div>

                {/* Input Field (always LTR for alphanumeric code entry) */}
                <div className="mb-4">
                  <label className={`block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 ${isAr ? "font-arabic" : ""}`}>
                    {t.modal.inputLabel}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={code}
                    onChange={handleInputChange}
                    placeholder={t.modal.placeholder}
                    maxLength={24}
                    autoFocus
                    className={`w-full px-3.5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-base font-bold tracking-widest text-left focus:outline-none shadow-xs transition-colors ${
                      errorMessage
                        ? "border-2 border-rose-500 text-rose-600 dark:text-rose-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                        : "border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700"
                    }`}
                  />
                </div>

                {/* Live Preview Card */}
                {code.length > 3 && (
                  <div className="mb-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80">
                    <div className="text-[11px] text-zinc-500 mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t.modal.preview}</span>
                    </div>
                    <div dir="ltr" className="font-mono text-sm font-semibold tracking-wider text-zinc-800 dark:text-zinc-200 text-left">
                      {code}
                    </div>
                  </div>
                )}

                {/* Error Banner with Shake Animation */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, x: -6 }}
                    animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
                    transition={{ duration: 0.35 }}
                    className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-600/40 text-rose-700 dark:text-rose-200 text-xs shadow-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
                    <span className="leading-relaxed font-medium">{errorMessage}</span>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-medium transition-colors"
                  >
                    {t.modal.cancel}
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? t.modal.submitting : t.modal.submit}</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
