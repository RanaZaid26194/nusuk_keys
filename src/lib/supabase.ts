import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChallengeKey } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== 'your_supabase_anon_key_here';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial seed codes for instant demo/offline mode
export const INITIAL_DEMO_KEYS: ChallengeKey[] = [
  {
    id: "key-1",
    code: "NG-SBs90X",
    upvotes: 42,
    downvotes: 1,
    copies_count: 189,
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    last_verified_at: new Date().toISOString(),
  },
  {
    id: "key-2",
    code: "NG-UMR2026",
    upvotes: 28,
    downvotes: 2,
    copies_count: 112,
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    last_verified_at: new Date().toISOString(),
  },
  {
    id: "key-3",
    code: "NG-MECCA77",
    upvotes: 19,
    downvotes: 0,
    copies_count: 85,
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    last_verified_at: new Date().toISOString(),
  },
  {
    id: "key-4",
    code: "NG-MADINA44",
    upvotes: 14,
    downvotes: 1,
    copies_count: 67,
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    last_verified_at: new Date().toISOString(),
  },
  {
    id: "key-5",
    code: "NG-RAWDAH9",
    upvotes: 9,
    downvotes: 0,
    copies_count: 41,
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    last_verified_at: new Date().toISOString(),
  },
  {
    id: "key-6",
    code: "NG-HAJJ786",
    upvotes: 6,
    downvotes: 3,
    copies_count: 32,
    is_active: true,
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    last_verified_at: new Date().toISOString(),
  },
];
