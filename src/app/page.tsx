"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChallengeKey, FilterTab, Language, Stats } from "@/lib/types";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { KeyGrid } from "@/components/KeyGrid";
import { SubmitModal } from "@/components/SubmitModal";
import { InfoModal } from "@/components/InfoModal";
import { Footer } from "@/components/Footer";
import { supabase, isSupabaseConfigured, INITIAL_DEMO_KEYS } from "@/lib/supabase";
import { calculateSuccessRate } from "@/lib/utils";

const LOCAL_STORAGE_KEYS = "nusuk_keys_data_v1";
const LOCAL_STORAGE_CACHE = "nusuk_keys_cache_v2";
const LOCAL_STORAGE_VOTES = "nusuk_user_votes_v1";
const LOCAL_STORAGE_LANG = "nusuk_keys_lang_v1";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  
  // Instant Initial State via Local Cache (0ms on repeat visits)
  const [keys, setKeys] = useState<ChallengeKey[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_CACHE);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_CACHE);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return false;
        }
      } catch {}
    }
    return true;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("latest");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize Language & Direction
  useEffect(() => {
    setIsMounted(true);
    const savedLang = localStorage.getItem(LOCAL_STORAGE_LANG) as Language | null;
    if (savedLang === "en" || savedLang === "ar") {
      setLang(savedLang);
      document.documentElement.setAttribute("dir", savedLang === "ar" ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", savedLang);
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.documentElement.setAttribute("lang", "en");
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(LOCAL_STORAGE_LANG, newLang);
    document.documentElement.setAttribute("dir", newLang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", newLang);
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
            const deferSync = async () => {
              try {
                let accumulated: any[] = [...stage1Data];

                // ⭐ STAGE 2 (Background Sync): Next 500 keys (500 - 999)
                if (totalCount > 500) {
                  const { data: stage2Data } = await client
                    .from("challenge_keys")
                    .select("*")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false })
                    .range(500, Math.min(999, totalCount - 1));

                  if (stage2Data && stage2Data.length > 0) {
                    accumulated = accumulated.concat(stage2Data);
                    const stage2Mapped = accumulated.map((d: any) => ({
                      ...d,
                      userVoted: userVotes[d.id] || null,
                    }));
                    setKeys((prev) => (prev.length > stage2Mapped.length ? prev : stage2Mapped));
                  }
                }

                // Smooth delay between stages so UI remains responsive & rolling counter animates
                await new Promise((r) => setTimeout(r, 350));

                // ⭐ STAGE 3 (Background Sync): Next 500 keys (1,000 - 1,499)
                if (totalCount > 1000) {
                  const { data: stage3Data } = await client
                    .from("challenge_keys")
                    .select("*")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false })
                    .range(1000, Math.min(1499, totalCount - 1));

                  if (stage3Data && stage3Data.length > 0) {
                    accumulated = accumulated.concat(stage3Data);
                    const stage3Mapped = accumulated.map((d: any) => ({
                      ...d,
                      userVoted: userVotes[d.id] || null,
                    }));
                    setKeys((prev) => (prev.length > stage3Mapped.length ? prev : stage3Mapped));
                  }
                }

                // Smooth delay between stages so UI remains responsive & rolling counter animates
                await new Promise((r) => setTimeout(r, 450));

                // ⭐ STAGE 4 (Background Sync): All remaining keys (1,500 -> totalCount) in parallel
                if (totalCount > 1500) {
                  const remainingPromises = [];
                  for (let from = 1500; from < totalCount; from += 1000) {
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
                  for (const res of remainingResults) {
                    if (res.data && res.data.length > 0) {
                      accumulated = accumulated.concat(res.data);
                    }
                  }

                  const allMapped = accumulated.map((d: any) => ({
                    ...d,
                    userVoted: userVotes[d.id] || null,
                  }));
                  setKeys(allMapped);

                  try {
                    localStorage.setItem(LOCAL_STORAGE_CACHE, JSON.stringify(allMapped));
                  } catch {
                    try {
                      localStorage.setItem(LOCAL_STORAGE_CACHE, JSON.stringify(stage1Mapped));
                    } catch {}
                  }
                }
              } catch (e) {
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

    // Local / Offline fallback
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CACHE) || localStorage.getItem(LOCAL_STORAGE_KEYS);
      if (saved) {
        const parsed: ChallengeKey[] = JSON.parse(saved);
        setKeys(parsed.map(k => ({ ...k, userVoted: userVotes[k.id] || null })));
        setIsLoading(false);
        return;
      }
    } catch {
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
      const channel = client
        .channel("realtime-challenge-keys")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "challenge_keys" },
          () => {
            loadKeys();
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [loadKeys]);

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

  // Upvote / Downvote Handler
  const handleVote = async (keyId: string, type: 'UP' | 'DOWN') => {
    const userVotes = getUserVotes();
    if (userVotes[keyId]) return; // Already voted

    userVotes[keyId] = type;
    localStorage.setItem(LOCAL_STORAGE_VOTES, JSON.stringify(userVotes));

    // Optimistic UI update
    const updated = keys.map((k) => {
      if (k.id === keyId) {
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

    setKeys(updated);
    persistOfflineKeys(updated);

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const target = keys.find(k => k.id === keyId);
        if (target) {
          await supabase
            .from("challenge_keys")
            .update({
              upvotes: type === 'UP' ? target.upvotes + 1 : target.upvotes,
              downvotes: type === 'DOWN' ? target.downvotes + 1 : target.downvotes,
              last_verified_at: new Date().toISOString(),
            })
            .eq("id", keyId);
        }
      } catch (err) {
        console.error("Supabase vote update error:", err);
      }
    }
  };

  // Copy Count Increment
  const handleCopy = async (keyId: string) => {
    const updated = keys.map((k) => {
      if (k.id === keyId) {
        return { ...k, copies_count: k.copies_count + 1 };
      }
      return k;
    });

    setKeys(updated);
    persistOfflineKeys(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const target = keys.find(k => k.id === keyId);
        if (target) {
          await supabase
            .from("challenge_keys")
            .update({ copies_count: target.copies_count + 1 })
            .eq("id", keyId);
        }
      } catch (err) {
        console.error("Supabase copy count update error:", err);
      }
    }
  };

  // Submit New Key with Strict Duplicate Rejection
  const handleSubmitKey = async (code: string): Promise<{ success: boolean; error?: string }> => {
    const cleanCode = code.trim().toUpperCase();

    // 1. Instant local duplicate rejection
    const isLocalDuplicate = keys.some(k => k.code.trim().toUpperCase() === cleanCode);
    if (isLocalDuplicate) {
      return {
        success: false,
        error: lang === 'ar'
          ? 'هذا الرمز تمت إضافته مسبقاً وهو موجود بالفعل في القائمة!'
          : 'This key has already been added and is already active in the list!'
      };
    }

    // 2. Supabase duplicate check & insertion
    if (isSupabaseConfigured && supabase) {
      try {
        // Query Supabase directly in case another user added it from another device
        const { data: existingInDb } = await supabase
          .from("challenge_keys")
          .select("id, code")
          .ilike("code", cleanCode)
          .maybeSingle();

        if (existingInDb) {
          return {
            success: false,
            error: lang === 'ar'
              ? 'هذا الرمز تمت إضافته مسبقاً وهو موجود بالفعل في قاعدة البيانات!'
              : 'This key has already been added and is already live in the database!'
          };
        }

        // Insert into Supabase table
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

        if (insertError) {
          if (
            insertError.code === "23505" ||
            insertError.message?.toLowerCase().includes("duplicate") ||
            insertError.message?.toLowerCase().includes("unique")
          ) {
            return {
              success: false,
              error: lang === 'ar'
                ? 'هذا الرمز تمت إضافته مسبقاً وهو موجود بالفعل!'
                : 'This key has already been added and is already present!'
            };
          }
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

        const updated = [newKey, ...keys];
        setKeys(updated);

        const userVotes = getUserVotes();
        userVotes[newKey.id] = 'UP';
        localStorage.setItem(LOCAL_STORAGE_VOTES, JSON.stringify(userVotes));

        return { success: true };
      } catch (err: any) {
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

    const updated = [newKey, ...keys];
    setKeys(updated);
    persistOfflineKeys(updated);

    const userVotes = getUserVotes();
    userVotes[newKey.id] = 'UP';
    localStorage.setItem(LOCAL_STORAGE_VOTES, JSON.stringify(userVotes));

    return { success: true };
  };

  // Filter & Search Logic
  const filteredKeys = useMemo(() => {
    let list = [...keys];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(k => k.code.toLowerCase().includes(q));
    }

    // Tabs
    switch (activeTab) {
      case "verified":
        list = list.filter(k => calculateSuccessRate(k.upvotes, k.downvotes) >= 70 && k.upvotes >= 2);
        break;
      case "popular":
        list.sort((a, b) => b.copies_count - a.copies_count || b.upvotes - a.upvotes);
        break;
      case "latest":
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "all":
      default:
        // Default ranking: strictly newest to oldest
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return list;
  }, [keys, searchQuery, activeTab]);

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
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200 transition-colors">
      {/* Top Navbar */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onOpenSubmit={() => setIsSubmitModalOpen(true)}
        onOpenInfo={() => setIsInfoModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <Hero
          lang={lang}
          stats={stats}
          isConnectedToSupabase={isSupabaseConfigured}
          onOpenSubmit={() => setIsSubmitModalOpen(true)}
          onOpenInfo={() => setIsInfoModalOpen(true)}
        />

        <KeyGrid
          items={filteredKeys}
          isLoading={isLoading}
          lang={lang}
          searchQuery={searchQuery}
          activeTab={activeTab}
          onSearchChange={setSearchQuery}
          onTabChange={setActiveTab}
          onVote={handleVote}
          onCopy={handleCopy}
          onOpenSubmit={() => setIsSubmitModalOpen(true)}
        />
      </main>

      {/* Share Modal Dialog */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        lang={lang}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitKey}
      />

      {/* Noble Motivation (i) Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        lang={lang}
        onClose={() => setIsInfoModalOpen(false)}
        onOpenSubmit={() => setIsSubmitModalOpen(true)}
      />

      {/* Footer */}
      <Footer lang={lang} />
    </div>
  );
}
