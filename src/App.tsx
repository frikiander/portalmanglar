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

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('eduplan_demo_mode') === 'true';
  });
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    getSession().then((session) => {
      if (session) setIsAuthenticated(true);
      setAuthChecking(false);
    });

    const unsub = onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });
    return () => unsub();
  }, []);

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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onDemoLogin={handleDemoLogin}
          authError={authError}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex font-sans selection:bg-indigo-500 selection:text-white">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenMobileSidebar={() => setIsMobileMenuOpen(true)}
          onLogout={() => {
            localStorage.removeItem('eduplan_demo_mode');
            setIsAuthenticated(false);
          }}
        />

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

              <span>·</span>
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>

      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <EduPlanProvider>
      <AppContent />
    </EduPlanProvider>
  );
}

export default App;
