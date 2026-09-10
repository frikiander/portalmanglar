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
  X
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { AVAILABLE_SUBJECTS, AVAILABLE_GRADES } from '../data/mockData';
import { LessonPlanPreviewModal } from './LessonPlanPreviewModal';
import { getGradeBadgeStyle, getGradeLeftAccentStyle, getGradeColorConfig, GRADE_COLOR_MAP } from '../utils/gradeColors';
import { detectSubjectCategory, CATEGORY_STYLES } from '../data/mockSchedules';
import { LessonPlan } from '../types';

interface Props {
  initialWeek?: number;
  onExit: () => void;
}

export const LessonPlanWizard: React.FC<Props> = ({ initialWeek = 1, onExit }) => {
  const { 
    currentUser, 
    plans, 
    competencies, 
    savePlan, 
    submitPlanToCoordination,
    addToast,
    availableSubjectNames,
    availableGradeNames
  } = useEduPlan();

  const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : AVAILABLE_GRADES;

  // Step 1: Subject search & category filter state
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<'ALL' | 'ACADEMIC' | 'LANGUAGES' | 'TECH' | 'SPECIAL'>('ALL');

  // Wizard active step: 1 (Asignatura), 2 (Semana), 3 (Competencias), 4 (Planificador Completo)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selected week
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeek);

  // Find existing plan for selected week and teacher
  const existingPlan = plans.find(
    (p) => p.teacherId === currentUser.id && p.weekNumber === selectedWeek
  );

  // Wizard form state
  const [subject, setSubject] = useState<string>(
    existingPlan?.subject || (currentUser.specialty?.includes('Inglés') ? 'English' : 'English')
  );
  const [grade, setGrade] = useState<string>(
    existingPlan?.grade || currentUser.schoolGrade || '4to Grado'
  );
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

  // Update form fields when week changes
  useEffect(() => {
    const plan = plans.find(
      (p) => p.teacherId === currentUser.id && p.weekNumber === selectedWeek
    );
    if (plan) {
      setSubject(plan.subject);
      setGrade(plan.grade);
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
  }, [selectedWeek, plans, currentUser.id]);

  // Dynamically load competencies matching selected subject and grade
  const availableCompetencies = competencies.filter(
    (c) =>
      c.subject.toLowerCase() === subject.toLowerCase() &&
      c.grade.toLowerCase() === grade.toLowerCase()
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
    const saved = savePlan({
      id: existingPlan?.id,
      teacherId: currentUser.id,
      weekNumber: selectedWeek,
      subject,
      grade,
      topic: topic.trim() || `Planificación Semana ${selectedWeek}`,
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

  const handleSubmit = () => {
    if (!topic.trim()) {
      addToast('Por favor define el Tema de la semana antes de enviar.', 'warning');
      setCurrentStep(2);
      return;
    }
    if (selectedCompIds.length === 0) {
      addToast('Te sugerimos asociar al menos una competencia curricular a esta semana.', 'warning');
      setCurrentStep(3);
      return;
    }
    if (!startActivity.trim() || !developmentActivity.trim() || !closingActivity.trim()) {
      addToast('Recuerda completar los momentos didácticos (Inicio, Desarrollo y Cierre).', 'warning');
      setCurrentStep(4);
      return;
    }

    const saved = handleSaveDraft();
    if (saved && saved.id) {
      submitPlanToCoordination(saved.id);
    }
    setIsSubmittingConfirm(false);
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
      title: 'Semana y Tema',
      shortTitle: 'Semana',
      desc: 'Semana 1 a 15 y unidad',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      step: 3,
      title: 'Competencias e Indicadores',
      shortTitle: 'Competencias',
      desc: 'Criterios e indicadores de logro',
      icon: <Award className="w-4 h-4" />
    },
    {
      step: 4,
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
                Paso a Paso de Planificación Académica
              </h2>
              {existingPlan?.status === 'approved' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Aprobada
                </span>
              )}
              {existingPlan?.status === 'submitted' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                  Enviada a Coordinación
                </span>
              )}
              {existingPlan?.status === 'rejected' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Con Observaciones
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {currentUser.fullName} · {subject} · {grade} · <strong>Semana {selectedWeek}</strong>
            </p>
          </div>
        </div>

        {/* Action button inside header */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Vista Previa</span>
          </button>
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-[#3A6B1F] bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#5EA832]" />
            <span>Guardar Borrador</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[580px] max-w-4xl mx-auto">
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
                      ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-200'
                      : isCurrent
                      ? 'bg-[#5EA832] text-white shadow-md shadow-emerald-200 ring-4 ring-emerald-100'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                  </div>
                  <div>
                    <div className={`text-xs font-bold transition-colors ${
                      isCurrent ? 'text-[#3A6B1F]' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {s.title}
                    </div>
                    <div className="text-[11px] text-slate-400 hidden sm:block">
                      {s.desc}
                    </div>
                  </div>
                </button>

                {idx < stepsConfig.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 transition-colors ${
                    currentStep > idx + 1 ? 'bg-emerald-400' : 'bg-slate-200'
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

          const getSubjectIcon = (sName: string) => {
            const cat = detectSubjectCategory(sName);
            switch (cat) {
              case 'lengua': return BookOpen;
              case 'matematica': return Calculator;
              case 'ingles': return Globe;
              case 'ciencia': return Compass;
              case 'sociales': return Tag;
              case 'deporte': return Dumbbell;
              case 'especiales':
                if (sName.toLowerCase().includes('música') || sName.toLowerCase().includes('musica')) return Music;
                if (sName.toLowerCase().includes('arte') || sName.toLowerCase().includes('teatro')) return Palette;
                return Sparkles;
              default:
                if (sName.toLowerCase().includes('robót') || sName.toLowerCase().includes('robot')) return Bot;
                if (sName.toLowerCase().includes('comput') || sName.toLowerCase().includes('tecno')) return Cpu;
                return Layers;
            }
          };

          const getGradeStyleConfig = (g: string, idx: number) => {
            const config = getGradeColorConfig(g);
            if (config) return config;
            const fallbackNum = ((idx % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
            return GRADE_COLOR_MAP[fallbackNum];
          };

          return (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Paso 1 de 4
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Selecciona la Asignatura y el Grado Escolar
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Elige la materia y el grado con su paleta de color institucional para comenzar tu planificación.
                </p>
              </div>

              {/* 1. ASIGNATURA CURRICULAR */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      1. Asignatura Curricular
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {subject ? `Seleccionada: ${subject}` : 'Sin seleccionar'}
                    </span>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar asignatura..."
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-8 pr-7 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                    />
                    {subjectSearch && (
                      <button
                        type="button"
                        onClick={() => setSubjectSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

                {/* Compact Subject Chips Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {filteredSubjects.map((s) => {
                    const isSelected = subject === s;
                    const catKey = detectSubjectCategory(s);
                    const catStyle = CATEGORY_STYLES[catKey];
                    const IconComp = getSubjectIcon(s);

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubject(s)}
                        className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-500/20 shadow-xs text-indigo-950 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-100/80 hover:border-slate-300 text-slate-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs"
                            style={{
                              backgroundColor: isSelected ? '#4f46e5' : catStyle?.bg || '#f1f5f9',
                              color: isSelected ? '#ffffff' : catStyle?.text || '#475569',
                            }}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs font-semibold truncate leading-tight">{s}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                  {filteredSubjects.length === 0 && (
                    <div className="col-span-full py-6 text-center text-xs text-slate-400">
                      No se encontraron asignaturas con "{subjectSearch}"
                    </div>
                  )}
                </div>
              </div>

              {/* 2. GRADO O NIVEL EDUCATIVO CON PALETA DE COLOR */}
              <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    2. Grado o Nivel Educativo
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Paleta Institucional
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
                            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: isSelected ? cfg.hex : '#f1f5f9',
                              color: isSelected ? cfg.textColor : '#475569',
                            }}
                          >
                            {cfg.shortName || `${idx + 1}°`}
                          </span>

                          {isSelected ? (
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs"
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
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Continuar a Seleccionar Semana</span>
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
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Paso 2 de 4
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Selecciona la Semana Académica y el Tema
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Elige cuál de las 15 semanas del ciclo escolar estás planificando para {subject} ({grade}).
              </p>
            </div>

            {/* Weeks 1 to 15 Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Selecciona la Semana (1 al 15)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {Array.from({ length: 15 }, (_, i) => i + 1).map((weekNum) => {
                  const isSelected = selectedWeek === weekNum;
                  const weekPlan = plans.find(
                    (p) => p.teacherId === currentUser.id && p.weekNumber === weekNum
                  );

                  let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                  let statusText = 'Disponible';

                  if (weekPlan) {
                    if (weekPlan.status === 'approved') {
                      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      statusText = 'Aprobada';
                    } else if (weekPlan.status === 'submitted') {
                      badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                      statusText = 'Enviada';
                    } else if (weekPlan.status === 'rejected') {
                      badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
                      statusText = 'Observaciones';
                    } else {
                      badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                      statusText = 'Borrador';
                    }
                  }

                  return (
                    <button
                      key={weekNum}
                      type="button"
                      id={`wizard-week-btn-${weekNum}`}
                      onClick={() => setSelectedWeek(weekNum)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                          Semana {weekNum}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${badgeColor}`}>
                        {statusText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Input */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Tema o Unidad de la Semana {selectedWeek} *
              </label>
              <input
                id="wizard-input-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Daily Routines & Telling Time / Fracciones Equivalentes"
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <p className="text-[11px] text-slate-500">
                Escribe un título conciso que represente el contenido pedagógico de la semana.
              </p>
            </div>

            {/* Navigation Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Paso 1: Asignatura</span>
              </button>

              <button
                id="wizard-step2-next-btn"
                onClick={() => {
                  if (!topic.trim()) {
                    addToast('Por favor escribe el tema de la semana.', 'warning');
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Continuar a Competencias e Indicadores</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: SELECCIONAR COMPETENCIAS E INDICADORES                            */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Paso 3 de 4
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Selecciona la Competencia a Trabajar con sus Indicadores
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Cargadas desde el banco para <strong>{subject}</strong> en <strong>{grade}</strong>. Selecciona las que evaluarás:
                </p>
              </div>

              <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 self-start sm:self-auto">
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
                          ? 'border-[#285A14] bg-emerald-50/40 ring-2 ring-[#285A14]/15 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                      style={isSelected ? getGradeLeftAccentStyle(comp.grade || grade, 4) : undefined}
                    >
                      <div className="flex items-start space-x-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mt-1 w-4 h-4 text-[#285A14] rounded-md border-slate-300 focus:ring-[#285A14] cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900">
                              {comp.title}
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <span 
                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border tracking-wide shadow-2xs"
                                style={getGradeBadgeStyle(comp.grade || grade)}
                              >
                                {comp.code}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#285A14]/10 text-[#285A14]">
                                {comp.category}
                              </span>
                            </div>
                          </div>

                          {/* When selected: display selectable indicators */}
                          {isSelected && (
                            <div 
                              className="mt-3 p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-2xs space-y-2.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5EA832]" />
                                  <span>Indicadores para esta planificación ({selectedForComp.length} de {compIndicators.length}):</span>
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => selectAllIndicators(comp.id)}
                                    className="text-[11px] font-semibold text-[#285A14] hover:underline cursor-pointer"
                                  >
                                    Marcar todos
                                  </button>
                                  <span className="text-slate-300 text-xs">·</span>
                                  <button
                                    type="button"
                                    onClick={() => deselectAllIndicators(comp.id)}
                                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
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
                                            ? 'bg-emerald-50/60 text-slate-800 font-medium' 
                                            : 'bg-slate-50/60 text-slate-400 hover:bg-slate-100/70 line-through decoration-slate-300'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isIndChecked}
                                          onChange={() => {}} // Handled by container
                                          className="mt-0.5 w-3.5 h-3.5 text-[#285A14] rounded border-slate-300 focus:ring-[#285A14] cursor-pointer"
                                        />
                                        <span className="leading-relaxed flex-1">{ind}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No hay indicadores específicos definidos en el banco.</p>
                              )}
                            </div>
                          )}

                          {!isSelected && (
                            <p className="text-xs text-slate-400 mt-1">
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
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">
                  No hay competencias registradas para {subject} - {grade}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  La Coordinación Académica puede dar de alta nuevas competencias desde su panel. Puedes continuar con la planificación y vincularlas luego.
                </p>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Paso 2: Semana y Tema</span>
              </button>

              <button
                id="wizard-step3-next-btn"
                onClick={() => setCurrentStep(4)}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
              >
                <span>Continuar al Planificador Completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 4: PLANIFICADOR COMPLETO (INICIO, DESARROLLO, CIERRE, RECURSOS, OBS)  */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-150">
            
            {/* Header summary of selected config */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  4
                </span>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    Planificador Didáctico · Semana {selectedWeek}
                  </span>
                  <span className="text-slate-500">
                    {subject} · {grade} · Tema: <strong>{topic || 'Sin tema'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-50"
                >
                  {selectedCompIds.length} Competencia{selectedCompIds.length !== 1 ? 's' : ''} asociada{selectedCompIds.length !== 1 ? 's' : ''} (Editar)
                </button>
              </div>
            </div>

            {/* Coordinator feedback notice if returned */}
            {existingPlan?.status === 'rejected' && existingPlan.coordinatorFeedback && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start space-x-3 text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <h4 className="font-bold uppercase tracking-wider text-xs text-amber-950 mb-1">
                    Observaciones recibidas de Coordinación Pedagógica:
                  </h4>
                  <p className="leading-relaxed">{existingPlan.coordinatorFeedback}</p>
                </div>
              </div>
            )}

            {/* Didactic Sequence Sections */}
            <div className="space-y-4">
              
              {/* 1. Inicio */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-2 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    <span>Inicio (Apertura, Motivación y Saberes Previos)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">10 - 15 min</span>
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
                  placeholder="Ej: Saludo de bienvenida, canción o video corto de 3 min sobre rutinas matutinas. Preguntas guía: ¿A qué hora nos levantamos hoy?..."
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

              {/* 2. Desarrollo */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-2 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    <span>Desarrollo (Construcción del Conocimiento y Práctica Guiada)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">45 - 60 min</span>
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
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

              {/* 3. Cierre */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-2 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    <span>Cierre (Evaluación Formativa, Síntesis y Metacognición)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">15 min</span>
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
                  placeholder="Ej: Cada alumno dice una oración sobre su rutina antes de salir (Ticket to Exit). Reflexión sobre el uso del tiempo..."
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

            </div>

            {/* Recursos & Observaciones de Adaptaciones Curriculares */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Recursos */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  Recursos Didácticos y Materiales
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
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

              {/* Observaciones de Adaptaciones Curriculares */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                  Observaciones de Adaptaciones Curriculares
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
                  className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
                />
              </div>

            </div>

            {/* Bottom Actions for Step 4 */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Paso 3: Competencias</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Guardar Borrador
                </button>

                {!isReadOnly && (
                  <button
                    type="button"
                    id="wizard-submit-coordination-btn"
                    onClick={() => setIsSubmittingConfirm(true)}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center space-x-2"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              ¿Enviar planificación a Coordinación?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Se enviará la planificación de la <strong>Semana {selectedWeek}</strong> ({subject} - {grade}) con sus <strong>{selectedCompIds.length} competencias</strong> e indicadores asociados para su revisión y aprobación.
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
                  handleSubmit();
                  onExit();
                }}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#5EA832] hover:bg-[#498925] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirmar y Enviar
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

    </div>
  );
};
