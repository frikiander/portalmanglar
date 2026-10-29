/**
 * src/utils/lapsoCalendar.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Where "today" falls inside the school year's three lapsos.
 *
 * Coordinación sets each lapso's start date and number of weeks per school
 * year (Años escolares → Lapsos). Until they do, defaultLapsoConfigs() supplies
 * a starting point.
 */
import type { LapsoConfig, SchoolEvent } from '../types';

/** Weeks per lapso when nothing has been configured (what Horarios used before). */
export const DEFAULT_LAPSO_WEEKS = 15;
export const MIN_LAPSO_WEEKS = 1;
export const MAX_LAPSO_WEEKS = 20;

export const LAPSO_NAMES = ['1er Lapso', '2do Lapso', '3er Lapso'] as const;

// Suggested calendar, sized so the lapsos never overlap (Sep–Dec, Jan–Apr, Apr–Jul).
// yearOffset 0 = first year of "2026-2027", 1 = second. month is 0-based.
const DEFAULT_STARTS = [
  { yearOffset: 0, month: 8, day: 1,  weeks: 15 }, // 1er lapso: semana del 1 de septiembre
  { yearOffset: 1, month: 0, day: 8,  weeks: 14 }, // 2do lapso: semana del 8 de enero
  { yearOffset: 1, month: 3, day: 19, weeks: 12 }, // 3er lapso: semana del 19 de abril
];

const DAY = 86_400_000;

export interface LapsoRange {
  name: string;
  weeks: number;
  start: Date; // Monday of week 1
  end: Date;   // Friday of the last week
}

export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function defaultLapsoConfigs(schoolYear: string): LapsoConfig[] {
  const firstYear = parseInt(schoolYear.slice(0, 4), 10) || new Date().getFullYear();
  return DEFAULT_STARTS.map((s, i) => ({
    name: LAPSO_NAMES[i],
    start: toISODate(mondayOf(new Date(firstYear + s.yearOffset, s.month, s.day))),
    weeks: s.weeks,
  }));
}

export function clampWeeks(n: number): number {
  return Math.max(MIN_LAPSO_WEEKS, Math.min(MAX_LAPSO_WEEKS, Math.round(n) || DEFAULT_LAPSO_WEEKS));
}

/** Last Friday of a lapso that starts on `start` and lasts `weeks` weeks. */
export function lapsoEndDate(start: string, weeks: number): Date {
  const monday = mondayOf(parseISODate(start));
  return new Date(monday.getTime() + ((clampWeeks(weeks) - 1) * 7 + 4) * DAY);
}

/** Problems that make a lapso configuration unusable, in plain language. Empty when valid. */
export function validateLapsoConfigs(configs: LapsoConfig[]): string[] {
  const problems: string[] = [];
  configs.forEach((c, i) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.start)) problems.push(`Falta la fecha de inicio del ${c.name.toLowerCase()}.`);
    if (!Number.isFinite(c.weeks) || c.weeks < MIN_LAPSO_WEEKS || c.weeks > MAX_LAPSO_WEEKS) {
      problems.push(`El ${c.name.toLowerCase()} debe tener entre ${MIN_LAPSO_WEEKS} y ${MAX_LAPSO_WEEKS} semanas.`);
    }
    const next = configs[i + 1];
    if (next && /^\d{4}-\d{2}-\d{2}$/.test(c.start) && /^\d{4}-\d{2}-\d{2}$/.test(next.start)) {
      if (lapsoEndDate(c.start, c.weeks) >= mondayOf(parseISODate(next.start))) {
        problems.push(`El ${c.name.toLowerCase()} termina después de que empieza el ${next.name.toLowerCase()}.`);
      }
    }
  });
  return problems;
}

export interface LapsoPosition {
  lapso: LapsoRange;
  /** 'during' = today is inside the lapso; 'upcoming' = it starts later; 'finished' = the year is over. */
  status: 'during' | 'upcoming' | 'finished';
  /** 1-based week; 0 before the lapso starts. */
  week: number;
  /** 0–1 across the lapso, used to place "today" on the track. */
  progress: number;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function mondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - offset);
  return d;
}

export function getLapsoRanges(configs: LapsoConfig[]): LapsoRange[] {
  return configs.map((c) => {
    const weeks = clampWeeks(c.weeks);
    return { name: c.name, weeks, start: mondayOf(parseISODate(c.start)), end: lapsoEndDate(c.start, weeks) };
  });
}

export function getLapsoPosition(configs: LapsoConfig[], today: Date = new Date()): LapsoPosition {
  const ranges = getLapsoRanges(configs);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  for (const lapso of ranges) {
    if (t < lapso.start.getTime()) return { lapso, status: 'upcoming', week: 0, progress: 0 };
    if (t <= lapso.end.getTime() + 2 * DAY) {
      const elapsed = t - lapso.start.getTime();
      return {
        lapso,
        status: 'during',
        week: Math.min(lapso.weeks, Math.floor(elapsed / (7 * DAY)) + 1),
        progress: Math.min(1, elapsed / (lapso.weeks * 7 * DAY)),
      };
    }
  }
  const last = ranges[ranges.length - 1];
  return { lapso: last, status: 'finished', week: last.weeks, progress: 1 };
}

/** Lapso to work in by default: the one in progress, or the next to start, or the last one. */
export function currentLapsoName(configs: LapsoConfig[], today: Date = new Date()): string {
  return getLapsoPosition(configs, today).lapso.name;
}

/** Events that fall inside the lapso, sorted by date, with their position on the track (0–1). */
export function eventsInLapso(events: SchoolEvent[], lapso: LapsoRange) {
  const from = lapso.start.getTime();
  const to = lapso.end.getTime() + DAY;
  return events
    .map((ev) => ({ ev, date: parseISODate(ev.date) }))
    .filter(({ date }) => date.getTime() >= from && date.getTime() < to)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ ev, date }) => ({ ev, date, at: (date.getTime() - from) / (to - from) }));
}

export function daysUntil(date: Date, today: Date = new Date()): number {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((date.getTime() - t) / DAY);
}

const dateFmt = new Intl.DateTimeFormat('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });
const shortFmt = new Intl.DateTimeFormat('es-VE', { day: 'numeric', month: 'short' });

/** "viernes 6 de noviembre" */
export const formatLongDate = (d: Date) => dateFmt.format(d);
/** "6 nov" */
export const formatShortDate = (d: Date) => shortFmt.format(d).replace('.', '');

/** The next planning-delivery date from today onwards, if any. */
export function nextPlanningDeadline(events: SchoolEvent[], today: Date = new Date()) {
  return events
    .filter((ev) => ev.type === 'planning_deadline')
    .map((ev) => ({ ev, date: parseISODate(ev.date) }))
    .map((x) => ({ ...x, days: daysUntil(x.date, today) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days)[0];
}

/** [[2, 'aprobada', 'aprobadas'], [1, 'borrador', 'borradores']] → "2 aprobadas y 1 borrador". Zero counts are skipped. */
export function joinCounts(parts: Array<[number, string, string]>): string {
  const words = parts.filter(([n]) => n > 0).map(([n, one, many]) => `${n} ${n === 1 ? one : many}`);
  if (words.length <= 1) return words[0] ?? '';
  return `${words.slice(0, -1).join(', ')} y ${words[words.length - 1]}`;
}

/** "hoy", "mañana", "en 5 días" */
export function relativeDays(n: number): string {
  if (n === 0) return 'hoy';
  if (n === 1) return 'mañana';
  if (n === -1) return 'ayer';
  return n > 0 ? `en ${n} días` : `hace ${-n} días`;
}
