/**
 * Algoritmo de generación automática de códigos curriculares para el Banco de Competencias.
 * Estructura: [ASIGNATURA]-[GRADO]-[EJE/CATEGORÍA]
 * Ejemplo: ENG-4GR-RDN (English, 4to Grado, Reading)
 */

// Mapeo normalizado de asignaturas
const SUBJECT_CODE_MAP: Record<string, string> = {
  'english': 'ENG',
  'inglés': 'ENG',
  'ingles': 'ENG',
  'matemáticas': 'MAT',
  'matematicas': 'MAT',
  'lengua y literatura': 'LEN',
  'lenguaje': 'LEN',
  'lengua': 'LEN',
  'ciencias naturales': 'NAT',
  'ciencias de la naturaleza': 'NAT',
  'ciencias': 'NAT',
  'ciencias sociales': 'SOC',
  'sociales': 'SOC',
  'robótica': 'ROB',
  'robotica': 'ROB',
  'tecnología': 'TEC',
  'tecnologia': 'TEC',
  'computación': 'COM',
  'computacion': 'COM',
  'educación física': 'EDF',
  'educacion fisica': 'EDF',
  'deportes': 'EDF',
  'arte': 'ART',
  'artes': 'ART',
  'artes visuales': 'ART',
  'educación artística': 'ART',
  'música': 'MUS',
  'musica': 'MUS',
  'valores': 'VAL',
  'diev': 'DIEV',
  'ética y valores': 'VAL',
};

// Mapeo normalizado de categorías / ejes comunes
const CATEGORY_CODE_MAP: Record<string, string> = {
  // Inglés
  'reading': 'RDN',
  'reading & comprehension': 'RDN',
  'reading comprehension': 'RDN',
  'lectura': 'RDN',
  'comprensión lectora': 'RDN',
  'writing': 'WRT',
  'escritura': 'WRT',
  'listening': 'LSN',
  'listening & speaking': 'LSN',
  'comprensión auditiva': 'LSN',
  'speaking': 'SPK',
  'expresión oral': 'SPK',
  'oral interaction': 'SPK',
  'interacción oral': 'SPK',
  'grammar': 'GRM',
  'gramática': 'GRM',
  'use of english': 'UOE',
  'phonics': 'PHN',
  'vocabulary': 'VOC',
  'vocabulario': 'VOC',

  // Matemáticas
  'aritmética': 'ARI',
  'aritmetica': 'ARI',
  'números': 'NUM',
  'numeros': 'NUM',
  'numeración': 'NUM',
  'fracciones': 'FRC',
  'fracciones y medida': 'FRC',
  'geometría': 'GEO',
  'geometria': 'GEO',
  'álgebra': 'ALG',
  'algebra': 'ALG',
  'álgebra y números': 'ALG',
  'medida': 'MED',
  'estadística': 'EST',
  'probabilidad': 'PRB',

  // Lenguaje
  'producción de textos': 'PRD',
  'produccion de textos': 'PRD',

  // Ciencias Naturales
  'ecosistemas': 'ECO',
  'ecología': 'ECO',
  'ecología y biodiversidad': 'ECO',
  'biodiversidad': 'BIO',
  'seres vivos': 'BIO',
  'mundo físico': 'FIS',
  'mundo fisico': 'FIS',
  'física': 'FIS',
  'química': 'QUI',
  'cuerpo humano': 'COR',
  'salud': 'SAL',
  'conservación': 'AMB',
  'medio ambiente': 'AMB',

  // Lenguaje
  'expresión escrita': 'ESC',
  'producción escrita': 'ESC',
  'ortografía': 'ORT',
  'ortografia': 'ORT',
  'análisis textual': 'TXT',
  'literatura': 'LIT',

  // Ciencias Sociales
  'historia': 'HIS',
  'geografía': 'GEO',
  'ciudadanía': 'CIU',
  'identidad nacional': 'IDN',
  'patrimonio': 'PAT',
};

/**
 * Normaliza una cadena de texto eliminando acentos y espacios superfluos.
 */
function cleanText(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Extrae el código de la asignatura (3 letras mayúsculas).
 */
export function getSubjectCode(subject: string): string {
  const cleaned = cleanText(subject);
  if (SUBJECT_CODE_MAP[cleaned]) {
    return SUBJECT_CODE_MAP[cleaned];
  }

  for (const [key, code] of Object.entries(SUBJECT_CODE_MAP)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return code;
    }
  }

  // Fallback: primeras 3 consonantes o primeras 3 letras
  const lettersOnly = cleaned.replace(/[^a-z]/g, '').toUpperCase();
  return lettersOnly.slice(0, 3) || 'GEN';
}

/**
 * Extrae el código del grado o nivel (e.g. 1GR, 2GR, 3GR, 4GR, 5GR, 6GR, PK1, PK2, PK3).
 */
