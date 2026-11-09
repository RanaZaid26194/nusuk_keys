-- ============================================================
-- Supabase Lockdown Migration (File B - Run AFTER Client Deploy)
-- Drops the broad public UPDATE policy so clients cannot directly
-- overwrite upvotes, downvotes, or copies_count.
-- Atomic RPC functions (SECURITY DEFINER) continue working seamlessly.
-- ============================================================

-- Drop broad update policy
DROP POLICY IF EXISTS "Allow public update voting and copies" ON challenge_keys;

-- Note:
-- "Allow public read active keys" (SELECT) and
-- "Allow public submit new keys" (INSERT)
-- remain active and untouched.
