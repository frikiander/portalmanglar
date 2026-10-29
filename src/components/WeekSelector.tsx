import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Plus,
  CalendarDays
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { LessonPlan } from '../types';

export const WeekSelector: React.FC = () => {
  const { 
    selectedWeek, 
    setSelectedWeek, 
    plans, 
    currentUser,
    getLapsoWeeks,
  } = useEduPlan();

  // Filter plans for the current teacher
  const teacherPlans = plans.filter((p) => p.teacherId === currentUser.id);

  // Weeks of the current lapso
  const lapsoWeeks = getLapsoWeeks();
  const weeks = Array.from({ length: lapsoWeeks }, (_, i) => i + 1);

  const getWeekPlan = (weekNum: number): LessonPlan | undefined => {
    return teacherPlans.find((p) => p.weekNumber === weekNum);
  };

  const getStatusBadge = (plan?: LessonPlan) => {
    if (!plan) {
      return {
        label: 'Sin planificar',
        color: 'text-slate-500 bg-slate-50 border-slate-200',
        icon: <Plus className="w-3.5 h-3.5 text-slate-500" />,
      };
    }
    switch (plan.status) {
      case 'approved':
        return {
          label: 'Aprobada',
          color: 'text-success-700 bg-success-50 border-success-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />,
        };
      case 'submitted':
        return {
          label: 'Enviada',
          color: 'text-primary-700 bg-primary-50 border-primary-200',
          icon: <Clock className="w-3.5 h-3.5 text-primary-600" />,
        };
      case 'rejected':
        return {
          label: 'Observaciones',
          color: 'text-warning-800 bg-warning-50 border-warning-300',
          icon: <AlertCircle className="w-3.5 h-3.5 text-warning-600" />,
        };
      case 'draft':
      default:
        return {
          label: 'Borrador',
          color: 'text-slate-600 bg-slate-100 border-slate-200',
          icon: <FileText className="w-3.5 h-3.5 text-slate-500" />,
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-primary-600" />
          <h2 className="text-base font-semibold text-slate-800">
            Cronograma del Período Académico (semanas 1 a {lapsoWeeks})
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Haz clic en cualquier semana para editar o consultar su estado
        </p>
      </div>

      {/* Horizontal responsive carousel / grid */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        {weeks.map((weekNum) => {
          const plan = getWeekPlan(weekNum);
          const status = getStatusBadge(plan);
          const isSelected = selectedWeek === weekNum;

          return (
            <button
              key={weekNum}
              id={`select-week-${weekNum}-btn`}
              onClick={() => setSelectedWeek(weekNum)}
              className={`flex-shrink-0 w-28 text-left p-3 rounded-xl border transition-all duration-150 relative ${
                isSelected
                  ? 'bg-primary-50/80 border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold ${isSelected ? 'text-primary-900' : 'text-slate-800'}`}>
                  Semana {weekNum}
                </span>
                {status.icon}
              </div>

              <div className="truncate text-xs text-slate-500 mb-2 font-medium">
                {plan?.topic ? plan.topic : 'Planificación'}
              </div>

              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-semibold border ${status.color}`}
              >
                {status.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
