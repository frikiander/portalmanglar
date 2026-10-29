-- ============================================================
-- PORTAL MANGLAR — SEGURIDAD POR ROL (Row Level Security)
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de schema_completo.sql.
-- Se puede ejecutar más de una vez: reemplaza las políticas anteriores.
--
-- Quién es quién
--   Miembro       sesión iniciada con un correo registrado y activo en public.users
--   Coordinación  miembro con role = 'coordinator'
--   Sin sesión    no lee ni escribe nada (la clave pública deja de servir para leer datos)
--
-- Qué puede hacer cada uno
--   Tabla                 Leer                       Docente                                  Coordinación
--   users                 miembros (y su propia fila) —                                       todo
--   subjects              miembros                   —                                        todo
--   school_years          miembros                   —                                        todo
--   schools               miembros                   —                                        todo
--   school_events         miembros                   —                                        todo
--   class_schedules       miembros                   crear y editar (variaciones semanales)   todo
--   event_schedules       miembros                   —                                        todo
--   duty_slots            miembros                   —                                        todo
--   competencies          miembros                   agregar                                  todo
--   students              miembros                   actualizar (sociograma, Canvas)           todo
--   classroom_projects    miembros                   crear y editar                           todo
--   lesson_plans          propias                    crear/editar las suyas, sin aprobar      todo
--   evaluations           propias                    cargar notas y enviar, sin auditar       todo
--   field_trips           miembros                   crear/editar las suyas, sin aprobar      todo
-- ============================================================

-- ─── Columnas de autoría que faltaban ───────────────────────
ALTER TABLE public.field_trips        ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.classroom_projects ADD COLUMN IF NOT EXISTS created_by TEXT;

-- ─── Funciones de identidad ─────────────────────────────────
-- SECURITY DEFINER: leen public.users sin pasar por sus propias políticas (evita recursión).

CREATE OR REPLACE FUNCTION public.portal_user_id()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id
  FROM public.users u
  WHERE lower(u.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    AND u.status = 'active'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_portal_member()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.portal_user_id() IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.is_coordinator()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE lower(u.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      AND u.status = 'active'
      AND u.role = 'coordinator'
  )
$$;

-- Accesos internos de confianza: editor SQL, clave service_role, importaciones.
-- Supabase firma el rol en el token; un usuario del portal siempre llega como 'authenticated' o 'anon'.
CREATE OR REPLACE FUNCTION public.is_trusted_backend()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT coalesce(auth.jwt() ->> 'role', '') NOT IN ('authenticated', 'anon')
$$;

REVOKE ALL ON FUNCTION public.portal_user_id()   FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_portal_member() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_coordinator()   FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_user_id()   TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_portal_member() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coordinator()   TO authenticated;

-- ─── Limpiar políticas anteriores ───────────────────────────
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN (
      'users','subjects','competencies','lesson_plans','school_events','classroom_projects',
      'duty_slots','students','schools','field_trips','evaluations','class_schedules',
      'event_schedules','school_years')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

-- RLS activo en todas (por si alguna base se creó sin él)
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competencies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_slots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_trips        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedules    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_years       ENABLE ROW LEVEL SECURITY;

-- ─── users ──────────────────────────────────────────────────
-- La propia fila es legible aunque la cuenta esté inactiva: así la app puede decir "cuenta desactivada".
CREATE POLICY users_read ON public.users FOR SELECT TO authenticated
  USING (public.is_portal_member() OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
CREATE POLICY users_write ON public.users FOR ALL TO authenticated
  USING (public.is_coordinator()) WITH CHECK (public.is_coordinator());

-- ─── Catálogos y organización: leer miembros, escribir Coordinación ──
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['subjects','school_years','schools','school_events',
                           'event_schedules','duty_slots']
  LOOP
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_portal_member())', t || '_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_coordinator()) WITH CHECK (public.is_coordinator())', t || '_write', t);
  END LOOP;
END $$;

-- ─── competencies: los docentes pueden agregar, Coordinación edita y borra ──
CREATE POLICY competencies_read   ON public.competencies FOR SELECT TO authenticated USING (public.is_portal_member());
CREATE POLICY competencies_insert ON public.competencies FOR INSERT TO authenticated WITH CHECK (public.is_portal_member());
CREATE POLICY competencies_update ON public.competencies FOR UPDATE TO authenticated USING (public.is_coordinator()) WITH CHECK (public.is_coordinator());
CREATE POLICY competencies_delete ON public.competencies FOR DELETE TO authenticated USING (public.is_coordinator());

-- ─── students: los docentes actualizan (sociograma, Canvas); altas y bajas, Coordinación ──
CREATE POLICY students_read   ON public.students FOR SELECT TO authenticated USING (public.is_portal_member());
CREATE POLICY students_update ON public.students FOR UPDATE TO authenticated USING (public.is_portal_member()) WITH CHECK (public.is_portal_member());
CREATE POLICY students_insert ON public.students FOR INSERT TO authenticated WITH CHECK (public.is_coordinator());
CREATE POLICY students_delete ON public.students FOR DELETE TO authenticated USING (public.is_coordinator());

