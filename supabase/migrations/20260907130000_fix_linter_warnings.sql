-- Legal Operations Intake — fix Supabase database linter warnings
-- 1. set_updated_at(): pin search_path (function_search_path_mutable warning)
-- 2. log_status_transition(): revoke direct execute so it can only run via
--    the trigger on requests, not be called directly by a client.

alter function set_updated_at() set search_path = public;

revoke execute on function log_status_transition() from public, anon, authenticated;