export function getGradeCode(grade: string): string {
  const cleaned = cleanText(grade);

  // Busca número de grado (1 a 6)
  const matchNum = cleaned.match(/(\d+)/);
  if (matchNum) {
    return `${matchNum[1]}GR`;
  }

  if (cleaned.includes('maternal')) return 'MAT';
  if (cleaned.includes('preescolar 1') || cleaned.includes('pk1')) return 'PK1';
  if (cleaned.includes('preescolar 2') || cleaned.includes('pk2')) return 'PK2';
  if (cleaned.includes('preescolar 3') || cleaned.includes('pk3')) return 'PK3';

  return 'GEN';
}

/**
 * Extrae el código del eje o categoría (3 letras mayúsculas).
 * Prioriza concordancia con el ejemplo oficial del usuario: "reading" -> "RDN".
 */
export function getCategoryCode(category: string): string {
  const cleaned = cleanText(category);
  if (!cleaned || cleaned === 'sin eje' || cleaned === 'ninguno' || cleaned === 'ninguna' || cleaned === 'n/a' || cleaned === 'none') {
    return '';
  }

  if (CATEGORY_CODE_MAP[cleaned]) {
    return CATEGORY_CODE_MAP[cleaned];
  }

  for (const [key, code] of Object.entries(CATEGORY_CODE_MAP)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return code;
    }
  }

  // Algoritmo fonético de 3 letras:
  // Si tiene 3 o más consonantes, extrae las primeras 3 (ej. Reading -> R, D, N -> RDN)
  const lettersOnly = cleaned.replace(/[^a-z]/g, '');
  if (!lettersOnly) return '';

  const consonants = lettersOnly.replace(/[aeiou]/g, '').toUpperCase();
  if (consonants.length >= 3) {
    return consonants.slice(0, 3);
  }

  // Si no hay suficientes consonantes, toma las 3 primeras letras mayúsculas
  const firstLetters = lettersOnly.toUpperCase().slice(0, 3);
  return firstLetters.padEnd(3, 'X');
}

/**
 * Genera el código completo del indicador/competencia:
 * Formato con eje: [ASIGNATURA]-[GRADO]-[EJE] (Ej: ENG-4GR-RDN)
 * Formato sin eje: [ASIGNATURA]-[GRADO] (Ej: MAT-4GR)
 */
export function generateCompetencyCode(subject: string, grade: string, category: string): string {
  const sub = getSubjectCode(subject);
  const grd = getGradeCode(grade);
  const cat = getCategoryCode(category);
  return cat ? `${sub}-${grd}-${cat}` : `${sub}-${grd}`;
}

/**
 * Sugerencias de ejes y categorías comunes según la asignatura seleccionada
 */
export const COMMON_CATEGORIES_BY_SUBJECT: Record<string, string[]> = {
  'English': [
    'Reading & Comprehension',
    'Writing',
    'Listening & Speaking',
    'Oral Interaction',
    'Grammar & Vocabulary'
  ],
  'Matemáticas': [
    'Aritmética y Operaciones',
    'Fracciones y Medida',
    'Geometría y Figuras',
    'Álgebra y Números',
    'Resolución de Problemas'
  ],
  'Lengua y Literatura': [
    'Comprensión Lectora',
    'Expresión Escrita',
    'Ortografía y Redacción',
    'Expresión Oral',
    'Análisis Textual'
  ],
  'Ciencias Naturales': [
    'Ecosistemas y Biodiversidad',
    'Mundo Físico y Materia',
    'Cuerpo Humano y Salud',
    'Ciclos Naturales y Agua',
    'Método Científico'
  ],
  'Ciencias Sociales': [
    'Identidad Nacional y Geografía',
    'Historia y Sociedad',
    'Valores Ciudadanos',
    'Patrimonio Cultural'
  ],
  'Robótica': [
    'Construcción y Prototipado',
    'Sensores y Actuadores',
    'Mecatrónica y Automatización',
    'Proyectos STEAM'
  ],
  'Tecnología': [
    'Ciudadanía y Ética Digital',
    'Alfabetización Tecnológica',
    'Herramientas Digitales e Innovación',
    'Diseño e Impresión 3D'
  ],
  'Computación': [
    'Programación y Lógica',
    'Pensamiento Computacional',
    'Sistemas Operativos y Software',
    'Procesamiento de Datos y Ofimática'
  ],
  'Educación Física': [
    'Habilidades Motrices Básicas',
    'Trabajo en Equipo y Deporte',
    'Acondicionamiento Físico'
  ],
  'Arte': [
    'Técnicas de Dibujo y Pintura',
    'Creatividad e Innovación',
    'Historia del Arte'
  ],
  'Música': [
    'Ritmo y Rítmica Corporal',
    'Canto y Vocalización',
    'Apreciación Musical'
  ]
};

/**
 * Ejes curriculares estándar solicitados para el selector desplegable:
 * Geometría, Álgebra, Producción de textos, Gramática, Reading, Listening, Speaking, Use of English, Phonics, Writing.
 */
export const STANDARD_CURRICULAR_AXES = [
  'Geometría',
  'Álgebra',
  'Producción de textos',
  'Gramática',
  'Reading',
  'Listening',
  'Speaking',
  'Use of English',
  'Phonics',
  'Writing',
];

