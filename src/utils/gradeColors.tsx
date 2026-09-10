import React from 'react';

export interface GradeColorDefinition {
  gradeNumber: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  shortName: string;
  hex: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
  accentBarColor: string;
  ringColor: string;
}

export const GRADE_COLOR_MAP: Record<number, GradeColorDefinition> = {
  1: {
    gradeNumber: 1,
    name: 'Primer Grado',
    shortName: '1°',
    hex: '#37FE27',
    textColor: '#0b3506',
    borderColor: '#24c416',
    bgLight: '#eefdec',
    accentBarColor: '#37FE27',
    ringColor: 'rgba(55, 254, 39, 0.4)',
  },
  2: {
    gradeNumber: 2,
    name: 'Segundo Grado',
    shortName: '2°',
    hex: '#D2E8F8',
    textColor: '#075985',
    borderColor: '#7dd3fc',
    bgLight: '#f0f7fd',
    accentBarColor: '#93c5fd',
    ringColor: 'rgba(210, 232, 248, 0.6)',
  },
  3: {
    gradeNumber: 3,
    name: 'Tercer Grado',
    shortName: '3°',
    hex: '#FE00FE',
    textColor: '#ffffff',
    borderColor: '#c026d3',
    bgLight: '#fdf4fd',
    accentBarColor: '#FE00FE',
    ringColor: 'rgba(254, 0, 254, 0.3)',
  },
  4: {
    gradeNumber: 4,
    name: 'Cuarto Grado',
    shortName: '4°',
    hex: '#941D80',
    textColor: '#ffffff',
    borderColor: '#701a75',
    bgLight: '#faf5f9',
    accentBarColor: '#941D80',
    ringColor: 'rgba(148, 29, 128, 0.3)',
  },
  5: {
    gradeNumber: 5,
    name: 'Quinto Grado',
    shortName: '5°',
    hex: '#5170FF',
    textColor: '#ffffff',
    borderColor: '#3b82f6',
    bgLight: '#eef2ff',
    accentBarColor: '#5170FF',
    ringColor: 'rgba(81, 112, 255, 0.3)',
  },
  6: {
    gradeNumber: 6,
    name: 'Sexto Grado',
    shortName: '6°',
    hex: '#5CE1E6',
    textColor: '#083344',
    borderColor: '#06b6d4',
    bgLight: '#ecfeff',
    accentBarColor: '#5CE1E6',
    ringColor: 'rgba(92, 225, 230, 0.4)',
  },
};

export const GRADE_COLORS: Record<string, string> = {
  '1er Grado': '#37FE27',
  '2do Grado': '#D2E8F8',
  '3er Grado': '#FE00FE',
  '4to Grado': '#941D80',
  '5to Grado': '#5170FF',
  '6to Grado': '#5CE1E6',
};

/**
 * Identifies the grade number (1 to 6) from any grade string format
 */
export function getGradeNumber(gradeStr?: string | null): 1 | 2 | 3 | 4 | 5 | 6 | null {
  if (!gradeStr) return null;
  const s = gradeStr.toLowerCase().trim();

  // Exclude secondary year distinctions like "1er Año", "2do Año"
  if (s.includes('año') || s.includes('secundaria') || s.includes('maternal') || s.includes('prematernal') || s.includes('grupo')) {
    return null;
  }

  if (s.includes('1er') || s.includes('1ro') || s.includes('primer') || s.includes('1°') || s.includes('1 -') || s.startsWith('1')) {
    return 1;
  }
  if (s.includes('2do') || s.includes('segundo') || s.includes('2°') || s.includes('2 -') || s.startsWith('2')) {
    return 2;
  }
  if (s.includes('3ro') || s.includes('3er') || s.includes('tercer') || s.includes('3°') || s.includes('3 -') || s.startsWith('3')) {
    return 3;
  }
  if (s.includes('4to') || s.includes('cuarto') || s.includes('4°') || s.includes('4 -') || s.startsWith('4')) {
    return 4;
  }
  if (s.includes('5to') || s.includes('quinto') || s.includes('5°') || s.includes('5 -') || s.startsWith('5')) {
    return 5;
  }
  if (s.includes('6to') || s.includes('sexto') || s.includes('6°') || s.includes('6 -') || s.startsWith('6')) {
    return 6;
  }

  return null;
}

