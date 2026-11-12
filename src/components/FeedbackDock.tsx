"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
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
  const [swipeDismiss, setSwipeDismiss] = useState<"left" | "right" | null>(null);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAr = lang === "ar";
  const t = translations[lang].feedbackDock;

  // Reset state when keyItem changes
  useEffect(() => {
    setStatusMessage(null);
    setSwipeDismiss(null);

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

  // Handle escape key on desktop only (avoid Android Back button dispatching Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && keyItem && typeof window !== "undefined" && window.innerWidth >= 640) {
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyItem, onDismiss]);

  const handleAction = (type: "UP" | "DOWN") => {
    if (!keyItem || statusMessage || swipeDismiss) return;

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

    setTimeout(() => {
      onDismiss();
    }, 950);
  };

  const handleMarkUnused = () => {
    if (!keyItem || statusMessage || swipeDismiss) return;

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

    setTimeout(() => {
      onDismiss();
    }, 950);
  };

  // Swipe to dismiss left or right with spring physics
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeDistance = info.offset.x;
    const swipeVelocity = info.velocity.x;
    const distanceThreshold = 65; // 65px swipe
    const velocityThreshold = 280; // or fast flick

    if (swipeDistance > distanceThreshold || swipeVelocity > velocityThreshold) {
      setSwipeDismiss("right");
      try {
        playHapticSound("click");
      } catch {}
      setTimeout(() => {
        onDismiss();
      }, 190);
    } else if (swipeDistance < -distanceThreshold || swipeVelocity < -velocityThreshold) {
      setSwipeDismiss("left");
      try {
        playHapticSound("click");
      } catch {}
      setTimeout(() => {
        onDismiss();
      }, 190);
    }
  };

  return (
    <AnimatePresence>
      {keyItem && (
        <div
          className="fixed inset-x-0 bottom-20 sm:bottom-8 z-[9999] flex justify-center pointer-events-none px-2 sm:px-4"
          style={{
            paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          }}
        >
          <motion.aside
            key={`dock-${keyItem.id}`}
            role="region"
            aria-label={t.didItWork}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.65}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={
              swipeDismiss === "right"
                ? { x: 320, opacity: 0, scale: 0.88, transition: { duration: 0.22, ease: "easeOut" } }
                : swipeDismiss === "left"
                ? { x: -320, opacity: 0, scale: 0.88, transition: { duration: 0.22, ease: "easeOut" } }
                : { x: 0, y: 0, opacity: 1, scale: 1, transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] } }
            }
            exit={{ opacity: 0, y: 20, scale: 0.94, transition: { duration: 0.2 } }}
            className="pointer-events-auto select-none touch-pan-y max-w-[calc(100vw-0.75rem)] sm:max-w-2xl w-auto rounded-full backdrop-blur-xl bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border border-emerald-500/35 ring-1 ring-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.55)] cursor-grab active:cursor-grabbing"
          >
            <div className="relative flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-full">
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
                  <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-mono text-[10.5px] sm:text-xs font-bold tracking-wide shrink-0">
                    <Key className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate max-w-[70px] sm:max-w-[130px]">
                      {keyItem.code}
                    </span>
                  </div>

                  {/* Prompt Label (Visible on md+ screens, hidden on mobile to conserve space) */}
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
                      className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10.5px] sm:text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-300 border border-emerald-500/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3 fill-emerald-400/20 shrink-0" />
                      <span>{t.worked}</span>
                    </button>

                    {/* Didn't Work Button */}
                    <button
                      type="button"
                      onClick={() => handleAction("DOWN")}
                      aria-label={`${t.failed} (${keyItem.code})`}
                      className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10.5px] sm:text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-300 border border-rose-500/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
                    >
                      <ThumbsDown className="w-3 h-3 fill-rose-400/20 shrink-0" />
                      <span className="sm:hidden">{t.failedShort}</span>
                      <span className="hidden sm:inline">{t.failed}</span>
                    </button>

                    {/* Mark As Unused Button */}
                    <button
                      type="button"
                      onClick={handleMarkUnused}
                      aria-label={`${t.didntUse} (${keyItem.code})`}
                      title={t.didntUse}
                      className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-full text-[10.5px] sm:text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 text-zinc-300 border border-zinc-700/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="sm:hidden">{t.unusedShort}</span>
                      <span className="hidden sm:inline">{t.didntUse}</span>
                    </button>
                  </div>

                  {/* Dismiss X */}
                  <button
                    type="button"
                    onClick={onDismiss}
                    aria-label={t.dismiss}
                    title={t.swipeHint}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
