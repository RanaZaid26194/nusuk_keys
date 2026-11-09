"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound, CheckCircle2, AlertCircle, Send } from "lucide-react";
import confetti from "canvas-confetti";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { validateNusukCode } from "@/lib/utils";

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

  // Handle ESC key
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
    setCode(val);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNusukCode(code);
    if (!validation.isValid) {
      setErrorMessage(validation.errorKey ? t.modal[validation.errorKey] : t.modal.errorGeneric);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const res = await onSubmit(code.trim());
    setSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#d4af37", "#6ee7b7", "#fef08a"],
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setErrorMessage(res.error || t.modal.errorGeneric);
    }
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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-emerald-500/30 shadow-2xl shadow-emerald-950/60 z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {isSuccess ? (
              /* Success View */
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h3 className={`text-xl sm:text-2xl font-bold text-white mb-2 ${isAr ? "font-arabic" : ""}`}>
                  {t.modal.successTitle}
                </h3>
                <p className={`text-sm text-slate-300 max-w-xs mx-auto ${isAr ? "font-arabic" : ""}`}>
                  {t.modal.successDesc}
                </p>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold text-white ${isAr ? "font-arabic" : ""}`}>
                      {t.modal.title}
                    </h3>
                    <p className={`text-xs text-slate-400 ${isAr ? "font-arabic" : ""}`}>
                      {t.modal.subtitle}
                    </p>
                  </div>
                </div>

                {/* Input Field */}
                <div className="mt-6 mb-4">
                  <label className={`block text-xs font-semibold text-slate-300 mb-2 ${isAr ? "font-arabic" : ""}`}>
                    {t.modal.inputLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={handleInputChange}
                      placeholder={t.modal.placeholder}
                      maxLength={24}
                      autoFocus
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/90 border border-emerald-600/40 font-mono text-lg font-bold text-emerald-200 tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 shadow-inner"
                    />
                  </div>
                </div>

                {/* Live Preview Card */}
                {code.length > 3 && (
                  <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{t.modal.preview}</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-emerald-300 tracking-wide">
                      {code}
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium transition-colors"
                  >
                    {t.modal.cancel}
                  </button>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? t.modal.submitting : t.modal.submit}</span>
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
