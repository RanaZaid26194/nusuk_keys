"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Clock, ShieldCheck, TrendingUp } from "lucide-react";
import {
  EXPIRED_DOWNVOTE_MARGIN,
  LIKELY_MAX_DOWNVOTE_RATIO,
  LIKELY_MIN_COPIES,
  VERIFIED_MIN_RATE,
  VERIFIED_MIN_UPVOTES,
  type KeyStatus,
} from "@/lib/keyStatus";
import { translations } from "@/lib/translations";
import type { Language } from "@/lib/types";
import { Tooltip } from "./Tooltip";

interface StatusBadgeProps
{
  status: KeyStatus;
  lang: Language;
  compact?: boolean;
}

interface BadgeStyleSpec
{
  Icon: typeof ShieldCheck;
  pillClasses: string;
  iconClasses: string;
  tooltipIconClasses: string;
  ringClasses: string;
}

const BADGE_SPECS: Record<KeyStatus, BadgeStyleSpec> = {
  verified: {
    Icon: ShieldCheck,
    pillClasses:
      "font-semibold bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600/80 dark:bg-emerald-800/85 dark:hover:bg-emerald-800 dark:text-emerald-50 dark:border-emerald-400/50 ring-1 ring-gold-accent/60 dark:ring-gold-400/45 shadow-[0_1px_10px_rgba(4,120,87,0.22)] dark:shadow-[0_0_12px_rgba(16,185,129,0.22)]",
    iconClasses: "text-gold-100 dark:text-gold-300",
    tooltipIconClasses: "text-emerald-400",
    ringClasses: "focus-visible:ring-emerald-500",
  },
  likely: {
    Icon: TrendingUp,
    pillClasses:
      "font-medium bg-sky-500/15 hover:bg-sky-500/20 text-sky-800 border-sky-600/30 hover:border-sky-600/50 dark:bg-sky-500/15 dark:hover:bg-sky-500/25 dark:text-sky-200 dark:border-sky-400/35 dark:hover:border-sky-400/55",
    iconClasses: "text-sky-700 dark:text-sky-300",
    tooltipIconClasses: "text-sky-400",
    ringClasses: "focus-visible:ring-sky-500",
  },
  needs: {
    Icon: Clock,
    pillClasses:
      "font-medium bg-zinc-100/85 hover:bg-zinc-200/75 text-zinc-700 border-zinc-300/85 hover:border-zinc-400/80 dark:bg-zinc-800/60 dark:hover:bg-zinc-800/90 dark:text-zinc-300 dark:border-zinc-700/75 dark:hover:border-zinc-600",
    iconClasses: "text-amber-700 dark:text-amber-400",
    tooltipIconClasses: "text-amber-400",
    ringClasses: "focus-visible:ring-amber-500",
  },
  expired: {
    Icon: AlertTriangle,
    pillClasses:
      "font-normal bg-rose-50/75 hover:bg-rose-100/80 text-rose-800 border-dashed border-rose-300/90 hover:border-rose-400 dark:bg-rose-950/45 dark:hover:bg-rose-950/65 dark:text-rose-300 dark:border-rose-500/35 dark:hover:border-rose-400/50",
    iconClasses: "text-rose-700 dark:text-rose-400",
    tooltipIconClasses: "text-rose-400",
    ringClasses: "focus-visible:ring-rose-500",
  },
};

function getBadgeLabel(status: KeyStatus, lang: Language, compact: boolean): string
{
  const tk = translations[lang].keyCard;
  if (status === "verified")
    return compact ? tk.verifiedShort : tk.verified;

  if (status === "likely")
    return compact ? tk.likelyShort : tk.likely;

  if (status === "expired")
    return compact ? tk.expiredShort : tk.expired;

  return compact ? tk.needsReviewShort : tk.needsReview;
}

function getBadgeTooltip(status: KeyStatus, lang: Language): string
{
  const tk = translations[lang].keyCard;
  if (status === "verified")
    return tk.verifiedTooltip
      .replace("{upvotes}", String(VERIFIED_MIN_UPVOTES))
      .replace("{rate}", String(VERIFIED_MIN_RATE));

  if (status === "likely")
  {
    if (LIKELY_MAX_DOWNVOTE_RATIO <= 0)
      return tk.likelyTooltip.replace("{n}", String(LIKELY_MIN_COPIES));

    return tk.likelyTooltipRatio
      .replace("{n}", String(LIKELY_MIN_COPIES))
      .replace("{pct}", String(Math.round(LIKELY_MAX_DOWNVOTE_RATIO * 100)));
  }

  if (status === "expired")
    return tk.expiredTooltip.replace("{margin}", String(EXPIRED_DOWNVOTE_MARGIN));

  return tk.needsTooltip
    .replace("{upvotes}", String(VERIFIED_MIN_UPVOTES))
    .replace("{rate}", String(VERIFIED_MIN_RATE))
    .replace("{copies}", String(LIKELY_MIN_COPIES));
}

function useReducedMotionPref(): boolean
{
  const fmReduced = useReducedMotion();
  const [mqReduced, setMqReduced] = useState(false);

  useEffect(() =>
  {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function")
      return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMqReduced(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => setMqReduced(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return Boolean(fmReduced || mqReduced);
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, lang, compact = false }) =>
{
  const shouldReduceMotion = useReducedMotionPref();
  const [shineComplete, setShineComplete] = useState(false);

  const isAr = lang === "ar";
  const spec = BADGE_SPECS[status];
  const { Icon } = spec;
  const label = getBadgeLabel(status, lang, compact);
  const tooltipText = getBadgeTooltip(status, lang);

  return (
    <Tooltip
      content={tooltipText}
      position="bottom"
      align="start"
      toggleOnTap
      wrap
      icon={<Icon className={`w-3.5 h-3.5 ${spec.tooltipIconClasses}`} />}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.button
          key={status}
          type="button"
          data-status-badge={status}
          aria-label={`${label}: ${tooltipText}`}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.13, ease: "easeOut" }}
          className={`relative inline-flex items-center gap-1.5 h-6 ps-2 pe-2.5 rounded-full border text-xs whitespace-nowrap select-none cursor-help transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 ${spec.pillClasses} ${spec.ringClasses}`}
        >
          {/* One-shot metallic glint inside its own clipped box so button scrollWidth stays exact */}
          {status === "verified" && !shouldReduceMotion && !shineComplete && (
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full motion-reduce:hidden" aria-hidden="true">
              <motion.span
                initial={{ x: isAr ? "140%" : "-140%", opacity: 0.75 }}
                animate={{ x: isAr ? "-240%" : "240%", opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                onAnimationComplete={() => setShineComplete(true)}
                className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              />
            </span>
          )}

          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${spec.iconClasses}`} aria-hidden="true" />
          <span className={isAr ? "font-arabic leading-[1.35]" : "leading-none"}>{label}</span>
        </motion.button>
      </AnimatePresence>
    </Tooltip>
  );
};