/**
 * Returns color config for a grade string or null if not in 1st-6th grade
 */
export function getGradeColorConfig(gradeStr?: string | null): GradeColorDefinition | null {
  const num = getGradeNumber(gradeStr);
  if (num && GRADE_COLOR_MAP[num]) {
    return GRADE_COLOR_MAP[num];
  }
  return null;
}

/**
 * Returns the official hex code for a grade
 */
export function getGradeHex(gradeStr?: string | null, fallback = '#5EA832'): string {
  const config = getGradeColorConfig(gradeStr);
  return config ? config.hex : fallback;
}

/**
 * Returns inline styling for a pill badge with high contrast
 */
export function getGradeBadgeStyle(gradeStr?: string | null): React.CSSProperties {
  const config = getGradeColorConfig(gradeStr);
  if (!config || !config.hex) {
    return {
      backgroundColor: '#f1f5f9',
      color: '#334155',
      borderColor: '#cbd5e1',
    };
  }
  return {
    backgroundColor: config.hex,
    color: config.textColor,
    borderColor: config.borderColor,
  };
}

/**
 * Returns subtle soft tint background and border style
 */
export function getGradeSoftStyle(gradeStr?: string | null): React.CSSProperties {
  const config = getGradeColorConfig(gradeStr);
  if (!config || !config.hex) {
    return {
      backgroundColor: '#f8fafc',
      color: '#475569',
      borderColor: '#e2e8f0',
    };
  }
  return {
    backgroundColor: config.bgLight,
    color: config.textColor,
    borderColor: config.borderColor,
  };
}

/**
 * Returns border-left accent style for cards
 */
export function getGradeLeftAccentStyle(gradeStr?: string | null, width = 4): React.CSSProperties {
  const config = getGradeColorConfig(gradeStr);
  if (!config || !config.hex) return {};
  return {
    borderLeftWidth: `${width}px`,
    borderLeftColor: config.hex,
  };
}

/**
 * Reusable GradeBadge Component for all views
 */
export const GradeBadge: React.FC<{
  grade?: string | null;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'solid' | 'soft' | 'outline';
  showDot?: boolean;
  className?: string;
}> = ({ grade, size = 'sm', variant = 'solid', showDot = false, className = '' }) => {
  const config = getGradeColorConfig(grade);
  const text = grade || 'Sin Grado';

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 font-bold',
    sm: 'text-xs px-2.5 py-0.5 font-bold',
    md: 'text-sm px-3 py-1 font-bold',
  }[size];

  if (!config || !config.hex) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-slate-100 text-slate-700 ${sizeClasses} ${className}`}
      >
        {text}
      </span>
    );
  }

  let style: React.CSSProperties = {};
  let borderClass = 'border';

  if (variant === 'solid') {
    style = {
      backgroundColor: config.hex,
      color: config.textColor,
      borderColor: config.borderColor,
    };
  } else if (variant === 'soft') {
    style = {
      backgroundColor: config.bgLight,
      color: config.textColor,
      borderColor: config.borderColor,
    };
  } else {
    style = {
      backgroundColor: '#ffffff',
      color: config.textColor,
      borderColor: config.hex,
      borderWidth: '1.5px',
    };
  }

  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1.5 rounded-sm ${borderClass} tracking-tight select-none ${sizeClasses} ${className}`}
      title={`${config.name} (${config.hex})`}
    >
      {showDot && (
        <span
          className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
          style={{ backgroundColor: variant === 'solid' ? config.textColor : config.hex }}
        />
      )}
      <span className="truncate">{text}</span>
    </span>
  );
};

