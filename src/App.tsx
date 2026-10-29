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
    setCurrentUser(user); // the context switches the view to the user's role
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
      <div className="min-h-screen bg-raiz flex items-center justify-center" role="status">
        <div className="flex flex-col items-center gap-5">
          <ManglarEmblem className="w-14 h-14" withShadow={false} />
          <div className="flex items-center gap-2 text-white/60 text-sm">
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
    <div className="min-h-screen bg-fango text-raiz flex font-sans">
      <a href="#contenido" className="skip-link">Saltar al contenido</a>

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
        <main id="contenido" tabIndex={-1} key={activeModule} className="module-enter focus:outline-none flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
