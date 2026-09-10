import { User, Competency, LessonPlan, SchoolEvent, ClassroomProject } from '../types';
import { FLAT_AVATARS_LIST } from './flatAvatars';

export const MOCK_USERS: User[] = [
  {
    id: 'u-coordinator-vargas',
    email: 'vargas199511@gmail.com',
    fullName: 'Prof. Vargas (Coordinación General)',
    role: 'coordinator',
    avatar: FLAT_AVATARS_LIST[0].url,
    specialty: 'Dirección y Coordinación Académica General',
    schoolGrade: 'Todos los Grados',
    assignedGrades: ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
    assignedSections: ['A', 'B'],
    assignedSubjects: ['Todas'],
    status: 'active',
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'u-coordinator-1',
    email: 'sofia.alvarado@eduplan.school',
    fullName: 'Dra. Sofía Alvarado',
    role: 'coordinator',
    avatar: FLAT_AVATARS_LIST[0].url,
    specialty: 'Coordinación Pedagógica General',
    schoolGrade: 'Todos los Grados',
    assignedGrades: ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
    assignedSections: ['A', 'B'],
    status: 'active',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'u-teacher-1',
    email: 'carlos.mendoza@eduplan.school',
    fullName: 'Prof. Carlos Mendoza',
    role: 'teacher',
    avatar: FLAT_AVATARS_LIST[4].url,
    specialty: 'Inglés (Language Arts)',
    schoolGrade: '4to Grado',
    assignedGrades: ['4to Grado', '5to Grado'],
    assignedSections: ['A', 'B'],
    assignedSubjects: ['Inglés (Language Arts)'],
    status: 'active',
    createdAt: '2025-02-01T08:00:00Z',
  },
  {
    id: 'u-teacher-2',
    email: 'mariana.rojas@eduplan.school',
    fullName: 'Prof. Mariana Rojas',
    role: 'teacher',
    avatar: FLAT_AVATARS_LIST[1].url,
    specialty: 'Matemática y Lógica',
    schoolGrade: '5to Grado',
    assignedGrades: ['5to Grado', '6to Grado'],
    assignedSections: ['A'],
    assignedSubjects: ['Matemática'],
    status: 'active',
    createdAt: '2025-02-01T08:00:00Z',
  },
  {
    id: 'u-teacher-3',
    email: 'david.benitez@eduplan.school',
    fullName: 'Prof. David Benítez',
    role: 'teacher',
    avatar: FLAT_AVATARS_LIST[2].url,
    specialty: 'Ciencias Naturales y Robótica',
    schoolGrade: '4to Grado',
    assignedGrades: ['4to Grado', '6to Grado'],
    assignedSections: ['A', 'B'],
    assignedSubjects: ['Ciencias Naturales', 'Robótica', 'Tecnología', 'Computación'],
    status: 'active',
    createdAt: '2025-02-05T08:00:00Z',
  },
  {
    id: 'u-teacher-4',
    email: 'ajedrez@colegiomanglar.edu.ve',
    fullName: 'Prof. Fernando Lugo',
    role: 'teacher',
    avatar: FLAT_AVATARS_LIST[3].url,
    specialty: 'Ajedrez & Estrategia',
    schoolGrade: '1ro a 6to Grado',
    assignedGrades: ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
    assignedSections: ['A', 'B'],
    assignedSubjects: ['Ajedrez'],
    status: 'active',
    createdAt: '2025-02-10T08:00:00Z',
  },
  {
    id: 'u-teacher-5',
    email: 'teatro@colegiomanglar.edu.ve',
    fullName: 'Prof. Laura Briceño',
    role: 'teacher',
    avatar: FLAT_AVATARS_LIST[6].url,
    specialty: 'Teatro & Expresión Corporal',
    schoolGrade: '1ro a 6to Grado',
    assignedGrades: ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
    assignedSections: ['A', 'B'],
    assignedSubjects: ['Teatro'],
    status: 'active',
    createdAt: '2025-02-10T08:00:00Z',
  },
  {
    id: 'u-teacher-6',
    email: 'deporte@colegiomanglar.edu.ve',
    fullName: 'Prof. Roberto González',
    role: 'teacher',
    avatar: FLAT_AVATARS_LIST[5].url,
    specialty: 'Deporte & Educación Física',
    schoolGrade: '1ro a 6to Grado',
    assignedGrades: ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
    assignedSections: ['A', 'B'],
    assignedSubjects: ['Deporte', 'Ed. Física'],
    status: 'active',
    createdAt: '2025-02-10T08:00:00Z',
  },
];

export const AVAILABLE_SUBJECTS = [
  'Inglés (Language Arts)',
  'Lengua y Literatura',
  'Matemática',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Ajedrez',
  'Robótica y Computación',
  'Ed. Física / Deporte',
  'Música',
  'Francés',
  'ADP (Aprender a Pensar)',
  'Proyecto de Aula',
  'Rutina / Lectura',
];

export const AVAILABLE_GRADES = [
  '1er Grado',
  '2do Grado',
  '3er Grado',
  '4to Grado',
  '5to Grado',
  '6to Grado',
];

