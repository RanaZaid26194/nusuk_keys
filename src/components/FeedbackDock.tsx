"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, ThumbsUp, ThumbsDown, Check, X } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { playHapticSound } from "@/lib/audio";

interface FeedbackDockProps {
  keyItem: { id: string; code: string } | null;
  lang: Language;
  onVote: (id: string, type: "UP" | "DOWN", code?: string) => void;
  onDismiss: () => void;
}

export const FeedbackDock: React.FC<FeedbackDockProps> = ({
  keyItem,
  lang,
  onVote,
  onDismiss,
}) => {
  const [votedType, setVotedType] = useState<"UP" | "DOWN" | null>(null);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAr = lang === "ar";
  const t = translations[lang].feedbackDock;

  // Reset state when keyItem changes
  useEffect(() => {
    setVotedType(null);

    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    if (keyItem) {
      // Auto-dismiss quietly after 22 seconds if ignored
      autoDismissTimerRef.current = setTimeout(() => {
        onDismiss();
      }, 22000);
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
    if (!keyItem || votedType) return;

    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    setVotedType(type);
    try {
      playHapticSound(type === "UP" ? "success" : "vote");
    } catch {
      // Audio fallback
    }

    onVote(keyItem.id, type, keyItem.code);

    // Give visual confirmation for 1.1s before sliding away
    setTimeout(() => {
      onDismiss();
    }, 1100);
  };

  return (
    <AnimatePresence>
      {keyItem && (
        <motion.aside
          key={`dock-${keyItem.id}`}
          initial={{ opacity: 0, y: 35, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.95 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          role="region"
          aria-label={t.didItWork}
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[calc(100vw-1.5rem)] sm:max-w-xl w-auto"
        >
          <div className="relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full backdrop-blur-xl bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border border-emerald-500/30 shadow-[0_12px_36px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
            {votedType ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-xs font-semibold text-emerald-400 px-2 py-0.5"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                </div>
                <span>{t.recorded}</span>
              </motion.div>
            ) : (
              <>
                {/* Code Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 font-mono text-xs font-bold tracking-wide shrink-0">
                  <Key className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[150px]">
                    {keyItem.code}
                  </span>
                </div>

                {/* Prompt Label */}
                <span className="text-xs font-medium text-slate-200 hidden xs:inline shrink-0">
                  {t.didItWork}
                </span>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAction("UP")}
                    aria-label={`${t.worked} (${keyItem.code})`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 border border-emerald-500/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 fill-emerald-400/20" />
                    <span>{t.worked}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction("DOWN")}
                    aria-label={`${t.failed} (${keyItem.code})`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-300 border border-rose-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5 fill-rose-400/20" />
                    <span>{t.failed}</span>
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
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
