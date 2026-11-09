"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Layers, ShieldCheck, Flame, Clock, Inbox, Command, ChevronDown } from "lucide-react";
import { ChallengeKey, FilterTab, Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { KeyCard } from "./KeyCard";
import { playHapticSound } from "@/lib/audio";

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [displayLimit, setDisplayLimit] = useState(60);
  const t = translations[lang];
  const isAr = lang === "ar";

  const tabIcons = {
    all: Layers,
    verified: ShieldCheck,
    popular: Flame,
    latest: Clock,
  };

  // Reset pagination when filter or search changes
  useEffect(() => {
    setDisplayLimit(60);
  }, [activeTab, searchQuery]);

  // Quick / or Ctrl+K focus shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTabClick = (tab: FilterTab) => {
    playHapticSound('click');
    onTabChange(tab);
  };

  const handleLoadMore = () => {
    playHapticSound('click');
    setDisplayLimit((prev) => Math.min(prev + 60, items.length));
  };

  const visibleItems = useMemo(() => {
    return items.slice(0, displayLimit);
  }, [items, displayLimit]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      {/* Controls Container: Search & Tabs (Apple-style Segmented Control) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8"
      >
        {/* Animated Search Bar with Keyboard Hint */}
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
            <Search className="w-4 h-4" />
          </div>

          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-10 pr-16 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 shadow-sm transition-all ${
              isAr ? "font-arabic" : ""
            }`}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5 pointer-events-none">
            <AnimatePresence>
              {searchQuery ? (
                <motion.button
                  key="clear"
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    onSearchChange("");
                    searchInputRef.current?.focus();
                  }}
                  className="pointer-events-auto p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-[10px] font-mono text-zinc-400">
                  <Command className="w-2.5 h-2.5" />K
                </span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sliding Filter Tabs (Clean Apple-style Segmented Control) */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-zinc-900 border border-zinc-800 overflow-x-auto no-scrollbar shadow-sm">
          {(["all", "verified", "popular", "latest"] as FilterTab[]).map((tab) => {
            const Icon = tabIcons[tab];
            const isActive = activeTab === tab;

            return (
              <motion.button
                key={tab}
                onClick={() => handleTabClick(tab)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors select-none ${
                  isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                } ${isAr ? "font-arabic" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-zinc-800 rounded-full border border-zinc-700/60 shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-zinc-500"}`} />
                  {t.tabs[tab]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Grid of Cards with Staggered Cascading Reveal */}
      {items.length > 0 ? (
        <>
          <motion.div
            layout
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          >
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <KeyCard
                    item={item}
                    lang={lang}
                    searchQuery={searchQuery}
                    onVote={onVote}
                    onCopy={onCopy}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Apple-style Progressive Pagination ("Show More") */}
          {items.length > displayLimit && (
            <div className="flex flex-col items-center justify-center mt-12 gap-2">
              <motion.button
                onClick={handleLoadMore}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-200 shadow-md transition-all"
              >
                <span>
                  {isAr
                    ? `عرض المزيد (يُعرض ${visibleItems.length.toLocaleString()} من ${items.length.toLocaleString()} مفتاح)`
                    : `Show More (${visibleItems.length.toLocaleString()} of ${items.length.toLocaleString()} keys)`}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </motion.button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4 rounded-3xl bg-zinc-900/60 border border-dashed border-zinc-800 max-w-lg mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-4 border border-zinc-700/60">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className={`text-base sm:text-lg font-bold text-white mb-1.5 ${isAr ? "font-arabic" : ""}`}>
            {t.empty.title}
          </h3>
          <p className={`text-xs sm:text-sm text-zinc-400 mb-6 ${isAr ? "font-arabic" : ""}`}>
            {t.empty.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {searchQuery && (
              <motion.button
                onClick={() => onSearchChange("")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-sm text-white font-medium transition-colors"
              >
                {t.empty.clearFilters}
              </motion.button>
            )}
            <motion.button
              onClick={onOpenSubmit}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm text-white font-semibold shadow-sm transition-colors"
            >
              {t.shareCodeBtn}
            </motion.button>
          </div>
        </motion.div>
      )}
    </section>
  );
};
