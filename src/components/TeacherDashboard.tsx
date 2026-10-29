import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Plus, 
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  FileEdit,
  Tag,
  ShieldAlert,
  Compass
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { LessonPlanWizard } from './LessonPlanWizard';
import { SCHOOL_DAYS, planWhen } from '../utils/planDays';
import { LessonPlanPreviewModal } from './LessonPlanPreviewModal';
import { SubjectAvatar } from './SubjectAvatar';
import { LessonPlan } from '../types';
import { Button } from './ui';
import { LapsoTide } from './LapsoTide';
import { formatLongDate, joinCounts, nextPlanningDeadline, relativeDays } from '../utils/lapsoCalendar';
import { getGradeLeftAccentStyle, GradeBadge } from '../utils/gradeColors';

export const TeacherDashboard: React.FC = () => {
  const { currentUser, plans, competencies, selectedWeek, setSelectedWeek, activeModule, setActiveModule, events, lapsos } = useEduPlan();

  // Wizard active state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardTargetWeek, setWizardTargetWeek] = useState(1);
  const [wizardPlan, setWizardPlan] = useState<LessonPlan | undefined>(undefined);
  const [previewPlan, setPreviewPlan] = useState<LessonPlan | null>(null);

  // This teacher's plans, in calendar order (week, then weekday)
  const teacherPlans = plans
    .filter((p) => p.teacherId === currentUser.id)
    .sort((a, b) =>
      a.weekNumber - b.weekNumber ||
      SCHOOL_DAYS.indexOf(a.dayOfWeek ?? 'Lunes') - SCHOOL_DAYS.indexOf(b.dayOfWeek ?? 'Lunes'));
  const approvedCount = teacherPlans.filter((p) => p.status === 'approved').length;
  const submittedCount = teacherPlans.filter((p) => p.status === 'submitted').length;
  const revisionCount = teacherPlans.filter((p) => p.status === 'rejected').length;
  const draftCount = teacherPlans.filter((p) => p.status === 'draft').length;

  // ─── Lapso tide: one sentence about what needs doing now ───
  const nextDeadline = nextPlanningDeadline(events);
  const countsSentence = joinCounts([
    [submittedCount, 'en revisión', 'en revisión'],
    [revisionCount, 'con observaciones', 'con observaciones'],
    [approvedCount, 'aprobada', 'aprobadas'],
    [draftCount, 'borrador', 'borradores'],
  ]);
  const deadlineSentence = nextDeadline
    ? `Próxima entrega: ${formatLongDate(nextDeadline.date)} (${relativeDays(nextDeadline.days)}).`
    : 'No hay entregas de planificación registradas para lo que queda del lapso.';
  const tide = revisionCount > 0
    ? {
        headline: revisionCount === 1
          ? 'Tienes una planificación con observaciones por corregir.'
          : `Tienes ${revisionCount} planificaciones con observaciones por corregir.`,
        detail: deadlineSentence,
      }
    : nextDeadline
      ? {
          headline: `Tu próxima entrega es ${relativeDays(nextDeadline.days)}, el ${formatLongDate(nextDeadline.date)}.`,
          detail: countsSentence ? `Llevas ${countsSentence}.` : 'Aún no has creado planificaciones este año.',
        }
      : {
          headline: teacherPlans.length > 0 ? `Llevas ${countsSentence}.` : 'Empieza planificando tu primera clase.',
          detail: deadlineSentence,
        };

  const startPlanning = (weekNum: number = selectedWeek || 1, plan?: LessonPlan) => {
    setSelectedWeek(weekNum);
    setWizardTargetWeek(weekNum);
    setWizardPlan(plan);
    setIsWizardOpen(true);
  };

  // If wizard is active, display the step-by-step wizard
  if (isWizardOpen) {
    return (
      <LessonPlanWizard
        initialWeek={wizardTargetWeek}
        initialPlan={wizardPlan}
        onExit={() => setIsWizardOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-raiz">
            Mis planificaciones
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-xs text-slate-500">
              Docente: <strong className="text-slate-700">{currentUser.fullName}</strong>
            </p>
            <GradeBadge grade={currentUser.schoolGrade || '4to Grado'} size="xs" showDot />
          </div>
        </div>

        <Button id="btn-planificar-clase" icon={Plus} onClick={() => startPlanning(1)}>
          Planificar clase
        </Button>
      </div>

      <LapsoTide
        lapsos={lapsos}
        events={events}
        headline={tide.headline}
        detail={tide.detail}
        onOpenCalendar={() => setActiveModule('calendar')}
      />

      {/* Mis Planificaciones Activas */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-bold text-slate-900">
              Mis planificaciones ({teacherPlans.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold">
                        <SubjectAvatar subjectName={plan.subject} size="xs" />
                        <span>{planWhen(plan)}, {plan.subject}</span>
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      plan.status === 'approved'
                        ? 'bg-success-100 text-success-800'
                        : plan.status === 'submitted'
                        ? 'bg-primary-100 text-primary-800'
                        : plan.status === 'rejected'
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {plan.status === 'approved' ? 'Aprobada' : plan.status === 'submitted' ? 'Enviada' : plan.status === 'rejected' ? 'Con observaciones' : 'Borrador'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-1">
                    {plan.topic || planWhen(plan)}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {plan.startActivity || plan.developmentActivity || 'Sin contenido didáctico aún...'}
                  </p>

                  {/* Feedback preview if present */}
                  {plan.coordinatorFeedback && (
                    <div className="p-2.5 rounded-xl bg-warning-50 border border-warning-200 text-xs text-warning-900 mb-3">
                      <strong>Observación Coordinación:</strong> {plan.coordinatorFeedback}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {plan.competencyIds.length === 0
                      ? 'Sin competencias'
                      : `${plan.competencyIds.length} ${plan.competencyIds.length === 1 ? 'competencia vinculada' : 'competencias vinculadas'}`}
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
                      onClick={() => startPlanning(plan.weekNumber, plan)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>{plan.status === 'rejected' ? 'Corregir' : plan.status === 'approved' ? 'Ver' : 'Editar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">Aún no tienes planificaciones creadas.</p>
            <Button size="sm" icon={Plus} className="mt-3" onClick={() => startPlanning(1)}>
              Planificar clase
            </Button>
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
