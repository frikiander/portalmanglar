/**
 * mappers.ts
 * Bidirectional type converters between the Supabase DB schema (snake_case)
 * and the application TypeScript types (camelCase).
 */
import type {
  User,
  AcademicSubject,
  Competency,
  LessonPlan,
  PlanStatus,
  SchoolEvent,
  EventType,
  ClassroomProject,
  ClassroomProjectType,
  ClassroomProjectWeek,
  DutySlot,
  DutyDay,
  DutyCategory,
  Student,
  StudentCondition,
  CanvasStatus,
  ExternalSchool,
  IntercollegiateEventsRecord,
  FieldTrip,
  FieldTripType,
  FieldTripStatus,
  FieldTripFocus,
  EvaluationRecord,
  EvaluationLapso,
  EvaluationMoment,
  EvaluationStatus,
  StudentGradeEntry,
  ClassSchedule,
  ClassScheduleCell,
  EventSchedule,
  EventScheduleSlot,
  EventScheduleType,
  EventScheduleItem,
} from '../types';

import { sanitizeAvatar } from '../data/flatAvatars';

export function mapDbUserToUser(row: Record<string, unknown>): User {
  const role = (row.role as User['role']) ?? 'teacher';
  return {
    id:               String(row.id ?? ''),
    email:            String(row.email ?? ''),
    fullName:         String(row.full_name ?? ''),
    role,
    avatar:           sanitizeAvatar(row.avatar_url != null ? String(row.avatar_url) : undefined, role),
    specialty:        row.specialty != null ? String(row.specialty) : undefined,
    phone:            row.phone     != null ? String(row.phone)     : undefined,
    schoolGrade:      row.school_grade != null ? String(row.school_grade) : undefined,
    assignedGrades:   Array.isArray(row.assigned_grades)   ? (row.assigned_grades as string[])   : [],
    assignedSections: Array.isArray(row.assigned_sections) ? (row.assigned_sections as string[]) : [],
    assignedSubjects: Array.isArray(row.assigned_subjects) ? (row.assigned_subjects as string[]) : [],
    status:           (row.status as User['status']) ?? 'active',
    authUid:          row.auth_uid  != null ? String(row.auth_uid)  : undefined,
    createdAt:        row.created_at != null ? String(row.created_at) : undefined,
    lastLoginAt:      row.last_login_at != null ? String(row.last_login_at) : undefined,
  };
}

export function mapUserToDb(user: User): Record<string, unknown> {
  return {
    id:               user.id,
    email:            user.email,
    full_name:        user.fullName,
    role:             user.role,
    avatar_url:       user.avatar    || null,
    specialty:        user.specialty || null,
    phone:            user.phone     || null,
    school_grade:     user.schoolGrade || null,
    assigned_grades:  user.assignedGrades  ?? [],
    assigned_sections:user.assignedSections ?? [],
    assigned_subjects:user.assignedSubjects ?? [],
    status:           user.status    || 'active',
    auth_uid:         user.authUid   || null,
    last_login_at:    user.lastLoginAt || null,
  };
}

// ─── Subject mappers ───────────────────────────────────────────────────────────

export function mapDbSubjectToSubject(row: Record<string, unknown>): AcademicSubject {
  return {
    id:               String(row.id ?? ''),
    name:             String(row.name ?? ''),
    category:         (row.category as AcademicSubject['category']) ?? 'otro',
    code:             row.code        != null ? String(row.code)        : undefined,
    description:      row.description != null ? String(row.description) : undefined,
    applicableGrades: Array.isArray(row.applicable_grades) ? (row.applicable_grades as string[]) : [],
    color:            row.color       != null ? String(row.color)       : undefined,
    isCustom:         Boolean(row.is_custom ?? false),
    createdAt:        row.created_at  != null ? String(row.created_at)  : undefined,
  };
}

export function mapSubjectToDb(subject: AcademicSubject): Record<string, unknown> {
  return {
    id:               subject.id,
    name:             subject.name,
    category:         subject.category,
    code:             subject.code        || null,
    description:      subject.description || null,
    applicable_grades:subject.applicableGrades ?? [],
    color:            subject.color        || null,
    is_custom:        subject.isCustom     ?? false,
  };
}

// ─── Competency mappers ────────────────────────────────────────────────────────

