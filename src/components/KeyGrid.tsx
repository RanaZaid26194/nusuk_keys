"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Layers, ShieldCheck, Flame, Clock, Inbox, Command, ChevronDown, History, Trash2, ArrowUpDown, Check } from "lucide-react";
import { ChallengeKey, FilterTab, Language, SortOption } from "@/lib/types";
import { translations } from "@/lib/translations";
import { KeyCard } from "./KeyCard";
import { playHapticSound } from "@/lib/audio";
import { Tooltip } from "./Tooltip";

interface KeyGridProps
{
  items: ChallengeKey[];
  isLoading?: boolean;
  lang: Language;
  searchQuery: string;
  activeTab: FilterTab;
  sortBy?: SortOption;
  usedMap: Record<string, number>;
  usedCount: number;
  shouldPulseUsedBadge?: boolean;
  hasUnvotedUsedKeys?: boolean;
  onSearchChange: (query: string) => void;
  onTabChange: (tab: FilterTab) => void;
  onSortChange?: (sort: SortOption) => void;
  onVote: (id: string, type: 'UP' | 'DOWN', code?: string) => void;
  onCopy: (id: string, code?: string) => void;
  onOpenSubmit: () => void;
  onOpenNusuk?: (code: string) => void;
  onToggleUsed?: (code: string) => void;
  onClearUsed?: () => void;
}

