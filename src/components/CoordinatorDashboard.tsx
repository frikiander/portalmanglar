import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Filter, 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  User, 
  Award,
  Calendar,
  ChevronRight,
  Sparkles,
  Layers,
  Compass,
  ShieldAlert
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { AVAILABLE_GRADES, AVAILABLE_SUBJECTS, MOCK_USERS } from '../data/mockData';
import { LessonPlan } from '../types';
import { getGradeLeftAccentStyle, GradeBadge } from '../utils/gradeColors';
import { PlanReviewModal } from './PlanReviewModal';
import { CompetencyManagerModal } from './CompetencyManagerModal';

export const CoordinatorDashboard: React.FC = () => {
  const { plans, competencies, activeModule, setActiveModule, users, availableSubjectNames, availableGradeNames, currentUser, getTeachersForCoordinator } = useEduPlan();

  const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : AVAILABLE_GRADES;

  const [selectedPlanForReview, setSelectedPlanForReview] = useState<LessonPlan | null>(null);
  const [isCompetencyModalOpen, setIsCompetencyModalOpen] = useState(false);
  const [viewStyle, setViewStyle] = useState<'kanban' | 'list'>('kanban');

  // Filters
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterTeacher, setFilterTeacher] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate high-level stats
  const totalSubmitted = plans.filter((p) => p.status === 'submitted').length;
  const totalApproved = plans.filter((p) => p.status === 'approved').length;
  const totalRejected = plans.filter((p) => p.status === 'rejected').length;
  const totalDrafts = plans.filter((p) => p.status === 'draft').length;

  // Teachers list (only teachers assigned to this coordinator, or all if none assigned)
  const assignedTeachers = getTeachersForCoordinator(currentUser.id);
  const hasAssignedTeachers = assignedTeachers.length > 0;
  const teachers = hasAssignedTeachers ? assignedTeachers : (users?.length > 0 ? users : MOCK_USERS).filter((u) => u.role === 'teacher');
  const assignedTeacherIds = new Set(teachers.map((t) => t.id));

  // Filter plans — restrict to assigned teachers if any are configured
  const filteredPlans = plans.filter((plan) => {
    // Scope to assigned teachers (if any are configured for this coordinator)
    if (hasAssignedTeachers && !assignedTeacherIds.has(plan.teacherId)) return false;
    const matchesGrade = filterGrade === 'all' || plan.grade === filterGrade;
    const matchesTeacher = filterTeacher === 'all' || plan.teacherId === filterTeacher;
    const matchesSubject = filterSubject === 'all' || plan.subject === filterSubject;
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    const matchesSearch =
      plan.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesTeacher && matchesSubject && matchesStatus && matchesSearch;
  });

  // Kanban columns data
  const submittedPlans = filteredPlans.filter((p) => p.status === 'submitted');
  const rejectedPlans = filteredPlans.filter((p) => p.status === 'rejected');
  const approvedPlans = filteredPlans.filter((p) => p.status === 'approved');
  const draftPlans = filteredPlans.filter((p) => p.status === 'draft');

  return (
    <div className="space-y-6">
      
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Validación de Planificaciones
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Colegio Integral El Manglar · Revisión y aprobación curricular
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="open-competencies-manager-btn"
            onClick={() => setIsCompetencyModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Award className="w-4 h-4 text-[#285A14]" />
            <span>Banco de Competencias ({competencies.length})</span>
          </button>
        </div>
      </div>

      {/* Assigned Teachers Notice */}
      {hasAssignedTeachers && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-xs text-purple-800">
            <span className="font-bold">Vista filtrada: </span>
            Estás supervisando a{' '}
            <span className="font-bold">{assignedTeachers.length} docente{assignedTeachers.length !== 1 ? 's' : ''}</span>:{' '}
            {assignedTeachers.map((t) => t.fullName.split(' ')[0]).join(', ')}.{' '}
            Solo verás sus planificaciones en este panel.
          </div>
        </div>
      )}

      {/* 4 Clean Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pendientes por revisión */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'submitted' ? 'all' : 'submitted')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterStatus === 'submitted'
              ? 'bg-amber-50 border-amber-400 shadow-xs ring-2 ring-amber-400/20'
              : 'bg-white hover:bg-amber-50/40 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pendientes por revisión</span>
            </span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalSubmitted}
          </span>
        </button>

        {/* Con observaciones */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'rejected' ? 'all' : 'rejected')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterStatus === 'rejected'
              ? 'bg-rose-50 border-rose-400 shadow-xs ring-2 ring-rose-400/20'
              : 'bg-white hover:bg-rose-50/40 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Con observaciones</span>
            </span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalRejected}
          </span>
        </button>

        {/* Aprobadas */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'approved' ? 'all' : 'approved')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterStatus === 'approved'
              ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-2 ring-emerald-400/20'
              : 'bg-white hover:bg-emerald-50/40 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Aprobadas</span>
            </span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalApproved}
          </span>
        </button>

        {/* Borradores */}
        <button
          type="button"
          onClick={() => setFilterStatus(filterStatus === 'draft' ? 'all' : 'draft')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterStatus === 'draft'
              ? 'bg-slate-100 border-slate-400 shadow-xs ring-2 ring-slate-400/20'
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Borradores</span>
            </span>
          </div>
          <span className="block text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totalDrafts}
          </span>
        </button>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar tema, docente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters (Docente, Grado, Asignatura) */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Filter by Teacher */}
            <select
              id="filter-teacher"
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">Todos los Docentes</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>

            {/* Filter by Grade */}
            <select
              id="filter-grade"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">Todos los Grados</option>
              {displayGrades.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Filter by Subject */}
            <select
              id="filter-subject"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">Todas las Asignaturas</option>
              {(availableSubjectNames?.length > 0 ? availableSubjectNames : AVAILABLE_SUBJECTS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Reset Filters button */}
            {(filterGrade !== 'all' || filterTeacher !== 'all' || filterSubject !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterGrade('all');
                  setFilterTeacher('all');
                  setFilterSubject('all');
                  setSearchQuery('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 font-medium underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* View Toggle (Kanban vs List) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-end lg:self-auto">
            <button
              onClick={() => setViewStyle('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewStyle === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tablero Kanban</span>
            </button>
            <button
              onClick={() => setViewStyle('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewStyle === 'list'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Detallada</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main View: Kanban or List */}
      {viewStyle === 'kanban' ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          
          {/* Column 1: Pendientes de Aprobación (Enviadas) */}
          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                  Pendientes ({submittedPlans.length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold bg-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded-full">
                Por revisar
              </span>
            </div>

            <div className="space-y-3">
              {submittedPlans.map((plan) => (
                <KanbanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={() => setSelectedPlanForReview(plan)}
                  highlight
                />
              ))}
              {submittedPlans.length === 0 && (
                <div className="p-6 text-center rounded-xl bg-white/60 border border-dashed border-indigo-200">
                  <p className="text-xs text-indigo-400">No hay planificaciones pendientes de revisión con los filtros actuales.</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Con Observaciones (Rechazadas) */}
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Con Observaciones ({rejectedPlans.length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full">
                Requiere ajuste
              </span>
            </div>

            <div className="space-y-3">
              {rejectedPlans.map((plan) => (
                <KanbanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={() => setSelectedPlanForReview(plan)}
                />
              ))}
              {rejectedPlans.length === 0 && (
                <div className="p-6 text-center rounded-xl bg-white/60 border border-dashed border-amber-200">
                  <p className="text-xs text-amber-400">Sin planificaciones con observaciones pendientes.</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Aprobadas */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                  Aprobadas ({approvedPlans.length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full">
                Listas para aula
              </span>
            </div>

            <div className="space-y-3">
              {approvedPlans.map((plan) => (
                <KanbanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={() => setSelectedPlanForReview(plan)}
                />
              ))}
              {approvedPlans.length === 0 && (
                <div className="p-6 text-center rounded-xl bg-white/60 border border-dashed border-emerald-200">
                  <p className="text-xs text-emerald-400">Aún no hay planificaciones aprobadas en este filtro.</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Borradores */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Borradores ({draftPlans.length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                En elaboración
              </span>
            </div>

            <div className="space-y-3">
              {draftPlans.map((plan) => (
                <KanbanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={() => setSelectedPlanForReview(plan)}
                />
              ))}
              {draftPlans.length === 0 && (
                <div className="p-6 text-center rounded-xl bg-white/60 border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400">Sin borradores activos.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Docente</th>
                  <th className="px-6 py-4">Semana & Tema</th>
                  <th className="px-6 py-4">Asignatura / Grado</th>
                  <th className="px-6 py-4">Competencias</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPlans.map((plan) => (
                  <tr 
                    key={plan.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedPlanForReview(plan)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={plan.teacherAvatar}
                          alt={plan.teacherName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{plan.teacherName}</div>
                          <div className="text-[11px] text-slate-400">Docente Titular</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-indigo-700">Semana {plan.weekNumber}</div>
                      <div className="text-slate-800 line-clamp-1">{plan.topic || 'Sin título'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-semibold">{plan.subject}</div>
                      <div className="mt-1">
                        <GradeBadge grade={plan.grade} size="xs" />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                        {plan.competencyIds.length} asociada{plan.competencyIds.length !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                        plan.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : plan.status === 'submitted'
                          ? 'bg-indigo-100 text-indigo-800'
                          : plan.status === 'rejected'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {plan.status === 'approved' ? 'Aprobada' : plan.status === 'submitted' ? 'Pendiente' : plan.status === 'rejected' ? 'Con Observaciones' : 'Borrador'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanForReview(plan);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors"
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedPlanForReview && (
        <PlanReviewModal
          plan={selectedPlanForReview}
          competencies={competencies}
          onClose={() => setSelectedPlanForReview(null)}
        />
      )}

      {/* Competency Manager Modal */}
      {isCompetencyModalOpen && (
        <CompetencyManagerModal
          onClose={() => setIsCompetencyModalOpen(false)}
        />
      )}

    </div>
  );
};

// Reusable Kanban Card Component
interface KanbanCardProps {
  plan: LessonPlan;
  onSelect: () => void;
  highlight?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ plan, onSelect, highlight }) => {
  return (
    <div
      onClick={onSelect}
      style={getGradeLeftAccentStyle(plan.grade, 4)}
      className={`bg-white rounded-2xl p-4 border transition-all duration-150 cursor-pointer hover:shadow-md select-none group ${
        highlight 
          ? 'border-indigo-300 ring-2 ring-indigo-500/10' 
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Top row: Subject & Week */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <GradeBadge grade={plan.grade} size="xs" />
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {plan.subject}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-700">
          Sem. {plan.weekNumber}
        </span>
      </div>

      {/* Topic Title */}
      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
        {plan.topic || `Planificación Semana ${plan.weekNumber}`}
      </h4>

      {/* Pedagogical summary snippet */}
      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
        {plan.startActivity || plan.developmentActivity || 'Sin contenido aún...'}
      </p>

      {/* Card Footer: Teacher and Action */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src={plan.teacherAvatar}
            alt={plan.teacherName}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
          />
          <span className="text-xs text-slate-700 font-medium truncate max-w-[110px]">
            {plan.teacherName}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center space-x-0.5"
        >
          <span>Revisar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
