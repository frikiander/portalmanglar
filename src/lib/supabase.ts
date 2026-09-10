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

export async function upsertUser(row: Record<string, unknown>) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('users').upsert(row, { onConflict: 'id' });
  if (error) console.warn('[Supabase] upsertUser error:', error.message);
}

export async function removeUser(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeUser error:', error.message);
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
  if (error) console.warn('[Supabase] upsertSubject error:', error.message);
}

export async function removeSubject(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeSubject error:', error.message);
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
  if (error) console.warn('[Supabase] upsertCompetency error:', error.message);
}

export async function removeCompetency(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('competencies').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeCompetency error:', error.message);
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
  if (error) console.warn('[Supabase] upsertLessonPlan error:', error.message);
}

export async function removeLessonPlan(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('lesson_plans').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeLessonPlan error:', error.message);
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
  if (error) console.warn('[Supabase] upsertSchoolEvent error:', error.message);
}

export async function removeSchoolEvent(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('school_events').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeSchoolEvent error:', error.message);
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
  if (error) console.warn('[Supabase] upsertClassroomProject error:', error.message);
}

export async function removeClassroomProject(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('classroom_projects').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeClassroomProject error:', error.message);
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
  if (error) console.warn('[Supabase] upsertDutySlot error:', error.message);
}

export async function removeDutySlot(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('duty_slots').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeDutySlot error:', error.message);
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
  if (error) console.warn('[Supabase] upsertStudent error:', error.message);
}

export async function removeStudent(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeStudent error:', error.message);
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
  if (error) console.warn('[Supabase] upsertSchool error:', error.message);
}

export async function removeSchool(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('schools').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeSchool error:', error.message);
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
  if (error) console.warn('[Supabase] upsertFieldTrip error:', error.message);
}

export async function removeFieldTrip(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('field_trips').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeFieldTrip error:', error.message);
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
  if (error) console.warn('[Supabase] upsertEvaluation error:', error.message);
}

export async function removeEvaluation(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('evaluations').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeEvaluation error:', error.message);
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
  if (error) console.warn('[Supabase] upsertClassSchedule error:', error.message);
}

export async function removeClassSchedule(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('class_schedules').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeClassSchedule error:', error.message);
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
  if (error) console.warn('[Supabase] upsertEventSchedule error:', error.message);
}

export async function removeEventSchedule(id: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('event_schedules').delete().eq('id', id);
  if (error) console.warn('[Supabase] removeEventSchedule error:', error.message);
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
  if (error) console.warn('[Supabase] upsertSchoolYear error:', error.message);
}

export async function setDefaultSchoolYearInDb(yearLabel: string) {
  if (!SUPABASE_CONFIGURED) return;
  await supabase.from('school_years').update({ is_default: false }).neq('year_label', yearLabel);
  await supabase.from('school_years').update({ is_default: true }).eq('year_label', yearLabel);
}

export async function removeSchoolYear(yearLabel: string) {
  if (!SUPABASE_CONFIGURED) return;
  const { error } = await supabase.from('school_years').delete().eq('year_label', yearLabel);
  if (error) console.warn('[Supabase] removeSchoolYear error:', error.message);
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
