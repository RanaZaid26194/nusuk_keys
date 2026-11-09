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
const LOCAL_STORAGE_VOTES = "nusuk_user_votes_v1";
const LOCAL_STORAGE_LANG = "nusuk_keys_lang_v1";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [keys, setKeys] = useState<ChallengeKey[]>([]);
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
    } else {
      document.documentElement.setAttribute("dir", "ltr");
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(LOCAL_STORAGE_LANG, newLang);
    document.documentElement.setAttribute("dir", newLang === "ar" ? "rtl" : "ltr");
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

  // Fetch initial keys with multi-page batching (to fetch all 6,000+ keys beyond 1,000 PostgREST limit)
  const loadKeys = useCallback(async () => {
    const userVotes = getUserVotes();

    if (isSupabaseConfigured && supabase) {
      try {
        const BATCH_SIZE = 1000;

        // 1. Fetch first batch with exact count from Postgres
        const { data: firstBatch, count, error } = await supabase
          .from("challenge_keys")
          .select("*", { count: "exact" })
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .range(0, BATCH_SIZE - 1);

        if (error) {
          console.error("Supabase loadKeys error:", error);
        } else if (firstBatch) {
          const totalCount = count || firstBatch.length;
          let combinedData: any[] = [...firstBatch];

          // 2. If there are more than 1,000 keys (e.g. ~6,000 keys), fetch all remaining batches in parallel
          if (totalCount > BATCH_SIZE) {
            const batchPromises = [];
            for (let from = BATCH_SIZE; from < totalCount; from += BATCH_SIZE) {
              const to = Math.min(from + BATCH_SIZE - 1, totalCount - 1);
              batchPromises.push(
                supabase
                  .from("challenge_keys")
                  .select("*")
                  .eq("is_active", true)
                  .order("created_at", { ascending: false })
                  .range(from, to)
              );
            }

            const results = await Promise.all(batchPromises);
            for (const res of results) {
              if (res.data && res.data.length > 0) {
                combinedData = combinedData.concat(res.data);
              }
            }
          }

          const mapped: ChallengeKey[] = combinedData.map((d: any) => ({
            ...d,
            userVoted: userVotes[d.id] || null,
          }));
          setKeys(mapped);
          return;
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local store:", err);
      }
    }

    // Local / Offline fallback
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS);
      if (saved) {
        const parsed: ChallengeKey[] = JSON.parse(saved);
        setKeys(parsed.map(k => ({ ...k, userVoted: userVotes[k.id] || null })));
        return;
      }
    } catch {
      // ignore
    }

    // Default seed
    setKeys(INITIAL_DEMO_KEYS.map(k => ({ ...k, userVoted: userVotes[k.id] || null })));
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

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-200">
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
