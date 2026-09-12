import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calculator,
  Layers,
  Sparkles,
  Compass,
  FlaskConical,
  Atom,
  Globe,
  Dumbbell,
  Trophy,
  Palette,
  Music,
  Theater,
  Laptop,
  Smile,
  HeartHandshake,
  GraduationCap,
  Tag
} from 'lucide-react';
import { AcademicSubject, SubjectCategory } from '../types';
import { useEduPlan } from '../context/EduPlanContext';
import { detectSubjectCategory } from '../data/mockSchedules';

export interface PresetIconOption {
  name: string;
  label: string;
  category: SubjectCategory;
  icon: React.ElementType;
}

export const PRESET_SUBJECT_ICONS: PresetIconOption[] = [
  { name: 'BookOpen', label: 'Libro / Lectura', category: 'lengua', icon: BookOpen },
  { name: 'Calculator', label: 'Calculadora / Números', category: 'matematica', icon: Calculator },
  { name: 'Layers', label: 'Capas / Lógica', category: 'matematica', icon: Layers },
  { name: 'Sparkles', label: 'Destellos / Idiomas', category: 'ingles', icon: Sparkles },
  { name: 'Globe', label: 'Mundo / Ciencias Sociales', category: 'sociales', icon: Globe },
  { name: 'FlaskConical', label: 'Matraz / Química', category: 'ciencia', icon: FlaskConical },
  { name: 'Atom', label: 'Átomo / Física', category: 'ciencia', icon: Atom },
  { name: 'Compass', label: 'Brújula / Geografía', category: 'ciencia', icon: Compass },
  { name: 'Trophy', label: 'Ajedrez / Estrategia', category: 'especiales', icon: Trophy },
  { name: 'Palette', label: 'Paleta / Arte', category: 'especiales', icon: Palette },
  { name: 'Music', label: 'Música / Ritmo', category: 'especiales', icon: Music },
  { name: 'Theater', label: 'Teatro / Drama', category: 'especiales', icon: Theater },
  { name: 'Dumbbell', label: 'Pesa / Deporte', category: 'deporte', icon: Dumbbell },
  { name: 'Laptop', label: 'Computadora / Robótica', category: 'especiales', icon: Laptop },
  { name: 'HeartHandshake', label: 'Valores / ADP', category: 'especiales', icon: HeartHandshake },
  { name: 'Smile', label: 'Sonrisa / Recreo', category: 'recreo', icon: Smile },
  { name: 'GraduationCap', label: 'Birrete Institucional', category: 'otro', icon: GraduationCap },
];

export const PRESET_ICONS_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Calculator,
  Layers,
  Sparkles,
  Globe,
  FlaskConical,
  Atom,
  Compass,
  Trophy,
  Palette,
  Music,
  Theater,
  Dumbbell,
  Laptop,
  HeartHandshake,
  Smile,
  GraduationCap,
  Tag,
};

const CATEGORY_DEFAULT_ICONS: Record<SubjectCategory, React.ElementType> = {
  lengua: BookOpen,
  matematica: Layers,
  ingles: Sparkles,
  ciencia: Compass,
  sociales: Globe,
  deporte: Dumbbell,
  especiales: Palette,
  proyecto: Compass,
  rutina: Smile,
  recreo: Smile,
  otro: Tag,
};

const CATEGORY_COLORS: Record<SubjectCategory, { bg: string; text: string; border: string }> = {
  lengua: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  matematica: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ingles: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  ciencia: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  sociales: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  deporte: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  especiales: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  proyecto: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  rutina: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  recreo: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  otro: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

interface SubjectAvatarProps {
  subject?: AcademicSubject;
  subjectName?: string;
  name?: string;
  iconUrl?: string;
  iconName?: string;
  category?: SubjectCategory;
  color?: string;
  size?: 'xs' | 'chip' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_STYLES = {
  xs: { box: 'w-5 h-5 rounded-md', icon: 'w-3 h-3' },
  chip: { box: 'w-6 h-6 rounded-lg', icon: 'w-3.5 h-3.5' },
  sm: { box: 'w-7 h-7 rounded-lg', icon: 'w-4 h-4' },
  md: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
  lg: { box: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7' },
  xl: { box: 'w-20 h-20 rounded-2xl', icon: 'w-10 h-10' },
};

export const SubjectAvatar: React.FC<SubjectAvatarProps> = ({
  subject,
  subjectName,
  name: propName,
  iconUrl: propIconUrl,
  iconName: propIconName,
  category: propCategory,
  color: propColor,
  size = 'md',
  className = '',
}) => {
  const { subjects } = useEduPlan();
  const [imgError, setImgError] = useState(false);

  const targetName = propName ?? subjectName ?? subject?.name ?? '';
  
  // Buscar en subjects si no se pasó el objeto completo
  const matchedSubject = subject || (targetName ? subjects?.find(
    (s) => s.name.trim().toLowerCase() === targetName.trim().toLowerCase()
  ) : undefined);

  const iconUrl = propIconUrl ?? matchedSubject?.iconUrl;
  const iconName = propIconName ?? matchedSubject?.iconName;
  const category = propCategory ?? matchedSubject?.category ?? (targetName ? detectSubjectCategory(targetName) : 'otro');
  const name = targetName || matchedSubject?.name || 'Asignatura';
  const color = propColor ?? matchedSubject?.color;

  // Reset error si cambia la URL
  useEffect(() => {
    setImgError(false);
  }, [iconUrl]);

  const style = SIZE_STYLES[size] || SIZE_STYLES.md;
  const catStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS.otro;

  // Si tiene imagen y no ha fallado
  if (iconUrl && !imgError) {
    return (
      <div
        className={`${style.box} shrink-0 overflow-hidden border border-slate-200/80 bg-white shadow-2xs relative flex items-center justify-center ${className}`}
        style={color ? { borderColor: `${color}50` } : undefined}
        title={name}
      >
        <img
          src={iconUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Si no tiene imagen o falló, mostrar icono predeterminado o elegido
  const IconComponent = (iconName && PRESET_ICONS_MAP[iconName])
    ? PRESET_ICONS_MAP[iconName]
    : (CATEGORY_DEFAULT_ICONS[category] || BookOpen);

  return (
    <div
      className={`${style.box} shrink-0 flex items-center justify-center border shadow-2xs ${catStyle.bg} ${catStyle.border} ${catStyle.text} ${className}`}
      style={color ? { color: color, borderColor: `${color}35`, backgroundColor: `${color}15` } : undefined}
      title={name}
    >
      <IconComponent className={style.icon} />
    </div>
  );
};

