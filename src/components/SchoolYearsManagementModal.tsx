import React, { useEffect, useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import type { LapsoConfig } from '../types';
import { Badge, Button, Field, Input, Modal, Select, Tabs } from './ui';
import {
  MAX_LAPSO_WEEKS,
  MIN_LAPSO_WEEKS,
  defaultLapsoConfigs,
  formatLongDate,
  lapsoEndDate,
  validateLapsoConfigs,
} from '../utils/lapsoCalendar';

interface SchoolYearsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Section = 'years' | 'lapsos';

const SECTIONS = [
  { value: 'years' as const,  label: 'Años escolares' },
  { value: 'lapsos' as const, label: 'Lapsos' },
];

export const SchoolYearsManagementModal: React.FC<SchoolYearsManagementModalProps> = ({ isOpen, onClose }) => {
  const [section, setSection] = useState<Section>('years');
  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      title="Años escolares y lapsos"
      subtitle="Configuración que usa todo el portal"
      size="md"
    >
      <Tabs label="Sección" value={section} onChange={setSection} options={SECTIONS} className="mb-5" />
      {section === 'years' ? <YearsSection /> : <LapsosSection />}
    </Modal>
  );
};

// ─── Años escolares ───────────────────────────────────────────────────────────
const YearsSection: React.FC = () => {
  const { availableSchoolYears, defaultSchoolYear, setDefaultSchoolYear, addSchoolYear, deleteSchoolYear, addToast } = useEduPlan();
  const [newYearInput, setNewYearInput] = useState('');
  const [deleteConfirmYear, setDeleteConfirmYear] = useState<string | null>(null);

  const suggestedYear = (() => {
    const [start, end] = (availableSchoolYears[0] ?? '').split(/[-–]/).map((n) => parseInt(n, 10));
    return !isNaN(start) && !isNaN(end) ? `${start + 1}-${end + 1}` : '2027-2028';
  })();

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newYearInput.trim();
    if (!trimmed) {
      addToast('Escribe el año escolar, por ejemplo 2027-2028.', 'warning');
      return;
    }
    if (!/^\d{4}[-–]\d{4}$/.test(trimmed)) {
      addToast('Usa el formato AAAA-AAAA, por ejemplo 2027-2028.', 'info');
    }
    addSchoolYear(trimmed);
    setNewYearInput('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddYear}>
        <Field label="Nuevo año escolar" hint="El año predeterminado es el que ven todos al entrar al portal.">
          {(id, describedBy) => (
            <div className="flex gap-2">
              <Input
                id={id}
                aria-describedby={describedBy}
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                placeholder={suggestedYear}
              />
              <Button type="submit" icon={Plus}>Añadir</Button>
            </div>
          )}
        </Field>
      </form>

      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2">Años registrados ({availableSchoolYears.length})</h3>
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-64 overflow-y-auto">
          {availableSchoolYears.map((year) => {
            const isDefault = year === defaultSchoolYear;
            return (
              <li key={year} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-raiz tabular-nums">{year}</span>
                  {isDefault && <Badge tone="attention"><Star className="w-3 h-3" aria-hidden /> Predeterminado</Badge>}
                </div>

                {!isDefault && (
                  <div className="flex items-center gap-1">
                    {deleteConfirmYear === year ? (
                      <>
                        <span className="text-xs font-bold text-danger-700 mr-1">¿Eliminar {year}?</span>
                        <Button size="sm" variant="danger" onClick={() => { deleteSchoolYear(year); setDeleteConfirmYear(null); }}>
                          Eliminar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleteConfirmYear(null)}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" icon={Star} onClick={() => setDefaultSchoolYear(year)}>
                          Hacer predeterminado
                        </Button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmYear(year)}
                          className="p-1.5 text-slate-500 hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors cursor-pointer"
                          aria-label={`Eliminar ${year}`}
                          title={`Eliminar ${year}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

// ─── Lapsos ───────────────────────────────────────────────────────────────────
const LapsosSection: React.FC = () => {
  const { availableSchoolYears, selectedSchoolYear, getLapsosForYear, updateLapsosForYear } = useEduPlan();
  const [year, setYear] = useState(selectedSchoolYear);
  const [draft, setDraft] = useState<LapsoConfig[]>(() => getLapsosForYear(selectedSchoolYear));
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setDraft(getLapsosForYear(year));
    setTried(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const saved = getLapsosForYear(year);
  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const usesSuggested = JSON.stringify(saved) === JSON.stringify(defaultLapsoConfigs(year));
  const problems = validateLapsoConfigs(draft);

  const update = (i: number, patch: Partial<LapsoConfig>) =>
    setDraft((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const handleSave = () => {
    setTried(true);
    if (problems.length > 0) return;
    updateLapsosForYear(year, draft);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Field label="Año escolar" className="w-40">
          {(id) => (
            <Select id={id} value={year} onChange={(e) => setYear(e.target.value)}>
              {availableSchoolYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          )}
        </Field>
        {usesSuggested && !isDirty && (
          <p className="text-xs text-slate-500 max-w-[34ch] pb-2">
            Este año aún usa fechas sugeridas. Ajústalas al calendario oficial.
          </p>
        )}
      </div>

      <p className="text-sm text-slate-600">
        Horarios, planificación, proyectos de aula y la marea del lapso usan estas semanas.
      </p>

      <ol className="space-y-3">
        {draft.map((lapso, i) => {
          const valid = /^\d{4}-\d{2}-\d{2}$/.test(lapso.start) && lapso.weeks >= MIN_LAPSO_WEEKS && lapso.weeks <= MAX_LAPSO_WEEKS;
          return (
            <li key={lapso.name} className="border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-raiz">{lapso.name.replace('Lapso', 'lapso')}</h3>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
                <Field label="Empieza la semana del">
                  {(id) => (
                    <Input id={id} type="date" value={lapso.start} onChange={(e) => update(i, { start: e.target.value })} />
                  )}
                </Field>
                <Field label="Semanas">
                  {(id) => (
                    <Input
                      id={id}
                      type="number"
                      min={MIN_LAPSO_WEEKS}
                      max={MAX_LAPSO_WEEKS}
                      value={Number.isFinite(lapso.weeks) ? lapso.weeks : ''}
                      onChange={(e) => update(i, { weeks: parseInt(e.target.value, 10) })}
                    />
                  )}
                </Field>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {valid ? <>Termina el {formatLongDate(lapsoEndDate(lapso.start, lapso.weeks))}.</> : 'Completa la fecha y las semanas.'}
              </p>
            </li>
          );
        })}
      </ol>

      {tried && problems.length > 0 && (
        <ul role="alert" className="p-3 rounded-md bg-danger-50 border border-danger-200 text-sm text-danger-800 space-y-1">
          {problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" className="mr-auto" onClick={() => setDraft(defaultLapsoConfigs(year))}>
          Usar fechas sugeridas
        </Button>
        {isDirty && <Button variant="secondary" size="sm" onClick={() => setDraft(saved)}>Descartar cambios</Button>}
        <Button size="sm" onClick={handleSave} disabled={!isDirty}>Guardar lapsos</Button>
      </div>
    </div>
  );
};
