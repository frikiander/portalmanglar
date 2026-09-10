import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Competency, LessonPlan, ViewMode, PlanStatus, SchoolEvent, ClassroomProject, ClassroomProjectWeek, DutySlot, NavigationModule, Student, ExternalSchool, IntercollegiateEventKey, FieldTrip, FieldTripStatus, EvaluationRecord, EvaluationStatus, StudentGradeEntry, EvaluationMoment, EvaluationLapso, GradeScale, TestAdaptationType, AcademicSubject } from '../types';
import { MOCK_USERS, INITIAL_COMPETENCIES, INITIAL_LESSON_PLANS, INITIAL_SCHOOL_EVENTS, INITIAL_CLASSROOM_PROJECTS, INITIAL_DUTY_SLOTS, AVAILABLE_GRADES } from '../data/mockData';
import { INITIAL_STUDENTS_DATA, SCHOOL_GRADES } from '../data/mockRoster';
import { INITIAL_SCHOOLS_DATA } from '../data/mockSchools';
import { INITIAL_FIELD_TRIPS } from '../data/mockFieldTrips';
import { INITIAL_EVALUATIONS } from '../data/mockEvaluations';
import { INITIAL_CLASS_SCHEDULES, INITIAL_EVENT_SCHEDULES, detectSubjectCategory } from '../data/mockSchedules';
import { INITIAL_INSTITUTIONAL_SUBJECTS } from '../data/mockSubjects';
import { ClassSchedule, ClassScheduleCell, EventSchedule, ScheduleDay } from '../types';
import {
  signInWithGoogle,
  signOut,
  onAuthStateChange,
  fetchUsers,
  upsertUser,
  removeUser,
  fetchSubjects,
  upsertSubject,
  removeSubject,
  SUPABASE_CONFIGURED,
} from '../lib/supabase';
import { mapDbUserToUser, mapUserToDb, mapDbSubjectToSubject, mapSubjectToDb } from '../lib/mappers';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface EduPlanContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeModule: NavigationModule;
  setActiveModule: (module: NavigationModule) => void;
  plans: LessonPlan[];
  competencies: Competency[];
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  events: SchoolEvent[];
  addSchoolEvent: (eventData: Omit<SchoolEvent, 'id'>) => SchoolEvent;
  deleteSchoolEvent: (id: string) => void;
  classroomProjects: ClassroomProject[];
  updateClassroomProject: (project: ClassroomProject) => void;
  updateClassroomProjectWeek: (projectId: string, weekData: ClassroomProjectWeek) => void;
  addClassroomProject: (projectData: Omit<ClassroomProject, 'id' | 'updatedAt'>) => ClassroomProject;
  deleteClassroomProject: (projectId: string) => void;
  resetClassroomProjects: () => void;
  clearAllClassroomProjects: () => void;
  dutySlots: DutySlot[];
  updateDutySlot: (slotId: string, assignedPerson: string) => void;
  selectedDutyTeacher: string;
  setSelectedDutyTeacher: (teacherName: string) => void;
  // Nómina de Estudiantes
  students: Student[];
  selectedRosterGrade: string;
  setSelectedRosterGrade: (grade: string) => void;
  addStudent: (studentData: Omit<Student, 'id' | 'orderNumber'>) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  toggleSociogramGroup: (studentId: string) => void;
  updateCanvasStatus: (studentId: string, accepted: boolean, observation?: string) => void;
  // Directorio de Colegios
  schools: ExternalSchool[];
  addSchool: (schoolData: Omit<ExternalSchool, 'id'>) => ExternalSchool;
  updateSchool: (school: ExternalSchool) => void;
  deleteSchool: (schoolId: string) => void;
  toggleSchoolEvent: (schoolId: string, eventKey: IntercollegiateEventKey) => void;
  // Salidas de Campo e Invitados Especiales
  fieldTrips: FieldTrip[];
  addFieldTrip: (data: Omit<FieldTrip, 'id' | 'createdAt' | 'updatedAt'>) => FieldTrip;
  updateFieldTrip: (fieldTrip: FieldTrip) => void;
  deleteFieldTrip: (fieldTripId: string) => void;
  updateFieldTripStatus: (fieldTripId: string, status: FieldTripStatus, feedback?: string) => void;
  // Gestión Global de Año Escolar
  currentSchoolYear: string;
  selectedSchoolYear: string;
  setSelectedSchoolYear: (year: string) => void;
  availableSchoolYears: string[];
  isViewingHistoricalYear: boolean;
  // Módulo de Evaluación y Calificaciones
  evaluations: EvaluationRecord[];
  saveEvaluationRecord: (record: EvaluationRecord, silent?: boolean) => EvaluationRecord;
  updateStudentGrade: (evalId: string, studentId: string, updates: Partial<StudentGradeEntry>) => void;
  setEvaluationStatus: (evalId: string, status: EvaluationStatus, auditNotes?: string) => void;
  deleteEvaluationRecord: (evalId: string) => void;
  getOrCreateEvaluation: (params: { schoolYear: string; grade: string; subject: string; lapso: EvaluationLapso; moment: EvaluationMoment }) => EvaluationRecord;
  // Módulo de Horarios de Clase y Eventos
  classSchedules: ClassSchedule[];
  eventSchedules: EventSchedule[];
  selectedScheduleGrade: string;
  setSelectedScheduleGrade: (grade: string) => void;
  selectedScheduleLapso: string;
  setSelectedScheduleLapso: (lapso: string) => void;
  selectedScheduleWeek: number;
  setSelectedScheduleWeek: (week: number) => void;
  updateScheduleCell: (params: { grade: string; lapso: string; weekNumber: number; day: ScheduleDay; timeSlot: string; cell: ClassScheduleCell }) => void;
  saveClassSchedule: (schedule: ClassSchedule) => void;
  saveWeekClassSchedule: (params: { schoolYear?: string; grade: string; lapso: string; weekNumber: number; cells: Record<string, ClassScheduleCell>; notes?: string; basedOnWeekNumber?: number }) => ClassSchedule;
  copyScheduleFromWeek: (params: { targetLapso: string; targetWeek: number; sourceLapso: string; sourceWeek: number; grade: string }) => void;
  addEventSchedule: (eventData: Omit<EventSchedule, 'id' | 'createdAt' | 'updatedAt'>) => EventSchedule;
  updateEventSchedule: (event: EventSchedule) => void;
  deleteEventSchedule: (id: string) => void;
  resetClassSchedules: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  savePlan: (plan: Partial<LessonPlan> & { id?: string; weekNumber: number }) => LessonPlan;
  submitPlanToCoordination: (planId: string) => void;
  reviewPlan: (planId: string, status: 'approved' | 'rejected', feedback: string) => void;
  addCompetency: (competency: Omit<Competency, 'id'>) => Competency;
  updateCompetency: (competency: Competency) => void;
  deleteCompetency: (id: string) => void;
  getCompetenciesFor: (subject: string, grade: string) => Competency[];

  // Gestión de Usuarios y Autenticación con Google / Firebase
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  loginWithGoogleHandler: () => Promise<boolean>;
  logoutHandler: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
  isAuthLoading: boolean;
  isLoggedInWithGoogle: boolean;

  // Catálogo Dinámico de Asignaturas (Ajedrez, Teatro, ADP, Deporte, Ed. Física, etc.)
  subjects: AcademicSubject[];
  availableSubjectNames: string[];
  addSubject: (subjectData: Omit<AcademicSubject, 'id' | 'createdAt'>) => Promise<AcademicSubject>;
  updateSubject: (subject: AcademicSubject) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  // Catálogo Dinámico de Grados
  availableGradeNames: string[];
  addGrade: (name: string) => void;
  deleteGrade: (name: string) => void;
}

