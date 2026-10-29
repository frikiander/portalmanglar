import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Save, 
  Send, 
  Eye, 
  BookOpen, 
  Calendar, 
  Award, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileEdit,
  Tag,
  Layers,
  ChevronRight,
  GraduationCap,
  Search,
  Filter,
  Calculator,
  Globe,
  Cpu,
  Palette,
  Dumbbell,
  Music,
  Compass,
  Bot,
  Plus,
  X
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { AVAILABLE_SUBJECTS, AVAILABLE_GRADES } from '../data/mockData';
import { LessonPlanPreviewModal } from './LessonPlanPreviewModal';
import { CompetencyManagerModal } from './CompetencyManagerModal';
import { SubjectAvatar } from './SubjectAvatar';
import { matchSubjects, matchGrades } from '../utils/curricularMatcher';
import { getGradeBadgeStyle, getGradeLeftAccentStyle, getGradeColorConfig, GRADE_COLOR_MAP } from '../utils/gradeColors';
import { detectSubjectCategory, CATEGORY_STYLES } from '../data/mockSchedules';
import { LessonPlan, ScheduleDay } from '../types';
import { SCHOOL_DAYS, dateForWeekDay, findDayPlan, formatDayMonth } from '../utils/planDays';
import { parseISODate } from '../utils/lapsoCalendar';

interface Props {
  initialWeek?: number;
  /** Open an existing plan: preselects its subject, grade, week and day. */
  initialPlan?: LessonPlan;
  onExit: () => void;
}

