"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, Mail, Copy, Check, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";
import { checkReportRateLimit, recordReportRateLimit } from "@/lib/security";

interface ReportModalProps {
  isOpen?: boolean;
  lang: Language;
  onClose?: () => void;
  initialKeyCode?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen: propIsOpen,
  lang,
  onClose,
  initialKeyCode = "",
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propIsOpen || internalIsOpen;

  const [keyCode, setKeyCode] = useState(initialKeyCode);
  const [reason, setReason] = useState<"expired" | "capacity" | "invalid" | "other">("expired");
  const [notes, setNotes] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const t = translations[lang];
  const isAr = lang === "ar";
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Listen to open-report-modal custom events (from footer or cards)
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ keyCode?: string }>;
      if (customEvent.detail?.keyCode) {
        setKeyCode(customEvent.detail.keyCode);
      }
      setInternalIsOpen(true);
    };

    window.addEventListener("open-report-modal", handleOpen);
    return () => window.removeEventListener("open-report-modal", handleOpen);
  }, []);

  const handleClose = () => {
    setInternalIsOpen(false);
    onClose?.();
  };

  // Sync rate limit cooldown
  useEffect(() => {
    const rateCheck = checkReportRateLimit();
    if (!rateCheck.allowed && rateCheck.waitSeconds) {
      setCooldown(rateCheck.waitSeconds);
    }
  }, [isOpen]);

  // Live countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus restoration & body scroll lock
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      setCopiedEmail(false);
      setCopiedReport(false);
    } else {
      document.body.style.overflow = "";
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Android back button closes modal
  const onCloseRef = useRef(handleClose);
  useEffect(() => {
    onCloseRef.current = handleClose;
  }, [handleClose]);

  useEffect(() => {
    if (!isOpen) return;

    try {
      window.history.pushState({ modalOpen: "report-modal" }, "");
    } catch {}

    const handlePopState = () => {
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.modalOpen === "report-modal") {
        try {
          window.history.back();
        } catch {}
      }
    };
  }, [isOpen]);

  // Keyboard navigation: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const supportEmail = "ranazaide288@gmail.com";

  const getReasonLabel = (key: "expired" | "capacity" | "invalid" | "other") => {
    return t.reportModal.reasons[key];
  };

  const mailtoBody = encodeURIComponent(
    `Assalamu Alaikum,\n\nI would like to report an issue with a Nusuk challenge key on the directory.\n\nKey Code: ${keyCode.trim() || "Not specified"}\nIssue: ${getReasonLabel(reason)}\nAdditional Details: ${notes.trim() || "None"}\n\nSent from Nusuk Keys Directory (https://keys-nusuk.vercel.app)`
  );
  const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(`Report Broken Nusuk Key: ${keyCode.trim() || "General"}`)}&body=${mailtoBody}`;

  const handleCopyEmail = async () => {
    try {
      playHapticSound("click");
      await navigator.clipboard.writeText(supportEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyFullReport = async () => {
    try {
      playHapticSound("click");
      const fullText = `Report Broken Nusuk Key\nTarget: ${supportEmail}\nKey Code: ${keyCode.trim() || "N/A"}\nIssue: ${getReasonLabel(reason)}\nDetails: ${notes.trim() || "None"}`;
      await navigator.clipboard.writeText(fullText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleMailtoClick = () => {
    playHapticSound("click");
    recordReportRateLimit();
    setCooldown(30);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto transition-opacity duration-150 ${
        isOpen
          ? "opacity-100 pointer-events-auto visible"
          : "opacity-0 pointer-events-none invisible"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/65 dark:bg-black/80 sm:backdrop-blur-sm"
      />

      {/* Dialog Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className={`relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain my-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-7 shadow-2xl z-10 transition-all duration-150 transform ${
          isOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-2 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label={t.reportModal.close}
          className={`absolute top-4 sm:top-5 ${isAr ? "left-4 sm:left-5" : "right-4 sm:right-5"} p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-20`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Flag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 id="report-modal-title" className={`text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug ${isAr ? "font-arabic" : ""}`}>
              {t.reportModal.title}
            </h2>
            <p className={`text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 ${isAr ? "font-arabic" : ""}`}>
              {t.reportModal.subtitle}
            </p>
          </div>
        </div>

        {/* Rate limit warning banner if cooldown is active */}
        {cooldown > 0 && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
            <Clock className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-500" />
            <span className={isAr ? "font-arabic" : ""}>
              {t.reportModal.cooldownWarning.replace("{s}", cooldown.toString())}
            </span>
          </div>
        )}

        {/* Key Code Input */}
        <div className="mb-4">
          <label htmlFor="report-key-input" className={`block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 ${isAr ? "font-arabic" : ""}`}>
            {t.reportModal.keyLabel}
          </label>
          <input
            id="report-key-input"
            type="text"
            value={keyCode}
            onChange={(e) => setKeyCode(e.target.value)}
            placeholder={t.reportModal.keyPlaceholder}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm font-mono placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            dir="ltr"
          />
        </div>

        {/* Issue Reason Chips */}
        <div className="mb-4">
          <label className={`block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 ${isAr ? "font-arabic" : ""}`}>
            {t.reportModal.reasonLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["expired", "capacity", "invalid", "other"] as const).map((r) => {
              const isSelected = reason === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    playHapticSound("click");
                    setReason(r);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-left transition-all border ${
                    isSelected
                      ? "bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-xs font-semibold"
                      : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  } ${isAr ? "font-arabic text-right justify-between" : ""}`}
                >
                  <span className="flex-1 truncate">{t.reportModal.reasons[r]}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Notes (Optional) */}
        <div className="mb-5">
          <label htmlFor="report-notes-input" className={`block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 ${isAr ? "font-arabic" : ""}`}>
            {t.reportModal.notesLabel}
          </label>
          <textarea
            id="report-notes-input"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.reportModal.notesPlaceholder}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all resize-none ${isAr ? "font-arabic" : ""}`}
          />
        </div>

        {/* Action Buttons: 100% Reliable on iOS & Web */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          {/* Action 1: Native Open Email Client */}
          <a
            href={mailtoUrl}
            onClick={handleMailtoClick}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-950/20 transition-all cursor-pointer select-none active:scale-[0.98]"
          >
            <Mail className="w-4 h-4 stroke-[2.2]" />
            <span className={isAr ? "font-arabic" : ""}>{t.reportModal.openMailBtn}</span>
          </a>

          {/* Action 2: Copy Support Email (Guaranteed solution if user uses Gmail/Webmail/iOS without Mail App) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 transition-all active:scale-[0.98]"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t.reportModal.emailCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span className={isAr ? "font-arabic" : ""}>{t.reportModal.copyEmailBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyFullReport}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 transition-all active:scale-[0.98]"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{isAr ? "تم نسخ التقرير!" : "Report Copied!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span className={isAr ? "font-arabic" : ""}>{isAr ? "نسخ نص التقرير" : "Copy Report Text"}</span>
                </>
              )}
            </button>
          </div>

          {/* Email address reminder */}
          <div className="text-center pt-1">
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              {supportEmail}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
