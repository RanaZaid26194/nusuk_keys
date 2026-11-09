"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MotionConfig, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ChallengeKey, FilterTab, Language, Stats, SortOption } from "@/lib/types";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { KeyGrid } from "@/components/KeyGrid";
import { SubmitModal } from "@/components/SubmitModal";
import { InfoModal } from "@/components/InfoModal";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { supabase, isSupabaseConfigured, INITIAL_DEMO_KEYS } from "@/lib/supabase";
import { calculateSuccessRate } from "@/lib/utils";
import { loadUsedKeys, markUsed, unmarkUsed, clearUsedKeys, normalizeCode, STORAGE_KEY_USED } from "@/lib/usedKeys";
import { isValidKey, normalizeNumerals } from "@/lib/keyFormat";
import { translations } from "@/lib/translations";

const LOCAL_STORAGE_KEYS = "nusuk_keys_data_v1";
const LOCAL_STORAGE_CACHE = "nusuk_keys_cache_v2";
const LOCAL_STORAGE_VOTES = "nusuk_user_votes_v1";
const LOCAL_STORAGE_LANG = "nusuk_keys_lang_v1";
const LOCAL_STORAGE_COPY_COUNTED = "nusuk_copy_counted_v1";
const COPY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h soft anti-spam cooldown
const MAX_COPY_COUNTED_ENTRIES = 2000;

