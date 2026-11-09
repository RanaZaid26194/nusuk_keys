"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ExternalLink, ThumbsUp, ThumbsDown, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];
  const isAr = lang === "ar";

  const successRate = calculateSuccessRate(item.upvotes, item.downvotes);
  const isVerified = successRate >= 75 && item.upvotes >= 2;
  const isExpired = item.downvotes > item.upvotes + 3;

  // Handle Spotlight cursor glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.code);
    setCopied(true);
    onCopy(item.id);
    playHapticSound('success');

    // Micro-confetti burst from the click coordinates
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 22,
      spread: 45,
      origin: { x, y },
      colors: ['#10b981', '#d4af37', '#34d399', '#fef08a'],
      disableForReducedMotion: true,
      scalar: 0.75,
    });

    setTimeout(() => {
      setCopied(false);
    }, 2200);
  };

  const handleVoteClick = (type: 'UP' | 'DOWN') => {
    if (item.userVoted === type) return;
    playHapticSound('vote');
    onVote(item.id, type);
  };

  // Highlight search term in code
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
        <span className="bg-gold-400/25 text-gold-300 px-0.5 rounded border-b border-gold-400">{match}</span>
        {after}
      </span>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group rounded-3xl glass-panel p-5 transition-all duration-300 overflow-hidden ${
        isVerified
          ? "border-emerald-600/30 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-950/60"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Spotlight Radial Hover Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.12), transparent 80%)`
            : "none",
        }}
      />

      {/* Top Header: Badge & Time */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3.5">
        {/* Verification Status Badge */}
        {isExpired ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className={isAr ? "font-arabic" : ""}>{t.keyCard.expired}</span>
          </span>
        ) : isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-900/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className={isAr ? "font-arabic" : ""}>{t.keyCard.verified} ({successRate}%)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className={isAr ? "font-arabic" : ""}>{t.keyCard.needsReview}</span>
          </span>
        )}

        {/* Time Ago */}
        <span className={`text-[11px] text-slate-400 flex items-center gap-1 ${isAr ? "font-arabic" : ""}`}>
          <Clock className="w-3 h-3 opacity-60" />
          {formatTimeAgo(item.created_at, lang)}
        </span>
      </div>

      {/* Main Key Display Box (Clickable to Copy) */}
      <div
        onClick={handleCopy}
        className="relative z-10 flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-900/50 hover:border-emerald-400/60 transition-all cursor-pointer select-none group/box mb-4 shadow-inner"
        title={t.keyCard.copyKey}
      >
        <div className="font-mono text-base sm:text-lg font-bold tracking-wider text-emerald-200 truncate">
          {renderHighlightedCode()}
        </div>

        {/* Micro-animated Copy Button */}
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={t.keyCard.copyKey}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
            copied
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40"
              : "bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className={isAr ? "font-arabic" : ""}>{t.keyCard.copied}</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className={isAr ? "font-arabic" : ""}>{t.keyCard.copyKey}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Verification Success Rate Progress Bar */}
      <div className="relative z-10 space-y-1.5 mb-4">
        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <span className={isAr ? "font-arabic" : ""}>
            <span className="font-mono font-semibold text-slate-200">{item.copies_count}</span> {t.keyCard.copiedTimes}
          </span>
          <span className="font-semibold text-emerald-400 font-mono">
            {successRate}% {t.keyCard.successRate}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full transition-all ${
              successRate >= 75 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : successRate >= 45 ? "bg-amber-400" : "bg-rose-500"
            }`}
          />
        </div>
      </div>

      {/* Action Footer: Vote & Deep Link */}
      <div className="relative z-10 flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
        {/* Voting Pills with Spring Micro-Bounce */}
        <div className="flex items-center gap-1.5">
          {/* Upvote Button */}
          <motion.button
            onClick={() => handleVoteClick('UP')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            disabled={item.userVoted === 'UP'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              item.userVoted === 'UP'
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 ring-1 ring-emerald-500/30"
                : "bg-slate-900/70 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-300 border border-slate-800"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${item.userVoted === 'UP' ? 'fill-emerald-400 text-emerald-400' : ''}`} />
            <motion.span
              key={item.upvotes}
              initial={{ scale: 1.4, color: '#34d399' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.25 }}
              className="font-mono"
            >
              {item.upvotes}
            </motion.span>
          </motion.button>

          {/* Downvote Button */}
          <motion.button
            onClick={() => handleVoteClick('DOWN')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            disabled={item.userVoted === 'DOWN'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              item.userVoted === 'DOWN'
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 ring-1 ring-rose-500/30"
                : "bg-slate-900/70 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-800"
            }`}
          >
            <ThumbsDown className={`w-3.5 h-3.5 ${item.userVoted === 'DOWN' ? 'fill-rose-400 text-rose-400' : ''}`} />
            <motion.span
              key={item.downvotes}
              initial={{ scale: 1.4, color: '#f43f5e' }}
              animate={{ scale: 1, color: 'inherit' }}
              transition={{ duration: 0.25 }}
              className="font-mono text-slate-400"
            >
              {item.downvotes}
            </motion.span>
          </motion.button>
        </div>

        {/* Deep Link to Official Nusuk App */}
        <motion.a
          href={getNusukDeepLink(item.code)}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 hover:from-emerald-900 hover:to-teal-900 text-emerald-300 text-xs font-semibold border border-emerald-600/30 shadow-sm transition-all"
        >
          <span className={isAr ? "font-arabic" : ""}>{t.keyCard.openNusuk}</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[2.2] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </motion.a>
      </div>
    </motion.div>
  );
};