export function mapDbCompetencyToCompetency(row: Record<string, unknown>): Competency {
  return {
    id:          String(row.id ?? ''),
    subject:     String(row.subject ?? ''),
    grade:       String(row.grade ?? ''),
    code:        String(row.code ?? ''),
    title:       String(row.title ?? ''),
    category:    String(row.category ?? ''),
    indicators:  Array.isArray(row.indicators) ? (row.indicators as string[]) : [],
    description: row.description != null ? String(row.description) : undefined,
  };
}

export function mapCompetencyToDb(c: Competency): Record<string, unknown> {
  return {
    id:          c.id,
    subject:     c.subject,
    grade:       c.grade,
    code:        c.code,
    title:       c.title,
    category:    c.category || '',
    indicators:  c.indicators ?? [],
    description: c.description || null,
    updated_at:  new Date().toISOString(),
  };
}

// ─── Lesson Plan mappers ───────────────────────────────────────────────────────

export function mapDbLessonPlanToLessonPlan(row: Record<string, unknown>): LessonPlan {
  return {
    id:                  String(row.id ?? ''),
    teacherId:           String(row.teacher_id ?? ''),
    teacherName:         String(row.teacher_name ?? ''),
    teacherAvatar:       String(row.teacher_avatar ?? ''),
    weekNumber:          Number(row.week_number ?? 1),
    subject:             String(row.subject ?? ''),
    grade:               String(row.grade ?? ''),
    topic:               String(row.topic ?? ''),
    status:              (row.status as PlanStatus) ?? 'draft',
    competencyIds:       Array.isArray(row.competency_ids) ? (row.competency_ids as string[]) : [],
    selectedIndicators:  row.selected_indicators && typeof row.selected_indicators === 'object'
                          ? (row.selected_indicators as Record<string, string[]>)
                          : undefined,
    startActivity:       String(row.start_activity ?? ''),
    developmentActivity: String(row.development_activity ?? ''),
    closingActivity:     String(row.closing_activity ?? ''),
    resources:           String(row.resources ?? ''),
    observations:        String(row.observations ?? ''),
    coordinatorFeedback: row.coordinator_feedback != null ? String(row.coordinator_feedback) : undefined,
    submittedAt:         row.submitted_at != null ? String(row.submitted_at) : undefined,
    reviewedAt:          row.reviewed_at != null ? String(row.reviewed_at) : undefined,
    updatedAt:           String(row.updated_at ?? new Date().toISOString()),
  };
}

export function mapLessonPlanToDb(p: LessonPlan, schoolYear: string = '2026-2027'): Record<string, unknown> {
  return {
    id:                   p.id,
    teacher_id:           p.teacherId,
    teacher_name:         p.teacherName,
    teacher_avatar:       p.teacherAvatar || '',
    week_number:          p.weekNumber,
    school_year:          schoolYear,
    subject:              p.subject,
    grade:                p.grade,
    topic:                p.topic || '',
    status:               p.status,
    competency_ids:       p.competencyIds ?? [],
    selected_indicators:  p.selectedIndicators ?? {},
    start_activity:       p.startActivity || '',
    development_activity: p.developmentActivity || '',
    closing_activity:     p.closingActivity || '',
    resources:            p.resources || '',
    observations:         p.observations || '',
    coordinator_feedback: p.coordinatorFeedback || null,
    submitted_at:         p.submittedAt || null,
    reviewed_at:          p.reviewedAt || null,
    updated_at:           p.updatedAt || new Date().toISOString(),
  };
}

// ─── School Event mappers ──────────────────────────────────────────────────────

export function mapDbSchoolEventToSchoolEvent(row: Record<string, unknown>): SchoolEvent {
  return {
    id:          String(row.id ?? ''),
    title:       String(row.title ?? ''),
    description: String(row.description ?? ''),
    type:        (row.type as EventType) ?? 'academic',
    date:        String(row.date ?? ''),
    endDate:     row.end_date != null ? String(row.end_date) : undefined,
    startTime:   row.start_time != null ? String(row.start_time) : undefined,
    endTime:     row.end_time != null ? String(row.end_time) : undefined,
    targetRole:  (row.target_role as SchoolEvent['targetRole']) ?? 'all',
    createdBy:   row.created_by != null ? String(row.created_by) : undefined,
  };
}

