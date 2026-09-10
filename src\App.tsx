import React, { useState, useEffect } from 'react';
import { EduPlanProvider, useEduPlan } from './context/EduPlanContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TeacherDashboard } from './components/TeacherDashboard';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { SchoolCalendar } from './components/SchoolCalendar';
import { ScheduleSection } from './components/ScheduleSection';
import { ClassroomProjectsSection } from './components/ClassroomProjectsSection';
import { FieldTripsSection } from './components/FieldTripsSection';
import { DutyScheduleSection } from './components/DutyScheduleSection';
import { RosterSection } from './components/RosterSection';
import { SchoolDirectorySection } from './components/SchoolDirectorySection';
import { EvaluationsSection } from './components/EvaluationsSection';
import { UsersManagementSection } from './components/UsersManagementSection';
import { SubjectsManagementSection } from './components/SubjectsManagementSection';
import { ToastContainer } from './components/ToastContainer';
import { ManglarEmblem } from './components/ManglarLogo';
import { LoginPage } from './components/LoginPage';
import { getSession, onAuthStateChange } from './lib/supabase';
import type { User } from './types';
import { BookOpen, UserCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { viewMode, setViewMode, activeModule, currentUser, setCurrentUser, authError } = useEduPlan();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('eduplan_sidebar_collapsed') === 'true';
  });

  // ─── Auth Gate ──────────────────────────────────────────────────────────────
  // The app is considered "authenticated" if:
  //   (a) A real Supabase session exists (Google OAuth), OR
  //   (b) The user chose a demo account (stored in localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('eduplan_demo_mode') === 'true';
  });
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Check if there is an existing Supabase session (e.g. after Google OAuth redirect)
    getSession().then((session) => {
      if (session) setIsAuthenticated(true);
      setAuthChecking(false);
    });

    // Listen for subsequent auth changes (login / logout)
    const unsub = onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });
    return () => unsub();
  }, []);

  /** Called when the user picks a demo account on the LoginPage. */
  const handleDemoLogin = (user: User) => {
    setCurrentUser(user);
    setViewMode(user.role);
    localStorage.setItem('eduplan_user', JSON.stringify(user));
    localStorage.setItem('eduplan_view_mode', user.role);
    localStorage.setItem('eduplan_demo_mode', 'true');
    setIsAuthenticated(true);
  };

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('eduplan_sidebar_collapsed', String(next));
      return next;
    });
  };

  // ─── Loading splash ─────────────────────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
            <ManglarEmblem className="w-9 h-9" withShadow={false} />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>Verificando sesión…</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Login Gate ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <LoginPage
        onDemoLogin={handleDemoLogin}
        authError={authError}
      />
    );
  }

  // ─── Main App ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Lateral Navigation Sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar with active module breadcrumb and controls */}
        <Navbar
          onOpenMobileSidebar={() => setIsMobileMenuOpen(true)}
          onLogout={() => {
            localStorage.removeItem('eduplan_demo_mode');
            setIsAuthenticated(false);
          }}
        />

        {/* Dynamic Main Workspace: Renders ONLY the active module */}
        <main key={activeModule} className="module-enter flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeModule === 'calendar' ? (
            <SchoolCalendar />
          ) : activeModule === 'schedules' ? (
            <ScheduleSection />
          ) : activeModule === 'projects' ? (
            <ClassroomProjectsSection />
          ) : activeModule === 'field_trips' ? (
            <FieldTripsSection />
          ) : activeModule === 'duties' ? (
            <DutyScheduleSection />
          ) : activeModule === 'roster' ? (
            <RosterSection />
          ) : activeModule === 'evaluations' ? (
            <EvaluationsSection />
          ) : activeModule === 'schools' && viewMode === 'coordinator' ? (
            <SchoolDirectorySection />
          ) : activeModule === 'users' && viewMode === 'coordinator' ? (
            <UsersManagementSection />
          ) : activeModule === 'subjects' && viewMode === 'coordinator' ? (
            <SubjectsManagementSection />
          ) : viewMode === 'teacher' ? (
            <TeacherDashboard />
          ) : (
            <CoordinatorDashboard />
          )}
        </main>

        {/* Unified Application Footer */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white py-5">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <ManglarEmblem className="w-5 h-5" withShadow={false} />
              <span className="font-extrabold text-slate-800">Portal Manglar</span>
              <span>·</span>
              <span className="text-slate-600 font-medium">Colegio Integral El Manglar</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                id="footer-switch-mode-btn"
                onClick={() => setViewMode(viewMode === 'teacher' ? 'coordinator' : 'teacher')}
                className="hover:text-indigo-600 transition-colors font-medium flex items-center space-x-1"
              >
                {viewMode === 'teacher' ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Cambiar a Vista Coordinador</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Cambiar a Vista Docente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <EduPlanProvider>
      <AppContent />
    </EduPlanProvider>
  );
}