export const INITIAL_COMPETENCIES: Competency[] = [
  // English - 4to Grado
  {
    id: 'comp-eng-4-01',
    subject: 'English',
    grade: '4to Grado',
    code: 'ENG-4GR-LSN',
    title: 'Oral Comprehension in Daily Routines',
    category: 'Listening & Speaking',
    indicators: [
      'Comprende órdenes sencillas y descripciones breves de hábitos diarios.',
      'Identifica horas del día y actividades de rutina en diálogos orales.',
      'Responde preguntas guiadas de comprensión oral en tiempo presente.'
    ],
  },
  {
    id: 'comp-eng-4-02',
    subject: 'English',
    grade: '4to Grado',
    code: 'ENG-4GR-WRT',
    title: 'Short Descriptive Writing & Vocabulary',
    category: 'Writing',
    indicators: [
      'Escribe oraciones estructuradas sobre su entorno escolar y familiar.',
      'Utiliza adjetivos calificativos básicos de manera correcta.',
      'Aplica conectores elementales (and, but, because) en párrafos cortos.'
    ],
  },
  {
    id: 'comp-eng-4-03',
    subject: 'English',
    grade: '4to Grado',
    code: 'ENG-4GR-SPK',
    title: 'Interactive Classroom Dialogue',
    category: 'Oral Interaction',
    indicators: [
      'Participa en diálogos breves y modelados con compañeros.',
      'Expresa preferencias y estados de ánimo con pronunciación inteligible.',
      'Formula preguntas sencillas para solicitar información en clase.'
    ],
  },
  // English - 5to Grado
  {
    id: 'comp-eng-5-01',
    subject: 'English',
    grade: '5to Grado',
    code: 'ENG-5GR-RDN',
    title: 'Reading Comprehension of Short Narratives',
    category: 'Reading',
    indicators: [
      'Identifica la idea principal y personajes en relatos cortos.',
      'Reconoce la secuencia cronológica de eventos en fábulas y cuentos.',
      'Deduce el significado de palabras desconocidas a partir del contexto textual.'
    ],
  },
  // Matemáticas - 4to Grado
  {
    id: 'comp-mat-4-01',
    subject: 'Matemáticas',
    grade: '4to Grado',
    code: 'MAT-4GR-ARI',
    title: 'Resolución de problemas multiplicativos',
    category: 'Aritmética',
    indicators: [
      'Aplica algoritmos de multiplicación de hasta 3 dígitos por 1 dígito.',
      'Identifica la estructura multiplicativa en situaciones del contexto cotidiano.',
      'Verifica la razonabilidad de los resultados obtenidos con estimaciones.'
    ],
  },
  {
    id: 'comp-mat-4-02',
    subject: 'Matemáticas',
    grade: '4to Grado',
    code: 'MAT-4GR-FRC',
    title: 'Comprensión y representación de fracciones simples',
    category: 'Fracciones y Medida',
    indicators: [
      'Representa gráfica y simbólicamente fracciones propias (medios, cuartos, octavos).',
      'Ubica fracciones simples en rectas numéricas continuas.',
      'Compara fracciones homogéneas utilizando los signos mayor que, menor que e igual.'
    ],
  },
  // Matemáticas - 5to Grado
  {
    id: 'comp-mat-5-01',
    subject: 'Matemáticas',
    grade: '5to Grado',
    code: 'MAT-5GR-ALG',
    title: 'Operaciones combinadas y jerarquía numérica',
    category: 'Álgebra y Números',
    indicators: [
      'Aplica correctamente los paréntesis y la jerarquía de las cuatro operaciones básicas.',
      'Resuelve situaciones problemáticas respetando el orden convencional de cálculo.',
      'Diseña expresiones aritméticas equivalentes para agilizar el cálculo mental.'
    ],
  },
  // Ciencias Naturales - 4to Grado
  {
    id: 'comp-cien-4-01',
    subject: 'Ciencias Naturales',
    grade: '4to Grado',
    code: 'NAT-4GR-ECO',
    title: 'Ecosistemas locales y cadenas tróficas',
    category: 'Ecología y Biodiversidad',
    indicators: [
      'Reconoce y clasifica los componentes bióticos y abióticos de la región.',
      'Describe las relaciones alimentarias entre productores, consumidores y descomponedores.',
      'Identifica el impacto de la actividad humana en el equilibrio ecológico local.'
    ],
  },
  {
    id: 'comp-cien-4-02',
    subject: 'Ciencias Naturales',
    grade: '4to Grado',
    code: 'NAT-4GR-FIS',
    title: 'Ciclo del agua y conservación ambiental',
    category: 'Mundo Físico',
    indicators: [
      'Explica detalladamente las fases de evaporación, condensación y precipitación.',
      'Relaciona los cambios de estado físico del agua con la temperatura ambiente.',
      'Propone y aplica acciones prácticas de ahorro y uso responsable del agua.'
    ],
  },
  // Lengua y Literatura - 4to Grado
  {
    id: 'comp-leng-4-01',
    subject: 'Lengua y Literatura',
    grade: '4to Grado',
    code: 'LEN-4GR-WRT',
    title: 'Producción de textos narrativos estructurados',
    category: 'Expresión Escrita',
    indicators: [
      'Redacta anécdotas y cuentos respetando inicio, nudo y desenlace.',
      'Emplea conectores temporales y causales adecuados.',
      'Aplica normas ortográficas elementales y signos de puntuación.'
    ],
  },
];

