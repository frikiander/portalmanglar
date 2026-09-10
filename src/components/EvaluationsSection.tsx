import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Printer,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  Sparkles,
  Users,
  Calendar,
  BookOpen,
  Info,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  Check,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import {
  EvaluationRecord,
  EvaluationMoment,
  EvaluationLapso,
  GradeScale,
  TestAdaptationType,
  StudentGradeEntry,
  Student,
} from '../types';
import {
  AVAILABLE_SCHOOL_YEARS,
  AVAILABLE_LAPSOS,
  AVAILABLE_EVALUATION_MOMENTS,
  AVAILABLE_SUBJECTS,
  GRADE_SCALE_CONFIG,
  ADAPTATION_CONFIG,
} from '../data/mockEvaluations';
import { SCHOOL_GRADES } from '../data/mockRoster';
import { getGradeColorConfig, getGradeHex, getGradeLeftAccentStyle, GradeBadge, GRADE_COLOR_MAP } from '../utils/gradeColors';
import { EvaluationPrintModal } from './EvaluationPrintModal';
import { EvaluationAuditModal } from './EvaluationAuditModal';
import { EvaluationLapsoMatrix } from './EvaluationLapsoMatrix';

// Quick remark suggestions for teachers
const QUICK_OBSERVATIONS = [
  'Excelente comprensión y resolución autónoma.',
  'Buen dominio conceptual y procedimental.',
  'Requiere afianzar razonamiento lógico y operaciones.',
  'Adaptación de tiempo extendido y lectura guiada (AC-).',
  'Ampliación curricular con reactivos de análisis profundo (AC+).',
  'Inasistencia justificada con reposo médico. Presentará evaluación diferida.',
  'Presentó con apoyo de material concreto y mediación DECE.',
];

