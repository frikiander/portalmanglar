import { createClient, type SupabaseClient, type Session, type User as SupabaseUser } from '@supabase/supabase-js';

// ─── Supabase Client ───────────────────────────────────────────────────────────
// Reads from Vite env vars. Falls back to empty strings so the app
// boots in demo/mock mode when credentials are not yet configured.
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  ?? '';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseKey);

// Create a real client when credentials are present, or a stub-compatible
// object when running in demo mode (avoids runtime crashes).
export const supabase: SupabaseClient = SUPABASE_CONFIGURED
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (createNullClient() as unknown as SupabaseClient);

// ─── Auth Helpers ──────────────────────────────────────────────────────────────

/**
 * Initiates Google OAuth sign-in via Supabase.
 * The user is redirected to Google and returns to the app with a session.
 * Requires SUPABASE to be configured.
 */
export async function signInWithGoogle(): Promise<void> {
  if (!SUPABASE_CONFIGURED) {
    console.warn('[Supabase] Credentials not configured. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        prompt: 'select_account', // Always show the Google account selector
      },
    },
  });
  if (error) throw error;
}

/**
 * Signs the current user out of Supabase.
 */
export async function signOut(): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Returns the current active session (if any).
 */
export async function getSession(): Promise<Session | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Subscribes to auth state changes (login / logout / token refresh).
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): () => void {
  if (!SUPABASE_CONFIGURED) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

// ─── Database Helpers ──────────────────────────────────────────────────────────

/**
 * Fetch all rows from the `users` table.
 * Returns null if Supabase is not configured.
 */
export async function fetchUsers() {
  if (!SUPABASE_CONFIGURED) return null;
  const { data, error } = await supabase.from('users').select('*');
  if (error) { console.warn('[Supabase] fetchUsers error:', error.message); return null; }
  return data;
}

/**
 * Upsert (insert or update) a user row.
 */
export async function upsertUser(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('users').upsert(row, { onConflict: 'id' });
  if (error) console.warn('[Supabase] upsertUser error:', error.message);
}

/**
 * Delete a user row by id.
 */
export async function removeUser(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeUser error:', error.message);
}

/**
 * Fetch all rows from the `subjects` table.
 */
export async function fetchSubjects() {
  if (!SUPABASE_CONFIGURED) return null;
  const { data, error } = await supabase.from('subjects').select('*');
  if (error) { console.warn('[Supabase] fetchSubjects error:', error.message); return null; }
  return data;
}

/**
 * Upsert a subject row.
 */
export async function upsertSubject(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('subjects').upsert(row, { onConflict: 'id' });
  if (error) console.warn('[Supabase] upsertSubject error:', error.message);
}

/**
 * Delete a subject row by id.
 */
export async function removeSubject(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeSubject error:', error.message);
}

// ─── Internal: Null/stub client for demo mode ──────────────────────────────────
// Returns an object that mimics the SupabaseClient shape just enough to
// prevent crashes when credentials are absent. All real operations are
// guarded by SUPABASE_CONFIGURED checks in the helpers above.
function createNullClient() {
  return {
    auth: {
      signInWithOAuth: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: async () => ({ data: [], error: null }),
      upsert: async () => ({ data: null, error: null }),
      delete: () => ({ eq: async () => ({ data: null, error: null }) }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
    }),
  };
}

export type { Session, SupabaseUser };
