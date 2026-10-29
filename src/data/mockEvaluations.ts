import { EvaluationRecord, EvaluationMoment, GradeScale, TestAdaptationType } from '../types';
import { INITIAL_STUDENTS_DATA } from './mockRoster';

export const AVAILABLE_SCHOOL_YEARS = ['2025-2026', '2024-2025', '2026-2027'] as const;

export const AVAILABLE_LAPSOS = ['1er Lapso', '2do Lapso', '3er Lapso'] as const;

export const AVAILABLE_EVALUATION_MOMENTS: {
  id: EvaluationMoment;
  label: string;
  shortLabel: string;
  description: string;
  weight: string;
}[] = [
  {
    id: 'mensual_1',
    label: 'Mensual I',
    shortLabel: 'M-I',
    description: 'Primera evaluación mensual de contenidos del lapso',
    weight: '25%',
  },
  {
    id: 'mensual_2',
    label: 'Mensual II',
    shortLabel: 'M-II',
    description: 'Segunda evaluación mensual de contenidos del lapso',
    weight: '25%',
  },
  {
    id: 'mensual_3',
    label: 'Mensual III',
    shortLabel: 'M-III',
    description: 'Tercera evaluación mensual de contenidos del lapso',
    weight: '25%',
  },
  {
    id: 'examen_lapso',
    label: 'Examen de Lapso',
    shortLabel: 'E-Lapso',
    description: 'Prueba integradora acumulativa de fin de lapso',
    weight: '25%',
  },
];

export const AVAILABLE_SUBJECTS = [
  'Matemática',
  'Lengua y Literatura',
  'Ciencias de la Naturaleza y Tecnología',
  'Ciencias Sociales',
  'Inglés',
  'Francés',
  'Robótica',
  'Tecnología',
  'Computación',
  'Educación Física y Deportes',
  'Educación Estética / Arte',
  'Música',
] as const;

export const GRADE_SCALE_CONFIG: Record<
  GradeScale,
  {
    label: string;
    description: string;
    range: string;
    bgBadge: string;
    buttonActive: string;
    textBadge: string;
    border: string;
  }
> = {
  A: {
    label: 'Excelente / Consolidado',
    description: 'Dominio excepcional de las competencias pedagógicas evaluadas',
    range: '19 - 20 pts',
    bgBadge: 'bg-success-50 text-success-700 border-success-300',
    buttonActive: 'bg-success-600 text-white shadow-md ring-2 ring-success-400',
    textBadge: 'text-success-700',
    border: 'border-success-500',
  },
  B: {
    label: 'Muy Bueno / Avanzado',
    description: 'Demuestra dominio satisfactorio con mínima orientación',
    range: '16 - 18 pts',
    bgBadge: 'bg-info-50 text-info-700 border-info-300',
    buttonActive: 'bg-info-600 text-white shadow-md ring-2 ring-info-400',
    textBadge: 'text-info-700',
    border: 'border-info-500',
  },
  C: {
    label: 'Bueno / En Desarrollo',
    description: 'Alcanza las competencias requeridas con acompañamiento regular',
    range: '13 - 15 pts',
    bgBadge: 'bg-primary-50 text-primary-700 border-primary-300',
    buttonActive: 'bg-primary-600 text-white shadow-md ring-2 ring-primary-400',
    textBadge: 'text-primary-700',
    border: 'border-primary-500',
  },
  D: {
    label: 'Regular / Acompañamiento',
    description: 'Requiere nivelación específica y seguimiento continuo',
    range: '10 - 12 pts',
    bgBadge: 'bg-warning-50 text-warning-800 border-warning-300',
    buttonActive: 'bg-warning-500 text-white shadow-md ring-2 ring-warning-400',
    textBadge: 'text-warning-800',
    border: 'border-warning-500',
  },
  E: {
    label: 'Insuficiente / No Alcanzado',
    description: 'No alcanza los objetivos mínimos previstos en la unidad',
    range: '01 - 09 pts',
    bgBadge: 'bg-danger-50 text-danger-700 border-danger-300',
    buttonActive: 'bg-danger-600 text-white shadow-md ring-2 ring-danger-400',
    textBadge: 'text-danger-700',
    border: 'border-danger-500',
  },
  SE: {
    label: 'Sin Evaluación (SE)',
    description: 'Inasistencia justificada, reposo o prueba reprogramada',
    range: 'Pendiente',
    bgBadge: 'bg-slate-100 text-slate-700 border-slate-300',
    buttonActive: 'bg-slate-600 text-white shadow-md ring-2 ring-slate-400',
    textBadge: 'text-slate-700',
    border: 'border-slate-400',
  },
};

export const ADAPTATION_CONFIG: Record<
  TestAdaptationType,
  {
    label: string;
    shortLabel: string;
    description: string;
    badgeStyle: string;
    activeStyle: string;
  }
