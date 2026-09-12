import React from 'react';
import { X, Printer, CheckCircle2, AlertCircle, Award } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4 overflow-y-auto print:p-0 print:static print:block print:overflow-visible">
      {/* ─── Reglas de Impresión Oficial y Ajuste Dinámico ────────────────── */}
      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 8mm 10mm;
          }

          /* Ocultar cualquier elemento del fondo de la aplicación */
          body * {
            visibility: hidden;
          }

          /* Mostrar únicamente el documento oficial de planificación */
          #printable-lesson-plan,
          #printable-lesson-plan * {
            visibility: visible;
          }

          /* Posicionar la ficha para ocupar toda la hoja sin marcos de modal ni sombras */
          #printable-lesson-plan {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            display: block !important;
          }

          /* Respetar colores y fondos exactos en la impresión */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Ocultar botones y elementos de navegación interactiva */
          .no-print {
            display: none !important;
          }

          /* Evitar cortes indeseados en títulos o bloques lógicos */
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-8 max-h-[92vh] flex flex-col print:border-none print:shadow-none print:rounded-none print:my-0 print:max-h-none print:overflow-visible print:w-full print:max-w-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 no-print shrink-0">
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
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#5EA832] hover:bg-[#498925] border border-transparent rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div 
          id="printable-lesson-plan" 
          className="p-6 overflow-y-auto space-y-4 print:p-0 print:space-y-2 print:overflow-visible flex-1 text-slate-900 bg-white font-sans"
        >
          
          {/* Institutional Header */}
          <div className="border-b-2 border-[#285A14] pb-3 mb-3 print:pb-2 print:mb-2 print-avoid-break">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-12 h-12 print:w-11 print:h-11 rounded-xl bg-white border border-emerald-100 p-1 shadow-2xs print:shadow-none flex items-center justify-center shrink-0">
                  <ManglarEmblem className="w-full h-full" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] print:text-[8px] font-black uppercase tracking-widest text-[#285A14] block leading-tight">
                    República Bolivariana de Venezuela · MPPE
                  </span>
                  <h1 className="text-base print:text-sm font-black text-slate-900 tracking-tight leading-snug uppercase">
                    Colegio Integral El Manglar
                  </h1>
                  <p className="text-xs print:text-[9.5px] text-slate-600 font-medium leading-tight">
                    Coordinación Académica · Planificación Didáctica Semanal
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-block bg-emerald-50 print:bg-emerald-50/80 border border-emerald-200 px-2.5 py-1 print:px-2 print:py-0.5 rounded-lg text-right">
                  <span className="text-xs print:text-[10px] font-black text-emerald-950 block leading-tight">
                    SEMANA {plan.weekNumber}
                  </span>
                  <span className="text-[9px] print:text-[8px] font-bold text-emerald-700 block leading-tight">
                    Año Escolar 2026 - 2027
                  </span>
                </div>
                <div className="mt-1 print:mt-0.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[9px] uppercase border ${
                    plan.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : plan.status === 'submitted'
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                      : plan.status === 'rejected'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {plan.status === 'approved' ? 'Planificación Aprobada' : plan.status === 'submitted' ? 'Enviada a Revisión' : plan.status === 'rejected' ? 'Con Observaciones' : 'Borrador'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Grid (Ficha Técnica) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 print:gap-1.5 p-2.5 print:p-1.5 bg-slate-50 print:bg-slate-50/70 rounded-lg border border-slate-200 print-avoid-break text-xs print:text-[9.5px]">
            <div>
              <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">Docente:</span>
              <span className="font-bold text-slate-900 truncate block">{plan.teacherName}</span>
            </div>
            <div>
              <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">Asignatura:</span>
              <span className="font-bold text-slate-900 truncate block">{plan.subject}</span>
            </div>
            <div>
              <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">Grado / Nivel:</span>
              <span className="font-bold text-slate-900 truncate block">{plan.grade}</span>
            </div>
            <div>
              <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block leading-tight">Momento Pedagógico:</span>
              <span className="font-bold text-slate-900 truncate block">I Momento · Regular</span>
            </div>
          </div>

          {/* Topic Title */}
          <div className="p-2.5 print:p-1.5 bg-white rounded-lg border border-slate-200 print-avoid-break">
            <div className="flex items-baseline gap-2">
              <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-500 shrink-0">Tema / Unidad:</span>
              <span className="text-xs print:text-[10.5px] font-bold text-slate-900 leading-snug">
                {plan.topic || 'Sin tema especificado'}
              </span>
            </div>
          </div>

          {/* Competencies */}
          <div className="print-avoid-break">
            <div className="flex items-center space-x-1.5 mb-1.5 print:mb-1">
              <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <h4 className="text-[9.5px] print:text-[8.5px] font-black uppercase tracking-wider text-slate-700">
                Competencias & Indicadores Curriculares
              </h4>
            </div>
            {selectedComps.length > 0 ? (
              <div className="space-y-2 print:space-y-1">
                {selectedComps.map((comp) => {
                  const indicatorsToShow = plan.selectedIndicators?.[comp.id] !== undefined
                    ? plan.selectedIndicators[comp.id]
                    : (comp.indicators || []);

                  return (
                    <div 
                      key={comp.id} 
                      className="p-2.5 print:p-1.5 bg-white rounded-lg border border-slate-200 text-xs print:text-[9px] space-y-1 shadow-2xs print:shadow-none"
                      style={getGradeLeftAccentStyle(comp.grade || plan.grade, 3)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span 
                            className="font-mono font-bold px-1.5 py-0.5 rounded border text-[9px] print:text-[8px] shrink-0 shadow-2xs print:shadow-none"
                            style={getGradeBadgeStyle(comp.grade || plan.grade)}
                          >
                            {comp.code}
                          </span>
                          <span className="font-bold text-slate-900 truncate">{comp.title}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#285A14] font-bold text-[9px] print:text-[8px] shrink-0 border border-emerald-200">
                          Eje: {comp.category}
                        </span>
                      </div>

                      {/* Selected Indicators */}
                      {indicatorsToShow.length > 0 ? (
                        <div className="bg-slate-50/70 print:bg-transparent rounded p-1.5 print:p-0 border border-slate-100 print:border-none">
                          <span className="text-[8.5px] print:text-[7.5px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
                            Indicadores de logro seleccionados ({indicatorsToShow.length}):
                          </span>
                          <ul className="space-y-0.5 print:space-y-0">
                            {indicatorsToShow.map((ind, i) => (
                              <li key={i} className="text-[10px] print:text-[8.5px] text-slate-700 flex items-start space-x-1.5 leading-snug">
                                <CheckCircle2 className="w-3 h-3 print:w-2.5 print:h-2.5 text-[#5EA832] shrink-0 mt-0.5" />
                                <span>{ind}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic text-[9px]">No se seleccionaron indicadores específicos.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs print:text-[9.5px] text-slate-400 italic p-2 bg-slate-50 rounded border border-slate-200">
                No se han asociado competencias específicas a esta semana.
              </p>
            )}
          </div>

          {/* Pedagogical Sequence Sections */}
          <div className="space-y-2.5 print:space-y-1.5">
            {/* Inicio */}
            <div className="border border-slate-200 rounded-lg p-2.5 print:p-1.5 bg-white print-avoid-break">
              <div className="flex items-center space-x-1.5 text-indigo-700 font-bold text-xs print:text-[9.5px] mb-1">
                <span className="w-4 h-4 print:w-3.5 print:h-3.5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-black shrink-0">1</span>
                <span>Inicio (Motivación y saberes previos)</span>
              </div>
              <p className="text-xs print:text-[9.5px] text-slate-800 whitespace-pre-line leading-relaxed print:leading-snug break-words">
                {plan.startActivity || <span className="italic text-slate-400">Sin descripción de inicio</span>}
              </p>
            </div>

            {/* Desarrollo */}
            <div className="border border-slate-200 rounded-lg p-2.5 print:p-1.5 bg-white print-avoid-break">
              <div className="flex items-center space-x-1.5 text-indigo-700 font-bold text-xs print:text-[9.5px] mb-1">
                <span className="w-4 h-4 print:w-3.5 print:h-3.5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-black shrink-0">2</span>
                <span>Desarrollo (Actividades centrales y práctica guiada)</span>
              </div>
              <p className="text-xs print:text-[9.5px] text-slate-800 whitespace-pre-line leading-relaxed print:leading-snug break-words">
                {plan.developmentActivity || <span className="italic text-slate-400">Sin descripción de desarrollo</span>}
              </p>
            </div>

            {/* Cierre */}
            <div className="border border-slate-200 rounded-lg p-2.5 print:p-1.5 bg-white print-avoid-break">
              <div className="flex items-center space-x-1.5 text-indigo-700 font-bold text-xs print:text-[9.5px] mb-1">
                <span className="w-4 h-4 print:w-3.5 print:h-3.5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-black shrink-0">3</span>
                <span>Cierre (Evaluación formativa y metacognición)</span>
              </div>
              <p className="text-xs print:text-[9.5px] text-slate-800 whitespace-pre-line leading-relaxed print:leading-snug break-words">
                {plan.closingActivity || <span className="italic text-slate-400">Sin descripción de cierre</span>}
              </p>
            </div>
          </div>

          {/* Recursos & Observaciones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:gap-1.5 print-avoid-break">
            <div className="border border-slate-200 rounded-lg p-2.5 print:p-1.5 bg-slate-50/50 print:bg-white">
              <span className="text-[9px] print:text-[8px] font-bold text-slate-600 uppercase tracking-wide block mb-0.5">
                Recursos Didácticos & Materiales
              </span>
              <p className="text-xs print:text-[9px] text-slate-700 leading-snug whitespace-pre-line break-words">
                {plan.resources || 'No especificados'}
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-2.5 print:p-1.5 bg-slate-50/50 print:bg-white">
              <span className="text-[9px] print:text-[8px] font-bold text-slate-600 uppercase tracking-wide block mb-0.5">
                Observaciones y Adaptaciones
              </span>
              <p className="text-xs print:text-[9px] text-slate-700 leading-snug whitespace-pre-line break-words">
                {plan.observations || 'Sin observaciones adicionales'}
              </p>
            </div>
          </div>

          {/* Feedback from Coordinator if present */}
          {plan.coordinatorFeedback && (
            <div className="p-2.5 print:p-1.5 rounded-lg border border-amber-300 bg-amber-50 print-avoid-break">
              <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-[9px] uppercase mb-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Observaciones de Coordinación Pedagógica</span>
              </div>
              <p className="text-xs print:text-[9px] text-amber-950 leading-snug break-words">
                {plan.coordinatorFeedback}
              </p>
            </div>
          )}

          {/* Institutional Signatures (Print only) */}
          <div className="pt-3 print:pt-2 mt-2 print:mt-1 border-t border-slate-200 print-avoid-break">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="border-b border-slate-400 w-44 mx-auto mb-1"></div>
                <p className="font-bold text-slate-900 text-xs print:text-[9.5px] leading-tight">
                  {plan.teacherName}
                </p>
                <p className="text-[9px] print:text-[8px] text-slate-500 font-medium">
                  Docente Responsable
                </p>
              </div>
              <div>
                <div className="border-b border-slate-400 w-44 mx-auto mb-1"></div>
                <p className="font-bold text-slate-900 text-xs print:text-[9.5px] leading-tight">
                  Coordinación Pedagógica
                </p>
                <p className="text-[9px] print:text-[8px] text-slate-500 font-medium">
                  Sello y Firma de Validación
                </p>
              </div>
            </div>

            <div className="mt-2 text-center text-[8px] text-slate-400">
              Portal Manglar · Colegio Integral El Manglar · Documento emitido automáticamente para registro docente institucional
            </div>
          </div>

        </div>

        {/* Footer (Hidden on print) */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end no-print shrink-0">
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
