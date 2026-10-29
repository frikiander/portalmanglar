import { createClient, type SupabaseClient, type Session, type User as SupabaseUser } from '@supabase/supabase-js';

// ─── Supabase Client ───────────────────────────────────────────────────────────
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  ?? '';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient = SUPABASE_CONFIGURED
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (createNullClient() as unknown as SupabaseClient);

// ─── Write errors ─────────────────────────────────────────────────────────────
// Writes are fire-and-forget from the UI, so failures are reported through one listener
// (the context shows a toast). Row Level Security rejections come back as code 42501.

export type WriteErrorKind = 'permission' | 'other';
type WriteErrorListener = (kind: WriteErrorKind, message: string, operation: string) => void;
let writeErrorListener: WriteErrorListener | null = null;

export function setWriteErrorListener(listener: WriteErrorListener | null) {
  writeErrorListener = listener;
}

function reportWriteError(operation: string, error: { message: string; code?: string }) {
  console.warn(`[Supabase] ${operation} error:`, error.message);
  const kind: WriteErrorKind =
    error.code === '42501' || /row-level security|permission denied|Solo Coordinación|ya fue (aprobada|auditad)/i.test(error.message)
      ? 'permission'
      : 'other';
  writeErrorListener?.(kind, error.message, operation);
}

// ─── Auth Helpers ──────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  if (!SUPABASE_CONFIGURED) {
    console.warn('[Supabase] Credentials not configured.');
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): () => void {
  if (!SUPABASE_CONFIGURED) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export async function fetchUsers() {
  if (!SUPABASE_CONFIGURED) return null;
  const { data, error } = await supabase.from('users').select('*');
  if (error) { console.warn('[Supabase] fetchUsers error:', error.message); return null; }
  return data;
}

/** The portal user for a signed-in email, or null when it is not registered. Throws on network/server errors. */
export async function fetchUserByEmail(email: string) {
  if (!SUPABASE_CONFIGURED) return null;
  // ilike = case-insensitive match; escape its wildcards so "a_b@x" only matches itself
  const pattern = email.trim().replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data, error } = await supabase.from('users').select('*').ilike('email', pattern).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertUser(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('users').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertUser', error);
}

export async function removeUser(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) reportWriteError('removeUser', error);
}

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────
export async function fetchSubjects() {
  if (!SUPABASE_CONFIGURED) return null;
  const { data, error } = await supabase.from('subjects').select('*');
  if (error) { console.warn('[Supabase] fetchSubjects error:', error.message); return null; }
  return data;
}

export async function upsertSubject(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('subjects').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertSubject', error);
}

export async function removeSubject(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) reportWriteError('removeSubject', error);
}

// ─── COMPETENCIES ─────────────────────────────────────────────────────────────
export async function fetchCompetencies() {
  if (!SUPABASE_CONFIGURED) return null;
  const { data, error } = await supabase.from('competencies').select('*');
  if (error) { console.warn('[Supabase] fetchCompetencies error:', error.message); return null; }
  return data;
}

export async function upsertCompetency(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('competencies').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertCompetency', error);
}

/** Saves many competencies in one request (batch import). */
export async function upsertCompetencies(rows: Record<string, unknown>[]) {
  if (!SUPABASE_CONFIGURED || rows.length === 0) return;
  const { error } = await supabase.from('competencies').upsert(rows, { onConflict: 'id' });
  if (error) reportWriteError('upsertCompetencies', error);
}

export async function removeCompetency(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('competencies').delete().eq('id', id);
  if (error) reportWriteError('removeCompetency', error);
}

// ─── LESSON PLANS ─────────────────────────────────────────────────────────────
export async function fetchLessonPlans(schoolYear?: string) {
  if (!SUPABASE_CONFIGURED) return null;
  let query = supabase.from('lesson_plans').select('*');
  if (schoolYear) query = query.eq('school_year', schoolYear);
  const { data, error } = await query;
  if (error) { console.warn('[Supabase] fetchLessonPlans error:', error.message); return null; }
  return data;
}

