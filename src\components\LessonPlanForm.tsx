import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Send, 
  Eye, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  CheckSquare, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  FileEdit,
  Tag,
  Lightbulb
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { AVAILABLE_SUBJECTS, AVAILABLE_GRADES } from '../data/mockData';
import { LessonPlanPreviewModal } from './LessonPlanPreviewModal';
import { getGradeBadgeStyle, getGradeLeftAccentStyle } from '../utils/gradeColors';
import { LessonPlan } from '../types';

export const LessonPlanForm: React.FC = () => {
  const { 
    selectedWeek, 
    setSelectedWeek,
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

  // Find existing plan for this week and teacher
  const currentPlan = plans.find(
    (p) => p.teacherId === currentUser.id && p.weekNumber === selectedWeek
  );

  // Form local state
  const [subject, setSubject] = useState<string>(
    currentPlan?.subject || currentUser.specialty?.includes('Inglés') ? 'English' : 'English'
  );
  const [grade, setGrade] = useState<string>(
    currentPlan?.grade || currentUser.schoolGrade || '4to Grado'
  );
  const [topic, setTopic] = useState<string>(currentPlan?.topic || '');
  const [selectedCompIds, setSelectedCompIds] = useState<string[]>(
    currentPlan?.competencyIds || []
  );
  const [selectedIndicators, setSelectedIndicators] = useState<Record<string, string[]>>(
    currentPlan?.selectedIndicators || {}
  );
  const [startActivity, setStartActivity] = useState<string>(
    currentPlan?.startActivity || ''
  );
  const [developmentActivity, setDevelopmentActivity] = useState<string>(
    currentPlan?.developmentActivity || ''
  );
  const [closingActivity, setClosingActivity] = useState<string>(
    currentPlan?.closingActivity || ''
  );
  const [resources, setResources] = useState<string>(
    currentPlan?.resources || ''
  );
  const [observations, setObservations] = useState<string>(
    currentPlan?.observations || ''
  );

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  // Sync state when selectedWeek or currentPlan changes
  useEffect(() => {
    if (currentPlan) {
      setSubject(currentPlan.subject);
      setGrade(currentPlan.grade);
      setTopic(currentPlan.topic);
      setSelectedCompIds(currentPlan.competencyIds || []);
      setSelectedIndicators(currentPlan.selectedIndicators || {});
      setStartActivity(currentPlan.startActivity);
      setDevelopmentActivity(currentPlan.developmentActivity);
      setClosingActivity(currentPlan.closingActivity);
      setResources(currentPlan.resources);
      setObservations(currentPlan.observations || '');
    } else {
      // Default empty form for unstarted weeks
      setTopic('');
      setSelectedCompIds([]);
      setSelectedIndicators({});
      setStartActivity('');
      setDevelopmentActivity('');
      setClosingActivity('');
      setResources('');
      setObservations('');
    }
  }, [selectedWeek, currentPlan]);

  // Dynamically load competencies matching subject and grade
  const availableCompetencies = competencies.filter(
    (c) =>
      c.subject.toLowerCase() === subject.toLowerCase() &&
      c.grade.toLowerCase() === grade.toLowerCase()
  );

  const toggleCompetency = (compId: string) => {
    if (currentPlan?.status === 'approved') return; // Read-only if already approved
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
      // Por defecto se seleccionan TODOS los indicadores de esta competencia
      const targetComp = competencies.find((c) => c.id === compId);
      setSelectedIndicators((prev) => ({
        ...prev,
        [compId]: targetComp?.indicators ? [...targetComp.indicators] : [],
      }));
    }
  };

  const toggleIndicator = (compId: string, indicatorText: string) => {
    if (currentPlan?.status === 'approved') return;
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
    if (currentPlan?.status === 'approved') return;
    const targetComp = competencies.find((c) => c.id === compId);
    if (!targetComp) return;
    setSelectedIndicators((prev) => ({
      ...prev,
      [compId]: [...(targetComp.indicators || [])],
    }));
  };

  const deselectAllIndicators = (compId: string) => {
    if (currentPlan?.status === 'approved') return;
    setSelectedIndicators((prev) => ({
      ...prev,
      [compId]: [],
    }));
  };

  const handleSaveDraft = () => {
    const saved = savePlan({
      id: currentPlan?.id,
      teacherId: currentUser.id,
      weekNumber: selectedWeek,
      subject,
      grade,
      topic: topic.trim() || `Planificación Semana ${selectedWeek}`,
      status: currentPlan?.status === 'rejected' ? 'rejected' : 'draft',
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
      addToast('Por favor escribe el Tema o Título de la semana antes de enviar.', 'warning');
      return;
    }
    if (!startActivity.trim() || !developmentActivity.trim() || !closingActivity.trim()) {
      addToast('Recuerda completar las actividades de Inicio, Desarrollo y Cierre.', 'warning');
      return;
    }

    const saved = handleSaveDraft();
    if (saved && saved.id) {
      submitPlanToCoordination(saved.id);
    }
    setIsSubmittingConfirm(false);
  };

  const isReadOnly = currentPlan?.status === 'approved';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      
      {/* Form Header / Status Banner */}
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              Planificación Pedagógica · Semana {selectedWeek}
            </h1>
            
            {/* Status Pill */}
            {currentPlan?.status === 'approved' && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aprobada por Coordinación</span>
              </span>
            )}
            {currentPlan?.status === 'submitted' && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Enviada a Coordinación (En Revisión)</span>
              </span>
            )}
            {currentPlan?.status === 'rejected' && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Con Observaciones de Coordinación</span>
              </span>
            )}
            {(!currentPlan || currentPlan.status === 'draft') && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                <span>Borrador en Edición</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diseña los momentos didácticos y alinea tus estrategias con el banco de competencias.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Vista Previa</span>
          </button>

          {!isReadOnly && (
            <>
              <button
                type="button"
                id="save-draft-btn"
                onClick={handleSaveDraft}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100/80 transition-colors"
              >
                <Save className="w-4 h-4 text-indigo-600" />
                <span>Guardar Borrador</span>
              </button>

              <button
                type="button"
                id="submit-coordination-btn"
                onClick={() => setIsSubmittingConfirm(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Enviar a Coordinación</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Observaciones de Coordinación Callout (if rejected) */}
      {currentPlan?.status === 'rejected' && currentPlan.coordinatorFeedback && (
        <div className="m-6 p-4 rounded-xl bg-amber-50/90 border border-amber-300 flex items-start space-x-3 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <h4 className="font-bold text-amber-950 uppercase tracking-wide text-xs mb-1">
              Observaciones de Coordinación Pedagógica ({currentPlan.reviewedAt ? new Date(currentPlan.reviewedAt).toLocaleDateString() : 'Reciente'}):
            </h4>
            <p className="leading-relaxed">{currentPlan.coordinatorFeedback}</p>
            <p className="mt-2 text-amber-800 font-medium text-xs">
              💡 Puedes ajustar las actividades solicitadas abajo y hacer clic en <strong>"Enviar a Coordinación"</strong> cuando estés listo.
            </p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
        
        {/* Row 1: Dropdowns (Asignatura, Grado, Semana) + Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          
          {/* Asignatura Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Asignatura
            </label>
            <div className="relative">
              <select
                id="select-subject"
                disabled={isReadOnly}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium disabled:bg-slate-100 disabled:text-slate-500"
              >
                {(availableSubjectNames?.length > 0 ? availableSubjectNames : AVAILABLE_SUBJECTS).map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grado Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Grado / Nivel
            </label>
            <select
              id="select-grade"
              disabled={isReadOnly}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium disabled:bg-slate-100 disabled:text-slate-500"
            >
              {displayGrades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Semana Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Semana Académica
            </label>
            <select
              id="select-week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Semana {w}
                </option>
              ))}
            </select>
          </div>

          {/* Tema / Título de la clase */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Tema o Unidad de la Semana
            </label>
            <input
              id="input-topic"
              type="text"
              disabled={isReadOnly}
              placeholder="Ej: Daily Routines / Fracciones"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-slate-100"
            />
          </div>

        </div>

        {/* Section: Multiselect Competencias */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Competencias Curriculares ({subject} - {grade})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Selecciona las competencias que se desarrollarán durante esta semana académica:
              </p>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 self-start sm:self-auto">
              {selectedCompIds.length} seleccionada{selectedCompIds.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* List of competencies */}
          {availableCompetencies.length > 0 ? (
            <div className="space-y-3 mt-3">
              {availableCompetencies.map((comp) => {
                const isSelected = selectedCompIds.includes(comp.id);
                const compIndicators = comp.indicators || [];
                const selectedForComp = selectedIndicators[comp.id] || [];

                return (
                  <div
                    key={comp.id}
                    id={`competency-pill-${comp.id}`}
                    onClick={() => toggleCompetency(comp.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-emerald-50/40 border-[#285A14] ring-2 ring-[#285A14]/15 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                    style={isSelected ? getGradeLeftAccentStyle(comp.grade || grade, 4) : undefined}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        disabled={isReadOnly}
                        className="mt-0.5 w-4 h-4 text-[#285A14] rounded-md border-slate-300 focus:ring-[#285A14] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">
                            {comp.title}
                          </span>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span 
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border tracking-wide shadow-2xs"
                              style={getGradeBadgeStyle(comp.grade || grade)}
                            >
                              {comp.code}
                            </span>
                            <span className="text-[10px] font-semibold text-[#285A14] bg-[#285A14]/10 px-2 py-0.5 rounded-md">
                              {comp.category}
                            </span>
                          </div>
                        </div>

                        {/* If selected: show indicators list with individual checkboxes */}
                        {isSelected && (
                          <div 
                            className="mt-2.5 p-3 rounded-xl bg-white border border-emerald-200/80 space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                              <span className="text-[11px] font-bold text-slate-700">
                                Indicadores a evaluar ({selectedForComp.length} de {compIndicators.length}):
                              </span>
                              {!isReadOnly && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => selectAllIndicators(comp.id)}
                                    className="text-[10px] font-semibold text-[#285A14] hover:underline cursor-pointer"
                                  >
                                    Marcar todos
                                  </button>
                                  <span className="text-slate-300 text-xs">·</span>
                                  <button
                                    type="button"
                                    onClick={() => deselectAllIndicators(comp.id)}
                                    className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                                  >
                                    Destildar todos
                                  </button>
                                </div>
                              )}
                            </div>

                            {compIndicators.length > 0 ? (
                              <div className="space-y-1.5">
                                {compIndicators.map((ind, indIdx) => {
                                  const isIndChecked = selectedForComp.includes(ind);

                                  return (
                                    <label
                                      key={indIdx}
                                      onClick={(e) => {
                                        if (isReadOnly) return;
                                        e.stopPropagation();
                                        toggleIndicator(comp.id, ind);
                                      }}
                                      className={`flex items-start space-x-2 p-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                                        isIndChecked 
                                          ? 'bg-emerald-50/60 text-slate-800 font-medium' 
                                          : 'bg-slate-50/60 text-slate-400 line-through decoration-slate-300'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isIndChecked}
                                        disabled={isReadOnly}
                                        onChange={() => {}}
                                        className="mt-0.5 w-3.5 h-3.5 text-[#285A14] rounded border-slate-300 focus:ring-[#285A14] cursor-pointer"
                                      />
                                      <span className="leading-relaxed flex-1">{ind}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No hay indicadores específicos registrados.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                No hay competencias registradas en la base de datos para <strong>{subject}</strong> en <strong>{grade}</strong>.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                La Coordinación puede agregar nuevas competencias desde la "Vista Coordinador".
              </p>
            </div>
          )}
        </div>

        {/* Section: Pedagogical Sequence (Inicio, Desarrollo, Cierre) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Secuencia Didáctica de la Clase</span>
            </h3>
            <span className="text-xs text-slate-400">Campos enriquecidos</span>
          </div>

          {/* 1. Inicio */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-2 uppercase tracking-wide">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Inicio (Apertura, Motivación y Saberes Previos)</span>
              </label>
              <span className="text-[11px] text-slate-400">Aprox. 10 - 15 min</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Describe cómo activarás la atención de los estudiantes, preguntas generadoras y conexión con la clase anterior.
            </p>
            <textarea
              id="textarea-inicio"
              disabled={isReadOnly}
              rows={3}
              value={startActivity}
              onChange={(e) => setStartActivity(e.target.value)}
              placeholder="Ej: Saludo inicial, dinámica Simon Says con flashcards para recuperar vocabulario previo de la hora..."
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

          {/* 2. Desarrollo */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-2 uppercase tracking-wide">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Desarrollo (Construcción del Aprendizaje y Práctica Guiada)</span>
              </label>
              <span className="text-[11px] text-slate-400">Aprox. 45 - 60 min</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Detalla la explicación temática, modelado docente, trabajo colaborativo en pares o equipos y actividades prácticas.
            </p>
            <textarea
              id="textarea-desarrollo"
              disabled={isReadOnly}
              rows={5}
              value={developmentActivity}
              onChange={(e) => setDevelopmentActivity(e.target.value)}
              placeholder="Ej: 1. Presentación guiada con proyector de la estructura gramatical... 2. Trabajo en parejas con fichas ilustradas..."
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

          {/* 3. Cierre */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-2 uppercase tracking-wide">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>Cierre (Evaluación Formativa, Síntesis y Metacognición)</span>
              </label>
              <span className="text-[11px] text-slate-400">Aprox. 15 min</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Instrumento de evaluación rápida (Ticket de salida, preguntas de reflexión: ¿Qué aprendimos hoy? ¿Cómo lo aplicamos?).
            </p>
            <textarea
              id="textarea-cierre"
              disabled={isReadOnly}
              rows={3}
              value={closingActivity}
              onChange={(e) => setClosingActivity(e.target.value)}
              placeholder="Ej: Ronda de preguntas 'Ticket to Exit' donde cada alumno dice una rutina... reflexión final sobre puntualidad..."
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

        </div>

        {/* Section: Recursos & Observaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Recursos */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
              Recursos y Materiales Didácticos
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Materiales impresos, proyector, plataformas, útiles escolares.
            </p>
            <textarea
              id="textarea-recursos"
              disabled={isReadOnly}
              rows={3}
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              placeholder="Ej: Proyector, flashcards de rutinas, relojes didácticos manipulables, guía de trabajo impresa..."
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

          {/* Observaciones */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
              Observaciones & Adaptaciones Curriculares
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Atención a la diversidad, adecuaciones para estudiantes NEE o contingencias.
            </p>
            <textarea
              id="textarea-observaciones"
              disabled={isReadOnly}
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ej: Se adaptará el tamaño de letra en la ficha de Mateo; soporte visual reforzado para el grupo..."
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Los cambios guardados como borrador quedan disponibles inmediatamente en tu sesión.</span>
          </div>

          {!isReadOnly && (
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Guardar Borrador
              </button>
              <button
                type="button"
                onClick={() => setIsSubmittingConfirm(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                Enviar a Coordinación
              </button>
            </div>
          )}
        </div>

      </form>

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
              Esta acción notificará al equipo de Coordinación Académica para revisar y validar tu propuesta pedagógica de la <strong>Semana {selectedWeek}</strong> ({subject} - {grade}).
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsSubmittingConfirm(false)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                id="confirm-submit-button"
                onClick={handleSubmit}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
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
            id: currentPlan?.id || 'temp',
            teacherId: currentUser.id,
            teacherName: currentUser.fullName,
            teacherAvatar: currentUser.avatar,
            weekNumber: selectedWeek,
            subject,
            grade,
            topic: topic || 'Sin título aún',
            status: currentPlan?.status || 'draft',
            competencyIds: selectedCompIds,
            selectedIndicators: selectedIndicators,
            startActivity,
            developmentActivity,
            closingActivity,
            resources,
            observations,
            coordinatorFeedback: currentPlan?.coordinatorFeedback,
            updatedAt: new Date().toISOString(),
          }}
          competencies={competencies}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

    </div>
  );
};