/**
 * Component that splits compound grade strings like "Cuarto grado / Quinto grado" or "Segundo y Tercero"
 * and renders a badge for each grade.
 */
export const CompoundGradeBadges: React.FC<{
  text?: string | null;
  size?: 'xs' | 'sm';
  className?: string;
}> = ({ text, size = 'xs', className = '' }) => {
  if (!text) return null;
  const parts = text.split(/\s*[/y,]\s*/i).map((p) => p.trim()).filter(Boolean);

  if (parts.length <= 1) {
    return <GradeBadge grade={text} size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          <GradeBadge
            grade={part.toLowerCase().includes('grado') ? part : `${part} Grado`}
            size={size}
          />
          {index < parts.length - 1 && (
            <span className="text-slate-400 text-[10px] font-bold">/</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// =========================================================================
// COLORES DE PROYECTOS DE AULA: IPC (Color del Grado) vs DIEV (#FBDE18)
// =========================================================================
export const DIEV_COLOR = '#FBDE18';
export const DIEV_TEXT_COLOR = '#0f172a';

export interface ProjectThemeConfig {
  type: 'IPC' | 'DIEV';
  hex: string;
  textColor: string;
  borderColor: string;
  bgLight: string;
  headerBg: string;
  badgeBg: string;
  badgeText: string;
  fullName: string;
  headerStyle: React.CSSProperties;
  leftAccentStyle: React.CSSProperties;
  weekHeaderStyle: React.CSSProperties;
}

/**
 * Retorna la configuración de color exacta para Proyectos de Aula:
 * - DIEV: Siempre #FBDE18 con texto oscuro de alto contraste
 * - IPC: Mantiene el color oficial del grado (1° a 6°)
 */
export function getProjectTheme(projectType: 'IPC' | 'DIEV', gradeStr?: string | null): ProjectThemeConfig {
  if (projectType === 'DIEV') {
    return {
      type: 'DIEV',
      hex: DIEV_COLOR,
      textColor: DIEV_TEXT_COLOR,
      borderColor: '#eab308',
      bgLight: '#fefce8',
      headerBg: DIEV_COLOR,
      badgeBg: '#0f172a',
      badgeText: DIEV_COLOR,
      fullName: 'Desarrollo Integral, Ética y Valores (DIEV)',
      headerStyle: {
        backgroundColor: DIEV_COLOR,
        color: DIEV_TEXT_COLOR,
      },
      leftAccentStyle: {
        borderLeftWidth: '6px',
        borderLeftColor: DIEV_COLOR,
        borderLeftStyle: 'solid',
      },
      weekHeaderStyle: {
        backgroundColor: DIEV_COLOR,
        color: '#0f172a',
        borderColor: '#ca8a04',
      },
    };
  }

  // IPC mantiene el color oficial del grado
  const gradeConfig = getGradeColorConfig(gradeStr);
  const hex = gradeConfig?.hex || '#5CE1E6';
  const textColor = gradeConfig?.textColor || '#ffffff';
  const borderColor = gradeConfig?.borderColor || '#0284c7';
  const bgLight = gradeConfig?.bgLight || '#ecfeff';

  return {
    type: 'IPC',
    hex,
    textColor,
    borderColor,
    bgLight,
    headerBg: hex,
    badgeBg: textColor === '#ffffff' ? '#0f172a' : '#ffffff',
    badgeText: textColor === '#ffffff' ? '#ffffff' : textColor,
    fullName: 'Interés por el Conocimiento (IPC)',
    headerStyle: {
      backgroundColor: hex,
      color: textColor,
    },
    leftAccentStyle: {
      borderLeftWidth: '6px',
      borderLeftColor: hex,
      borderLeftStyle: 'solid',
    },
    weekHeaderStyle: {
      backgroundColor: hex,
      color: textColor,
      borderColor: borderColor,
    },
  };
}
