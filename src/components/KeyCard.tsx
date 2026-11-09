"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ExternalLink, ThumbsUp, ThumbsDown, Clock, ShieldCheck, AlertCircle, RotateCcw } from "lucide-react";
import { ChallengeKey, Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { calculateSuccessRate, formatTimeAgo, getNusukDeepLink } from "@/lib/utils";
import { playHapticSound } from "@/lib/audio";
import { copyToClipboard } from "@/lib/clipboard";
import { useCanHover } from "@/lib/useCanHover";

interface KeyCardProps
{
  item: ChallengeKey;
  lang: Language;
  searchQuery?: string;
  isUsed?: boolean;
  onVote: (id: string, type: 'UP' | 'DOWN') => void;
  onCopy: (id: string) => void;
  onOpenNusuk?: (code: string) => void;
  onToggleUsed?: (code: string) => void;
}

const KeyCardComponent: React.FC<KeyCardProps> = ({
  item,
  lang,
  searchQuery = "",
  isUsed = false,
  onVote,
  onCopy,
  onOpenNusuk,
  onToggleUsed,
}) =>
{
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [openingNusuk, setOpeningNusuk] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();

  const t = translations[lang];
  const isAr = lang === "ar";

  const successRate = calculateSuccessRate(item.upvotes, item.downvotes);
  const isVerified = successRate >= 75 && item.upvotes >= 2;
  const isExpired = item.downvotes > item.upvotes + 3;

  // Live relative time updating every minute
  const [timeAgo, setTimeAgo] = useState<string>(() => formatTimeAgo(item.created_at, lang));

  useEffect(() =>
  {
    setTimeAgo(formatTimeAgo(item.created_at, lang));
    const timer = setInterval(() =>
    {
      setTimeAgo(formatTimeAgo(item.created_at, lang));
    }, 60000);
    return () => clearInterval(timer);
  }, [item.created_at, lang]);

  // Exact timestamp for hover inspection (YYYY-MM-DD HH:MM:SS)
  const exactTimestamp = useMemo(() =>
  {
    if (!item.created_at)
      return "";
    try
    {
      const d = new Date(item.created_at);
      if (isNaN(d.getTime()))
        return item.created_at;
      const pad = (n: number) => n.toString().padStart(2, "0");
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const h = pad(d.getHours());
      const min = pad(d.getMinutes());
      const s = pad(d.getSeconds());
      return `${y}-${m}-${day} ${h}:${min}:${s}`;
    }
    catch
    {
      return item.created_at;
    }
  }, [item.created_at]);

  // zero-react-rerender spotlight tracking and subtle 3D tilt (max 2deg)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) =>
  {
    if (!cardRef.current || !spotlightRef.current)
      return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.opacity = "1";
    spotlightRef.current.style.background = `radial-gradient(350px circle at ${x}px ${y}px, var(--spotlight-glow, rgba(16, 185, 129, 0.08)), transparent 80%)`;

    // subtle 3D tilt (max 2 degrees, desktop only)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = Math.max(-2, Math.min(2, ((y - centerY) / centerY) * -2));
    const rotateY = Math.max(-2, Math.min(2, ((x - centerX) / centerX) * 2));
    cardRef.current.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  };

  const handleMouseLeave = () =>
  {
    if (spotlightRef.current)
      spotlightRef.current.style.opacity = "0";
    if (cardRef.current)
      cardRef.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  const handleCopy = async (e: React.MouseEvent) =>
  {
    e.stopPropagation();
    const success = await copyToClipboard(item.code);
    if (success)
    {
      setCopied(true);
      setCopyFailed(false);
      onCopy(item.id);
      playHapticSound('success');

      setTimeout(() =>
      {
        setCopied(false);
      }, 2000);
    }
    else
    {
      setCopyFailed(true);
      playHapticSound('click');

      setTimeout(() =>
      {
        setCopyFailed(false);
      }, 3500);
    }
  };

  const handleVoteClick = (type: 'UP' | 'DOWN') =>
  {
    if (item.userVoted === type)
      return;
    playHapticSound('vote');
    onVote(item.id, type);
  };

  // Highlight search term in code cleanly
  const renderHighlightedCode = () =>
  {
    const code = item.code;
    const query = searchQuery.trim().toUpperCase();

    if (!query || !code.includes(query))
      return <span>{code}</span>;

    const index = code.indexOf(query);
    const before = code.slice(0, index);
    const match = code.slice(index, index + query.length);
    const after = code.slice(index + query.length);

    return (
      <span>
        {before}
        <motion.span
          initial={{ backgroundColor: "rgba(251, 191, 36, 0)" }}
          animate={{ backgroundColor: "rgba(251, 191, 36, 0.3)" }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded font-black inline-block"
        >
          {match}
        </motion.span>
        {after}
      </span>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={canHover ? handleMouseMove : undefined}
      onMouseLeave={canHover ? handleMouseLeave : undefined}
      whileHover={canHover ? { y: -4, scale: 1.008 } : undefined}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className={`relative rounded-2xl bg-white dark:bg-zinc-900/70 p-4 sm:p-5 border transition-all duration-150 overflow-hidden shadow-xs hover:shadow-md dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_8px_24px_-4px_rgba(0,0,0,0.5)] ${
        copied
          ? "border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
          : isVerified
          ? "border-zinc-300 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700"
          : "border-zinc-300/80 dark:border-zinc-800/60 hover:border-zinc-400 dark:hover:border-zinc-700"
      }`}
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-200"
      />

      {/* Header: Badge & Time (Higher z-index so hover tooltip floats cleanly over key box) */}
      <div className="relative z-20 flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isExpired ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 flex-shrink-0" />
              <span className={isAr ? "font-arabic leading-none" : ""}>{t.keyCard.expired}</span>
            </span>
          ) : isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 ring-1 ring-gold-400/40 dark:ring-gold-400/35 shadow-[0_0_8px_rgba(245,158,11,0.12)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className={`inline-flex items-center gap-1 ${isAr ? "font-arabic leading-none" : ""}`}>
                <span>{t.keyCard.verified}</span>
                <span className="font-mono text-[11px] font-semibold leading-none opacity-90" dir="ltr">({successRate}%)</span>
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className={isAr ? "font-arabic leading-none" : ""}>{t.keyCard.needsReview}</span>
            </span>
          )}

          {isUsed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80 shadow-xs">
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5] flex-shrink-0" />
              <span className={isAr ? "font-arabic leading-none" : ""}>{t.keyCard.used}</span>
            </span>
          )}
        </div>

        {/* Time Ago with theme-aligned custom tooltip on hover */}
        <div className="relative group/time flex items-center flex-shrink-0">
          <span
            suppressHydrationWarning
            className={`text-[11px] text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 cursor-help transition-colors select-none ${isAr ? "font-arabic leading-none" : ""}`}
          >
            <Clock className="w-3 h-3 opacity-60 flex-shrink-0" />
            <span>{timeAgo}</span>
          </span>

          {/* Luxury emerald/obsidian theme-matching tooltip */}
          <div
            role="tooltip"
            className={`absolute top-full mt-1.5 z-30 pointer-events-none opacity-0 invisible -translate-y-1 group-hover/time:opacity-100 group-hover/time:visible group-hover/time:translate-y-0 transition-all duration-150 ease-out ${
              isAr ? "left-0" : "right-0"
            }`}
          >
            {/* Caret pointing up to the clock badge */}
            <div
              className={`absolute bottom-full -mb-px w-2.5 h-1.5 overflow-hidden ${
                isAr ? "left-5" : "right-5"
              }`}
            >
              <div className="w-2 h-2 bg-zinc-900 dark:bg-zinc-900 border-l border-t border-zinc-700/80 dark:border-zinc-700/80 rotate-45 translate-y-1 mx-auto" />
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/95 dark:bg-zinc-900/95 text-zinc-200 border border-zinc-700/80 dark:border-zinc-700/80 ring-1 ring-emerald-500/20 shadow-2xl shadow-black/60 backdrop-blur-md whitespace-nowrap text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 leading-none">
                  <Clock className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {isAr ? "الوقت الدقيق للإضافة" : "Exact Timestamp"}
                  </span>
                </div>
                <span className="font-mono font-semibold text-zinc-100 tracking-tight leading-none pt-0.5" dir="ltr">
                  {exactTimestamp}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Key Box (Click to copy with tactile press & flourish) */}
      <motion.div
        onClick={handleCopy}
        whileHover={{ scale: 1.01 }}
        whileTap={{ y: 1, scale: 0.995 }}
        className={`relative z-10 flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none mb-3.5 shadow-xs active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] dark:active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] overflow-hidden group ${
          copied
            ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/30"
            : copyFailed
            ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30"
            : "bg-zinc-50 dark:bg-zinc-950 border-zinc-300/80 dark:border-zinc-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:bg-emerald-500/[0.02]"
        }`}
        title={copyFailed ? (t.keyCard.copyFailed || (isAr ? "اضغط مطولاً للنسخ" : "Press & hold to copy")) : t.keyCard.copyKey}
      >
        {/* Shimmer sweep flourish across key box on copy */}
        {copied && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent skew-x-12 z-0"
          />
        )}

        <motion.div
          animate={copied ? { letterSpacing: ["0.08em", "0.14em", "0.08em"] } : {}}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="relative z-10 font-mono text-sm sm:text-base md:text-lg font-bold tracking-wider sm:tracking-widest text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors truncate"
        >
          {renderHighlightedCode()}
        </motion.div>

        {/* Tactile Copy Button (Small Apple-style pill with 'Copy' and icon) */}
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          title={copyFailed ? (t.keyCard.copyFailed || (isAr ? "اضغط مطولاً للنسخ" : "Press & hold to copy")) : t.keyCard.copyKey}
          aria-label={t.keyCard.copyKey}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-150 shadow-xs ${
            copied
              ? "bg-emerald-600 text-white shadow-emerald-600/25 dark:shadow-emerald-950/60"
              : copyFailed
              ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/50"
              : "bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="flex items-center gap-1 text-white"
              >
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span className={isAr ? "font-arabic" : ""}>{t.keyCard.copied}</span>
              </motion.span>
            ) : copyFailed ? (
              <motion.span
                key="failed"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="flex items-center gap-1 text-amber-700 dark:text-amber-300"
              >
                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className={isAr ? "font-arabic" : ""}>{t.keyCard.copyFailed || (isAr ? "اضغط مطولاً للنسخ" : "Press & hold to copy")}</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span className={isAr ? "font-arabic" : ""}>{t.keyCard.copyKey}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Trust & Usage Progress Bar with smooth color transitions */}
      <div className="relative z-10 space-y-1.5 mb-4">
        <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400">
          <span className={`inline-flex items-center gap-1 ${isAr ? "font-arabic leading-none" : ""}`}>
            <span className="font-mono text-zinc-800 dark:text-zinc-300 font-semibold leading-none" dir="ltr">{item.copies_count}</span>
            <span>{t.keyCard.copiedTimes}</span>
          </span>
          <span className="font-mono text-zinc-600 dark:text-zinc-300 text-[11px] font-medium leading-none" dir="ltr">
            {successRate}% {t.keyCard.successRate}
          </span>
        </div>
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full transition-colors duration-500 ${
              successRate >= 75 ? "bg-emerald-500" : successRate >= 45 ? "bg-amber-500" : "bg-rose-500"
            }`}
          />
        </div>
      </div>

      {/* Footer Actions: Vote & Deep Link */}
      <div className="relative z-10 flex items-center justify-between gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
        {/* Voting Buttons with Flip Counter Roll & Personality Thumbs */}
        <div className="flex items-center gap-1.5">
          <motion.button
            onClick={() => handleVoteClick('UP')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.90 }}
            disabled={item.userVoted === 'UP'}
            aria-label={isAr ? `تصويت إيجابي للمفتاح ${item.code}` : `Upvote key ${item.code}`}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              item.userVoted === 'UP'
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-xs"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/70 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60"
            }`}
          >
            <motion.div
              animate={item.userVoted === 'UP' ? { rotate: [0, -15, 6, 0], scale: [1, 1.25, 1] } : {}}
              transition={{ duration: 0.35, ease: "backOut" }}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${item.userVoted === 'UP' ? 'fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400' : ''}`} />
            </motion.div>
            <span className="font-mono inline-block overflow-hidden relative h-[18px] min-w-[12px] text-center leading-[18px]" dir="ltr">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={item.upvotes}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="inline-block font-mono leading-[18px]"
                  dir="ltr"
                >
                  {item.upvotes}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.button>

          <motion.button
            onClick={() => handleVoteClick('DOWN')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.90 }}
            disabled={item.userVoted === 'DOWN'}
            aria-label={isAr ? `تصويت سلبي للمفتاح ${item.code}` : `Downvote key ${item.code}`}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              item.userVoted === 'DOWN'
                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40 shadow-xs"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/70 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60"
            }`}
          >
            <motion.div
              animate={item.userVoted === 'DOWN' ? { rotate: [0, 15, -4, 0], y: [0, 3, 0], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${item.userVoted === 'DOWN' ? 'fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400' : ''}`} />
            </motion.div>
            <span className="font-mono inline-block overflow-hidden relative h-[18px] min-w-[12px] text-center leading-[18px]" dir="ltr">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={item.downvotes}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="inline-block font-mono leading-[18px]"
                  dir="ltr"
                >
                  {item.downvotes}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.button>
        </div>

        {/* Right side: Mark as unused & Deep link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isUsed && onToggleUsed && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playHapticSound('click');
                onToggleUsed(item.code);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={t.keyCard.markUnused}
              aria-label={t.keyCard.markUnused}
              className="group/unused flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-zinc-500 group-hover/unused:text-zinc-900 dark:text-zinc-400 dark:group-hover/unused:text-zinc-100 group-hover/unused:-rotate-45 transition-all duration-200" />
              <span className={`text-[11px] sm:text-xs leading-tight ${isAr ? "font-arabic" : ""}`}>{t.keyCard.markUnused}</span>
            </motion.button>
          )}

          {/* Deep Link to Nusuk App with loading ring indicator */}
          <motion.a
            href={getNusukDeepLink(item.code)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              playHapticSound('click');
              setOpeningNusuk(true);
              setTimeout(() => {
                setOpeningNusuk(false);
              }, 2000);
              onOpenNusuk?.(item.code);
            }}
            whileHover={{ x: isAr ? -3 : 3 }}
            className="group/link flex items-center gap-1.5 text-xs text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
            title={t.keyCard.openNusuk}
            aria-label={t.keyCard.openNusuk}
          >
            <span className={`text-[11px] sm:text-xs leading-tight ${isAr ? "font-arabic" : ""}`}>{t.keyCard.openNusuk}</span>
            {openingNusuk ? (
              <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block flex-shrink-0" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-zinc-500 group-hover/link:text-emerald-600 dark:text-zinc-400 dark:group-hover/link:text-emerald-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all duration-200" />
            )}
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export const KeyCard = React.memo(KeyCardComponent);
KeyCard.displayName = "KeyCard";