-- ─── class_schedules: los docentes registran las variaciones semanales de su horario; borra Coordinación ──
CREATE POLICY class_schedules_read   ON public.class_schedules FOR SELECT TO authenticated USING (public.is_portal_member());
CREATE POLICY class_schedules_insert ON public.class_schedules FOR INSERT TO authenticated WITH CHECK (public.is_portal_member());
CREATE POLICY class_schedules_update ON public.class_schedules FOR UPDATE TO authenticated USING (public.is_portal_member()) WITH CHECK (public.is_portal_member());
CREATE POLICY class_schedules_delete ON public.class_schedules FOR DELETE TO authenticated USING (public.is_coordinator());

-- ─── classroom_projects: compartidos por grado; borra Coordinación ──
CREATE POLICY classroom_projects_read   ON public.classroom_projects FOR SELECT TO authenticated USING (public.is_portal_member());
CREATE POLICY classroom_projects_insert ON public.classroom_projects FOR INSERT TO authenticated WITH CHECK (public.is_portal_member());
CREATE POLICY classroom_projects_update ON public.classroom_projects FOR UPDATE TO authenticated USING (public.is_portal_member()) WITH CHECK (public.is_portal_member());
CREATE POLICY classroom_projects_delete ON public.classroom_projects FOR DELETE TO authenticated USING (public.is_coordinator());

-- ─── lesson_plans: cada docente las suyas ───────────────────
CREATE POLICY lesson_plans_read ON public.lesson_plans FOR SELECT TO authenticated
  USING (public.is_coordinator() OR teacher_id = public.portal_user_id());
CREATE POLICY lesson_plans_insert ON public.lesson_plans FOR INSERT TO authenticated
  WITH CHECK (public.is_coordinator() OR teacher_id = public.portal_user_id());
CREATE POLICY lesson_plans_update ON public.lesson_plans FOR UPDATE TO authenticated
  USING (public.is_coordinator() OR teacher_id = public.portal_user_id())
  WITH CHECK (public.is_coordinator() OR teacher_id = public.portal_user_id());
CREATE POLICY lesson_plans_delete ON public.lesson_plans FOR DELETE TO authenticated
  USING (public.is_coordinator() OR (teacher_id = public.portal_user_id() AND status <> 'approved'));

-- ─── evaluations: cada docente las suyas ────────────────────
CREATE POLICY evaluations_read ON public.evaluations FOR SELECT TO authenticated
  USING (public.is_coordinator() OR teacher_id = public.portal_user_id());
CREATE POLICY evaluations_insert ON public.evaluations FOR INSERT TO authenticated
  WITH CHECK (public.is_coordinator() OR teacher_id = public.portal_user_id());
CREATE POLICY evaluations_update ON public.evaluations FOR UPDATE TO authenticated
  USING (public.is_coordinator() OR teacher_id = public.portal_user_id())
  WITH CHECK (public.is_coordinator() OR teacher_id = public.portal_user_id());
CREATE POLICY evaluations_delete ON public.evaluations FOR DELETE TO authenticated
  USING (public.is_coordinator());

-- ─── field_trips: todos las ven; cada docente edita las suyas ──
CREATE POLICY field_trips_read ON public.field_trips FOR SELECT TO authenticated USING (public.is_portal_member());
CREATE POLICY field_trips_insert ON public.field_trips FOR INSERT TO authenticated
  WITH CHECK (public.is_coordinator() OR (public.is_portal_member() AND created_by = public.portal_user_id()));
CREATE POLICY field_trips_update ON public.field_trips FOR UPDATE TO authenticated
  USING (public.is_coordinator() OR created_by = public.portal_user_id())
  WITH CHECK (public.is_coordinator() OR created_by = public.portal_user_id());
CREATE POLICY field_trips_delete ON public.field_trips FOR DELETE TO authenticated
  USING (public.is_coordinator() OR (created_by = public.portal_user_id() AND status = 'draft'));

-- ─── Reglas de flujo que RLS no puede expresar por columna ──
-- Se ejecutan ANTES de las políticas, así que los campos forzados (autor) ya cuentan para WITH CHECK.

