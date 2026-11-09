-- ============================================================
-- Nusuk Keys Database Schema for Supabase
-- Paste and run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Create table for challenge keys
CREATE TABLE IF NOT EXISTS challenge_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    upvotes INT DEFAULT 1,
    downvotes INT DEFAULT 0,
    copies_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for fast sorting
CREATE INDEX IF NOT EXISTS idx_challenge_keys_active 
ON challenge_keys (is_active, created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE challenge_keys ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies
DROP POLICY IF EXISTS "Allow public read active keys" ON challenge_keys;
CREATE POLICY "Allow public read active keys" 
ON challenge_keys FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow public submit new keys" ON challenge_keys;
CREATE POLICY "Allow public submit new keys" 
ON challenge_keys FOR INSERT WITH CHECK (code ~ '^NG-[A-Za-z0-9_-]+$');

DROP POLICY IF EXISTS "Allow public update voting and copies" ON challenge_keys;
CREATE POLICY "Allow public update voting and copies" 
ON challenge_keys FOR UPDATE USING (true);

-- 5. Enable Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'challenge_keys'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE challenge_keys;
  END IF;
END $$;

-- 6. Insert initial seed keys so table is populated immediately
INSERT INTO challenge_keys (code, upvotes, downvotes, copies_count, is_active, created_at)
VALUES 
  ('NG-SBs90X', 42, 1, 189, true, NOW() - INTERVAL '18 minutes'),
  ('NG-UMR2026', 28, 2, 112, true, NOW() - INTERVAL '45 minutes'),
  ('NG-MECCA77', 19, 0, 85, true, NOW() - INTERVAL '2 hours'),
  ('NG-MADINA44', 14, 1, 67, true, NOW() - INTERVAL '4 hours'),
  ('NG-RAWDAH9', 9, 0, 41, true, NOW() - INTERVAL '6 hours'),
  ('NG-HAJJ786', 6, 3, 32, true, NOW() - INTERVAL '10 hours')
ON CONFLICT (code) DO NOTHING;
