import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Server-only client: uses the service role key to bypass RLS.
// Safe here because it's never imported from client components —
// only from route handlers (src/app/api/**/route.ts).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// MVP is single-user (no login yet — see CLAUDE.md Fase 2 for multi-user auth).
// All rows are scoped to this fixed id until Supabase Auth is wired up.
export const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000001';
