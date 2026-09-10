import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle2, RotateCcw, Award, FileText } from 'lucide-react';
import { EvaluationRecord, GradeScale } from '../types';
import { useEduPlan } from '../context/EduPlanContext';

interface EvaluationAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluationRecord | null;
}

export const EvaluationAuditModal: React.FC<EvaluationAuditModalProps> = ({
  isOpen,
  onClose,
  evaluation,
}) => {
  const { currentUser, setEvaluationStatus, addToast } = useEduPlan();
  const [auditNotes, setAuditNotes] = useState(evaluation?.auditNotes || '');

  if (!isOpen || !evaluation) return null;

  const totalStudents = evaluation.grades.length;
  const gradedStudents = evaluation.grades.filter((g) => g.gradeValue).length;
  const pendingStudents = totalStudents - gradedStudents;
  const seCount = evaluation.grades.filter((g) => g.gradeValue === 'SE').length;
  const acCount = evaluation.grades.filter((g) => g.adaptation === 'AC+' || g.adaptation === 'AC-').length;
  const acWithoutNotes = evaluation.grades.filter(
    (g) => (g.adaptation === 'AC+' || g.adaptation === 'AC-') && !g.observations?.trim()
  ).length;

  const isComplete = pendingStudents === 0;

  const handleApproveAudit = () => {
    setEvaluationStatus(
      evaluation.id,
      'audited',
      auditNotes.trim() ||
        `Certificado y auditado satisfactoriamente por Coordinación Pedagógica (${currentUser.fullName}). Calificaciones autorizadas para el boletín escolar.`
    );
    onClose();
  };

  const handleRequestCorrections = () => {
    if (!auditNotes.trim()) {
      addToast('Por favor escribe las observaciones o motivos para regresar a borrador', 'warning');
      return;
    }
    setEvaluationStatus(evaluation.id, 'draft', auditNotes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Auditoría Pedagógica y Visto Bueno
              </h3>
              <p className="text-xs text-slate-300">
                {evaluation.grade} · {evaluation.subject} · {evaluation.lapso}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Estado Actual
              </span>
              <span className="font-bold text-sm text-slate-900">
                {evaluation.status === 'audited'
                  ? 'Auditada y Certificada'
                  : evaluation.status === 'submitted'
                  ? 'Consolidada (Esperando Visto Bueno)'
                  : 'Borrador en Carga'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Docente
              </span>
              <span className="font-medium text-slate-800">{evaluation.teacherName}</span>
            </div>
          </div>

          {/* Audit Verification Checklist */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#285A14]" />
              <span>Verificaciones de Control y Calidad</span>
            </h4>

            {/* Check 1: Graded completeness */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                isComplete
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="font-medium">
                  {isComplete
                    ? `Todos los estudiantes (${totalStudents}/${totalStudents}) han sido calificados.`
                    : `Faltan ${pendingStudents} estudiantes por calificar (${gradedStudents}/${totalStudents}).`}
                </span>
              </div>
              <span className="font-bold text-xs font-mono">
                {Math.round((gradedStudents / (totalStudents || 1)) * 100)}%
              </span>
            </div>

            {/* Check 2: Adaptations AC+/AC- check */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  Estudiantes con Adaptación Curricular: <strong>{acCount}</strong> alumnos (AC+ / AC-)
                </span>
              </div>
              {acWithoutNotes > 0 ? (
                <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">
                  {acWithoutNotes} sin observación
                </span>
              ) : (
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                  Justificados
                </span>
              )}
            </div>

            {/* Check 3: Sin Evaluación (SE) check */}
            {seCount > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Estudiantes marcados <strong>SE (Sin Evaluación)</strong>: {seCount} alumnos.
                  </span>
                </div>
                <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded font-bold">
                  Requiere justificación
                </span>
              </div>
            )}
          </div>

          {/* Audit Notes Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Dictamen y Observaciones de Coordinación Pedagógica
            </label>
            <textarea
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="Escribe comentarios pedagógicos, validación de adaptaciones curriculares, acuerdos de repetición de pruebas pendientes o felicitaciones docentes..."
              rows={3}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:border-transparent transition-all"
            />
          </div>

          {/* Last audit metadata if already audited */}
          {evaluation.auditedAt && (
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              Certificado previamente por: <strong>{evaluation.auditedBy}</strong> el {evaluation.auditedAt}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRequestCorrections}
            className="flex items-center gap-1.5 px-3 py-2 text-amber-800 bg-amber-100 hover:bg-amber-200 font-medium text-xs rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Devolver a Borrador</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-medium text-xs rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApproveAudit}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#285A14] hover:bg-[#1f4610] text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Certificar y Dar Visto Bueno</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
