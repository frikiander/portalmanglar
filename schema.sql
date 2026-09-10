-- ==============================================================================
-- EduPlan - Schema SQL para PostgreSQL (Supabase)
-- Gestión de Planificaciones Académicas
-- ==============================================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TIPOS ENUM PERSONALIZADOS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('teacher', 'coordinator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA DE USUARIOS / PERFILES (Sincronizada con auth.users de Supabase)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'teacher',
    avatar_url TEXT,
    specialty TEXT, -- Ej: 'Lengua y Literatura', 'Ciencias Naturales', 'Inglés'
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLA DE BANCO DE COMPETENCIAS ACADÉMICAS
-- Relaciona competencias por Asignatura y Grado (ej: 'English' - '4to Grado')
CREATE TABLE IF NOT EXISTS competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,          -- Ej: 'Inglés', 'Matemáticas', 'Ciencias Naturales'
    grade TEXT NOT NULL,            -- Ej: '1er Grado', '4to Grado', '7mo Grado'
    code TEXT,                      -- Código curricular opcional (ej: 'CN-4-C02')
    title TEXT NOT NULL,            -- Título o descripción sintética de la competencia
    description TEXT,               -- Detalle del indicador o logro esperado
    category TEXT DEFAULT 'General',-- Categoría o eje temático
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLA DE PLANIFICACIONES SEMANALES (Lesson Plans)
CREATE TABLE IF NOT EXISTS lesson_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 15),
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    topic TEXT NOT NULL,             -- Tema o unidad de la semana
    status plan_status NOT NULL DEFAULT 'draft',
    
    -- Estructura pedagógica requerida
    start_activity TEXT NOT NULL DEFAULT '',        -- Inicio (motivación, saberes previos)
    development_activity TEXT NOT NULL DEFAULT '',  -- Desarrollo (actividades nucleares)
    closing_activity TEXT NOT NULL DEFAULT '',      -- Cierre (evaluación, metacognición)
    resources TEXT NOT NULL DEFAULT '',             -- Recursos y materiales didácticos
    observations TEXT DEFAULT '',                   -- Observaciones y adaptaciones del docente
    
    -- Retroalimentación de la Coordinación
    coordinator_feedback TEXT DEFAULT '',           -- Observaciones de revisión del coordinador
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Restricción única: un docente solo tiene una planificación por semana para una asignatura y grado
    CONSTRAINT unique_teacher_week_subject_grade UNIQUE (teacher_id, week_number, subject, grade)
);

-- 5. TABLA INTERMEDIA: COMPETENCIAS ASOCIADAS A LA PLANIFICACIÓN (Muchos a Muchos)
CREATE TABLE IF NOT EXISTS lesson_plan_competencies (
    lesson_plan_id UUID NOT NULL REFERENCES lesson_plans(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (lesson_plan_id, competency_id)
);

-- 6. TABLA DE CALENDARIO ESCOLAR Y EVENTOS ACADÉMICOS
-- Cargados por la Coordinación (ej. entrega de planificaciones, reuniones, exámenes)
CREATE TABLE IF NOT EXISTS school_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('planning_deadline', 'meeting', 'academic', 'exam', 'holiday')),
    date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    target_role TEXT DEFAULT 'all',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABLA DE PROYECTOS DE AULA (IPC: Interés por el conocimiento y DIEV: Desarrollo integral, ética y valores)
CREATE TABLE IF NOT EXISTS classroom_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_type TEXT NOT NULL CHECK (project_type IN ('IPC', 'DIEV')),
    grade TEXT NOT NULL,
    lapso TEXT NOT NULL, -- '1er Lapso', '2do Lapso', '3er Lapso'
    promo_cohort TEXT,   -- ej. 'Promo XVIII'
    title TEXT NOT NULL,
    purpose TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (project_type, grade, lapso)
);

-- 8. TABLA DE PLANIFICACIÓN SEMANAL DEL PROYECTO DE AULA
CREATE TABLE IF NOT EXISTS classroom_project_weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES classroom_projects(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 15),
    title TEXT,
    content TEXT NOT NULL,
    english_content TEXT,
    milestone TEXT,
    links JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (project_id, week_number)
);

-- 9. ÍNDICES PARA BÚSQUEDA Y FILTRADO EFICIENTE
CREATE INDEX IF NOT EXISTS idx_competencies_subject_grade ON competencies(subject, grade);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_teacher ON lesson_plans(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_status ON lesson_plans(status);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_grade ON lesson_plans(grade);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_subject ON lesson_plans(subject);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_week ON lesson_plans(week_number);

-- 7. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) PARA SUPABASE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plan_competencies ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Lectura de perfiles para usuarios autenticados" 
    ON users FOR SELECT USING (true);

CREATE POLICY "Modificación del propio perfil" 
    ON users FOR UPDATE USING (auth.uid() = id);

-- Políticas para competencies
CREATE POLICY "Todos los docentes y coordinadores pueden leer competencias" 
    ON competencies FOR SELECT USING (true);

CREATE POLICY "Solo coordinadores pueden crear o actualizar competencias" 
    ON competencies FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'coordinator'
        )
    );

-- Políticas para lesson_plans
CREATE POLICY "Docentes pueden gestionar sus propias planificaciones"
    ON lesson_plans FOR ALL USING (
        teacher_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'coordinator')
    );

-- 8. TRIGGER PARA ACTUALIZAR TIMESTAMP updated_at AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

CREATE OR REPLACE TRIGGER update_competencies_modtime 
    BEFORE UPDATE ON competencies 
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

CREATE OR REPLACE TRIGGER update_lesson_plans_modtime 
    BEFORE UPDATE ON lesson_plans 
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ==============================================================================
-- NOTA: Columnas adicionales requeridas por la app (no en el schema original)
-- Ejecutar estos ALTER TABLE si la tabla users ya existe:
-- ==============================================================================
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS school_grade TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_grades JSONB DEFAULT '[]'::jsonb;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_sections JSONB DEFAULT '[]'::jsonb;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_subjects JSONB DEFAULT '[]'::jsonb;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_uid TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ==============================================================================
-- 10. TABLA DE ASIGNATURAS INSTITUCIONALES (Dynamic Subject Catalog)
-- Gestionada por Coordinación; referenciada por planificaciones y horarios.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS subjects (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'otro',
    code        TEXT,
    description TEXT,
    applicable_grades JSONB  DEFAULT '[]'::jsonb,
    color       TEXT,
    is_custom   BOOLEAN DEFAULT false,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden leer asignaturas"
    ON subjects FOR SELECT USING (true);

CREATE POLICY "Solo coordinadores pueden modificar asignaturas"
    ON subjects FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
              AND users.role = 'coordinator'
        )
    );

CREATE OR REPLACE TRIGGER update_subjects_modtime
    BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
