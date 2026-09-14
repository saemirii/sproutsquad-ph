-- Buyers had no way to set a real contact number anywhere in the app, so
-- checkout always fell back to a hardcoded placeholder
-- ('0917-888-2345') on every order. Adds a real column for it, mirroring
-- how `avatar` was bolted onto `profiles` earlier (see schema.sql:144).
alter table public.profiles add column if not exists contact_number text;

-- No RLS change needed — the existing "Users can update their own profile"
-- policy (schema.sql, `for update using (auth.uid() = id)`) already covers
-- this column, and get_initial_app_data() (migration_18) selects the whole
-- profiles row via to_jsonb(pr), so it picks this up automatically too.
