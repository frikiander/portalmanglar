import React from 'react';
import { X, Printer, CheckCircle2, AlertCircle, Clock, BookOpen, Layers, Award } from 'lucide-react';
import { LessonPlan, Competency } from '../types';
import { ManglarEmblem } from './ManglarLogo';
import { getGradeBadgeStyle, getGradeLeftAccentStyle } from '../utils/gradeColors';

interface Props {
  plan: LessonPlan;
  competencies: Competency[];
  onClose: () => void;
}

export const LessonPlanPreviewModal: React.FC<Props> = ({ plan, competencies, onClose }) => {
  const selectedComps = competencies.filter((c) => plan.competencyIds.includes(c.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 p-1 shadow-2xs flex items-center justify-center shrink-0">
              <ManglarEmblem className="w-full h-full" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Ficha Pedagógica Oficial · Semana {plan.weekNumber}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Portal Manglar · Colegio Integral El Manglar
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 print:p-0">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Docente:</span>
              <span className="font-semibold text-slate-800 text-sm">{plan.teacherName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Asignatura:</span>
              <span className="font-semibold text-slate-800 text-sm">{plan.subject}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Grado / Nivel:</span>
              <span className="font-semibold text-slate-800 text-sm">{plan.grade}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Estado:</span>
              <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full font-bold text-[11px] capitalize bg-indigo-100 text-indigo-800">
                {plan.status === 'approved' ? 'Aprobada' : plan.status === 'submitted' ? 'Enviada' : plan.status === 'rejected' ? 'Con Observaciones' : 'Borrador'}
              </span>
            </div>
          </div>

          {/* Topic Title */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Tema / Unidad de Aprendizaje
            </h4>
            <p className="text-lg font-bold text-slate-900 bg-white p-3 rounded-xl border border-slate-200">
              {plan.topic || 'Sin tema especificado'}
            </p>
          </div>

          {/* Competencies */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Competencias & Indicadores Curriculares
              </h4>
            </div>
            {selectedComps.length > 0 ? (
              <div className="grid gap-2.5">
                {selectedComps.map((comp) => {
                  const indicatorsToShow = plan.selectedIndicators?.[comp.id] !== undefined
                    ? plan.selectedIndicators[comp.id]
                    : (comp.indicators || []);

                  return (
                    <div 
                      key={comp.id} 
                      className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2 shadow-2xs"
                      style={getGradeLeftAccentStyle(comp.grade || plan.grade, 4)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span 
                            className="font-mono font-bold px-2 py-0.5 rounded-md border text-[10px] shadow-2xs"
                            style={getGradeBadgeStyle(comp.grade || plan.grade)}
                          >
                            {comp.code}
                          </span>
                          <span className="font-bold text-slate-900">{comp.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-[#285A14]/10 text-[#285A14] font-semibold text-[10px]">
                          Eje: {comp.category}
                        </span>
                      </div>

                      {/* Selected Indicators */}
                      {indicatorsToShow.length > 0 ? (
                        <div className="bg-white/80 rounded-lg p-2.5 border border-emerald-100/60 space-y-1">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block mb-1">
                            Indicadores de logro seleccionados ({indicatorsToShow.length}):
                          </span>
                          <ul className="space-y-1">
                            {indicatorsToShow.map((ind, i) => (
                              <li key={i} className="text-xs text-slate-700 flex items-start space-x-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#5EA832] shrink-0 mt-0.5" />
                                <span>{ind}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic text-[11px]">No se seleccionaron indicadores específicos.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No se han asociado competencias específicas a esta semana.</p>
            )}
          </div>

          {/* Pedagogical Sequence Sections */}
          <div className="space-y-4">
            {/* Inicio */}
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm mb-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
                <span>Inicio (Motivación y saberes previos)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {plan.startActivity || <span className="italic text-slate-400">Sin descripción de inicio</span>}
              </p>
            </div>

            {/* Desarrollo */}
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm mb-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
                <span>Desarrollo (Actividades centrales y práctica guiada)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {plan.developmentActivity || <span className="italic text-slate-400">Sin descripción de desarrollo</span>}
              </p>
            </div>

            {/* Cierre */}
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm mb-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">3</span>
                <span>Cierre (Evaluación formativa y metacognición)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {plan.closingActivity || <span className="italic text-slate-400">Sin descripción de cierre</span>}
              </p>
            </div>
          </div>

          {/* Recursos & Observaciones Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Recursos Didácticos & Materiales
              </span>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {plan.resources || 'No especificados'}
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                Observaciones y Adaptaciones
              </span>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {plan.observations || 'Sin observaciones adicionales'}
              </p>
            </div>
          </div>

          {/* Feedback from Coordinator if present */}
          {plan.coordinatorFeedback && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Observaciones de Coordinación Pedagógica</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                {plan.coordinatorFeedback}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#5EA832] hover:bg-[#498925] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Cerrar Vista Previa
          </button>
        </div>

      </div>
    </div>
  );
};
