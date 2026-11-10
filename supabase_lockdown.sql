-- drops every UPDATE or ALL policy on challenge_keys so anon can never overwrite counters directly.
-- all writes go through increment_copy and cast_vote. safe to run multiple times.

alter table public.challenge_keys enable row level security;

do $$
declare
  r record;
begin
  for r in (
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'challenge_keys'
      and cmd in ('UPDATE', 'ALL')
  ) loop
    execute format('drop policy if exists %I on public.challenge_keys', r.policyname);
  end loop;
end $$;

-- direct table update revoked, counters only change through rpc
revoke update on public.challenge_keys from anon, authenticated;

-- show remaining policies (should only be select and insert)
select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'challenge_keys';
