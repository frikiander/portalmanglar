export type UserRole = 'teacher' | 'coordinator';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  specialty?: string;
  schoolGrade?: string;
  assignedGrades?: string[];
  assignedSections?: string[];
  assignedSubjects?: string[];
  phone?: string;
  status?: 'active' | 'inactive';
  authUid?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Competency {
  id: string;
  code?: string;
  title: string;
  subject: string;
  grade: string;
  category: 'Ser' | 'Saber' | 'Hacer' | 'Convivir';
  description?: string;
  indicators: string[];
}

export type PlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface LessonPlan {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  weekNumber: number;
  subject: string;
  grade: string;
  section?: string;
  topic: string;
  status: PlanStatus;
  competencyIds: string[];
  startActivity: string;
  developmentActivity: string;
  closingActivity: string;
  resources: string;
  observations?: string;
  coordinatorFeedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
  updatedAt: string;
}

export type NavigationModule =
  | 'planning'
  | 'calendar'
  | 'schedules'
  | 'projects'
  | 'evaluations'
  | 'roster'
  | 'field_trips'
  | 'duties'
  | 'subjects'
  | 'schools'
  | 'users';

export type ViewMode = 'teacher' | 'coordinator';

export interface SchoolEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  category: 'academic' | 'civic' | 'sports' | 'cultural' | 'holiday';
  description?: string;
  isImportant?: boolean;
}

export interface ClassroomProjectWeek {
  weekNumber: number;
  title: string;
  phase: 'Diagnóstico e Indagación' | 'Desarrollo de Experiencias' | 'Socialización y Cierre';
  guidingQuestion: string;
  suggestedActivities: string[];
  keyCompetencies: string[];
  resources: string[];
  assessmentFocus: string;
  weeklyGoal?: string;
}

export interface ClassroomProject {
  id: string;
  grade: string;
  title: string;
  theme: string;
  lapso: '1er Lapso' | '2do Lapso' | '3er Lapso';
  status: 'active' | 'completed' | 'draft';
  problemStatement: string;
  generalObjective: string;
  integratedSubjects: string[];
  finalProduct: string;
  weeks: ClassroomProjectWeek[];
  startDate?: string;
  endDate?: string;
  updatedAt?: string;
}

export interface DutySlot {
  id: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  timeSlot: '7:00 - 7:30 (Entrada)' | '9:30 - 10:00 (Recreo 1)' | '11:45 - 12:15 (Recreo 2 / Salida)';
  zone: 'Portón Principal' | 'Patio Central / Cancha' | 'Comedor / Pasillo Primaria' | 'Zona de Juegos';
  assignedPerson?: string;
}

export interface Student {
  id: string;
  orderNumber: number;
  fullName: string;
  idCardNumber?: string;
  birthDate?: string;
  gender: 'M' | 'F';
  grade: string;
  section: string;
  representativeName?: string;
  representativeIdCard?: string;
  parentPhone?: string;
  parentEmail?: string;
  medicalConditions?: string;
  allergies?: string;
  address?: string;
  notes?: string;
  siblingIds?: string[];
  canvasAccepted?: boolean;
  canvasObservation?: string;
}

export type IntercollegiateEventKey =
  | 'spelling_bee'
  | 'science_fair'
  | 'math_olympiad'
  | 'debate_club'
  | 'chess_tournament'
  | 'sports_fest';

export interface ExternalSchool {
  id: string;
  name: string;
  code?: string;
  city: string;
  state: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  isConfirmedForIntercollegiate?: boolean;
  confirmedEvents?: IntercollegiateEventKey[];
  notes?: string;
}

export type FieldTripStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';

export interface FieldTrip {
  id: string;
  title: string;
  type: 'field_trip' | 'special_guest';
  grade: string;
  section: string;
  subject: string;
  destinationOrGuestName: string;
  proposedDate: string;
  departureTime?: string;
  returnTime?: string;
  learningObjectives: string;
  estimatedCostPerStudent?: number;
  transportDetails?: string;
  status: FieldTripStatus;
  teacherId: string;
  teacherName: string;
  coordinatorFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export type EvaluationMoment = 'Evaluación Formativa' | 'Evaluación Sumativa' | 'Rendimiento Global';
export type EvaluationLapso = '1er Lapso' | '2do Lapso' | '3er Lapso';
export type EvaluationStatus = 'draft' | 'submitted' | 'reviewed';

export interface StudentGradeEntry {
  studentId: string;
  qualitativeScore?: string;
  literalGrade?: 'A' | 'B' | 'C' | 'D' | 'E';
  numericGrade?: number;
  observations?: string;
}

export interface EvaluationRecord {
  id: string;
  schoolYear: string;
  grade: string;
  subject: string;
  lapso: EvaluationLapso;
  moment: EvaluationMoment;
  title: string;
  date?: string;
  status: EvaluationStatus;
  teacherId: string;
  teacherName: string;
  auditNotes?: string;
  grades: StudentGradeEntry[];
  updatedAt: string;
}

export type ScheduleDay = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export interface ClassScheduleCell {
  subject: string;
  teacherName?: string;
  room?: string;
  color?: string;
  category?: 'academic' | 'idiomas' | 'especiales' | 'rutinas' | 'otro';
}

export interface ClassSchedule {
  id: string;
  schoolYear: string;
  grade: string;
  lapso: string;
  weekNumber: number;
  isSaved?: boolean;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
  cells: Record<string, ClassScheduleCell>;
}

export interface EventSchedule {
  id: string;
  schoolYear: string;
  grade: string;
  lapso: string;
  weekNumber: number;
  day: ScheduleDay;
  timeSlot: string;
  title: string;
  location?: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export interface AcademicSubject {
  id: string;
  name: string;
  category: 'academic' | 'idiomas' | 'especiales' | 'rutinas' | 'otro';
  code?: string;
  description?: string;
  applicableGrades?: string[];
  color?: string;
  isCustom?: boolean;
  createdAt?: string;
}
