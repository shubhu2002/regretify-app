-- =========================================================
-- Security hardening: enable Row Level Security everywhere.
--
-- The app's API routes talk to the database with the
-- SERVICE ROLE key (which bypasses RLS), so no policies are
-- defined here on purpose: with RLS enabled and zero
-- policies, the public anon key — which ships in the
-- browser bundle — can no longer read or write ANY row via
-- the Supabase REST API.
--
-- Run this in the Supabase SQL editor, and set
-- SUPABASE_SERVICE_ROLE_KEY in the server environment
-- (never expose it with a NEXT_PUBLIC_ prefix).
-- =========================================================

ALTER TABLE "regretify-users"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "regretify-incomes"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "regretify-expenses"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "regretify-ledger"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "regretify-ledger-books"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "regretify-ledger-entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "regretify-notes"          ENABLE ROW LEVEL SECURITY;
