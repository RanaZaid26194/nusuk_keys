"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, ThumbsUp, ThumbsDown, RotateCcw, Check, X } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";

interface FeedbackDockProps {
  keyItem: { id: string; code: string } | null;
  lang: Language;
  onVote: (id: string, type: "UP" | "DOWN", code?: string) => void;
  onMarkUnused: (code: string) => void;
  onDismiss: () => void;
}

export const FeedbackDock: React.FC<FeedbackDockProps> = ({
  keyItem,
  lang,
  onVote,
  onMarkUnused,
  onDismiss,
}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAr = lang === "ar";
  const t = translations[lang].feedbackDock;

  // Reset state when keyItem changes
  useEffect(() => {
    setStatusMessage(null);

    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    if (keyItem) {
      // Auto-dismiss quietly after 24 seconds if ignored
      autoDismissTimerRef.current = setTimeout(() => {
        onDismiss();
      }, 24000);
    }

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, [keyItem, onDismiss]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && keyItem) {
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyItem, onDismiss]);

  const handleAction = (type: "UP" | "DOWN") => {
    if (!keyItem || statusMessage) return;

    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    setStatusMessage(t.recorded);
    try {
      playHapticSound(type === "UP" ? "success" : "vote");
    } catch {
      // Audio fallback
    }

    onVote(keyItem.id, type, keyItem.code);

    // Give visual confirmation for 1s before sliding away
    setTimeout(() => {
      onDismiss();
    }, 1000);
  };

  const handleMarkUnused = () => {
    if (!keyItem || statusMessage) return;

    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    setStatusMessage(t.unmarkedUnused || (isAr ? "أعيد كغير مستخدم" : "Marked as unused"));
    try {
      playHapticSound("click");
    } catch {
      // Audio fallback
    }

    onMarkUnused(keyItem.code);

    // Give visual confirmation for 1s before sliding away
    setTimeout(() => {
      onDismiss();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {keyItem && (
        <motion.div
          key={`dock-wrapper-${keyItem.id}`}
          initial={{ opacity: 0, y: 35, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.95 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-6 sm:bottom-8 z-[9999] flex justify-center pointer-events-none px-3"
          style={{
            paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
          }}
        >
          <aside
            role="region"
            aria-label={t.didItWork}
            className="pointer-events-auto max-w-[calc(100vw-1rem)] sm:max-w-2xl w-auto shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
          >
            <div className="relative flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full backdrop-blur-xl bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border border-emerald-500/35 ring-1 ring-white/10">
              {statusMessage ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 px-2 py-0.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  </div>
                  <span>{statusMessage}</span>
                </div>
              ) : (
                <>
                  {/* Code Pill */}
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-mono text-[11px] sm:text-xs font-bold tracking-wide shrink-0">
                    <Key className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-[85px] sm:max-w-[140px]">
                      {keyItem.code}
                    </span>
                  </div>

                  {/* Prompt Label (Visible on md+ screens, kept compact on narrow mobile) */}
                  <span className="text-xs font-medium text-slate-200 hidden md:inline shrink-0">
                    {t.didItWork}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {/* Worked Button */}
                    <button
                      type="button"
                      onClick={() => handleAction("UP")}
                      aria-label={`${t.worked} (${keyItem.code})`}
                      className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 border border-emerald-500/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 fill-emerald-400/20 shrink-0" />
                      <span>{t.worked}</span>
                    </button>

                    {/* Didn't Work Button */}
                    <button
                      type="button"
                      onClick={() => handleAction("DOWN")}
                      aria-label={`${t.failed} (${keyItem.code})`}
                      className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-300 border border-rose-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
                    >
                      <ThumbsDown className="w-3.5 h-3.5 fill-rose-400/20 shrink-0" />
                      <span>{t.failed}</span>
                    </button>

                    {/* Mark As Unused Button */}
                    <button
                      type="button"
                      onClick={handleMarkUnused}
                      aria-label={`${t.didntUse} (${keyItem.code})`}
                      title={t.didntUse}
                      className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 text-zinc-300 border border-zinc-700/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span>{t.didntUse}</span>
                    </button>
                  </div>

                  {/* Dismiss X */}
                  <button
                    type="button"
                    onClick={onDismiss}
                    aria-label={t.dismiss}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
