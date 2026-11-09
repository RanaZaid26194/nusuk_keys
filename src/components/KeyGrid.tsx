"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Layers, ShieldCheck, Flame, Clock, Inbox, Command, ChevronDown, History, Trash2 } from "lucide-react";
import { ChallengeKey, FilterTab, Language } from "@/lib/types";
import { translations } from "@/lib/translations";
import { KeyCard } from "./KeyCard";
import { playHapticSound } from "@/lib/audio";

interface KeyGridProps
{
  items: ChallengeKey[];
  isLoading?: boolean;
  lang: Language;
  searchQuery: string;
  activeTab: FilterTab;
  usedMap: Record<string, number>;
  usedCount: number;
  shouldPulseUsedBadge?: boolean;
  hasUnvotedUsedKeys?: boolean;
  onSearchChange: (query: string) => void;
  onTabChange: (tab: FilterTab) => void;
  onVote: (id: string, type: 'UP' | 'DOWN') => void;
  onCopy: (id: string) => void;
  onOpenSubmit: () => void;
  onOpenNusuk?: (code: string) => void;
  onToggleUsed?: (code: string) => void;
  onClearUsed?: () => void;
}

export const KeyGrid: React.FC<KeyGridProps> = ({
  items,
  isLoading = false,
  lang,
  searchQuery,
  activeTab,
  usedMap,
  usedCount,
  shouldPulseUsedBadge = false,
  hasUnvotedUsedKeys = false,
  onSearchChange,
  onTabChange,
  onVote,
  onCopy,
  onOpenSubmit,
  onOpenNusuk,
  onToggleUsed,
  onClearUsed,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [displayLimit, setDisplayLimit] = useState(60);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const t = translations[lang];
  const isAr = lang === "ar";

  const tabIcons = {
    all: Layers,
    verified: ShieldCheck,
    popular: Flame,
    latest: Clock,
    used: History,
  };

  // Reset pagination when filter or search changes
  useEffect(() =>
  {
    setDisplayLimit(60);
  }, [activeTab, searchQuery]);

  // Reset clear confirmation when leaving tab
  useEffect(() =>
  {
    setConfirmingClear(false);
  }, [activeTab]);

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

  const handleLoadMore = () =>
  {
    playHapticSound('click');
    setDisplayLimit((prev) => Math.min(prev + 60, items.length));
    setTimeout(() =>
    {
      window.scrollBy({ top: 120, behavior: "smooth" });
    }, 60);
  };

  const visibleItems = useMemo(() =>
  {
    return items.slice(0, displayLimit);
  }, [items, displayLimit]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      {/* Controls Container: Search & Tabs (Apple-style Segmented Control) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8"
      >
        {/* Animated Search Bar with Keyboard Hint (RTL/LTR Adaptive) */}
        <div className="flex-1 max-w-md group" role="search">
          <div className="relative">
            <div className={`absolute inset-y-0 ${isAr ? "right-0 pr-3.5" : "left-0 pl-3.5"} flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors duration-200`}>
              <Search className="w-4 h-4" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className={`w-full ${isAr ? "pr-10 pl-16 text-right font-arabic" : "pl-10 pr-16 text-left"} py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-base sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 shadow-sm transition-all duration-200`}
            />

            <div className={`absolute inset-y-0 ${isAr ? "left-0 pl-3" : "right-0 pr-3"} flex items-center gap-1.5 pointer-events-none`}>
              <AnimatePresence>
                {searchQuery ? (
                  <motion.button
                    key="clear"
                    type="button"
                    aria-label={isAr ? "مسح البحث" : "Clear search"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => {
                      onSearchChange("");
                      searchInputRef.current?.focus();
                    }}
                    className="pointer-events-auto p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                    <Command className="w-2.5 h-2.5" />K
                  </span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Result Count Fade */}
          <AnimatePresence>
            {searchQuery.trim().length > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 px-3 font-medium ${isAr ? "font-arabic text-right" : "text-left"}`}
              >
                {isAr
                  ? `تم العثور على ${items.length.toLocaleString()} مفتاح`
                  : `${items.length.toLocaleString()} keys match`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Sliding Filter Tabs (Clean Apple-style Segmented Control) */}
        <div
          role="tablist"
          aria-label={isAr ? "خيارات التصفية" : "Filter options"}
          className="flex items-center gap-1 p-1 rounded-full bg-zinc-100/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar shadow-sm"
        >
          {(["all", "verified", "popular", "latest", "used"] as FilterTab[]).map((tab) =>
          {
            const Icon = tabIcons[tab];
            const isActive = activeTab === tab;

            return (
              <motion.button
                key={tab}
                role="tab"
                aria-selected={isActive}
                aria-label={t.tabs[tab]}
                onClick={() => handleTabClick(tab)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors select-none ${
                  isActive ? "text-zinc-900 dark:text-white font-semibold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                } ${isAr ? "font-arabic" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700/60 shadow-xs"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-500 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"}`} />
                  <span>{t.tabs[tab]}</span>
                  {tab === "used" && usedCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={shouldPulseUsedBadge ? { scale: [1, 1.45, 1], transition: { duration: 0.6 } } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-tight ${
                        isActive
                          ? "bg-amber-500/20 text-amber-900 dark:text-amber-200"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {usedCount > 999 ? "999+" : usedCount}
                    </motion.span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab content crossfade container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: "easeInOut" }}
        >
          {/* Used tab subheader: hint line & clear history action */}
          {activeTab === "used" && usedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-6 px-4 py-2.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/70 text-xs"
            >
              <div className="text-zinc-600 dark:text-zinc-400">
                {hasUnvotedUsedKeys && (
                  <span className={isAr ? "font-arabic" : ""}>
                    {t.usedHint}
                  </span>
                )}
              </div>

              {onClearUsed && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {confirmingClear ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] text-rose-600 dark:text-rose-400 font-medium ${isAr ? "font-arabic" : ""}`}>
                        {t.confirmClear}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                        {
                          playHapticSound('click');
                          onClearUsed();
                          setConfirmingClear(false);
                        }}
                        className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition-colors"
                      >
                        {isAr ? "تأكيد" : "Yes, clear"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                        {
                          playHapticSound('click');
                          setConfirmingClear(false);
                        }}
                        className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors"
                      >
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                      {
                        playHapticSound('click');
                        setConfirmingClear(true);
                      }}
                      className={`flex items-center gap-1 text-[11px] text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors ${
                        isAr ? "font-arabic" : ""
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t.clearHistory}</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Grid of Cards with Staggered Cascading Reveal & whileInView */}
          {items.length > 0 ? (
            <>
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {visibleItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.28, ease: "easeOut", delay: idx < 8 ? (idx % 4) * 0.03 : 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <KeyCard
                        item={item}
                        lang={lang}
                        searchQuery={searchQuery}
                        isUsed={Boolean(usedMap[item.code.toUpperCase().trim()])}
                        onVote={onVote}
                        onCopy={onCopy}
                        onOpenNusuk={onOpenNusuk}
                        onToggleUsed={onToggleUsed}
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
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    aria-label={isAr ? "عرض المزيد من المفاتيح" : "Show more keys"}
                    className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 shadow-sm hover:shadow transition-colors duration-150"
                  >
                    <span>
                      {isAr
                        ? `عرض المزيد (يُعرض ${visibleItems.length.toLocaleString()} من ${items.length.toLocaleString()} مفتاح)`
                        : `Show More (${visibleItems.length.toLocaleString()} of ${items.length.toLocaleString()} keys)`}
                    </span>
                    <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-400 group-hover:translate-y-0.5 transition-transform duration-200" />
                  </motion.button>
                </div>
              )}
            </>
          ) : isLoading ? (
            /* Apple-Grade Glass Skeleton Shimmer Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="relative p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between h-44 overflow-hidden animate-pulse shadow-xs"
                >
                  {/* Top row: badge + time shimmer */}
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800/80 rounded-full" />
                    <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800/60 rounded" />
                  </div>

                  {/* Middle row: code display box shimmer */}
                  <div className="my-3 py-3 px-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between">
                    <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-6 w-14 bg-zinc-200 dark:bg-zinc-800/80 rounded-lg" />
                  </div>

                  {/* Bottom row: votes & stats shimmer */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/70 dark:border-zinc-800/50">
                    <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800/70 rounded" />
                    <div className="flex gap-1.5">
                      <div className="h-6 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                      <div className="h-6 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "used" ? (
            /* Empty State for Used tab */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4 rounded-3xl bg-white/80 dark:bg-zinc-900/60 border border-dashed border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-700/60">
                <History className="w-6 h-6" />
              </div>
              <h3 className={`text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-1.5 ${isAr ? "font-arabic" : ""}`}>
                {t.emptyUsed.title}
              </h3>
              <p className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto ${isAr ? "font-arabic" : ""}`}>
                {t.emptyUsed.description}
              </p>
            </motion.div>
          ) : (
            /* Empty State for other tabs */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4 rounded-3xl bg-white/80 dark:bg-zinc-900/60 border border-dashed border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-700/60">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className={`text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-1.5 ${isAr ? "font-arabic" : ""}`}>
                {t.empty.title}
              </h3>
              <p className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 ${isAr ? "font-arabic" : ""}`}>
                {t.empty.description}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {searchQuery && (
                  <motion.button
                    onClick={() => onSearchChange("")}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    aria-label={t.empty.clearFilters}
                    className="px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs sm:text-sm text-zinc-800 dark:text-white font-medium transition-colors"
                  >
                    {t.empty.clearFilters}
                  </motion.button>
                )}
                <motion.button
                  onClick={onOpenSubmit}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  aria-label={t.shareCodeBtn}
                  className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm text-white font-semibold shadow-sm transition-colors"
                >
                  {t.shareCodeBtn}
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