export const LessonPlanWizard: React.FC<Props> = ({ initialWeek = 1, initialPlan, onExit }) => {
  const { 
    currentUser, 
    plans, 
    competencies, 
    savePlan, 
    submitPlanToCoordination,
    addToast,
    subjects,
    availableSubjectNames,
    availableGradeNames,
    getLapsoWeeks,
    lapsos,
    events,
  } = useEduPlan();

  const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : AVAILABLE_GRADES;

  // Step 1: Subject search & category filter state
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<'ALL' | 'ACADEMIC' | 'LANGUAGES' | 'TECH' | 'SPECIAL'>('ALL');

  // Wizard steps: 1 Asignatura y grado, 2 Semana, 3 Día y tema, 4 Competencias, 5 Planificador
  // An existing plan opens straight on the planner.
  const [currentStep, setCurrentStep] = useState<number>(initialPlan ? 5 : 1);

  const [subject, setSubject] = useState<string>(
    initialPlan?.subject || currentUser.assignedSubjects?.[0] || 'Inglés (Language Arts)'
  );
  const [grade, setGrade] = useState<string>(
    initialPlan?.grade || currentUser.schoolGrade || '4to Grado'
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(initialPlan?.weekNumber ?? initialWeek);
  const [selectedDay, setSelectedDay] = useState<ScheduleDay | null>(initialPlan?.dayOfWeek ?? null);

  // A plan is one subject + grade + week + day for this teacher
  const existingPlan = selectedDay
    ? findDayPlan(plans, { teacherId: currentUser.id, subject, grade, week: selectedWeek, day: selectedDay })
    : undefined;

  // Day plans already made for this subject and grade, per week (for the week grid)
  const plansForWeek = (week: number) =>
    plans.filter((p) => p.teacherId === currentUser.id && p.subject === subject && p.grade === grade && p.weekNumber === week && p.dayOfWeek);
  const [topic, setTopic] = useState<string>(existingPlan?.topic || '');
  const [selectedCompIds, setSelectedCompIds] = useState<string[]>(
    existingPlan?.competencyIds || []
  );
  const [selectedIndicators, setSelectedIndicators] = useState<Record<string, string[]>>(
    existingPlan?.selectedIndicators || {}
  );
  const [startActivity, setStartActivity] = useState<string>(
    existingPlan?.startActivity || ''
  );
  const [developmentActivity, setDevelopmentActivity] = useState<string>(
    existingPlan?.developmentActivity || ''
  );
  const [closingActivity, setClosingActivity] = useState<string>(
    existingPlan?.closingActivity || ''
  );
  const [resources, setResources] = useState<string>(
    existingPlan?.resources || ''
  );
  const [observations, setObservations] = useState<string>(
    existingPlan?.observations || ''
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [isCompManagerOpen, setIsCompManagerOpen] = useState(false);

  // Load the plan for the chosen subject, grade, week and day (or start blank)
  useEffect(() => {
    const plan = existingPlan;
    if (plan) {
      setTopic(plan.topic);
      setSelectedCompIds(plan.competencyIds || []);
      setSelectedIndicators(plan.selectedIndicators || {});
      setStartActivity(plan.startActivity);
      setDevelopmentActivity(plan.developmentActivity);
      setClosingActivity(plan.closingActivity);
      setResources(plan.resources);
      setObservations(plan.observations || '');
    } else {
      setTopic('');
      setSelectedCompIds([]);
      setSelectedIndicators({});
      setStartActivity('');
      setDevelopmentActivity('');
      setClosingActivity('');
      setResources('');
      setObservations('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPlan?.id, existingPlan?.updatedAt, selectedWeek, selectedDay, subject, grade]);

  // Dynamically load competencies matching selected subject and grade with smart matcher
  const availableCompetencies = competencies.filter(
    (c) => matchSubjects(c.subject, subject) && matchGrades(c.grade, grade)
  );

  const toggleCompetency = (compId: string) => {
    if (existingPlan?.status === 'approved') return;
    const isSelected = selectedCompIds.includes(compId);
    if (isSelected) {
      setSelectedCompIds((prev) => prev.filter((id) => id !== compId));
      setSelectedIndicators((prev) => {
        const next = { ...prev };
        delete next[compId];
        return next;
      });
    } else {
      setSelectedCompIds((prev) => [...prev, compId]);
      // Por defecto se seleccionan TODOS los indicadores asociados a esta competencia
      const targetComp = competencies.find((c) => c.id === compId);
      setSelectedIndicators((prev) => ({
        ...prev,
        [compId]: targetComp?.indicators ? [...targetComp.indicators] : [],
      }));
    }
  };

  const toggleIndicator = (compId: string, indicatorText: string) => {
    if (existingPlan?.status === 'approved') return;
    setSelectedIndicators((prev) => {
      const currentList = prev[compId] || [];
      const isChecked = currentList.includes(indicatorText);
      const nextList = isChecked
        ? currentList.filter((text) => text !== indicatorText)
        : [...currentList, indicatorText];
      return {
        ...prev,
        [compId]: nextList,
      };
    });
  };

  const selectAllIndicators = (compId: string) => {
    if (existingPlan?.status === 'approved') return;
    const targetComp = competencies.find((c) => c.id === compId);
    if (!targetComp) return;
    setSelectedIndicators((prev) => ({
      ...prev,
      [compId]: [...(targetComp.indicators || [])],
    }));
  };

  const deselectAllIndicators = (compId: string) => {
    if (existingPlan?.status === 'approved') return;
    setSelectedIndicators((prev) => ({
      ...prev,
      [compId]: [],
    }));
  };

  const handleSaveDraft = () => {
    if (!selectedDay) {
      addToast('Elige el día de la semana antes de guardar.', 'warning');
      setCurrentStep(3);
      return undefined;
    }
    const saved = savePlan({
      id: existingPlan?.id,
      teacherId: currentUser.id,
      weekNumber: selectedWeek,
      dayOfWeek: selectedDay,
      subject,
      grade,
      topic: topic.trim() || `Semana ${selectedWeek}, ${selectedDay.toLowerCase()}`,
      status: existingPlan?.status === 'rejected' ? 'rejected' : 'draft',
      competencyIds: selectedCompIds,
      selectedIndicators: selectedIndicators,
      startActivity,
      developmentActivity,
      closingActivity,
      resources,
      observations,
    });
    return saved;
  };

  /** Returns true when the plan was sent; false when something is missing (the toast says what). */
  const handleSubmit = (): boolean => {
    if (!selectedDay) {
      addToast('Elige el día de la semana antes de enviar.', 'warning');
      setCurrentStep(3);
      setIsSubmittingConfirm(false);
      return false;
    }
    // Competencies are optional: a class can be sent without them
    if (!startActivity.trim() || !developmentActivity.trim() || !closingActivity.trim()) {
      addToast('Completa los momentos didácticos: inicio, desarrollo y cierre.', 'warning');
      setCurrentStep(5);
      setIsSubmittingConfirm(false);
      return false;
    }

    const saved = handleSaveDraft();
    if (saved && saved.id) {
      submitPlanToCoordination(saved.id);
    }
    setIsSubmittingConfirm(false);
    return Boolean(saved);
  };

  const isReadOnly = existingPlan?.status === 'approved';

  const stepsConfig = [
    {
      step: 1,
      title: 'Asignatura y Grado',
      shortTitle: 'Asignatura',
      desc: 'Seleccionar materia y nivel',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      step: 2,
      title: 'Semana',
      shortTitle: 'Semana',
      desc: `Semana 1 a ${getLapsoWeeks()} del lapso`,
      icon: <Calendar className="w-4 h-4" />
    },
    {
      step: 3,
      title: 'Día y tema',
      shortTitle: 'Día',
      desc: 'Lunes a viernes y unidad',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      step: 4,
      title: 'Competencias e Indicadores',
      shortTitle: 'Competencias',
      desc: 'Opcional: criterios e indicadores',
      icon: <Award className="w-4 h-4" />
    },
    {
      step: 5,
      title: 'Planificador Completo',
      shortTitle: 'Planificador',
      desc: 'Inicio, desarrollo, cierre y recursos',
      icon: <Sparkles className="w-4 h-4" />
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Wizard Header Bar */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            title="Volver al Panel"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Paso a paso de planificación académica
              </h2>
              {existingPlan?.status === 'approved' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 text-success-800">
                  Aprobada
                </span>
              )}
              {existingPlan?.status === 'submitted' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                  Enviada a Coordinación
                </span>
              )}
              {existingPlan?.status === 'rejected' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-100 text-warning-800">
                  Con observaciones
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 flex-wrap">
              <span>{currentUser.fullName}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                <SubjectAvatar subjectName={subject} size="xs" />
                <span>{subject}</span>
              </span>
              <span>·</span>
              <span>{grade}</span>
              <span>·</span>
              <span><strong>Semana {selectedWeek}{selectedDay ? `, ${selectedDay.toLowerCase()}` : ''}</strong></span>
            </div>
          </div>
        </div>

        {/* Action button inside header */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Vista previa</span>
          </button>
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-success-50 border border-success-200 rounded-xl hover:bg-success-100 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-primary-600" />
            <span>Guardar borrador</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[720px] max-w-5xl mx-auto">
          {stepsConfig.map((s, idx) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <React.Fragment key={s.step}>
                <button
                  onClick={() => setCurrentStep(s.step)}
                  className="flex items-center space-x-3 text-left group focus:outline-hidden cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                    isCompleted
                      ? 'bg-success-600 text-white shadow-xs shadow-success-200'
                      : isCurrent
                      ? 'bg-primary-600 text-white shadow-md shadow-success-200 ring-4 ring-success-100'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                  </div>
                  <div>
                    <div className={`text-xs font-bold transition-colors ${
                      isCurrent ? 'text-primary-700' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                    }`}>
                      {s.title}
                    </div>
                    <div className="text-xs text-slate-500 hidden sm:block">
                      {s.desc}
                    </div>
                  </div>
                </button>

                {idx < stepsConfig.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 transition-colors ${
                    currentStep > idx + 1 ? 'bg-success-400' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="p-6 sm:p-8">
        {/* ========================================================================= */}
        {/* PASO 1: SELECCIONAR ASIGNATURA Y GRADO                                    */}
        {/* ========================================================================= */}
        {currentStep === 1 && (() => {
          const rawSubjects = availableSubjectNames?.length > 0 ? availableSubjectNames : AVAILABLE_SUBJECTS;

          const filteredSubjects = rawSubjects.filter((s) => {
            const sLower = s.toLowerCase();
            if (subjectSearch.trim() && !sLower.includes(subjectSearch.toLowerCase().trim())) {
              return false;
            }
            if (subjectCategoryFilter === 'ALL') return true;

            const cat = detectSubjectCategory(s);
            const isLanguage = cat === 'ingles' || sLower.includes('inglés') || sLower.includes('ingles') || sLower.includes('english') || sLower.includes('language arts') || sLower.includes('francés') || sLower.includes('frances');

            if (subjectCategoryFilter === 'ACADEMIC') {
              return ['lengua', 'matematica', 'ciencia', 'sociales'].includes(cat) && !isLanguage;
            }
            if (subjectCategoryFilter === 'LANGUAGES') {
              return isLanguage;
            }
            if (subjectCategoryFilter === 'TECH') {
              return (cat === 'proyecto' || sLower.includes('robót') || sLower.includes('robot') || sLower.includes('tecno') || sLower.includes('comput')) && !isLanguage;
            }
            if (subjectCategoryFilter === 'SPECIAL') {
              return ['especiales', 'deporte', 'rutina', 'otro'].includes(cat) && !isLanguage;
            }
            return true;
          });

          const getGradeStyleConfig = (g: string, idx: number) => {
            const config = getGradeColorConfig(g);
            if (config) return config;
            const fallbackNum = ((idx % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
            return GRADE_COLOR_MAP[fallbackNum];
          };

          return (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-primary-600 block mb-1">
                  Paso 1 de 5
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Selecciona la asignatura y el grado escolar
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Elige la materia y el grado con su paleta de color institucional para comenzar tu planificación.
                </p>
              </div>

              {/* 1. ASIGNATURA CURRICULAR */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800">
                      1. Asignatura curricular
                    </label>
                    <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200/80 text-primary-900 shadow-2xs">
                      {subject && <SubjectAvatar subjectName={subject} size="sm" />}
                      <span>{subject ? `Seleccionada: ${subject}` : 'Sin seleccionar'}</span>
                    </div>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar asignatura..."
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-8 pr-7 py-1.5 focus:ring-2 focus:ring-primary-500 focus:outline-hidden font-medium"
                    />
                    {subjectSearch && (
                      <button
                        type="button"
                        onClick={() => setSubjectSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {[
                    { id: 'ALL', label: 'Todas' },
                    { id: 'ACADEMIC', label: 'Académicas' },
                    { id: 'LANGUAGES', label: 'Idiomas' },
                    { id: 'TECH', label: 'Tecnología & Proyectos' },
                    { id: 'SPECIAL', label: 'Especiales & Rutinas' },
                  ].map((catBtn) => (
                    <button
                      key={catBtn.id}
                      type="button"
                      onClick={() => setSubjectCategoryFilter(catBtn.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        subjectCategoryFilter === catBtn.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {catBtn.label}
                    </button>
                  ))}
                </div>

                {/* Grid Ampliada de Asignaturas con Avatares Destacados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1.5 scrollbar-thin">
                  {filteredSubjects.map((s) => {
                    const isSelected = subject === s;
                    const catKey = detectSubjectCategory(s);
                    const subjectObj = subjects?.find(
                      (sub) => sub.name.trim().toLowerCase() === s.trim().toLowerCase()
                    );

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubject(s)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer group ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50/90 ring-2 ring-primary-500/20 shadow-sm text-primary-950 font-bold'
                            : 'border-slate-200/90 bg-white hover:bg-slate-50/90 hover:border-slate-300 hover:shadow-2xs text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <SubjectAvatar subjectName={s} category={catKey} size="md" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs sm:text-sm font-bold truncate block leading-snug">
                              {s}
                            </span>
                            <span className="text-xs text-slate-500 font-medium capitalize truncate block mt-0.5">
                              {subjectObj?.code || catKey}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs shrink-0 shadow-2xs font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {filteredSubjects.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-slate-500">
                      No se encontraron asignaturas con "{subjectSearch}"
                    </div>
                  )}
                </div>
              </div>

              {/* 2. GRADO O NIVEL EDUCATIVO CON PALETA DE COLOR */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    2. Grado o nivel educativo
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Paleta institucional
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {displayGrades.map((g, idx) => {
                    const isSelected = grade === g;
                    const cfg = getGradeStyleConfig(g, idx);

                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        style={
                          isSelected
                            ? {
                                backgroundColor: cfg.bgLight,
                                borderColor: cfg.borderColor,
                                boxShadow: `0 0 0 2px ${cfg.ringColor}`,
                              }
                            : undefined
                        }
                        className={`relative p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer ${
                          isSelected
                            ? 'shadow-xs font-bold'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Top Accent Color Bar matching Grade */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1.5 transition-all"
                          style={{ backgroundColor: cfg.hex }}
                        />

                        <div className="pt-1 flex items-center justify-between mb-2">
                          <span
                            className="text-xs font-black px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: isSelected ? cfg.hex : '#f1f5f9',
                              color: isSelected ? cfg.textColor : '#475569',
                            }}
                          >
                            {cfg.shortName || `${idx + 1}°`}
                          </span>

                          {isSelected ? (
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs"
                              style={{ backgroundColor: cfg.hex, color: cfg.textColor }}
                            >
                              ✓
                            </span>
                          ) : (
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 opacity-70"
                              style={{ backgroundColor: cfg.hex }}
                            />
                          )}
                        </div>

                        <span
                          className="text-xs sm:text-sm font-bold truncate"
                          style={{
                            color: isSelected && cfg.textColor !== '#ffffff' ? cfg.textColor : '#1e293b'
                          }}
                        >
                          {g}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={onExit}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancelar y salir
                </button>
                <button
                  id="wizard-step1-next-btn"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Continuar a seleccionar semana</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* PASO 2: SELECCIONAR SEMANA Y TEMA                                         */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-primary-600 block mb-1">
                Paso 2 de 5
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Elige la semana
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {subject} en {grade}. El lapso tiene {getLapsoWeeks()} semanas; cada una muestra cuántos días ya planificaste.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {Array.from({ length: getLapsoWeeks() }, (_, i) => i + 1).map((weekNum) => {
                const isSelected = selectedWeek === weekNum;
                const dayPlans = plansForWeek(weekNum);
                const monday = dateForWeekDay(lapsos, weekNum, 'Lunes');
                const hasObservations = dayPlans.some((p) => p.status === 'rejected');
                const allApproved = dayPlans.length === SCHOOL_DAYS.length && dayPlans.every((p) => p.status === 'approved');

                const badge = dayPlans.length === 0
                  ? { text: 'Sin planificar', cls: 'bg-slate-100 text-slate-600 border-slate-200' }
                  : hasObservations
                  ? { text: `${dayPlans.length} de 5 días`, cls: 'bg-warning-50 text-warning-800 border-warning-300' }
                  : allApproved
                  ? { text: 'Semana aprobada', cls: 'bg-success-50 text-success-800 border-success-200' }
                  : { text: `${dayPlans.length} de 5 días`, cls: 'bg-primary-50 text-primary-800 border-primary-200' };

                return (
                  <button
                    key={weekNum}
                    type="button"
                    id={`wizard-week-btn-${weekNum}`}
                    onClick={() => setSelectedWeek(weekNum)}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${isSelected ? 'text-primary-900' : 'text-raiz'}`}>
                        Semana {weekNum}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                    </div>
                    {monday && (
                      <span className="block text-xs text-slate-500 mt-0.5">Desde el {formatDayMonth(monday)}</span>
                    )}
                    <span className={`inline-block mt-2 px-1.5 py-0.5 rounded-sm text-xs font-semibold border ${badge.cls}`}>
                      {badge.text}
                    </span>
                    {hasObservations && <span className="sr-only">, con observaciones</span>}
                  </button>
                );
              })}
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Paso 1: Asignatura y grado</span>
              </button>

              <button
                id="wizard-step2-next-btn"
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold rounded-md transition-colors cursor-pointer"
              >
                <span>Continuar a elegir el día</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: DÍA DE LA SEMANA Y TEMA (SI PROCEDE)                              */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-primary-600 block mb-1">
                Paso 3 de 5
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Elige el día de la semana {selectedWeek}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cada día es una planificación propia de {subject} en {grade}.
              </p>
            </div>

            <fieldset>
              <legend className="block text-sm font-bold text-slate-800 mb-2">Día</legend>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {SCHOOL_DAYS.map((day) => {
                  const isSelected = selectedDay === day;
                  const date = dateForWeekDay(lapsos, selectedWeek, day);
                  const holiday = date
                    ? events.find((ev) => ev.type === 'holiday' && parseISODate(ev.date).getTime() === date.getTime())
                    : undefined;
                  const dayPlan = findDayPlan(plans, { teacherId: currentUser.id, subject, grade, week: selectedWeek, day });
                  const status = dayPlan
                    ? {
                        approved:  { text: 'Aprobada',         cls: 'bg-success-50 text-success-800 border-success-200' },
                        submitted: { text: 'Enviada',          cls: 'bg-primary-50 text-primary-800 border-primary-200' },
                        rejected:  { text: 'Con observaciones', cls: 'bg-warning-50 text-warning-800 border-warning-300' },
                        draft:     { text: 'Borrador',         cls: 'bg-slate-100 text-slate-700 border-slate-200' },
                      }[dayPlan.status]
                    : null;

                  return (
                    <button
                      key={day}
                      type="button"
                      id={`wizard-day-btn-${day}`}
                      onClick={() => setSelectedDay(day)}
                      aria-pressed={isSelected}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer min-h-24 flex flex-col ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-primary-900' : 'text-raiz'}`}>{day}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                      </span>
                      {date && <span className="text-xs text-slate-500 mt-0.5">{formatDayMonth(date)}</span>}
                      <span className="mt-auto pt-2 flex flex-wrap gap-1">
                        {status && (
                          <span className={`px-1.5 py-0.5 rounded-sm text-xs font-semibold border ${status.cls}`}>{status.text}</span>
                        )}
                        {holiday && (
                          <span className="px-1.5 py-0.5 rounded-sm text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300" title={holiday.title}>
                            Feriado
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
              <label htmlFor="wizard-input-topic" className="block text-sm font-bold text-slate-800">
                Tema o unidad (si procede)
              </label>
              <input
                id="wizard-input-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={!selectedDay || isReadOnly}
                placeholder={selectedDay ? 'Ej.: Daily routines and telling time / Fracciones equivalentes' : 'Elige primero el día'}
                className="w-full bg-white border border-slate-300 text-raiz text-sm rounded-md px-4 py-3 focus:outline-hidden focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 font-medium disabled:bg-slate-100"
              />
              <p className="text-xs text-slate-500">
                Si la clase continúa un tema ya iniciado, puedes dejarlo vacío. Se guardará como «Semana {selectedWeek}{selectedDay ? `, ${selectedDay.toLowerCase()}` : ''}».
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Paso 2: Semana</span>
              </button>

              <button
                id="wizard-step3-next-btn"
                onClick={() => {
                  if (!selectedDay) {
                    addToast('Elige el día de la semana.', 'warning');
                    return;
                  }
                  setCurrentStep(4);
                }}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold rounded-md transition-colors cursor-pointer"
              >
                <span>Continuar a competencias e indicadores</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: SELECCIONAR COMPETENCIAS E INDICADORES                            */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-primary-600 block mb-1">
                  Paso 4 de 5
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Selecciona la competencia a trabajar con sus indicadores
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Cargadas desde el banco para <strong>{subject}</strong> en <strong>{grade}</strong>. Son opcionales: elige las que evaluarás o continúa sin ellas.
                </p>
              </div>

              <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary-50 text-primary-800 border border-primary-200 self-start sm:self-auto">
                {selectedCompIds.length} seleccionada{selectedCompIds.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* List of competencies with their indicators */}
            {availableCompetencies.length > 0 ? (
              <div className="grid gap-3.5">
                {availableCompetencies.map((comp) => {
                  const isSelected = selectedCompIds.includes(comp.id);
                  const compIndicators = comp.indicators || [];
                  const selectedForComp = selectedIndicators[comp.id] || [];

                  return (
                    <div
                      key={comp.id}
                      id={`wizard-comp-${comp.id}`}
                      onClick={() => toggleCompetency(comp.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'border-primary-800 bg-success-50/40 ring-2 ring-primary-800/15 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                      style={isSelected ? getGradeLeftAccentStyle(comp.grade || grade, 4) : undefined}
                    >
                      <div className="flex items-start space-x-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mt-1 w-4 h-4 text-primary-800 rounded-md border-slate-300 focus:ring-primary-800 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900">
                              {comp.title}
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <span 
                                className="text-xs tabular-nums font-bold px-2 py-0.5 rounded-md border tracking-wide shadow-2xs"
                                style={getGradeBadgeStyle(comp.grade || grade)}
                              >
                                {comp.code}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary-800/10 text-primary-800">
                                {comp.category}
                              </span>
                            </div>
                          </div>

                          {/* When selected: display selectable indicators */}
                          {isSelected && (
                            <div 
                              className="mt-3 p-3.5 rounded-xl bg-white border border-success-200/80 shadow-2xs space-y-2.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-600" />
                                  <span>Indicadores para esta planificación ({selectedForComp.length} de {compIndicators.length}):</span>
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => selectAllIndicators(comp.id)}
                                    className="text-xs font-semibold text-primary-800 hover:underline cursor-pointer"
                                  >
                                    Marcar todos
                                  </button>
                                  <span className="text-slate-300 text-xs">·</span>
                                  <button
                                    type="button"
                                    onClick={() => deselectAllIndicators(comp.id)}
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                                  >
                                    Destildar todos
                                  </button>
                                </div>
                              </div>

                              {compIndicators.length > 0 ? (
                                <div className="space-y-1.5">
                                  {compIndicators.map((ind, indIdx) => {
                                    const isIndChecked = selectedForComp.includes(ind);

                                    return (
                                      <label
                                        key={indIdx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleIndicator(comp.id, ind);
                                        }}
                                        className={`flex items-start space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                                          isIndChecked 
                                            ? 'bg-success-50/60 text-slate-800 font-medium' 
                                            : 'bg-slate-50/60 text-slate-500 hover:bg-slate-100/70 line-through decoration-slate-300'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isIndChecked}
                                          onChange={() => {}} // Handled by container
                                          className="mt-0.5 w-3.5 h-3.5 text-primary-800 rounded border-slate-300 focus:ring-primary-800 cursor-pointer"
                                        />
                                        <span className="leading-relaxed flex-1">{ind}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">No hay indicadores específicos definidos en el banco.</p>
                              )}
                            </div>
                          )}

                          {!isSelected && (
                            <p className="text-xs text-slate-500 mt-1">
                              Haz clic para seleccionar esta competencia y sus indicadores asociados.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
                <Award className="w-8 h-8 text-slate-500 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-700">
                    No hay competencias registradas para {subject} - {grade}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Puedes agregar una competencia al banco para {subject} o continuar sin competencias.
                  </p>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCompManagerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success-600 hover:bg-success-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Abrir banco y agregar competencia</span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Paso 3: Día y tema</span>
              </button>

              <button
                id="wizard-step4-next-btn"
                onClick={() => setCurrentStep(5)}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>{selectedCompIds.length === 0 ? 'Continuar sin competencias' : 'Continuar al planificador completo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 4: PLANIFICADOR COMPLETO (INICIO, DESARROLLO, CIERRE, RECURSOS, OBS)  */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header summary of selected config */}
            <div className="p-4 rounded-2xl bg-primary-50/60 border border-primary-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold">
                  5
                </span>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    Planificador didáctico, semana {selectedWeek}{selectedDay ? `, ${selectedDay.toLowerCase()}` : ''}
                  </span>
                  <span className="text-slate-500">
                    {subject} · {grade} · Tema: <strong>{topic || 'Sin tema'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-2.5 py-1 bg-white border border-primary-200 text-primary-700 rounded-lg text-xs font-semibold hover:bg-primary-50"
                >
                  {selectedCompIds.length} Competencia{selectedCompIds.length !== 1 ? 's' : ''} asociada{selectedCompIds.length !== 1 ? 's' : ''} (Editar)
                </button>
              </div>
            </div>

            {/* Coordinator feedback notice if returned */}
            {existingPlan?.status === 'rejected' && existingPlan.coordinatorFeedback && (
              <div className="p-4 rounded-2xl bg-warning-50 border border-warning-300 flex items-start space-x-3 text-warning-900">
                <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <h4 className="font-bold text-xs text-warning-950 mb-1">
                    Observaciones recibidas de Coordinación pedagógica:
                  </h4>
                  <p className="leading-relaxed">{existingPlan.coordinatorFeedback}</p>
                </div>
              </div>
            )}

            {/* Didactic Sequence Sections */}
            <div className="space-y-4">
              
              {/* 1. Inicio */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    <span>Inicio (apertura, motivación y saberes previos)</span>
                  </label>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Dinámica rompehielo, activación de conocimientos previos y presentación del objetivo de la clase.
                </p>
                <textarea
                  id="wizard-textarea-inicio"
                  disabled={isReadOnly}
                  rows={3}
                  value={startActivity}
                  onChange={(e) => setStartActivity(e.target.value)}
                  placeholder="Ej: Saludo de bienvenida, canción o video corto sobre rutinas matutinas. Preguntas guía: ¿A qué hora nos levantamos hoy?..."
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

              {/* 2. Desarrollo */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    <span>Desarrollo (construcción del Conocimiento y práctica guiada)</span>
                  </label>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Explicación temática, modelado docente, trabajo en parejas o equipos colaborativos y resolución de ejercicios.
                </p>
                <textarea
                  id="wizard-textarea-desarrollo"
                  disabled={isReadOnly}
                  rows={5}
                  value={developmentActivity}
                  onChange={(e) => setDevelopmentActivity(e.target.value)}
                  placeholder="Ej: 1. Presentación en pizarra de estructuras gramaticales... 2. Práctica en parejas con relojes de cartón... 3. Elaboración de una historieta de 4 viñetas..."
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

              {/* 3. Cierre */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    <span>Cierre (evaluación formativa, síntesis y metacognición)</span>
                  </label>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Ticket de salida, ronda de preguntas de reflexión o autoevaluación formativa de los logros alcanzados.
                </p>
                <textarea
                  id="wizard-textarea-cierre"
                  disabled={isReadOnly}
                  rows={3}
                  value={closingActivity}
                  onChange={(e) => setClosingActivity(e.target.value)}
                  placeholder="Ej: Cada alumno dice una oración sobre su rutina antes de salir (Ticket to Exit). Reflexión sobre el tema..."
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

            </div>

            {/* Recursos & Observaciones de Adaptaciones Curriculares */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Recursos */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Recursos didácticos y materiales
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Proyector, flashcards, guías impresas, enlaces web o libros.
                </p>
                <textarea
                  id="wizard-textarea-recursos"
                  disabled={isReadOnly}
                  rows={3}
                  value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  placeholder="Ej: Proyector multimedia, flashcards plastificadas de rutinas, relojes didácticos, fichas de trabajo..."
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

              {/* Observaciones de Adaptaciones Curriculares */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Observaciones de adaptaciones curriculares
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Atención a la diversidad, apoyo visual para NEE y contingencias.
                </p>
                <textarea
                  id="wizard-textarea-observaciones"
                  disabled={isReadOnly}
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ej: Fichas adaptadas con pictogramas para Mateo; refuerzo de tiempo en la actividad 2..."
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

            </div>

            {/* Bottom Actions for Step 4 */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Paso 4: Competencias</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Guardar borrador
                </button>

                {!isReadOnly && (
                  <button
                    type="button"
                    id="wizard-submit-coordination-btn"
                    onClick={() => setIsSubmittingConfirm(true)}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-all flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar a Coordinación</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Confirmation Modal for Submitting */}
      {isSubmittingConfirm && (
        <div className="fixed inset-0 z-50 bg-raiz/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              ¿Enviar planificación a Coordinación?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Se enviará la planificación de la <strong>semana {selectedWeek}{selectedDay ? `, ${selectedDay.toLowerCase()}` : ''}</strong> ({subject}, {grade}) {selectedCompIds.length === 0
                ? <> <strong>sin competencias asociadas</strong> para su revisión y aprobación.</>
                : <>con <strong>{selectedCompIds.length} {selectedCompIds.length === 1 ? 'competencia' : 'competencias'}</strong> e indicadores asociados para su revisión y aprobación.</>}
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsSubmittingConfirm(false)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                id="wizard-confirm-submit-button"
                onClick={() => {
                  if (handleSubmit()) onExit();
                }}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-600 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirmar y enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && (
        <LessonPlanPreviewModal
          plan={{
            id: existingPlan?.id || 'temp',
            teacherId: currentUser.id,
            teacherName: currentUser.fullName,
            teacherAvatar: currentUser.avatar,
            weekNumber: selectedWeek,
            dayOfWeek: selectedDay ?? undefined,
            subject,
            grade,
            topic: topic || 'Sin título aún',
            status: existingPlan?.status || 'draft',
            competencyIds: selectedCompIds,
            selectedIndicators: selectedIndicators,
            startActivity,
            developmentActivity,
            closingActivity,
            resources,
            observations,
            coordinatorFeedback: existingPlan?.coordinatorFeedback,
            updatedAt: new Date().toISOString(),
          }}
          competencies={competencies}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {isCompManagerOpen && (
        <CompetencyManagerModal onClose={() => setIsCompManagerOpen(false)} />
      )}

    </div>
  );
};
