"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound, CheckCircle2, AlertCircle, Send, HeartHandshake, Clipboard } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { checkSubmissionRateLimit, recordSubmissionRateLimit } from "@/lib/security";
import { isValidKey, sanitizeKeyInput, getBodyCharCount, KEY_PREFIX, KEY_BODY_LENGTH, KEY_TOTAL_LENGTH } from "@/lib/keyFormat";
import { playHapticSound } from "@/lib/audio";
import { Tooltip } from "./Tooltip";

interface SubmitModalProps
{
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
}) =>
{
  const [code, setCode] = useState<string>(KEY_PREFIX);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0);

  const t = translations[lang];
  const isAr = lang === "ar";
  const bodyCount = getBodyCharCount(code);
  const isComplete = bodyCount === KEY_BODY_LENGTH && isValidKey(code);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Live rate limit countdown interval
  useEffect(() =>
  {
    if (rateLimitCountdown <= 0)
      return;

    const timer = setInterval(() =>
    {
      setRateLimitCountdown((prev) =>
      {
        if (prev <= 1)
        {
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitCountdown]);

  useEffect(() =>
  {
    if (isOpen)
    {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setCode(KEY_PREFIX);
      setErrorMessage(null);
      setIsSuccess(false);
    }
    else if (previousFocusRef.current)
    {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Android back button / browser history navigation closes modal
  useEffect(() =>
  {
    if (!isOpen)
      return;

    window.history.pushState({ modal: "submit" }, "");

    const handlePopState = () =>
    {
      onClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () =>
    {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.modal === "submit")
        window.history.back();
    };
  }, [isOpen, onClose]);

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
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  // sanitize user input, strip non-alphanumeric chars, preserve case, lock prefix
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    const sanitized = sanitizeKeyInput(e.target.value);
    setCode(sanitized);
    setErrorMessage(null);
  };

  // smart paste handler: parses URLs, WhatsApp forwards, or keys directly
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) =>
  {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    if (!pasted)
      return;
    const sanitized = sanitizeKeyInput(pasted);
    setCode(sanitized);
    setErrorMessage(null);
  };

  const handleClipboardPaste = async () =>
  {
    try
    {
      if (typeof navigator !== "undefined" && navigator.clipboard?.readText)
      {
        const text = await navigator.clipboard.readText();
        if (text)
        {
          const sanitized = sanitizeKeyInput(text);
          setCode(sanitized);
          setErrorMessage(null);
          playHapticSound('click');
        }
      }
    }
    catch
    {
      // browser permission fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) =>
  {
    e.preventDefault();
    if (submitting)
      return;

    // 1. check rate limit
    const rateCheck = checkSubmissionRateLimit();
    if (!rateCheck.allowed)
    {
      const waitSec = rateCheck.waitSeconds ?? 30;
      setRateLimitCountdown(waitSec);
      setErrorMessage(
        isAr
          ? `يرجى الانتظار ${waitSec} ثانية قبل مشاركة رمز آخر لمنع التكرار.`
          : `Please wait ${waitSec}s before submitting another key (anti-spam protection).`
      );
      return;
    }

    // 2. strict format validation
    if (!isValidKey(code))
    {
      setErrorMessage(t.modal.errorFormat);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try
    {
      const res = await onSubmit(code);

      if (res.success)
      {
        recordSubmissionRateLimit();
        setIsSuccess(true);
        playHapticSound('click');
        setTimeout(() =>
        {
          onClose();
        }, 1800);
      }
      else
        setErrorMessage(res.error || t.modal.errorGeneric);
    }
    catch (err: any)
    {
      setErrorMessage(err?.message || t.modal.errorGeneric);
    }
    finally
    {
      setSubmitting(false);
    }
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

          {/* Dialog Container */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain my-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-7 shadow-2xl z-10 transition-colors"
          >
            {/* Close Button - positioned on left in RTL, right in LTR to avoid header overlap */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={t.hook.close}
              className={`absolute top-4 sm:top-5 ${isAr ? "left-4 sm:left-5" : "right-4 sm:right-5"} p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-20`}
            >
              <X className="w-4 h-4" />
            </motion.button>

            {isSuccess ? (
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-xs"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-7 h-7"
                    stroke="currentColor"
                    strokeWidth={2.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M4.5 12.75l6 6 9-13.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                    />
                  </svg>
                </motion.div>
                <h3 id="submit-modal-title" className={`text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-1.5 ${isAr ? "font-arabic" : ""}`}>
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
                    <h3 id="submit-modal-title" className={`text-base sm:text-lg font-bold text-zinc-900 dark:text-white ${isAr ? "font-arabic" : ""}`}>
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

                {/* Input Field with live counter and Paste button */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="submit-key-input" className={`block text-xs font-medium text-zinc-700 dark:text-zinc-300 ${isAr ? "font-arabic" : ""}`}>
                      {t.modal.inputLabel}
                    </label>
                    <div className="flex items-center gap-2">
                      <Tooltip
                        content={isAr ? "لصق الرمز من الحافظة" : "Paste code from clipboard"}
                        position="top"
                        dotColor="emerald"
                      >
                        <motion.button
                          type="button"
                          onClick={handleClipboardPaste}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-700/60 shadow-xs transition-colors"
                          aria-label={t.modal.paste || "Paste"}
                        >
                          <Clipboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className={isAr ? "font-arabic" : ""}>{t.modal.paste || "Paste"}</span>
                        </motion.button>
                      </Tooltip>
                      <span className={`text-[11px] font-mono font-medium transition-colors ${bodyCount === KEY_BODY_LENGTH ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-400 dark:text-zinc-500"}`}>
                        {bodyCount}/{KEY_BODY_LENGTH}
                      </span>
                    </div>
                  </div>
                  <input
                    id="submit-key-input"
                    type="text"
                    inputMode="text"
                    enterKeyHint="send"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="off"
                    dir="ltr"
                    value={code}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    placeholder={t.modal.placeholder}
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

                {/* Error Banner with Shake Animation and live countdown */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, x: -6 }}
                    animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
                    transition={{ duration: 0.35 }}
                    className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-600/40 text-rose-700 dark:text-rose-200 text-xs shadow-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
                    <span className="leading-relaxed font-medium">
                      {rateLimitCountdown > 0 ? (
                        isAr
                          ? `يرجى الانتظار ${rateLimitCountdown} ثانية قبل مشاركة رمز آخر لمنع التكرار.`
                          : `Please wait ${rateLimitCountdown}s before submitting another key (anti-spam protection).`
                      ) : (
                        errorMessage
                      )}
                    </span>
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
                    disabled={submitting || !isComplete}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
