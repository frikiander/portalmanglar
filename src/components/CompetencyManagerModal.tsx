import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Award, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  ListPlus,
  BookOpen,
  Filter,
  Check,
  RefreshCw
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { AVAILABLE_SUBJECTS, AVAILABLE_GRADES } from '../data/mockData';
import { matchSubjects, matchGrades } from '../utils/curricularMatcher';
import { 
  generateCompetencyCode, 
  getSubjectCode, 
  getGradeCode, 
  getCategoryCode, 
  STANDARD_CURRICULAR_AXES 
} from '../utils/competencyCode';
import { 
  GradeBadge, 
  getGradeBadgeStyle, 
  getGradeColorConfig, 
  getGradeLeftAccentStyle 
} from '../utils/gradeColors';
import { Competency } from '../types';

interface Props {
  onClose: () => void;
}

export const CompetencyManagerModal: React.FC<Props> = ({ onClose }) => {
  const { competencies, addCompetency, deleteCompetency, addToast, availableSubjectNames, availableGradeNames } = useEduPlan();

  const baseSubjects = availableSubjectNames?.length > 0 ? availableSubjectNames : AVAILABLE_SUBJECTS;
  const baseGrades = availableGradeNames?.length > 0 ? availableGradeNames : AVAILABLE_GRADES;

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // New competency form state
  const [subject, setSubject] = useState<string>(() => baseSubjects[0] || 'Inglés (Language Arts)');
  const [grade, setGrade] = useState<string>(() => baseGrades.find((g) => g.includes('4')) || baseGrades[0] || '4to Grado');

  const displaySubjects = baseSubjects.includes(subject) ? baseSubjects : [subject, ...baseSubjects];
  const displayGrades = baseGrades.includes(grade) ? baseGrades : [grade, ...baseGrades];
  const [category, setCategory] = useState<string>('');
  const [autoCode, setAutoCode] = useState<string>('');
  const [isManualCode, setIsManualCode] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  
  // Indicators list state
  const [indicators, setIndicators] = useState<string[]>([
    'Identifica la idea principal y vocabulario clave en textos breves.',
    'Responde preguntas guiadas de comprensión sobre rutinas diarias.'
  ]);
  const [currentIndicatorInput, setCurrentIndicatorInput] = useState<string>('');

  // Filter state for browsing
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const gradeColorConfig = getGradeColorConfig(grade);

  // Recalculate automatic code whenever subject, grade or category changes
  useEffect(() => {
    const generated = generateCompetencyCode(subject, grade, category);
    setAutoCode(generated);
    if (!isManualCode) {
      setManualCode(generated);
    }
  }, [subject, grade, category, isManualCode]);

  // Handle adding an indicator
  const handleAddIndicator = () => {
    const trimmed = currentIndicatorInput.trim();
    if (!trimmed) return;
    if (indicators.includes(trimmed)) {
      addToast('Este indicador ya está en la lista.', 'warning');
      return;
    }
    setIndicators((prev) => [...prev, trimmed]);
    setCurrentIndicatorInput('');
  };

  // Handle removing an indicator
  const handleRemoveIndicator = (indexToRemove: number) => {
    setIndicators((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDownIndicator = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIndicator();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Ingresa el enunciado o título de la competencia.', 'warning');
      return;
    }

    if (indicators.length === 0) {
      addToast('Agrega al menos un indicador para esta competencia.', 'warning');
      return;
    }

    const finalCode = (isManualCode && manualCode.trim()) 
      ? manualCode.trim().toUpperCase() 
      : autoCode;

    addCompetency({
      subject,
      grade,
      code: finalCode,
      title: title.trim(),
      category: category.trim() || 'Sin Eje',
      indicators: indicators,
    });

    // Reset form
    setTitle('');
    setIndicators([
      'Identifica elementos centrales del contenido curricular.',
      'Aplica los conocimientos adquiridos en situaciones prácticas.'
    ]);
    setIsManualCode(false);
    setActiveTab('list');
  };

  // Filtered competencies for the list tab
  const filteredCompetencies = competencies.filter((c) => {
    const matchesSubject = filterSubject === 'all' || matchSubjects(c.subject, filterSubject);
    const matchesGrade = filterGrade === 'all' || matchGrades(c.grade, filterGrade);
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      (c.indicators && c.indicators.some((ind) => ind.toLowerCase().includes(q)));
    return matchesSubject && matchesGrade && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#285A14]/10 text-[#285A14] rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Banco de Competencias Curriculares
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            id="tab-create-competency"
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#285A14] text-[#285A14]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Competencia</span>
          </button>

          <button
            id="tab-list-competencies"
            onClick={() => setActiveTab('list')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'border-[#285A14] text-[#285A14]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ver Banco ({competencies.length})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Step 1: Subject and Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    1. Asignatura *
                  </label>
                  <select
                    id="new-comp-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#285A14] focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    {displaySubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      2. Grado / Nivel *
                    </label>
                    <GradeBadge grade={grade} size="xs" variant="solid" />
                  </div>
                  <select
                    id="new-comp-grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#285A14] focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    {displayGrades.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Curricular Axis and Automatic Code */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                <div className="sm:col-span-7 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    3. Eje curricular <span className="text-slate-400 font-normal normal-case">(opcional)</span>
                  </label>
                  <select
                    id="new-comp-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#285A14] focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    <option value="">-- Sin Eje (Opcional) --</option>
                    {STANDARD_CURRICULAR_AXES.map((axis) => (
                      <option key={axis} value={axis}>{axis}</option>
                    ))}
                    {category && !STANDARD_CURRICULAR_AXES.includes(category) && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Eje temático estructurado para la codificación. Si no se selecciona, la competencia no llevará eje en su código.
                  </p>
                </div>

                {/* Auto-generated Code Card with Grade Visual Identity */}
                <div 
                  className="sm:col-span-5 rounded-xl p-3.5 border transition-all shadow-2xs"
                  style={{
                    backgroundColor: gradeColorConfig?.bgLight || '#f0fdf4',
                    borderColor: gradeColorConfig?.borderColor || '#bbf7d0',
                    borderLeftWidth: '5px',
                    borderLeftColor: gradeColorConfig?.hex || '#5EA832',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: gradeColorConfig?.hex || '#285A14' }} />
                      <span>Código de Competencia</span>
                    </div>
                    <GradeBadge grade={grade} size="xs" variant="solid" />
                  </div>

                  <div className="flex items-center space-x-2 my-1.5">
                    {isManualCode ? (
                      <input
                        type="text"
                        id="new-comp-code"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="w-full bg-white font-mono text-sm font-bold rounded-lg px-2.5 py-1.5 text-center tracking-wider shadow-2xs border"
                        style={{ borderColor: gradeColorConfig?.borderColor || '#cbd5e1' }}
                      />
                    ) : (
                      <div 
                        className="w-full font-mono text-xs font-bold rounded-lg px-3 py-1.5 text-center tracking-wider shadow-2xs border flex items-center justify-center transition-all"
                        style={getGradeBadgeStyle(grade)}
                      >
                        {autoCode}
                      </div>
                    )}
                    <button
                      type="button"
                      title={isManualCode ? "Restaurar código automático" : "Editar código manualmente"}
                      onClick={() => {
                        if (isManualCode) {
                          setIsManualCode(false);
                          setManualCode(autoCode);
                        } else {
                          setIsManualCode(true);
                          setManualCode(autoCode);
                        }
                      }}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-600 flex items-center justify-between px-0.5 pt-0.5">
                    <span>Asignatura: <strong>{getSubjectCode(subject)}</strong></span>
                    <span>·</span>
                    <span>Grado: <strong>{getGradeCode(grade)}</strong></span>
                    <span>·</span>
                    <span>Eje: <strong>{getCategoryCode(category) || 'N/A'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Step 3: Competency Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  4. Enunciado de la Competencia Curricular *
                </label>
                <input
                  id="new-comp-title"
                  type="text"
                  required
                  placeholder="Ej: Oral Comprehension in Daily Routines / Resolución de problemas multiplicativos"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-[#285A14] focus:bg-white font-medium transition-all"
                />
              </div>

              {/* Step 4: Indicators (List & Add) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ListPlus className="w-4 h-4 text-[#285A14]" />
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      5. Indicadores Relacionados a esta Competencia ({indicators.length}) *
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Se seleccionarán al planificar
                  </span>
                </div>

                {/* Input to add indicator */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="new-indicator-input"
                    value={currentIndicatorInput}
                    onChange={(e) => setCurrentIndicatorInput(e.target.value)}
                    onKeyDown={handleKeyDownIndicator}
                    placeholder="Escribe un indicador relacionado y presiona 'Agregar' o Enter..."
                    className="flex-1 bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#285A14]"
                  />
                  <button
                    type="button"
                    id="add-indicator-btn"
                    onClick={handleAddIndicator}
                    className="px-4 py-2 bg-[#285A14] hover:bg-[#30551c] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>

                {/* List of current indicators */}
                {indicators.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {indicators.map((ind, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start space-x-2.5 flex-1 pr-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#285A14] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{ind}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveIndicator(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors shrink-0"
                          title="Eliminar este indicador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-center font-medium">
                    ⚠️ Debes registrar al menos un indicador de logro para esta competencia.
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="submit-new-competency-btn"
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#285A14] hover:bg-[#30551c] rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar en el Banco</span>
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* TAB 2: VER BANCO DE COMPETENCIAS                                         */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por título, código o indicador..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 text-xs rounded-lg focus:ring-1 focus:ring-[#285A14]"
                  />
                </div>

                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#285A14]"
                >
                  <option value="all">Todas las Asignaturas</option>
                  {(availableSubjectNames?.length > 0 ? availableSubjectNames : AVAILABLE_SUBJECTS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#285A14]"
                >
                  <option value="all">Todos los Grados</option>
                  {displayGrades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* List of competencies */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredCompetencies.length > 0 ? (
                  filteredCompetencies.map((c) => (
                    <div 
                      key={c.id} 
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition-all space-y-2.5"
                      style={getGradeLeftAccentStyle(c.grade, 5)}
                    >
                      {/* Header with Title and Badges */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                            <span 
                              className="font-mono text-xs font-bold px-2.5 py-1 rounded-md border tracking-wider shadow-2xs"
                              style={getGradeBadgeStyle(c.grade)}
                            >
                              {c.code}
                            </span>
                            <span className="font-bold text-sm text-slate-900">
                              {c.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 pt-0.5 flex-wrap gap-y-1">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {c.subject}
                            </span>
                            <GradeBadge grade={c.grade} size="xs" variant="solid" />
                            {c.category && c.category !== 'Sin Eje' && c.category !== 'Sin eje' ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#285A14] font-semibold text-[11px]">
                                Eje: {c.category}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium text-[11px]">
                                Sin Eje
                              </span>
                            )}

                          </div>
                        </div>

                        {/* Delete action */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Deseas eliminar la competencia ${c.code} del banco?`)) {
                              deleteCompetency(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar del banco"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Associated Indicators list */}
                      <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                          Indicadores Relacionados ({c.indicators?.length || 0}):
                        </span>
                        {c.indicators && c.indicators.length > 0 ? (
                          <ul className="space-y-1">
                            {c.indicators.map((ind, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start space-x-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#5EA832] shrink-0 mt-0.5" />
                                <span>{ind}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No hay indicadores registrados.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No se encontraron competencias con los filtros seleccionados.</p>
                    <p className="text-xs text-slate-400 mt-1">Prueba cambiando la asignatura o el grado.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
