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
import { matchSubjects, matchGrades } from '../utils/curricularMatcher';
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
    availableGradeNames,
    getLapsoWeeks,
  } = useEduPlan();

  // Find existing plan for this week and teacher
  const currentPlan = plans.find(
    (p) => p.teacherId === currentUser.id && p.weekNumber === selectedWeek
  );

  const baseSubjects = availableSubjectNames?.length > 0 ? availableSubjectNames : AVAILABLE_SUBJECTS;
  const baseGrades = availableGradeNames?.length > 0 ? availableGradeNames : AVAILABLE_GRADES;

  // Form local state
  const [subject, setSubject] = useState<string>(
    currentPlan?.subject || currentUser.specialty || baseSubjects[0] || 'Inglés (Language Arts)'
  );
  const [grade, setGrade] = useState<string>(
    currentPlan?.grade || currentUser.schoolGrade || baseGrades[0] || '4to Grado'
  );

  const displaySubjects = baseSubjects.includes(subject) ? baseSubjects : [subject, ...baseSubjects];
  const displayGrades = baseGrades.includes(grade) ? baseGrades : [grade, ...baseGrades];
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
    (c) => matchSubjects(c.subject, subject) && matchGrades(c.grade, grade)
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
      addToast('Escribe el tema o título de la semana antes de enviar.', 'warning');
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
      <div className="px-6 py-5 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900">
              Planificación Pedagógica · Semana {selectedWeek}
            </h1>
            
            {/* Status Pill */}
            {currentPlan?.status === 'approved' && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800 border border-success-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                <span>Aprobada por Coordinación</span>
              </span>
            )}
            {currentPlan?.status === 'submitted' && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 border border-primary-200">
                <Clock className="w-3.5 h-3.5 text-primary-600" />
                <span>Enviada a Coordinación (en revisión)</span>
              </span>
            )}
            {currentPlan?.status === 'rejected' && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-warning-100 text-warning-900 border border-warning-300">
                <AlertCircle className="w-3.5 h-3.5 text-warning-700" />
                <span>Con observaciones de Coordinación</span>
              </span>
            )}
            {(!currentPlan || currentPlan.status === 'draft') && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                <span>Borrador en edición</span>
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
            <span>Vista previa</span>
          </button>

          {!isReadOnly && (
            <>
              <button
                type="button"
                id="save-draft-btn"
                onClick={handleSaveDraft}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100/80 transition-colors"
              >
                <Save className="w-4 h-4 text-primary-600" />
                <span>Guardar borrador</span>
              </button>

              <button
                type="button"
                id="submit-coordination-btn"
                onClick={() => setIsSubmittingConfirm(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-colors"
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
        <div className="m-6 p-4 rounded-xl bg-warning-50/90 border border-warning-300 flex items-start space-x-3 text-warning-900">
          <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <h4 className="font-bold text-warning-950 text-xs mb-1">
              Observaciones de Coordinación Pedagógica ({currentPlan.reviewedAt ? new Date(currentPlan.reviewedAt).toLocaleDateString() : 'Reciente'}):
            </h4>
            <p className="leading-relaxed">{currentPlan.coordinatorFeedback}</p>
            <p className="mt-2 text-warning-800 font-medium text-xs">
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Asignatura
            </label>
            <div className="relative">
              <select
                id="select-subject"
                disabled={isReadOnly}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium disabled:bg-slate-100 disabled:text-slate-500"
              >
                {displaySubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grado Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Grado / nivel
            </label>
            <select
              id="select-grade"
              disabled={isReadOnly}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium disabled:bg-slate-100 disabled:text-slate-500"
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Semana académica
            </label>
            <select
              id="select-week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
            >
              {Array.from({ length: getLapsoWeeks() }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Semana {w}
                </option>
              ))}
            </select>
          </div>

          {/* Tema / Título de la clase */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tema o unidad de la semana
            </label>
            <input
              id="input-topic"
              type="text"
              disabled={isReadOnly}
              placeholder="Ej: Daily Routines / Fracciones"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all disabled:bg-slate-100"
            />
          </div>

        </div>

        {/* Section: Multiselect Competencias */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-primary-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Competencias Curriculares ({subject} - {grade})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Selecciona las competencias que se desarrollarán durante esta semana académica:
              </p>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 border border-primary-100 self-start sm:self-auto">
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
                        ? 'bg-success-50/40 border-primary-800 ring-2 ring-primary-800/15 shadow-xs'
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
                        className="mt-0.5 w-4 h-4 text-primary-800 rounded-md border-slate-300 focus:ring-primary-800 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-900">
                            {comp.title}
                          </span>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span 
                              className="text-xs tabular-nums font-bold px-1.5 py-0.5 rounded-md border tracking-wide shadow-2xs"
                              style={getGradeBadgeStyle(comp.grade || grade)}
                            >
                              {comp.code}
                            </span>
                            <span className="text-xs font-semibold text-primary-800 bg-primary-800/10 px-2 py-0.5 rounded-md">
                              {comp.category}
                            </span>
                          </div>
                        </div>

                        {/* If selected: show indicators list with individual checkboxes */}
                        {isSelected && (
                          <div 
                            className="mt-2.5 p-3 rounded-xl bg-white border border-success-200/80 space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                              <span className="text-xs font-bold text-slate-700">
                                Indicadores a evaluar ({selectedForComp.length} de {compIndicators.length}):
                              </span>
                              {!isReadOnly && (
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
                                          ? 'bg-success-50/60 text-slate-800 font-medium' 
                                          : 'bg-slate-50/60 text-slate-500 line-through decoration-slate-300'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isIndChecked}
                                        disabled={isReadOnly}
                                        onChange={() => {}}
                                        className="mt-0.5 w-3.5 h-3.5 text-primary-800 rounded border-slate-300 focus:ring-primary-800 cursor-pointer"
                                      />
                                      <span className="leading-relaxed flex-1">{ind}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic">No hay indicadores específicos registrados.</p>
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
              <p className="text-xs text-slate-500 mt-1">
                La Coordinación puede agregar nuevas competencias desde la "Vista Coordinador".
              </p>
            </div>
          )}
        </div>

        {/* Section: Pedagogical Sequence (Inicio, Desarrollo, Cierre) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>Secuencia didáctica de la clase</span>
            </h3>
            <span className="text-xs text-slate-500">Campos enriquecidos</span>
          </div>

          {/* 1. Inicio */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Inicio (apertura, motivación y saberes previos)</span>
              </label>
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
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

          {/* 2. Desarrollo */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Desarrollo (construcción del aprendizaje y práctica guiada)</span>
              </label>
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
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

          {/* 3. Cierre */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>Cierre (evaluación formativa, síntesis y metacognición)</span>
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Instrumento de evaluación rápida (ticket de salida, preguntas de reflexión: ¿Qué aprendimos hoy? ¿Cómo lo aplicamos?).
            </p>
            <textarea
              id="textarea-cierre"
              disabled={isReadOnly}
              rows={3}
              value={closingActivity}
              onChange={(e) => setClosingActivity(e.target.value)}
              placeholder="Ej: Ronda de preguntas 'Ticket to Exit' donde cada alumno dice una rutina... reflexión final sobre puntualidad..."
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

        </div>

        {/* Section: Recursos & Observaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Recursos */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Recursos y materiales didácticos
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
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

          {/* Observaciones */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Observaciones & adaptaciones curriculares
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
              className="w-full text-xs sm:text-sm text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-primary-500 leading-relaxed resize-y disabled:bg-slate-50"
            />
          </div>

        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Lightbulb className="w-4 h-4 text-warning-500" />
            <span>Los cambios guardados como borrador quedan disponibles inmediatamente en tu sesión.</span>
          </div>

          {!isReadOnly && (
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Guardar borrador
              </button>
              <button
                type="button"
                onClick={() => setIsSubmittingConfirm(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-all"
              >
                Enviar a Coordinación
              </button>
            </div>
          )}
        </div>

      </form>

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
              Esta acción notificará al equipo de Coordinación académica para revisar y validar tu propuesta pedagógica de la <strong>Semana {selectedWeek}</strong> ({subject} - {grade}).
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
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs"
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