export const INITIAL_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'plan-w1-eng-4',
    teacherId: 'u-teacher-1',
    teacherName: 'Prof. Carlos Mendoza',
    teacherAvatar: FLAT_AVATARS_LIST[4].url,
    weekNumber: 1,
    subject: 'English',
    grade: '4to Grado',
    topic: 'Daily Routines and Telling Time',
    status: 'submitted',
    competencyIds: ['comp-eng-4-01', 'comp-eng-4-02'],
    selectedIndicators: {
      'comp-eng-4-01': [
        'Comprende órdenes sencillas y descripciones breves de hábitos diarios.',
        'Identifica horas del día y actividades de rutina en diálogos orales.',
        'Responde preguntas guiadas de comprensión oral en tiempo presente.'
      ],
      'comp-eng-4-02': [
        'Escribe oraciones estructuradas sobre su entorno escolar y familiar.',
        'Utiliza adjetivos calificativos básicos de manera correcta.'
      ]
    },
    startActivity: 'Actividad de activación "Simon Says: Morning Routines". Se proyecta un video musical animado de 3 minutos sobre acciones matutinas (brush teeth, have breakfast, pack backpack). Dinámica de sondeo con flashcards físicas para verificar vocabulario previo de la hora en punto.',
    developmentActivity: '1. Presentación guiada de la estructura: "At [time] I usually [action]". Modelado en pizarra con reloj analógico manipulable.\n2. Trabajo en parejas con tarjetas ilustradas: cada estudiante pregunta a su compañero "What time do you wake up?" y registra la respuesta en su ficha de trabajo.\n3. Dinámica de roles "My Busy Saturday": creación de una tira cómica de 4 viñetas en grupos cooperativos de 3.',
    closingActivity: 'Juego de salida "Ticket to Exit": cada alumno comparte una frase sobre su rutina favorita antes de salir del aula. Reflexión grupal breve sobre la gestión del tiempo y puntualidad.',
    resources: 'Proyector multimedia, flashcards plastificadas de rutinas, relojes didácticos de cartón, fichas de trabajo impresas (Anexo 1), marcadores de colores.',
    observations: 'Se adaptarán las fichas con apoyos iconográficos visuales para Mateo y Valentina (atención a la diversidad). El tiempo de la actividad 2 puede extenderse 10 min si se requiere refuerzo.',
    coordinatorFeedback: '',
    submittedAt: '2026-03-02T10:30:00Z',
    updatedAt: '2026-03-02T10:30:00Z',
  },
  {
    id: 'plan-w2-eng-4',
    teacherId: 'u-teacher-1',
    teacherName: 'Prof. Carlos Mendoza',
    teacherAvatar: FLAT_AVATARS_LIST[4].url,
    weekNumber: 2,
    subject: 'English',
    grade: '4to Grado',
    topic: 'School Subjects and My Favorite Day',
    status: 'draft',
    competencyIds: ['comp-eng-4-03'],
    selectedIndicators: {
      'comp-eng-4-03': [
        'Participa en diálogos breves y modelados con compañeros.',
        'Expresa preferencias y estados de ánimo con pronunciación inteligible.',
        'Formula preguntas sencillas para solicitar información en clase.'
      ]
    },
    startActivity: 'Lluvia de ideas en la pizarra sobre las materias favoritas de la semana.',
    developmentActivity: 'Elaboración de un horario semanal en inglés y práctica oral en parejas.',
    closingActivity: 'Encuesta rápida en el aula sobre la materia más votada.',
    resources: 'Pizarra interactiva, papelógrafos, hojas de colores.',
    observations: 'Pendiente afinar la rúbrica de evaluación oral.',
    updatedAt: '2026-03-04T14:15:00Z',
  },
  {
    id: 'plan-w1-mat-5',
    teacherId: 'u-teacher-2',
    teacherName: 'Prof. Mariana Rojas',
    teacherAvatar: FLAT_AVATARS_LIST[1].url,
    weekNumber: 1,
    subject: 'Matemáticas',
    grade: '5to Grado',
    topic: 'Jerarquía de Operaciones y Paréntesis',
    status: 'approved',
    competencyIds: ['comp-mat-5-01'],
    selectedIndicators: {
      'comp-mat-5-01': [
        'Aplica correctamente los paréntesis y la jerarquía de las cuatro operaciones básicas.',
        'Resuelve situaciones problemáticas respetando el orden convencional de cálculo.'
      ]
    },
    startActivity: 'Desafío matemático inicial: "El enigma del cajero automático". Dos estudiantes resuelven la misma expresión obteniendo resultados distintos.',
    developmentActivity: 'Deducción de las reglas PEMDAS con ejemplos paso a paso. Práctica gamificada en equipos usando tarjetas de números y signos.',
    closingActivity: 'Mini-quiz interactivo de 3 preguntas de autoevaluación formativa.',
    resources: 'Juego de cartas algebraicas, guía de ejercicios prácticos, proyector.',
    observations: 'Excelente recepción de la metodología gamificada.',
    coordinatorFeedback: 'Planificación excelente, muy pedagógica y con claro enfoque competencial. Aprobada sin objeciones.',
    submittedAt: '2026-02-28T09:00:00Z',
    reviewedAt: '2026-03-01T11:20:00Z',
    updatedAt: '2026-03-01T11:20:00Z',
  },
  {
    id: 'plan-w1-cien-4',
    teacherId: 'u-teacher-3',
    teacherName: 'Prof. David Benítez',
    teacherAvatar: FLAT_AVATARS_LIST[2].url,
    weekNumber: 1,
    subject: 'Ciencias Naturales',
    grade: '4to Grado',
    topic: 'Cadenas Tróficas en el Bosque Templado',
    status: 'rejected',
    competencyIds: ['comp-cien-4-01'],
    selectedIndicators: {
      'comp-cien-4-01': [
        'Reconoce y clasifica los componentes bióticos y abióticos de la región.',
        'Describe las relaciones alimentarias entre productores, consumidores y descomponedores.'
      ]
    },
    startActivity: 'Muestra de imágenes de animales autóctonos y pregunta guía: ¿Quién se alimenta de quién?',
    developmentActivity: 'Lectura del libro de texto página 24 y copia del diagrama en el cuaderno.',
    closingActivity: 'Responder preguntas 1 y 2 del libro.',
    resources: 'Libro de texto escolar y cuadernos.',
    observations: 'Se necesitarán más láminas.',
    coordinatorFeedback: 'Estimado David: Sugiero dinamizar el Desarrollo con una actividad más activa e indagatoria (por ejemplo, elaborar una red trófica con lana o maquetas en grupos) en lugar de solo copiar del libro de texto. Por favor ajustar y reenviar.',
    submittedAt: '2026-03-01T15:00:00Z',
    reviewedAt: '2026-03-02T16:00:00Z',
    updatedAt: '2026-03-02T16:00:00Z',
  },
  {
    id: 'plan-w2-mat-5',
    teacherId: 'u-teacher-2',
    teacherName: 'Prof. Mariana Rojas',
    teacherAvatar: FLAT_AVATARS_LIST[1].url,
    weekNumber: 2,
    subject: 'Matemáticas',
    grade: '5to Grado',
    topic: 'Fracciones Equivalentes y Simplificación',
    status: 'submitted',
    competencyIds: ['comp-mat-4-02'],
    selectedIndicators: {
      'comp-mat-4-02': [
        'Representa gráfica y simbólicamente fracciones propias (medios, cuartos, octavos).',
        'Compara fracciones homogéneas utilizando los signos mayor que, menor que e igual.'
      ]
    },
    startActivity: 'Repartición simulada de barras de chocolate en partes iguales.',
    developmentActivity: 'Uso de tiras de fracciones de colores para hallar equivalencias.',
    closingActivity: 'Demostración voluntaria en pizarra.',
    resources: 'Tiras de fracciones de foami, fichas de trabajo.',
    observations: 'Para la siguiente sesión se coordinará con el aula de cómputo.',
    submittedAt: '2026-03-03T18:00:00Z',
    updatedAt: '2026-03-03T18:00:00Z',
  },
];