export default function Home()
{
  const [lang, setLang] = useState<Language>("en");
  const [keys, setKeys] = useState<ChallengeKey[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("latest");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLanguageFlipping, setIsLanguageFlipping] = useState(false);

  const handleOpenSubmitModal = useCallback(() => setIsSubmitModalOpen(true), []);
  const handleCloseSubmitModal = useCallback(() => setIsSubmitModalOpen(false), []);
  const handleOpenInfoModal = useCallback(() => setIsInfoModalOpen(true), []);
  const handleCloseInfoModal = useCallback(() => setIsInfoModalOpen(false), []);

  // local history for used keys
  const [usedMap, setUsedMap] = useState<Record<string, number>>({});
  const [usedSnapshot, setUsedSnapshot] = useState<Set<string>>(new Set());
  const [shouldPulseUsedBadge, setShouldPulseUsedBadge] = useState(false);

  // snapshot refresh and badge pulse
  const refreshUsedSnapshot = useCallback((targetTab?: FilterTab) =>
  {
    const currentTab = targetTab || activeTab;
    const currentMap = loadUsedKeys();
    setUsedMap(currentMap);
    const nextCodes = new Set(Object.keys(currentMap).map(c => normalizeCode(c)));

    setUsedSnapshot((prevSnapshot) =>
    {
      let hasLeavingKey = false;
      if (currentTab !== "used")
      {
        const currentCodes = Object.keys(currentMap);
        for (let i = 0; i < currentCodes.length; i++)
        {
          const code = normalizeCode(currentCodes[i]);
          if (!prevSnapshot.has(code))
          {
            hasLeavingKey = true;
            break;
          }
        }
      }

      if (hasLeavingKey)
      {
        setShouldPulseUsedBadge(true);
        setTimeout(() =>
        {
          setShouldPulseUsedBadge(false);
        }, 800);
      }

      return nextCodes;
    });
  }, [activeTab]);

  // load used keys after mount & attach tab sync listeners
  useEffect(() =>
  {
    const initialMap = loadUsedKeys();
    setUsedMap(initialMap);
    setUsedSnapshot(new Set(Object.keys(initialMap).map(c => normalizeCode(c))));

    const handleStorage = (e: StorageEvent) =>
    {
      if (e.key === STORAGE_KEY_USED)
      {
        const updatedMap = loadUsedKeys();
        setUsedMap(updatedMap);
        setUsedSnapshot(new Set(Object.keys(updatedMap).map(c => normalizeCode(c))));
      }
    };

    const handleFocus = () =>
    {
      refreshUsedSnapshot();
    };

    const handleVisibility = () =>
    {
      if (document.visibilityState === "visible")
      {
        refreshUsedSnapshot();
        loadKeys();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
    {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshUsedSnapshot]);

  // handle tab change with snapshot refresh
  const handleTabChange = (tab: FilterTab) =>
  {
    setActiveTab(tab);
    if (tab === "popular")
      setSortBy("copies");
    else if (tab === "latest")
      setSortBy("newest");
    refreshUsedSnapshot(tab);
  };

  // Post-mount hydration sync: restores local cache & saved language safely without SSR mismatch
  useEffect(() =>
  {
    setIsMounted(true);

    try
    {
      const cached = localStorage.getItem(LOCAL_STORAGE_CACHE);
      if (cached)
      {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0)
        {
          setKeys(parsed);
          setIsLoading(false);
        }
      }
    }
    catch {}

    const savedLang = localStorage.getItem(LOCAL_STORAGE_LANG) as Language | null;
    if (savedLang === "en" || savedLang === "ar")
    {
      setLang(savedLang);
      document.documentElement.setAttribute("dir", savedLang === "ar" ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", savedLang);
    }
    else
    {
      document.documentElement.setAttribute("dir", "ltr");
      document.documentElement.setAttribute("lang", "en");
    }
  }, []);

  // 150ms content fade before applying direction to prevent layout mirroring flash
  const handleLanguageChange = (newLang: Language) =>
  {
    if (newLang === lang)
      return;

    setIsLanguageFlipping(true);
    setTimeout(() =>
    {
      setLang(newLang);
      localStorage.setItem(LOCAL_STORAGE_LANG, newLang);
      document.documentElement.setAttribute("dir", newLang === "ar" ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", newLang);

      setTimeout(() =>
      {
        setIsLanguageFlipping(false);
      }, 50);
    }, 150);
  };

  // Load user votes map from localStorage
  const getUserVotes = useCallback((): Record<string, 'UP' | 'DOWN'> => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_VOTES);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  // Fetch initial keys with 4-stage progressive hydration
  const loadKeys = useCallback(async () => {
    const userVotes = getUserVotes();

    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        const STAGE_1_SIZE = 500;

        // ⭐ STAGE 1: Ultra-fast initial chunk (<100ms, 0 - 499 keys)
        const { data: stage1Data, count, error } = await client
          .from("challenge_keys")
          .select("*", { count: "exact" })
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .range(0, STAGE_1_SIZE - 1);

        if (error) {
          console.error("Supabase loadKeys error:", error);
        } else if (stage1Data && stage1Data.length > 0) {
          const totalCount = count || stage1Data.length;

          // Paint Stage 1 immediately in <100ms
          const stage1Mapped: ChallengeKey[] = stage1Data.map((d: any) => ({
            ...d,
            userVoted: userVotes[d.id] || null,
          }));

          setKeys((prev) => {
            if (prev.length > stage1Mapped.length) {
              const existingIds = new Set(stage1Mapped.map(k => k.id));
              const remainingOld = prev.filter(k => !existingIds.has(k.id));
              return [...stage1Mapped, ...remainingOld];
            }
            return stage1Mapped;
          });
          setIsLoading(false);

          // Save Stage 1 to local cache immediately
          try {
            localStorage.setItem(LOCAL_STORAGE_CACHE, JSON.stringify(stage1Mapped));
          } catch {}

          // If database has more than 500 keys, progressively hydrate Stages 2, 3, and 4 quietly in background
          if (totalCount > STAGE_1_SIZE) {
            const deferSync = async () =>
            {
              try
              {
                let accumulated: any[] = [...stage1Data];

                // safe merge helper to prevent overwriting optimistic votes or newly submitted keys
                const mergeIncoming = (prev: ChallengeKey[], incomingList: any[]) =>
                {
                  const currentVotes = getUserVotes();
                  const incomingIds = new Set(incomingList.map((d: any) => d.id));
                  const localOnly = prev.filter(k => !incomingIds.has(k.id));
                  const prevMap = new Map(prev.map(p => [p.id, p]));

                  const merged = incomingList.map((d: any) =>
                  {
                    const existing = prevMap.get(d.id);
                    return {
                      ...d,
                      userVoted: existing?.userVoted ?? currentVotes[d.id] ?? null,
                      copies_count: Math.max(d.copies_count || 0, existing?.copies_count || 0),
                      upvotes: Math.max(d.upvotes || 0, existing?.upvotes || 0),
                      downvotes: Math.max(d.downvotes || 0, existing?.downvotes || 0),
                    };
                  });

                  return [...localOnly, ...merged];
                };

                // ⭐ STAGE 2 (Background Sync): Next 500 keys (500 - 999)
                if (totalCount > 500)
                {
                  const { data: stage2Data } = await client
                    .from("challenge_keys")
                    .select("*")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false })
                    .range(500, Math.min(999, totalCount - 1));

                  if (stage2Data && stage2Data.length > 0)
                  {
                    accumulated = accumulated.concat(stage2Data);
                    setKeys((prev) => mergeIncoming(prev, accumulated));
                  }
                }

                // Smooth delay between stages so UI remains responsive & rolling counter animates
                await new Promise((r) => setTimeout(r, 350));

                // ⭐ STAGE 3 (Background Sync): Next 500 keys (1,000 - 1,499)
                if (totalCount > 1000)
                {
                  const { data: stage3Data } = await client
                    .from("challenge_keys")
                    .select("*")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false })
                    .range(1000, Math.min(1499, totalCount - 1));

                  if (stage3Data && stage3Data.length > 0)
                  {
                    accumulated = accumulated.concat(stage3Data);
                    setKeys((prev) => mergeIncoming(prev, accumulated));
                  }
                }

                // Smooth delay between stages so UI remains responsive & rolling counter animates
                await new Promise((r) => setTimeout(r, 450));

                // ⭐ STAGE 4 (Background Sync): All remaining keys (1,500 -> totalCount) in parallel
                if (totalCount > 1500)
                {
                  const remainingPromises = [];
                  for (let from = 1500; from < totalCount; from += 1000)
                  {
                    const to = Math.min(from + 999, totalCount - 1);
                    remainingPromises.push(
                      client
                        .from("challenge_keys")
                        .select("*")
                        .eq("is_active", true)
                        .order("created_at", { ascending: false })
                        .range(from, to)
                    );
                  }

                  const remainingResults = await Promise.all(remainingPromises);
                  for (const res of remainingResults)
                  {
                    if (res.data && res.data.length > 0)
                      accumulated = accumulated.concat(res.data);
                  }

                  setKeys((prev) =>
                  {
                    const allMerged = mergeIncoming(prev, accumulated);
                    try
                    {
                      localStorage.setItem(LOCAL_STORAGE_CACHE, JSON.stringify(allMerged));
                    }
                    catch
                    {
                      try
                      {
                        localStorage.setItem(LOCAL_STORAGE_CACHE, JSON.stringify(stage1Data));
                      }
                      catch {}
                    }
                    return allMerged;
                  });
                }
              }
              catch (e)
              {
                console.warn("Background hydration warning:", e);
              }
            };

            // Defer background stages until initial render & critical paints complete
            if (typeof window !== "undefined") {
              if ("requestIdleCallback" in window) {
                (window as any).requestIdleCallback(() => {
                  setTimeout(deferSync, 600);
                }, { timeout: 3000 });
              } else {
                setTimeout(deferSync, 1200);
              }
            }
          }
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local store:", err);
      }
    }

    // local / offline fallback
    try
    {
      const saved = localStorage.getItem(LOCAL_STORAGE_CACHE) || localStorage.getItem(LOCAL_STORAGE_KEYS);
      if (saved)
      {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed))
        {
          setKeys(parsed.map((k: any) => ({ ...k, userVoted: userVotes[k?.id] || null })));
          setIsLoading(false);
          return;
        }
      }
    }
    catch
    {
      // ignore
    }

    // Default seed
    setKeys(INITIAL_DEMO_KEYS.map(k => ({ ...k, userVoted: userVotes[k.id] || null })));
    setIsLoading(false);
  }, [getUserVotes]);

  useEffect(() => {
    loadKeys();

    // Supabase Realtime Subscription if configured
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      let throttleTimer: NodeJS.Timeout | null = null;

      const channel = client
        .channel("realtime-challenge-keys")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "challenge_keys" },
          (payload: any) => {
            // Direct in-place update for individual row edits (votes/copies)
            if (payload?.eventType === "UPDATE" && payload?.new?.id) {
              setKeys((prev) => {
                const currentVotes = getUserVotes();
                return prev.map((k) => {
                  if (k.id === payload.new.id) {
                    return {
                      ...k,
                      ...payload.new,
                      userVoted: k.userVoted ?? currentVotes[k.id] ?? null,
                    };
                  }
                  return k;
                });
              });
              return;
            }

            // For INSERT/DELETE, throttle loadKeys to avoid network waterfalls
            if (!throttleTimer) {
              throttleTimer = setTimeout(() => {
                throttleTimer = null;
                loadKeys();
              }, 2500);
            }
          }
        )
        .subscribe();

      return () => {
        if (throttleTimer)
          clearTimeout(throttleTimer);
        client.removeChannel(channel);
      };
    }
  }, [loadKeys, getUserVotes]);

  // Save to localStorage when in offline mode
  const persistOfflineKeys = (updated: ChallengeKey[]) => {
    if (!isSupabaseConfigured) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist keys locally", e);
      }
    }
  };

  // Upvote / Downvote Handler with optimistic update and rollback on failure
  const handleVote = useCallback(async (keyId: string, type: 'UP' | 'DOWN', codeParam?: string) =>
  {
    const userVotes = getUserVotes();
    if (userVotes[keyId])
      return; // Already voted

    userVotes[keyId] = type;
    localStorage.setItem(LOCAL_STORAGE_VOTES, JSON.stringify(userVotes));

    let votedCode = codeParam || "";
    if (!votedCode)
    {
      const found = keys.find(k => k.id === keyId);
      if (found?.code)
        votedCode = found.code;
    }

    if (votedCode)
    {
      const nextUsed = markUsed(votedCode);
      setUsedMap(nextUsed);
    }

    // Optimistic UI update
    setKeys((prevKeys) =>
    {
      const updated = prevKeys.map((k) =>
      {
        if (k.id === keyId)
        {
          const newUpvotes = type === 'UP' ? k.upvotes + 1 : k.upvotes;
          const newDownvotes = type === 'DOWN' ? k.downvotes + 1 : k.downvotes;
          return {
            ...k,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVoted: type,
          };
        }
        return k;
      });
      persistOfflineKeys(updated);
      return updated;
    });

    // Helper to rollback vote if server request fails
    const rollbackVote = () =>
    {
      const rollbackVotes = getUserVotes();
      delete rollbackVotes[keyId];
      localStorage.setItem(LOCAL_STORAGE_VOTES, JSON.stringify(rollbackVotes));
      setKeys((prevKeys) =>
      {
        const rolled = prevKeys.map((k) =>
        {
          if (k.id === keyId)
          {
            return {
              ...k,
              upvotes: type === 'UP' ? Math.max(0, k.upvotes - 1) : k.upvotes,
              downvotes: type === 'DOWN' ? Math.max(0, k.downvotes - 1) : k.downvotes,
              userVoted: null,
            };
          }
          return k;
        });
        persistOfflineKeys(rolled);
        return rolled;
      });
    };

    // Atomic server-side vote casting
    if (isSupabaseConfigured && supabase)
    {
      try
      {
        const { error } = await supabase.rpc("cast_vote", {
          p_key_id: keyId,
          p_type: type,
        });

        if (error)
        {
          console.error("Supabase cast_vote error:", error);
          rollbackVote();
        }
      }
      catch (err)
      {
        console.error("Supabase cast_vote exception:", err);
        rollbackVote();
      }
    }
  }, [getUserVotes, keys]);

  // Copy Count Increment with Soft Anti-Spam
  const handleCopy = useCallback(async (keyId: string, codeParam?: string) =>
  {
    let targetCode = codeParam || "";
    if (!targetCode)
    {
      const found = keys.find(k => k.id === keyId);
      if (found?.code)
        targetCode = found.code;
    }

    if (targetCode)
    {
      const nextUsed = markUsed(targetCode);
      setUsedMap(nextUsed);
    }

    // Soft anti-spam: count only once per key per 24 hours per browser
    let shouldCount = true;
    const cleanCode = targetCode ? normalizeCode(targetCode) : "";
    if (cleanCode)
    {
      try
      {
        const raw = localStorage.getItem(LOCAL_STORAGE_COPY_COUNTED);
        const map: Record<string, number> = raw ? JSON.parse(raw) : {};
        const lastCounted = map[cleanCode];
        const now = Date.now();

        if (lastCounted && now - lastCounted < COPY_COOLDOWN_MS)
          shouldCount = false;
        else
        {
          map[cleanCode] = now;
          const entries = Object.entries(map);
          let finalMap = map;
          if (entries.length > MAX_COPY_COUNTED_ENTRIES)
          {
            entries.sort((a, b) => b[1] - a[1]);
            finalMap = Object.fromEntries(entries.slice(0, MAX_COPY_COUNTED_ENTRIES));
          }
          localStorage.setItem(LOCAL_STORAGE_COPY_COUNTED, JSON.stringify(finalMap));
        }
      }
      catch
      {
        // storage disabled or quota exceeded
      }
    }

    if (!shouldCount)
      return;

    // Optimistic UI update
    setKeys((prevKeys) =>
    {
      const updated = prevKeys.map((k) =>
      {
        if (k.id === keyId)
          return { ...k, copies_count: (k.copies_count || 0) + 1 };
        return k;
      });
      persistOfflineKeys(updated);
      return updated;
    });

    // Atomic server-side counter increment
    if (isSupabaseConfigured && supabase)
    {
      try
      {
        const { error } = await supabase.rpc("increment_copy", {
          p_key_id: keyId,
        });

        if (error)
          console.error("Supabase increment_copy error:", error);
      }
      catch (err)
      {
        console.error("Supabase increment_copy exception:", err);
      }
    }
  }, []);

  // Open in Nusuk counts as used
  const handleOpenNusuk = useCallback((code: string) =>
  {
    const nextUsed = markUsed(code);
    setUsedMap(nextUsed);
  }, []);

  // Mark as unused sends key back to main tabs immediately
  const handleToggleUsed = useCallback((code: string) =>
  {
    const nextUsed = unmarkUsed(code);
    setUsedMap(nextUsed);
    const norm = normalizeCode(code);
    setUsedSnapshot((prev) =>
    {
      const next = new Set(prev);
      next.delete(norm);
      return next;
    });
  }, []);

  // Clear all used keys history
  const handleClearUsed = useCallback(() =>
  {
    clearUsedKeys();
    setUsedMap({});
    setUsedSnapshot(new Set());
  }, []);

  // Submit New Key with strict format check and case-insensitive duplicate rejection
  const handleSubmitKey = async (code: string): Promise<{ success: boolean; error?: string }> =>
  {
    const cleanCode = code.trim();

    // 0. strict format validation first before any duplicate check or network call
    if (!isValidKey(cleanCode))
      return {
        success: false,
        error: translations[lang].modal.errorFormat
      };

    // 1. Instant local duplicate rejection (case-insensitive)
    const isLocalDuplicate = keys.some(k => Boolean(k?.code && k.code.trim().toUpperCase() === cleanCode.toUpperCase()));
    if (isLocalDuplicate)
      return {
        success: false,
        error: lang === 'ar'
          ? 'هذا الرمز تمت إضافته مسبقاً وهو موجود بالفعل في القائمة!'
          : 'This key has already been added and is already active in the list!'
      };

    // 2. Supabase duplicate check & insertion
    if (isSupabaseConfigured && supabase)
    {
      try
      {
        // Query Supabase directly in case another user added it from another device
        const { data: existingInDb } = await supabase
          .from("challenge_keys")
          .select("id, code")
          .ilike("code", cleanCode)
          .maybeSingle();

        if (existingInDb)
          return {
            success: false,
            error: lang === 'ar'
              ? 'هذا الرمز تمت إضافته مسبقاً وهو موجود بالفعل في قاعدة البيانات!'
              : 'This key has already been added and is already live in the database!'
          };

        // Insert into Supabase table preserving case
        const { data: insertedData, error: insertError } = await supabase
          .from("challenge_keys")
          .insert([
            {
              code: cleanCode,
              upvotes: 1,
              downvotes: 0,
              copies_count: 0,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (insertError)
        {
          if (
            insertError.code === "23505" ||
            insertError.message?.toLowerCase().includes("duplicate") ||
            insertError.message?.toLowerCase().includes("unique")
          )
            return {
              success: false,
              error: lang === 'ar'
                ? 'هذا الرمز تمت إضافته مسبقاً وهو موجود بالفعل!'
                : 'This key has already been added and is already present!'
            };

          return {
            success: false,
            error: insertError.message || (lang === 'ar' ? 'فشل حفظ الرمز في قاعدة البيانات' : 'Failed to save key to database')
          };
        }

        // Add to local state with Supabase ID
        const newKey: ChallengeKey = {
          id: insertedData?.id || ("key-" + Date.now()),
          code: cleanCode,
          upvotes: 1,
          downvotes: 0,
          copies_count: 0,
          is_active: true,
          created_at: insertedData?.created_at || new Date().toISOString(),
          last_verified_at: new Date().toISOString(),
          userVoted: 'UP',
        };

        setKeys((prev) => [newKey, ...prev]);

        const userVotes = getUserVotes();
        userVotes[newKey.id] = 'UP';
        localStorage.setItem(LOCAL_STORAGE_VOTES, JSON.stringify(userVotes));

        return { success: true };
      }
      catch (err: any)
      {
        console.error("Supabase submission exception:", err);
        return {
          success: false,
          error: err?.message || (lang === 'ar' ? 'حدث خطأ في الاتصال بقاعدة البيانات' : 'Database connection error')
        };
      }
    }

    // 3. Fallback for offline/local-only mode
    const newKey: ChallengeKey = {
      id: "key-" + Date.now(),
      code: cleanCode,
      upvotes: 1,
      downvotes: 0,
      copies_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      last_verified_at: new Date().toISOString(),
      userVoted: 'UP',
    };

    setKeys((prev) =>
    {
      const updated = [newKey, ...prev];
      persistOfflineKeys(updated);
      return updated;
    });

    const userVotes = getUserVotes();
    userVotes[newKey.id] = 'UP';
    localStorage.setItem(LOCAL_STORAGE_VOTES, JSON.stringify(userVotes));

    return { success: true };
  };

  // Filter & Search Logic
  const filteredKeys = useMemo(() =>
  {
    let list = [...keys];
    const hasSearch = searchQuery.trim().length > 0;
    const q = normalizeNumerals(searchQuery.toLowerCase().trim());

    if (activeTab === "used")
    {
      // Show all keys that are in usedMap
      list = list.filter(k => Boolean(k?.code && usedMap[normalizeCode(k.code)]));

      if (hasSearch)
        list = list.filter(k => Boolean(k?.code && k.code.toLowerCase().includes(q)));

      if (sortBy === "copies")
        list.sort((a, b) => (b.copies_count || 0) - (a.copies_count || 0) || (b.upvotes || 0) - (a.upvotes || 0));
      else if (sortBy === "rating")
      {
        list.sort((a, b) =>
        {
          const rateA = calculateSuccessRate(a.upvotes, a.downvotes);
          const rateB = calculateSuccessRate(b.upvotes, b.downvotes);
          return rateB - rateA || (b.upvotes || 0) - (a.upvotes || 0);
        });
      }
      else
      {
        // Sort: most recently used first
        list.sort((a, b) =>
        {
          const timeA = (a?.code && usedMap[normalizeCode(a.code)]) || 0;
          const timeB = (b?.code && usedMap[normalizeCode(b.code)]) || 0;
          return timeB - timeA;
        });
      }

      return list;
    }

    // In the 4 main tabs:
    // If NO search query, filter out keys present in usedSnapshot
    if (!hasSearch)
      list = list.filter(k => Boolean(k?.code && !usedSnapshot.has(normalizeCode(k.code))));
    else
      list = list.filter(k => Boolean(k?.code && k.code.toLowerCase().includes(q)));

    // Tabs
    if (activeTab === "verified")
      list = list.filter(k => calculateSuccessRate(k.upvotes, k.downvotes) >= 75 && (k.upvotes || 0) >= 2);

    // Apply active SortOption across all standard tabs
    list.sort((a, b) =>
    {
      if (sortBy === "copies")
      {
        const diff = (b.copies_count || 0) - (a.copies_count || 0);
        if (diff !== 0)
          return diff;
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      if (sortBy === "rating")
      {
        const rateA = calculateSuccessRate(a.upvotes, a.downvotes);
        const rateB = calculateSuccessRate(b.upvotes, b.downvotes);
        if (rateB !== rateA)
          return rateB - rateA;
        return (b.upvotes || 0) - (a.upvotes || 0);
      }
      // 'newest' (default)
      const timeA = a?.created_at ? new Date(a.created_at).getTime() || 0 : 0;
      const timeB = b?.created_at ? new Date(b.created_at).getTime() || 0 : 0;
      return timeB - timeA;
    });

    return list;
  }, [keys, searchQuery, activeTab, sortBy, usedMap, usedSnapshot]);

  // Derived counts for used keys
  const usedCount = useMemo(() =>
  {
    return Object.keys(usedMap).length;
  }, [usedMap]);

  const hasUnvotedUsedKeys = useMemo(() =>
  {
    return keys.some(k => Boolean(usedMap[normalizeCode(k.code)]) && !k.userVoted);
  }, [keys, usedMap]);

  // Exact Real-Time Statistics Calculation (Strict math, zero hallucination)
  const stats: Stats = useMemo(() => {
    const totalKeys = keys.length;
    const totalCopies = keys.reduce((acc, k) => acc + (k.copies_count || 0), 0);
    const totalUpvotes = keys.reduce((acc, k) => acc + (k.upvotes || 0), 0);
    const totalDownvotes = keys.reduce((acc, k) => acc + (k.downvotes || 0), 0);
    const totalVotes = totalUpvotes + totalDownvotes;

    const successRate = totalVotes > 0 ? Math.round((totalUpvotes / totalVotes) * 100) : 100;

    return {
      totalKeys,
      activeKeys: keys.filter(k => k.is_active).length,
      totalCopies,
      successRate,
    };
  }, [keys]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors">
        {/* Top Navbar */}
        <Header
          lang={lang}
          onLanguageChange={handleLanguageChange}
          onOpenSubmit={handleOpenSubmitModal}
          onOpenInfo={handleOpenInfoModal}
        />

        {/* Main Content Area with smooth 150ms language crossfade */}
        <main className={`flex-1 transition-opacity duration-150 ease-out ${isLanguageFlipping ? "opacity-0" : "opacity-100"}`}>
          <Hero
            lang={lang}
            stats={stats}
            isConnectedToSupabase={isSupabaseConfigured}
            onOpenSubmit={handleOpenSubmitModal}
            onOpenInfo={handleOpenInfoModal}
          />

          <KeyGrid
            items={filteredKeys}
            isLoading={isLoading}
            lang={lang}
            searchQuery={searchQuery}
            activeTab={activeTab}
            sortBy={sortBy}
            usedMap={usedMap}
            usedCount={usedCount}
            shouldPulseUsedBadge={shouldPulseUsedBadge}
            hasUnvotedUsedKeys={hasUnvotedUsedKeys}
            onSearchChange={setSearchQuery}
            onTabChange={handleTabChange}
            onSortChange={setSortBy}
            onVote={handleVote}
            onCopy={handleCopy}
            onOpenSubmit={handleOpenSubmitModal}
            onOpenNusuk={handleOpenNusuk}
            onToggleUsed={handleToggleUsed}
            onClearUsed={handleClearUsed}
          />
        </main>

        {/* Mobile Floating Action Button (Bottom right / RTL bottom left, safe area aware) */}
        <div className="fixed bottom-5 right-4 rtl:right-auto rtl:left-4 z-40 sm:hidden pb-[env(safe-area-inset-bottom)]">
          <motion.button
            type="button"
            onClick={handleOpenSubmitModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/30 border border-emerald-400/30 backdrop-blur-md transition-colors"
            aria-label={translations[lang].shareCodeBtn}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className={lang === "ar" ? "font-arabic" : ""}>{translations[lang].shareCodeBtn}</span>
          </motion.button>
        </div>

        {/* Floating Back to Top Button */}
        <BackToTop lang={lang} />

        {/* Gentle PWA Install Prompt */}
        <PWAInstallPrompt lang={lang} />

        {/* Share Modal Dialog */}
        <SubmitModal
          isOpen={isSubmitModalOpen}
          lang={lang}
          onClose={handleCloseSubmitModal}
          onSubmit={handleSubmitKey}
        />

        {/* Noble Motivation (i) Modal */}
        <InfoModal
          isOpen={isInfoModalOpen}
          lang={lang}
          onClose={handleCloseInfoModal}
          onOpenSubmit={handleOpenSubmitModal}
        />

        {/* Footer */}
        <Footer lang={lang} />
      </div>
    </MotionConfig>
  );
}
