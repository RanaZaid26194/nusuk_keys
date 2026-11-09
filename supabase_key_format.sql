-- migration: enforce strict 8-character alphanumeric format for nusuk challenge keys.
-- not run by me, run it yourself in supabase sql editor.

-- 1. Add CHECK constraint challenge_keys_code_format as NOT VALID so future writes are strictly guarded immediately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'challenge_keys_code_format'
  ) THEN
    ALTER TABLE public.challenge_keys 
    ADD CONSTRAINT challenge_keys_code_format 
    CHECK (code ~ '^NG-[A-Za-z0-9]{8}$') NOT VALID;
  END IF;
END $$;

-- 2. Validate constraint on existing table rows (safe to run multiple times)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'challenge_keys_code_format' AND NOT convalidated
  ) THEN
    ALTER TABLE public.challenge_keys 
    VALIDATE CONSTRAINT challenge_keys_code_format;
  END IF;
END $$;

-- 3. Update public INSERT policy to strictly enforce ^NG-[A-Za-z0-9]{8}$ format and counter integrity
DROP POLICY IF EXISTS "Allow public submit new keys" ON public.challenge_keys;

CREATE POLICY "Allow public submit new keys"
ON public.challenge_keys FOR INSERT
WITH CHECK (
  code ~ '^NG-[A-Za-z0-9]{8}$'
  AND upvotes = 1
  AND downvotes = 0
  AND copies_count = 0
  AND is_active = true
);
