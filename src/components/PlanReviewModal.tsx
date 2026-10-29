import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  User, 
  Award, 
  MessageSquare,
  Sparkles,
  Printer
} from 'lucide-react';
import { LessonPlan, Competency } from '../types';
import { planWhen } from '../utils/planDays';
import { useEduPlan } from '../context/EduPlanContext';
import { getGradeBadgeStyle, getGradeLeftAccentStyle } from '../utils/gradeColors';
import { LessonPlanPreviewModal } from './LessonPlanPreviewModal';

interface Props {
  plan: LessonPlan;
  competencies: Competency[];
  onClose: () => void;
}

export const PlanReviewModal: React.FC<Props> = ({ plan, competencies, onClose }) => {
  const { reviewPlan } = useEduPlan();
  const [feedback, setFeedback] = useState<string>(plan.coordinatorFeedback || '');
  const [showFeedbackWarning, setShowFeedbackWarning] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const selectedComps = competencies.filter((c) => plan.competencyIds.includes(c.id));

  const handleApprove = () => {
    reviewPlan(plan.id, 'approved', feedback.trim() || 'Planificación revisada y aprobada por Coordinación.');
    onClose();
  };

  const handleReject = () => {
    if (!feedback.trim()) {
      setShowFeedbackWarning(true);
      return;
    }
    reviewPlan(plan.id, 'rejected', feedback.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-raiz/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center space-x-3">
            <img
              src={plan.teacherAvatar}
              alt={plan.teacherName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/20"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  {plan.topic || planWhen(plan)}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  plan.status === 'approved' 
                    ? 'bg-success-100 text-success-800'
                    : plan.status === 'submitted'
                    ? 'bg-primary-100 text-primary-800'
                    : plan.status === 'rejected'
                    ? 'bg-warning-100 text-warning-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {plan.status === 'approved' ? 'Aprobada' : plan.status === 'submitted' ? 'Pendiente Revisión' : plan.status === 'rejected' ? 'Con Observaciones' : 'Borrador'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {plan.teacherName} · {plan.subject} · {plan.grade} · <strong>{planWhen(plan)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPrintPreview(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Imprimir / Exportar PDF de la Ficha"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Imprimir ficha</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Competencies */}
          <div>
            <h4 className="text-xs font-bold text-slate-600 mb-2 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-primary-600" />
              <span>Competencias Curriculares Asociadas ({selectedComps.length})</span>
            </h4>
            {selectedComps.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-2.5">
                {selectedComps.map((comp) => (
                  <div 
                    key={comp.id} 
                    className="p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs space-y-1.5"
                    style={getGradeLeftAccentStyle(comp.grade || plan.grade, 4)}
                  >
                    <div className="flex justify-between items-start gap-2 font-semibold text-slate-900">
                      <span>{comp.title}</span>
                      <span 
                        className="tabular-nums text-xs font-bold px-1.5 py-0.5 rounded-md border tracking-wide shrink-0 shadow-2xs"
                        style={getGradeBadgeStyle(comp.grade || plan.grade)}
                      >
                        {comp.code}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-semibold text-success-800 bg-success-50 px-1.5 py-0.5 rounded">
                        Eje: {comp.category}
                      </span>
                      {comp.indicators && comp.indicators.length > 0 && (
                        <span className="text-slate-500">
                          {comp.indicators.length} indicadores
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No se asociaron competencias específicas a esta semana.</p>
            )}
          </div>

          {/* Secuencia Didáctica */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-600 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>Secuencia didáctica propuesta</span>
            </h4>

            {/* Inicio */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs font-bold text-primary-700 mb-1.5 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center">1</span>
                <span>Inicio (apertura y saberes previos)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {plan.startActivity || <span className="text-slate-500 italic">Sin contenido</span>}
              </p>
            </div>

            {/* Desarrollo */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs font-bold text-primary-700 mb-1.5 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center">2</span>
                <span>Desarrollo (construcción y práctica guiada)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {plan.developmentActivity || <span className="text-slate-500 italic">Sin contenido</span>}
              </p>
            </div>

            {/* Cierre */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="text-xs font-bold text-primary-700 mb-1.5 flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center">3</span>
                <span>Cierre (evaluación y metacognición)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {plan.closingActivity || <span className="text-slate-500 italic">Sin contenido</span>}
              </p>
            </div>
          </div>

          {/* Recursos & Observaciones */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Recursos y materiales
              </span>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {plan.resources || 'No especificados'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Observaciones del docente
              </span>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {plan.observations || 'Sin observaciones registradas'}
              </p>
            </div>
          </div>

          {/* Coordinator Feedback Box */}
          <div className="p-4 rounded-2xl border-2 border-primary-100 bg-primary-50/40">
            <label className="block text-xs font-bold text-primary-950 mb-1 flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4 text-primary-600" />
              <span>Observaciones / retroalimentación de Coordinación</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Este mensaje será visible para el docente si apruebas o si solicitas ajustes a la planificación.
            </p>
            <textarea
              id="coordinator-feedback-input"
              rows={3}
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                setShowFeedbackWarning(false);
              }}
              placeholder="Ej: Excelente propuesta... / Sugiero reforzar la actividad de desarrollo incluyendo más dinámicas en grupo..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
            />
            {showFeedbackWarning && (
              <p className="text-xs text-danger-600 mt-1.5 font-medium flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Escribe las observaciones explicando al docente qué debe corregir antes de rechazar.</span>
              </p>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Cerrar sin cambios
          </button>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              id="reject-plan-btn"
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold text-warning-800 bg-warning-100 hover:bg-warning-200 border border-warning-300 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
            >
              <AlertCircle className="w-4 h-4 text-warning-600" />
              <span>Rechazar / con observaciones</span>
            </button>

            <button
              id="approve-plan-btn"
              onClick={handleApprove}
              className="flex-1 sm:flex-none px-5 py-2 text-xs sm:text-sm font-bold text-white bg-success-600 hover:bg-success-700 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aprobar planificación</span>
            </button>
          </div>
        </div>

      </div>

      {/* Official Print Preview Modal */}
      {showPrintPreview && (
        <LessonPlanPreviewModal
          plan={plan}
          competencies={competencies}
          onClose={() => setShowPrintPreview(false)}
        />
      )}
    </div>
  );
};
