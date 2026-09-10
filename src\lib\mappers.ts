/**
 * mappers.ts
 * Bidirectional type converters between the Supabase DB schema (snake_case)
 * and the application TypeScript types (camelCase).
 */
import type { User, AcademicSubject } from '../types';

// ─── User mappers ──────────────────────────────────────────────────────────────

/** Convert a Supabase `users` row → app `User` */
export function mapDbUserToUser(row: Record<string, unknown>): User {
  return {
    id:               String(row.id ?? ''),
    email:            String(row.email ?? ''),
    fullName:         String(row.full_name ?? ''),
    role:             (row.role as User['role']) ?? 'teacher',
    avatar:           String(row.avatar_url ?? ''),
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

/** Convert an app `User` → Supabase `users` row for upsert */
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

/** Convert a Supabase `subjects` row → app `AcademicSubject` */
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

/** Convert an app `AcademicSubject` → Supabase `subjects` row for upsert */
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