-- Planificaciones: el docente no aprueba, no observa, no toca una aprobada y no cambia el autor.
CREATE OR REPLACE FUNCTION public.guard_lesson_plan()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_coordinator() OR public.is_trusted_backend() THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.teacher_id := public.portal_user_id();
    IF NEW.status NOT IN ('draft', 'submitted') THEN
      RAISE EXCEPTION 'Solo Coordinación puede aprobar u observar planificaciones' USING ERRCODE = '42501';
    END IF;
    NEW.coordinator_feedback := NULL;
    NEW.reviewed_at := NULL;
    RETURN NEW;
  END IF;

  IF OLD.status = 'approved' THEN
    RAISE EXCEPTION 'Esta planificación ya fue aprobada y no se puede modificar' USING ERRCODE = '42501';
  END IF;
  -- Mantener el estado "con observaciones" al guardar un borrador está permitido; aprobar u observar, no.
  IF NEW.status <> OLD.status AND NEW.status NOT IN ('draft', 'submitted') THEN
    RAISE EXCEPTION 'Solo Coordinación puede aprobar u observar planificaciones' USING ERRCODE = '42501';
  END IF;
  NEW.teacher_id := OLD.teacher_id;
  NEW.coordinator_feedback := OLD.coordinator_feedback;
  NEW.reviewed_at := OLD.reviewed_at;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_lesson_plan ON public.lesson_plans;
CREATE TRIGGER guard_lesson_plan BEFORE INSERT OR UPDATE ON public.lesson_plans
  FOR EACH ROW EXECUTE FUNCTION public.guard_lesson_plan();

-- Calificaciones: el docente carga y envía; auditar es de Coordinación.
CREATE OR REPLACE FUNCTION public.guard_evaluation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_coordinator() OR public.is_trusted_backend() THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.teacher_id := public.portal_user_id();
    IF NEW.status = 'audited' THEN
      RAISE EXCEPTION 'Solo Coordinación puede auditar calificaciones' USING ERRCODE = '42501';
    END IF;
    NEW.audited_by := NULL; NEW.audited_at := NULL; NEW.audit_notes := NULL;
    RETURN NEW;
  END IF;

  IF OLD.status = 'audited' THEN
    RAISE EXCEPTION 'Estas calificaciones ya fueron auditadas y no se pueden modificar' USING ERRCODE = '42501';
  END IF;
  IF NEW.status = 'audited' THEN
    RAISE EXCEPTION 'Solo Coordinación puede auditar calificaciones' USING ERRCODE = '42501';
  END IF;
  NEW.teacher_id := OLD.teacher_id;
  NEW.audited_by := OLD.audited_by; NEW.audited_at := OLD.audited_at; NEW.audit_notes := OLD.audit_notes;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_evaluation ON public.evaluations;
CREATE TRIGGER guard_evaluation BEFORE INSERT OR UPDATE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.guard_evaluation();

-- Salidas de campo: el autor queda registrado; aprobar o cerrar es de Coordinación.
CREATE OR REPLACE FUNCTION public.guard_field_trip()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.created_by IS NULL THEN
    NEW.created_by := public.portal_user_id();
  END IF;
  IF public.is_coordinator() OR public.is_trusted_backend() THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.created_by := public.portal_user_id();
    IF NEW.status NOT IN ('draft', 'submitted') THEN
      RAISE EXCEPTION 'Solo Coordinación puede aprobar salidas de campo' USING ERRCODE = '42501';
    END IF;
    NEW.coordination_feedback := NULL;
    RETURN NEW;
  END IF;

  IF OLD.status IN ('approved', 'completed') THEN
    RAISE EXCEPTION 'Esta salida ya fue aprobada y no se puede modificar' USING ERRCODE = '42501';
  END IF;
  IF NEW.status <> OLD.status AND NEW.status NOT IN ('draft', 'submitted') THEN
    RAISE EXCEPTION 'Solo Coordinación puede aprobar salidas de campo' USING ERRCODE = '42501';
  END IF;
  NEW.created_by := OLD.created_by;
  NEW.coordination_feedback := OLD.coordination_feedback;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_field_trip ON public.field_trips;
CREATE TRIGGER guard_field_trip BEFORE INSERT OR UPDATE ON public.field_trips
  FOR EACH ROW EXECUTE FUNCTION public.guard_field_trip();

-- Proyectos de aula: registrar quién lo creó.
CREATE OR REPLACE FUNCTION public.stamp_classroom_project()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_trusted_backend() THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := coalesce(NEW.created_by, public.portal_user_id());
  ELSE
    NEW.created_by := OLD.created_by;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS stamp_classroom_project ON public.classroom_projects;
CREATE TRIGGER stamp_classroom_project BEFORE INSERT OR UPDATE ON public.classroom_projects
  FOR EACH ROW EXECUTE FUNCTION public.stamp_classroom_project();

-- ─── Salidas de campo ya existentes ─────────────────────────
-- No tenían autor. Quedan sin dueño: solo Coordinación podrá editarlas hasta que les asigne uno, p. ej.:
--   UPDATE public.field_trips SET created_by = (SELECT id FROM public.users WHERE email = 'docente@colegio.edu.ve') WHERE id = '...';

-- ============================================================
-- FIN
-- ============================================================
