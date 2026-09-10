export type UserRole = 'teacher' | 'coordinator';

export type PlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  specialty?: string;
  schoolGrade?: string;
  assignedGrades?: string[];
  assignedSections?: string[];
  assignedSubjects?: string[];
  status?: 'active' | 'inactive';
  phone?: string;
  authUid?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AcademicSubject {
  id: string;
  name: string;
  category: SubjectCategory;
  code?: string;
  description?: string;
  applicableGrades?: string[];
  color?: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface Competency {
  id: string;
  subject: string;
  grade: string;
  code: string;
  title: string;
  category: string;
  indicators: string[]; // Indicadores asociados a la competencia
  description?: string; // Obsoleto - no requerido
}

export interface LessonPlan {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  weekNumber: number; // 1 to 15
  subject: string;
  grade: string;
  topic: string;
  status: PlanStatus;
  competencyIds: string[];
  selectedIndicators?: Record<string, string[]>; // Indicadores seleccionados por competencia (por defecto todos, destildables)
  startActivity: string;       // Inicio
  developmentActivity: string; // Desarrollo
  closingActivity: string;     // Cierre
  resources: string;           // Recursos
  observations: string;        // Observaciones
  coordinatorFeedback?: string; // Retroalimentación del coordinador
  submittedAt?: string;
  reviewedAt?: string;
  updatedAt: string;
}

export type ViewMode = 'teacher' | 'coordinator';

export type NavigationModule = 
  | 'planning' 
  | 'calendar' 
  | 'projects' 
  | 'field_trips' 
  | 'duties' 
  | 'roster' 
  | 'schools' 
  | 'evaluations' 
  | 'schedules' 
  | 'users' 
  | 'subjects';

export type FieldTripType = 'salida_campo' | 'invitado_especial';

export type FieldTripStatus = 'draft' | 'submitted' | 'approved' | 'completed';

export interface FieldTripFocus {
  socialResponsibility: boolean; // RESPONSABILIDAD SOCIAL
  citizenParticipation: boolean; // PARTICIPACIÓN CIUDADANA
  nationalIdentity: boolean;     // IDENTIDAD NACIONAL
  introspection: boolean;        // INTROSPECCIÓN
}

export interface FieldTrip {
  id: string;
  type: FieldTripType;
  grade: string;               // ej. '6to Grado', 'Francés', '1er Grado', '5to Grado'
  lapso: string;               // '1er Lapso' | '2do Lapso' | '3er Lapso'
  weekNumber: number;          // ej. 8
  lapsoSemanaLabel?: string;   // ej. "1/8"
  date: string;                // YYYY-MM-DD o DD/MM/AAAA
  
  // Antes del paseo o invitado
  destinationOrGuest: string;  // Destino / Invitado
  allianceName?: string;       // Nombre de la alianza o contacto
  contactPhone?: string;       // Número de contacto telefónico
  alliancesOrContacts: string; // Alianzas / contactos (resumen consolidado)
  purpose: string;             // Tema / Propósito pedagógico
  subjectOrContext: string;    // Contexto del proyecto
  projectId?: string;          // ID del proyecto de aula IPC/DIEV asociado
  responsibleTeacher: string;  // Docente responsable
  chaperoneTeachers?: string;  // Docentes acompañantes
  resources?: string;          // Recursos (ej. Unidad de transporte, biblioteca)
  
  // Enfoques Relacionados (Pilares Institucionales El Manglar)
  focus: FieldTripFocus;
  
  // Metodología y Aprendizajes
  methodology: string;         // ¿CÓMO? (Desarrollo vivencial de la experiencia)
  keyLearnings?: string;       // Aprendizajes claves
  observations?: string;       // Observaciones
  chaperoneParents?: string;   // Representantes acompañantes
  
  // Gestión de Coordinación
  status: FieldTripStatus;
  coordinationFeedback?: string;
  transportRequired?: boolean;
  createdAt?: string;
  updatedAt: string;
}

export type StudentCondition = 'Regular' | 'NUEVO';

export type CanvasStatus = 
  | 'ready'            // Tiene todos sus módulos listos
  | 'check_status'    // Chequear status / si aceptaron
  | 'send_invitation' // Enviarle la invitación
  | 'no_email'        // No tiene correo
  | 'resent_invite';  // Se reenvió la invitación

export interface Student {
  id: string;
  orderNumber: number;
  fullName: string;            // Apellidos y Nombres
  email?: string;              // Correo alumno
  birthPlace?: string;         // Lugar de Nacimiento (ej. Florida, Diego Bautista Urbaneja)
  birthState?: string;         // Estado / País (ej. Estados Unidos, Anzoátegui, República de China)
  birthDate?: string;          // Fecha de Nacimiento (ej. 18/05/2018 o YYYY-MM-DD)
  schoolId: string;            // Cédula Escolar Niño(a)
  condition: StudentCondition; // Regular | NUEVO
  siblings?: string;           // Hermanos en la institución (ej. '3er Grado', 'PREMATERNAL')
  
  // Familias (Padre y Madre)
  motherName?: string;
  motherPhone?: string;
  motherEmail?: string;
  motherId?: string;           // C.I. Madre
  
  fatherName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  fatherId?: string;           // C.I. Padre
  
  homeOfficePhone?: string;    // Telf. Habit. / Oficina
  
  // Plataforma Canvas LMS
  canvasAccepted: boolean;     // Aceptó invitación
  canvasPassword?: string;     // Contraseña en Canvas Instructure (ej. 12345678)
  canvasObservations?: string; // Observaciones de Canvas
  canvasStatus?: CanvasStatus; // Estado clasificado para badges y filtros

  // Sociograma / Dinámica de Grupos
  sociogramGroup?: 'Grupo 1' | 'Grupo 2';
  grade: string;               // ej. '1er Grado', '2do Grado', etc.
}

export type CalendarViewType = 'day' | 'week' | 'month' | 'year';

export type EventType = 'planning_deadline' | 'meeting' | 'academic' | 'exam' | 'holiday';

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  endDate?: string;
  startTime?: string;
  endTime?: string;
  targetRole?: 'all' | 'teachers' | 'coordinators';
  createdBy?: string;
}