export const CURRENT_SCHOOL_YEAR = '2025-2026';
export const AVAILABLE_SCHOOL_YEARS = ['2026-2027', '2025-2026', '2024-2025', '2023-2024'];

const EduPlanContext = createContext<EduPlanContextType | undefined>(undefined);

export const EduPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Gestión Global de Año Escolar
  const [selectedSchoolYear, setSelectedSchoolYearState] = useState<string>(() => {
    const saved = localStorage.getItem('eduplan_school_year');
    return saved || CURRENT_SCHOOL_YEAR;
  });

  const setSelectedSchoolYear = (year: string) => {
    setSelectedSchoolYearState(year);
    localStorage.setItem('eduplan_school_year', year);
  };

  const isViewingHistoricalYear = selectedSchoolYear !== CURRENT_SCHOOL_YEAR;

  // Catálogo Dinámico de Asignaturas (Ajedrez, Teatro, ADP, Deporte, Ed. Física, etc.)
  const [subjects, setSubjects] = useState<AcademicSubject[]>(() => {
    const saved = localStorage.getItem('eduplan_academic_subjects');
    return saved ? JSON.parse(saved) : INITIAL_INSTITUTIONAL_SUBJECTS;
  });

  const availableSubjectNames = useMemo(() => {
    return subjects.map((s) => s.name);
  }, [subjects]);

  // Catálogo Dinámico de Grados Institucionales
  const [customGrades, setCustomGrades] = useState<string[]>(() => {
    const saved = localStorage.getItem('eduplan_custom_grades');
    return saved ? JSON.parse(saved) : [];
  });

  const availableGradeNames = useMemo(() => {
    const combined = [...AVAILABLE_GRADES];
    customGrades.forEach((g) => {
      if (!combined.includes(g)) combined.push(g);
    });
    return combined;
  }, [customGrades]);

  const addGrade = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || availableGradeNames.includes(trimmed)) return;
    const updated = [...customGrades, trimmed];
    setCustomGrades(updated);
    localStorage.setItem('eduplan_custom_grades', JSON.stringify(updated));
    addToast(`Grado "${trimmed}" incorporado al sistema.`, 'success');
  };

  const deleteGrade = (name: string) => {
    const updated = customGrades.filter((g) => g !== name);
    setCustomGrades(updated);
    localStorage.setItem('eduplan_custom_grades', JSON.stringify(updated));
    addToast(`Grado "${name}" eliminado.`, 'info');
  };

  // Gestión de Usuarios y Personal Docente
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('eduplan_users_list');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isLoggedInWithGoogle, setIsLoggedInWithGoogle] = useState<boolean>(false);

  const clearAuthError = () => setAuthError(null);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('eduplan_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[0]; // Prof. Carlos Mendoza
  });

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('eduplan_view_mode');
    return (saved as ViewMode) || 'teacher';
  });

  // Sincronización Supabase: Usuarios (fetch inicial al montar)
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    fetchUsers().then((rows) => {
      if (rows && rows.length > 0) {
        const remoteUsers = rows.map(mapDbUserToUser);
        setUsers(remoteUsers);
        localStorage.setItem('eduplan_users_list', JSON.stringify(remoteUsers));
      } else if (rows !== null) {
        // Supabase vacío → sembrar con usuarios mock
        MOCK_USERS.forEach((u) => upsertUser(mapUserToDb(u)));
      }
    });
  }, []);

  // Sincronización Supabase: Asignaturas (fetch inicial al montar)
  useEffect(() => {
    if (!SUPABASE_CONFIGURED) return;
    fetchSubjects().then((rows) => {
      if (rows && rows.length > 0) {
        const remoteSubjects = rows.map(mapDbSubjectToSubject);
        setSubjects(remoteSubjects);
        localStorage.setItem('eduplan_academic_subjects', JSON.stringify(remoteSubjects));
      } else if (rows !== null) {
        // Supabase vacío → sembrar con asignaturas institucionales
        INITIAL_INSTITUTIONAL_SUBJECTS.forEach((s) => upsertSubject(mapSubjectToDb(s)));
      }
    });
  }, []);

  // Monitor Supabase Auth State (Google OAuth)
  useEffect(() => {
    const unsub = onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setIsLoggedInWithGoogle(true);
        const userEmail = session.user.email.toLowerCase().trim();
        const found = users.find((u) => u.email.toLowerCase().trim() === userEmail);
        if (found) {
          if (found.status === 'inactive') {
            setAuthError(`La cuenta '${session.user.email}' está desactivada. Contacta a Coordinación.`);
            signOut().catch(() => {});
            setIsLoggedInWithGoogle(false);
          } else {
            const updatedUser: User = {
              ...found,
              authUid: session.user.id,
              avatar: session.user.user_metadata?.['avatar_url'] || found.avatar,
              lastLoginAt: new Date().toISOString(),
            };
            setCurrentUser(updatedUser);
            setViewModeState(updatedUser.role);
            localStorage.setItem('eduplan_user', JSON.stringify(updatedUser));
            setAuthError(null);
          }
        } else {
          // Email not in authorized list
          setAuthError(`Acceso no autorizado: El correo '${session.user.email}' no ha sido registrado por Coordinación.`);
          signOut().catch(() => {});
          setIsLoggedInWithGoogle(false);
        }
      } else {
        setIsLoggedInWithGoogle(false);
      }
    });
    return () => unsub();
  }, [users]);

  const [activeModule, setActiveModuleState] = useState<NavigationModule>(() => {
    const saved = localStorage.getItem('eduplan_active_module');
    if (saved === 'english_review') return 'planning';
    return (saved as NavigationModule) || 'planning';
  });

  const setActiveModule = (module: NavigationModule) => {
    setActiveModuleState(module);
    localStorage.setItem('eduplan_active_module', module);
  };

  const [plans, setPlans] = useState<LessonPlan[]>(() => {
    const saved = localStorage.getItem('eduplan_plans');
    return saved ? JSON.parse(saved) : INITIAL_LESSON_PLANS;
  });

  const [competencies, setCompetencies] = useState<Competency[]>(() => {
    const saved = localStorage.getItem('eduplan_competencies');
    if (!saved) return INITIAL_COMPETENCIES;
    try {
      const parsed: any[] = JSON.parse(saved);
      return parsed.map((c) => ({
        ...c,
        indicators: Array.isArray(c.indicators) && c.indicators.length > 0
          ? c.indicators
          : (c.description ? [c.description] : ['Demuestra dominio de los contenidos curriculares.']),
      }));
    } catch {
      return INITIAL_COMPETENCIES;
    }
  });

  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    const saved = localStorage.getItem('eduplan_events');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_EVENTS;
  });

  const [classroomProjects, setClassroomProjects] = useState<ClassroomProject[]>(() => {
    const version = localStorage.getItem('eduplan_projects_version');
    if (version !== 'v4_projects_per_grade') {
      localStorage.setItem('eduplan_projects_version', 'v4_projects_per_grade');
      localStorage.setItem('eduplan_classroom_projects_v4', JSON.stringify(INITIAL_CLASSROOM_PROJECTS));
      return INITIAL_CLASSROOM_PROJECTS;
    }
    const saved = localStorage.getItem('eduplan_classroom_projects_v4');
    return saved ? JSON.parse(saved) : INITIAL_CLASSROOM_PROJECTS;
  });

  const [dutySlots, setDutySlots] = useState<DutySlot[]>(() => {
    const saved = localStorage.getItem('eduplan_duty_slots');
    return saved ? JSON.parse(saved) : INITIAL_DUTY_SLOTS;
  });

  // Nómina de Estudiantes
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('eduplan_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS_DATA;
  });

  const [selectedRosterGrade, setSelectedRosterGrade] = useState<string>(() => {
    const saved = localStorage.getItem('eduplan_roster_grade');
    return saved || '2do Grado';
  });

  // Directorio de Colegios
  const [schools, setSchools] = useState<ExternalSchool[]>(() => {
    const saved = localStorage.getItem('eduplan_schools');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS_DATA;
  });

  // Salidas de Campo e Invitados Especiales
  const [fieldTrips, setFieldTrips] = useState<FieldTrip[]>(() => {
    const saved = localStorage.getItem('eduplan_field_trips');
    return saved ? JSON.parse(saved) : INITIAL_FIELD_TRIPS;
  });

  // Módulo de Evaluación y Calificaciones
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() => {
    const saved = localStorage.getItem('eduplan_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  // Módulo de Horarios de Clase y Eventos
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>(() => {
    const saved = localStorage.getItem('eduplan_class_schedules_v1');
    return saved ? JSON.parse(saved) : INITIAL_CLASS_SCHEDULES;
  });

  const [eventSchedules, setEventSchedules] = useState<EventSchedule[]>(() => {
    const saved = localStorage.getItem('eduplan_event_schedules_v1');
    return saved ? JSON.parse(saved) : INITIAL_EVENT_SCHEDULES;
  });

  const [selectedScheduleGrade, setSelectedScheduleGrade] = useState<string>(() => {
    const saved = localStorage.getItem('eduplan_sched_grade');
    return saved || '1er Grado';
  });

  const [selectedScheduleLapso, setSelectedScheduleLapso] = useState<string>(() => {
    const saved = localStorage.getItem('eduplan_sched_lapso');
    return saved || '3er Lapso';
  });

  const [selectedScheduleWeek, setSelectedScheduleWeek] = useState<number>(() => {
    const saved = localStorage.getItem('eduplan_sched_week');
    return saved ? parseInt(saved, 10) : 13;
  });

  // Default teacher highlighted in duty schedule (e.g. 'Carlos' based on current user)
  const [selectedDutyTeacher, setSelectedDutyTeacher] = useState<string>('Carlos');

  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem('eduplan_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('eduplan_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('eduplan_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('eduplan_competencies', JSON.stringify(competencies));
  }, [competencies]);

  useEffect(() => {
    localStorage.setItem('eduplan_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('eduplan_classroom_projects_v4', JSON.stringify(classroomProjects));
  }, [classroomProjects]);

  useEffect(() => {
    localStorage.setItem('eduplan_duty_slots', JSON.stringify(dutySlots));
  }, [dutySlots]);

  useEffect(() => {
    localStorage.setItem('eduplan_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('eduplan_roster_grade', selectedRosterGrade);
  }, [selectedRosterGrade]);

  useEffect(() => {
    localStorage.setItem('eduplan_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('eduplan_field_trips', JSON.stringify(fieldTrips));
  }, [fieldTrips]);

  useEffect(() => {
    localStorage.setItem('eduplan_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('eduplan_class_schedules_v1', JSON.stringify(classSchedules));
  }, [classSchedules]);

  useEffect(() => {
    localStorage.setItem('eduplan_event_schedules_v1', JSON.stringify(eventSchedules));
  }, [eventSchedules]);

  useEffect(() => {
    localStorage.setItem('eduplan_sched_grade', selectedScheduleGrade);
  }, [selectedScheduleGrade]);

  useEffect(() => {
    localStorage.setItem('eduplan_sched_lapso', selectedScheduleLapso);
  }, [selectedScheduleLapso]);

  useEffect(() => {
    localStorage.setItem('eduplan_sched_week', selectedScheduleWeek.toString());
  }, [selectedScheduleWeek]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('eduplan_view_mode', mode);
    if (mode === 'coordinator') {
      const coordinator = users.find((u) => u.role === 'coordinator') || users[0];
      setCurrentUser(coordinator);
      localStorage.setItem('eduplan_user', JSON.stringify(coordinator));
      addToast('Cambiaste a la Vista de Coordinación Pedagógica', 'info');
    } else {
      const teacher = users.find((u) => u.role === 'teacher') || users[1] || users[0];
      setCurrentUser(teacher);
      localStorage.setItem('eduplan_user', JSON.stringify(teacher));
      addToast('Cambiaste a la Vista del Docente', 'info');
      if (['subjects', 'schools', 'users'].includes(activeModule)) {
        setActiveModuleState('planning');
        localStorage.setItem('eduplan_active_module', 'planning');
      }
    }
  };

  const savePlan = (planData: Partial<LessonPlan> & { id?: string; weekNumber: number }) => {
    let savedPlan: LessonPlan;
    const now = new Date().toISOString();

    if (planData.id && plans.some((p) => p.id === planData.id)) {
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id === planData.id) {
            savedPlan = {
              ...p,
              ...planData,
              updatedAt: now,
            } as LessonPlan;
            return savedPlan;
          }
          return p;
        })
      );
      addToast('Planificación guardada exitosamente', 'success');
      return { ...planData, updatedAt: now } as LessonPlan;
    } else {
      const newId = `plan-w${planData.weekNumber}-${Date.now().toString().slice(-4)}`;
      savedPlan = {
        id: newId,
        teacherId: currentUser.id,
        teacherName: currentUser.fullName,
        teacherAvatar: currentUser.avatar,
        weekNumber: planData.weekNumber,
        subject: planData.subject || 'English',
        grade: planData.grade || '4to Grado',
        topic: planData.topic || '',
        status: (planData.status as PlanStatus) || 'draft',
        competencyIds: planData.competencyIds || [],
        startActivity: planData.startActivity || '',
        developmentActivity: planData.developmentActivity || '',
        closingActivity: planData.closingActivity || '',
        resources: planData.resources || '',
        observations: planData.observations || '',
        updatedAt: now,
      };
      setPlans((prev) => [...prev, savedPlan]);
      addToast('Nueva planificación creada como borrador', 'success');
      return savedPlan;
    }
  };

  const submitPlanToCoordination = (planId: string) => {
    const now = new Date().toISOString();
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return {
            ...p,
            status: 'submitted',
            submittedAt: now,
            updatedAt: now,
          };
        }
        return p;
      })
    );
    addToast('Planificación enviada a Coordinación para su revisión pedagógica.', 'success');
  };

  const reviewPlan = (planId: string, status: 'approved' | 'rejected', feedback: string) => {
    const now = new Date().toISOString();
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return {
            ...p,
            status,
            coordinatorFeedback: feedback,
            reviewedAt: now,
            updatedAt: now,
          };
        }
        return p;
      })
    );
    if (status === 'approved') {
      addToast('Planificación APROBADA satisfactoriamente.', 'success');
    } else {
      addToast('Planificación devuelta al docente con observaciones.', 'warning');
    }
  };

  const addCompetency = (competencyData: Omit<Competency, 'id'>): Competency => {
    const newComp: Competency = {
      ...competencyData,
      id: `comp-${Date.now().toString().slice(-5)}`,
    };
    setCompetencies((prev) => {
      const next = [...prev, newComp];
      localStorage.setItem('eduplan_competencies', JSON.stringify(next));
      return next;
    });
    addToast(`Competencia "${newComp.title}" agregada al banco de datos.`, 'success');
    return newComp;
  };

  const updateCompetency = (competency: Competency) => {
    setCompetencies((prev) => {
      const next = prev.map((c) => (c.id === competency.id ? competency : c));
      localStorage.setItem('eduplan_competencies', JSON.stringify(next));
      return next;
    });
    addToast(`Competencia "${competency.code}" actualizada en el banco.`, 'success');
  };

  const deleteCompetency = (id: string) => {
    setCompetencies((prev) => {
      const next = prev.filter((c) => c.id !== id);
      localStorage.setItem('eduplan_competencies', JSON.stringify(next));
      return next;
    });
    addToast('Competencia eliminada del banco.', 'info');
  };

  const addSchoolEvent = (eventData: Omit<SchoolEvent, 'id'>): SchoolEvent => {
    const newEvent: SchoolEvent = {
      ...eventData,
      id: `ev-${Date.now().toString().slice(-6)}`,
      createdBy: currentUser.id,
    };
    setEvents((prev) => [...prev, newEvent]);
    addToast(`Evento "${newEvent.title}" agregado al calendario escolar.`, 'success');
    return newEvent;
  };

  const deleteSchoolEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    addToast('Evento eliminado del calendario escolar.', 'info');
  };

  const getCompetenciesFor = (subject: string, grade: string) => {
    return competencies.filter(
      (c) =>
        c.subject.toLowerCase() === subject.toLowerCase() &&
        c.grade.toLowerCase() === grade.toLowerCase()
    );
  };

  const updateClassroomProject = (project: ClassroomProject) => {
    setClassroomProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...project, updatedAt: new Date().toISOString().split('T')[0] } : p))
    );
    addToast(`Proyecto "${project.title}" actualizado con éxito.`, 'success');
  };

  const updateClassroomProjectWeek = (projectId: string, weekData: ClassroomProjectWeek) => {
    setClassroomProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;
        const exists = project.weeks.some((w) => w.weekNumber === weekData.weekNumber);
        const newWeeks = exists
          ? project.weeks.map((w) => (w.weekNumber === weekData.weekNumber ? weekData : w))
          : [...project.weeks, weekData].sort((a, b) => a.weekNumber - b.weekNumber);
        return {
          ...project,
          weeks: newWeeks,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      })
    );
    addToast(`Semana ${weekData.weekNumber} del proyecto actualizada.`, 'success');
  };

  const addClassroomProject = (projectData: Omit<ClassroomProject, 'id' | 'updatedAt'>) => {
    const newProject: ClassroomProject = {
      ...projectData,
      id: `proj-${Date.now().toString().slice(-6)}`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setClassroomProjects((prev) => [...prev, newProject]);
    addToast(`Nuevo Proyecto de Aula "${newProject.title}" creado.`, 'success');
    return newProject;
  };

  const deleteClassroomProject = (projectId: string) => {
    setClassroomProjects((prev) => prev.filter((p) => p.id !== projectId));
    addToast('Proyecto de aula eliminado.', 'info');
  };

  const resetClassroomProjects = () => {
    setClassroomProjects(INITIAL_CLASSROOM_PROJECTS);
    localStorage.setItem('eduplan_projects_version', 'v4_projects_per_grade');
    localStorage.setItem('eduplan_classroom_projects_v4', JSON.stringify(INITIAL_CLASSROOM_PROJECTS));
    addToast('Proyectos de aula restablecidos a los 12 proyectos base.', 'success');
  };

  const clearAllClassroomProjects = () => {
    setClassroomProjects([]);
    localStorage.setItem('eduplan_classroom_projects_v4', JSON.stringify([]));
    addToast('Se han eliminado los proyectos de aula.', 'info');
  };

  const updateDutySlot = (slotId: string, assignedPerson: string) => {
    setDutySlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, assignedPerson } : slot))
    );
    addToast('Asignación de guardia actualizada.', 'success');
  };

  // Métodos de Nómina Escolar
  const addStudent = (studentData: Omit<Student, 'id' | 'orderNumber'>): Student => {
    const gradeStudents = students.filter((s) => s.grade === studentData.grade);
    const newStudent: Student = {
      ...studentData,
      id: `st-${Date.now().toString().slice(-6)}`,
      orderNumber: gradeStudents.length + 1,
    };
    setStudents((prev) => [...prev, newStudent]);
    addToast(`Estudiante "${newStudent.fullName}" agregado a la nómina de ${newStudent.grade}.`, 'success');
    return newStudent;
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    addToast(`Ficha de ${updatedStudent.fullName} actualizada.`, 'success');
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    addToast(`Estudiante ${student ? student.fullName : ''} eliminado de la nómina.`, 'info');
  };

  const toggleSociogramGroup = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const nextGroup = s.sociogramGroup === 'Grupo 1' ? 'Grupo 2' : 'Grupo 1';
          return { ...s, sociogramGroup: nextGroup };
        }
        return s;
      })
    );
    addToast('Grupo de sociograma reasignado.', 'success');
  };

  const updateCanvasStatus = (studentId: string, accepted: boolean, observation?: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            canvasAccepted: accepted,
            canvasObservations: observation !== undefined ? observation : s.canvasObservations,
            canvasStatus: accepted ? 'ready' : (s.canvasStatus || 'check_status'),
          };
        }
        return s;
      })
    );
    addToast('Estado de Canvas actualizado.', 'success');
  };

  // Métodos de Directorio de Colegios
  const addSchool = (schoolData: Omit<ExternalSchool, 'id'>): ExternalSchool => {
    const newSchool: ExternalSchool = {
      ...schoolData,
      id: `sch-${Date.now().toString().slice(-6)}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSchools((prev) => [newSchool, ...prev]);
    addToast(`Colegio "${newSchool.name}" agregado al directorio.`, 'success');
    return newSchool;
  };

  const updateSchool = (updatedSchool: ExternalSchool) => {
    setSchools((prev) =>
      prev.map((sch) => (sch.id === updatedSchool.id ? { ...updatedSchool, updatedAt: new Date().toISOString().split('T')[0] } : sch))
    );
    addToast(`Información de ${updatedSchool.name} actualizada.`, 'success');
  };

  const deleteSchool = (schoolId: string) => {
    const sch = schools.find((s) => s.id === schoolId);
    setSchools((prev) => prev.filter((s) => s.id !== schoolId));
    addToast(`Colegio ${sch ? sch.name : ''} eliminado del directorio.`, 'info');
  };

  const toggleSchoolEvent = (schoolId: string, eventKey: IntercollegiateEventKey) => {
    setSchools((prev) =>
      prev.map((sch) => {
        if (sch.id === schoolId) {
          const updatedEvents = {
            ...sch.events,
            [eventKey]: !sch.events[eventKey],
          };
          return {
            ...sch,
            events: updatedEvents,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return sch;
      })
    );
    addToast('Participación en evento actualizada.', 'success');
  };

  // Salidas de Campo e Invitados Especiales
  const addFieldTrip = (data: Omit<FieldTrip, 'id' | 'createdAt' | 'updatedAt'>): FieldTrip => {
    const today = new Date().toISOString().split('T')[0];
    const newFieldTrip: FieldTrip = {
      ...data,
      id: `ft-${Date.now().toString().slice(-6)}`,
      createdAt: today,
      updatedAt: today,
    };
    setFieldTrips((prev) => [newFieldTrip, ...prev]);
    addToast(
      `${data.type === 'salida_campo' ? 'Salida de Campo' : 'Invitado Especial'} registrada exitosamente.`,
      'success'
    );
    return newFieldTrip;
  };

  const updateFieldTrip = (updated: FieldTrip) => {
    const today = new Date().toISOString().split('T')[0];
    setFieldTrips((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...updated, updatedAt: today } : item))
    );
    addToast('Registro de Salida / Invitado actualizado correctamente.', 'success');
  };

  const deleteFieldTrip = (fieldTripId: string) => {
    setFieldTrips((prev) => prev.filter((item) => item.id !== fieldTripId));
    addToast('Registro eliminado.', 'info');
  };

  const updateFieldTripStatus = (fieldTripId: string, status: FieldTripStatus, feedback?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setFieldTrips((prev) =>
      prev.map((item) => {
        if (item.id === fieldTripId) {
          return {
            ...item,
            status,
            coordinationFeedback: feedback !== undefined ? feedback : item.coordinationFeedback,
            updatedAt: today,
          };
        }
        return item;
      })
    );

    const statusLabels: Record<FieldTripStatus, string> = {
      approved: 'Aprobada con Visto Bueno de Coordinación',
      submitted: 'Enviada a Coordinación para revisión',
      completed: 'Marcada como Realizada',
      draft: 'Regresada a Borrador',
    };
    addToast(`Estado actualizado: ${statusLabels[status] || status}`, 'success');
  };

  // Módulo de Evaluación y Calificaciones (Función pura que no muta estado durante el render)
  const getOrCreateEvaluation = (params: {
    schoolYear: string;
    grade: string;
    subject: string;
    lapso: EvaluationLapso;
    moment: EvaluationMoment;
  }): EvaluationRecord => {
    const existing = evaluations.find(
      (e) =>
        e.schoolYear === params.schoolYear &&
        e.grade.toLowerCase().trim() === params.grade.toLowerCase().trim() &&
        e.subject === params.subject &&
        e.lapso === params.lapso &&
        e.moment === params.moment
    );

    // Obtener estudiantes inscritos de la nómina oficial para este grado
    const gradeStudents = students.filter(
      (s) => s.grade.toLowerCase().trim() === params.grade.toLowerCase().trim()
    );

    if (existing) {
      // Sincronizar si hay estudiantes recién inscritos
      const existingStudentIds = new Set(existing.grades.map((g) => g.studentId));
      const missingStudents: StudentGradeEntry[] = gradeStudents
        .filter((s) => !existingStudentIds.has(s.id))
        .map((s) => ({
          studentId: s.id,
          studentName: s.fullName,
          schoolId: s.schoolId,
          orderNumber: s.orderNumber,
          gradeValue: undefined,
          adaptation: 'regular',
          observations: '',
          updatedAt: new Date().toISOString().split('T')[0],
        }));

      if (missingStudents.length > 0) {
        const mergedGrades = [...existing.grades, ...missingStudents].sort(
          (a, b) => a.orderNumber - b.orderNumber
        );
        return { ...existing, grades: mergedGrades };
      }
      return existing;
    }

    // Si no existe, retornar un nuevo borrador con la nómina de estudiantes del grado
    const initialGrades: StudentGradeEntry[] = gradeStudents.map((s) => ({
      studentId: s.id,
      studentName: s.fullName,
      schoolId: s.schoolId,
      orderNumber: s.orderNumber,
      gradeValue: undefined,
      adaptation: 'regular',
      observations: '',
      updatedAt: new Date().toISOString().split('T')[0],
    }));

    const momentLabels: Record<EvaluationMoment, string> = {
      mensual_1: 'Mensual I',
      mensual_2: 'Mensual II',
      mensual_3: 'Mensual III',
      examen_lapso: 'Examen de Lapso',
    };

    const cleanGrade = params.grade.replace(/\s+/g, '_');
    const cleanSubject = params.subject.replace(/\s+/g, '_');
    const deterministicId = `eval-${params.schoolYear}-${cleanGrade}-${cleanSubject}-${params.lapso}-${params.moment}`;

    const newRecord: EvaluationRecord = {
      id: deterministicId,
      schoolYear: params.schoolYear,
      grade: params.grade,
      subject: params.subject,
      lapso: params.lapso,
      moment: params.moment,
      title: `Evaluación ${momentLabels[params.moment] || params.moment}: ${params.subject}`,
      teacherId: currentUser.id,
      teacherName: currentUser.fullName,
      status: 'draft',
      grades: initialGrades,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    return newRecord;
  };

  const saveEvaluationRecord = (record: EvaluationRecord, silent = false): EvaluationRecord => {
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...record, updatedAt: today };

    setEvaluations((prev) => {
      const exists = prev.some((e) => e.id === record.id);
      if (exists) {
        return prev.map((e) => (e.id === record.id ? updated : e));
      }
      return [updated, ...prev];
    });

    if (!silent) {
      addToast('Planilla de evaluación guardada con éxito', 'success');
    }
    return updated;
  };

  const updateStudentGrade = (
    evalId: string,
    studentId: string,
    updates: Partial<StudentGradeEntry>
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setEvaluations((prev) =>
      prev.map((item) => {
        if (item.id === evalId) {
          const updatedGrades = item.grades.map((g) => {
            if (g.studentId === studentId) {
              return { ...g, ...updates, updatedAt: today };
            }
            return g;
          });
          return {
            ...item,
            grades: updatedGrades,
            updatedAt: today,
          };
        }
        return item;
      })
    );
  };

  const setEvaluationStatus = (
    evalId: string,
    status: EvaluationStatus,
    auditNotes?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setEvaluations((prev) =>
      prev.map((item) => {
        if (item.id === evalId) {
          return {
            ...item,
            status,
            auditedBy: status === 'audited' ? currentUser.fullName : item.auditedBy,
            auditedAt:
              status === 'audited'
                ? `${today} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : item.auditedAt,
            auditNotes: auditNotes !== undefined ? auditNotes : item.auditNotes,
            updatedAt: today,
          };
        }
        return item;
      })
    );

    const labels: Record<EvaluationStatus, string> = {
      draft: 'Evaluación regresada a Borrador (edición habilitada)',
      submitted: 'Evaluación Consolidada y enviada a Coordinación para auditoría',
      audited: 'Evaluación Auditada y Certificada con Visto Bueno de Coordinación',
    };
    addToast(labels[status] || 'Estado de evaluación actualizado', 'success');
  };

  const deleteEvaluationRecord = (evalId: string) => {
    setEvaluations((prev) => prev.filter((e) => e.id !== evalId));
    addToast('Registro de evaluación eliminado', 'info');
  };

  const updateScheduleCell = ({
    grade,
    lapso,
    weekNumber,
    day,
    timeSlot,
    cell,
  }: {
    grade: string;
    lapso: string;
    weekNumber: number;
    day: ScheduleDay;
    timeSlot: string;
    cell: ClassScheduleCell;
  }) => {
    const cellKey = `${day}_${timeSlot}`;
    const today = new Date().toISOString().split('T')[0];

    setClassSchedules((prev) => {
      const existingIndex = prev.findIndex(
        (s) => (s.schoolYear || CURRENT_SCHOOL_YEAR) === selectedSchoolYear && s.grade === grade && s.lapso === lapso && s.weekNumber === weekNumber
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const sched = { ...updated[existingIndex] };
        sched.cells = {
          ...sched.cells,
          [cellKey]: {
            ...cell,
            category: cell.category || detectSubjectCategory(cell.subject),
          },
        };
        sched.updatedAt = today;
        sched.updatedBy = currentUser.fullName;
        updated[existingIndex] = sched;
        return updated;
      } else {
        // Fallback: look for prior week or another week of the same grade as template
        const baseTemplate = prev.find(
          (s) => (s.schoolYear || CURRENT_SCHOOL_YEAR) === selectedSchoolYear && s.grade === grade
        );
        const newSched: ClassSchedule = {
          id: `sched-${grade.replace(/\s+/g, '-').toLowerCase()}-${lapso.replace(/\s+/g, '-').toLowerCase()}-w${weekNumber}-${selectedSchoolYear}-${Date.now()}`,
          schoolYear: selectedSchoolYear,
          grade,
          lapso,
          weekNumber,
          isSaved: true,
          updatedAt: today,
          updatedBy: currentUser.fullName,
          cells: {
            ...(baseTemplate ? baseTemplate.cells : {}),
            [cellKey]: {
              ...cell,
              category: cell.category || detectSubjectCategory(cell.subject),
            },
          },
        };
        return [...prev, newSched];
      }
    });

    addToast(`Horario modificado: ${day} (${timeSlot}) → ${cell.subject}`, 'success');
  };

  const saveClassSchedule = (schedule: ClassSchedule) => {
    const today = new Date().toISOString().split('T')[0];
    const targetYear = schedule.schoolYear || selectedSchoolYear;
    const schedWithMeta: ClassSchedule = {
      ...schedule,
      schoolYear: targetYear,
      isSaved: true,
      updatedAt: today,
      updatedBy: currentUser.fullName,
    };
    setClassSchedules((prev) => {
      const idx = prev.findIndex(
        (s) =>
          s.id === schedule.id ||
          ((s.schoolYear || CURRENT_SCHOOL_YEAR) === targetYear &&
            s.grade === schedule.grade &&
            s.lapso === schedule.lapso &&
            s.weekNumber === schedule.weekNumber)
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = schedWithMeta;
        return updated;
      }
      return [...prev, schedWithMeta];
    });
    addToast(`Horario de ${schedule.grade} (Semana ${schedule.weekNumber}) guardado exitosamente`, 'success');
  };

  const saveWeekClassSchedule = (params: {
    schoolYear?: string;
    grade: string;
    lapso: string;
    weekNumber: number;
    cells: Record<string, ClassScheduleCell>;
    notes?: string;
    basedOnWeekNumber?: number;
  }): ClassSchedule => {
    const targetYear = params.schoolYear || selectedSchoolYear;
    const today = new Date().toISOString().split('T')[0];

    const existingIdx = classSchedules.findIndex(
      (s) =>
        (s.schoolYear || CURRENT_SCHOOL_YEAR) === targetYear &&
        s.grade === params.grade &&
        s.lapso === params.lapso &&
        s.weekNumber === params.weekNumber
    );

    const recordToSave: ClassSchedule = {
      id:
        existingIdx >= 0
          ? classSchedules[existingIdx].id
          : `sched-${params.grade.replace(/\s+/g, '-').toLowerCase()}-${params.lapso.replace(/\s+/g, '-').toLowerCase()}-w${params.weekNumber}-${targetYear}-${Date.now()}`,
      schoolYear: targetYear,
      grade: params.grade,
      lapso: params.lapso,
      weekNumber: params.weekNumber,
      cells: { ...params.cells },
      notes: params.notes || (existingIdx >= 0 ? classSchedules[existingIdx].notes : undefined),
      isSaved: true,
      basedOnWeekNumber: params.basedOnWeekNumber,
      updatedAt: today,
      updatedBy: currentUser.fullName,
    };

    setClassSchedules((prev) => {
      const idx = prev.findIndex(
        (s) =>
          (s.schoolYear || CURRENT_SCHOOL_YEAR) === targetYear &&
          s.grade === params.grade &&
          s.lapso === params.lapso &&
          s.weekNumber === params.weekNumber
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = recordToSave;
        return updated;
      }
      return [...prev, recordToSave];
    });

    addToast(`Horario de Semana ${params.weekNumber} (${params.grade}) guardado para el Año ${targetYear}`, 'success');
    return recordToSave;
  };

  const copyScheduleFromWeek = ({
    targetLapso,
    targetWeek,
    sourceLapso,
    sourceWeek,
    grade,
  }: {
    targetLapso: string;
    targetWeek: number;
    sourceLapso: string;
    sourceWeek: number;
    grade: string;
  }) => {
    const sourceSched = classSchedules.find(
      (s) =>
        (s.schoolYear || CURRENT_SCHOOL_YEAR) === selectedSchoolYear &&
        s.grade === grade &&
        s.lapso === sourceLapso &&
        s.weekNumber === sourceWeek
    );

    if (!sourceSched) {
      addToast(`No se encontró horario base en Semana ${sourceWeek} (${sourceLapso}) para ${grade}`, 'warning');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    setClassSchedules((prev) => {
      const existingIdx = prev.findIndex(
        (s) =>
          (s.schoolYear || CURRENT_SCHOOL_YEAR) === selectedSchoolYear &&
          s.grade === grade &&
          s.lapso === targetLapso &&
          s.weekNumber === targetWeek
      );

      const targetSched: ClassSchedule = {
        id: existingIdx >= 0
          ? prev[existingIdx].id
          : `sched-${grade.replace(/\s+/g, '-').toLowerCase()}-${targetLapso.replace(/\s+/g, '-').toLowerCase()}-w${targetWeek}-${selectedSchoolYear}-${Date.now()}`,
        schoolYear: selectedSchoolYear,
        grade,
        lapso: targetLapso,
        weekNumber: targetWeek,
        cells: { ...sourceSched.cells },
        notes: `Copiado de Semana ${sourceWeek} (${sourceLapso})`,
        isSaved: true,
        basedOnWeekNumber: sourceWeek,
        updatedAt: today,
        updatedBy: currentUser.fullName,
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = targetSched;
        return updated;
      }
      return [...prev, targetSched];
    });

    addToast(`Horario de Semana ${sourceWeek} aplicado a Semana ${targetWeek} (${grade})`, 'success');
  };

  const addEventSchedule = (eventData: Omit<EventSchedule, 'id' | 'createdAt' | 'updatedAt'>): EventSchedule => {
    const today = new Date().toISOString().split('T')[0];
    const newEvent: EventSchedule = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: today,
      updatedAt: today,
    };
    setEventSchedules((prev) => [newEvent, ...prev]);
    addToast(`Horario de evento "${newEvent.title}" creado con éxito`, 'success');
    return newEvent;
  };

  const updateEventSchedule = (event: EventSchedule) => {
    const today = new Date().toISOString().split('T')[0];
    setEventSchedules((prev) =>
      prev.map((e) => (e.id === event.id ? { ...event, updatedAt: today } : e))
    );
    addToast(`Horario de evento "${event.title}" actualizado`, 'success');
  };

  const deleteEventSchedule = (id: string) => {
    setEventSchedules((prev) => prev.filter((e) => e.id !== id));
    addToast('Horario de evento eliminado', 'info');
  };

  const resetClassSchedules = () => {
    setClassSchedules(INITIAL_CLASS_SCHEDULES);
    setEventSchedules(INITIAL_EVENT_SCHEDULES);
    localStorage.removeItem('eduplan_class_schedules_v1');
    localStorage.removeItem('eduplan_event_schedules_v1');
    addToast('Horarios restablecidos a los valores base institucionales', 'info');
  };

  // Autenticación con Google via Supabase OAuth
  const loginWithGoogleHandler = async (): Promise<boolean> => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      // Supabase OAuth initiates a redirect — the session is picked up
      // automatically by onAuthStateChange when the user returns.
      await signInWithGoogle();
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error al autenticar con Google.';
      setAuthError(errorMsg);
      addToast(errorMsg, 'warning');
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logoutHandler = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setIsLoggedInWithGoogle(false);
    addToast('Sesión de Google cerrada.', 'info');
  };

  // Gestión de Usuarios por Coordinación
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const newId = `u-${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: newId,
      createdAt: new Date().toISOString(),
      status: userData.status || 'active',
      email: userData.email.toLowerCase().trim(),
    };
    const updated = [newUser, ...users];
    setUsers(updated);
    localStorage.setItem('eduplan_users_list', JSON.stringify(updated));
    await upsertUser(mapUserToDb(newUser));
    addToast(`Docente/Usuario '${newUser.fullName}' registrado. El correo '${newUser.email}' ya tiene autorización de acceso con Google.`, 'success');
    return newUser;
  };

  const updateUser = async (user: User): Promise<void> => {
    const cleanUser: User = {
      ...user,
      email: user.email.toLowerCase().trim(),
    };
    const updated = users.map((u) => (u.id === cleanUser.id ? cleanUser : u));
    setUsers(updated);
    localStorage.setItem('eduplan_users_list', JSON.stringify(updated));
    if (currentUser.id === cleanUser.id) {
      setCurrentUser(cleanUser);
      localStorage.setItem('eduplan_user', JSON.stringify(cleanUser));
    }
    await upsertUser(mapUserToDb(cleanUser));
    addToast(`Perfil de '${cleanUser.fullName}' actualizado.`, 'success');
  };

  const deleteUser = async (userId: string): Promise<void> => {
    const target = users.find((u) => u.id === userId);
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    localStorage.setItem('eduplan_users_list', JSON.stringify(updated));
    await removeUser(userId);
    addToast(`Usuario '${target?.fullName || userId}' revocado de los accesos autorizados.`, 'info');
  };

  // Gestión de Asignaturas Dinámicas por Coordinación
  const addSubject = async (subjectData: Omit<AcademicSubject, 'id' | 'createdAt'>): Promise<AcademicSubject> => {
    const newId = `sub-${Date.now()}`;
    const newSubject: AcademicSubject = {
      ...subjectData,
      id: newId,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    localStorage.setItem('eduplan_academic_subjects', JSON.stringify(updated));
    await upsertSubject(mapSubjectToDb(newSubject));
    addToast(`Asignatura '${newSubject.name}' agregada al pensum institucional. Disponible en toda la plataforma.`, 'success');
    return newSubject;
  };

  const updateSubject = async (subject: AcademicSubject): Promise<void> => {
    const updated = subjects.map((s) => (s.id === subject.id ? subject : s));
    setSubjects(updated);
    localStorage.setItem('eduplan_academic_subjects', JSON.stringify(updated));
    await upsertSubject(mapSubjectToDb(subject));
    addToast(`Asignatura '${subject.name}' actualizada.`, 'success');
  };

  const deleteSubject = async (subjectId: string): Promise<void> => {
    const target = subjects.find((s) => s.id === subjectId);
    const updated = subjects.filter((s) => s.id !== subjectId);
    setSubjects(updated);
    localStorage.setItem('eduplan_academic_subjects', JSON.stringify(updated));
    await removeSubject(subjectId);
    addToast(`Asignatura '${target?.name || subjectId}' eliminada del pensum.`, 'info');
  };

  const contextValue = useMemo(() => ({
    currentUser,
    setCurrentUser,
    viewMode,
    setViewMode,
    activeModule,
    setActiveModule,
    plans,
    competencies,
    selectedWeek,
    setSelectedWeek,
    events,
    addSchoolEvent,
    deleteSchoolEvent,
    classroomProjects,
    updateClassroomProject,
    updateClassroomProjectWeek,
    addClassroomProject,
    deleteClassroomProject,
    resetClassroomProjects,
    clearAllClassroomProjects,
    dutySlots,
    updateDutySlot,
    selectedDutyTeacher,
    setSelectedDutyTeacher,
    students,
    selectedRosterGrade,
    setSelectedRosterGrade,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleSociogramGroup,
    updateCanvasStatus,
    schools,
    addSchool,
    updateSchool,
    deleteSchool,
    toggleSchoolEvent,
    fieldTrips,
    addFieldTrip,
    updateFieldTrip,
    deleteFieldTrip,
    updateFieldTripStatus,
    currentSchoolYear: CURRENT_SCHOOL_YEAR,
    selectedSchoolYear,
    setSelectedSchoolYear,
    availableSchoolYears: AVAILABLE_SCHOOL_YEARS,
    isViewingHistoricalYear,
    evaluations,
    saveEvaluationRecord,
    updateStudentGrade,
    setEvaluationStatus,
    deleteEvaluationRecord,
    getOrCreateEvaluation,
    classSchedules,
    eventSchedules,
    selectedScheduleGrade,
    setSelectedScheduleGrade,
    selectedScheduleLapso,
    setSelectedScheduleLapso,
    selectedScheduleWeek,
    setSelectedScheduleWeek,
    updateScheduleCell,
    saveClassSchedule,
    saveWeekClassSchedule,
    copyScheduleFromWeek,
    addEventSchedule,
    updateEventSchedule,
    deleteEventSchedule,
    resetClassSchedules,
    toasts,
    addToast,
    removeToast,
    savePlan,
    submitPlanToCoordination,
    reviewPlan,
    addCompetency,
    updateCompetency,
    deleteCompetency,
    getCompetenciesFor,
    users,
    addUser,
    updateUser,
    deleteUser,
    loginWithGoogleHandler,
    logoutHandler,
    authError,
    clearAuthError,
    isAuthLoading,
    isLoggedInWithGoogle,
    subjects,
    availableSubjectNames,
    addSubject,
    updateSubject,
    deleteSubject,
    availableGradeNames,
    addGrade,
    deleteGrade,
  }), [
    currentUser,
    viewMode,
    activeModule,
    plans,
    competencies,
    selectedWeek,
    events,
    classroomProjects,
    dutySlots,
    selectedDutyTeacher,
    students,
    selectedRosterGrade,
    schools,
    fieldTrips,
    selectedSchoolYear,
    isViewingHistoricalYear,
    evaluations,
    classSchedules,
    eventSchedules,
    selectedScheduleGrade,
    selectedScheduleLapso,
    selectedScheduleWeek,
    toasts,
    users,
    authError,
    isAuthLoading,
    isLoggedInWithGoogle,
    subjects,
    availableSubjectNames,
    availableGradeNames,
    customGrades,
  ]);

  return (
    <EduPlanContext.Provider value={contextValue}>
      {children}
    </EduPlanContext.Provider>
  );
};

export const useEduPlan = () => {
  const context = useContext(EduPlanContext);
  if (!context) {
    throw new Error('useEduPlan debe usarse dentro de EduPlanProvider');
  }
  return context;
};
