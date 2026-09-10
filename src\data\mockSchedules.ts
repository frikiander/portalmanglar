import { ClassSchedule, ClassScheduleCell, EventSchedule, ScheduleDay, SubjectCategory } from '../types';

export const SCHEDULE_DAYS: ScheduleDay[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export interface TimeSlotConfig {
  slot: string;
  isBreak?: boolean;
  breakType?: 'recreo' | 'almuerzo';
  label?: string;
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  { slot: '7:30 - 8:00', label: 'Rutina / Lectura' },
  { slot: '8:00 - 8:45', label: 'Período 1' },
  { slot: '8:45 - 9:30', label: 'Período 2' },
  { slot: '9:30 - 10:00', isBreak: true, breakType: 'recreo', label: 'RECREO' },
  { slot: '10:00 - 10:45', label: 'Período 3' },
  { slot: '10:45 - 11:30', label: 'Período 4' },
  { slot: '11:30 - 12:15', label: 'Período 5' },
  { slot: '12:15 - 12:45', isBreak: true, breakType: 'almuerzo', label: 'ALMUERZO' },
  { slot: '12:45 - 1:15', isBreak: true, breakType: 'recreo', label: 'RECREO' },
  { slot: '1:15 - 2:00', label: 'Período 6' },
  { slot: '2:00 - 2:45', label: 'Período 7' },
  { slot: '2:45 - 3:30', label: 'Período 8' },
];

export const SCHEDULE_TIME_SLOTS: string[] = TIME_SLOTS.map((t) => t.slot);

export const BREAK_SLOTS = TIME_SLOTS.filter((t) => t.isBreak).map((t) => ({
  time: t.slot,
  label: t.label || 'RECREO',
  type: t.breakType || 'recreo',
}));

export const GRADE_LIST: string[] = [
  '1er Grado',
  '2do Grado',
  '3er Grado',
  '4to Grado',
  '5to Grado',
  '6to Grado',
];

export const COMMON_SUBJECT_SUGGESTIONS: string[] = [
  'Matemática',
  'Lenguaje / Castellano',
  'Inglés (Language Arts)',
  'Proyecto de Aula',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Educación Física / Deporte',
  'Música',
  'Arte',
  'Robótica',
  'Tecnología',
  'Computación',
  'Francés',
  'Ajedrez',
  'Rutina Mañanera / Lectura',
];

// Helper to auto-categorize subject for beautiful visual color coding
export function detectSubjectCategory(subject: string): SubjectCategory {
  const s = subject.toLowerCase().trim();
  if (!s || s === 'recreo' || s === 'almuerzo') return 'recreo';
  if (s.includes('lengua') || s.includes('literatura') || s.includes('pt') || s.includes('cl') || s.includes('gram') || s.includes('lo')) {
    return 'lengua';
  }
  if (s.includes('matemática') || s.includes('matematica') || s.includes('geometría') || s.includes('geometria') || s.includes('prob') || s.includes('ev/quiz')) {
    return 'matematica';
  }
  if (s.includes('reading') || s.includes('speaking') || s.includes('listening') || s.includes('phonics') || s.includes('english') || s.includes('inglés') || s.includes('ingles') || s.includes('language arts') || s.includes('francés') || s.includes('frances') || s.includes('writing') || s.includes('club conversation')) {
    return 'ingles';
  }
  if (s.includes('ciencia') || s.includes('biología') || s.includes('laboratorio')) {
    return 'ciencia';
  }
  if (s.includes('sociales') || s.includes('historia') || s.includes('geografía')) {
    return 'sociales';
  }
  if (s.includes('física') || s.includes('fisica') || s.includes('deporte') || s.includes('educación física')) {
    return 'deporte';
  }
  if (s.includes('project') || s.includes('proyecto') || s.includes('eco-feria') || s.includes('ensayo') || s.includes('guión') || s.includes('guion') || s.includes('clausura')) {
    return 'proyecto';
  }
  if (s.includes('reunión grupal') || s.includes('lectura mañanera') || s.includes('taller mañanero') || s.includes('metacognición') || s.includes('psicomotricidad') || s.includes('conciencia')) {
    return 'rutina';
  }
  if (s.includes('musical') || s.includes('música') || s.includes('arte') || s.includes('ajedrez') || s.includes('tecnología') || s.includes('tecnologia') || s.includes('valores') || s.includes('adp') || s.includes('club')) {
    return 'especiales';
  }
  return 'otro';
}

// Visual color style mapping for subject category
export interface CategoryStyle {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  name: string;
}

export const CATEGORY_STYLES: Record<SubjectCategory, CategoryStyle> = {
  lengua: {
    bg: '#fee2e2', // soft rose
    text: '#991b1b',
    border: '#fca5a5',
    badgeBg: '#fecaca',
    name: 'Lengua y Literatura',
  },
  matematica: {
    bg: '#e0f2fe', // sky blue
    text: '#0369a1',
    border: '#7dd3fc',
    badgeBg: '#bae6fd',
    name: 'Matemática',
  },
  ingles: {
    bg: '#ede9fe', // lavender / violet
    text: '#6d28d9',
    border: '#c4b5fd',
    badgeBg: '#ddd6fe',
    name: 'Idiomas (Inglés / Francés)',
  },
  ciencia: {
    bg: '#ecfccb', // lime green
    text: '#3f6212',
    border: '#bef264',
    badgeBg: '#d9f99d',
    name: 'Ciencia',
  },
  sociales: {
    bg: '#ffedd5', // warm orange
    text: '#c2410c',
    border: '#fdba74',
    badgeBg: '#fed7aa',
    name: 'Sociales',
  },
  deporte: {
    bg: '#fef3c7', // amber / gold
    text: '#b45309',
    border: '#fcd34d',
    badgeBg: '#fde68a',
    name: 'Ed. Física / Deporte',
  },
  especiales: {
    bg: '#f3e8ff', // lilac / purple
    text: '#7e22ce',
    border: '#d8b4fe',
    badgeBg: '#e9d5ff',
    name: 'Especiales (Música, Arte, Francés, Tech, Ajedrez)',
  },
  proyecto: {
    bg: '#e0e7ff', // indigo / periwinkle
    text: '#3730a3',
    border: '#a5b4fc',
    badgeBg: '#c7d2fe',
    name: 'Proyecto de Aula',
  },
  rutina: {
    bg: '#fef9c3', // soft cream / warm light
    text: '#854d0e',
    border: '#fde047',
    badgeBg: '#fef08a',
    name: 'Rutina Mañanera / Lectura',
  },
  recreo: {
    bg: '#f1f5f9', // slate light
    text: '#475569',
    border: '#cbd5e1',
    badgeBg: '#e2e8f0',
    name: 'Recreo / Almuerzo',
  },
  otro: {
    bg: '#f8fafc',
    text: '#334155',
    border: '#e2e8f0',
    badgeBg: '#f1f5f9',
    name: 'General',
  },
};

// =========================================================================
// INITIAL CLASS SCHEDULES (SEMANA 13 - III LAPSO) FROM INSTITUTIONAL EXCEL
// =========================================================================

const RAW_CLASS_SCHEDULES = [
  // 1er Grado (Verde)
  {
    id: 'sched-1er-lapso3-w13',
    grade: '1er Grado',
    lapso: '3er Lapso',
    weekNumber: 13,
    updatedAt: '2026-06-12',
    updatedBy: 'Carlos Mendoza',
    notes: 'Semana de ensayos de cierre de proyecto y preparación para la Eco-Feria.',
    cells: {
      'Lunes_7:30 - 8:00': { subject: 'Psicomotricidad', category: 'rutina' },
      'Martes_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Miércoles_7:30 - 8:00': { subject: 'Metacognición', category: 'rutina' },
      'Jueves_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Viernes_7:30 - 8:00': { subject: 'Psicomotricidad', category: 'rutina' },

      'Lunes_8:00 - 8:45': { subject: 'LENGUA (AC)', category: 'lengua' },
      'Martes_8:00 - 8:45': { subject: 'MATEMÁTICA (ACN)', category: 'matematica' },
      'Miércoles_8:00 - 8:45': { subject: 'Use of english & Writing', category: 'ingles' },
      'Jueves_8:00 - 8:45': { subject: 'Reading', category: 'ingles' },
      'Viernes_8:00 - 8:45': { subject: 'MATEMÁTICA EV', category: 'matematica' },

      'Lunes_8:45 - 9:30': { subject: 'LENGUA (EAC)', category: 'lengua' },
      'Martes_8:45 - 9:30': { subject: 'MATEMATICA (EAC)', category: 'matematica' },
      'Miércoles_8:45 - 9:30': { subject: 'Use of english & Writing', category: 'ingles' },
      'Jueves_8:45 - 9:30': { subject: 'Speaking', category: 'ingles' },
      'Viernes_8:45 - 9:30': { subject: 'LENGUA (PT)', secondarySubject: 'Valores', category: 'lengua' },

      'Lunes_10:00 - 10:45': { subject: 'EDUCACIÓN FÍSICA', category: 'deporte' },
      'Martes_10:00 - 10:45': { subject: 'Ed. Musical', category: 'especiales' },
      'Miércoles_10:00 - 10:45': { subject: 'Conciencia fonológica', category: 'rutina' },
      'Jueves_10:00 - 10:45': { subject: 'Arte I', secondarySubject: 'Música II', category: 'especiales' },
      'Viernes_10:00 - 10:45': { subject: 'Project', category: 'proyecto' },

      'Lunes_10:45 - 11:30': { subject: 'Phonics', category: 'ingles' },
      'Martes_10:45 - 11:30': { subject: 'Reading', category: 'ingles' },
      'Miércoles_10:45 - 11:30': { subject: 'Tecnología I', secondarySubject: 'Francés II', category: 'especiales' },
      'Jueves_10:45 - 11:30': { subject: 'Música I', secondarySubject: 'Arte II', category: 'especiales' },
      'Viernes_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },

      'Lunes_11:30 - 12:15': { subject: 'Listening', category: 'ingles' },
      'Martes_11:30 - 12:15': { subject: 'Speaking', category: 'ingles' },
      'Miércoles_11:30 - 12:15': { subject: 'Francés I', secondarySubject: 'Tecnología II', category: 'especiales' },
      'Jueves_11:30 - 12:15': { subject: 'Deporte', category: 'deporte' },
      'Viernes_11:30 - 12:15': { subject: 'Francés', category: 'especiales' },

      'Lunes_1:15 - 2:00': { subject: 'LENGUA (CL)', category: 'lengua' },
      'Martes_1:15 - 2:00': { subject: 'LENGUA (GRAM)', category: 'lengua' },
      'Miércoles_1:15 - 2:00': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },
      'Jueves_1:15 - 2:00': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },
      'Viernes_1:15 - 2:00': { subject: 'VALORES', secondarySubject: 'LENGUA (PT)', category: 'especiales' },

      'Lunes_2:00 - 2:45': { subject: 'MATEMÁTICA (OB)', secondarySubject: 'Literatura I', category: 'matematica' },
      'Martes_2:00 - 2:45': { subject: 'AJEDREZ I', secondarySubject: 'Tecnología II', category: 'especiales' },
      'Miércoles_2:00 - 2:45': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },
      'Jueves_2:00 - 2:45': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },
      'Viernes_2:00 - 2:45': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },

      'Lunes_2:45 - 3:30': { subject: 'Literatura II', secondarySubject: 'MATEMÁTICA OB', category: 'lengua' },
      'Martes_2:45 - 3:30': { subject: 'Tecnología II', secondarySubject: 'Ajedrez I', category: 'especiales' },
      'Miércoles_2:45 - 3:30': { subject: 'MATEMÁTICA (EV)', category: 'matematica' },
      'Jueves_2:45 - 3:30': { subject: 'Matemática (PROB)', category: 'matematica' },
      'Viernes_2:45 - 3:30': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },
    }
  },

  // 2do Grado (Azul)
  {
    id: 'sched-2do-lapso3-w13',
    grade: '2do Grado',
    lapso: '3er Lapso',
    weekNumber: 13,
    updatedAt: '2026-06-12',
    updatedBy: 'Mariana Silva',
    notes: 'Bloques de Project intensivos en mañanas de miércoles a viernes.',
    cells: {
      'Lunes_7:30 - 8:00': { subject: 'Taller mañanero', category: 'rutina' },
      'Martes_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Miércoles_7:30 - 8:00': { subject: 'Taller mañanero', category: 'rutina' },
      'Jueves_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Viernes_7:30 - 8:00': { subject: 'Taller mañanero', category: 'rutina' },

      'Lunes_8:00 - 8:45': { subject: 'LENGUA (CL)', category: 'lengua' },
      'Martes_8:00 - 8:45': { subject: 'Geometría', category: 'matematica' },
      'Miércoles_8:00 - 8:45': { subject: 'Project', category: 'proyecto' },
      'Jueves_8:00 - 8:45': { subject: 'Project', category: 'proyecto' },
      'Viernes_8:00 - 8:45': { subject: 'Project', category: 'proyecto' },

      'Lunes_8:45 - 9:30': { subject: 'Tecnología I', secondarySubject: 'Francés II', category: 'especiales' },
      'Martes_8:45 - 9:30': { subject: 'Speaking', category: 'ingles' },
      'Miércoles_8:45 - 9:30': { subject: 'Project', category: 'proyecto' },
      'Jueves_8:45 - 9:30': { subject: 'Project', category: 'proyecto' },
      'Viernes_8:45 - 9:30': { subject: 'Project', category: 'proyecto' },

      'Lunes_10:00 - 10:45': { subject: 'Francés I', secondarySubject: 'Tecnología II', category: 'especiales' },
      'Martes_10:00 - 10:45': { subject: 'Tecnología I', secondarySubject: 'Arte II', category: 'especiales' },
      'Miércoles_10:00 - 10:45': { subject: 'MATEMÁTICA (PROB)', category: 'matematica' },
      'Jueves_10:00 - 10:45': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },
      'Viernes_10:00 - 10:45': { subject: 'EDUCACIÓN FÍSICA', category: 'deporte' },

      'Lunes_10:45 - 11:30': { subject: 'Phonics', category: 'ingles' },
      'Martes_10:45 - 11:30': { subject: 'Tecnología I', secondarySubject: 'Arte II', category: 'especiales' },
      'Miércoles_10:45 - 11:30': { subject: 'Música I', secondarySubject: 'Literatura II', category: 'especiales' },
      'Jueves_10:45 - 11:30': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },
      'Viernes_10:45 - 11:30': { subject: 'MATEMÁTICA (EV/Quiz)', category: 'matematica' },

      'Lunes_11:30 - 12:15': { subject: 'Listening', category: 'ingles' },
      'Martes_11:30 - 12:15': { subject: 'Ed. Musical', category: 'especiales' },
      'Miércoles_11:30 - 12:15': { subject: 'Literatura I', secondarySubject: 'Música II', category: 'lengua' },
      'Jueves_11:30 - 12:15': { subject: 'DEPORTE', category: 'deporte' },
      'Viernes_11:30 - 12:15': { subject: 'LENGUA (PT)', category: 'lengua' },

      'Lunes_1:15 - 2:00': { subject: 'MATEMÁTICA (ACN)', category: 'matematica' },
      'Martes_1:15 - 2:00': { subject: 'Reading', category: 'ingles' },
      'Miércoles_1:15 - 2:00': { subject: 'LENGUA (AC)', category: 'lengua' },
      'Jueves_1:15 - 2:00': { subject: 'VALORES I', secondarySubject: 'Ajedrez II', category: 'especiales' },
      'Viernes_1:15 - 2:00': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },

      'Lunes_2:00 - 2:45': { subject: 'MATEMATICA (EACN)', category: 'matematica' },
      'Martes_2:00 - 2:45': { subject: 'CIENCIA', category: 'ciencia' },
      'Miércoles_2:00 - 2:45': { subject: 'LENGUA (EAC)', category: 'lengua' },
      'Jueves_2:00 - 2:45': { subject: 'AJEDREZ I', secondarySubject: 'Valores II', category: 'especiales' },
      'Viernes_2:00 - 2:45': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },

      'Lunes_2:45 - 3:30': { subject: 'LENGUA (GRAM)', category: 'lengua' },
      'Martes_2:45 - 3:30': { subject: 'CIENCIA', category: 'ciencia' },
      'Miércoles_2:45 - 3:30': { subject: 'Francés', category: 'especiales' },
      'Jueves_2:45 - 3:30': { subject: 'MATEMÁTICA (OB)', category: 'matematica' },
      'Viernes_2:45 - 3:30': { subject: 'LENGUA (LO)', category: 'lengua' },
    }
  },

  // 3er Grado (Magenta)
  {
    id: 'sched-3er-lapso3-w13',
    grade: '3er Grado',
    lapso: '3er Lapso',
    weekNumber: 13,
    updatedAt: '2026-06-12',
    updatedBy: 'Luisa Fernanda',
    notes: 'Corrección de guión y elaboración de material de cierre de proyecto.',
    cells: {
      'Lunes_7:30 - 8:00': { subject: 'Taller mañanero', category: 'rutina' },
      'Martes_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Miércoles_7:30 - 8:00': { subject: 'Taller mañanero', category: 'rutina' },
      'Jueves_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Viernes_7:30 - 8:00': { subject: 'Taller mañanero', category: 'rutina' },

      'Lunes_8:00 - 8:45': { subject: 'Phonics', category: 'ingles' },
      'Martes_8:00 - 8:45': { subject: 'Arte', secondarySubject: 'Valores', category: 'especiales' },
      'Miércoles_8:00 - 8:45': { subject: 'Ajedrez I', secondarySubject: 'Literatura II', category: 'especiales' },
      'Jueves_8:00 - 8:45': { subject: 'Corrección de guión cierre de proyecto', category: 'proyecto', isVariation: true },
      'Viernes_8:00 - 8:45': { subject: 'Música I', secondarySubject: 'Tecnología II', category: 'especiales' },

      'Lunes_8:45 - 9:30': { subject: 'Listening', category: 'ingles' },
      'Martes_8:45 - 9:30': { subject: 'Valores', secondarySubject: 'Arte', category: 'especiales' },
      'Miércoles_8:45 - 9:30': { subject: 'Literatura I', secondarySubject: 'Ajedrez II', category: 'lengua' },
      'Jueves_8:45 - 9:30': { subject: 'Repaso Francés', category: 'especiales' },
      'Viernes_8:45 - 9:30': { subject: 'Tecnología I', secondarySubject: 'Música II', category: 'especiales' },

      'Lunes_10:00 - 10:45': { subject: 'SOCIALES', category: 'sociales' },
      'Martes_10:00 - 10:45': { subject: 'LENGUA (GRAM)', category: 'lengua' },
      'Miércoles_10:00 - 10:45': { subject: 'EDUCACIÓN FÍSICA', category: 'deporte' },
      'Jueves_10:00 - 10:45': { subject: 'Project', category: 'proyecto' },
      'Viernes_10:00 - 10:45': { subject: 'Project', category: 'proyecto' },

      'Lunes_10:45 - 11:30': { subject: 'SOCIALES', category: 'sociales' },
      'Martes_10:45 - 11:30': { subject: 'Reading', category: 'ingles' },
      'Miércoles_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },
      'Jueves_10:45 - 11:30': { subject: 'Ed. Musical', category: 'especiales' },
      'Viernes_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },

      'Lunes_11:30 - 12:15': { subject: 'MATEMÁTICA (OB)', category: 'matematica' },
      'Martes_11:30 - 12:15': { subject: 'Speaking', category: 'ingles' },
      'Miércoles_11:30 - 12:15': { subject: 'Project', category: 'proyecto' },
      'Jueves_11:30 - 12:15': { subject: 'Matemática (PROB)', secondarySubject: 'Francés', category: 'matematica' },
      'Viernes_11:30 - 12:15': { subject: 'Elaboración material cierre de proyecto', category: 'proyecto', isVariation: true },

      'Lunes_1:15 - 2:00': { subject: 'LENGUA (CL)', category: 'lengua' },
      'Martes_1:15 - 2:00': { subject: 'MATEMÁTICA (ACN)', category: 'matematica' },
      'Miércoles_1:15 - 2:00': { subject: 'Geometría', category: 'matematica' },
      'Jueves_1:15 - 2:00': { subject: 'Project', category: 'proyecto' },
      'Viernes_1:15 - 2:00': { subject: 'DEPORTE', category: 'deporte' },

      'Lunes_2:00 - 2:45': { subject: 'Francés I', secondarySubject: 'Tecnología II', category: 'especiales' },
      'Martes_2:00 - 2:45': { subject: 'MATEMÁTICA (EACN)', category: 'matematica' },
      'Miércoles_2:00 - 2:45': { subject: 'Elaboración de guión cierre de proyecto', category: 'proyecto', isVariation: true },
      'Jueves_2:00 - 2:45': { subject: 'Elaboración material cierre de proyecto', category: 'proyecto', isVariation: true },
      'Viernes_2:00 - 2:45': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },

      'Lunes_2:45 - 3:30': { subject: 'Tecnología I', secondarySubject: 'Francés II', category: 'especiales' },
      'Martes_2:45 - 3:30': { subject: 'LENGUA (LO)', category: 'lengua' },
      'Miércoles_2:45 - 3:30': { subject: 'Elaboración de guión cierre de proyecto', category: 'proyecto', isVariation: true },
      'Jueves_2:45 - 3:30': { subject: 'Elaboración material cierre de proyecto', category: 'proyecto', isVariation: true },
      'Viernes_2:45 - 3:30': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },
    }
  },

  // 4to Grado (Púrpura #941D80)
  {
    id: 'sched-4to-lapso3-w13',
    grade: '4to Grado',
    lapso: '3er Lapso',
    weekNumber: 13,
    updatedAt: '2026-06-12',
    updatedBy: 'Carlos Mendoza',
    notes: 'Jornada integral con Club Conversation, Ciencias y Proyecto ambiental.',
    cells: {
      'Lunes_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Martes_7:30 - 8:00': { subject: 'Club Conversation', category: 'ingles' },
      'Miércoles_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Jueves_7:30 - 8:00': { subject: 'Club Conversation', category: 'ingles' },
      'Viernes_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },

      'Lunes_8:00 - 8:45': { subject: 'Literatura I', secondarySubject: 'Valores II', category: 'lengua' },
      'Martes_8:00 - 8:45': { subject: 'Speaking', category: 'ingles' },
      'Miércoles_8:00 - 8:45': { subject: 'Arte I', secondarySubject: 'LENGUA (PT)', category: 'especiales' },
      'Jueves_8:00 - 8:45': { subject: 'Tecnología I', secondarySubject: 'Geometría II', category: 'especiales' },
      'Viernes_8:00 - 8:45': { subject: 'Project', category: 'proyecto' },

      'Lunes_8:45 - 9:30': { subject: 'Phonics', category: 'ingles' },
      'Martes_8:45 - 9:30': { subject: 'Reading', category: 'ingles' },
      'Miércoles_8:45 - 9:30': { subject: 'Arte II', secondarySubject: 'LENGUA (PT)', category: 'especiales' },
      'Jueves_8:45 - 9:30': { subject: 'Tecnología I', secondarySubject: 'Geometría II', category: 'especiales' },
      'Viernes_8:45 - 9:30': { subject: 'Project', category: 'proyecto' },

      'Lunes_10:00 - 10:45': { subject: 'Listening', category: 'ingles' },
      'Martes_10:00 - 10:45': { subject: 'Francés', secondarySubject: 'Ajedrez', category: 'especiales' },
      'Miércoles_10:00 - 10:45': { subject: 'MATEMÁTICA (PROB)', category: 'matematica' },
      'Jueves_10:00 - 10:45': { subject: 'Ed. Musical', category: 'especiales' },
      'Viernes_10:00 - 10:45': { subject: 'Música I', secondarySubject: 'Tecnología II', category: 'especiales' },

      'Lunes_10:45 - 11:30': { subject: 'LENGUA (CL)', category: 'lengua' },
      'Martes_10:45 - 11:30': { subject: 'AJEDREZ', secondarySubject: 'Francés', category: 'especiales' },
      'Miércoles_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },
      'Jueves_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },
      'Viernes_10:45 - 11:30': { subject: 'Tecnología I', secondarySubject: 'Música II', category: 'especiales' },

      'Lunes_11:30 - 12:15': { subject: 'Valores I', secondarySubject: 'Literatura II', category: 'especiales' },
      'Martes_11:30 - 12:15': { subject: 'LENGUA (GRAM)', category: 'lengua' },
      'Miércoles_11:30 - 12:15': { subject: 'Project', category: 'proyecto' },
      'Jueves_11:30 - 12:15': { subject: 'LENGUA AC', category: 'lengua' },
      'Viernes_11:30 - 12:15': { subject: 'MATEMÁTICA (EV/QUIZ)', category: 'matematica' },

      'Lunes_1:15 - 2:00': { subject: 'CIENCIA', category: 'ciencia' },
      'Martes_1:15 - 2:00': { subject: 'EDUCACIÓN FÍSICA', category: 'deporte' },
      'Miércoles_1:15 - 2:00': { subject: 'SOCIALES', category: 'sociales' },
      'Jueves_1:15 - 2:00': { subject: 'Project', category: 'proyecto' },
      'Viernes_1:15 - 2:00': { subject: 'DEPORTE', category: 'deporte' },

      'Lunes_2:00 - 2:45': { subject: 'CIENCIA', category: 'ciencia' },
      'Martes_2:00 - 2:45': { subject: 'MATEMÁTICA (ACN)', category: 'matematica' },
      'Miércoles_2:00 - 2:45': { subject: 'SOCIALES', category: 'sociales' },
      'Jueves_2:00 - 2:45': { subject: 'LENGUA EAC', category: 'lengua' },
      'Viernes_2:00 - 2:45': { subject: 'PROYECTO', category: 'proyecto' },

      'Lunes_2:45 - 3:30': { subject: 'MATEMÁTICA (OB)', category: 'matematica' },
      'Martes_2:45 - 3:30': { subject: 'MATEMÁTICA (EACN)', category: 'matematica' },
      'Miércoles_2:45 - 3:30': { subject: 'LENGUA (LO)', category: 'lengua' },
      'Jueves_2:45 - 3:30': { subject: 'Francés', category: 'especiales' },
      'Viernes_2:45 - 3:30': { subject: 'PROYECTO', category: 'proyecto' },
    }
  },

  // 5to Grado (Azul Marino #004080)
  {
    id: 'sched-5to-lapso3-w13',
    grade: '5to Grado',
    lapso: '3er Lapso',
    weekNumber: 13,
    updatedAt: '2026-06-12',
    updatedBy: 'Andrés Bello',
    notes: 'Jueves tarde: Estudiantina sube a HUB para ensayos institucionales.',
    cells: {
      'Lunes_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Martes_7:30 - 8:00': { subject: 'Club Conversation', category: 'ingles' },
      'Miércoles_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Jueves_7:30 - 8:00': { subject: 'Club Conversation', category: 'ingles' },
      'Viernes_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },

      'Lunes_8:00 - 8:45': { subject: 'LENGUA (CL)', category: 'lengua' },
      'Martes_8:00 - 8:45': { subject: 'Literatura I', secondarySubject: 'Tecnología II', category: 'lengua' },
      'Miércoles_8:00 - 8:45': { subject: 'Elaboración material cierre de proyecto', category: 'proyecto', isVariation: true },
      'Jueves_8:00 - 8:45': { subject: 'ADP I', secondarySubject: 'MATEMÁTICA (OB)', category: 'matematica' },
      'Viernes_8:00 - 8:45': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },

      'Lunes_8:45 - 9:30': { subject: 'Speaking', category: 'ingles' },
      'Martes_8:45 - 9:30': { subject: 'Tecnología I', secondarySubject: 'Literatura II', category: 'especiales' },
      'Miércoles_8:45 - 9:30': { subject: 'Elaboración material cierre de proyecto', category: 'proyecto', isVariation: true },
      'Jueves_8:45 - 9:30': { subject: 'MATEMÁTICA (OB)', secondarySubject: 'ADP II', category: 'matematica' },
      'Viernes_8:45 - 9:30': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },

      'Lunes_10:00 - 10:45': { subject: 'Listening', category: 'ingles' },
      'Martes_10:00 - 10:45': { subject: 'EDUCACIÓN FÍSICA', category: 'deporte' },
      'Miércoles_10:00 - 10:45': { subject: 'Matemática (PROB)', category: 'matematica' },
      'Jueves_10:00 - 10:45': { subject: 'Project', category: 'proyecto' },
      'Viernes_10:00 - 10:45': { subject: 'DEPORTE', category: 'deporte' },

      'Lunes_10:45 - 11:30': { subject: 'Música I', secondarySubject: 'Arte II', category: 'especiales' },
      'Martes_10:45 - 11:30': { subject: 'Reading Comprehension', category: 'ingles' },
      'Miércoles_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },
      'Jueves_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },
      'Viernes_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },

      'Lunes_11:30 - 12:15': { subject: 'Arte I', secondarySubject: 'Música II', category: 'especiales' },
      'Martes_11:30 - 12:15': { subject: 'Reading Comprehension', category: 'ingles' },
      'Miércoles_11:30 - 12:15': { subject: 'Project', category: 'proyecto' },
      'Jueves_11:30 - 12:15': { subject: 'CLUB', category: 'especiales' },
      'Viernes_11:30 - 12:15': { subject: 'Project', category: 'proyecto' },

      'Lunes_1:15 - 2:00': { subject: 'MATEMÁTICA (ACN)', category: 'matematica' },
      'Martes_1:15 - 2:00': { subject: 'Francés', category: 'especiales' },
      'Miércoles_1:15 - 2:00': { subject: 'LENGUA (GRAM)', category: 'lengua' },
      'Jueves_1:15 - 2:00': { subject: 'Geometría', category: 'matematica' },
      'Viernes_1:15 - 2:00': { subject: 'Francés I', secondarySubject: 'Tecnología II', category: 'especiales' },

      'Lunes_2:00 - 2:45': { subject: 'MATEMATICA (EACN)', category: 'matematica' },
      'Martes_2:00 - 2:45': { subject: 'LENGUA AC', category: 'lengua' },
      'Miércoles_2:00 - 2:45': { subject: 'Club', category: 'especiales' },
      'Jueves_2:00 - 2:45': { subject: 'Ensayo cierre de proyecto', secondarySubject: 'Estudiantina sube a HUB', category: 'proyecto', isVariation: true },
      'Viernes_2:00 - 2:45': { subject: 'Tecnología I', secondarySubject: 'Francés II', category: 'especiales' },

      'Lunes_2:45 - 3:30': { subject: 'LENGUA (PT)', category: 'lengua' },
      'Martes_2:45 - 3:30': { subject: 'LENGUA EAC', category: 'lengua' },
      'Miércoles_2:45 - 3:30': { subject: 'Club', category: 'especiales' },
      'Jueves_2:45 - 3:30': { subject: 'Ensayo cierre de proyecto', secondarySubject: 'Estudiantina sube a HUB', category: 'proyecto', isVariation: true },
      'Viernes_2:45 - 3:30': { subject: 'MATEMÁTICA (EV)', category: 'matematica' },
    }
  },

  // 6to Grado (Cian #5CE1E6)
  {
    id: 'sched-6to-lapso3-w13',
    grade: '6to Grado',
    lapso: '3er Lapso',
    weekNumber: 13,
    updatedAt: '2026-06-12',
    updatedBy: 'Patricia Parra',
    notes: 'Viernes: Evaluación de Comprensión Lectora (CL) y repaso de Sociales.',
    cells: {
      'Lunes_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Martes_7:30 - 8:00': { subject: 'Club Conversation', category: 'ingles' },
      'Miércoles_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },
      'Jueves_7:30 - 8:00': { subject: 'Club Conversation', category: 'ingles' },
      'Viernes_7:30 - 8:00': { subject: 'Reunión grupal Lectura mañanera', category: 'rutina' },

      'Lunes_8:00 - 8:45': { subject: 'LENGUA (GRAM)', category: 'lengua' },
      'Martes_8:00 - 8:45': { subject: 'MATEMÁTICA', category: 'matematica' },
      'Miércoles_8:00 - 8:45': { subject: 'Tecnología I', secondarySubject: 'Música II', category: 'especiales' },
      'Jueves_8:00 - 8:45': { subject: 'Arte I', secondarySubject: 'Literatura II', category: 'especiales' },
      'Viernes_8:00 - 8:45': { subject: 'EVALUACIÓN DE CL', category: 'lengua', isVariation: true },

      'Lunes_8:45 - 9:30': { subject: 'Speaking', category: 'ingles' },
      'Martes_8:45 - 9:30': { subject: 'MATEMÁTICA (OB)', category: 'matematica' },
      'Miércoles_8:45 - 9:30': { subject: 'Música I', secondarySubject: 'Tecnología II', category: 'especiales' },
      'Jueves_8:45 - 9:30': { subject: 'Literatura I', secondarySubject: 'Arte II', category: 'lengua' },
      'Viernes_8:45 - 9:30': { subject: 'EVALUACIÓN DE CL', category: 'lengua', isVariation: true },

      'Lunes_10:00 - 10:45': { subject: 'Listening', category: 'ingles' },
      'Martes_10:00 - 10:45': { subject: 'EDUCACIÓN FÍSICA', category: 'deporte' },
      'Miércoles_10:00 - 10:45': { subject: 'LENGUA (CL)', category: 'lengua' },
      'Jueves_10:00 - 10:45': { subject: 'Project', category: 'proyecto' },
      'Viernes_10:00 - 10:45': { subject: 'Project', category: 'proyecto' },

      'Lunes_10:45 - 11:30': { subject: 'Tecnología I', secondarySubject: 'Francés II', category: 'especiales' },
      'Martes_10:45 - 11:30': { subject: 'Reading Comprehension', category: 'ingles' },
      'Miércoles_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },
      'Jueves_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },
      'Viernes_10:45 - 11:30': { subject: 'Project', category: 'proyecto' },

      'Lunes_11:30 - 12:15': { subject: 'Francés I', secondarySubject: 'Tecnología II', category: 'especiales' },
      'Martes_11:30 - 12:15': { subject: 'Reading Comprehension', category: 'ingles' },
      'Miércoles_11:30 - 12:15': { subject: 'Project', category: 'proyecto' },
      'Jueves_11:30 - 12:15': { subject: 'CLUB', category: 'especiales' },
      'Viernes_11:30 - 12:15': { subject: 'Deporte', category: 'deporte' },

      'Lunes_1:15 - 2:00': { subject: 'SOCIALES', category: 'sociales' },
      'Martes_1:15 - 2:00': { subject: 'Lengua PT', category: 'lengua' },
      'Miércoles_1:15 - 2:00': { subject: 'MATEMÁTICA', category: 'matematica' },
      'Jueves_1:15 - 2:00': { subject: 'MATEMÁTICA (EV)', category: 'matematica' },
      'Viernes_1:15 - 2:00': { subject: 'Repaso evaluación lapso de SOCIALES', category: 'sociales', isVariation: true },

      'Lunes_2:00 - 2:45': { subject: 'MATEMÁTICA', category: 'matematica' },
      'Martes_2:00 - 2:45': { subject: 'ADP', category: 'especiales' },
      'Miércoles_2:00 - 2:45': { subject: 'CLUB', category: 'especiales' },
      'Jueves_2:00 - 2:45': { subject: 'CIENCIA', secondarySubject: 'Estudiantina sube a HUB', category: 'ciencia', isVariation: true },
      'Viernes_2:00 - 2:45': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },

      'Lunes_2:45 - 3:30': { subject: 'Geometría', category: 'matematica' },
      'Martes_2:45 - 3:30': { subject: 'Francés', category: 'especiales' },
      'Miércoles_2:45 - 3:30': { subject: 'CLUB', category: 'especiales' },
      'Jueves_2:45 - 3:30': { subject: 'CIENCIA', category: 'ciencia' },
      'Viernes_2:45 - 3:30': { subject: 'Ensayo cierre de proyecto', category: 'proyecto', isVariation: true },
    }
  }
];

