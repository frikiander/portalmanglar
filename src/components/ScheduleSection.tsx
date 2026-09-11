import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Copy,
  Printer,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Sparkles,
  Info,
  CalendarDays,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Save,
  Inbox,
  GripVertical,
  SlidersHorizontal,
  Undo2,
  Check,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import {
  ScheduleDay,
  ClassScheduleCell,
  EventSchedule,
  EventScheduleType,
  SubjectCategory,
} from '../types';
import {
  SCHEDULE_DAYS,
  SCHEDULE_TIME_SLOTS,
  GRADE_LIST,
  CATEGORY_STYLES,
  BREAK_SLOTS,
  detectSubjectCategory,
} from '../data/mockSchedules';
import { ScheduleCellModal } from './ScheduleCellModal';
import { EventScheduleModal } from './EventScheduleModal';
import { ScheduleLateralDrawer } from './ScheduleLateralDrawer';
import { GRADE_COLORS } from '../utils/gradeColors';

type ActiveScheduleTab = 'class_schedules' | 'event_schedules';

export const ScheduleSection: React.FC = () => {
  const {
    viewMode,
    currentUser,
    classSchedules,
    eventSchedules,
    selectedScheduleGrade,
    setSelectedScheduleGrade,
    selectedScheduleLapso,
    setSelectedScheduleLapso,
    selectedScheduleWeek,
    setSelectedScheduleWeek,
    updateScheduleCell,
    saveWeekClassSchedule,
    copyScheduleFromWeek,
    addEventSchedule,
    updateEventSchedule,
    deleteEventSchedule,
    resetClassSchedules,
    selectedSchoolYear,
    currentSchoolYear,
    isViewingHistoricalYear,
  } = useEduPlan();

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveScheduleTab>('class_schedules');

  // Lateral Drawer State for Drag & Drop tray & quick subjects
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [unassignedTray, setUnassignedTray] = useState<ClassScheduleCell[]>([]);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<{
    type: 'cell' | 'unassigned' | 'palette';
    cell?: ClassScheduleCell;
    sourceKey?: string;
    subject?: string;
    category?: SubjectCategory;
    unassignedIndex?: number;
    defaultRoom?: string;
  } | null>(null);

  // Modal State for Class Cell Editing
  const [editingCellCoords, setEditingCellCoords] = useState<{
    day: ScheduleDay;
    timeSlot: string;
    cell?: ClassScheduleCell;
  } | null>(null);

  // Modal State for Event Schedule Editing/Creation (Coordinator)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventSchedule | null>(null);

  // Copy Week Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceLapso, setCopySourceLapso] = useState(selectedScheduleLapso);
  const [copySourceWeek, setCopySourceWeek] = useState(1);

  // Event filter & search
  const [eventSearch, setEventSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [eventGradeFilter, setEventGradeFilter] = useState<string>('all');

  // Lapsos available
  const LAPSOS = ['1er Lapso', '2do Lapso', '3er Lapso'];
  // Weeks 1 to 15
  const WEEKS = Array.from({ length: 15 }, (_, i) => i + 1);

  // 1. Filter class schedules for the currently selected school year
  const yearClassSchedules = useMemo(() => {
    return classSchedules.filter(
      (s) => (s.schoolYear || currentSchoolYear) === selectedSchoolYear
    );
  }, [classSchedules, selectedSchoolYear, currentSchoolYear]);

  // 2. Active Class Schedule resolution with Week-to-Week automatic inheritance
  const { activeScheduleRecord, isExplicitlySaved, inheritedFromWeek } = useMemo(() => {
    // A. Check if exact record exists for this grade, lapso, and week in this school year
    const exact = yearClassSchedules.find(
      (s) =>
        s.grade === selectedScheduleGrade &&
        s.lapso === selectedScheduleLapso &&
        s.weekNumber === selectedScheduleWeek &&
        s.isSaved === true
    );
    if (exact) {
      return { activeScheduleRecord: exact, isExplicitlySaved: true, inheritedFromWeek: null };
    }

    // B. Check if a prior week exists in the same lapso and school year (takes previous week as base)
    if (selectedScheduleWeek > 1) {
      for (let w = selectedScheduleWeek - 1; w >= 1; w--) {
        const prior = yearClassSchedules.find(
          (s) =>
            s.grade === selectedScheduleGrade &&
            s.lapso === selectedScheduleLapso &&
            s.weekNumber === w
        );
        if (prior) {
          return { activeScheduleRecord: prior, isExplicitlySaved: false, inheritedFromWeek: w };
        }
      }
    }

    // C. Fallback: match any week of same grade and lapso
    const sameLapso = yearClassSchedules.find(
      (s) => s.grade === selectedScheduleGrade && s.lapso === selectedScheduleLapso
    );
    if (sameLapso) {
      return { activeScheduleRecord: sameLapso, isExplicitlySaved: false, inheritedFromWeek: sameLapso.weekNumber };
    }

    // D. Ultimate fallback: same grade institutional template
    const sameGrade = yearClassSchedules.find((s) => s.grade === selectedScheduleGrade);
    return {
      activeScheduleRecord: sameGrade || null,
      isExplicitlySaved: false,
      inheritedFromWeek: sameGrade?.weekNumber || 13,
    };
  }, [yearClassSchedules, selectedScheduleGrade, selectedScheduleLapso, selectedScheduleWeek]);

  // Local state for cells to enable smooth, real-time Drag and Drop editing
  const [localCells, setLocalCells] = useState<Record<string, ClassScheduleCell>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Synchronize local cells whenever active schedule record or view criteria changes
  useEffect(() => {
    if (activeScheduleRecord?.cells) {
      setLocalCells({ ...activeScheduleRecord.cells });
    } else {
      setLocalCells({});
    }
    setHasUnsavedChanges(false);
  }, [
    activeScheduleRecord?.id,
    activeScheduleRecord?.updatedAt,
    selectedScheduleGrade,
    selectedScheduleLapso,
    selectedScheduleWeek,
    selectedSchoolYear,
  ]);

  // Check if current week in localCells has any variations/custom notes
  const currentWeekVariations = useMemo(() => {
    const list: { day: ScheduleDay; timeSlot: string; cell: ClassScheduleCell }[] = [];
    Object.entries(localCells).forEach(([key, rawCell]) => {
      const cell = rawCell as ClassScheduleCell;
      if (cell && (cell.hasVariation || cell.isVariation || cell.variationNote || cell.note)) {
        const [day, timeSlot] = key.split('_') as [ScheduleDay, string];
        list.push({ day, timeSlot, cell });
      }
    });
    return list;
  }, [localCells]);

  // List of weeks that have schedules with variations for the current grade & lapso
  const weeksWithVariations = useMemo(() => {
    const weeksSet = new Set<number>();
    yearClassSchedules
      .filter(
        (s) => s.grade === selectedScheduleGrade && s.lapso === selectedScheduleLapso
      )
      .forEach((s) => {
        const hasVar = Object.values(s.cells || {}).some(
          (rawC) => {
            const c = rawC as ClassScheduleCell;
            return c && (c.hasVariation || c.isVariation || c.variationNote || c.note);
          }
        );
        if (hasVar) weeksSet.add(s.weekNumber);
      });
    return weeksSet;
  }, [yearClassSchedules, selectedScheduleGrade, selectedScheduleLapso]);

  // List of weeks that are explicitly saved for current grade and lapso
  const weeksWithExplicitSave = useMemo(() => {
    const set = new Set<number>();
    yearClassSchedules
      .filter(
        (s) =>
          s.grade === selectedScheduleGrade &&
          s.lapso === selectedScheduleLapso &&
          s.isSaved === true
      )
      .forEach((s) => set.add(s.weekNumber));
    return set;
  }, [yearClassSchedules, selectedScheduleGrade, selectedScheduleLapso]);

  // Handlers for cell modal editing
  const handleCellClick = (day: ScheduleDay, timeSlot: string) => {
    const isBreak = BREAK_SLOTS.some((b) => b.time === timeSlot);
    if (isBreak && viewMode !== 'coordinator') return; // Breaks are standard institutional times

    const cellKey = `${day}_${timeSlot}`;
    const cell = localCells[cellKey];
    setEditingCellCoords({ day, timeSlot, cell });
  };

  const handleSaveCell = (newCell: ClassScheduleCell) => {
    if (!editingCellCoords) return;
    const key = `${editingCellCoords.day}_${editingCellCoords.timeSlot}`;
    setLocalCells((prev) => ({
      ...prev,
      [key]: newCell,
    }));
    setHasUnsavedChanges(true);
    setEditingCellCoords(null);
  };

  const handleClearCell = () => {
    if (!editingCellCoords) return;
    const key = `${editingCellCoords.day}_${editingCellCoords.timeSlot}`;
    setLocalCells((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setHasUnsavedChanges(true);
    setEditingCellCoords(null);
  };

  // Move a cell to unassigned tray
  const handleMoveCellToTray = (day: ScheduleDay, slot: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const key = `${day}_${slot}`;
    const cell = localCells[key];
    if (!cell || !cell.subject || cell.subject === 'Libre / Estudio') return;

    setUnassignedTray((prev) => [cell, ...prev]);
    setLocalCells((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Save current week schedule permanently as an independent record
  const handleSaveCurrentWeekSchedule = () => {
    saveWeekClassSchedule({
      schoolYear: selectedSchoolYear,
      grade: selectedScheduleGrade,
      lapso: selectedScheduleLapso,
      weekNumber: selectedScheduleWeek,
      cells: localCells,
      basedOnWeekNumber: inheritedFromWeek || undefined,
    });
    setHasUnsavedChanges(false);
  };

  // Drag and Drop Handlers
  const handleCellDragStart = (
    e: React.DragEvent,
    day: ScheduleDay,
    slot: string,
    cell: ClassScheduleCell
  ) => {
    const sourceKey = `${day}_${slot}`;
    const payload = { type: 'cell' as const, sourceKey, cell };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    setActiveDragItem(payload);
  };

  const handleCellDragOver = (e: React.DragEvent, cellKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverKey !== cellKey) {
      setDragOverKey(cellKey);
    }
  };

  const handleCellDrop = (
    e: React.DragEvent,
    targetDay: ScheduleDay,
    targetSlot: string
  ) => {
    e.preventDefault();
    setDragOverKey(null);
    const targetKey = `${targetDay}_${targetSlot}`;

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const payload = JSON.parse(dataStr);
      const currentTargetCell = localCells[targetKey];

      setLocalCells((prev) => {
        const updated = { ...prev };

        // Case 1: Dragged from another cell in schedule
        if (payload.type === 'cell' && payload.sourceKey) {
          const sourceKey = payload.sourceKey;
          if (sourceKey === targetKey) return prev; // same cell

          const sourceCell = payload.cell || prev[sourceKey];
          if (currentTargetCell && currentTargetCell.subject && currentTargetCell.subject !== 'Libre / Estudio') {
            // Swap both cells
            updated[sourceKey] = currentTargetCell;
          } else {
            // Move and clear source
            delete updated[sourceKey];
          }
          updated[targetKey] = sourceCell;
          return updated;
        }

        // Case 2: Dragged from Unassigned Tray
        if (payload.type === 'unassigned') {
          const incomingCell = payload.cell as ClassScheduleCell;
          if (currentTargetCell && currentTargetCell.subject && currentTargetCell.subject !== 'Libre / Estudio') {
            // Displace target cell back to unassigned tray (swap)
            setUnassignedTray((tray) => {
              const newTray = [...tray];
              if (typeof payload.index === 'number') {
                newTray.splice(payload.index, 1, currentTargetCell);
              } else {
                newTray.push(currentTargetCell);
              }
              return newTray;
            });
          } else {
            // Remove placed item from tray
            if (typeof payload.index === 'number') {
              setUnassignedTray((tray) => tray.filter((_, i) => i !== payload.index));
            }
          }
          updated[targetKey] = incomingCell;
          return updated;
        }

        // Case 3: Dragged from Quick Palette
        if (payload.type === 'palette') {
          const newCell: ClassScheduleCell = {
            subject: payload.subject,
            category: payload.category || detectSubjectCategory(payload.subject),
            classroom: payload.defaultRoom || '',
          };
          if (currentTargetCell && currentTargetCell.subject && currentTargetCell.subject !== 'Libre / Estudio') {
            // Move displaced cell into unassigned tray so nothing is lost
            setUnassignedTray((tray) => [currentTargetCell, ...tray]);
          }
          updated[targetKey] = newCell;
          return updated;
        }

        return prev;
      });

      setHasUnsavedChanges(true);
    } catch (err) {
      console.error('Error on schedule cell drop:', err);
    } finally {
      setActiveDragItem(null);
    }
  };

  // Drop onto unassigned tray (pulling out of schedule)
  const handleDropToUnassigned = (cellToPark: ClassScheduleCell) => {
    if (activeDragItem?.type === 'cell' && activeDragItem.sourceKey) {
      setLocalCells((prev) => {
        const next = { ...prev };
        delete next[activeDragItem.sourceKey!];
        return next;
      });
      setHasUnsavedChanges(true);
    }
    setUnassignedTray((prev) => [cellToPark, ...prev]);
    setActiveDragItem(null);
  };

  const handleExecuteCopy = () => {
    copyScheduleFromWeek({
      targetLapso: selectedScheduleLapso,
      targetWeek: selectedScheduleWeek,
      sourceLapso: copySourceLapso,
      sourceWeek: copySourceWeek,
      grade: selectedScheduleGrade,
    });
    // Immediately mirror source cells locally
    const sourceSched = yearClassSchedules.find(
      (s) =>
        s.grade === selectedScheduleGrade &&
        s.lapso === copySourceLapso &&
        s.weekNumber === copySourceWeek
    );
    if (sourceSched?.cells) {
      setLocalCells({ ...sourceSched.cells });
      setHasUnsavedChanges(true);
    }
    setIsCopyModalOpen(false);
  };

  // Filtered Event Schedules
  const filteredEventSchedules = useMemo(() => {
    return eventSchedules.filter((evt) => {
      // Respect School Year filter
      const matchYear = !evt.schoolYear || evt.schoolYear === selectedSchoolYear;
      if (!matchYear) return false;

      const matchSearch =
        !eventSearch.trim() ||
        evt.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
        evt.description.toLowerCase().includes(eventSearch.toLowerCase()) ||
        evt.location.toLowerCase().includes(eventSearch.toLowerCase());

      const matchType = eventTypeFilter === 'all' || evt.type === eventTypeFilter;

      const matchGrade =
        eventGradeFilter === 'all' ||
        evt.targetGrades.includes('Todos los Grados') ||
        evt.targetGrades.includes(eventGradeFilter);

      return matchSearch && matchType && matchGrade;
    });
  }, [eventSchedules, selectedSchoolYear, eventSearch, eventTypeFilter, eventGradeFilter]);

  const handlePrint = () => {
    window.print();
  };

  const gradeColor = GRADE_COLORS[selectedScheduleGrade] || '#00B2A9';

  return (
    <div id="schedule-module-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#00B2A9]">
                Módulo Académico & Coordinación
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700">
                {viewMode === 'coordinator' ? 'Vista de Coordinación' : 'Vista del Docente'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center space-x-3">
              <Clock className="w-7 h-7 text-[#00B2A9]" />
              <span>Gestión de Horarios y Cronogramas</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Horarios semanales de clase con seguimiento de variaciones para docentes, y cronogramas de eventos especiales organizados por Coordinación Pedagógica.
            </p>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start lg:self-auto">
            <button
              id="tab-class-schedules"
              onClick={() => setActiveTab('class_schedules')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'class_schedules'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-[#00B2A9]" />
              <span>Horarios de Clase</span>
            </button>

            <button
              id="tab-event-schedules"
              onClick={() => setActiveTab('event_schedules')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'event_schedules'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <span>Horarios de Eventos</span>
              {eventSchedules.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                  {eventSchedules.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HORARIOS DE CLASE                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'class_schedules' && (
        <div className="space-y-5">
          {/* Controls Bar: Grade, Lapso, Week Selector & Actions */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
            {/* Top Tier: Grade Selector & Secondary Actions Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0">
                  Grado Escolar:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {GRADE_LIST.map((grade) => {
                    const isSelected = selectedScheduleGrade === grade;
                    const gColor = GRADE_COLORS[grade] || '#00B2A9';
                    return (
                      <button
                        key={grade}
                        id={`btn-grade-${grade.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => setSelectedScheduleGrade(grade)}
                        style={{
                          borderColor: isSelected ? gColor : '#E2E8F0',
                          backgroundColor: isSelected ? `${gColor}15` : '#FFFFFF',
                          color: isSelected ? gColor : '#475569',
                        }}
                        className={`text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'shadow-xs ring-2 ring-offset-1'
                            : 'hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {grade}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toolbar: Copy, Print, Reset */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
                <button
                  id="btn-copy-schedule-week"
                  onClick={() => setIsCopyModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                  title="Copiar horario desde otra semana para no empezar de cero"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Semana</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  title="Imprimir vista de horario"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>

                <button
                  onClick={resetClassSchedules}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Restablecer a plantilla institucional por defecto"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mid Tier: Lapso Segmented Selector & Active Week Stepper */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              {/* Lapso Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Período:
                </span>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  {LAPSOS.map((lapso) => (
                    <button
                      key={lapso}
                      onClick={() => setSelectedScheduleLapso(lapso)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedScheduleLapso === lapso
                          ? 'bg-white text-[#3A6B1F] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lapso}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Week Stepper Controller */}
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <button
                  id="btn-prev-week"
                  onClick={() => setSelectedScheduleWeek(Math.max(1, selectedScheduleWeek - 1))}
                  disabled={selectedScheduleWeek <= 1}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-xs font-bold flex items-center space-x-1 transition-all shadow-2xs"
                  title="Ir a la semana anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-xs flex items-center space-x-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Semana {selectedScheduleWeek} de 15</span>
                </div>

                <button
                  id="btn-next-week"
                  onClick={() => setSelectedScheduleWeek(Math.min(15, selectedScheduleWeek + 1))}
                  disabled={selectedScheduleWeek >= 15}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-xs font-bold flex items-center space-x-1 transition-all shadow-2xs"
                  title="Ir a la semana siguiente"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Tier: Full 15-Week Timeline Matrix (Clean, responsive, NO HORIZONTAL SCROLLBAR!) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Semanas del Lapso:
                  </span>
                  <span className="text-[11px] text-slate-400 hidden md:inline">
                    (Haz clic directo en cualquier semana para editar o consultar)
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-500">
                  <span className="inline-flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Guardada</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Variaciones</span>
                  </span>
                </div>
              </div>

              {/* 15 Week Adaptive Grid without any overflow-x scrollbar */}
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1.5 sm:gap-2">
                {WEEKS.map((w) => {
                  const isSelected = selectedScheduleWeek === w;
                  const isSaved = weeksWithExplicitSave.has(w);
                  const hasVar = weeksWithVariations.has(w);
                  return (
                    <button
                      key={w}
                      id={`btn-week-chip-${w}`}
                      onClick={() => setSelectedScheduleWeek(w)}
                      className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border text-center ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/60 scale-[1.04] z-10'
                          : isSaved
                          ? 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                      }`}
                      title={`Semana ${w}: ${
                        isSaved
                          ? 'Horario guardado oficialmente para esta semana'
                          : 'Hereda horario de la semana anterior'
                      }${hasVar ? ' (contiene variaciones)' : ''}`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-tight leading-none ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}>
                        SEM
                      </span>
                      <span className="text-sm font-black tracking-tight leading-none mt-1">
                        {w}
                      </span>

                      {/* Dots row */}
                      <div className="flex items-center space-x-1 mt-1 h-1.5">
                        {isSaved && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-emerald-400' : 'bg-emerald-500'
                            }`}
                            title="Horario guardado para esta semana"
                          />
                        )}
                        {hasVar && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-amber-500"
                            title="Contiene variaciones semanales"
                          />
                        )}
                        {!isSaved && !hasVar && (
                          <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-slate-500' : 'bg-transparent'}`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status & Save Action Bar */}
          <div
            style={{ borderLeftColor: gradeColor }}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 border-l-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          >
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Horario Institucional
                </span>
                <span className="text-slate-300">·</span>
                <span
                  style={{ backgroundColor: `${gradeColor}20`, color: gradeColor }}
                  className="text-xs font-extrabold px-2.5 py-0.5 rounded-full"
                >
                  {selectedScheduleGrade}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Año {selectedSchoolYear}
                </span>
                {isViewingHistoricalYear && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Histórico
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase mt-1">
                HORARIO {selectedScheduleGrade} · SEMANA {selectedScheduleWeek} ({selectedScheduleLapso})
              </h2>

              {/* Weekly Inheritance & Save Status Badge */}
              <div className="mt-1.5 flex items-center space-x-2 flex-wrap gap-y-1">
                {hasUnsavedChanges ? (
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Modificaciones pendientes por guardar para la Semana {selectedScheduleWeek}</span>
                  </div>
                ) : !isExplicitlySaved ? (
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-300">
                    <CalendarCheck className="w-3.5 h-3.5 text-sky-600" />
                    <span>Tomando de base la Semana {inheritedFromWeek || 1} · Aún no guardado independientemente</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Horario oficial guardado para la Semana {selectedScheduleWeek}</span>
                  </div>
                )}

                {currentWeekVariations.length > 0 && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                    {currentWeekVariations.length} variaciones registradas
                  </span>
                )}
              </div>
            </div>

            {/* Save Button & Drawer Toggle Controls */}
            <div className="flex items-center space-x-2.5 self-start lg:self-center shrink-0">
              <button
                id="btn-toggle-subject-drawer"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all border ${
                  isDrawerOpen
                    ? 'bg-slate-100 text-slate-800 border-slate-300'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50 shadow-2xs'
                }`}
                title="Mostrar u ocultar la barra lateral de asignaturas"
              >
                <Layers className="w-4 h-4 text-[#3A6B1F]" />
                <span>{isDrawerOpen ? 'Contraer Panel' : 'Panel de Asignaturas'}</span>
                {unassignedTray.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                    {unassignedTray.length}
                  </span>
                )}
              </button>

              <button
                id="btn-save-week-schedule"
                onClick={handleSaveCurrentWeekSchedule}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 transition-all shadow-xs ${
                  hasUnsavedChanges || !isExplicitlySaved
                    ? 'bg-[#5EA832] text-white hover:bg-[#3A6B1F] ring-2 ring-emerald-400/40 shadow-md transform hover:-translate-y-0.5'
                    : 'bg-emerald-50 text-[#3A6B1F] border border-emerald-300 hover:bg-emerald-100'
                }`}
                title="Guarda este horario exclusivamente para esta semana del año escolar seleccionado"
              >
                <Save className="w-4 h-4" />
                <span>
                  {hasUnsavedChanges
                    ? `Guardar Horario (Semana ${selectedScheduleWeek})`
                    : !isExplicitlySaved
                    ? `Guardar como Horario Semana ${selectedScheduleWeek}`
                    : `Horario Guardado`}
                </span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Content: Schedule Grid on Left + Draggable Lateral Drawer on Right */}
          <div className="flex flex-col xl:flex-row gap-5 items-start">
            {/* Left Column: Color Legend & Timetable Grid */}
            <div className="flex-1 w-full min-w-0 space-y-4">
              {/* Color Legend based directly on Excel */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-600" />
                  <span>Convención de Colores Institucional (según Excel):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg border font-semibold bg-[#FFF9C4] border-[#FBC02D] text-[#614A00]">
                    Matemática
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg border font-semibold bg-[#E8F5E9] border-[#81C784] text-[#1B5E20]">
                    Lenguaje / Castellano
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg border font-semibold bg-[#E3F2FD] border-[#90CAF9] text-[#0D47A1]">
                    Inglés
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg border font-semibold bg-[#E0F7FA] border-[#80DEEA] text-[#006064]">
                    Proyecto de Aula / Ciencias
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg border font-semibold bg-[#FFF3E0] border-[#FFB74D] text-[#E65100]">
                    Ed. Física / Deporte
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg border font-semibold bg-[#FCE4EC] border-[#F48FB1] text-[#880E4F]">
                    Arte / Música / Robótica
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg border font-semibold bg-[#F5F5F5] border-[#E0E0E0] text-[#424242]">
                    Recesos / Desayuno / Almuerzo
                  </span>
                </div>
              </div>

              {/* Main Timetable Grid with Full Drag and Drop Interactivity */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    {/* Header Row: Days */}
                    <thead>
                      <tr className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider">
                        <th className="p-3.5 w-36 text-center border-r border-slate-800 bg-slate-950">
                          Horario
                        </th>
                        {SCHEDULE_DAYS.map((day) => (
                          <th
                            key={day}
                            className="p-3.5 text-center border-r border-slate-800 last:border-r-0"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Body Rows: Time Slots */}
                    <tbody className="divide-y divide-slate-200">
                      {SCHEDULE_TIME_SLOTS.map((slot) => {
                        const isBreak = BREAK_SLOTS.find((b) => b.time === slot);

                        // If it's a break slot (Desayuno, Recreo, Almuerzo, Despacho)
                        if (isBreak) {
                          return (
                            <tr key={slot} className="bg-slate-100/90 text-center font-bold text-xs text-slate-700">
                              <td className="p-2.5 text-center bg-slate-200/80 border-r border-slate-300 font-mono text-[11px] text-slate-600">
                                {slot}
                              </td>
                              <td
                                colSpan={5}
                                className="p-2.5 bg-slate-100 text-slate-600 font-extrabold uppercase tracking-widest text-[11px] border-r border-slate-200"
                              >
                                <span className="inline-flex items-center space-x-1.5 text-slate-700 bg-white/70 px-3 py-1 rounded-full border border-slate-300/60 shadow-2xs">
                                  <span>🍴 {isBreak.label}</span>
                                </span>
                              </td>
                            </tr>
                          );
                        }

                        // Regular teaching block row
                        return (
                          <tr key={slot} className="hover:bg-slate-50/60 transition-colors">
                            {/* Time Slot Column */}
                            <td className="p-3 text-center bg-slate-50/80 border-r border-slate-200 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                              {slot}
                            </td>

                            {/* 5 Days Columns */}
                            {SCHEDULE_DAYS.map((day) => {
                              const cellKey = `${day}_${slot}`;
                              const cell = localCells[cellKey];
                              const hasData = Boolean(cell?.subject && cell.subject !== 'Libre / Estudio');
                              const category = cell?.category || 'otro';
                              const catStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.otro;
                              const isDragOver = dragOverKey === cellKey;

                              return (
                                <td
                                  key={cellKey}
                                  onDragOver={(e) => handleCellDragOver(e, cellKey)}
                                  onDrop={(e) => handleCellDrop(e, day, slot)}
                                  onClick={() => handleCellClick(day, slot)}
                                  className={`p-2 border-r border-slate-200 last:border-r-0 align-top cursor-pointer group transition-all relative ${
                                    isDragOver ? 'bg-emerald-50 ring-2 ring-emerald-500 ring-inset' : ''
                                  }`}
                                >
                                  {hasData ? (
                                    <div
                                      draggable={true}
                                      onDragStart={(e) => {
                                        e.stopPropagation();
                                        handleCellDragStart(e, day, slot, cell);
                                      }}
                                      onDragEnd={() => {
                                        setActiveDragItem(null);
                                        setDragOverKey(null);
                                      }}
                                      className={`p-2.5 rounded-xl border text-center transition-all relative cursor-grab active:cursor-grabbing select-none ${catStyle.bg} ${catStyle.border} ${catStyle.text} group-hover:shadow-md group-hover:ring-2 group-hover:ring-indigo-400/50`}
                                    >
                                      {/* Drag Grip Indicator */}
                                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                                        <GripVertical className="w-3 h-3" />
                                      </div>

                                      {/* Subject Name */}
                                      <div className="font-extrabold text-xs tracking-tight line-clamp-2 px-2">
                                        {cell.subject}
                                      </div>

                                      {/* Classroom / Teacher Subtitle */}
                                      {(cell.classroom || cell.teacherName) && (
                                        <div className="text-[10px] opacity-85 mt-1 truncate">
                                          {cell.classroom && <span>{cell.classroom}</span>}
                                          {cell.classroom && cell.teacherName && <span> · </span>}
                                          {cell.teacherName && <span>{cell.teacherName}</span>}
                                        </div>
                                      )}

                                      {/* Variation Note Banner */}
                                      {(cell.hasVariation || cell.variationNote) && (
                                        <div className="mt-1.5 bg-amber-500/15 border border-amber-500/40 text-amber-900 rounded-md p-1 text-[10px] font-bold text-left flex items-start space-x-1 shadow-2xs">
                                          <span className="text-amber-600">⚠️</span>
                                          <span className="truncate">{cell.variationNote || 'Variación'}</span>
                                        </div>
                                      )}

                                      {/* Quick Hover Actions: Unassign to lateral tray + Edit */}
                                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                        <button
                                          type="button"
                                          onClick={(e) => handleMoveCellToTray(day, slot, e)}
                                          title="Mover a la bandeja lateral (desasignar)"
                                          className="p-1 bg-white/90 hover:bg-amber-100 text-amber-700 rounded-md shadow-2xs transition-colors"
                                        >
                                          <Inbox className="w-3 h-3" />
                                        </button>
                                        <span className="p-1 bg-white/90 rounded-md shadow-2xs text-slate-700 block">
                                          <Edit2 className="w-3 h-3" />
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      className={`h-14 rounded-xl border border-dashed transition-all flex flex-col items-center justify-center text-[10px] font-semibold ${
                                        isDragOver
                                          ? 'border-emerald-500 bg-emerald-100/70 text-emerald-800 scale-95 shadow-inner'
                                          : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-300 hover:text-indigo-600'
                                      }`}
                                    >
                                      <Plus className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 mb-0.5" />
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px]">
                                        {isDragOver ? 'Soltar aquí' : 'Asignar'}
                                      </span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Weekly Variations Tracking Summary Panel */}
              {currentWeekVariations.length > 0 && (
                <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Seguimiento de Variaciones · Semana {selectedScheduleWeek} ({selectedScheduleLapso})</span>
                    </div>
                    <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                      {currentWeekVariations.length} ajustes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {currentWeekVariations.map(({ day, timeSlot, cell }, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleCellClick(day, timeSlot)}
                        className="p-3 bg-white rounded-xl border border-amber-200 text-slate-800 shadow-2xs cursor-pointer hover:border-amber-400 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                          <span>{day}</span>
                          <span className="font-mono text-[11px] text-slate-500">{timeSlot}</span>
                        </div>
                        <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                          {cell.subject}
                        </div>
                        {cell.variationNote && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60 mt-1.5 font-medium">
                            {cell.variationNote}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Lateral Drawer (Tray + Quick Palette) */}
            <ScheduleLateralDrawer
              isOpen={isDrawerOpen}
              onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
              unassignedSubjects={unassignedTray}
              onRemoveUnassigned={(idx) => setUnassignedTray((t) => t.filter((_, i) => i !== idx))}
              onClearAllUnassigned={() => setUnassignedTray([])}
              onDropToUnassigned={handleDropToUnassigned}
              onDragStartUnassigned={(cell, idx) => {
                setActiveDragItem({ type: 'unassigned', cell, unassignedIndex: idx });
              }}
              onDragStartPalette={(subject, category, defaultRoom) => {
                setActiveDragItem({
                  type: 'palette',
                  subject,
                  category,
                  defaultRoom,
                });
              }}
              onDragEnd={() => {
                setActiveDragItem(null);
                setDragOverKey(null);
              }}
              isDragging={Boolean(activeDragItem)}
              draggedItemDescription={activeDragItem?.subject || activeDragItem?.cell?.subject}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HORARIOS DE EVENTOS ESPECIALES (COORDINACIÓN & DOCENTES)            */}
      {/* ========================================================================= */}
      {activeTab === 'event_schedules' && (
        <div className="space-y-5">
          {/* Action & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Buscar eventos o palabras clave..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los Tipos</option>
                <option value="academic">Académico</option>
                <option value="sports">Deportivo</option>
                <option value="cultural">Cultural</option>
                <option value="institutional">Institucional</option>
                <option value="other">Otros</option>
              </select>

              {/* Grade Filter */}
              <select
                value={eventGradeFilter}
                onChange={(e) => setEventGradeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos los Grados</option>
                {GRADE_LIST.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinator Action: Create Event */}
            {viewMode === 'coordinator' ? (
              <button
                id="btn-create-event-schedule"
                onClick={() => {
                  setEventToEdit(null);
                  setIsEventModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Horario de Evento</span>
              </button>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Visualizando horarios de eventos publicados por Coordinación
              </div>
            )}
          </div>

          {/* Events List Cards */}
          {filteredEventSchedules.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {filteredEventSchedules.map((evt) => {
                const typeLabels: Record<EventScheduleType, { label: string; color: string }> = {
                  academic: { label: 'Académico', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                  sports: { label: 'Deportivo', color: 'bg-amber-100 text-amber-800 border-amber-300' },
                  cultural: { label: 'Cultural', color: 'bg-purple-100 text-purple-800 border-purple-300' },
                  institutional: { label: 'Institucional', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                  other: { label: 'Especial', color: 'bg-slate-100 text-slate-800 border-slate-300' },
                };
                const tInfo = (evt.type && typeLabels[evt.type]) || typeLabels.academic;
                const displayDate = evt.date || evt.dateRange || (evt.weekNumber ? `Semana ${evt.weekNumber} (${evt.lapso || ''})` : evt.lapso || 'Fecha por confirmar');
                const hasTime = evt.startTime && evt.endTime;

                return (
                  <div
                    key={evt.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Event Header Banner */}
                    <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md border ${tInfo.color}`}>
                            {tInfo.label}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-xs text-slate-300 flex items-center space-x-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-semibold">{displayDate}</span>
                          </span>
                          {hasTime && (
                            <>
                              <span className="text-slate-400">·</span>
                              <span className="text-xs text-slate-300 flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>{evt.startTime} - {evt.endTime}</span>
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white mt-1.5">
                          {evt.title}
                        </h3>
                        <div className="flex items-center space-x-1 text-xs text-slate-300 mt-0.5">
                          {evt.location && (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{evt.location}</span>
                              <span className="mx-1">·</span>
                            </>
                          )}
                          <span>Coordinación: {evt.createdBy || 'Coordinación Pedagógica'}</span>
                        </div>
                      </div>

                      {/* Coordinator Edit / Delete Controls */}
                      {viewMode === 'coordinator' && (
                        <div className="flex items-center space-x-2 self-start md:self-auto">
                          <button
                            onClick={() => {
                              setEventToEdit(evt);
                              setIsEventModalOpen(true);
                            }}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors"
                            title="Editar horario de evento"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            onClick={() => deleteEventSchedule(evt.id)}
                            className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Event Body */}
                    <div className="p-5 space-y-4">
                      {/* Description & Target Grades */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
                        <p className="flex-1 text-slate-700 leading-relaxed font-medium">
                          {evt.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <span className="text-slate-400 font-bold uppercase text-[10px]">
                            Grados:
                          </span>
                          {evt.targetGrades.map((tg) => (
                            <span
                              key={tg}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px]"
                            >
                              {tg}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Agenda / Slots Table */}
                      {((evt.agenda && evt.agenda.length > 0) || (evt.slots && evt.slots.length > 0)) && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Cronograma Detallado de Actividades</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                                  <th className="p-2.5 w-36">Día / Horario</th>
                                  <th className="p-2.5">Actividad / Fase</th>
                                  <th className="p-2.5 w-48">Responsable</th>
                                  <th className="p-2.5 w-40">Lugar</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {evt.agenda && evt.agenda.map((item, idx) => (
                                  <tr key={item.id || idx} className="hover:bg-slate-50/80">
                                    <td className="p-2.5 font-mono font-bold text-slate-800">
                                      {item.time}
                                    </td>
                                    <td className="p-2.5 font-medium text-slate-900">
                                      {item.activity}
                                    </td>
                                    <td className="p-2.5 text-slate-700">
                                      {item.responsible || '—'}
                                    </td>
                                    <td className="p-2.5 text-slate-600">
                                      {item.location || '—'}
                                    </td>
                                  </tr>
                                ))}

                                {evt.slots && evt.slots.map((slot, idx) => (
                                  <tr key={slot.id || idx} className="hover:bg-slate-50/80">
                                    <td className="p-2.5 font-mono font-bold text-slate-800">
                                      <span className="text-[11px] block text-slate-500 font-sans">{slot.day}</span>
                                      {slot.time}
                                    </td>
                                    <td className="p-2.5 font-medium text-slate-900">
                                      <div>{slot.activity}</div>
                                      {slot.notes && (
                                        <div className="text-[11px] text-slate-500 mt-0.5">{slot.notes}</div>
                                      )}
                                    </td>
                                    <td className="p-2.5 text-slate-700">
                                      {slot.responsiblePerson || '—'}
                                    </td>
                                    <td className="p-2.5 text-slate-600">
                                      {slot.location || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Notes / Instructions */}
                      {(evt.notes || evt.coordinatorNotes) && (
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start space-x-2">
                          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Indicaciones de Coordinación: </span>
                            <span>{evt.notes || evt.coordinatorNotes}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">
                No se encontraron horarios de eventos
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {viewMode === 'coordinator'
                  ? 'Como Coordinación, puedes publicar cronogramas para cierres de proyecto, jornadas deportivas y actos cívicos haciendo clic en "Crear Horario de Evento".'
                  : 'Aún no hay eventos registrados con los filtros seleccionados. Coordinación publicará las actividades planificadas aquí.'}
              </p>
              {viewMode === 'coordinator' && (
                <button
                  onClick={() => {
                    setEventToEdit(null);
                    setIsEventModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Primer Horario de Evento</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Edit Class Schedule Cell */}
      {editingCellCoords && (
        <ScheduleCellModal
          isOpen={Boolean(editingCellCoords)}
          onClose={() => setEditingCellCoords(null)}
          day={editingCellCoords.day}
          timeSlot={editingCellCoords.timeSlot}
          grade={selectedScheduleGrade}
          weekNumber={selectedScheduleWeek}
          lapso={selectedScheduleLapso}
          initialCell={editingCellCoords.cell}
          onSave={handleSaveCell}
          onClear={handleClearCell}
          readOnly={false}
        />
      )}

      {/* Modal: Create/Edit Coordinator Event Schedule */}
      {isEventModalOpen && (
        <EventScheduleModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setEventToEdit(null);
          }}
          eventToEdit={eventToEdit}
          onSave={(data) => {
            if (data.id) {
              updateEventSchedule(data as EventSchedule);
            } else {
              addEventSchedule(data);
            }
          }}
          coordinatorName={currentUser.fullName}
        />
      )}

      {/* Modal: Copy Schedule from Another Week */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Copy className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">
                  Copiar Horario entre Semanas
                </h3>
              </div>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Duplica rápidamente la estructura de materias para <strong>{selectedScheduleGrade}</strong> en la <strong>Semana {selectedScheduleWeek} ({selectedScheduleLapso})</strong> sin tener que transcribir cada bloque.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lapso de Origen:
                </label>
                <select
                  value={copySourceLapso}
                  onChange={(e) => setCopySourceLapso(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  {LAPSOS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Semana de Origen:
                </label>
                <select
                  value={copySourceWeek}
                  onChange={(e) => setCopySourceWeek(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  {WEEKS.map((w) => (
                    <option key={w} value={w}>
                      Semana {w}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-900 text-[11px] flex items-center space-x-2">
                <ArrowRight className="w-4 h-4 shrink-0 text-indigo-600" />
                <span>
                  Se copiarán todas las asignaturas de <strong>Semana {copySourceWeek}</strong> ({copySourceLapso}) a <strong>Semana {selectedScheduleWeek}</strong> ({selectedScheduleLapso}).
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCopy}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Copiar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
