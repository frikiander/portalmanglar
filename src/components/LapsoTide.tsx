import React from 'react';
import type { EventType, LapsoConfig, SchoolEvent } from '../types';
import {
  daysUntil,
  eventsInLapso,
  formatShortDate,
  getLapsoPosition,
  relativeDays,
} from '../utils/lapsoCalendar';

/* ─────────────────────────────────────────────────────────────────────────────
 * "La marea del lapso": where we are in the lapso, and what is coming.
 * Elapsed weeks fill with salobre water; milestones use the emblem's shapes
 * (circle, square, triangle) as markers.
 * ──────────────────────────────────────────────────────────────────────────── */

type Milestone = 'planning_deadline' | 'exam' | 'holiday' | 'other';

const MILESTONES: Record<Milestone, { label: string; className: string }> = {
  planning_deadline: { label: 'Entrega de planificación', className: 'text-attention-500' },
  exam:              { label: 'Evaluación',               className: 'text-hoja' },
  holiday:           { label: 'Feriado',                  className: 'text-slate-500' },
  other:             { label: 'Reunión o actividad',      className: 'text-info-600' },
};

const milestoneOf = (type: EventType): Milestone =>
  type === 'planning_deadline' || type === 'exam' || type === 'holiday' ? type : 'other';

export const MilestoneShape: React.FC<{ kind: Milestone; className?: string }> = ({ kind, className = 'w-3 h-3' }) => (
  <svg viewBox="0 0 12 12" className={`${className} ${MILESTONES[kind].className} shrink-0`} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2">
    {kind === 'planning_deadline' && <circle cx="6" cy="6" r="4.4" />}
    {kind === 'exam' && <rect x="1.6" y="1.6" width="8.8" height="8.8" />}
    {kind === 'holiday' && <polygon points="6,1.4 10.8,10.4 1.2,10.4" strokeLinejoin="miter" />}
    {kind === 'other' && <circle cx="6" cy="6" r="2.4" fill="currentColor" stroke="none" />}
  </svg>
);

export interface LapsoTideProps {
  /** The school year's lapsos (start date and weeks), from the context. */
  lapsos: LapsoConfig[];
  events: SchoolEvent[];
  /** The one sentence that says what to do now. */
  headline: React.ReactNode;
  detail?: React.ReactNode;
  action?: React.ReactNode;
  onOpenCalendar?: () => void;
  today?: Date;
}

export const LapsoTide: React.FC<LapsoTideProps> = ({
  lapsos, events, headline, detail, action, onOpenCalendar, today = new Date(),
}) => {
  const pos = getLapsoPosition(lapsos, today);
  const weeks = pos.lapso.weeks;
  const milestones = eventsInLapso(events, pos.lapso);
  const upcoming = milestones.filter(({ date }) => daysUntil(date, today) >= 0).slice(0, 3);

  // Stack markers that would overlap on the same spot
  const lastAtRow: number[] = [];
  const placed = milestones.map((m) => {
    let row = 0;
    while (lastAtRow[row] !== undefined && m.at - lastAtRow[row] < 0.025) row++;
    lastAtRow[row] = m.at;
    return { ...m, row: Math.min(row, 2) };
  });

  const weekLabel =
    pos.status === 'during'   ? <>Semana <strong className="text-raiz">{pos.week}</strong> de {weeks}</> :
    pos.status === 'upcoming' ? <>Empieza el {formatShortDate(pos.lapso.start)}</> :
                                <>Año escolar terminado</>;

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden" aria-labelledby="lapso-tide-title">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-raiz">{pos.lapso.name.replace('Lapso', 'lapso')}</span>
            <span className="mx-2 text-slate-300" aria-hidden>/</span>
            {weekLabel}
          </p>
          <h2 id="lapso-tide-title" className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-raiz max-w-[36ch]">
            {headline}
          </h2>
          {detail && <p className="mt-1.5 text-sm text-slate-600 max-w-[60ch]">{detail}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* ── Track ── */}
      <div className="px-5 sm:px-6 pt-6">
        <div className="relative h-6 mb-1.5" aria-hidden>
          {placed.map(({ ev, date, at, row }) => (
            <span
              key={ev.id}
              title={`${formatShortDate(date)}: ${ev.title}`}
              className="absolute -translate-x-1/2"
              style={{ left: `${at * 100}%`, bottom: row * 9 }}
            >
              <MilestoneShape kind={milestoneOf(ev.type)} />
            </span>
          ))}
        </div>

        <div className="flex gap-[3px] h-9" role="img" aria-label={`Semana ${pos.week} de ${weeks} del ${pos.lapso.name}`}>
          {Array.from({ length: weeks }, (_, i) => {
            const weekStart = i / weeks;
            const fill = Math.max(0, Math.min(1, (pos.progress - weekStart) * weeks));
            const isCurrent = pos.status === 'during' && pos.week === i + 1;
            return (
              <div
                key={i}
                className={`relative flex-1 rounded-[3px] overflow-hidden bg-slate-100 ${isCurrent ? 'outline-2 outline-offset-1 outline-raiz' : ''}`}
              >
                {fill > 0 && (
                  <div
                    className="tide-fill absolute inset-y-0 left-0 bg-info-600"
                    style={{ width: `${fill * 100}%`, animationDelay: `${i * 35}ms` }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-[3px] mt-1.5 text-xs text-slate-500 tabular-nums" aria-hidden>
          {Array.from({ length: weeks }, (_, i) => {
            const w = i + 1;
            const isCurrent = pos.status === 'during' && pos.week === w;
            const showOnMobile = w === 1 || w === weeks || isCurrent;
            return (
              <span
                key={w}
                className={`flex-1 text-center ${isCurrent ? 'font-bold text-raiz' : ''} ${showOnMobile ? '' : 'invisible sm:visible'}`}
              >
                {w}
              </span>
            );
          })}
        </div>

        <ul className="mt-3 flex flex-wrap justify-end gap-x-4 gap-y-1 text-xs text-slate-500">
          {(Object.keys(MILESTONES) as Milestone[]).map((kind) => (
            <li key={kind} className="inline-flex items-center gap-1.5">
              <MilestoneShape kind={kind} className="w-2.5 h-2.5" />
              {MILESTONES[kind].label}
            </li>
          ))}
        </ul>
      </div>

      {/* ── What is coming ── */}
      <div className="mt-4 px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
        <h3 className="text-sm font-bold text-raiz shrink-0">Lo que viene</h3>
        {upcoming.length > 0 ? (
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 flex-1 min-w-0">
            {upcoming.map(({ ev, date }) => (
              <li key={ev.id} className="flex items-center gap-2 min-w-0 text-sm">
                <MilestoneShape kind={milestoneOf(ev.type)} />
                <span className="font-bold text-raiz tabular-nums shrink-0">{formatShortDate(date)}</span>
                <span className="text-slate-600 truncate">{ev.title}</span>
                <span className="text-slate-500 shrink-0">({relativeDays(daysUntil(date, today))})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 flex-1">No hay más fechas registradas en este lapso.</p>
        )}
        {onOpenCalendar && (
          <button
            type="button"
            onClick={onOpenCalendar}
            className="text-sm font-bold text-primary-700 hover:text-primary-800 underline underline-offset-2 decoration-primary-300 shrink-0 cursor-pointer"
          >
            Ver calendario
          </button>
        )}
      </div>
    </section>
  );
};
