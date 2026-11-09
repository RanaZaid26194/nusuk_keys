"use client";

import React, { useState, useRef } from "react";
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

export const KeyCard: React.FC<KeyCardProps> = ({
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
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();

  const t = translations[lang];
  const isAr = lang === "ar";

  const successRate = calculateSuccessRate(item.upvotes, item.downvotes);
  const isVerified = successRate >= 75 && item.upvotes >= 2;
  const isExpired = item.downvotes > item.upvotes + 3;

  // zero-react-rerender spotlight tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) =>
  {
    if (!cardRef.current || !spotlightRef.current)
      return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.opacity = "1";
    spotlightRef.current.style.background = `radial-gradient(350px circle at ${x}px ${y}px, var(--spotlight-glow, rgba(16, 185, 129, 0.08)), transparent 80%)`;
  };

  const handleMouseLeave = () =>
  {
    if (spotlightRef.current)
      spotlightRef.current.style.opacity = "0";
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
        <span className="bg-amber-400/30 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded font-black">{match}</span>
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
      className={`relative rounded-2xl bg-white dark:bg-zinc-900/70 p-4 sm:p-5 border transition-colors duration-150 overflow-hidden shadow-xs hover:shadow-md dark:shadow-none dark:hover:shadow-black/40 ${
        copied
          ? "border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
          : isVerified
          ? "border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
          : "border-zinc-200/70 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-200"
      />

      {/* Header: Badge & Time */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isExpired ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span className={isAr ? "font-arabic" : ""}>{t.keyCard.expired}</span>
            </span>
          ) : isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className={isAr ? "font-arabic" : ""}>{t.keyCard.verified} ({successRate}%)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className={isAr ? "font-arabic" : ""}>{t.keyCard.needsReview}</span>
            </span>
          )}

          {isUsed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80 shadow-xs">
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              <span className={isAr ? "font-arabic" : ""}>{t.keyCard.used}</span>
            </span>
          )}
        </div>

        {/* Time Ago */}
        <span
          suppressHydrationWarning
          className={`text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1 flex-shrink-0 ${isAr ? "font-arabic" : ""}`}
        >
          <Clock className="w-3 h-3 opacity-60" />
          {formatTimeAgo(item.created_at, lang)}
        </span>
      </div>

      {/* Main Key Box (Click to copy with spring bounce) */}
      <motion.div
        onClick={handleCopy}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`relative z-10 flex items-center justify-between p-3 sm:p-3.5 rounded-xl border transition-colors duration-150 cursor-pointer select-none mb-3.5 shadow-xs group ${
          copied
            ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/30"
            : copyFailed
            ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30"
            : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:bg-emerald-500/[0.02]"
        }`}
        title={copyFailed ? (t.keyCard.copyFailed || (isAr ? "اضغط مطولاً للنسخ" : "Press & hold to copy")) : t.keyCard.copyKey}
      >
        <div className="font-mono text-sm sm:text-base md:text-lg font-bold tracking-wider sm:tracking-widest text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors truncate">
          {renderHighlightedCode()}
        </div>

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

      {/* Trust & Usage Progress Bar */}
      <div className="relative z-10 space-y-1.5 mb-4">
        <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400">
          <span className={isAr ? "font-arabic" : ""}>
            <span className="font-mono text-zinc-800 dark:text-zinc-300 font-semibold">{item.copies_count}</span> {t.keyCard.copiedTimes}
          </span>
          <span className="font-mono text-zinc-600 dark:text-zinc-300 text-[11px] font-medium">
            {successRate}% {t.keyCard.successRate}
          </span>
        </div>
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              successRate >= 75 ? "bg-emerald-500" : successRate >= 45 ? "bg-amber-500" : "bg-rose-500"
            }`}
          />
        </div>
      </div>

      {/* Footer Actions: Vote & Deep Link */}
      <div className="relative z-10 flex items-center justify-between gap-2 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
        {/* Voting Buttons with Apple-style rounded-full pills */}
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
              animate={item.userVoted === 'UP' ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${item.userVoted === 'UP' ? 'fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400' : ''}`} />
            </motion.div>
            <span className="font-mono">{item.upvotes}</span>
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
              animate={item.userVoted === 'DOWN' ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${item.userVoted === 'DOWN' ? 'fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400' : ''}`} />
            </motion.div>
            <span className="font-mono">{item.downvotes}</span>
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
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              <RotateCcw className="w-3 h-3 opacity-70" />
              <span className={isAr ? "font-arabic" : ""}>{t.keyCard.markUnused}</span>
            </motion.button>
          )}

          {/* Deep Link to Nusuk App */}
          <motion.a
            href={getNusukDeepLink(item.code)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              playHapticSound('click');
              onOpenNusuk?.(item.code);
            }}
            whileHover={{ x: isAr ? -3 : 3 }}
            className="group/link flex items-center gap-1 text-[11px] text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
            title={t.keyCard.openNusuk}
            aria-label={t.keyCard.openNusuk}
          >
            <span className={isAr ? "font-arabic" : ""}>{t.keyCard.openNusuk}</span>
            <ExternalLink className="w-3 h-3 opacity-70 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all duration-200" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};