export type ClassroomProjectType = 'IPC' | 'DIEV';

export interface ProjectResourceLink {
  label?: string;
  url: string;
}

export interface ClassroomProjectWeek {
  weekNumber: number;
  title?: string;
  content: string;
  englishContent?: string;
  links?: ProjectResourceLink[];
  milestone?: string; // ej. 'Evaluaciones mensuales', 'Salida de campo', 'Cierre de proyecto'
}

export interface ClassroomProject {
  id: string;
  type: ClassroomProjectType; // IPC: Interés por el Conocimiento | DIEV: Desarrollo Integral, Ética y Valores
  grade: string; // ej. '6to Grado', '4to Grado'
  lapso: string; // '1er Lapso' | '2do Lapso' | '3er Lapso'
  promoCohort?: string; // ej. 'Promo XVIII'
  title: string;
  purpose: string;
  weeks: ClassroomProjectWeek[];
  updatedAt: string;
}

// ==========================================
// HORARIOS DE GUARDIAS ESCOLARES (DUTY SCHEDULES)
// ==========================================
export type DutyDay = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export type DutyCategory = 
  | 'entrada_salida'       // Guardias de Entrada y Salida
  | 'recesos_primaria'     // Guardia Recesos Primaria
  | 'bachillerato'         // Guardias Bachillerato
  | 'turnos_primaria'      // Turnos Recesos de Primaria
  | 'uso_canchas';         // Distribución de Uso de Canchas

export interface DutySlot {
  id: string;
  day: DutyDay;
  timeSlot: string;       // ej. '7:00 am a 7:25 am', '3:30 pm', '9:30 am a 10:00 am'
  location: string;       // ej. 'Puerta cancha', 'Patio techado', 'Integralidad', 'Cancha futbol'
  assignedPerson: string; // ej. 'Carlos', 'Jhon', 'Patricia P', 'Alain'
  category: DutyCategory;
  note?: string;
}

export interface DutyGradeSlot {
  day: DutyDay;
  timeSlot: string;
  location: string;
  assignedGrade: string;  // ej. 'Cuarto grado', 'Tercero', 'Segundo y Tercero'
}

// ==========================================
// DIRECTORIO DE COLEGIOS Y EVENTOS INTERCOLEGIALES
// ==========================================
export type IntercollegiateEventKey = 'futbol' | 'beachtennis' | 'spelling_bee' | 'deletreo_espanol' | 'ajedrez';

export interface IntercollegiateEventsRecord {
  futbol: boolean;             // Interescolar fútbol
  beachtennis: boolean;        // Beachtennis
  spelling_bee: boolean;       // Spelling bee
  deletreo_espanol: boolean;   // Deletreo español
  ajedrez: boolean;            // Ajedrez
}