export function mapSchoolEventToDb(e: SchoolEvent): Record<string, unknown> {
  return {
    id:          e.id,
    title:       e.title,
    description: e.description || '',
    type:        e.type,
    date:        e.date,
    end_date:    e.endDate || null,
    start_time:  e.startTime || null,
    end_time:    e.endTime || null,
    target_role: e.targetRole || 'all',
    created_by:  e.createdBy || null,
  };
}

// ─── Classroom Project mappers ─────────────────────────────────────────────────

export function mapDbClassroomProjectToClassroomProject(row: Record<string, unknown>): ClassroomProject {
  return {
    id:          String(row.id ?? ''),
    type:        (row.type as ClassroomProjectType) ?? 'IPC',
    grade:       String(row.grade ?? ''),
    lapso:       String(row.lapso ?? ''),
    promoCohort: row.promo_cohort != null ? String(row.promo_cohort) : undefined,
    title:       String(row.title ?? ''),
    purpose:     String(row.purpose ?? ''),
    weeks:       Array.isArray(row.weeks) ? (row.weeks as ClassroomProjectWeek[]) : [],
    updatedAt:   String(row.updated_at ?? new Date().toISOString()),
  };
}

export function mapClassroomProjectToDb(p: ClassroomProject, schoolYear: string = '2026-2027'): Record<string, unknown> {
  return {
    id:           p.id,
    type:         p.type,
    grade:        p.grade,
    lapso:        p.lapso,
    school_year:  schoolYear,
    promo_cohort: p.promoCohort || null,
    title:        p.title,
    purpose:      p.purpose || '',
    weeks:        p.weeks ?? [],
    updated_at:   p.updatedAt || new Date().toISOString(),
  };
}

// ─── Duty Slot mappers ─────────────────────────────────────────────────────────

export function mapDbDutySlotToDutySlot(row: Record<string, unknown>): DutySlot {
  return {
    id:             String(row.id ?? ''),
    day:            (row.day as DutyDay) ?? 'Lunes',
    timeSlot:       String(row.time_slot ?? ''),
    location:       String(row.location ?? ''),
    assignedPerson: String(row.assigned_person ?? ''),
    category:       (row.category as DutyCategory) ?? 'entrada_salida',
    note:           row.note != null ? String(row.note) : undefined,
  };
}

export function mapDutySlotToDb(d: DutySlot, schoolYear: string = '2026-2027'): Record<string, unknown> {
  return {
    id:              d.id,
    day:             d.day,
    time_slot:       d.timeSlot,
    location:        d.location,
    assigned_person: d.assignedPerson || '',
    category:        d.category,
    note:            d.note || null,
    school_year:     schoolYear,
    updated_at:      new Date().toISOString(),
  };
}

// ─── Student mappers ───────────────────────────────────────────────────────────

export function mapDbStudentToStudent(row: Record<string, unknown>): Student {
  return {
    id:                 String(row.id ?? ''),
    orderNumber:        Number(row.order_number ?? 1),
    fullName:           String(row.full_name ?? ''),
    email:              row.email != null ? String(row.email) : undefined,
    birthPlace:         row.birth_place != null ? String(row.birth_place) : undefined,
    birthState:         row.birth_state != null ? String(row.birth_state) : undefined,
    birthDate:          row.birth_date != null ? String(row.birth_date) : undefined,
    schoolId:           String(row.school_id ?? ''),
    condition:          (row.condition as StudentCondition) ?? 'Regular',
    siblings:           row.siblings != null ? String(row.siblings) : undefined,
    motherName:         row.mother_name != null ? String(row.mother_name) : undefined,
    motherPhone:        row.mother_phone != null ? String(row.mother_phone) : undefined,
    motherEmail:        row.mother_email != null ? String(row.mother_email) : undefined,
    motherId:           row.mother_id != null ? String(row.mother_id) : undefined,
    fatherName:         row.father_name != null ? String(row.father_name) : undefined,
    fatherPhone:        row.father_phone != null ? String(row.father_phone) : undefined,
    fatherEmail:        row.father_email != null ? String(row.father_email) : undefined,
    fatherId:           row.father_id != null ? String(row.father_id) : undefined,
    homeOfficePhone:    row.home_office_phone != null ? String(row.home_office_phone) : undefined,
    canvasAccepted:     Boolean(row.canvas_accepted ?? false),
    canvasPassword:     row.canvas_password != null ? String(row.canvas_password) : undefined,
    canvasObservations: row.canvas_observations != null ? String(row.canvas_observations) : undefined,
    canvasStatus:       (row.canvas_status as CanvasStatus) ?? undefined,
    sociogramGroup:     (row.sociogram_group as Student['sociogramGroup']) ?? undefined,
    grade:              String(row.grade ?? ''),
  };
}

