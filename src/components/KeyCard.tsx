"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ExternalLink, ThumbsUp, ThumbsDown, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { ChallengeKey, Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { calculateSuccessRate, formatTimeAgo, getNusukDeepLink } from "@/lib/utils";
import { playHapticSound } from "@/lib/audio";

interface KeyCardProps {
  item: ChallengeKey;
  lang: Language;
  searchQuery?: string;
  onVote: (id: string, type: 'UP' | 'DOWN') => void;
  onCopy: (id: string) => void;
}

export const KeyCard: React.FC<KeyCardProps> = ({
  item,
  lang,
  searchQuery = "",
  onVote,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];
  const isAr = lang === "ar";

  const successRate = calculateSuccessRate(item.upvotes, item.downvotes);
  const isVerified = successRate >= 75 && item.upvotes >= 2;
  const isExpired = item.downvotes > item.upvotes + 3;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.code);
    setCopied(true);
    onCopy(item.id);
    playHapticSound('success');

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleVoteClick = (type: 'UP' | 'DOWN') => {
    if (item.userVoted === type) return;
    playHapticSound('vote');
    onVote(item.id, type);
  };

  // Highlight search term in code cleanly
  const renderHighlightedCode = () => {
    const code = item.code;
    const query = searchQuery.trim().toUpperCase();

    if (!query || !code.includes(query)) {
      return <span>{code}</span>;
    }

    const index = code.indexOf(query);
    const before = code.slice(0, index);
    const match = code.slice(index, index + query.length);
    const after = code.slice(index + query.length);

    return (
      <span>
        {before}
        <span className="bg-amber-500/25 text-amber-200 px-1 py-0.5 rounded font-black">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative rounded-2xl bg-zinc-900/70 p-5 border transition-all duration-300 overflow-hidden shadow-sm ${
        copied
          ? "border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
          : isVerified
          ? "border-zinc-800/80 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40"
          : "border-zinc-800/60 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40"
      }`}
    >
      {/* Interactive Cursor Spotlight Glow */}
      {mousePos && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.09), transparent 80%)`,
          }}
        />
      )}

      {/* Header: Badge & Time */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5">
        {isExpired ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className={isAr ? "font-arabic" : ""}>{t.keyCard.expired}</span>
          </span>
        ) : isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className={isAr ? "font-arabic" : ""}>{t.keyCard.verified} ({successRate}%)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className={isAr ? "font-arabic" : ""}>{t.keyCard.needsReview}</span>
          </span>
        )}

        {/* Time Ago */}
        <span className={`text-[11px] text-zinc-500 flex items-center gap-1 ${isAr ? "font-arabic" : ""}`}>
          <Clock className="w-3 h-3 opacity-60" />
          {formatTimeAgo(item.created_at, lang)}
        </span>
      </div>

      {/* Main Key Box (Click to copy with spring bounce) */}
      <motion.div
        onClick={handleCopy}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors cursor-pointer select-none mb-3.5 shadow-inner group"
        title={t.keyCard.copyKey}
      >
        <div className="font-mono text-base sm:text-lg font-bold tracking-widest text-zinc-100 group-hover:text-white transition-colors truncate">
          {renderHighlightedCode()}
        </div>

        {/* Tactile Copy Button (Small Apple-style pill with 'Copy' and icon) */}
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          title={t.keyCard.copyKey}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
            copied
              ? "bg-emerald-600 text-white shadow-emerald-950/60"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80"
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
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span className={isAr ? "font-arabic" : ""}>
            <span className="font-mono text-zinc-300 font-medium">{item.copies_count}</span> {t.keyCard.copiedTimes}
          </span>
          <span className="font-mono text-zinc-300 text-[11px]">
            {successRate}% {t.keyCard.successRate}
          </span>
        </div>
        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
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
      <div className="relative z-10 flex items-center justify-between gap-2 pt-3 border-t border-zinc-800/80">
        {/* Voting Buttons with Apple-style rounded-full pills */}
        <div className="flex items-center gap-1.5">
          <motion.button
            onClick={() => handleVoteClick('UP')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.90 }}
            disabled={item.userVoted === 'UP'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              item.userVoted === 'UP'
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60"
            }`}
          >
            <motion.div
              animate={item.userVoted === 'UP' ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${item.userVoted === 'UP' ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            </motion.div>
            <span className="font-mono">{item.upvotes}</span>
          </motion.button>

          <motion.button
            onClick={() => handleVoteClick('DOWN')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.90 }}
            disabled={item.userVoted === 'DOWN'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              item.userVoted === 'DOWN'
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "bg-zinc-800/70 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/60"
            }`}
          >
            <motion.div
              animate={item.userVoted === 'DOWN' ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${item.userVoted === 'DOWN' ? 'fill-rose-400 text-rose-400' : ''}`} />
            </motion.div>
            <span className="font-mono">{item.downvotes}</span>
          </motion.button>
        </div>

        {/* Deep Link to Nusuk App */}
        <motion.a
          href={getNusukDeepLink(item.code)}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ x: isAr ? -3 : 3 }}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
          title={t.keyCard.openNusuk}
        >
          <span className={isAr ? "font-arabic" : ""}>{t.keyCard.openNusuk}</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </motion.a>
      </div>
    </motion.div>
  );
};
