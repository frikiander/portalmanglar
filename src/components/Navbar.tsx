import React, { useState } from 'react';
import {
  MagnifyingGlass,
  ChatCircle,
  Bell,
  CaretDown,
  List as Menu,
  CheckCircle,
  CalendarBlank,
  BookOpen,
  UserCheck,
  Database,
  SignOut,
  Warning,
  X,
  Clock,
  Medal,
  Users,
  Bus,
  ShieldWarning,
  GraduationCap,
  Buildings,
  ShieldCheck,
  Compass,
  GearSix,
  CaretRight,
  Star,
} from '@phosphor-icons/react';
import { useEduPlan } from '../context/EduPlanContext';
import { NavigationModule } from '../types';
import { SchoolYearsManagementModal } from './SchoolYearsManagementModal';

interface NavbarProps {
  onOpenMobileSidebar?: () => void;
  onLogout?: () => void;
}

// ─── Module Metadata (for breadcrumb) ─────────────────────────────────────────
const MODULE_META: Record<NavigationModule | 'dashboard', { label: string; icon: React.ElementType }> = {
  planning:    { label: 'Planificación',     icon: BookOpen       },
  calendar:    { label: 'Calendario',        icon: CalendarBlank  },
  schedules:   { label: 'Horarios',          icon: Clock          },
  projects:    { label: 'Proyectos de Aula', icon: Compass        },
  evaluations: { label: 'Evaluaciones',      icon: Medal          },
  roster:      { label: 'Estudiantes',       icon: Users          },
  field_trips: { label: 'Salidas de Campo',  icon: Bus            },
  duties:      { label: 'Guardias',          icon: ShieldWarning  },
  subjects:    { label: 'Asignaturas',       icon: GraduationCap  },
  schools:     { label: 'Colegios',          icon: Buildings      },
  users:       { label: 'Usuarios & Accesos',icon: ShieldCheck    },
  dashboard:   { label: 'Inicio',            icon: UserCheck      },
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar, onLogout }) => {
  const {
    viewMode,
    setViewMode,
    currentUser,
    activeModule,
    selectedSchoolYear,
    setSelectedSchoolYear,
    defaultSchoolYear,
    currentSchoolYear,
    availableSchoolYears,
    isViewingHistoricalYear,
    loginWithGoogleHandler,
    logoutHandler,
    isLoggedInWithGoogle,
    isAuthLoading,
    authError,
    setAuthError,
    addToast,
  } = useEduPlan();

  const [isUserMenuOpen, setIsUserMenuOpen]         = useState(false);
  const [isYearMenuOpen, setIsYearMenuOpen]         = useState(false);
  const [isSchoolYearModalOpen, setIsSchoolYearModalOpen] = useState(false);
  const [searchQuery,    setSearchQuery]             = useState('');

  // ─── Breadcrumb ──────────────────────────────────────────────────────────────
  const currentMeta = MODULE_META[activeModule] ?? MODULE_META['dashboard'];
  const BreadcrumbIcon = currentMeta.icon;

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/98 border-b border-slate-200/80 shadow-2xs shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Left: Mobile menu button + Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                id="mobile-sidebar-toggle-btn"
                onClick={onOpenMobileSidebar}
                className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                aria-label="Abrir panel lateral"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb — desktop only */}
              <nav className="hidden lg:flex items-center gap-1.5 text-sm min-w-0" aria-label="Ruta actual">
                <span className="text-slate-400 font-medium text-xs">Portal Manglar</span>
                <CaretRight className="w-3 h-3 text-slate-300 shrink-0" />
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                  <BreadcrumbIcon weight="duotone" className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{currentMeta.label}</span>
                </div>
              </nav>
            </div>

            {/* Center: Search (hidden on small screens) */}
            <div className="hidden sm:flex flex-1 max-w-xs">
              <div className="relative w-full">
                <MagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar…"
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-sm text-slate-700
                             placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-transparent
                             focus:border-indigo-200 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 shrink-0">

              {/* School Year selector */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsYearMenuOpen(!isYearMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    transition-all border ${
                    isViewingHistoricalYear
                      ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CalendarBlank className="w-3.5 h-3.5" />
                  <span>{selectedSchoolYear}</span>
                  <CaretDown className="w-3 h-3" />
                </button>

                {isYearMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsYearMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1">
                      {availableSchoolYears.map((year) => {
                        const isDefault = year === defaultSchoolYear;
                        return (
                          <button
                            key={year}
                            onClick={() => { setSelectedSchoolYear(year); setIsYearMenuOpen(false); }}
                            className={`w-full flex items-center justify-between text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                              selectedSchoolYear === year
                                ? 'text-indigo-700 font-bold bg-indigo-50'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{year}</span>
                            {isDefault && (
                              <span className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                <Star weight="fill" className="w-3 h-3 text-amber-500" />
                                Base
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {(viewMode === 'coordinator' || currentUser.role === 'coordinator') && (
                        <button
                          onClick={() => {
                            setIsSchoolYearModalOpen(true);
                            setIsYearMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between text-left px-3 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border-t border-slate-100 rounded-b-xl transition-colors mt-1"
                        >
                          <span>Gestionar Años Escolares</span>
                          <GearSix className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <button
                onClick={() => addToast('Sin mensajes pendientes.', 'info')}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                title="Mensajes"
              >
                <ChatCircle className="w-[18px] h-[18px]" />
              </button>

              {/* Notifications */}
              <button
                onClick={() => addToast('No hay nuevas alertas.', 'info')}
                className="relative p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                title="Notificaciones"
              >
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              </button>



              {/* ── User Menu ── */}
              <div className="relative ml-1">
                <button
                  id="navbar-user-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 p-1.5 rounded-xl transition-all border ${
                    isUserMenuOpen
                      ? 'border-indigo-200 bg-indigo-50'
                      : 'border-transparent hover:bg-slate-100'
                  }`}
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.fullName}
                      className="w-7 h-7 rounded-lg object-cover ring-2 ring-white"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-700">
                        {currentUser.fullName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight max-w-[100px] truncate">
                      {currentUser.fullName.split(' ')[0]} {currentUser.fullName.split(' ')[1] || ''}
                    </p>
                    <p className={`text-[10px] font-medium leading-tight ${
                      viewMode === 'coordinator' ? 'text-indigo-500' : 'text-emerald-500'
                    }`}>
                      {viewMode === 'coordinator' ? 'Coordinación' : 'Docente'}
                    </p>
                  </div>
                  <CaretDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/60 z-50 overflow-hidden">

                      {/* Profile header */}
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          {currentUser.avatar ? (
                            <img src={currentUser.avatar} alt={currentUser.fullName}
                                 className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-sm" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center">
                              <span className="text-lg font-bold text-white">{currentUser.fullName.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{currentUser.fullName}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                              viewMode === 'coordinator'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {viewMode === 'coordinator' ? '● Coordinación' : '● Docente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Auth status */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        {isLoggedInWithGoogle ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-700">
                            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium">Sesión Google activa</span>
                          </div>
                        ) : (
                          <button
                            id="navbar-google-login-btn"
                            onClick={() => { loginWithGoogleHandler(); setIsUserMenuOpen(false); }}
                            disabled={isAuthLoading}
                            className="w-full flex items-center gap-2 text-xs font-semibold text-slate-600
                                       hover:text-indigo-700 disabled:opacity-60 transition-colors"
                          >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {isAuthLoading ? 'Conectando…' : 'Conectar con Google'}
                          </button>
                        )}

                        {authError && (
                          <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[10px] text-rose-700 leading-relaxed">
                            <div className="flex gap-1.5">
                              <Warning weight="fill" className="w-3 h-3 shrink-0 text-rose-500 mt-0.5" />
                              <span>{authError}</span>
                            </div>
                            <button onClick={() => setAuthError(null)} className="mt-1 text-rose-500 hover:text-rose-700 underline text-[9px]">
                              Cerrar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* View mode switch */}
                      <div className="px-2 py-2 border-b border-slate-100">
                        <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vista</p>
                        {(['coordinator', 'teacher'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => { setViewMode(mode); setIsUserMenuOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                              viewMode === mode
                                ? mode === 'coordinator'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'bg-emerald-50 text-emerald-700'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {mode === 'coordinator'
                              ? <GearSix className="w-3.5 h-3.5" />
                              : <BookOpen className="w-3.5 h-3.5" />}
                            {mode === 'coordinator' ? 'Coordinación' : 'Docente'}
                            {viewMode === mode && (
                              <CheckCircle weight="fill" className="w-3 h-3 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            logoutHandler();
                            onLogout?.();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg
                                     text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <SignOut className="w-3.5 h-3.5" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <SchoolYearsManagementModal
        isOpen={isSchoolYearModalOpen}
        onClose={() => setIsSchoolYearModalOpen(false)}
      />
    </>
  );
};