export const INITIAL_CLASS_SCHEDULES: ClassSchedule[] = (
  RAW_CLASS_SCHEDULES as unknown as Array<{
    id: string;
    grade: string;
    lapso: string;
    weekNumber: number;
    updatedAt: string;
    updatedBy: string;
    notes?: string;
    cells: Record<string, ClassScheduleCell>;
  }>
).map((s) => ({
  schoolYear: '2025-2026',
  isSaved: true,
  ...s,
}));

// =========================================================================
// INITIAL EVENT SCHEDULES (CREADOS DESDE COORDINACIÓN PARA DOCENTES)
// =========================================================================

export const INITIAL_EVENT_SCHEDULES: EventSchedule[] = [
  {
    id: 'evt-cierre-proyecto-w13',
    schoolYear: '2025-2026',
    title: 'Horario Especial: Cierre de Proyectos de Aula y Eco-Feria Verde',
    description: 'Cronograma institucional coordinado para montaje de stands, ensayos generales con la estudiantina y apertura a las familias.',
    lapso: '3er Lapso',
    weekNumber: 13,
    dateRange: 'Semana 13 (Lunes a Viernes)',
    targetGrades: ['Todos los Grados (1° a 6°)'],
    status: 'published',
    coordinatorNotes: 'Docentes tutores supervisan en sus áreas designadas. El sonido y paneles estarán a cargo del equipo de logística e informática.',
    createdAt: '2026-06-08',
    updatedAt: '2026-06-10',
    slots: [
      {
        id: 'slot-cierre-1',
        day: 'Miércoles',
        time: '1:15 - 3:30',
        activity: 'Ensayo General y Montaje de Guiones por Salones',
        location: 'Aulas de 1° a 6° Grado',
        responsiblePerson: 'Docentes Guías + Especialistas',
        targetGrades: ['1er Grado', '2do Grado', '3er Grado', '4to Grado'],
        badgeColor: '#e0e7ff',
        notes: 'Ajuste de escenografía reciclada y distribución de ponencias estudiantiles.'
      },
      {
        id: 'slot-cierre-2',
        day: 'Jueves',
        time: '2:00 - 3:30',
        activity: 'Estudiantina sube a HUB + Ensayos de Canto y Clausura',
        location: 'HUB Tecnológico / Auditorio',
        responsiblePerson: 'Prof. de Música + Coordinación Cultural',
        targetGrades: ['5to Grado', '6to Grado'],
        badgeColor: '#f3e8ff',
        notes: 'Coordinar traslado ordenado de instrumentos musicales.'
      },
      {
        id: 'slot-cierre-3',
        day: 'Viernes',
        time: '10:00 - 12:15',
        activity: 'Montaje de Stands y Paneles de la Eco-Feria',
        location: 'Patio Techado y Cancha Deportiva',
        responsiblePerson: 'Comité de Ciencias y Docentes Titulares',
        targetGrades: ['Todos los Grados'],
        badgeColor: '#ecfccb',
        notes: 'Instalación de maquetas, infografías y muestras de huerto escolar.'
      },
      {
        id: 'slot-cierre-4',
        day: 'Viernes',
        time: '1:15 - 3:30',
        activity: 'Apertura de la Eco-Feria, Presentación de Proyectos y Clausura',
        location: 'Patio Central',
        responsiblePerson: 'Dirección y Coordinación Académica',
        targetGrades: ['Todos los Grados'],
        badgeColor: '#fef08a',
        notes: 'Entrada de representantes acreditados y evaluación formativa comunitaria.'
      }
    ]
  },
  {
    id: 'evt-olimpiadas-matematica',
    schoolYear: '2025-2026',
    title: 'Horario Especial: Festival de Habilidades y Olimpiada de Deporte',
    description: 'Jornada especial de encuentro interdisciplinario entre grados, dinámicas de cálculo lúdico y torneos inter-secciones.',
    lapso: '3er Lapso',
    weekNumber: 11,
    dateRange: 'Semana 11 (Martes y Jueves)',
    targetGrades: ['3er Grado', '4to Grado', '5to Grado', '6to Grado'],
    status: 'published',
    coordinatorNotes: 'Se suspenden las materias regulares durante los bloques indicados para dar paso a las competencias en canchas.',
    createdAt: '2026-05-25',
    updatedAt: '2026-05-27',
    slots: [
      {
        id: 'slot-olimp-1',
        day: 'Martes',
        time: '10:00 - 11:30',
        activity: 'Olimpiada de Cálculo Mental y Desafíos Matemáticos',
        location: 'Salón Múltiple',
        responsiblePerson: 'Equipo de Matemática + Tutores',
        targetGrades: ['3er Grado', '4to Grado'],
        badgeColor: '#e0f2fe',
        notes: 'Rondas eliminatorias por equipos cooperativos.'
      },
      {
        id: 'slot-olimp-2',
        day: 'Jueves',
        time: '10:00 - 12:15',
        activity: 'Torneo Relámpago de Baloncesto y Kickingball',
        location: 'Canchas Deportivas 1 y 2',
        responsiblePerson: 'Coordinación de Deportes',
        targetGrades: ['5to Grado', '6to Grado'],
        badgeColor: '#fef3c7',
        notes: 'Asegurar puntos de hidratación para los estudiantes.'
      }
    ]
  }
];