> = {
  regular: {
    label: 'Prueba Regular (Sin adaptación)',
    shortLabel: 'Regular',
    description: 'Evaluación general estandarizada sin modificaciones metodológicas',
    badgeStyle: 'bg-slate-100 text-slate-600 border-slate-200',
    activeStyle: 'bg-slate-700 text-white shadow-xs',
  },
  'AC+': {
    label: 'AC+ (Altas Capacidades / Enriquecimiento)',
    shortLabel: 'AC+',
    description: 'Adaptación de enriquecimiento curricular o reactivos de mayor profundidad de análisis',
    badgeStyle: 'bg-info-50 text-info-700 border-info-300 font-bold',
    activeStyle: 'bg-info-600 text-white shadow-xs ring-2 ring-info-300',
  },
  'AC-': {
    label: 'AC- (Acceso / Apoyo Psicopedagógico)',
    shortLabel: 'AC-',
    description: 'Adecuación de formato, tiempo extendido, reactivos segmentados o mediación DECE',
    badgeStyle: 'bg-warning-50 text-warning-800 border-warning-300 font-bold',
    activeStyle: 'bg-warning-600 text-white shadow-xs ring-2 ring-warning-300',
  },
};

// Generar calificaciones iniciales realistas para 2do Grado
const students2doGrado = INITIAL_STUDENTS_DATA.filter((s) => s.grade === '2do Grado');

export const INITIAL_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 'eval-2025-2ga-mat-m1',
    schoolYear: '2025-2026',
    grade: '2do Grado',
    subject: 'Matemática',
    lapso: '1er Lapso',
    moment: 'mensual_1',
    title: 'Evaluación Mensual I: Sentido Numérico y Sumas de Tres Dígitos',
    teacherId: 'usr-1',
    teacherName: 'Prof. Carlos Mendoza',
    status: 'audited',
    auditedBy: 'Dra. María Eugenia Torres (Coordinación Primaria)',
    auditedAt: '2025-10-24 10:30',
    auditNotes: 'Planilla auditada en su totalidad. Se verificaron las adecuaciones curriculares AC- de los estudiantes con apoyo psicopedagógico.',
    createdAt: '2025-10-20',
    updatedAt: '2025-10-24',
    grades: students2doGrado.map((s, idx) => {
      // Casos representativos
      let grade: GradeScale = 'A';
      let adaptation: TestAdaptationType = 'regular';
      let obs = '';

      if (idx === 0) {
        grade = 'A';
        adaptation = 'regular';
        obs = 'Resolución rápida y limpia de los problemas con cálculo mental.';
      } else if (idx === 1) {
        grade = 'B';
        adaptation = 'regular';
        obs = 'Buen manejo procedimental en operaciones con reagrupación.';
      } else if (idx === 3) {
        grade = 'AC+' as any; // will set below
        adaptation = 'AC+';
        grade = 'A';
        obs = 'Presentó reto matemático ampliado de pensamiento lógico. Destacado.';
      } else if (idx === 4) {
        grade = 'C';
        adaptation = 'AC-';
        obs = 'Tiempo extendido y apoyo en lectura de enunciados con material concreto.';
      } else if (idx === 6) {
        grade = 'SE';
        adaptation = 'regular';
        obs = 'Inasistencia con reposo médico. Presentará evaluación diferida el viernes.';
      } else if (idx % 5 === 0) {
        grade = 'B';
        adaptation = 'regular';
      } else if (idx % 3 === 0) {
        grade = 'C';
        adaptation = 'regular';
        obs = 'Repasar tabla posicional y verificación de resultados.';
      } else {
        grade = 'A';
        adaptation = 'regular';
      }

      return {
        studentId: s.id,
        studentName: s.fullName,
        schoolId: s.schoolId,
        orderNumber: s.orderNumber,
        gradeValue: grade,
        adaptation,
        observations: obs,
        updatedAt: '2025-10-22',
      };
    }),
  },
  {
    id: 'eval-2025-2ga-len-m1',
    schoolYear: '2025-2026',
    grade: '2do Grado',
    subject: 'Lengua y Literatura',
    lapso: '1er Lapso',
    moment: 'mensual_1',
    title: 'Evaluación Mensual I: Comprensión Lectora y Signos de Puntuación',
    teacherId: 'usr-1',
    teacherName: 'Prof. Carlos Mendoza',
    status: 'submitted',
    createdAt: '2025-10-25',
    updatedAt: '2025-10-28',
    grades: students2doGrado.map((s, idx) => ({
      studentId: s.id,
      studentName: s.fullName,
      schoolId: s.schoolId,
      orderNumber: s.orderNumber,
      gradeValue: idx === 6 ? 'SE' : (idx % 4 === 0 ? 'B' : idx % 7 === 0 ? 'C' : 'A'),
      adaptation: idx === 4 ? 'AC-' : idx === 3 ? 'AC+' : 'regular',
      observations: idx === 4 ? 'Se utilizó tipografía de mayor tamaño y segmentación de párrafos.' : '',
      updatedAt: '2025-10-28',
    })),
  },
  {
    id: 'eval-2025-2ga-mat-m2',
    schoolYear: '2025-2026',
    grade: '2do Grado',
    subject: 'Matemática',
    lapso: '1er Lapso',
    moment: 'mensual_2',
    title: 'Evaluación Mensual II: Sustracciones Complejas y Figuras Geométricas',
    teacherId: 'usr-1',
    teacherName: 'Prof. Carlos Mendoza',
    status: 'draft',
    createdAt: '2025-11-15',
    updatedAt: '2025-11-18',
    grades: students2doGrado.map((s, idx) => ({
      studentId: s.id,
      studentName: s.fullName,
      schoolId: s.schoolId,
      orderNumber: s.orderNumber,
      gradeValue: idx < 12 ? (idx % 2 === 0 ? 'A' : 'B') : undefined,
      adaptation: idx === 4 ? 'AC-' : 'regular',
      observations: '',
      updatedAt: '2025-11-18',
    })),
  },
];
