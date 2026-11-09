-- fresh database setup for nusuk keys.
-- all counter updates (copies, upvotes, downvotes) go strictly through the two security definer rpcs below.
-- never grant UPDATE or ALL to anon here.

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

-- 4. Set RLS Policies (select and insert only, no update policies)
DROP POLICY IF EXISTS "Allow public read active keys" ON challenge_keys;
CREATE POLICY "Allow public read active keys" 
ON challenge_keys FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow public submit new keys" ON challenge_keys;
CREATE POLICY "Allow public submit new keys" 
ON challenge_keys FOR INSERT WITH CHECK (
  code ~ '^NG-[A-Za-z0-9_-]+$'
  AND upvotes = 1
  AND downvotes = 0
  AND copies_count = 0
  AND is_active = true
);

-- 5. Atomic RPC Server-Side Functions (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION increment_copy(p_key_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count INT;
BEGIN
  UPDATE challenge_keys
  SET copies_count = COALESCE(copies_count, 0) + 1
  WHERE id = p_key_id AND is_active = true
  RETURNING copies_count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

CREATE OR REPLACE FUNCTION cast_vote(p_key_id UUID, p_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_upvotes INT;
  v_downvotes INT;
BEGIN
  -- Validate vote type strictly
  IF p_type NOT IN ('UP', 'DOWN') THEN
    RAISE EXCEPTION 'Invalid vote type: %. Must be UP or DOWN.', p_type;
  END IF;

  IF p_type = 'UP' THEN
    UPDATE challenge_keys
    SET upvotes = COALESCE(upvotes, 0) + 1,
        last_verified_at = NOW()
    WHERE id = p_key_id AND is_active = true
    RETURNING upvotes, downvotes INTO v_upvotes, v_downvotes;
  ELSE
    UPDATE challenge_keys
    SET downvotes = COALESCE(downvotes, 0) + 1,
        last_verified_at = NOW()
    WHERE id = p_key_id AND is_active = true
    RETURNING upvotes, downvotes INTO v_upvotes, v_downvotes;
  END IF;

  RETURN jsonb_build_object(
    'id', p_key_id,
    'upvotes', v_upvotes,
    'downvotes', v_downvotes
  );
END;
$$;

-- Grant execution privileges to anon and authenticated users
GRANT EXECUTE ON FUNCTION increment_copy(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cast_vote(UUID, TEXT) TO anon, authenticated;

-- 6. Enable Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'challenge_keys'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE challenge_keys;
  END IF;
END $$;

-- 7. Insert initial seed keys so table is populated immediately
INSERT INTO challenge_keys (code, upvotes, downvotes, copies_count, is_active, created_at)
VALUES 
  ('NG-SBs90X', 42, 1, 189, true, NOW() - INTERVAL '18 minutes'),
  ('NG-UMR2026', 28, 2, 112, true, NOW() - INTERVAL '45 minutes'),
  ('NG-MECCA77', 19, 0, 85, true, NOW() - INTERVAL '2 hours'),
  ('NG-MADINA44', 14, 1, 67, true, NOW() - INTERVAL '4 hours'),
  ('NG-RAWDAH9', 9, 0, 41, true, NOW() - INTERVAL '6 hours'),
  ('NG-HAJJ786', 6, 3, 32, true, NOW() - INTERVAL '10 hours')
ON CONFLICT (code) DO NOTHING;