export const INITIAL_SCHOOL_EVENTS: SchoolEvent[] = [
  {
    id: 'ev-1',
    title: 'Apertura del Ciclo Escolar 2026',
    description: 'Acto cívico y bienvenida a la comunidad educativa en el patio central.',
    type: 'academic',
    date: '2026-09-01',
    startTime: '08:00',
    endTime: '10:30',
    targetRole: 'all',
  },
  {
    id: 'ev-2',
    title: 'Límite: Entrega de Planificaciones Semanas 1 y 2',
    description: 'Fecha límite institucional para que todos los docentes envíen sus planificaciones a Coordinación.',
    type: 'planning_deadline',
    date: '2026-09-04',
    startTime: '14:00',
    endTime: '18:00',
    targetRole: 'teachers',
  },
  {
    id: 'ev-3',
    title: 'Consejo Técnico Pedagógico Mensual',
    description: 'Reunión de docentes y equipo de coordinación para alinear rúbricas y proyectos interdisciplinarios.',
    type: 'meeting',
    date: '2026-09-08',
    startTime: '15:30',
    endTime: '17:30',
    targetRole: 'all',
  },
  {
    id: 'ev-4',
    title: 'Evaluaciones Diagnósticas Iniciales',
    description: 'Aplicación de pruebas diagnósticas en Lenguaje, Matemáticas y Ciencias.',
    type: 'exam',
    date: '2026-09-12',
    startTime: '08:30',
    endTime: '12:00',
    targetRole: 'all',
  },
  {
    id: 'ev-5',
    title: 'Límite: Entrega de Planificaciones Semanas 3 y 4',
    description: 'Recepción de unidades pedagógicas para el segundo bloque quincenal.',
    type: 'planning_deadline',
    date: '2026-09-18',
    startTime: '13:00',
    endTime: '18:00',
    targetRole: 'teachers',
  },
  {
    id: 'ev-6',
    title: 'Jornada Recreativa y Día del Estudiante',
    description: 'Actividades culturales, ferias temáticas y torneo deportivo escolar.',
    type: 'holiday',
    date: '2026-09-21',
    startTime: '09:00',
    endTime: '14:00',
    targetRole: 'all',
  },
  {
    id: 'ev-7',
    title: 'Taller de Adaptaciones Curriculares (NEE)',
    description: 'Capacitación docente sobre estrategias diversificadas y adecuaciones metodológicas.',
    type: 'meeting',
    date: '2026-09-25',
    startTime: '16:00',
    endTime: '18:00',
    targetRole: 'teachers',
  },
  {
    id: 'ev-8',
    title: 'Límite: Entrega de Planificaciones Semanas 5 y 6',
    description: 'Cierre del periodo de entrega para el tercer bloque curricular.',
    type: 'planning_deadline',
    date: '2026-10-02',
    startTime: '14:00',
    endTime: '18:00',
    targetRole: 'teachers',
  },
  {
    id: 'ev-9',
    title: 'Feriado Escolar - Diversidad Cultural',
    description: 'Sin actividades académicas presenciales por conmemoración del feriado oficial.',
    type: 'holiday',
    date: '2026-10-12',
    targetRole: 'all',
  },
  {
    id: 'ev-10',
    title: 'Exámenes Parciales del 1er Trimestre',
    description: 'Semana de evaluaciones trimestrales para primaria y secundaria.',
    type: 'exam',
    date: '2026-10-20',
    startTime: '08:00',
    endTime: '13:00',
    targetRole: 'all',
  },
];

export { INITIAL_CLASSROOM_PROJECTS } from './classroomProjectsData';

// =========================================================================
// DATOS REALES DE HORARIOS DE GUARDIAS ESCOLARES (SÁBANA INSTITUCIONAL)
// =========================================================================
import { DutySlot, DutyGradeSlot } from '../types';

export const DUTY_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const;