export const EvaluationsSection: React.FC = () => {
  const {
    currentUser,
    viewMode,
    evaluations,
    students,
    getOrCreateEvaluation,
    saveEvaluationRecord,
    updateStudentGrade,
    setEvaluationStatus,
    addToast,
    availableSubjectNames,
    availableGradeNames,
  } = useEduPlan();

  // Top Filter Selection State
  const [selectedSchoolYear, setSelectedSchoolYear] = useState<string>('2025-2026');
  const [selectedGrade, setSelectedGrade] = useState<string>('2do Grado');
  const [selectedSubject, setSelectedSubject] = useState<string>('Matemática');
  const [selectedLapso, setSelectedLapso] = useState<EvaluationLapso>('1er Lapso');
  const [selectedMoment, setSelectedMoment] = useState<EvaluationMoment>('mensual_1');

  // View presentation state
  const [activeTab, setActiveTab] = useState<'sheet' | 'matrix' | 'audit_panel'>('sheet');
  const [displayMode, setDisplayMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded' | 'ac' | 'se'>('all');

  // Modals state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Active evaluation record retrieved or instantiated on demand
  const currentEvaluation: EvaluationRecord = useMemo(() => {
    return getOrCreateEvaluation({
      schoolYear: selectedSchoolYear,
      grade: selectedGrade,
      subject: selectedSubject,
      lapso: selectedLapso,
      moment: selectedMoment,
    });
  }, [
    selectedSchoolYear,
    selectedGrade,
    selectedSubject,
    selectedLapso,
    selectedMoment,
    evaluations,
    students,
  ]);

  // Students for the active grade
  const gradeStudents = useMemo(() => {
    const direct = students.filter(
      (s) => s.grade.toLowerCase().trim() === selectedGrade.toLowerCase().trim()
    );
    return direct.length > 0 ? direct : [];
  }, [students, selectedGrade]);

  // Evaluation Grades array mapped to students
  const evalGrades: StudentGradeEntry[] = useMemo(() => {
    return currentEvaluation?.grades || [];
  }, [currentEvaluation]);

  // Safely register or synchronize the evaluation record in EduPlanContext state after rendering
  useEffect(() => {
    const existing = evaluations.find(
      (e) =>
        e.schoolYear === selectedSchoolYear &&
        e.grade.toLowerCase().trim() === selectedGrade.toLowerCase().trim() &&
        e.subject === selectedSubject &&
        e.lapso === selectedLapso &&
        e.moment === selectedMoment
    );
    if (!existing) {
      const record = getOrCreateEvaluation({
        schoolYear: selectedSchoolYear,
        grade: selectedGrade,
        subject: selectedSubject,
        lapso: selectedLapso,
        moment: selectedMoment,
      });
      saveEvaluationRecord(record, true);
    } else {
      const existingStudentIds = new Set(existing.grades.map((g) => g.studentId));
      const hasMissing = gradeStudents.some((s) => !existingStudentIds.has(s.id));
      if (hasMissing) {
        const synced = getOrCreateEvaluation({
          schoolYear: selectedSchoolYear,
          grade: selectedGrade,
          subject: selectedSubject,
          lapso: selectedLapso,
          moment: selectedMoment,
        });
        saveEvaluationRecord(synced, true);
      }
    }
  }, [
    selectedSchoolYear,
    selectedGrade,
    selectedSubject,
    selectedLapso,
    selectedMoment,
    evaluations,
    gradeStudents,
    getOrCreateEvaluation,
    saveEvaluationRecord,
  ]);

  // Statistics calculation
  const totalStudents = evalGrades.length;
  const gradedCount = evalGrades.filter((g) => !!g.gradeValue).length;
  const pendingCount = totalStudents - gradedCount;
  const completionPercentage = totalStudents > 0 ? Math.round((gradedCount / totalStudents) * 100) : 0;

  const scaleCounts: Record<GradeScale, number> = useMemo(() => {
    const counts: Record<GradeScale, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, SE: 0 };
    evalGrades.forEach((g) => {
      if (g.gradeValue) {
        counts[g.gradeValue] = (counts[g.gradeValue] || 0) + 1;
      }
    });
    return counts;
  }, [evalGrades]);

  const adaptationCounts = useMemo(() => {
    let regular = 0;
    let acPlus = 0;
    let acMinus = 0;
    evalGrades.forEach((g) => {
      if (g.adaptation === 'AC+') acPlus++;
      else if (g.adaptation === 'AC-') acMinus++;
      else regular++;
    });
    return { regular, acPlus, acMinus };
  }, [evalGrades]);

  // Filtered rows for UI
  const filteredGrades = useMemo(() => {
    return evalGrades.filter((item) => {
      // Search
      const matchSearch =
        !searchQuery.trim() ||
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.schoolId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.observations && item.observations.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      // Status filter
      if (statusFilter === 'pending') return !item.gradeValue;
      if (statusFilter === 'graded') return !!item.gradeValue;
      if (statusFilter === 'ac') return item.adaptation === 'AC+' || item.adaptation === 'AC-';
      if (statusFilter === 'se') return item.gradeValue === 'SE';

      return true;
    });
  }, [evalGrades, searchQuery, statusFilter]);

  // Handlers for instant updates
  const handleSetGrade = (studentId: string, grade: GradeScale) => {
    const currentVal = evalGrades.find((g) => g.studentId === studentId)?.gradeValue;
    // Toggle if clicking same
    const newVal = currentVal === grade ? undefined : grade;
    updateStudentGrade(currentEvaluation.id, studentId, { gradeValue: newVal });
  };

  const handleSetAdaptation = (studentId: string, adaptation: TestAdaptationType) => {
    updateStudentGrade(currentEvaluation.id, studentId, { adaptation });
  };

  const handleSetObservation = (studentId: string, observations: string) => {
    updateStudentGrade(currentEvaluation.id, studentId, { observations });
  };

  const handleApplyQuickObservation = (studentId: string, text: string) => {
    const currentObs = evalGrades.find((g) => g.studentId === studentId)?.observations || '';
    const newObs = currentObs ? `${currentObs} ${text}` : text;
    updateStudentGrade(currentEvaluation.id, studentId, { observations: newObs });
  };

  const handleBatchFillGrade = (grade: GradeScale) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = evalGrades.map((g) => {
      if (!g.gradeValue) {
        return { ...g, gradeValue: grade, updatedAt: today };
      }
      return g;
    });
    saveEvaluationRecord({ ...currentEvaluation, grades: updated });
    addToast(`Se asignó nota "${grade}" a los ${pendingCount} estudiantes pendientes`, 'info');
  };

  const handleSubmitEvaluation = () => {
    if (pendingCount > 0) {
      if (
        !window.confirm(
          `Aún tienes ${pendingCount} estudiantes sin calificar. ¿Deseas consolidar y enviar a Coordinación de todos modos?`
        )
      ) {
        return;
      }
    }
    setEvaluationStatus(currentEvaluation.id, 'submitted');
  };

  // Group grades by academic level for clear dropdown selection
  const organizedGrades = useMemo(() => {
    const primary = availableGradeNames?.length > 0 ? availableGradeNames : SCHOOL_GRADES;
    return [
      {
        category: 'Educación Primaria',
        grades: primary,
      },
    ];
  }, [availableGradeNames]);

  return (
    <div className="space-y-6">
      {/* SIMPLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Registro de Calificaciones y Adaptaciones
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Colegio Integral El Manglar · Escala cualitativa (A–E, SE) y adaptaciones curriculares
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Imprimir Acta Oficial</span>
          </button>

          {viewMode === 'coordinator' ? (
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#285A14] hover:bg-[#1f4710] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Auditar y Dar Visto Bueno</span>
            </button>
          ) : currentEvaluation.status === 'draft' ? (
            <button
              onClick={handleSubmitEvaluation}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#285A14] hover:bg-[#1f4710] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Consolidar a Coordinación</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{currentEvaluation.status === 'audited' ? 'Auditada' : 'Enviada'}</span>
            </div>
          )}
        </div>
      </div>

      {/* TOP CONFIGURATION SELECTORS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#285A14]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Filtros Académicos de Evaluación
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'sheet'
                  ? 'bg-white text-[#285A14] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Carga de Notas
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'matrix'
                  ? 'bg-white text-[#285A14] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matriz de Lapso
            </button>
            <button
              onClick={() => setActiveTab('audit_panel')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'audit_panel'
                  ? 'bg-white text-[#285A14] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Panel Auditoría
            </button>
          </div>
        </div>

        {/* Quick Primary Grade Selection Pills with Official Identifiers */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 border-b border-slate-100 scrollbar-thin">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Grados Primaria:
          </span>
          {(availableGradeNames?.length > 0 ? availableGradeNames : SCHOOL_GRADES).map((gradeName, idx) => {
            const num = (idx % 6) + 1;
            const isSelected = selectedGrade === gradeName;
            const cfg = GRADE_COLOR_MAP[num as 1 | 2 | 3 | 4 | 5 | 6];
            return (
              <button
                key={gradeName}
                type="button"
                onClick={() => setSelectedGrade(gradeName)}
                style={
                  isSelected && cfg
                    ? {
                        backgroundColor: '#0f172a',
                        borderBottomWidth: '3px',
                        borderBottomColor: cfg.hex,
                        color: '#ffffff',
                      }
                    : undefined
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'shadow-xs border border-slate-800'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {cfg && (
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: cfg.hex }}
                    title={`${cfg.name}: ${cfg.hex}`}
                  />
                )}
                <span>{gradeName}</span>
                {isSelected && cfg && (
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase"
                    style={{ backgroundColor: cfg.hex, color: cfg.textColor }}
                  >
                    Activo
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* The 5 Main Selectors: Grado, Asignatura, Lapso, Momento, Año Escolar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Año Escolar */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Año Escolar
            </label>
            <select
              value={selectedSchoolYear}
              onChange={(e) => setSelectedSchoolYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-[#5EA832] focus:border-transparent transition-all"
            >
              {AVAILABLE_SCHOOL_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Grado */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Grado / Sección
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-[#5EA832] focus:border-transparent transition-all"
            >
              {organizedGrades.map((group) => (
                <optgroup key={group.category} label={group.category}>
                  {group.grades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* 3. Asignatura */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Asignatura
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-[#285A14] focus:ring-2 focus:ring-[#5EA832] focus:border-transparent transition-all"
            >
              {(availableSubjectNames?.length > 0 ? availableSubjectNames : AVAILABLE_SUBJECTS).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Lapso */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Lapso Académico
            </label>
            <select
              value={selectedLapso}
              onChange={(e) => setSelectedLapso(e.target.value as EvaluationLapso)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-[#5EA832] focus:border-transparent transition-all"
            >
              {AVAILABLE_LAPSOS.map((lp) => (
                <option key={lp} value={lp}>
                  {lp}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Momento Evaluativo (Mensual I, II, III, Examen de Lapso) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Momento / Evaluación
            </label>
            <select
              value={selectedMoment}
              onChange={(e) => setSelectedMoment(e.target.value as EvaluationMoment)}
              className="w-full bg-emerald-50/80 border border-emerald-300 rounded-xl px-3 py-2 font-black text-[#285A14] focus:ring-2 focus:ring-[#5EA832] focus:border-transparent transition-all"
            >
              {AVAILABLE_EVALUATION_MOMENTS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.weight})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Momento quick pill tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Momento Rápido:</span>
          {AVAILABLE_EVALUATION_MOMENTS.map((mom) => {
            const isSelected = selectedMoment === mom.id;
            return (
              <button
                key={mom.id}
                onClick={() => setSelectedMoment(mom.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#285A14] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{mom.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {mom.weight}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW CONTENT BASED ON ACTIVE TAB */}
      {activeTab === 'matrix' ? (
        <EvaluationLapsoMatrix
          schoolYear={selectedSchoolYear}
          grade={selectedGrade}
          subject={selectedSubject}
          lapso={selectedLapso}
          students={gradeStudents}
          allEvaluations={evaluations}
          onSelectMoment={(m) => {
            setSelectedMoment(m);
            setActiveTab('sheet');
          }}
        />
      ) : activeTab === 'audit_panel' ? (
        /* AUDIT OVERVIEW PANEL */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Panel Centralizado de Auditoría de Calificaciones</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitoreo de estado de carga, verificación de adecuaciones curriculares y visto bueno de Coordinación Académica.
                </p>
              </div>
            </div>

            {/* Evaluations List in the System */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Grado & Asignatura</th>
                    <th className="py-3 px-3 font-semibold">Lapso / Momento</th>
                    <th className="py-3 px-3 font-semibold">Docente Titular</th>
                    <th className="py-3 px-3 text-center font-semibold">Avance</th>
                    <th className="py-3 px-3 font-semibold">Estado de Auditoría</th>
                    <th className="py-3 px-4 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {evaluations.map((ev) => {
                    const graded = ev.grades.filter((g) => !!g.gradeValue).length;
                    const total = ev.grades.length;
                    const pct = total > 0 ? Math.round((graded / total) * 100) : 0;
                    const isCurrent = ev.id === currentEvaluation.id;

                    return (
                      <tr
                        key={ev.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCurrent ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <GradeBadge grade={ev.grade} size="xs" />
                          </div>
                          <div className="text-[11px] text-[#285A14] font-medium">{ev.subject}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{ev.lapso}</div>
                          <div className="text-[10px] text-slate-500 capitalize">
                            {ev.moment.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">{ev.teacherName}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="font-mono text-xs font-bold text-slate-800">
                            {graded}/{total} ({pct}%)
                          </div>
                          <div className="w-20 mx-auto bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {ev.status === 'audited' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#285A14] border border-emerald-300">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Auditada</span>
                            </span>
                          ) : ev.status === 'submitted' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>En Revisión</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                              <span>Borrador</span>
                            </span>
                          )}
                          {ev.auditedBy && (
                            <div className="text-[9px] text-slate-500 truncate max-w-[140px] mt-0.5">
                              {ev.auditedBy}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedGrade(ev.grade);
                              setSelectedSubject(ev.subject);
                              setSelectedLapso(ev.lapso);
                              setSelectedMoment(ev.moment);
                              setSelectedSchoolYear(ev.schoolYear);
                              setActiveTab('sheet');
                            }}
                            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs transition-all"
                          >
                            Abrir Planilla
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN GRADING SHEET WORKSPACE */
        <div className="space-y-5">
          {/* STATUS & PROGRESS BANNER */}
          <div 
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs"
            style={getGradeLeftAccentStyle(selectedGrade, 6)}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: Overall Progress & Title */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <GradeBadge grade={selectedGrade} size="sm" showDot />
                  <span className="text-xs font-black text-slate-900 tracking-tight">
                    {selectedSubject}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-xs font-bold text-[#285A14]">
                    {selectedLapso} · {AVAILABLE_EVALUATION_MOMENTS.find((m) => m.id === selectedMoment)?.label}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      currentEvaluation.status === 'audited'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : currentEvaluation.status === 'submitted'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {currentEvaluation.status === 'audited'
                      ? '✓ Planilla Auditada y Certificada'
                      : currentEvaluation.status === 'submitted'
                      ? '⏳ Consolidada (Pendiente Auditoría)'
                      : '✎ Borrador en Carga Docente'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div
                      className="bg-gradient-to-r from-[#285A14] to-[#5EA832] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 font-mono shrink-0">
                    {gradedCount}/{totalStudents} Calificados ({completionPercentage}%)
                  </span>
                </div>
              </div>

              {/* Right: Quick Bulk Actions */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Relleno rápido pendientes:
                </span>
                {(['A', 'B', 'C'] as GradeScale[]).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => handleBatchFillGrade(scale)}
                    disabled={pendingCount === 0}
                    className="px-2.5 py-1 text-xs font-black rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700"
                    title={`Asignar ${scale} a los ${pendingCount} pendientes`}
                  >
                    + {scale}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Scale Distribution Badges */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
              {(['A', 'B', 'C', 'D', 'E', 'SE'] as GradeScale[]).map((scale) => {
                const count = scaleCounts[scale] || 0;
                const cfg = GRADE_SCALE_CONFIG[scale];
                const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;

                return (
                  <div
                    key={scale}
                    className={`p-2 rounded-xl border transition-all ${
                      count > 0 ? cfg.bgBadge : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">{scale}</span>
                      <span className="text-[10px] opacity-75 font-mono">{pct}%</span>
                    </div>
                    <div className="text-xs font-black mt-0.5">{count} alumnos</div>
                    <div className="text-[9px] truncate opacity-80 mt-0.5">{cfg.range}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEARCH, FILTER & PRESENTATION BAR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por estudiante, cédula u obs..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[#285A14] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Todos ({evalGrades.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Pendientes ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('graded')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'graded'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Calificados ({gradedCount})
              </button>
              <button
                onClick={() => setStatusFilter('ac')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'ac'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Con Adaptación ({adaptationCounts.acPlus + adaptationCounts.acMinus})
              </button>
              <button
                onClick={() => setStatusFilter('se')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'se'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Sin Evaluación ({scaleCounts.SE})
              </button>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs shrink-0">
              <button
                onClick={() => setDisplayMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  displayMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
                title="Vista Tabla"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode('cards')}
                className={`p-1.5 rounded-lg transition-all ${
                  displayMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
                title="Vista Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STUDENTS EVALUATION LIST: TABLE MODE */}
          {displayMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="py-3 px-3 w-10 text-center font-bold">N°</th>
                      <th className="py-3 px-3 min-w-[220px] font-bold text-slate-900">
                        Estudiante Inscrito
                      </th>
                      <th className="py-3 px-3 min-w-[320px] text-center font-bold text-[#285A14]">
                        Nota (A, B, C, D, E, SE)
                      </th>
                      <th className="py-3 px-3 min-w-[200px] text-center font-bold text-slate-800">
                        Adaptación de la Prueba
                      </th>
                      <th className="py-3 px-3 min-w-[280px] font-bold text-slate-800">
                        Observaciones Pedagógicas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredGrades.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm font-semibold">No se encontraron estudiantes con los filtros actuales.</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Cambia el filtro de búsqueda o el grado seleccionado.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredGrades.map((studentItem, idx) => {
                        const gradeCfg = studentItem.gradeValue
                          ? GRADE_SCALE_CONFIG[studentItem.gradeValue]
                          : null;
                        const adaptCfg = ADAPTATION_CONFIG[studentItem.adaptation];

                        return (
                          <tr
                            key={studentItem.studentId}
                            className={`hover:bg-slate-50/90 transition-colors ${
                              studentItem.gradeValue
                                ? 'bg-white'
                                : 'bg-amber-50/20'
                            }`}
                          >
                            {/* N° */}
                            <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                              {studentItem.orderNumber || idx + 1}
                            </td>

                            {/* Estudiante */}
                            <td className="py-3 px-3 align-top">
                              <div className="font-bold text-slate-900 text-xs">
                                {studentItem.studentName}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                <span>Cédula: {studentItem.schoolId}</span>
                                {studentItem.adaptation !== 'regular' && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] border ${adaptCfg.badgeStyle}`}
                                  >
                                    {adaptCfg.shortLabel}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* SELECTOR DE NOTA VISUAL (A, B, C, D, E, SE) */}
                            <td className="py-3 px-3 align-top">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {(['A', 'B', 'C', 'D', 'E', 'SE'] as GradeScale[]).map((scale) => {
                                  const isSelected = studentItem.gradeValue === scale;
                                  const scaleCfg = GRADE_SCALE_CONFIG[scale];

                                  return (
                                    <button
                                      key={scale}
                                      type="button"
                                      onClick={() => handleSetGrade(studentItem.studentId, scale)}
                                      className={`w-9 h-8 sm:w-10 sm:h-9 rounded-xl font-black text-xs transition-all flex items-center justify-center cursor-pointer ${
                                        isSelected
                                          ? scaleCfg.buttonActive
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 hover:scale-105'
                                      }`}
                                      title={`${scale}: ${scaleCfg.label} (${scaleCfg.range})`}
                                    >
                                      {scale}
                                    </button>
                                  );
                                })}

                                {studentItem.gradeValue && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetGrade(studentItem.studentId, studentItem.gradeValue!)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors ml-1"
                                    title="Quitar nota"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* ADAPTACIÓN DE LA PRUEBA (Regular, AC+, AC-) */}
                            <td className="py-3 px-3 align-top">
                              <div className="flex items-center justify-center bg-slate-100 p-1 rounded-xl gap-1">
                                {(['regular', 'AC+', 'AC-'] as TestAdaptationType[]).map((adapt) => {
                                  const isSelected = studentItem.adaptation === adapt;
                                  const cfg = ADAPTATION_CONFIG[adapt];

                                  return (
                                    <button
                                      key={adapt}
                                      type="button"
                                      onClick={() => handleSetAdaptation(studentItem.studentId, adapt)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                        isSelected
                                          ? cfg.activeStyle
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                      title={cfg.description}
                                    >
                                      {cfg.shortLabel}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>

                            {/* OBSERVACIONES */}
                            <td className="py-3 px-3 align-top space-y-1.5">
                              <input
                                type="text"
                                value={studentItem.observations || ''}
                                onChange={(e) => handleSetObservation(studentItem.studentId, e.target.value)}
                                placeholder="Escribe observación pedagógica..."
                                className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:border-transparent transition-all"
                              />

                              {/* Quick chips if field is empty or has room */}
                              {(!studentItem.observations || studentItem.observations.length < 15) && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {QUICK_OBSERVATIONS.slice(0, 3).map((chip) => (
                                    <button
                                      key={chip}
                                      type="button"
                                      onClick={() => handleApplyQuickObservation(studentItem.studentId, chip)}
                                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-[#285A14] rounded-md transition-all border border-slate-200/60 truncate max-w-[170px]"
                                      title={chip}
                                    >
                                      + {chip}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* STUDENTS EVALUATION LIST: CARDS MODE */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGrades.map((studentItem, idx) => {
                const gradeCfg = studentItem.gradeValue
                  ? GRADE_SCALE_CONFIG[studentItem.gradeValue]
                  : null;
                const adaptCfg = ADAPTATION_CONFIG[studentItem.adaptation];

                return (
                  <div
                    key={studentItem.studentId}
                    className={`p-4 rounded-2xl border transition-all ${
                      studentItem.gradeValue
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-amber-50/30 border-amber-200/80 shadow-2xs'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {studentItem.orderNumber || idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">
                            {studentItem.studentName}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block ml-8">
                          {studentItem.schoolId}
                        </span>
                      </div>

                      {/* Current Grade Badge */}
                      {studentItem.gradeValue ? (
                        <span
                          className={`px-3 py-1 rounded-xl font-black text-sm border ${gradeCfg?.bgBadge}`}
                        >
                          {studentItem.gradeValue}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pendiente
                        </span>
                      )}
                    </div>

                    {/* Grade Selector Pills */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Calificación:
                      </span>
                      <div className="grid grid-cols-6 gap-1">
                        {(['A', 'B', 'C', 'D', 'E', 'SE'] as GradeScale[]).map((scale) => {
                          const isSelected = studentItem.gradeValue === scale;
                          const scaleCfg = GRADE_SCALE_CONFIG[scale];

                          return (
                            <button
                              key={scale}
                              type="button"
                              onClick={() => handleSetGrade(studentItem.studentId, scale)}
                              className={`h-9 rounded-xl font-black text-xs transition-all flex items-center justify-center ${
                                isSelected
                                  ? scaleCfg.buttonActive
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                              }`}
                            >
                              {scale}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Adaptation Selector */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Tipo de Adaptación:
                      </span>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-center">
                        {(['regular', 'AC+', 'AC-'] as TestAdaptationType[]).map((adapt) => {
                          const isSelected = studentItem.adaptation === adapt;
                          const cfg = ADAPTATION_CONFIG[adapt];

                          return (
                            <button
                              key={adapt}
                              type="button"
                              onClick={() => handleSetAdaptation(studentItem.studentId, adapt)}
                              className={`py-1 rounded-lg text-xs font-bold transition-all ${
                                isSelected ? cfg.activeStyle : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {cfg.shortLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Observations */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Observación:
                      </span>
                      <input
                        type="text"
                        value={studentItem.observations || ''}
                        onChange={(e) => handleSetObservation(studentItem.studentId, e.target.value)}
                        placeholder="Observación..."
                        className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* BOTTOM CONTROLS & AUDIT STATUS BAR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <Check className="w-5 h-5 text-[#285A14]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Planilla Centralizada · {currentEvaluation.grade} · {currentEvaluation.subject}
                </p>
                <p className="text-[11px] text-slate-500">
                  Cambios sincronizados localmente en tiempo real. Última actualización:{' '}
                  {currentEvaluation.updatedAt || 'Hoy'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Imprimir Acta</span>
              </button>

              <button
                onClick={() => {
                  saveEvaluationRecord(currentEvaluation);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#285A14] hover:bg-[#1e460e] text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Save className="w-4 h-4 text-emerald-300" />
                <span>Guardar Planilla</span>
              </button>

              {viewMode === 'coordinator' && (
                <button
                  onClick={() => setIsAuditModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#5EA832] hover:bg-[#4d8b28] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Auditar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRINT MODAL */}
      <EvaluationPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        evaluation={currentEvaluation}
      />

      {/* AUDIT MODAL */}
      <EvaluationAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        evaluation={currentEvaluation}
      />
    </div>
  );
};
