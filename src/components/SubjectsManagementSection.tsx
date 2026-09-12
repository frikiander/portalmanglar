import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Info,
  Tag,
  AlertCircle,
  X,
  Layers,
  Dumbbell,
  Palette,
  Compass,
  Smile,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { AcademicSubject, SubjectCategory } from '../types';
import { SUBJECT_CATEGORY_LABELS } from '../data/mockSubjects';
import { SCHOOL_GRADES } from '../data/mockRoster';
import { SubjectAvatar, PRESET_SUBJECT_ICONS } from './SubjectAvatar';
import { resizeImageTo500x500 } from '../utils/imageResize';

const CATEGORY_ICONS: Record<SubjectCategory, React.ElementType> = {
  lengua: BookOpen,
  matematica: Layers,
  ingles: Sparkles,
  ciencia: Compass,
  sociales: Info,
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

export const SubjectsManagementSection: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, addToast, availableGradeNames, viewMode, currentUser } = useEduPlan();

  const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : SCHOOL_GRADES;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<AcademicSubject | null>(null);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<AcademicSubject | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<SubjectCategory>('especiales');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#4F46E5');
  const [formIconUrl, setFormIconUrl] = useState<string | undefined>(undefined);
  const [formIconName, setFormIconName] = useState<string | undefined>(undefined);
  const [visualMode, setVisualMode] = useState<'preset' | 'upload'>('preset');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [formGrades, setFormGrades] = useState<string[]>(displayGrades);
  const [colorMode, setColorMode] = useState<'preset' | 'custom'>('preset');

  const isCoordinator = viewMode === 'coordinator' || currentUser.role === 'coordinator';

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setFormName('');
    setFormCategory('especiales');
    setFormCode('');
    setFormDescription('');
    setFormColor('#4F46E5');
    setFormIconUrl(undefined);
    setFormIconName(undefined);
    setVisualMode('preset');
    setFormGrades(displayGrades);
    setColorMode('preset');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (subject: AcademicSubject) => {
    setEditingSubject(subject);
    setFormName(subject.name);
    setFormCategory(subject.category);
    setFormCode(subject.code || '');
    setFormDescription(subject.description || '');
    setFormColor(subject.color || '#4F46E5');
    setFormIconUrl(subject.iconUrl);
    setFormIconName(subject.iconName);
    setVisualMode(subject.iconUrl ? 'upload' : 'preset');
    setFormGrades(subject.applicableGrades || displayGrades);
    setIsFormModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const resizedBase64 = await resizeImageTo500x500(file);
      setFormIconUrl(resizedBase64);
      setVisualMode('upload');
      addToast('Imagen procesada y recortada a 500 × 500 px correctamente.', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Error al procesar la imagen.', 'error');
    } finally {
      setIsProcessingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormIconUrl(undefined);
    setVisualMode('preset');
  };

  const handleToggleGrade = (grade: string) => {
    if (formGrades.includes(grade)) {
      if (formGrades.length > 1) {
        setFormGrades(formGrades.filter((g) => g !== grade));
      }
    } else {
      setFormGrades([...formGrades, grade]);
    }
  };

  const handleSelectAllGrades = () => {
    setFormGrades(displayGrades);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const payloadIconUrl = visualMode === 'upload' ? formIconUrl : undefined;
    const payloadIconName = visualMode === 'preset' ? formIconName : undefined;

    if (editingSubject) {
      await updateSubject({
        ...editingSubject,
        name: formName.trim(),
        category: formCategory,
        code: formCode.trim().toUpperCase() || undefined,
        description: formDescription.trim() || undefined,
        color: formColor,
        iconUrl: payloadIconUrl,
        iconName: payloadIconName,
        applicableGrades: formGrades,
      });
    } else {
      await addSubject({
        name: formName.trim(),
        category: formCategory,
        code: formCode.trim().toUpperCase() || undefined,
        description: formDescription.trim() || undefined,
        color: formColor,
        iconUrl: payloadIconUrl,
        iconName: payloadIconName,
        applicableGrades: formGrades,
      });
    }

    setIsFormModalOpen(false);
  };

  const handleDelete = async (subject: AcademicSubject) => {
    await deleteSubject(subject.id);
    setDeleteConfirmSubject(null);
  };

  const filteredSubjects = subjects.filter((subj) => {
    const matchesSearch =
      subj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subj.code && subj.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subj.description && subj.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === 'all' || subj.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-[#F8CB0A]" />
              <span>Pensum y Malla Curricular Dinámica</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Catálogo Institucional de Asignaturas
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Administra todas las materias de la plataforma. Las asignaturas añadidas aquí
              (como <strong>Ajedrez</strong>, <strong>Teatro</strong>, <strong>ADP</strong>, <strong>Deporte</strong> y <strong>Ed. Física</strong>)
              se sincronizan instantáneamente en la planificación semanal, horarios, proyectos de aula y evaluaciones.
            </p>
          </div>

          <button
            id="add-new-subject-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-[#5EA832] hover:bg-[#4d8c28] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-150 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Asignatura</span>
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3 text-emerald-900">
        <Sparkles className="w-5 h-5 text-[#5EA832] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold">
            Disponibilidad Global en Toda la Plataforma:
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Cada asignatura creada cuenta con código institucional, categoría de disciplina y grados aplicables.
            Los docentes podrán seleccionarla de inmediato al redactar sus planes semanales, los coordinadores
            al asignarla en los horarios escolares por arrastre, y en el módulo de evaluaciones por lapso.
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="subject-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, código o descripción..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#5EA832] focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter & New Subject Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="subject-category-filter-select"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-[#5EA832]"
            >
              <option value="all">Todas las Categorías ({subjects.length})</option>
              {Object.entries(SUBJECT_CATEGORY_LABELS).map(([catKey, label]) => {
                const count = subjects.filter((s) => s.category === catKey).length;
                if (count === 0 && catKey !== 'especiales' && catKey !== 'deporte') return null;
                return (
                  <option key={catKey} value={catKey}>
                    {label} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-[#5EA832] hover:bg-[#4d8c28] text-white font-bold text-xs shadow-xs hover:shadow transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Asignatura</span>
          </button>
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((subject) => {
          const categoryStyle = CATEGORY_COLORS[subject.category] || CATEGORY_COLORS.otro;
          const CategoryIcon = CATEGORY_ICONS[subject.category] || Tag;

          return (
            <div
              key={subject.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <SubjectAvatar
                      subject={subject}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">
                          {subject.name}
                        </h3>
                        {subject.code && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {subject.code}
                          </span>
                        )}
                      </div>
                      <span className={`inline-block text-[11px] font-semibold mt-0.5 ${categoryStyle.text}`}>
                        {SUBJECT_CATEGORY_LABELS[subject.category] || subject.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Coordinator */}
                  {isCoordinator && (
                    <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(subject)}
                        title="Editar Asignatura"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#3A6B1F] hover:bg-emerald-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSubject(subject)}
                        title="Eliminar Asignatura"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                {subject.description ? (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {subject.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Sin descripción pedagógica detallada.
                  </p>
                )}

                {/* Applicable Grades */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Grados aplicables:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {subject.applicableGrades && subject.applicableGrades.length > 0 ? (
                      subject.applicableGrades.map((grade) => (
                        <span
                          key={grade}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80"
                        >
                          {grade}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-[#3A6B1F]">
                        Todos los grados (1ro a 6to)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Status */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="inline-flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Disponible en Horarios & Planes</span>
                </span>
                {subject.isCustom && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    Personalizada
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No se encontraron asignaturas</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No hay asignaturas que coincidan con los filtros seleccionados. Intenta con otro término de búsqueda.
          </p>
        </div>
      )}

      {/* Form Modal (Add / Edit Subject) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <SubjectAvatar
                  name={formName || 'Asignatura'}
                  iconUrl={visualMode === 'upload' ? formIconUrl : undefined}
                  iconName={visualMode === 'preset' ? formIconName : undefined}
                  category={formCategory}
                  color={formColor}
                  size="md"
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingSubject ? 'Editar Asignatura' : 'Agregar Nueva Asignatura'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Disponible en toda la plataforma escolar de inmediato
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Asignatura *
                </label>
                <input
                  id="subject-form-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Ajedrez, Teatro, ADP, Deporte, Robótica..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#5EA832] focus:border-transparent font-medium"
                />
              </div>

              {/* Category & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría Pedagógica *
                  </label>
                  <select
                    id="subject-form-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SubjectCategory)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#5EA832] font-semibold text-slate-800"
                  >
                    {Object.entries(SUBJECT_CATEGORY_LABELS).map(([catKey, label]) => (
                      <option key={catKey} value={catKey}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código / Abreviatura
                  </label>
                  <input
                    id="subject-form-code"
                    type="text"
                    maxLength={6}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="Ej: AJE, TEA, ADP, EDF"
                    className="w-full px-3 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#5EA832]"
                  />
                </div>
              </div>

              {/* Visual Identifier Section (Icono Preestablecido o Imagen 500x500) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#5EA832]" />
                    <label className="text-xs font-bold text-slate-800">
                      Identificador Visual de la Asignatura
                    </label>
                  </div>

                  {/* Toggle between Preset and Upload */}
                  <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setVisualMode('preset')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        visualMode === 'preset'
                          ? 'bg-[#5EA832] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Icono Preestablecido
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        visualMode === 'upload'
                          ? 'bg-[#5EA832] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Subir Imagen (500×500)
                    </button>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-xl">
                  <div className="flex items-center space-x-3 min-w-0">
                    <SubjectAvatar
                      name={formName || 'Asignatura'}
                      iconUrl={visualMode === 'upload' ? formIconUrl : undefined}
                      iconName={visualMode === 'preset' ? formIconName : undefined}
                      category={formCategory}
                      color={formColor}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">
                          {formName || 'Nombre de la Asignatura'}
                        </h4>
                        {formCode && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {formCode.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {visualMode === 'upload' && formIconUrl
                          ? 'Imagen personalizada 500 × 500 px vinculada'
                          : visualMode === 'upload'
                          ? 'Sin imagen cargada (se usará icono)'
                          : formIconName
                          ? `Icono preestablecido: ${formIconName}`
                          : 'Icono por defecto según categoría'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 shrink-0">
                    Vista Previa
                  </span>
                </div>

                {/* Preset Icons Gallery */}
                {visualMode === 'preset' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Selecciona un icono temático:</span>
                      {formIconName && (
                        <button
                          type="button"
                          onClick={() => setFormIconName(undefined)}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
                        >
                          Restablecer por defecto
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-slate-200 bg-white rounded-xl">
                      {PRESET_SUBJECT_ICONS.map((opt) => {
                        const IconComp = opt.icon;
                        const isSelected = formIconName === opt.name;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => setFormIconName(opt.name)}
                            title={opt.label}
                            className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-[#3A6B1F] ring-2 ring-[#5EA832] scale-105 shadow-2xs font-bold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload Image 500x500 Area */}
                {visualMode === 'upload' && (
                  <div className="space-y-2 pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {formIconUrl ? (
                      <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0 relative group">
                            <img src={formIconUrl} alt="Vista 500x500" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white uppercase">500×500</span>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="truncate">Imagen en 500 × 500 px lista</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              Se reflejará en tarjetas, horarios y evaluaciones.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Cambiar
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 border-2 border-dashed border-slate-300 hover:border-[#5EA832] hover:bg-emerald-50/40 rounded-xl text-center cursor-pointer transition-all ${
                          isProcessingImage ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#5EA832] flex items-center justify-center mb-1.5">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            {isProcessingImage ? 'Procesando imagen...' : 'Haz clic o arrastra para subir una imagen'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Dimensión: <strong>500 × 500 px</strong> (JPG, PNG, WebP)
                          </p>
                          <p className="text-[9.5px] text-[#285A14] font-medium mt-1">
                            El sistema la recorta y adapta automáticamente a 500x500 cuadrada
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Color Picker Section (Predeterminados / Personalizado) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Color de Identificación Institucional
                  </label>
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setColorMode('preset')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        colorMode === 'preset' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Predeterminados
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorMode('custom')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        colorMode === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Personalizado
                    </button>
                  </div>
                </div>

                {colorMode === 'preset' ? (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {[
                      { hex: '#4F46E5', name: 'Índigo' },
                      { hex: '#5EA832', name: 'Verde Manglar' },
                      { hex: '#0284C7', name: 'Azul Celeste' },
                      { hex: '#7C3AED', name: 'Púrpura' },
                      { hex: '#DB2777', name: 'Rosa' },
                      { hex: '#D97706', name: 'Ámbar' },
                      { hex: '#059669', name: 'Esmeralda' },
                      { hex: '#DC2626', name: 'Rojo' },
                      { hex: '#475569', name: 'Pizarra' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setFormColor(c.hex)}
                        className={`w-7 h-7 rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                          formColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {formColor === c.hex && <CheckCircle2 className="w-4 h-4 text-white drop-shadow-xs" />}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setColorMode('custom')}
                      className="w-7 h-7 rounded-full border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 text-xs shrink-0 transition-all cursor-pointer"
                      title="Abrir selector personalizado"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300">Selector de Color Personalizado</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border border-white/20 shadow-2xs" style={{ backgroundColor: formColor }} />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider">{formColor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Native spectrum color input */}
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={formColor.startsWith('#') && formColor.length === 7 ? formColor : '#5EA832'}
                          onChange={(e) => setFormColor(e.target.value.toUpperCase())}
                          className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0 shadow-inner"
                        />
                      </div>

                      {/* HEX Input Field */}
                      <div className="flex-1">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-bold">#</span>
                          <input
                            type="text"
                            maxLength={7}
                            value={formColor.startsWith('#') ? formColor.slice(1) : formColor}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                              setFormColor(`#${val.toUpperCase()}`);
                            }}
                            placeholder="80B042"
                            className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold rounded-xl pl-7 pr-3 py-2 focus:ring-2 focus:ring-emerald-400 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Popular Custom Shades Row */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold">Tonos sugeridos:</span>
                      <div className="flex items-center gap-1.5">
                        {['#80B042', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#64748B'].map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => setFormColor(hex)}
                            className={`w-5 h-5 rounded-full border border-white/20 transition-transform cursor-pointer ${
                              formColor === hex ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción o Alcance Formativo
                </label>
                <textarea
                  id="subject-form-description"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enfoque pedagógico, competencias que desarrolla o metodología institucional..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#5EA832] resize-none"
                />
              </div>

              {/* Applicable Grades */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Grados Aplicables ({formGrades.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllGrades}
                    className="text-[11px] font-semibold text-[#5EA832] hover:text-[#4d8c28]"
                  >
                    Seleccionar todos
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {displayGrades.map((grade) => {
                    const isChecked = formGrades.includes(grade);
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => handleToggleGrade(grade)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-[#3A6B1F]'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{grade}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[#5EA832]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#5EA832] hover:bg-[#4d8c28] text-white text-xs font-bold shadow-sm hover:shadow transition-all"
                >
                  {editingSubject ? 'Guardar Cambios' : 'Crear Asignatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-300 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                ¿Eliminar Asignatura?
              </h3>
              <p className="text-xs text-slate-500">
                ¿Estás seguro de que deseas eliminar <strong>{deleteConfirmSubject.name}</strong>?
                Ya no aparecerá en las opciones para nuevas planificaciones ni horarios.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmSubject(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmSubject)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