export async function upsertLessonPlan(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('lesson_plans').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertLessonPlan', error);
}

export async function removeLessonPlan(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('lesson_plans').delete().eq('id', id);
  if (error) reportWriteError('removeLessonPlan', error);
}

// ─── SCHOOL EVENTS ────────────────────────────────────────────────────────────
export async function fetchSchoolEvents() {
  if (!SUPABASE_CONFIGURED) return null;
  const { data, error } = await supabase.from('school_events').select('*');
  if (error) { console.warn('[Supabase] fetchSchoolEvents error:', error.message); return null; }
  return data;
}

export async function upsertSchoolEvent(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('school_events').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertSchoolEvent', error);
}

export async function removeSchoolEvent(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('school_events').delete().eq('id', id);
  if (error) reportWriteError('removeSchoolEvent', error);
}

// ─── CLASSROOM PROJECTS ───────────────────────────────────────────────────────
export async function fetchClassroomProjects(schoolYear?: string) {
  if (!SUPABASE_CONFIGURED) return null;
  let query = supabase.from('classroom_projects').select('*');
  if (schoolYear) query = query.eq('school_year', schoolYear);
  const { data, error } = await query;
  if (error) { console.warn('[Supabase] fetchClassroomProjects error:', error.message); return null; }
  return data;
}

export async function upsertClassroomProject(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('classroom_projects').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertClassroomProject', error);
}

export async function removeClassroomProject(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('classroom_projects').delete().eq('id', id);
  if (error) reportWriteError('removeClassroomProject', error);
}

// ─── DUTY SLOTS ───────────────────────────────────────────────────────────────
export async function fetchDutySlots(schoolYear?: string) {
  if (!SUPABASE_CONFIGURED) return null;
  let query = supabase.from('duty_slots').select('*');
  if (schoolYear) query = query.eq('school_year', schoolYear);
  const { data, error } = await query;
  if (error) { console.warn('[Supabase] fetchDutySlots error:', error.message); return null; }
  return data;
}

export async function upsertDutySlot(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('duty_slots').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertDutySlot', error);
}

export async function removeDutySlot(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('duty_slots').delete().eq('id', id);
  if (error) reportWriteError('removeDutySlot', error);
}

// ─── STUDENTS (ROSTER) ────────────────────────────────────────────────────────
export async function fetchStudents(schoolYear?: string) {
  if (!SUPABASE_CONFIGURED) return null;
  let query = supabase.from('students').select('*').order('order_number', { ascending: true });
  if (schoolYear) query = query.eq('school_year', schoolYear);
  const { data, error } = await query;
  if (error) { console.warn('[Supabase] fetchStudents error:', error.message); return null; }
  return data;
}

export async function upsertStudent(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('students').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertStudent', error);
}

export async function removeStudent(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) reportWriteError('removeStudent', error);
}

// ─── SCHOOLS (DIRECTORIO EXTERNO) ─────────────────────────────────────────────
export async function fetchSchools() {
  if (!SUPABASE_CONFIGURED) return null;
  const { data, error } = await supabase.from('schools').select('*');
  if (error) { console.warn('[Supabase] fetchSchools error:', error.message); return null; }
  return data;
}

export async function upsertSchool(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('schools').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertSchool', error);
}

export async function removeSchool(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('schools').delete().eq('id', id);
  if (error) reportWriteError('removeSchool', error);
}

// ─── FIELD TRIPS ──────────────────────────────────────────────────────────────
export async function fetchFieldTrips(schoolYear?: string) {
  if (!SUPABASE_CONFIGURED) return null;
  let query = supabase.from('field_trips').select('*');
  if (schoolYear) query = query.eq('school_year', schoolYear);
  const { data, error } = await query;
  if (error) { console.warn('[Supabase] fetchFieldTrips error:', error.message); return null; }
  return data;
}

export async function upsertFieldTrip(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('field_trips').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertFieldTrip', error);
}

export async function removeFieldTrip(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('field_trips').delete().eq('id', id);
  if (error) reportWriteError('removeFieldTrip', error);
}