export function mapStudentToDb(s: Student, schoolYear: string = '2026-2027'): Record<string, unknown> {
  return {
    id:                  s.id,
    order_number:        s.orderNumber,
    full_name:           s.fullName,
    email:               s.email || null,
    birth_place:         s.birthPlace || null,
    birth_state:         s.birthState || null,
    birth_date:          s.birthDate || null,
    school_id:           s.schoolId || '',
    condition:           s.condition || 'Regular',
    siblings:            s.siblings || null,
    mother_name:         s.motherName || null,
    mother_phone:        s.motherPhone || null,
    mother_email:        s.motherEmail || null,
    mother_id:           s.motherId || null,
    father_name:         s.fatherName || null,
    father_phone:        s.fatherPhone || null,
    father_email:        s.fatherEmail || null,
    father_id:           s.fatherId || null,
    home_office_phone:   s.homeOfficePhone || null,
    canvas_accepted:     s.canvasAccepted ?? false,
    canvas_password:     s.canvasPassword || null,
    canvas_observations: s.canvasObservations || null,
    canvas_status:       s.canvasStatus || null,
    sociogram_group:     s.sociogramGroup || null,
    grade:               s.grade,
    school_year:         schoolYear,
    updated_at:          new Date().toISOString(),
  };
}

// ─── External School mappers ──────────────────────────────────────────────────

export function mapDbSchoolToSchool(row: Record<string, unknown>): ExternalSchool {
  return {
    id:               String(row.id ?? ''),
    name:             String(row.name ?? ''),
    emails:           Array.isArray(row.emails) ? (row.emails as string[]) : [],
    contactName:      row.contact_name != null ? String(row.contact_name) : undefined,
    contactPhone:     row.contact_phone != null ? String(row.contact_phone) : undefined,
    secondaryContact: row.secondary_contact != null ? String(row.secondary_contact) : undefined,
    events:           (row.events as IntercollegiateEventsRecord) ?? { futbol: false, beachtennis: false, spelling_bee: false, deletreo_espanol: false, ajedrez: false },
    notes:            row.notes != null ? String(row.notes) : undefined,
    updatedAt:        row.updated_at != null ? String(row.updated_at) : undefined,
  };
}

export function mapSchoolToDb(s: ExternalSchool): Record<string, unknown> {
  return {
    id:                s.id,
    name:              s.name,
    emails:            s.emails ?? [],
    contact_name:      s.contactName || null,
    contact_phone:     s.contactPhone || null,
    secondary_contact: s.secondaryContact || null,
    events:            s.events ?? { futbol: false, beachtennis: false, spelling_bee: false, deletreo_espanol: false, ajedrez: false },
    notes:             s.notes || null,
    updated_at:        s.updatedAt || new Date().toISOString(),
  };
}

// ─── Field Trip mappers ───────────────────────────────────────────────────────

export function mapDbFieldTripToFieldTrip(row: Record<string, unknown>): FieldTrip {
  return {
    id:                   String(row.id ?? ''),
    type:                 (row.type as FieldTripType) ?? 'salida_campo',
    grade:                String(row.grade ?? ''),
    lapso:                String(row.lapso ?? ''),
    weekNumber:           Number(row.week_number ?? 1),
    lapsoSemanaLabel:     row.lapso_semana_label != null ? String(row.lapso_semana_label) : undefined,
    date:                 String(row.date ?? ''),
    destinationOrGuest:   String(row.destination_or_guest ?? ''),
    allianceName:         row.alliance_name != null ? String(row.alliance_name) : undefined,
    contactPhone:         row.contact_phone != null ? String(row.contact_phone) : undefined,
    alliancesOrContacts:  String(row.alliances_or_contacts ?? ''),
    purpose:              String(row.purpose ?? ''),
    subjectOrContext:     String(row.subject_or_context ?? ''),
    projectId:            row.project_id != null ? String(row.project_id) : undefined,
    responsibleTeacher:   String(row.responsible_teacher ?? ''),
    chaperoneTeachers:    row.chaperone_teachers != null ? String(row.chaperone_teachers) : undefined,
    resources:            row.resources != null ? String(row.resources) : undefined,
    focus:                (row.focus as FieldTripFocus) ?? { socialResponsibility: false, citizenParticipation: false, nationalIdentity: false, introspection: false },
    methodology:          String(row.methodology ?? ''),
    keyLearnings:         row.key_learnings != null ? String(row.key_learnings) : undefined,
    observations:         row.observations != null ? String(row.observations) : undefined,
    chaperoneParents:     row.chaperone_parents != null ? String(row.chaperone_parents) : undefined,
    status:               (row.status as FieldTripStatus) ?? 'draft',
    coordinationFeedback: row.coordination_feedback != null ? String(row.coordination_feedback) : undefined,
    transportRequired:    Boolean(row.transport_required ?? false),
    createdAt:            row.created_at != null ? String(row.created_at) : undefined,
    updatedAt:            String(row.updated_at ?? new Date().toISOString()),
  };
}

