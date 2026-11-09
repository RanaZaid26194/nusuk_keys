-- read-only verification queries to check challenge_keys table security in supabase sql editor.

-- 1. check active policies on challenge_keys (expected: exactly one SELECT and one INSERT policy, zero UPDATE or ALL)
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'challenge_keys';

-- 2. check if row level security is enabled on challenge_keys (expected: 1 row with rls_enabled = true)
select relname, relrowsecurity as rls_enabled
from pg_class
where relname = 'challenge_keys';

-- 3. check that the two atomic rpc functions exist and run as security definer (expected: 2 rows with security_definer = true)
select 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('increment_copy', 'cast_vote');