export interface ExternalSchool {
  id: string;
  name: string;
  emails: string[];
  contactName?: string;
  contactPhone?: string;
  secondaryContact?: string;
  events: IntercollegiateEventsRecord;
  notes?: string;
  updatedAt?: string;
}

// ==========================================
// MÓDULO DE EVALUACIÓN Y NOTAS
// ==========================================
export type GradeScale = 'A' | 'B' | 'C' | 'D' | 'E' | 'SE';

export type TestAdaptationType = 'regular' | 'AC+' | 'AC-';

export type EvaluationMoment = 'mensual_1' | 'mensual_2' | 'mensual_3' | 'examen_lapso';

export type EvaluationLapso = '1er Lapso' | '2do Lapso' | '3er Lapso';

export type EvaluationStatus = 'draft' | 'submitted' | 'audited';

export interface StudentGradeEntry {
  studentId: string;
  studentName: string;
  schoolId: string;
  orderNumber: number;
  gradeValue?: GradeScale;
  adaptation: TestAdaptationType;
  observations?: string;
  updatedAt?: string;
}

export interface EvaluationRecord {
  id: string;
  schoolYear: string;           // ej. '2025-2026'
  grade: string;                // ej. '2do Grado'
  subject: string;              // ej. 'Matemática'
  lapso: EvaluationLapso;       // '1er Lapso' | '2do Lapso' | '3er Lapso'
  moment: EvaluationMoment;     // 'mensual_1' | 'mensual_2' | 'mensual_3' | 'examen_lapso'
  title?: string;               // ej. 'Evaluación Mensual I: Propiedades de la Adición y Multiplicación'
  teacherId: string;
  teacherName: string;
  status: EvaluationStatus;     // 'draft' | 'submitted' | 'audited'
  grades: StudentGradeEntry[];
  auditedBy?: string;
  auditedAt?: string;
  auditNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MÓDULO DE HORARIOS ESCOLARES Y DE EVENTOS
// ==========================================
export type ScheduleDay = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

export type SubjectCategory = 
  | 'lengua' 
  | 'matematica' 
  | 'ingles' 
  | 'ciencia' 
  | 'sociales' 
  | 'deporte' 
  | 'especiales' 
  | 'proyecto' 
  | 'rutina' 
  | 'recreo'
  | 'otro';

export interface ClassScheduleCell {
  subject: string;
  secondarySubject?: string;
  teacher?: string;
  teacherName?: string;
  room?: string;
  classroom?: string;
  category?: SubjectCategory;
  note?: string;
  variationNote?: string;
  isVariation?: boolean;
  hasVariation?: boolean;
}

export interface ClassSchedule {
  id: string;
  schoolYear: string; // ej. '2025-2026'
  grade: string; // ej. '1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'
  lapso: string; // '1er Lapso' | '2do Lapso' | '3er Lapso'
  weekNumber: number; // 1 a 15+
  // key: `${day}_${timeSlot}`
  cells: Record<string, ClassScheduleCell>;
  notes?: string;
  isSaved?: boolean;
  basedOnWeekNumber?: number;
  updatedAt: string;
  updatedBy?: string;
}

export type EventScheduleType = 'academic' | 'sports' | 'cultural' | 'institutional' | 'other';

export interface EventScheduleItem {
  id: string;
  time: string;
  activity: string;
  responsible?: string;
  location?: string;
}

export interface EventScheduleSlot {
  id: string;
  day: ScheduleDay;
  time: string; // ej. '8:00 - 9:30'
  activity: string; // ej. 'Montaje de Stands y Paneles Científicos'
  location?: string; // ej. 'Cancha Techada'
  responsiblePerson?: string; // ej. 'Coord. Académica + Docentes de Ciencias'
  targetGrades: string[]; // ['1er Grado', '2do Grado'] o ['Todos']
  badgeColor?: string;
  notes?: string;
}

export interface EventSchedule {
  id: string;
  schoolYear?: string; // ej. '2025-2026'
  title: string; // ej. 'Horario Especial: Cierre de Proyecto y Eco-Feria Verde'
  description: string;
  lapso?: string; // '1er Lapso' | '2do Lapso' | '3er Lapso'
  weekNumber?: number; // ej. 13
  dateRange?: string; // ej. '16 al 20 de Junio'
  targetGrades: string[]; // ['Todos los Grados'] o ['4to Grado', '5to Grado', '6to Grado']
  status?: 'published' | 'draft';
  slots?: EventScheduleSlot[];
  type?: EventScheduleType;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  agenda?: EventScheduleItem[];
  notes?: string;
  coordinatorNotes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}


