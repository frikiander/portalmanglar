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
      { id: 'projects',   label: 'Proyectos de aula', icon: Compass },
      {
        id: 'evaluations',
        label: 'Evaluaciones',
        icon: Medal,
        hasUrgentDot: (ctx) =>
          ctx.viewMode === 'coordinator' &&
          (ctx.evaluations?.some((e) => e.status === 'submitted') ?? false),
      },
      { id: 'roster',      label: 'Estudiantes',       icon: Users },
      { id: 'field_trips', label: 'Salidas de campo',  icon: Bus },
      { id: 'duties',      label: 'Guardias',          icon: ShieldWarning },
    ],
  },
  {
    title: 'Administración',
    requiresCoordinator: true,
    items: [
      { id: 'subjects', label: 'Asignaturas',       icon: GraduationCap },
      { id: 'schools',  label: 'Colegios',          icon: Buildings },
      { id: 'users',    label: 'Usuarios y accesos', icon: ShieldCheck },
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
  const { activeModule, setActiveModule, viewMode, setViewMode, canSwitchView, addToast } = context;

  const handleSelectModule = (moduleId: NavigationModule) => {
    setActiveModule(moduleId);
    if (isMobileOpen) onCloseMobile();
  };

  const rowClass = `w-full group relative flex items-center gap-3 py-2 rounded-md transition-colors text-left text-sm ${
    isCollapsed ? 'justify-center px-2' : 'px-3'
  }`;

  /* ── Shared sidebar body ── */
  const sidebarContent = (
    <div className="flex flex-col h-full bg-raiz text-white select-none">

      {/* ── Brand header ── */}
      <div className={`h-16 flex items-center shrink-0 ${isCollapsed ? 'justify-center px-2' : 'justify-between gap-2 px-4'}`}>
        <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? '' : 'lg:pr-3'}`}>
          <ManglarEmblem className={`${isCollapsed ? 'w-8 h-8' : 'w-9 h-9'} shrink-0`} withShadow={false} />
          {!isCollapsed && (
            <div className="min-w-0 leading-tight">
              <p className="font-extrabold text-base tracking-tight text-white">Portal Manglar</p>
              <p className="text-xs text-white/55 truncate">Colegio Integral El Manglar</p>
            </div>
          )}
        </div>

        {/* Mobile close */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-white/60 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle: sits on the edge so it never crowds the emblem */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 items-center justify-center rounded-full
                     bg-white text-slate-600 border border-slate-300 hover:text-raiz hover:border-slate-400 transition-colors z-10"
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isCollapsed
            ? <CaretRight weight="bold" className="w-3 h-3" />
            : <CaretLeft  weight="bold" className="w-3 h-3" />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-5" aria-label="Módulos">
        {NAV_GROUPS.filter((g) => !g.requiresCoordinator || viewMode === 'coordinator').map((group, gi) => (
          <div key={gi}>
            {!isCollapsed && group.title && (
              <p className="px-3 mb-1.5 text-xs font-bold text-white/45">{group.title}</p>
            )}
            {isCollapsed && group.title && (
              <div className="mx-auto w-6 h-px bg-white/15 my-2" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon     = item.icon;
                const isActive = activeModule === item.id;
                const showDot  = item.hasUrgentDot ? item.hasUrgentDot(context) : false;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleSelectModule(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${rowClass} ${
                      isActive
                        ? 'bg-white/[0.08] text-white font-bold'
                        : 'text-white/70 hover:text-white hover:bg-white/5 font-medium'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -left-2 top-1.5 bottom-1.5 w-[3px] rounded-r-sm bg-hoja" aria-hidden />
                    )}
                    <Icon
                      weight={isActive ? 'fill' : 'regular'}
                      className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isActive ? 'text-hoja' : 'text-white/50 group-hover:text-white/80'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}

                    {showDot && (
                      <span
                        className={`w-2 h-2 rounded-full bg-polen shrink-0 ${isCollapsed ? 'absolute top-1.5 right-2' : ''}`}
                        aria-label="Tiene entregas por revisar"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom actions ── */}
      <div className="px-2 py-3 border-t border-white/10 space-y-0.5 shrink-0">
        {/* View mode switcher — coordinators only */}
        {canSwitchView && (
        <button
          onClick={() => setViewMode(viewMode === 'teacher' ? 'coordinator' : 'teacher')}
          title={isCollapsed ? `Vista: ${viewMode === 'coordinator' ? 'Coordinación' : 'Docente'}` : undefined}
          className={`${rowClass} text-white/70 hover:text-white hover:bg-white/5 font-medium`}
        >
          <GearSix className="w-[18px] h-[18px] text-white/50 shrink-0" />
          {!isCollapsed && (
            <span className="flex-1 flex items-center justify-between min-w-0">
              <span>Vista</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-white/10 text-white">
                {viewMode === 'coordinator' ? 'Coordinación' : 'Docente'}
              </span>
            </span>
          )}
        </button>
        )}

        {/* Help Center */}
        <button
          onClick={() => addToast('Para soporte, escribe a Coordinación Académica.', 'info')}
          title={isCollapsed ? 'Ayuda' : undefined}
          className={`${rowClass} text-white/70 hover:text-white hover:bg-white/5 font-medium`}
        >
          <Question className="w-[18px] h-[18px] text-white/50 shrink-0" />
          {!isCollapsed && <span>Ayuda</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 z-30 sticky top-0 h-screen ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-raiz/40 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-64 max-w-[85vw] shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
