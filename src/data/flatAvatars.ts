/**
 * Avatares flat institucionales (vectoriales SVG) para docentes y coordinación.
 * Reemplazan las fotografías de personas reales por iconos flat nítidos,
 * modernos y alineados con la estética institucional de El Manglar.
 */

const createSvgDataUri = (svgString: string): string => {
  const clean = svgString.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml;utf8,${encodeURIComponent(clean)}`;
};

export interface FlatAvatarItem {
  id: string;
  name: string;
  category: 'coordinacion' | 'docente' | 'institucional';
  url: string;
}

export const FLAT_AVATARS_LIST: FlatAvatarItem[] = [
  // 1. Coordinador / Gestión (Indigo / Slate)
  {
    id: 'flat-coord-1',
    name: 'Coordinación Pedagógica',
    category: 'coordinacion',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#4338CA"/>
        <circle cx="50" cy="50" r="46" fill="#4F46E5"/>
        <path d="M22 88 C25 68 38 64 50 64 C62 64 75 68 78 88 Z" fill="#1E1B4B"/>
        <path d="M38 65 L50 78 L62 65 L50 62 Z" fill="#E0E7FF"/>
        <polygon points="48,70 52,70 53,82 50,85 47,82" fill="#F43F5E"/>
        <rect x="44" y="48" width="12" height="14" rx="4" fill="#FCD34D"/>
        <circle cx="50" cy="38" r="17" fill="#FCD34D"/>
        <path d="M33 34 C33 22 41 18 50 18 C59 18 67 22 67 34 C67 36 63 32 50 32 C37 32 33 36 33 34 Z" fill="#312E81"/>
        <circle cx="43" cy="38" r="4.5" fill="none" stroke="#1E1B4B" stroke-width="1.8"/>
        <circle cx="57" cy="38" r="4.5" fill="none" stroke="#1E1B4B" stroke-width="1.8"/>
        <line x1="47.5" y1="38" x2="52.5" y2="38" stroke="#1E1B4B" stroke-width="1.8"/>
        <path d="M46 47 Q50 50 54 47" fill="none" stroke="#B45309" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `)
  },
  // 2. Docente Verde Manglar (Educadora / Primaria)
  {
    id: 'flat-teacher-green',
    name: 'Docente Primaria',
    category: 'docente',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#2E7D32"/>
        <circle cx="50" cy="50" r="46" fill="#388E3C"/>
        <path d="M22 88 C26 70 38 65 50 65 C62 65 74 70 78 88 Z" fill="#1B5E20"/>
        <circle cx="50" cy="22" r="10" fill="#795548"/>
        <rect x="44" y="49" width="12" height="14" rx="4" fill="#FFE0B2"/>
        <circle cx="50" cy="39" r="17" fill="#FFE0B2"/>
        <path d="M32 36 C32 24 40 22 50 22 C60 22 68 24 68 36 C68 44 65 30 50 30 C35 30 32 44 32 36 Z" fill="#795548"/>
        <circle cx="44" cy="38" r="2.2" fill="#3E2723"/>
        <circle cx="56" cy="38" r="2.2" fill="#3E2723"/>
        <circle cx="40" cy="42" r="2.5" fill="#FFAB91" opacity="0.6"/>
        <circle cx="60" cy="42" r="2.5" fill="#FFAB91" opacity="0.6"/>
        <path d="M46 46 Q50 49 54 46" fill="none" stroke="#D84315" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M42 66 Q50 72 58 66" fill="none" stroke="#C8E6C9" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `)
  },
  // 3. Docente Azul / Ciencias y Matemáticas
  {
    id: 'flat-math-blue',
    name: 'Docente Ciencias & Matemáticas',
    category: 'docente',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#0284C7"/>
        <circle cx="50" cy="50" r="46" fill="#0EA5E9"/>
        <path d="M22 88 C25 68 38 65 50 65 C62 65 75 68 78 88 Z" fill="#0369A1"/>
        <rect x="44" y="48" width="12" height="14" rx="4" fill="#FED7AA"/>
        <circle cx="50" cy="38" r="17" fill="#FED7AA"/>
        <path d="M33 34 C33 21 42 19 50 19 C58 19 67 21 67 34 C67 36 60 27 50 27 C40 27 33 36 33 34 Z" fill="#1E293B"/>
        <rect x="38" y="34" width="10" height="8" rx="2" fill="none" stroke="#0F172A" stroke-width="1.8"/>
        <rect x="52" y="34" width="10" height="8" rx="2" fill="none" stroke="#0F172A" stroke-width="1.8"/>
        <line x1="48" y1="38" x2="52" y2="38" stroke="#0F172A" stroke-width="1.8"/>
        <circle cx="43" cy="38" r="1.8" fill="#0F172A"/>
        <circle cx="57" cy="38" r="1.8" fill="#0F172A"/>
        <path d="M46 47 Q50 50 54 47" fill="none" stroke="#C2410C" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `)
  },
  // 4. Docente Naranja / Creatividad y Humanidades
  {
    id: 'flat-arts-amber',
    name: 'Docente Artes & Humanidades',
    category: 'docente',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#D97706"/>
        <circle cx="50" cy="50" r="46" fill="#F59E0B"/>
        <path d="M22 88 C25 70 38 65 50 65 C62 65 75 70 78 88 Z" fill="#92400E"/>
        <rect x="44" y="49" width="12" height="14" rx="4" fill="#FDE68A"/>
        <circle cx="50" cy="39" r="17" fill="#FDE68A"/>
        <path d="M32 38 C32 20 40 18 50 18 C60 18 68 20 68 38 C68 46 64 28 50 28 C36 28 32 46 32 38 Z" fill="#451A03"/>
        <circle cx="44" cy="39" r="2.2" fill="#451A03"/>
        <circle cx="56" cy="39" r="2.2" fill="#451A03"/>
        <path d="M45 46 Q50 50 55 46" fill="none" stroke="#B45309" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="40" cy="43" r="2.5" fill="#F87171" opacity="0.6"/>
        <circle cx="60" cy="43" r="2.5" fill="#F87171" opacity="0.6"/>
      </svg>
    `)
  },
  // 5. Docente Violeta / Lenguaje e Idiomas
  {
    id: 'flat-lang-violet',
    name: 'Docente Idiomas (Language Arts)',
    category: 'docente',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#6D28D9"/>
        <circle cx="50" cy="50" r="46" fill="#7C3AED"/>
        <path d="M22 88 C25 68 38 64 50 64 C62 64 75 68 78 88 Z" fill="#4C1D95"/>
        <rect x="44" y="48" width="12" height="14" rx="4" fill="#FBCFE8"/>
        <circle cx="50" cy="38" r="17" fill="#FBCFE8"/>
        <path d="M32 34 C32 22 41 18 50 18 C59 18 68 22 68 34 C68 40 64 26 50 26 C36 26 32 40 32 34 Z" fill="#2E1065"/>
        <circle cx="43" cy="37" r="4.5" fill="none" stroke="#4C1D95" stroke-width="1.8"/>
        <circle cx="57" cy="37" r="4.5" fill="none" stroke="#4C1D95" stroke-width="1.8"/>
        <line x1="47.5" y1="37" x2="52.5" y2="37" stroke="#4C1D95" stroke-width="1.8"/>
        <circle cx="43" cy="37" r="1.8" fill="#2E1065"/>
        <circle cx="57" cy="37" r="1.8" fill="#2E1065"/>
        <path d="M46 46 Q50 49 54 46" fill="none" stroke="#BE185D" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `)
  },
  // 6. Docente Teal / Deporte & Educación Física
  {
    id: 'flat-pe-teal',
    name: 'Docente Educación Física & Deporte',
    category: 'docente',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#0F766E"/>
        <circle cx="50" cy="50" r="46" fill="#14B8A6"/>
        <path d="M22 88 C25 68 38 65 50 65 C62 65 75 68 78 88 Z" fill="#134E4A"/>
        <rect x="44" y="49" width="12" height="14" rx="4" fill="#FDE047"/>
        <circle cx="50" cy="39" r="17" fill="#FDE047"/>
        <path d="M33 34 C33 22 41 18 50 18 C59 18 67 22 67 34 C67 36 62 26 50 26 C38 26 33 36 33 34 Z" fill="#042F2E"/>
        <circle cx="44" cy="39" r="2.2" fill="#042F2E"/>
        <circle cx="56" cy="39" r="2.2" fill="#042F2E"/>
        <path d="M46 47 Q50 50 54 47" fill="none" stroke="#B45309" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="47" y="65" width="6" height="10" rx="2" fill="#F59E0B"/>
      </svg>
    `)
  },
  // 7. Docente Rosa / Música & Expresión
  {
    id: 'flat-music-rose',
    name: 'Docente Música & Ritmo',
    category: 'docente',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#BE123C"/>
        <circle cx="50" cy="50" r="46" fill="#E11D48"/>
        <path d="M22 88 C25 70 38 65 50 65 C62 65 75 70 78 88 Z" fill="#881337"/>
        <rect x="44" y="49" width="12" height="14" rx="4" fill="#FED7AA"/>
        <circle cx="50" cy="39" r="17" fill="#FED7AA"/>
        <path d="M32 38 C32 22 40 18 50 18 C60 18 68 22 68 38 C68 44 64 28 50 28 C36 28 32 44 32 38 Z" fill="#3B0764"/>
        <circle cx="44" cy="39" r="2.2" fill="#3B0764"/>
        <circle cx="56" cy="39" r="2.2" fill="#3B0764"/>
        <path d="M46 46 Q50 49 54 46" fill="none" stroke="#E11D48" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="39" cy="43" r="2.5" fill="#FB7185" opacity="0.7"/>
        <circle cx="61" cy="43" r="2.5" fill="#FB7185" opacity="0.7"/>
      </svg>
    `)
  },
  // 8. Emblema Institucional El Manglar (Colegio)
  {
    id: 'flat-manglar-emblem',
    name: 'Institucional Colegio El Manglar',
    category: 'institucional',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#1E3A18"/>
        <circle cx="50" cy="50" r="46" fill="#2E5A27"/>
        <circle cx="50" cy="50" r="42" fill="#3A6B1F"/>
        <path d="M50 20 C58 32 72 38 72 52 C72 65 62 76 50 76 C38 76 28 65 28 52 C28 38 42 32 50 20 Z" fill="#5EA832"/>
        <path d="M50 28 C56 38 66 43 66 53 C66 63 59 71 50 71 C41 71 34 63 34 53 C34 43 44 38 50 28 Z" fill="#A7DC84"/>
        <circle cx="50" cy="50" r="13" fill="#F8CB0A"/>
        <path d="M43 51 L48 56 L58 45" fill="none" stroke="#1E3A18" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `)
  }
];

export const PRESET_AVATARS: string[] = FLAT_AVATARS_LIST.map((a) => a.url);

export const DEFAULT_COORDINATOR_AVATAR = FLAT_AVATARS_LIST[0].url;
export const DEFAULT_TEACHER_AVATAR = FLAT_AVATARS_LIST[1].url;

/**
 * Reemplaza de forma segura avatares antiguos de Unsplash por avatares flat limpios.
 */
export const sanitizeAvatar = (url?: string, role: 'coordinator' | 'teacher' = 'teacher', fallbackIndex = 0): string => {
  if (!url || url.includes('images.unsplash.com') || url.includes('unsplash.com')) {
    if (role === 'coordinator') return DEFAULT_COORDINATOR_AVATAR;
    const teacherAvatars = FLAT_AVATARS_LIST.filter((a) => a.category === 'docente');
    return teacherAvatars[fallbackIndex % teacherAvatars.length]?.url || DEFAULT_TEACHER_AVATAR;
  }
  return url;
};
