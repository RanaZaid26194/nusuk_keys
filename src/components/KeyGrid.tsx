"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Layers, ShieldCheck, Flame, Clock, Inbox } from "lucide-react";
import { ChallengeKey, FilterTab, Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { KeyCard } from "./KeyCard";

interface KeyGridProps {
  items: ChallengeKey[];
  lang: Language;
  searchQuery: string;
  activeTab: FilterTab;
  onSearchChange: (query: string) => void;
  onTabChange: (tab: FilterTab) => void;
  onVote: (id: string, type: 'UP' | 'DOWN') => void;
  onCopy: (id: string) => void;
  onOpenSubmit: () => void;
}

export const KeyGrid: React.FC<KeyGridProps> = ({
  items,
  lang,
  searchQuery,
  activeTab,
  onSearchChange,
  onTabChange,
  onVote,
  onCopy,
  onOpenSubmit,
}) => {
  const t = translations[lang];
  const isAr = lang === "ar";

  const tabIcons = {
    all: Layers,
    verified: ShieldCheck,
    popular: Flame,
    latest: Clock,
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Controls Container: Search & Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Animated Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-emerald-400" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-2xl bg-slate-900/90 border border-emerald-900/60 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 shadow-inner transition-all ${
              isAr ? "font-arabic" : ""
            }`}
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
              >
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700">
                  <X className="w-3 h-3" />
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Sliding Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-emerald-900/50 overflow-x-auto no-scrollbar">
          {(["all", "verified", "popular", "latest"] as FilterTab[]).map((tab) => {
            const Icon = tabIcons[tab];
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                } ${isAr ? "font-arabic" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-emerald-800/80 rounded-xl border border-emerald-500/30 shadow-md shadow-emerald-950/60"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-gold-300" : "text-slate-400"}`} />
                  {t.tabs[tab]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Cards */}
      {items.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <KeyCard
                key={item.id}
                item={item}
                lang={lang}
                onVote={onVote}
                onCopy={onCopy}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 rounded-3xl glass-panel border border-dashed border-slate-800 max-w-lg mx-auto"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-800/40">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className={`text-lg sm:text-xl font-bold text-white mb-2 ${isAr ? "font-arabic" : ""}`}>
            {t.empty.title}
          </h3>
          <p className={`text-sm text-slate-400 mb-6 ${isAr ? "font-arabic" : ""}`}>
            {t.empty.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm text-white font-medium transition-colors"
              >
                {t.empty.clearFilters}
              </button>
            )}
            <button
              onClick={onOpenSubmit}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm text-white font-semibold shadow-lg shadow-emerald-900/40 transition-colors"
            >
              {t.shareCodeBtn}
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
};
