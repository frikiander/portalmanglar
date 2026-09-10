import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { EvaluationRecord, GradeScale } from '../types';
import { GRADE_SCALE_CONFIG, ADAPTATION_CONFIG } from '../data/mockEvaluations';
import { ManglarEmblem } from './ManglarLogo';

interface EvaluationPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluationRecord | null;
}

export const EvaluationPrintModal: React.FC<EvaluationPrintModalProps> = ({
  isOpen,
  onClose,
  evaluation,
}) => {
  if (!isOpen || !evaluation) return null;

  const momentLabels: Record<string, string> = {
    mensual_1: 'Mensual I',
    mensual_2: 'Mensual II',
    mensual_3: 'Mensual III',
    examen_lapso: 'Examen de Lapso',
  };

  const momentLabel = momentLabels[evaluation.moment] || evaluation.moment;

  // Compute distribution stats
  const totalStudents = evaluation.grades.length;
  const gradeCounts: Record<GradeScale, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    SE: 0,
  };

  let regularCount = 0;
  let acPlusCount = 0;
  let acMinusCount = 0;
  let evaluatedCount = 0;

  evaluation.grades.forEach((g) => {
    if (g.gradeValue) {
      gradeCounts[g.gradeValue] = (gradeCounts[g.gradeValue] || 0) + 1;
      if (g.gradeValue !== 'SE') {
        evaluatedCount++;
      }
    }
    if (g.adaptation === 'AC+') acPlusCount++;
    else if (g.adaptation === 'AC-') acMinusCount++;
    else regularCount++;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-evaluation-sheet, #printable-evaluation-sheet * {
            visibility: visible;
          }
          #printable-evaluation-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15mm;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top bar (hidden in print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#285A14] rounded-lg">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Vista de Impresión Oficial: Acta de Calificaciones
              </h3>
              <p className="text-xs text-slate-300">
                Colegio Integral El Manglar · Registro Académico Institucional
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#5EA832] hover:bg-[#4d8b28] text-white font-medium text-xs rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Documento</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 text-slate-900" id="printable-evaluation-sheet">
          {/* Header Institucional */}
          <div className="border-b-2 border-[#285A14] pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ManglarEmblem size={56} />
                <div>
                  <h1 className="text-lg font-black text-[#285A14] tracking-tight uppercase">
                    Colegio Integral El Manglar
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    Inscrito en el M.P.P.E. · RIF J-30489123-4 · Lechería, Estado Anzoátegui
                  </p>
                  <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                    Coordinación Académica y Registro y Control de Estudios
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-[#285A14] text-xs font-bold rounded-lg border border-emerald-300 uppercase tracking-wider">
                  Acta Oficial de Calificaciones
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Folio: {evaluation.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Año Escolar
              </span>
              <span className="font-bold text-slate-900">{evaluation.schoolYear}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Grado / Sección
              </span>
              <span className="font-bold text-slate-900">{evaluation.grade}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Asignatura
              </span>
              <span className="font-bold text-[#285A14]">{evaluation.subject}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Lapso / Momento
              </span>
              <span className="font-bold text-slate-900">
                {evaluation.lapso} · {momentLabel}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Docente Titular
              </span>
              <span className="font-medium text-slate-800">{evaluation.teacherName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Estado del Acta
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                {evaluation.status === 'audited' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Auditada y Certificada</span>
                  </>
                ) : evaluation.status === 'submitted' ? (
                  <span className="text-amber-700">Consolidada (En Revisión)</span>
                ) : (
                  <span className="text-slate-600">Borrador Docente</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fecha de Emisión
              </span>
              <span className="font-medium text-slate-700 font-mono">
                {evaluation.updatedAt || new Date().toISOString().split('T')[0]}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Auditoría Coordinación
              </span>
              <span className="font-medium text-slate-700 truncate block">
                {evaluation.auditedBy || 'Pendiente de firma'}
              </span>
            </div>
          </div>

          {/* Título específico de la evaluación si existe */}
          {evaluation.title && (
            <div className="mb-4 text-xs font-semibold text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200/60">
              <span className="text-[#285A14] font-bold mr-1">Objetivo / Contenido Evaluado:</span>
              {evaluation.title}
            </div>
          )}

          {/* Tabla de Estudiantes */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#285A14] text-white uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center font-bold">N°</th>
                  <th className="py-2.5 px-3 w-28 font-semibold">Cédula Escolar</th>
                  <th className="py-2.5 px-3 font-semibold">Apellidos y Nombres</th>
                  <th className="py-2.5 px-3 w-20 text-center font-bold">Nota</th>
                  <th className="py-2.5 px-3 w-28 text-center font-semibold">Adaptación</th>
                  <th className="py-2.5 px-3 font-semibold">Observaciones Pedagógicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {evaluation.grades.map((item, idx) => {
                  const gradeCfg = item.gradeValue ? GRADE_SCALE_CONFIG[item.gradeValue] : null;
                  const adaptCfg = ADAPTATION_CONFIG[item.adaptation];

                  return (
                    <tr
                      key={item.studentId || idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    >
                      <td className="py-2 px-3 text-center font-bold text-slate-500 text-[11px]">
                        {item.orderNumber || idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                        {item.schoolId || '-'}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 text-[11px]">
                        {item.studentName}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {item.gradeValue ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md font-black text-xs border ${
                              gradeCfg ? gradeCfg.bgBadge : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.gradeValue}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">S/C</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] border ${
                            adaptCfg ? adaptCfg.badgeStyle : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {adaptCfg?.shortLabel || item.adaptation}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-700 text-[11px]">
                        {item.observations ? (
                          <span>{item.observations}</span>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Sin novedad</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Estadísticas y Consolidación de Resultados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Distribución por escala */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Distribución Cuantitativa y Cualitativa
              </h4>
              <div className="grid grid-cols-6 gap-2 text-center text-xs">
                {(['A', 'B', 'C', 'D', 'E', 'SE'] as GradeScale[]).map((scale) => {
                  const count = gradeCounts[scale] || 0;
                  const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                  const cfg = GRADE_SCALE_CONFIG[scale];

                  return (
                    <div key={scale} className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className={`block font-black text-sm ${cfg.textBadge}`}>{scale}</span>
                      <span className="font-bold text-slate-900 block text-xs">{count}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumen de Adecuaciones Curriculares */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Resumen de Población y Adecuaciones
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between border-b border-slate-200/80 pb-1">
                  <span className="text-slate-600">Total Matrícula Evaluada:</span>
                  <span className="font-bold text-slate-900">{totalStudents} alumnos</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-1">
                  <span className="text-slate-600">Pruebas Regulares (Estándar):</span>
                  <span className="font-bold text-slate-800">{regularCount} alumnos</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-1">
                  <span className="text-teal-700 font-semibold">AC+ (Altas Capacidades):</span>
                  <span className="font-bold text-teal-800">{acPlusCount} alumnos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-800 font-semibold">
                    AC- (Apoyo Psicopedagógico):
                  </span>
                  <span className="font-bold text-amber-900">{acMinusCount} alumnos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notas de Auditoría de Coordinación si existen */}
          {evaluation.auditNotes && (
            <div className="mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-[#285A14] block mb-1">
                Dictamen y Observaciones de Coordinación:
              </span>
              <p className="text-slate-700 italic">{evaluation.auditNotes}</p>
            </div>
          )}

          {/* Bloque de Firmas Institucionales */}
          <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-900">{evaluation.teacherName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Docente de la Asignatura
              </p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-900">
                {evaluation.auditedBy || 'Dra. María Eugenia Torres'}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Coordinación Académica
              </p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-900">Control de Estudios</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Sello Oficial Institucional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