export const INITIAL_DUTY_SLOTS: DutySlot[] = [
  // -------------------------------------------------------------
  // 1. GUARDIAS DE ENTRADA Y SALIDA (7:00 am - 7:25 am)
  // -------------------------------------------------------------
  { id: 'es-1', day: 'Lunes', timeSlot: '7:00 am a 7:25 am', location: 'Coordinador', assignedPerson: 'Patricia P', category: 'entrada_salida' },
  { id: 'es-2', day: 'Martes', timeSlot: '7:00 am a 7:25 am', location: 'Coordinador', assignedPerson: 'Cruz', category: 'entrada_salida' },
  { id: 'es-3', day: 'Miércoles', timeSlot: '7:00 am a 7:25 am', location: 'Coordinador', assignedPerson: 'Jackeline', category: 'entrada_salida' },
  { id: 'es-4', day: 'Viernes', timeSlot: '7:00 am a 7:25 am', location: 'Coordinador', assignedPerson: 'Gloria', category: 'entrada_salida' },

  { id: 'es-5', day: 'Lunes', timeSlot: '7:00 am a 7:25 am', location: 'Puerta cancha', assignedPerson: 'Vacante Inglés 2', category: 'entrada_salida' },
  { id: 'es-6', day: 'Martes', timeSlot: '7:00 am a 7:25 am', location: 'Puerta cancha', assignedPerson: 'Jhon', category: 'entrada_salida' },
  { id: 'es-7', day: 'Miércoles', timeSlot: '7:00 am a 7:25 am', location: 'Puerta cancha', assignedPerson: 'Paola C', category: 'entrada_salida' },
  { id: 'es-8', day: 'Jueves', timeSlot: '7:00 am a 7:25 am', location: 'Puerta cancha', assignedPerson: 'Jackeline', category: 'entrada_salida' },
  { id: 'es-9', day: 'Viernes', timeSlot: '7:00 am a 7:25 am', location: 'Puerta cancha', assignedPerson: 'Giorgio', category: 'entrada_salida' },

  { id: 'es-10', day: 'Martes', timeSlot: '7:00 am a 7:25 am', location: 'Cancha', assignedPerson: 'Alain', category: 'entrada_salida' },
  { id: 'es-11', day: 'Miércoles', timeSlot: '7:00 am a 7:25 am', location: 'Cancha', assignedPerson: 'Alain', category: 'entrada_salida' },
  { id: 'es-12', day: 'Jueves', timeSlot: '7:00 am a 7:25 am', location: 'Cancha', assignedPerson: 'Cruz', category: 'entrada_salida' },
  { id: 'es-13', day: 'Viernes', timeSlot: '7:00 am a 7:25 am', location: 'Cancha', assignedPerson: 'Yuleida', category: 'entrada_salida' },

  // -------------------------------------------------------------
  // GUARDIAS DE ENTRADA Y SALIDA (Salida 3:30 pm)
  // -------------------------------------------------------------
  { id: 'es-14', day: 'Miércoles', timeSlot: '3:30 pm', location: 'Coordinador', assignedPerson: 'Mafer', category: 'entrada_salida' },
  { id: 'es-15', day: 'Jueves', timeSlot: '3:30 pm', location: 'Coordinador', assignedPerson: 'Reina', category: 'entrada_salida' },

  { id: 'es-16', day: 'Martes', timeSlot: '3:30 pm', location: 'Patio techado', assignedPerson: 'Marisela', category: 'entrada_salida' },
  { id: 'es-17', day: 'Miércoles', timeSlot: '3:30 pm', location: 'Patio techado', assignedPerson: 'Irene', category: 'entrada_salida' },
  { id: 'es-18', day: 'Jueves', timeSlot: '3:30 pm', location: 'Patio techado', assignedPerson: 'Carlos', category: 'entrada_salida' },
  { id: 'es-19', day: 'Viernes', timeSlot: '3:30 pm', location: 'Patio techado', assignedPerson: 'Aseret', category: 'entrada_salida' },

  { id: 'es-20', day: 'Lunes', timeSlot: '3:30 pm', location: 'Micrófono', assignedPerson: 'Reina', category: 'entrada_salida' },
  { id: 'es-21', day: 'Martes', timeSlot: '3:30 pm', location: 'Micrófono', assignedPerson: 'Alba', category: 'entrada_salida' },
  { id: 'es-22', day: 'Viernes', timeSlot: '3:30 pm', location: 'Micrófono', assignedPerson: 'Mafer', category: 'entrada_salida' },

  { id: 'es-23', day: 'Martes', timeSlot: '3:30 pm', location: 'Radiocarro', assignedPerson: 'Dulce', category: 'entrada_salida' },
  { id: 'es-24', day: 'Miércoles', timeSlot: '3:30 pm', location: 'Radiocarro', assignedPerson: 'Daniel', category: 'entrada_salida' },
  { id: 'es-25', day: 'Jueves', timeSlot: '3:30 pm', location: 'Radiocarro', assignedPerson: 'Daniel', category: 'entrada_salida' },

  { id: 'es-26', day: 'Martes', timeSlot: '3:30 pm', location: 'Parque', assignedPerson: 'Prada', category: 'entrada_salida' },
  { id: 'es-27', day: 'Miércoles', timeSlot: '3:30 pm', location: 'Parque', assignedPerson: 'Gisela', category: 'entrada_salida' },
  { id: 'es-28', day: 'Jueves', timeSlot: '3:30 pm', location: 'Parque', assignedPerson: 'Laura', category: 'entrada_salida' },
  { id: 'es-29', day: 'Viernes', timeSlot: '3:30 pm', location: 'Parque', assignedPerson: 'Irene', category: 'entrada_salida' },

  { id: 'es-30', day: 'Martes', timeSlot: '3:30 pm', location: 'Monta carros (1)', assignedPerson: 'Florani', category: 'entrada_salida' },
  { id: 'es-31', day: 'Jueves', timeSlot: '3:30 pm', location: 'Monta carros (1)', assignedPerson: 'Jhon', category: 'entrada_salida' },

  { id: 'es-32', day: 'Martes', timeSlot: '3:30 pm', location: 'Monta carros (2)', assignedPerson: 'Lilibeth', category: 'entrada_salida' },
  { id: 'es-33', day: 'Jueves', timeSlot: '3:30 pm', location: 'Monta carros (2)', assignedPerson: 'Cruz', category: 'entrada_salida' },

  { id: 'es-34', day: 'Martes', timeSlot: '3:30 pm', location: 'Arreglos previos y puerta', assignedPerson: 'Cruz', category: 'entrada_salida' },

  // -------------------------------------------------------------
  // 2. GUARDIA RECESOS PRIMARIA (Receso 9:30 am a 10:00 am)
  // -------------------------------------------------------------
  { id: 'rp-1', day: 'Lunes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedPerson: 'Néstor', category: 'recesos_primaria' },
  { id: 'rp-2', day: 'Lunes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedPerson: 'Jhon', category: 'recesos_primaria' },
  { id: 'rp-3', day: 'Martes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedPerson: 'Román', category: 'recesos_primaria' },
  { id: 'rp-4', day: 'Martes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedPerson: 'José Romero', category: 'recesos_primaria' },
  { id: 'rp-5', day: 'Miércoles', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedPerson: 'José Romero', category: 'recesos_primaria' },
  { id: 'rp-6', day: 'Miércoles', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedPerson: 'Reina / Néstor', category: 'recesos_primaria' },
  { id: 'rp-7', day: 'Jueves', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedPerson: 'Román', category: 'recesos_primaria' },
  { id: 'rp-8', day: 'Viernes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedPerson: 'Román', category: 'recesos_primaria' },

  { id: 'rp-9', day: 'Lunes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Paola C', category: 'recesos_primaria' },
  { id: 'rp-10', day: 'Lunes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Amanda', category: 'recesos_primaria' },
  { id: 'rp-11', day: 'Martes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Cruz', category: 'recesos_primaria' },
  { id: 'rp-12', day: 'Martes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Eileen', category: 'recesos_primaria' },
  { id: 'rp-13', day: 'Miércoles', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Ysa', category: 'recesos_primaria' },
  { id: 'rp-14', day: 'Miércoles', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Cruz', category: 'recesos_primaria' },
  { id: 'rp-15', day: 'Jueves', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Eileen / Anderson', category: 'recesos_primaria' },
  { id: 'rp-16', day: 'Jueves', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Patricia P', category: 'recesos_primaria' },
  { id: 'rp-17', day: 'Viernes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Paola C', category: 'recesos_primaria' },
  { id: 'rp-18', day: 'Viernes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Anderson', category: 'recesos_primaria' },
  { id: 'rp-19', day: 'Viernes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedPerson: 'Sofia', category: 'recesos_primaria' },

  { id: 'rp-20', day: 'Lunes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Patio techado', assignedPerson: 'Daniel', category: 'recesos_primaria' },
  { id: 'rp-21', day: 'Martes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Patio techado', assignedPerson: 'Alain', category: 'recesos_primaria' },
  { id: 'rp-22', day: 'Martes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Patio techado', assignedPerson: 'Patricia P', category: 'recesos_primaria' },
  { id: 'rp-23', day: 'Viernes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Patio techado', assignedPerson: 'Alain', category: 'recesos_primaria' },

  // -------------------------------------------------------------
  // GUARDIA RECESOS PRIMARIA (Almuerzo 12:15 pm a 12:45 pm)
  // -------------------------------------------------------------
  { id: 'rp-24', day: 'Lunes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedPerson: 'Prada', category: 'recesos_primaria' },
  { id: 'rp-25', day: 'Lunes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedPerson: 'Néstor / Mafer', category: 'recesos_primaria' },
  { id: 'rp-26', day: 'Martes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedPerson: 'Mafer', category: 'recesos_primaria' },
  { id: 'rp-27', day: 'Martes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedPerson: 'Néstor', category: 'recesos_primaria' },
  { id: 'rp-28', day: 'Jueves', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedPerson: 'Néstor / Vanessa', category: 'recesos_primaria' },
  { id: 'rp-29', day: 'Jueves', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedPerson: 'José Romero', category: 'recesos_primaria' },
  { id: 'rp-30', day: 'Viernes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedPerson: 'Néstor', category: 'recesos_primaria' },

  { id: 'rp-31', day: 'Lunes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedPerson: 'Amanda', category: 'recesos_primaria' },
  { id: 'rp-32', day: 'Lunes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedPerson: 'José C', category: 'recesos_primaria' },
  { id: 'rp-33', day: 'Martes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedPerson: 'Amanda', category: 'recesos_primaria' },
  { id: 'rp-34', day: 'Martes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedPerson: 'José C', category: 'recesos_primaria' },
  { id: 'rp-35', day: 'Martes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedPerson: 'José Romero', category: 'recesos_primaria' },
  { id: 'rp-36', day: 'Miércoles', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedPerson: 'Triky', category: 'recesos_primaria' },
  { id: 'rp-37', day: 'Miércoles', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedPerson: 'Eileen', category: 'recesos_primaria' },

  { id: 'rp-38', day: 'Lunes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Patio techado', assignedPerson: 'Daniel', category: 'recesos_primaria' },
  { id: 'rp-39', day: 'Miércoles', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Patio techado', assignedPerson: 'José Romero', category: 'recesos_primaria' },

  // -------------------------------------------------------------
  // GUARDIA RECESOS PRIMARIA (Receso Patio 12:45 pm a 1:15 pm)
  // -------------------------------------------------------------
  { id: 'rp-40', day: 'Lunes', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Parque', assignedPerson: 'Reina', category: 'recesos_primaria' },
  { id: 'rp-41', day: 'Martes', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Parque', assignedPerson: 'José Romero', category: 'recesos_primaria' },
  { id: 'rp-42', day: 'Jueves', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Parque', assignedPerson: 'Mafer', category: 'recesos_primaria' },

  { id: 'rp-43', day: 'Lunes', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Cancha futbol', assignedPerson: 'Jhon', category: 'recesos_primaria' },
  { id: 'rp-44', day: 'Martes', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Cancha futbol', assignedPerson: 'Jhon', category: 'recesos_primaria' },
  { id: 'rp-45', day: 'Martes', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Cancha futbol', assignedPerson: 'Daniel', category: 'recesos_primaria' },
  { id: 'rp-46', day: 'Miércoles', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Cancha futbol', assignedPerson: 'Daniel', category: 'recesos_primaria' },
  { id: 'rp-47', day: 'Miércoles', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Cancha futbol', assignedPerson: 'Alain', category: 'recesos_primaria' },
  { id: 'rp-48', day: 'Jueves', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Cancha futbol', assignedPerson: 'Fausto', category: 'recesos_primaria' },
  { id: 'rp-49', day: 'Jueves', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Cancha futbol', assignedPerson: 'Jhon', category: 'recesos_primaria' },
  { id: 'rp-50', day: 'Viernes', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Cancha futbol', assignedPerson: 'Alain / Daniel', category: 'recesos_primaria' },
  { id: 'rp-51', day: 'Viernes', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Cancha futbol', assignedPerson: 'Fausto', category: 'recesos_primaria' },

  { id: 'rp-52', day: 'Miércoles', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Patio Techado', assignedPerson: 'Reina', category: 'recesos_primaria' },
  { id: 'rp-53', day: 'Viernes', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Patio Techado', assignedPerson: 'Reina', category: 'recesos_primaria' },

  { id: 'rp-54', day: 'Jueves', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Baños corredores', assignedPerson: 'Reina', category: 'recesos_primaria' },
  { id: 'rp-55', day: 'Viernes', timeSlot: 'Receso Patio 12:45 pm a 1:15 pm', location: 'Baños corredores', assignedPerson: 'Mafer', category: 'recesos_primaria' },

  // -------------------------------------------------------------
  // 3. GUARDIAS BACHILLERATO 26-27
  // -------------------------------------------------------------
  { id: 'b-1', day: 'Martes', timeSlot: 'Salón de Reflexión 7:30 a 8:15 a.m.', location: 'Salón de Reflexión', assignedPerson: 'Alba', category: 'bachillerato' },
  { id: 'b-2', day: 'Jueves', timeSlot: 'Salón de Reflexión 7:30 a 8:15 a.m.', location: 'Salón de Reflexión', assignedPerson: 'Jackeline', category: 'bachillerato' },
  { id: 'b-3', day: 'Viernes', timeSlot: 'Salón de Reflexión 7:30 a 8:15 a.m.', location: 'Salón de Reflexión', assignedPerson: 'Alba', category: 'bachillerato' },

  // Receso 10:00 a 10:30 a.m.
  { id: 'b-4', day: 'Lunes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Onoravic', category: 'bachillerato' },
  { id: 'b-5', day: 'Martes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Carlos F.', category: 'bachillerato' },
  { id: 'b-6', day: 'Miércoles', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Irene', category: 'bachillerato' },
  { id: 'b-7', day: 'Jueves', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Laura', category: 'bachillerato' },
  { id: 'b-8', day: 'Viernes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Otoniel', category: 'bachillerato' },

  { id: 'b-9', day: 'Lunes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Integralidad', assignedPerson: 'Jackeline', category: 'bachillerato' },
  { id: 'b-10', day: 'Martes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Integralidad', assignedPerson: 'Dulce', category: 'bachillerato' },
  { id: 'b-11', day: 'Miércoles', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Integralidad', assignedPerson: 'Lissett', category: 'bachillerato' },
  { id: 'b-12', day: 'Jueves', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Integralidad', assignedPerson: 'Irene / Carlos F.', category: 'bachillerato' },
  { id: 'b-13', day: 'Viernes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Integralidad', assignedPerson: 'Jackeline', category: 'bachillerato' },

  { id: 'b-14', day: 'Lunes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Patio techado', assignedPerson: 'Laura', category: 'bachillerato' },
  { id: 'b-15', day: 'Martes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Patio techado', assignedPerson: 'Jackeline', category: 'bachillerato' },
  { id: 'b-16', day: 'Miércoles', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Patio techado', assignedPerson: 'Florani', category: 'bachillerato' },
  { id: 'b-17', day: 'Jueves', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Patio techado', assignedPerson: 'Otoniel', category: 'bachillerato' },
  { id: 'b-18', day: 'Viernes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Patio techado', assignedPerson: 'Dulce', category: 'bachillerato' },

  { id: 'b-19', day: 'Lunes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Cancha', assignedPerson: 'Carlos B.', category: 'bachillerato' },
  { id: 'b-20', day: 'Martes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Cancha', assignedPerson: 'Giorgio', category: 'bachillerato' },
  { id: 'b-21', day: 'Miércoles', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Cancha', assignedPerson: 'Giorgio', category: 'bachillerato' },
  { id: 'b-22', day: 'Jueves', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Cancha', assignedPerson: 'Dulce', category: 'bachillerato' },
  { id: 'b-23', day: 'Viernes', timeSlot: 'Receso 10:00 a 10:30 a.m.', location: 'Cancha', assignedPerson: 'Lissett / Carlos F.', category: 'bachillerato' },

  // Receso 1:00 a 1:30 p.m.
  { id: 'b-24', day: 'Lunes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Gloria', category: 'bachillerato' },
  { id: 'b-25', day: 'Martes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Gloria', category: 'bachillerato' },
  { id: 'b-26', day: 'Miércoles', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Onoravic', category: 'bachillerato' },
  { id: 'b-27', day: 'Jueves', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Gloria', category: 'bachillerato' },
  { id: 'b-28', day: 'Viernes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Pasillo de Bachillerato', assignedPerson: 'Carlos', category: 'bachillerato' },

  { id: 'b-29', day: 'Lunes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Integralidad', assignedPerson: 'Vacante Inglés 2', category: 'bachillerato' },
  { id: 'b-30', day: 'Martes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Integralidad', assignedPerson: 'Florani / Gonzalo', category: 'bachillerato' },
  { id: 'b-31', day: 'Miércoles', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Integralidad', assignedPerson: 'Florani', category: 'bachillerato' },
  { id: 'b-32', day: 'Jueves', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Integralidad', assignedPerson: 'Onoravic', category: 'bachillerato' },
  { id: 'b-33', day: 'Viernes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Integralidad', assignedPerson: 'Giorgio', category: 'bachillerato' },

  { id: 'b-34', day: 'Lunes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Patio techado', assignedPerson: 'Marisela', category: 'bachillerato' },
  { id: 'b-35', day: 'Martes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Patio techado', assignedPerson: 'Onoravic', category: 'bachillerato' },
  { id: 'b-36', day: 'Miércoles', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Patio techado', assignedPerson: 'Aseret', category: 'bachillerato' },
  { id: 'b-37', day: 'Jueves', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Patio techado', assignedPerson: 'Asereth', category: 'bachillerato' },
  { id: 'b-38', day: 'Viernes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Patio techado', assignedPerson: 'Dulce', category: 'bachillerato' },

  { id: 'b-39', day: 'Lunes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Cancha', assignedPerson: 'Carlos F.', category: 'bachillerato' },
  { id: 'b-40', day: 'Martes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Cancha', assignedPerson: 'Giorgio', category: 'bachillerato' },
  { id: 'b-41', day: 'Miércoles', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Cancha', assignedPerson: 'Otoniel', category: 'bachillerato' },
  { id: 'b-42', day: 'Jueves', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Cancha', assignedPerson: 'Carlos / Gonzalo', category: 'bachillerato' },
  { id: 'b-43', day: 'Viernes', timeSlot: 'Receso 1:00 a 1:30 p.m.', location: 'Cancha', assignedPerson: 'Yuleida', category: 'bachillerato' },
];

// -------------------------------------------------------------
// TURNOS RECESOS DE PRIMARIA (POR GRADOS)
// -------------------------------------------------------------
export const INITIAL_GRADE_TURNS: DutyGradeSlot[] = [
  // Receso 9:30 am a 10:00 am
  { day: 'Lunes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedGrade: 'Segundo Grado / Tercer grado' },
  { day: 'Martes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedGrade: 'Cuarto grado / Quinto grado' },
  { day: 'Miércoles', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedGrade: 'Tercer grado / Sexto grado' },
  { day: 'Jueves', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedGrade: 'Cuarto grado / Sexto grado' },
  { day: 'Viernes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Integralidad', assignedGrade: 'Quinto grado / Tercer grado' },

  { day: 'Lunes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedGrade: 'Cuarto grado / Quinto grado' },
  { day: 'Martes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedGrade: 'Primer grado / Sexto grado' },
  { day: 'Miércoles', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedGrade: 'Cuarto grado / Primer grado' },
  { day: 'Jueves', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedGrade: 'Primer grado / Tercer grado' },
  { day: 'Viernes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Pasillo primaria', assignedGrade: 'Segundo Grado / Cuarto grado' },

  { day: 'Lunes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Patio techado', assignedGrade: 'Primer Grado / Sexto grado' },
  { day: 'Martes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Patio techado', assignedGrade: 'Tercer grado / Segundo grado' },
  { day: 'Miércoles', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Patio techado', assignedGrade: 'Quinto grado / Segundo Grado' },
  { day: 'Jueves', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Patio techado', assignedGrade: 'Quinto grado / Segundo grado' },
  { day: 'Viernes', timeSlot: 'Receso 9:30 am a 10:00 am', location: 'Patio techado', assignedGrade: 'Primer grado / Sexto grado' },

  // Almuerzo 12:15 pm a 12:45 pm
  { day: 'Lunes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedGrade: 'Cuarto grado / Quinto grado' },
  { day: 'Martes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedGrade: 'Tercer grado / Sexto grado' },
  { day: 'Miércoles', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedGrade: 'Segundo Grado / Tercer grado' },
  { day: 'Jueves', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedGrade: 'Sexto grado / Cuarto grado' },
  { day: 'Viernes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Integralidad', assignedGrade: 'Quinto grado / Segundo grado' },

  { day: 'Lunes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedGrade: 'Primer Grado / Sexto grado' },
  { day: 'Martes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedGrade: 'Segundo grado / Cuarto grado' },
  { day: 'Miércoles', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedGrade: 'Primer grado / Sexto grado' },
  { day: 'Jueves', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedGrade: 'Segundo Grado / Quinto grado' },
  { day: 'Viernes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Pasillo primaria', assignedGrade: 'Primer grado / Tercer grado' },

  { day: 'Lunes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Patio techado', assignedGrade: 'Segundo Grado / Tercero grado' },
  { day: 'Martes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Patio techado', assignedGrade: 'Primer grado / Quinto grado' },
  { day: 'Miércoles', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Patio techado', assignedGrade: 'Quinto grado / Cuarto grado' },
  { day: 'Jueves', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Patio techado', assignedGrade: 'Primer grado / Tercer grado' },
  { day: 'Viernes', timeSlot: 'Almuerzo 12:15 pm a 12:45 pm', location: 'Patio techado', assignedGrade: 'Cuarto Grado / Sexto grado' },
];

// -------------------------------------------------------------
// DISTRIBUCIÓN DE USO DE CANCHAS (12:45 PM A 1:15 PM)
// -------------------------------------------------------------
export const INITIAL_COURT_DISTRIBUTION = [
  { court: 'FUTBOL 1', Lunes: 'Tercero', Martes: 'Sexto', Miércoles: 'Segundo y Tercero', Jueves: 'Cuarto', Viernes: 'Primero' },
  { court: 'FUTBOL 2', Lunes: 'Cuarto', Martes: 'Segundo', Miércoles: 'Cuarto y Quinto', Jueves: 'Sexto', Viernes: 'Tercero' },
  { court: 'BASQUET', Lunes: 'Primero', Martes: 'Cuarto y Quinto', Miércoles: 'Sexto', Jueves: 'Segundo y Tercero', Viernes: 'Quinto' },
];

// -------------------------------------------------------------
// PROTOCOLO DE GUARDIA INSTITUCIONAL
// -------------------------------------------------------------
export const DUTY_PROTOCOL_CONTENT = {
  title: 'Protocolo Institucional de Guardias Escolares',
  objective: 'Garantizar la seguridad física, el cuidado socioemocional y la disciplina asertiva de todos los estudiantes en los momentos de entrada, receso, almuerzo y salida.',
  rules: [
    'Puntualidad Estricta: El docente debe presentarse en su puesto de guardia 5 minutos antes del inicio de la jornada (7:00 a.m. en entrada, 5 minutos antes en recesos y 3:25 p.m. en salida).',
    'Presencia Activa y Vigilancia: No permanecer sentado en esquinas ni utilizar teléfonos móviles para asuntos personales mientras se supervisa a los alumnos.',
    'Monitoreo de Espacios Críticos: Prestar especial atención a baños, pasillos oscuros, escaleras y perímetro de la cancha.',
    'Uso de Silbato y Radio: Portar silbato institucional para llamados de atención preventivos y comunicarse por canal de radio ante eventualidades o coordinación con portería y radiocarro.',
    'Protocolo de Salida (Monta Carros y Puerta): Mantener la fluidez vehicular y asegurar que ningún alumno de primaria o preescolar salga sin su representante acreditado.',
    'Accidentes o Conflictos: Ante cualquier caída o disputa entre alumnos, prestar primeros auxilios inmediatos o remitir a enfermería/coordinación reportando la novedad.'
  ]
};


