-- ============================================================
-- PORTAL MANGLAR — SCHEMA COMPLETO SUPABASE
-- Ejecutar en el SQL Editor de Supabase Dashboard.
-- Después ejecutar seguridad_rls.sql: sin ese paso, con RLS activo nadie puede leer ni escribir.
-- ============================================================

-- ─── EXTENSIONES ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── TABLA: users ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id               TEXT PRIMARY KEY,
  email            TEXT NOT NULL UNIQUE,
  full_name        TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher','coordinator')),
  avatar_url       TEXT,
  specialty        TEXT,
  phone            TEXT,
  school_grade     TEXT,
  assigned_grades  TEXT[]  DEFAULT '{}',
  assigned_sections TEXT[] DEFAULT '{}',
  assigned_subjects TEXT[] DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  auth_uid         TEXT,
  last_login_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: subjects ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subjects (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  category          TEXT NOT NULL DEFAULT 'otro',
  code              TEXT,
  description       TEXT,
  applicable_grades TEXT[] DEFAULT '{}',
  color             TEXT,
  is_custom         BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: competencies ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competencies (
  id          TEXT PRIMARY KEY,
  subject     TEXT NOT NULL,
  grade       TEXT NOT NULL,
  code        TEXT NOT NULL,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT '',
  indicators  TEXT[] DEFAULT '{}',
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS competencies_subject_grade_idx ON public.competencies(subject, grade);

ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: lesson_plans ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id                    TEXT PRIMARY KEY,
  teacher_id            TEXT NOT NULL,
  teacher_name          TEXT NOT NULL,
  teacher_avatar        TEXT DEFAULT '',
  week_number           INTEGER NOT NULL,
  day_of_week           TEXT CHECK (day_of_week IN ('Lunes','Martes','Miércoles','Jueves','Viernes')),
  school_year           TEXT NOT NULL DEFAULT '2026-2027',
  subject               TEXT NOT NULL,
  grade                 TEXT NOT NULL,
  topic                 TEXT DEFAULT '',
  status                TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected')),
  competency_ids        TEXT[] DEFAULT '{}',
  selected_indicators   JSONB DEFAULT '{}',
  start_activity        TEXT DEFAULT '',
  development_activity  TEXT DEFAULT '',
  closing_activity      TEXT DEFAULT '',
  resources             TEXT DEFAULT '',
  observations          TEXT DEFAULT '',
  coordinator_feedback  TEXT,
  submitted_at          TIMESTAMPTZ,
  reviewed_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- Bases creadas antes de planificar por día
ALTER TABLE public.lesson_plans ADD COLUMN IF NOT EXISTS day_of_week TEXT
  CHECK (day_of_week IN ('Lunes','Martes','Miércoles','Jueves','Viernes'));

CREATE INDEX IF NOT EXISTS lesson_plans_teacher_year_idx ON public.lesson_plans(teacher_id, school_year);
CREATE INDEX IF NOT EXISTS lesson_plans_grade_year_idx ON public.lesson_plans(grade, school_year);

ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: school_events ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  type        TEXT NOT NULL DEFAULT 'academic',
  date        DATE NOT NULL,
  end_date    DATE,
  start_time  TEXT,
  end_time    TEXT,
  target_role TEXT DEFAULT 'all',
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: classroom_projects ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.classroom_projects (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL CHECK (type IN ('IPC','DIEV')),
  grade        TEXT NOT NULL,
  lapso        TEXT NOT NULL,
  school_year  TEXT NOT NULL DEFAULT '2026-2027',
  promo_cohort TEXT,
  title        TEXT NOT NULL,
  purpose      TEXT DEFAULT '',
  weeks        JSONB DEFAULT '[]',
  updated_at   TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS classroom_projects_grade_year_idx ON public.classroom_projects(grade, school_year);

ALTER TABLE public.classroom_projects ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: duty_slots ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.duty_slots (
  id              TEXT PRIMARY KEY,
  day             TEXT NOT NULL,
  time_slot       TEXT NOT NULL,
  location        TEXT NOT NULL,
  assigned_person TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL,
  note            TEXT,
  school_year     TEXT NOT NULL DEFAULT '2026-2027',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.duty_slots ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: students ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
  id                  TEXT PRIMARY KEY,
  order_number        INTEGER NOT NULL,
  full_name           TEXT NOT NULL,
  email               TEXT,
  birth_place         TEXT,
  birth_state         TEXT,
  birth_date          TEXT,
  school_id           TEXT NOT NULL DEFAULT '',
  condition           TEXT NOT NULL DEFAULT 'Regular',
  siblings            TEXT,
  mother_name         TEXT,
  mother_phone        TEXT,
  mother_email        TEXT,
  mother_id           TEXT,
  father_name         TEXT,
  father_phone        TEXT,
  father_email        TEXT,
  father_id           TEXT,
  home_office_phone   TEXT,
  canvas_accepted     BOOLEAN DEFAULT false,
  canvas_password     TEXT,
  canvas_observations TEXT,
  canvas_status       TEXT,
  sociogram_group     TEXT,
  grade               TEXT NOT NULL,
  school_year         TEXT NOT NULL DEFAULT '2026-2027',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS students_grade_year_idx ON public.students(grade, school_year);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: schools (directorio intercolegial) ──────────────
CREATE TABLE IF NOT EXISTS public.schools (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  emails            TEXT[] DEFAULT '{}',
  contact_name      TEXT,
  contact_phone     TEXT,
  secondary_contact TEXT,
  events            JSONB DEFAULT '{"futbol":false,"beachtennis":false,"spelling_bee":false,"deletreo_espanol":false,"ajedrez":false}',
  notes             TEXT,
  updated_at        TIMESTAMPTZ DEFAULT now(),
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: field_trips ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.field_trips (
  id                   TEXT PRIMARY KEY,
  type                 TEXT NOT NULL CHECK (type IN ('salida_campo','invitado_especial')),
  grade                TEXT NOT NULL,
  lapso                TEXT NOT NULL,
  week_number          INTEGER NOT NULL,
  lapso_semana_label   TEXT,
  date                 TEXT NOT NULL,
  school_year          TEXT NOT NULL DEFAULT '2026-2027',
  destination_or_guest TEXT NOT NULL,
  alliance_name        TEXT,
  contact_phone        TEXT,
  alliances_or_contacts TEXT DEFAULT '',
  purpose              TEXT DEFAULT '',
  subject_or_context   TEXT DEFAULT '',
  project_id           TEXT,
  responsible_teacher  TEXT DEFAULT '',
  chaperone_teachers   TEXT,
  resources            TEXT,
  focus                JSONB DEFAULT '{"socialResponsibility":false,"citizenParticipation":false,"nationalIdentity":false,"introspection":false}',
  methodology          TEXT DEFAULT '',
  key_learnings        TEXT,
  observations         TEXT,
  chaperone_parents    TEXT,
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','completed')),
  coordination_feedback TEXT,
  transport_required   BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS field_trips_grade_year_idx ON public.field_trips(grade, school_year);

ALTER TABLE public.field_trips ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: evaluations ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.evaluations (
  id           TEXT PRIMARY KEY,
  school_year  TEXT NOT NULL,
  grade        TEXT NOT NULL,
  subject      TEXT NOT NULL,
  lapso        TEXT NOT NULL,
  moment       TEXT NOT NULL,
  title        TEXT,
  teacher_id   TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','audited')),
  grades       JSONB DEFAULT '[]',
  audited_by   TEXT,
  audited_at   TIMESTAMPTZ,
  audit_notes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS evaluations_unique_idx ON public.evaluations(school_year, grade, subject, lapso, moment, teacher_id);
CREATE INDEX IF NOT EXISTS evaluations_grade_year_idx ON public.evaluations(grade, school_year);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: class_schedules ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id                   TEXT PRIMARY KEY,
  school_year          TEXT NOT NULL,
  grade                TEXT NOT NULL,
  lapso                TEXT NOT NULL,
  week_number          INTEGER NOT NULL,
  cells                JSONB DEFAULT '{}',
  notes                TEXT,
  is_saved             BOOLEAN DEFAULT false,
  based_on_week_number INTEGER,
  updated_at           TIMESTAMPTZ DEFAULT now(),
  updated_by           TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS class_schedules_unique_idx ON public.class_schedules(school_year, grade, lapso, week_number);

ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: event_schedules ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_schedules (
  id               TEXT PRIMARY KEY,
  school_year      TEXT,
  title            TEXT NOT NULL,
  description      TEXT DEFAULT '',
  lapso            TEXT,
  week_number      INTEGER,
  date_range       TEXT,
  target_grades    TEXT[] DEFAULT '{}',
  status           TEXT DEFAULT 'draft',
  slots            JSONB DEFAULT '[]',
  type             TEXT,
  date             TEXT,
  start_time       TEXT,
  end_time         TEXT,
  location         TEXT,
  agenda           JSONB DEFAULT '[]',
  notes            TEXT,
  coordinator_notes TEXT,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.event_schedules ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- ─── TABLA: school_years (configuración años escolares) ──────
CREATE TABLE IF NOT EXISTS public.school_years (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  year_label   TEXT NOT NULL UNIQUE,
  is_default   BOOLEAN DEFAULT false,
  -- [{ "name": "1er Lapso", "start": "2026-08-31", "weeks": 15 }, ...] — editable en Años escolares → Lapsos
  lapsos       JSONB,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Bases ya creadas antes de existir la columna
ALTER TABLE public.school_years ADD COLUMN IF NOT EXISTS lapsos JSONB;

ALTER TABLE public.school_years ENABLE ROW LEVEL SECURITY;
-- Políticas por rol: ejecutar seguridad_rls.sql después de este archivo.

-- Seed inicial de años escolares
INSERT INTO public.school_years (year_label, is_default) VALUES
  ('2026-2027', true),
  ('2025-2026', false),
  ('2024-2025', false),
  ('2023-2024', false)
ON CONFLICT (year_label) DO NOTHING;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
