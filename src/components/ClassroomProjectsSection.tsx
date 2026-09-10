import React, { useState } from 'react';
import { 
  Compass, 
  HeartHandshake, 
  Layers, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Plus, 
  Edit3, 
  Trash2,
  CheckCircle2, 
  GraduationCap, 
  Search, 
  Printer, 
  ChevronRight, 
  Info, 
  Youtube, 
  Link2,
  X,
  Save,
  Clock,
  Award,
  RotateCcw,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { ClassroomProject, ClassroomProjectType, ClassroomProjectWeek, ProjectResourceLink } from '../types';
import { AVAILABLE_GRADES } from '../data/mockData';
import { 
  GradeBadge, 
  GRADE_COLOR_MAP, 
  getGradeNumber, 
  getGradeColorConfig, 
  DIEV_COLOR, 
  DIEV_TEXT_COLOR, 
  getProjectTheme 
} from '../utils/gradeColors';

export const ClassroomProjectsSection: React.FC = () => {
  const { 
    classroomProjects, 
    currentUser, 
    updateClassroomProject, 
    updateClassroomProjectWeek, 
    addClassroomProject,
    deleteClassroomProject,
    resetClassroomProjects,
    clearAllClassroomProjects,
    availableGradeNames
  } = useEduPlan();

  const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : AVAILABLE_GRADES;

  // Filters: Grade and Lapso
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    // Default to teacher's grade or 1er Grado
    return currentUser.schoolGrade || '1er Grado';
  });
  const [selectedLapso, setSelectedLapso] = useState<string>('1er Lapso');
  const [activeProjectType, setActiveProjectType] = useState<ClassroomProjectType | 'BOTH'>('IPC');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Editing modals
  const [editingWeek, setEditingWeek] = useState<{ projectId: string; week: ClassroomProjectWeek } | null>(null);
  const [editingProjectInfo, setEditingProjectInfo] = useState<ClassroomProject | null>(null);
  
  // Creation modal
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [createInitialType, setCreateInitialType] = useState<ClassroomProjectType>('IPC');

  // Deletion / confirmation states
  const [projectToDelete, setProjectToDelete] = useState<ClassroomProject | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Available lapsos
  const lapsos = ['1er Lapso', '2do Lapso', '3er Lapso'];

  // Current grade number & config
  const selectedGradeNum = getGradeNumber(selectedGrade);
  const selectedGradeCfg = selectedGradeNum ? GRADE_COLOR_MAP[selectedGradeNum] : null;

  // Filter projects for current grade & lapso
  const gradeProjects = classroomProjects.filter((p) => {
    const pNum = getGradeNumber(p.grade);
    const matchesGrade = p.grade === selectedGrade || (selectedGradeNum !== null && pNum === selectedGradeNum);
    const matchesLapso = p.lapso === selectedLapso || !p.lapso;
    return matchesGrade && matchesLapso;
  });

  const ipcProject = gradeProjects.find((p) => p.type === 'IPC');
  const dievProject = gradeProjects.find((p) => p.type === 'DIEV');

  const currentProjectsToShow = activeProjectType === 'BOTH'
    ? gradeProjects
    : gradeProjects.filter((p) => p.type === activeProjectType);

  return (
    <section id="seccion-proyectos-aula" className="space-y-6 pt-6 border-t border-slate-200">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Proyectos de Aula
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {classroomProjects.length} {classroomProjects.length === 1 ? 'proyecto' : 'proyectos'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Ejes formativos institucionales: <strong className="text-slate-800">IPC</strong> (Interés por el Conocimiento) y <strong className="text-slate-800">DIEV</strong> (Desarrollo Integral, Ética y Valores)
          </p>
        </div>

        {/* Action buttons: Create Project (Coordinator & Teacher) + Data Options */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Add Project Button (Available for Coordinator AND Teacher) */}
          <button
            id="btn-agregar-proyecto-aula"
            onClick={() => {
              setCreateInitialType(activeProjectType === 'DIEV' ? 'DIEV' : 'IPC');
              setIsCreatingProject(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Agregar un nuevo proyecto de aula (IPC o DIEV)"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Proyecto de Aula</span>
          </button>

          {/* Reset / Clear Data Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-slate-700 hover:text-indigo-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Restablecer a los 12 proyectos base con colores oficiales"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Restablecer Base</span>
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Eliminar todos los proyectos para dejar la sección sin datos"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Vaciar Datos</span>
            </button>
          </div>

          {/* Print Sheet */}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Imprimir sábana de planificación del proyecto"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR: GRADE BUTTONS & LAPSO SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        
        {/* Quick Grade Buttons (Primaria 1° a 6°) with exact official colors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Grados:
          </span>
          {[
            { num: 1, gradeStr: '1er Grado' },
            { num: 2, gradeStr: '2do Grado' },
            { num: 3, gradeStr: '3ro Grado' },
            { num: 4, gradeStr: '4to Grado' },
            { num: 5, gradeStr: '5to Grado' },
            { num: 6, gradeStr: '6to Grado' },
          ].map(({ num, gradeStr }) => {
            const cfg = GRADE_COLOR_MAP[num as 1 | 2 | 3 | 4 | 5 | 6];
            const isSelected = selectedGrade === gradeStr || selectedGradeNum === num;
            return (
              <button
                key={gradeStr}
                type="button"
                onClick={() => setSelectedGrade(gradeStr)}
                style={
                  isSelected && cfg
                    ? {
                        backgroundColor: cfg.hex,
                        color: cfg.textColor,
                        borderColor: cfg.borderColor,
                      }
                    : undefined
                }
                className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                  !isSelected
                    ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    : 'shadow-xs scale-105'
                }`}
                title={`${gradeStr} (${cfg?.name} - ${cfg?.hex})`}
              >
                {num}° {cfg?.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Lapso Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-[11px] font-bold text-slate-500">Lapso:</span>
            <select
              id="select-proyecto-lapso"
              value={selectedLapso}
              onChange={(e) => setSelectedLapso(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-900 focus:outline-hidden cursor-pointer"
            >
              {lapsos.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* SUB-BAR: TOGGLE IPC / DIEV / AMBOS & SEARCH */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Project Type Segmented Tabs with accurate colors */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full sm:w-auto text-xs font-bold">
            
            {/* IPC TAB */}
            <button
              id="tab-proyecto-ipc"
              onClick={() => setActiveProjectType('IPC')}
              style={
                activeProjectType === 'IPC' && selectedGradeCfg
                  ? {
                      backgroundColor: selectedGradeCfg.hex,
                      color: selectedGradeCfg.textColor,
                    }
                  : undefined
              }
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeProjectType === 'IPC'
                  ? 'shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="IPC: Interés por el Conocimiento"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>IPC: Interés por el Conocimiento</span>
              {ipcProject && (
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
              )}
            </button>

            {/* DIEV TAB */}
            <button
              id="tab-proyecto-diev"
              onClick={() => setActiveProjectType('DIEV')}
              style={
                activeProjectType === 'DIEV'
                  ? {
                      backgroundColor: DIEV_COLOR,
                      color: DIEV_TEXT_COLOR,
                    }
                  : undefined
              }
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeProjectType === 'DIEV'
                  ? 'shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="DIEV: Desarrollo Integral, Ética y Valores"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>DIEV: Desarrollo Integral, Ética y Valores</span>
              {dievProject && (
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
              )}
            </button>

            {/* AMBOS TAB */}
            <button
              id="tab-proyecto-both"
              onClick={() => setActiveProjectType('BOTH')}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeProjectType === 'BOTH'
                  ? 'bg-slate-900 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ambos</span>
            </button>
          </div>

          {/* Search or keyword filter */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar actividad, hito, semana..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* RENDER PROJECTS */}
      <div className="space-y-8">
        {currentProjectsToShow.length > 0 ? (
          currentProjectsToShow.map((project) => (
            <ProjectSheetCard
              key={project.id}
              project={project}
              searchTerm={searchTerm}
              onEditProjectInfo={() => setEditingProjectInfo(project)}
              onEditWeek={(week) => setEditingWeek({ projectId: project.id, week })}
              onDeleteProject={() => setProjectToDelete(project)}
            />
          ))
        ) : (
          /* EMPTY STATE WITH QUICK ACTIONS FOR BOTH COORDINATOR & TEACHER */
          <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-slate-300 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
              <Compass className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-black text-slate-900">
                No hay proyecto registrado para {selectedGrade} ({selectedLapso})
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Esta sección está actualmente sin datos para la combinación seleccionada. Puedes crear un nuevo proyecto IPC o DIEV con un clic.
              </p>
            </div>

            {/* Quick Add Buttons for IPC and DIEV */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCreateInitialType('IPC');
                  setIsCreatingProject(true);
                }}
                style={
                  selectedGradeCfg
                    ? {
                        backgroundColor: selectedGradeCfg.hex,
                        color: selectedGradeCfg.textColor,
                      }
                    : undefined
                }
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition-transform hover:scale-105 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Proyecto IPC para {selectedGrade}</span>
              </button>

              <button
                onClick={() => {
                  setCreateInitialType('DIEV');
                  setIsCreatingProject(true);
                }}
                style={{
                  backgroundColor: DIEV_COLOR,
                  color: DIEV_TEXT_COLOR,
                }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition-transform hover:scale-105 cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Crear Proyecto DIEV</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      {isCreatingProject && (
        <CreateProjectModal
          initialGrade={selectedGrade}
          initialLapso={selectedLapso}
          initialType={createInitialType}
          onClose={() => setIsCreatingProject(false)}
          onSave={(newProjectData) => {
            const created = addClassroomProject(newProjectData);
            setSelectedGrade(created.grade);
            setSelectedLapso(created.lapso);
            setActiveProjectType(created.type);
            setIsCreatingProject(false);
          }}
        />
      )}

      {/* EDIT WEEK MODAL */}
      {editingWeek && (
        <EditWeekModal
          projectId={editingWeek.projectId}
          week={editingWeek.week}
          onClose={() => setEditingWeek(null)}
          onSave={(weekData) => {
            updateClassroomProjectWeek(editingWeek.projectId, weekData);
            setEditingWeek(null);
          }}
        />
      )}

      {/* EDIT PROJECT METADATA MODAL */}
      {editingProjectInfo && (
        <EditProjectInfoModal
          project={editingProjectInfo}
          onClose={() => setEditingProjectInfo(null)}
          onSave={(updated) => {
            updateClassroomProject(updated);
            setEditingProjectInfo(null);
          }}
        />
      )}

      {/* CONFIRM DELETE PROJECT MODAL */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">¿Eliminar Proyecto de Aula?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Se eliminará el proyecto <strong>"{projectToDelete.title}"</strong> ({projectToDelete.type} - {projectToDelete.grade}). Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteClassroomProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM CLEAR ALL PROJECTS MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Vaciar Todos los Proyectos</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                ¿Deseas eliminar todos los proyectos de aula actuales para dejar esta parte sin datos? Podrás volver a agregar proyectos manualmente o restablecer la base en cualquier momento.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  clearAllClassroomProjects();
                  setShowClearConfirm(false);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Sí, Vaciar Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET BASE PROJECTS MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Restablecer Proyectos Base</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Se cargarán los 12 proyectos institucionales oficiales (1 IPC y 1 DIEV para cada grado de 1° a 6°) correspondientes a los ejes formativos IPC (Interés por el Conocimiento) y DIEV (Desarrollo Integral, Ética y Valores).
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetClassroomProjects();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Restablecer Ahora
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

// =========================================================================================
// PROJECT SHEET CARD
// Applies EXACT color rules: DIEV (#FBDE18) vs IPC (Grade Official Color)
// =========================================================================================
interface ProjectSheetCardProps {
  project: ClassroomProject;
  searchTerm: string;
  onEditProjectInfo: () => void;
  onEditWeek: (week: ClassroomProjectWeek) => void;
  onDeleteProject: () => void;
}

const ProjectSheetCard: React.FC<ProjectSheetCardProps> = ({
  project,
  searchTerm,
  onEditProjectInfo,
  onEditWeek,
  onDeleteProject
}) => {
  const isDIEV = project.type === 'DIEV';
  const theme = getProjectTheme(project.type, project.grade);

  // Generate continuous single sequence from week 1 to 15 (or max week in project)
  const maxWeekInProject = project.weeks.reduce((max, w) => Math.max(max, w.weekNumber), 0);
  const totalWeeksCount = Math.max(15, maxWeekInProject);

  const allWeeks: ClassroomProjectWeek[] = Array.from({ length: totalWeeksCount }, (_, idx) => {
    const weekNum = idx + 1;
    const existing = project.weeks.find((w) => w.weekNumber === weekNum);
    return existing || {
      weekNumber: weekNum,
      title: '',
      content: '',
      englishContent: '',
      milestone: '',
      links: []
    };
  });

  const filteredWeeks = allWeeks.filter((w) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (w.title && w.title.toLowerCase().includes(term)) ||
      (w.content && w.content.toLowerCase().includes(term)) ||
      (w.milestone && w.milestone.toLowerCase().includes(term)) ||
      (w.englishContent && w.englishContent.toLowerCase().includes(term)) ||
      `semana ${w.weekNumber}`.includes(term)
    );
  });

  const loadedWeeksCount = allWeeks.filter((w) => Boolean(w.content?.trim() || w.title?.trim())).length;

  return (
    <div 
      style={{
        ...theme.leftAccentStyle,
        borderColor: isDIEV ? '#eab308' : theme.borderColor,
      }}
      className="bg-white rounded-3xl border-2 shadow-xs overflow-hidden transition-all"
    >
      
      {/* HEADER SECTION WITH EXACT COLOR LOGIC */}
      <div 
        style={theme.headerStyle}
        className="p-5 sm:p-6 border-b border-black/10 transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left badge box: Promo / Grade / IPC or DIEV */}
          <div className="flex items-center space-x-3.5">
            <div className="bg-white/95 backdrop-blur-xs rounded-2xl px-4 py-2.5 text-center shadow-xs border border-white/60">
              {project.promoCohort && (
                <span className="block text-[11px] font-black uppercase text-slate-600 tracking-wider">
                  {project.promoCohort}
                </span>
              )}
              <div className="my-1">
                <GradeBadge grade={project.grade} size="sm" showDot />
              </div>
              
              {/* Type Badge: Styled with high contrast */}
              {isDIEV ? (
                <span 
                  style={{ backgroundColor: '#0f172a', color: DIEV_COLOR }}
                  className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md text-xs font-black tracking-wider shadow-2xs"
                >
                  DIEV
                </span>
              ) : (
                <span 
                  style={{
                    backgroundColor: theme.textColor === '#ffffff' ? '#0f172a' : '#ffffff',
                    color: theme.textColor === '#ffffff' ? '#ffffff' : theme.textColor,
                  }}
                  className="inline-block mt-0.5 px-2.5 py-0.5 rounded-md text-xs font-black tracking-wider shadow-2xs border border-black/10"
                >
                  IPC
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span 
                  style={{ color: isDIEV ? '#0f172a' : theme.textColor }}
                  className="text-xs font-black uppercase tracking-wider opacity-90"
                >
                  {project.lapso} · {theme.fullName}
                </span>
              </div>
              <h3 
                style={{ color: isDIEV ? '#0f172a' : theme.textColor }}
                className="text-lg sm:text-2xl font-black tracking-tight mt-0.5 drop-shadow-2xs"
              >
                Título: "{project.title}"
              </h3>
            </div>
          </div>

          {/* Quick actions: edit project info & delete project */}
          <div className="flex items-center space-x-2 self-start md:self-center">
            <button
              onClick={onEditProjectInfo}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Editar título y propósito del proyecto"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-700" />
              <span>Editar Propósito</span>
            </button>
            <button
              onClick={onDeleteProject}
              className="p-1.5 rounded-xl bg-white/80 hover:bg-red-50 text-slate-600 hover:text-red-600 shadow-2xs transition-colors cursor-pointer"
              title="Eliminar este proyecto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PURPOSE BANNER */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xs border border-white/80 shadow-2xs text-slate-900">
          <p className="text-xs sm:text-sm leading-relaxed font-medium">
            <strong className="font-extrabold text-slate-950">Propósito: </strong>
            {project.purpose}
          </p>
        </div>
      </div>

      {/* WEEKS GRID CONTAINER: UNA SOLA ETAPA CONTINUA (SEMANAS 1 A 15) */}
      <div className="p-4 sm:p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pb-1">
          <div className="flex items-center space-x-2.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Cronograma del Proyecto: Semanas 1 a {totalWeeksCount}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {loadedWeeksCount} de {totalWeeksCount} semanas con contenido
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Haz clic en cualquier semana para cargarla o editarla individualmente
          </span>
        </div>

        {filteredWeeks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredWeeks.map((w) => (
              <WeekCardCell
                key={w.weekNumber}
                week={w}
                theme={theme}
                onEdit={() => onEditWeek(w)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            No se encontraron semanas que coincidan con la búsqueda "{searchTerm}".
          </div>
        )}

      </div>
    </div>
  );
};

// =========================================================================================
// WEEK CARD CELL
// =========================================================================================
interface WeekCardCellProps {
  week: ClassroomProjectWeek;
  theme: any;
  onEdit: () => void;
}

const WeekCardCell: React.FC<WeekCardCellProps> = ({ week, theme, onEdit }) => {
  const isFilled = Boolean(week.content?.trim() || week.title?.trim());

  // Si la semana no tiene contenido, se muestra una tarjeta vacía y disponible para carga individual
  if (!isFilled) {
    return (
      <div
        id={`proyecto-semana-${week.weekNumber}-vacia`}
        onClick={onEdit}
        style={{
          borderTopWidth: '4px',
          borderTopColor: theme.hex,
        }}
        className="bg-white hover:bg-slate-50 rounded-2xl p-4 border-2 border-dashed border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer min-h-[170px] group select-none"
        title={`Cargar contenido para la Semana ${week.weekNumber}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
          <span 
            style={theme.weekHeaderStyle}
            className="px-2.5 py-1 rounded-lg text-xs font-black shadow-2xs border tracking-wide"
          >
            Semana {week.weekNumber}
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            Vacía
          </span>
        </div>

        <div className="my-auto text-center py-4 space-y-1.5">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110 shadow-2xs border"
            style={{ 
              backgroundColor: theme.hex, 
              color: theme.textColor,
              borderColor: theme.borderColor 
            }}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <p className="text-xs font-black text-slate-700 group-hover:text-slate-900">
            + Cargar Semana {week.weekNumber}
          </p>
          <p className="text-[10.5px] text-slate-400">
            Clic para redactar actividades
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`proyecto-semana-${week.weekNumber}`}
      style={{
        borderTopWidth: '4px',
        borderTopColor: theme.hex,
      }}
      className="bg-white hover:bg-slate-50/60 rounded-2xl p-4 border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-150 flex flex-col justify-between group relative"
    >
      <div>
        {/* Header: Week Number + Milestone Tag */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/80">
          <span 
            style={theme.weekHeaderStyle}
            className="px-2.5 py-1 rounded-lg text-xs font-black shadow-2xs border tracking-wide"
          >
            Semana {week.weekNumber}
          </span>

          <button
            onClick={onEdit}
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            title="Editar semana"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Milestone Alert Badge (e.g. Evaluaciones Mensuales, Salida de campo, Cierre) */}
        {week.milestone && (
          <div className="mb-2.5 px-2.5 py-1 rounded-xl bg-amber-100/90 border border-amber-300/80 text-[11px] font-extrabold text-amber-900 flex items-center space-x-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="truncate">{week.milestone}</span>
          </div>
        )}

        {/* Week Title / Specific Question */}
        {week.title && (
          <h4 className="text-xs font-bold text-slate-900 mb-1.5 leading-snug line-clamp-2">
            {week.title}
          </h4>
        )}

        {/* Content / Activities */}
        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-5 whitespace-pre-line font-normal">
          {week.content}
        </p>

        {/* Bilingual / English Section if present */}
        {week.englishContent && (
          <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 text-[10px] text-indigo-950 bg-indigo-50/60 p-2 rounded-xl">
            <span className="font-bold text-indigo-700 block mb-0.5">🇬🇧 Enfoque en Inglés:</span>
            <p className="line-clamp-3 italic">{week.englishContent}</p>
          </div>
        )}
      </div>

      {/* Footer: Interactive Links and Resources */}
      {week.links && week.links.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Recursos y Enlaces:
          </span>
          <div className="flex flex-col gap-1">
            {week.links.map((link, idx) => {
              const isYoutube = link.url.includes('youtube') || link.url.includes('youtu.be');
              const isCanva = link.url.includes('canva');
              const isDrive = link.url.includes('drive.google');

              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-[10.5px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                  title={link.url}
                >
                  {isYoutube ? (
                    <Youtube className="w-3 h-3 text-red-500 shrink-0" />
                  ) : isDrive ? (
                    <FileText className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <Link2 className="w-3 h-3 text-indigo-500 shrink-0" />
                  )}
                  <span className="truncate">{link.label || 'Ver recurso didáctico'}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

// =========================================================================================
// MODAL: CREATE NEW CLASSROOM PROJECT (IPC OR DIEV FOR ANY GRADE)
// Accessible by both Coordinator and Teacher
// =========================================================================================
interface CreateProjectModalProps {
  initialGrade: string;
  initialLapso: string;
  initialType?: ClassroomProjectType;
  onClose: () => void;
  onSave: (projectData: Omit<ClassroomProject, 'id' | 'updatedAt'>) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  initialGrade,
  initialLapso,
  initialType = 'IPC',
  onClose,
  onSave
}) => {
  const { availableGradeNames } = useEduPlan();
  const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : AVAILABLE_GRADES;
  const [type, setType] = useState<ClassroomProjectType>(initialType);
  const [grade, setGrade] = useState<string>(initialGrade);
  const [lapso, setLapso] = useState<string>(initialLapso);
  const [promoCohort, setPromoCohort] = useState<string>('Promo 2026');
  const [title, setTitle] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');

  const gradeNum = getGradeNumber(grade);
  const gradeCfg = gradeNum ? GRADE_COLOR_MAP[gradeNum] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !purpose.trim()) return;

    // Pre-create 15 structured weeks with default milestone anchors
    const defaultWeeks: ClassroomProjectWeek[] = [
      { weekNumber: 1, title: 'Presentación del Proyecto y Preguntas Generadoras', content: 'Presentación motivacional del proyecto, indagación preliminar de saberes previos y acuerdos de bitácora.', links: [] },
      { weekNumber: 2, title: 'Contextualización y Exploración Conceptual', content: 'Definición de conceptos clave, formulación de hipótesis y primeras lecturas guiadas.', links: [] },
      { weekNumber: 3, title: 'Indagación y Primeras Actividades Prácticas', content: 'Desarrollo de experimentos o dinámicas de indagación en grupos de aprendizaje cooperativo.', links: [] },
      { weekNumber: 4, title: 'Conexiones Interdisciplinarias', content: 'Integración con áreas de Lenguaje, Matemáticas o Ciencias Sociales según el eje temático.', links: [] },
      { weekNumber: 5, title: 'Actividad de Descubrimiento Guiado', content: 'Taller práctico de aplicación y registro gráfico de evidencias en el cuaderno de proyectos.', links: [] },
      { weekNumber: 6, title: 'Profundización Temática y Trabajo en Equipo', content: 'Investigación orientada y elaboración de organizadores visuales o fichas temáticas.', links: [] },
      { weekNumber: 7, title: 'Consolidación de Aprendizajes', content: 'Práctica reflexiva individual y colectiva sobre los temas abordados.', links: [] },
      { weekNumber: 8, title: 'Revisión de Bitácoras y Cierre Parcial', content: 'Jornada formativa de balance: revisión de cuadernos de campo y autoevaluación grupal.', milestone: 'Cierre Parcial de Investigación' },
      { weekNumber: 9, title: 'Nuevos Desafíos y Proyectos Creativos', content: 'Aplicación de conocimientos a soluciones de problemas reales del colegio o la comunidad.', links: [] },
      { weekNumber: 10, title: 'Desarrollo Vivencial y Talleres Prácticos', content: 'Construcción de prototipos, maquetas o sociodramas formativos.', links: [] },
      { weekNumber: 11, title: 'Salida de Campo Pedagógica o Invitado Especial', content: 'Actividad vivencial fuera del aula o charla con un especialista de la comunidad educativa.', milestone: 'Salida de Campo Pedagógica' },
      { weekNumber: 12, title: 'Evaluaciones Formativas Mensuales', content: 'Demostración de aprendizajes, exposiciones orales individuales o rúbricas de evaluación.', milestone: 'Evaluaciones mensuales' },
      { weekNumber: 13, title: 'Preparación Cierre de Proyecto', content: 'Planificación de la muestra final, distribución de comisiones y diseño de material expositivo.', milestone: 'Preparación cierre de Proyecto' },
      { weekNumber: 14, title: 'Montaje de la Muestra Pedagógica y Ensayos', content: 'Instalación de stands, afiches didácticos y ensayo general de las presentaciones ante el público.', milestone: 'Montaje de Muestra' },
      { weekNumber: 15, title: 'Cierre y Clausura del Proyecto de Aula', content: 'Presentación formal abierta a las familias y a la comunidad del Colegio Manglar.', milestone: 'Cierre y Clausura del Proyecto de Aula' }
    ];

    onSave({
      type,
      grade,
      lapso,
      promoCohort: promoCohort.trim() || undefined,
      title: title.trim().toUpperCase(),
      purpose: purpose.trim(),
      weeks: defaultWeeks
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Nuevo Proyecto de Aula</span>
            <h3 className="text-base font-black text-slate-900">Configuración del Proyecto</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* EJE FORMATIVO: IPC vs DIEV (Color preview) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Eje del Proyecto *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Option IPC */}
              <button
                type="button"
                onClick={() => setType('IPC')}
                style={
                  type === 'IPC' && gradeCfg
                    ? {
                        backgroundColor: gradeCfg.hex,
                        color: gradeCfg.textColor,
                        borderColor: gradeCfg.borderColor,
                      }
                    : undefined
                }
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  type === 'IPC'
                    ? 'shadow-xs font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Compass className="w-4 h-4" />
                  <span className="text-xs font-extrabold">IPC</span>
                </div>
                <p className="text-[11px] opacity-90 leading-tight">
                  Interés por el Conocimiento
                </p>
              </button>

              {/* Option DIEV */}
              <button
                type="button"
                onClick={() => setType('DIEV')}
                style={
                  type === 'DIEV'
                    ? {
                        backgroundColor: DIEV_COLOR,
                        color: DIEV_TEXT_COLOR,
                        borderColor: '#eab308',
                      }
                    : undefined
                }
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  type === 'DIEV'
                    ? 'shadow-xs font-black'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <HeartHandshake className="w-4 h-4" />
                  <span className="text-xs font-extrabold">DIEV</span>
                </div>
                <p className="text-[11px] opacity-90 leading-tight">
                  Desarrollo Integral, Ética y Valores
                </p>
              </button>
            </div>
          </div>

          {/* Grado & Lapso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grado Escolar *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                {displayGrades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lapso Académico *
              </label>
              <select
                value={lapso}
                onChange={(e) => setLapso(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                <option value="1er Lapso">1er Lapso</option>
                <option value="2do Lapso">2do Lapso</option>
                <option value="3er Lapso">3er Lapso</option>
              </select>
            </div>
          </div>

          {/* Promoción / Cohorte */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Promoción o Cohorte (Opcional)
            </label>
            <input
              type="text"
              value={promoCohort}
              onChange={(e) => setPromoCohort(e.target.value)}
              placeholder="Ej: Promo XXIII o Primaria 2026"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          {/* Título del Proyecto */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título del Proyecto de Aula *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: EXPLORADORES DEL ESPACIO O EL PODER DE LA EMPATÍA"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
            />
          </div>

          {/* Propósito */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Propósito Pedagógico Institucional *
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe el objetivo y alcance formativo que los alumnos desarrollarán en este proyecto..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              El proyecto se inicializará automáticamente con 15 semanas completas estructuradas e hitos didácticos (Semanas 8, 11, 12 y 15). Podrás editar cada semana luego.
            </span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Crear Proyecto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================================
// MODAL: EDIT WEEK CONTENT & RESOURCES
// =========================================================================================
interface EditWeekModalProps {
  projectId: string;
  week: ClassroomProjectWeek;
  onClose: () => void;
  onSave: (weekData: ClassroomProjectWeek) => void;
}

const EditWeekModal: React.FC<EditWeekModalProps> = ({ week, onClose, onSave }) => {
  const [title, setTitle] = useState(week.title || '');
  const [content, setContent] = useState(week.content || '');
  const [englishContent, setEnglishContent] = useState(week.englishContent || '');
  const [milestone, setMilestone] = useState(week.milestone || '');
  const [links, setLinks] = useState<ProjectResourceLink[]>(week.links || []);

  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    setLinks([...links, { label: newLinkLabel.trim() || newLinkUrl.trim(), url: newLinkUrl.trim() }]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...week,
      title: title.trim(),
      content: content.trim(),
      englishContent: englishContent.trim() || undefined,
      milestone: milestone.trim() || undefined,
      links: links.length > 0 ? links : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-indigo-600">Semana {week.weekNumber}</span>
            <h3 className="text-base font-bold text-slate-900">Editar Actividad del Proyecto</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título o Pregunta Generadora
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: ¿Qué es la ciencia y la tecnología?"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contenido Pedagógico / Actividades de la Semana *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe detalladamente las actividades, preguntas generadoras y dinámicas de clase..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-normal leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Enfoque Bilingüe / Inglés (Opcional)
            </label>
            <textarea
              rows={2}
              value={englishContent}
              onChange={(e) => setEnglishContent(e.target.value)}
              placeholder="Actividades o debates en inglés complementarios..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hito Especial o Evaluación (Opcional)
            </label>
            <input
              type="text"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              placeholder="Ej: Evaluaciones mensuales, Salida a centro de salud, Cierre de Proyecto"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Links manager */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Enlaces y Recursos Didácticos
            </label>
            
            {links.length > 0 && (
              <div className="space-y-1.5 mb-2.5">
                {links.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="truncate max-w-[280px] font-medium text-slate-800">{link.label || link.url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-1 cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nombre (ej. Video explicativo)"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================================
// MODAL: EDIT PROJECT METADATA (TITLE, PURPOSE, PROMO)
// =========================================================================================
interface EditProjectInfoModalProps {
  project: ClassroomProject;
  onClose: () => void;
  onSave: (project: ClassroomProject) => void;
}

const EditProjectInfoModal: React.FC<EditProjectInfoModalProps> = ({ project, onClose, onSave }) => {
  const [title, setTitle] = useState(project.title);
  const [purpose, setPurpose] = useState(project.purpose);
  const [promoCohort, setPromoCohort] = useState(project.promoCohort || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...project,
      title: title.trim(),
      purpose: purpose.trim(),
      promoCohort: promoCohort.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Editar Información del Proyecto ({project.type})
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Promoción o Cohorte (Opcional)
            </label>
            <input
              type="text"
              value={promoCohort}
              onChange={(e) => setPromoCohort(e.target.value)}
              placeholder="Ej: Promo XVIII"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título del Proyecto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: LA TECNOLOGÍA EN LA MEDICINA"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Propósito Pedagógico Institucional *
            </label>
            <textarea
              required
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Incentivar a los alumnos a través de investigaciones a conocer los beneficios..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