export function mapFieldTripToDb(f: FieldTrip, schoolYear: string = '2026-2027'): Record<string, unknown> {
  return {
    id:                    f.id,
    type:                  f.type,
    grade:                 f.grade,
    lapso:                 f.lapso,
    week_number:           f.weekNumber,
    lapso_semana_label:    f.lapsoSemanaLabel || null,
    date:                  f.date,
    school_year:           schoolYear,
    destination_or_guest:  f.destinationOrGuest,
    alliance_name:         f.allianceName || null,
    contact_phone:         f.contactPhone || null,
    alliances_or_contacts: f.alliancesOrContacts || '',
    purpose:               f.purpose || '',
    subject_or_context:    f.subjectOrContext || '',
    project_id:            f.projectId || null,
    responsible_teacher:   f.responsibleTeacher || '',
    chaperone_teachers:    f.chaperoneTeachers || null,
    resources:             f.resources || null,
    focus:                 f.focus ?? { socialResponsibility: false, citizenParticipation: false, nationalIdentity: false, introspection: false },
    methodology:           f.methodology || '',
    key_learnings:         f.keyLearnings || null,
    observations:          f.observations || null,
    chaperone_parents:     f.chaperoneParents || null,
    status:                f.status,
    coordination_feedback: f.coordinationFeedback || null,
    transport_required:    f.transportRequired ?? false,
    updated_at:            f.updatedAt || new Date().toISOString(),
  };
}

// ─── Evaluation mappers ───────────────────────────────────────────────────────

export function mapDbEvaluationToEvaluation(row: Record<string, unknown>): EvaluationRecord {
  return {
    id:          String(row.id ?? ''),
    schoolYear:  String(row.school_year ?? '2026-2027'),
    grade:       String(row.grade ?? ''),
    subject:     String(row.subject ?? ''),
    lapso:       (row.lapso as EvaluationLapso) ?? '1er Lapso',
    moment:      (row.moment as EvaluationMoment) ?? 'mensual_1',
    title:       row.title != null ? String(row.title) : undefined,
    teacherId:   String(row.teacher_id ?? ''),
    teacherName: String(row.teacher_name ?? ''),
    status:      (row.status as EvaluationStatus) ?? 'draft',
    grades:      Array.isArray(row.grades) ? (row.grades as StudentGradeEntry[]) : [],
    auditedBy:   row.audited_by != null ? String(row.audited_by) : undefined,
    auditedAt:   row.audited_at != null ? String(row.audited_at) : undefined,
    auditNotes:  row.audit_notes != null ? String(row.audit_notes) : undefined,
    createdAt:   String(row.created_at ?? new Date().toISOString()),
    updatedAt:   String(row.updated_at ?? new Date().toISOString()),
  };
}

export function mapEvaluationToDb(e: EvaluationRecord): Record<string, unknown> {
  return {
    id:           e.id,
    school_year:  e.schoolYear,
    grade:        e.grade,
    subject:      e.subject,
    lapso:        e.lapso,
    moment:       e.moment,
    title:        e.title || null,
    teacher_id:   e.teacherId,
    teacher_name: e.teacherName,
    status:       e.status,
    grades:       e.grades ?? [],
    audited_by:   e.auditedBy || null,
    audited_at:   e.auditedAt || null,
    audit_notes:  e.auditNotes || null,
    updated_at:   e.updatedAt || new Date().toISOString(),
  };
}

// ─── Class Schedule mappers ───────────────────────────────────────────────────

