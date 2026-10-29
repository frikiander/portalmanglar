/**
 * src/utils/planDays.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * School days for lesson plans: a plan belongs to one subject, one grade,
 * one week of the lapso and one weekday (Monday to Friday).
 */
import type { LapsoConfig, LessonPlan, ScheduleDay } from '../types';
import { currentLapsoName, getLapsoRanges } from './lapsoCalendar';

export const SCHOOL_DAYS: ScheduleDay[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

/** Calendar date of a weekday in a week of the current lapso, or null when the lapso is unknown. */
export function dateForWeekDay(lapsos: LapsoConfig[], week: number, day: ScheduleDay): Date | null {
  const lapso = getLapsoRanges(lapsos).find((l) => l.name === currentLapsoName(lapsos));
  if (!lapso) return null;
  const d = new Date(lapso.start);
  d.setDate(d.getDate() + (week - 1) * 7 + SCHOOL_DAYS.indexOf(day));
  return d;
}

const dayMonth = new Intl.DateTimeFormat('es-VE', { day: 'numeric', month: 'long' });
/** "15 de septiembre" */
export const formatDayMonth = (d: Date) => dayMonth.format(d);

/** "Semana 3, martes" — or "Semana 3" for plans saved before days existed. */
export function planWhen(plan: Pick<LessonPlan, 'weekNumber' | 'dayOfWeek'>): string {
  return plan.dayOfWeek ? `Semana ${plan.weekNumber}, ${plan.dayOfWeek.toLowerCase()}` : `Semana ${plan.weekNumber}`;
}

/** The plan a teacher has for this subject, grade, week and day (if any). */
export function findDayPlan(
  plans: LessonPlan[],
  q: { teacherId: string; subject: string; grade: string; week: number; day: ScheduleDay },
): LessonPlan | undefined {
  return plans.find(
    (p) =>
      p.teacherId === q.teacherId &&
      p.subject === q.subject &&
      p.grade === q.grade &&
      p.weekNumber === q.week &&
      p.dayOfWeek === q.day,
  );
}
