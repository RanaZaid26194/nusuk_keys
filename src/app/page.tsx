"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChallengeKey, FilterTab, Language, Stats } from "@/lib/types";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { KeyGrid } from "@/components/KeyGrid";
import { SubmitModal } from "@/components/SubmitModal";
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
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
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

  // Fetch initial keys
  const loadKeys = useCallback(async () => {
    const userVotes = getUserVotes();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("challenge_keys")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: ChallengeKey[] = data.map((d: any) => ({
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

  // Submit New Key
  const handleSubmitKey = async (code: string): Promise<{ success: boolean; error?: string }> => {
    const cleanCode = code.trim().toUpperCase();

    // Duplicate check
    const existing = keys.find(k => k.code.toUpperCase() === cleanCode);
    if (existing) {
      return { success: false, error: lang === 'ar' ? 'هذا الرمز تمت مشاركته مسبقاً' : 'This code has already been shared.' };
    }

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

    // Optimistically prepend
    const updated = [newKey, ...keys];
    setKeys(updated);
    persistOfflineKeys(updated);

    // Save user's own upvote
    const userVotes = getUserVotes();
    userVotes[newKey.id] = 'UP';
    localStorage.setItem(LOCAL_STORAGE_VOTES, JSON.stringify(userVotes));

    // Push to Supabase if live
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("challenge_keys").insert([
          {
            code: cleanCode,
            upvotes: 1,
            downvotes: 0,
            copies_count: 0,
            is_active: true,
          },
        ]);
        if (error) {
          console.error("Supabase insert error:", error);
        }
      } catch (err) {
        console.error("Supabase insert exception:", err);
      }
    }

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
        // Default sort: verified & recent first
        list.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
    }

    return list;
  }, [keys, searchQuery, activeTab]);

  // Overall Statistics Calculation
  const stats: Stats = useMemo(() => {
    const totalKeys = keys.length;
    const totalCopies = keys.reduce((acc, k) => acc + k.copies_count, 0);
    const totalUpvotes = keys.reduce((acc, k) => acc + k.upvotes, 0);
    const totalDownvotes = keys.reduce((acc, k) => acc + k.downvotes, 0);
    const successRate = calculateSuccessRate(totalUpvotes, totalDownvotes);

    return {
      totalKeys,
      activeKeys: keys.filter(k => k.is_active).length,
      totalCopies,
      successRate: isNaN(successRate) ? 98 : successRate,
    };
  }, [keys]);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#07130f] text-slate-100">
      {/* Top Navbar */}
      <Header
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onOpenSubmit={() => setIsSubmitModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <Hero
          lang={lang}
          stats={stats}
          onOpenSubmit={() => setIsSubmitModalOpen(true)}
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

      {/* Footer */}
      <Footer lang={lang} />
    </div>
  );
}