// ─── EVALUATIONS ──────────────────────────────────────────────────────────────
export async function fetchEvaluations(schoolYear?: string) {
  if (!SUPABASE_CONFIGURED) return null;
  let query = supabase.from('evaluations').select('*');
  if (schoolYear) query = query.eq('school_year', schoolYear);
  const { data, error } = await query;
  if (error) { console.warn('[Supabase] fetchEvaluations error:', error.message); return null; }
  return data;
}

export async function upsertEvaluation(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('evaluations').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertEvaluation', error);
}

export async function removeEvaluation(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('evaluations').delete().eq('id', id);
  if (error) reportWriteError('removeEvaluation', error);
}

// ─── CLASS SCHEDULES ──────────────────────────────────────────────────────────
export async function fetchClassSchedules(schoolYear?: string) {
  if (!SUPABASE_CONFIGURED) return null;
  let query = supabase.from('class_schedules').select('*');
  if (schoolYear) query = query.eq('school_year', schoolYear);
  const { data, error } = await query;
  if (error) { console.warn('[Supabase] fetchClassSchedules error:', error.message); return null; }
  return data;
}

export async function upsertClassSchedule(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('class_schedules').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertClassSchedule', error);
}

export async function removeClassSchedule(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('class_schedules').delete().eq('id', id);
  if (error) reportWriteError('removeClassSchedule', error);
}

// ─── EVENT SCHEDULES ──────────────────────────────────────────────────────────
export async function fetchEventSchedules(schoolYear?: string) {
  if (!SUPABASE_CONFIGURED) return null;
  let query = supabase.from('event_schedules').select('*');
  if (schoolYear) query = query.eq('school_year', schoolYear);
  const { data, error } = await query;
  if (error) { console.warn('[Supabase] fetchEventSchedules error:', error.message); return null; }
  return data;
}

export async function upsertEventSchedule(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('event_schedules').upsert(row, { onConflict: 'id' });
  if (error) reportWriteError('upsertEventSchedule', error);
}

export async function removeEventSchedule(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('event_schedules').delete().eq('id', id);
  if (error) reportWriteError('removeEventSchedule', error);
}

// ─── SCHOOL YEARS ─────────────────────────────────────────────────────────────
export async function fetchSchoolYears() {
  if (!SUPABASE_CONFIGURED) return null;
  const { data, error } = await supabase.from('school_years').select('*').order('created_at', { ascending: true });
  if (error) { console.warn('[Supabase] fetchSchoolYears error:', error.message); return null; }
  return data;
}

export async function upsertSchoolYear(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('school_years').upsert(row, { onConflict: 'year_label' });
  if (error) reportWriteError('upsertSchoolYear', error);
}

export async function setDefaultSchoolYearInDb(yearLabel: string) {
  if (!SUPABASE_CONFIGURED) return;
  const off = await supabase.from('school_years').update({ is_default: false }).neq('year_label', yearLabel);
  if (off.error) { reportWriteError('setDefaultSchoolYear', off.error); return; }
  const on = await supabase.from('school_years').update({ is_default: true }).eq('year_label', yearLabel);
  if (on.error) reportWriteError('setDefaultSchoolYear', on.error);
}

export async function removeSchoolYear(yearLabel: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('school_years').delete().eq('year_label', yearLabel);
  if (error) reportWriteError('removeSchoolYear', error);
}

// ─── Internal: Null/stub client for demo mode ──────────────────────────────────
function createNullClient() {
  return {
    auth: {
      signInWithOAuth: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ data: [], error: null }),
        order: () => ({ eq: () => ({ data: [], error: null }), data: [], error: null }),
        data: [],
        error: null,
      }),
      upsert: async () => ({ data: null, error: null }),
      delete: () => ({ eq: async () => ({ data: null, error: null }) }),
      update: () => ({ eq: async () => ({ data: null, error: null }), neq: async () => ({ data: null, error: null }) }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
    }),
  };
}

export type { Session, SupabaseUser };
