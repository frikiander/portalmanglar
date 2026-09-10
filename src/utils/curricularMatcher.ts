/**
 * curricularMatcher.ts
 * Normalización y comparación inteligente de asignaturas y grados escolares
 * para el Colegio Integral El Manglar.
 *
 * Resuelve discrepancias de nombres y alias comunes:
 * - English <-> Inglés <-> Inglés (Language Arts) <-> Language Arts
 * - Matemática <-> Matemáticas <-> Math
 * - Lengua y Literatura <-> Lenguaje <-> Castellano
 * - Ciencias Naturales <-> Ciencias <-> Ciencias de la Naturaleza
 * - 4to Grado <-> 4to <-> 4° Grado <-> 4
 * - 3er Grado <-> 3ro Grado <-> 3er <-> 3
 */

/**
 * Normaliza cualquier texto eliminando acentos/diacríticos y caracteres especiales.
 */
export const stripDiacritics = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Obtiene la clave canónica de una asignatura para comparaciones unificadas.
 */
export const normalizeSubjectKey = (rawSubject?: string): string => {
  if (!rawSubject) return '';
  const clean = stripDiacritics(rawSubject);

  // Inglés / English / Language Arts
  if (
    clean.includes('ingles') ||
    clean.includes('english') ||
    clean.includes('language arts') ||
    clean === 'eng'
  ) {
    return 'ingles';
  }

  // Matemática / Matemáticas / Math
  if (
    clean.includes('matematica') ||
    clean.includes('matematicas') ||
    clean.includes('algebra') ||
    clean.includes('geometria') ||
    clean === 'mat' ||
    clean === 'math'
  ) {
    return 'matematica';
  }

  // Lengua y Literatura / Lenguaje / Castellano
  if (
    clean.includes('lengua') ||
    clean.includes('lenguaje') ||
    clean.includes('castellano') ||
    clean.includes('literatura') ||
    clean === 'leng'
  ) {
    return 'lengua';
  }

  // Ciencias Naturales / Naturaleza / Biología / Química / Física
  if (
    clean.includes('ciencias naturales') ||
    clean.includes('naturaleza') ||
    clean.includes('biologia') ||
    clean === 'ciencia' ||
    clean === 'ciencias' ||
    clean === 'cnat'
  ) {
    return 'ciencias_naturales';
  }

  // Ciencias Sociales / Historia / Geografía
  if (
    clean.includes('sociales') ||
    clean.includes('historia') ||
    clean.includes('geografia') ||
    clean === 'csoc'
  ) {
    return 'ciencias_sociales';
  }

  // Educación Física / Deporte
  if (
    clean.includes('fisica') ||
    clean.includes('deporte') ||
    clean.includes('educacion fisica') ||
    clean === 'ed. fisica' ||
    clean === 'ed fisica'
  ) {
    return 'educacion_fisica';
  }

  // Robótica / Computación / Tecnología
  if (
    clean.includes('robotica') ||
    clean.includes('computacion') ||
    clean.includes('tecnologia') ||
    clean.includes('informatica') ||
    clean.includes('robot')
  ) {
    return 'robotica';
  }

  // Ajedrez
  if (clean.includes('ajedrez') || clean.includes('chess') || clean === 'aje') {
    return 'ajedrez';
  }

  // Música
  if (clean.includes('musica') || clean.includes('music')) {
    return 'musica';
  }

  // Teatro / Expresión / Arte
  if (
    clean.includes('teatro') ||
    clean.includes('arte') ||
    clean.includes('artistica') ||
    clean.includes('estetica')
  ) {
    return 'arte';
  }

  // Francés / French
  if (clean.includes('frances') || clean.includes('french') || clean === 'fra') {
    return 'frances';
  }

  // ADP (Aprender a Pensar)
  if (clean.includes('adp') || clean.includes('aprender a pensar')) {
    return 'adp';
  }

  // Proyecto de Aula / IPC / DIEV
  if (
    clean.includes('proyecto') ||
    clean.includes('ipc') ||
    clean.includes('diev')
  ) {
    return 'proyecto';
  }

  // Rutina / Lectura
  if (clean.includes('rutina') || clean.includes('lectura')) {
    return 'rutina_lectura';
  }

  return clean;
};

/**
 * Compara dos asignaturas determinando si corresponden a la misma disciplina.
 */
export const matchSubjects = (subjectA?: string, subjectB?: string): boolean => {
  if (!subjectA || !subjectB) return false;
  const a = subjectA.trim();
  const b = subjectB.trim();
  if (a.toLowerCase() === b.toLowerCase()) return true;

  const keyA = normalizeSubjectKey(a);
  const keyB = normalizeSubjectKey(b);
  if (keyA && keyB && keyA === keyB) return true;

  const cleanA = stripDiacritics(a);
  const cleanB = stripDiacritics(b);
  if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return true;

  return false;
};

/**
 * Normaliza cualquier denominación de grado a su clave institucional (ej: '4to Grado').
 */
export const normalizeGradeKey = (rawGrade?: string): string => {
  if (!rawGrade) return '';
  const clean = stripDiacritics(rawGrade);

  if (clean.includes('1') || clean.includes('primer') || clean.includes('1er') || clean.includes('1ro')) {
    return '1er Grado';
  }
  if (clean.includes('2') || clean.includes('segund') || clean.includes('2do')) {
    return '2do Grado';
  }
  if (clean.includes('3') || clean.includes('tercer') || clean.includes('3er') || clean.includes('3ro')) {
    return '3er Grado';
  }
  if (clean.includes('4') || clean.includes('cuart') || clean.includes('4to')) {
    return '4to Grado';
  }
  if (clean.includes('5') || clean.includes('quint') || clean.includes('5to')) {
    return '5to Grado';
  }
  if (clean.includes('6') || clean.includes('sext') || clean.includes('6to')) {
    return '6to Grado';
  }

  return rawGrade.trim();
};

/**
 * Compara dos grados escolares independientemente de su variante ortográfica.
 */
export const matchGrades = (gradeA?: string, gradeB?: string): boolean => {
  if (!gradeA || !gradeB) return false;
  const a = gradeA.trim();
  const b = gradeB.trim();
  if (a.toLowerCase() === b.toLowerCase()) return true;

  const normA = normalizeGradeKey(a);
  const normB = normalizeGradeKey(b);
  if (normA && normB && normA.toLowerCase() === normB.toLowerCase()) return true;

  return false;
};
