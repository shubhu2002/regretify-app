import { createClient } from '@supabase/supabase-js';

// This client is SERVER-ONLY. It backs every /api route and must never be
// imported into client components — the service-role key bypasses RLS.
if (typeof window !== 'undefined') {
	throw new Error(
		'The Supabase client is server-only and must not be imported in browser code.',
	);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Prefer the service-role key (server-only secret). The public anon key is
// kept as a fallback so local dev keeps working until the env var is set,
// but with RLS enabled (migration 04) the anon key can no longer touch data.
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.',
	);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: { persistSession: false },
});
