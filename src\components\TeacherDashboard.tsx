import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Plus, 
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  FileEdit,
  ArrowRight,
  Tag,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { LessonPlanWizard } from './LessonPlanWizard';
import { LessonPlanPreviewModal } from './LessonPlanPreviewModal';
import { LessonPlan } from '../types';
import { getGradeLeftAccentStyle, GradeBadge } from '../utils/gradeColors';

export const TeacherDashboard: React.FC = () => {
  const { currentUser, plans, competencies, selectedWeek, setSelectedWeek, activeModule, setActiveModule } = useEduPlan();

  // Wizard active state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardTargetWeek, setWizardTargetWeek] = useState(1);
  const [previewPlan, setPreviewPlan] = useState<LessonPlan | null>(null);

  // Filter plans for this teacher
  const teacherPlans = plans.filter((p) => p.teacherId === currentUser.id);
  const approvedCount = teacherPlans.filter((p) => p.status === 'approved').length;
  const submittedCount = teacherPlans.filter((p) => p.status === 'submitted').length;
  const revisionCount = teacherPlans.filter((p) => p.status === 'rejected').length;
  const draftCount = teacherPlans.filter((p) => p.status === 'draft').length;

  const startPlanning = (weekNum: number = selectedWeek || 1) => {
    setSelectedWeek(weekNum);
    setWizardTargetWeek(weekNum);
    setIsWizardOpen(true);
  };

  // If wizard is active, display the 4-step wizard
  if (isWizardOpen) {
    return (
      <LessonPlanWizard
        initialWeek={wizardTargetWeek}
        onExit={() => setIsWizardOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Mis Planificaciones Didácticas
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-xs text-slate-500">
              Docente: <strong className="text-slate-700">{currentUser.fullName}</strong>
            </p>
            <GradeBadge grade={currentUser.schoolGrade || '4to Grado'} size="xs" showDot />
          </div>
        </div>

        <button
          id="btn-planificar-clase"
          onClick={() => startPlanning(1)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#285A14] hover:bg-[#1f4710] active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Planificar clase</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      {/* 4 Clean Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pendientes por revisión */}
        <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pendientes por revisión</span>
            </span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {submittedCount}
          </span>
        </div>

        {/* Con observaciones */}
        <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Con observaciones</span>
            </span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {revisionCount}
          </span>
        </div>

        {/* Aprobadas */}
        <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Aprobadas</span>
            </span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {approvedCount}
          </span>
        </div>

        {/* Borradores */}
        <div className="p-4 rounded-2xl border bg-white border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Borradores</span>
            </span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {draftCount}
          </span>
        </div>
      </div>

      {/* Mis Planificaciones Activas */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Mis Planificaciones Activas ({teacherPlans.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Gestiona tus borradores y entregas
          </span>
        </div>

        {teacherPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherPlans.map((plan) => (
              <div
                key={plan.id}
                style={getGradeLeftAccentStyle(plan.grade, 4)}
                className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <GradeBadge grade={plan.grade} size="xs" />
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                        Semana {plan.weekNumber} · {plan.subject}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                      plan.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : plan.status === 'submitted'
                        ? 'bg-indigo-100 text-indigo-800'
                        : plan.status === 'rejected'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {plan.status === 'approved' ? 'Aprobada' : plan.status === 'submitted' ? 'Enviada' : plan.status === 'rejected' ? 'Con Observaciones' : 'Borrador'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-1">
                    {plan.topic || `Planificación Semana ${plan.weekNumber}`}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {plan.startActivity || plan.developmentActivity || 'Sin contenido didáctico aún...'}
                  </p>

                  {/* Feedback preview if present */}
                  {plan.coordinatorFeedback && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 mb-3">
                      <strong>Observación Coordinación:</strong> {plan.coordinatorFeedback}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {plan.competencyIds.length} competencias vinculadas
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewPlan(plan)}
                      className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-200/60"
                      title="Ver Ficha Imprimible"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startPlanning(plan.weekNumber)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>{plan.status === 'rejected' ? 'Ajustar Plan' : 'Editar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">Aún no tienes planificaciones creadas.</p>
            <button
              onClick={() => startPlanning(1)}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              Comenzar con el Paso 1
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewPlan && (
        <LessonPlanPreviewModal
          plan={previewPlan}
          competencies={competencies}
          onClose={() => setPreviewPlan(null)}
        />
      )}

    </div>
  );
};
