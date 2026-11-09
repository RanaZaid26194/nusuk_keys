-- ============================================================
-- Supabase Atomic Counters Migration (File A - Run First)
-- Safe to run before deploying the client.
-- ============================================================

-- 1. Atomic function to increment copies count
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

-- 2. Atomic function to cast an upvote or downvote
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

-- 3. Grant execute privileges to public roles
GRANT EXECUTE ON FUNCTION increment_copy(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cast_vote(UUID, TEXT) TO anon, authenticated;