export function mapDbClassScheduleToClassSchedule(row: Record<string, unknown>): ClassSchedule {
  return {
    id:                String(row.id ?? ''),
    schoolYear:        String(row.school_year ?? '2026-2027'),
    grade:             String(row.grade ?? ''),
    lapso:             String(row.lapso ?? ''),
    weekNumber:        Number(row.week_number ?? 1),
    cells:             row.cells && typeof row.cells === 'object' ? (row.cells as Record<string, ClassScheduleCell>) : {},
    notes:             row.notes != null ? String(row.notes) : undefined,
    isSaved:           Boolean(row.is_saved ?? false),
    basedOnWeekNumber: row.based_on_week_number != null ? Number(row.based_on_week_number) : undefined,
    updatedAt:         String(row.updated_at ?? new Date().toISOString()),
    updatedBy:         row.updated_by != null ? String(row.updated_by) : undefined,
  };
}

export function mapClassScheduleToDb(c: ClassSchedule): Record<string, unknown> {
  return {
    id:                   c.id,
    school_year:          c.schoolYear,
    grade:                c.grade,
    lapso:                c.lapso,
    week_number:          c.weekNumber,
    cells:                c.cells ?? {},
    notes:                c.notes || null,
    is_saved:             c.isSaved ?? false,
    based_on_week_number: c.basedOnWeekNumber ?? null,
    updated_at:           c.updatedAt || new Date().toISOString(),
    updated_by:           c.updatedBy || null,
  };
}

// ─── Event Schedule mappers ───────────────────────────────────────────────────

export function mapDbEventScheduleToEventSchedule(row: Record<string, unknown>): EventSchedule {
  return {
    id:               String(row.id ?? ''),
    schoolYear:       row.school_year != null ? String(row.school_year) : undefined,
    title:            String(row.title ?? ''),
    description:      String(row.description ?? ''),
    lapso:            row.lapso != null ? String(row.lapso) : undefined,
    weekNumber:       row.week_number != null ? Number(row.week_number) : undefined,
    dateRange:        row.date_range != null ? String(row.date_range) : undefined,
    targetGrades:     Array.isArray(row.target_grades) ? (row.target_grades as string[]) : [],
    status:           (row.status as EventSchedule['status']) ?? 'draft',
    slots:            Array.isArray(row.slots) ? (row.slots as EventScheduleSlot[]) : [],
    type:             (row.type as EventScheduleType) ?? undefined,
    date:             row.date != null ? String(row.date) : undefined,
    startTime:        row.start_time != null ? String(row.start_time) : undefined,
    endTime:          row.end_time != null ? String(row.end_time) : undefined,
    location:         row.location != null ? String(row.location) : undefined,
    agenda:           Array.isArray(row.agenda) ? (row.agenda as EventScheduleItem[]) : [],
    notes:            row.notes != null ? String(row.notes) : undefined,
    coordinatorNotes: row.coordinator_notes != null ? String(row.coordinator_notes) : undefined,
    createdBy:        row.created_by != null ? String(row.created_by) : undefined,
    createdAt:        String(row.created_at ?? new Date().toISOString()),
    updatedAt:        String(row.updated_at ?? new Date().toISOString()),
  };
}

export function mapEventScheduleToDb(e: EventSchedule): Record<string, unknown> {
  return {
    id:                e.id,
    school_year:       e.schoolYear || null,
    title:             e.title,
    description:       e.description || '',
    lapso:             e.lapso || null,
    week_number:       e.weekNumber ?? null,
    date_range:        e.dateRange || null,
    target_grades:     e.targetGrades ?? [],
    status:            e.status || 'draft',
    slots:             e.slots ?? [],
    type:              e.type || null,
    date:              e.date || null,
    start_time:        e.startTime || null,
    end_time:          e.endTime || null,
    location:          e.location || null,
    agenda:            e.agenda ?? [],
    notes:             e.notes || null,
    coordinator_notes: e.coordinatorNotes || null,
    created_by:        e.createdBy || null,
    updated_at:        e.updatedAt || new Date().toISOString(),
  };
}

// ─── School Year mappers ───────────────────────────────────────────────────────

export function mapDbSchoolYearToLabel(row: Record<string, unknown>): { label: string; isDefault: boolean } {
  return {
    label:     String(row.year_label ?? ''),
    isDefault: Boolean(row.is_default ?? false),
  };
}
