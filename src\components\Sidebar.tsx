import React from 'react';
import {
  BookOpen,
  CalendarBlank,
  ShieldWarning,
  CaretLeft,
  CaretRight,
  X,
  Users,
  Buildings,
  Bus,
  Clock,
  ShieldCheck,
  GraduationCap,
  Medal,
  GearSix,
  Question,
  Database,
  Compass,
} from '@phosphor-icons/react';
import { ManglarEmblem } from './ManglarLogo';
import { useEduPlan } from '../context/EduPlanContext';
import { NavigationModule } from '../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemConfig {
  id: NavigationModule;
  label: string;
  icon: React.ElementType;
  hasUrgentDot?: (ctx: ReturnType<typeof useEduPlan>) => boolean;
}

interface NavGroup {
  title?: string;
  requiresCoordinator?: boolean;
  items: NavItemConfig[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        id: 'planning',
        label: 'Planificación',
        icon: BookOpen,
        hasUrgentDot: (ctx) =>
          ctx.viewMode === 'coordinator' && ctx.plans.some((p) => p.status === 'submitted'),
      },
      { id: 'calendar',   label: 'Calendario',       icon: CalendarBlank },
      { id: 'schedules',  label: 'Horarios',          icon: Clock },
      { id: 'projects',   label: 'Proyectos de Aula', icon: Compass },
      {
        id: 'evaluations',
        label: 'Evaluaciones',
        icon: Medal,
        hasUrgentDot: (ctx) =>
          ctx.viewMode === 'coordinator' &&
          (ctx.evaluations?.some((e) => e.status === 'submitted') ?? false),
      },
      { id: 'roster',      label: 'Estudiantes',       icon: Users },
      { id: 'field_trips', label: 'Salidas de Campo',  icon: Bus },
      { id: 'duties',      label: 'Guardias',          icon: ShieldWarning },
    ],
  },
  {
    title: 'Administración',
    requiresCoordinator: true,
    items: [
      { id: 'subjects', label: 'Asignaturas',     icon: GraduationCap },
      { id: 'schools',  label: 'Colegios',         icon: Buildings },
      { id: 'users',    label: 'Usuarios & Accesos', icon: ShieldCheck },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const context = useEduPlan();
  const { activeModule, setActiveModule, viewMode, setViewMode, currentUser, addToast } = context;

  const handleSelectModule = (moduleId: NavigationModule) => {
    setActiveModule(moduleId);
    if (isMobileOpen) onCloseMobile();
  };

  /* ── Shared sidebar body ── */
  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 select-none">

      {/* ── Brand header ── */}
      <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Logo mark matching website favicon */}
          <div className="w-9 h-9 rounded-xl bg-slate-900 p-1 flex items-center justify-center shrink-0 shadow-xs border border-slate-800">
            <ManglarEmblem className="w-full h-full" withShadow={false} />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-black text-sm tracking-wider text-slate-900 uppercase leading-none">
                MANGLAR
              </span>
              <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                Colegio Integral
              </p>
            </div>
          )}
        </div>

        {/* Mobile close */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isCollapsed
            ? <CaretRight className="w-4 h-4" />
            : <CaretLeft  className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-4">
        {NAV_GROUPS.filter((g) => !g.requiresCoordinator || viewMode === 'coordinator').map((group, gi) => (
          <div key={gi}>
            {/* Group label */}
            {!isCollapsed && group.title && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {group.title}
              </p>
            )}
            {isCollapsed && group.title && (
              <div className="mx-auto w-6 h-px bg-slate-200 my-2" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon      = item.icon;
                const isActive  = activeModule === item.id;
                const showDot   = item.hasUrgentDot ? item.hasUrgentDot(context) : false;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleSelectModule(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-150 text-left text-sm
                      ${isCollapsed ? 'justify-center px-2' : ''}
                      ${isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'}
                    `}
                  >
                    <Icon
                      weight={isActive ? 'duotone' : 'regular'}
                      className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}

                    {showDot && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom actions ── */}
      <div className={`px-2 py-3 border-t border-slate-100 space-y-0.5 shrink-0 ${isCollapsed ? '' : ''}`}>
        {/* View mode switcher */}
        <button
          onClick={() => {
            const next = viewMode === 'teacher' ? 'coordinator' : 'teacher';
            setViewMode(next);
            addToast(`Modo ${next === 'coordinator' ? 'Coordinación' : 'Docente'} activado`, 'info');
          }}
          title={isCollapsed ? `Modo: ${viewMode === 'coordinator' ? 'Coordinación' : 'Docente'}` : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600
            hover:text-slate-900 hover:bg-slate-50 transition-colors text-left text-sm font-medium
            ${isCollapsed ? 'justify-center px-2' : ''}`}
        >
          <GearSix
            weight="regular"
            className="w-[18px] h-[18px] text-slate-400 shrink-0"
          />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="text-xs font-medium text-slate-600">Modo de vista</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                viewMode === 'coordinator'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {viewMode === 'coordinator' ? 'Coord.' : 'Docente'}
              </span>
            </div>
          )}
        </button>

        {/* Help Center */}
        <button
          onClick={() => addToast('Soporte: Contacte a Coordinación Académica.', 'info')}
          title={isCollapsed ? 'Ayuda' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500
            hover:text-slate-900 hover:bg-slate-50 transition-colors text-left text-sm font-medium
            ${isCollapsed ? 'justify-center px-2' : ''}`}
        >
          <Question
            weight="regular"
            className="w-[18px] h-[18px] text-slate-400 shrink-0"
          />
          {!isCollapsed && (
            <span className="text-xs font-medium text-slate-500">Centro de Ayuda</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 z-30 sticky top-0 h-screen ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-[85vw] bg-white shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