const KeyGridComponent: React.FC<KeyGridProps> = ({
  items,
  isLoading = false,
  lang,
  searchQuery,
  activeTab,
  sortBy = "newest",
  usedMap,
  usedCount,
  shouldPulseUsedBadge = false,
  hasUnvotedUsedKeys = false,
  onSearchChange,
  onTabChange,
  onSortChange,
  onVote,
  onCopy,
  onOpenSubmit,
  onOpenNusuk,
  onToggleUsed,
  onClearUsed,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [displayLimit, setDisplayLimit] = useState(24);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
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
    setDisplayLimit(24);
  }, [activeTab, searchQuery]);

  // Ensure active tab is scrolled into view on mobile
  useEffect(() =>
  {
    tabRefs.current[activeTab]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeTab]);

  // Reset clear confirmation when leaving tab
  useEffect(() =>
  {
    setConfirmingClear(false);
  }, [activeTab]);

  // Quick / or Ctrl+K focus shortcut (only when not typing in any input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (["INPUT", "TEXTAREA"].includes(activeEl.tagName) || (activeEl as HTMLElement).isContentEditable);
      if ((e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) && !isInputFocused) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sort dropdown pointerdown outside and Escape listener (iOS & Android friendly)
  useEffect(() =>
  {
    const handleClickOutside = (e: PointerEvent) =>
    {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setIsSortOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) =>
    {
      if (e.key === "Escape")
        setIsSortOpen(false);
    };

    document.addEventListener("pointerdown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () =>
    {
      document.removeEventListener("pointerdown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleTabClick = (tab: FilterTab) => {
    playHapticSound('click');
    onTabChange(tab);
    tabRefs.current[tab]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  useEffect(() => {
    tabRefs.current[activeTab]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTab]);

  const handleLoadMore = () =>
  {
    playHapticSound('click');
    setDisplayLimit((prev) => Math.min(prev + 24, items.length));
  };

  const visibleItems = useMemo(() =>
  {
    return items.slice(0, displayLimit);
  }, [items, displayLimit]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      {/* Sticky Filter Bar (Sticks below header once scrolled past hero) */}
      <div className="sticky top-14 sm:top-[56px] z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-zinc-50/95 dark:bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors shadow-xs mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 max-w-7xl mx-auto"
        >
          {/* Animated Search Bar with Keyboard Hint (RTL/LTR Adaptive) */}
          <div className="flex-1 max-w-md group" role="search">
            <div className="relative">
              <div className={`absolute inset-y-0 ${isAr ? "right-0 pr-3.5" : "left-0 pl-3.5"} flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors duration-200`}>
                <Search className="w-4 h-4" />
              </div>

              <input
                ref={searchInputRef}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className={`w-full ${isAr ? "pr-10 pl-16 text-right font-arabic" : "pl-10 pr-16 text-left"} py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-base sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 shadow-sm transition-all duration-200`}
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
                      className="pointer-events-auto p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
                  className={`text-xs text-zinc-500 dark:text-zinc-400 mt-1 px-3 font-medium ${isAr ? "font-arabic text-right" : "text-left"}`}
                >
                  {isAr
                    ? (items.length === 0
                        ? "لا توجد مفاتيح مطابقة"
                        : items.length === 1
                        ? "تم العثور على مفتاح واحد"
                        : items.length === 2
                        ? "تم العثور على مفتاحين"
                        : `تم العثور على ${items.length.toLocaleString()} مفاتيح`)
                    : (items.length === 0
                        ? "No keys match"
                        : items.length === 1
                        ? "1 key matches"
                        : `${items.length.toLocaleString()} keys match`)}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Right side: Filter Tabs & Sort Dropdown (Side-by-side on mobile, no 3rd row wrapping) */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* Sliding Filter Tabs (Clean Apple-style Segmented Control) */}
            <div
              role="tablist"
              aria-label={isAr ? "خيارات التصفية" : "Filter options"}
              className="flex-1 min-w-0 flex items-center gap-1 p-1 rounded-full bg-zinc-100/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar shadow-sm touch-pan-x"
            >
              {(["all", "verified", "popular", "latest", "used"] as FilterTab[]).map((tab) =>
              {
                const Icon = tabIcons[tab];
                const isActive = activeTab === tab;

                return (
                  <motion.button
                    key={tab}
                    ref={(el) => { tabRefs.current[tab] = el; }}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={t.tabs[tab]}
                    onClick={() => handleTabClick(tab)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors select-none ${
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
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${
                            isActive
                              ? "bg-amber-500/20 text-amber-900 dark:text-amber-200"
                              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                          dir="ltr"
                        >
                          {usedCount > 999 ? "999+" : usedCount}
                        </motion.span>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Sort Dropdown Control with theme tooltip */}
            {onSortChange && (
              <div className="relative flex-shrink-0" ref={sortRef}>
                <Tooltip
                  content={isSortOpen ? null : (isAr ? "تغيير ترتيب المفاتيح" : "Change sorting order")}
                  position="bottom"
                  align={isAr ? "start" : "end"}
                >
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    aria-expanded={isSortOpen}
                    aria-label={`${t.sort.label}: ${t.sort[sortBy]}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm transition-all"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                    <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">{t.sort.label}:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{t.sort[sortBy]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
                  </button>
                </Tooltip>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`absolute ${isAr ? "left-0" : "right-0"} mt-1.5 w-44 max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 shadow-xl backdrop-blur-xl p-1 z-40`}
                    >
                      {(["newest", "copies", "rating"] as SortOption[]).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            playHapticSound("click");
                            onSortChange(option);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                            sortBy === option
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          } ${isAr ? "font-arabic text-right" : "text-left"}`}
                        >
                          <span>{t.sort[option]}</span>
                          {sortBy === option && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>

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
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors"
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
                        className="px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                      >
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  ) : (
                    <Tooltip
                      content={isAr ? "مسح جميع المفاتيح التي تم نسخها" : "Clear all copied keys history"}
                      position="top"
                      dotColor="rose"
                    >
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
                    </Tooltip>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Grid Content / Skeletons / Empty States */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="relative p-5 rounded-2xl bg-white/80 dark:bg-zinc-900/60 border border-zinc-300/80 dark:border-zinc-800/80 flex flex-col justify-between min-h-[210px] h-[210px] overflow-hidden shadow-xs dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                >
                  {/* Shimmer light sweep */}
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-zinc-700/25 to-transparent pointer-events-none" />

                  {/* Top row: badge + time shimmer */}
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-24 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-full" />
                    <div className="h-4 w-12 bg-zinc-200/80 dark:bg-zinc-800/60 rounded" />
                  </div>

                  {/* Middle row: code display box shimmer */}
                  <div className="my-3 py-3 px-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between">
                    <div className="h-5 w-28 bg-zinc-200/80 dark:bg-zinc-800 rounded" />
                    <div className="h-6 w-14 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-lg" />
                  </div>

                  {/* Bottom row: votes & stats shimmer */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200/70 dark:border-zinc-800/50">
                    <div className="h-4 w-20 bg-zinc-200/80 dark:bg-zinc-800/70 rounded" />
                    <div className="flex gap-1.5">
                      <div className="h-6 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                      <div className="h-6 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                <AnimatePresence mode="popLayout">
                  {visibleItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout="position"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.22,
                        ease: "easeOut",
                        delay: idx < 12 ? (idx % 4) * 0.025 : 0
                      }}
                    >
                      <KeyCard
                        item={item}
                        lang={lang}
                        searchQuery={searchQuery}
                        isUsed={Boolean(item?.code && usedMap[item.code.toUpperCase().trim()])}
                        onVote={onVote}
                        onCopy={onCopy}
                        onOpenNusuk={onOpenNusuk}
                        onToggleUsed={onToggleUsed}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

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
            </div>
          ) : activeTab === "used" ? (
            /* Enhanced Empty State for Used tab with custom illustration */
            <motion.div
              key="empty-used"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center py-16 px-6 rounded-3xl bg-white/80 dark:bg-zinc-900/60 border border-dashed border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto shadow-xs"
            >
              {/* Pilgrimage History Illustration */}
              <div className="relative w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 rotate-6 border border-amber-500/20" />
                <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-amber-500 dark:text-amber-400 border border-zinc-200 dark:border-zinc-700">
                  <History className="w-8 h-8" />
                </div>
              </div>

              <h3 className={`text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-2 ${isAr ? "font-arabic" : ""}`}>
                {t.emptyUsed.title}
              </h3>
              <p className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto mb-6 leading-relaxed ${isAr ? "font-arabic" : ""}`}>
                {isAr
                  ? "انسخ أي رمز أو استخدمه وسيظهر هنا تلقائياً لتتبع مفاتيحك أثناء التسجيل."
                  : "Copy a key and it shows up here. Keep track of what you've tested during registration."}
              </p>

              <motion.button
                type="button"
                onClick={() => handleTabClick("all")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm text-white font-semibold shadow-sm transition-colors"
              >
                {isAr ? "استعراض جميع المفاتيح" : "Browse all keys"}
              </motion.button>
            </motion.div>
          ) : (
            /* Empty State for Search or other tabs */
            <motion.div
              key="empty-general"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center py-16 px-4 rounded-3xl bg-white/80 dark:bg-zinc-900/60 border border-dashed border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto shadow-xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-700/60 shadow-xs">
                <Inbox className="w-7 h-7" />
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
                  onPointerDown={(e) => {
                    if (e.pointerType === 'touch') onOpenSubmit();
                  }}
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

export const KeyGrid = React.memo(KeyGridComponent);
KeyGrid.displayName = "KeyGrid";
