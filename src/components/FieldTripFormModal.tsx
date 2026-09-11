import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Save, Bus, Sparkles, Calendar, Clock, MapPin, User, Users, 
  BookOpen, CheckSquare, Square, AlertCircle, FileText, CheckCircle2,
  Phone, Building2, Layers
} from 'lucide-react';
import { FieldTrip, FieldTripType, FieldTripStatus } from '../types';
import { useEduPlan } from '../context/EduPlanContext';

interface Props {
  initialData?: FieldTrip | null;
  onClose: () => void;
  onSaved: (trip: FieldTrip) => void;
}

const GRADE_GROUPS = [
  {
    label: 'Educación Primaria',
    options: ['1er Grado', '2do Grado', '3ro Grado', '4to Grado', '5to Grado', '6to Grado']
  },
  {
    label: 'Educación Inicial / Preescolar',
    options: ['Maternal', 'Prematernal', '1er Grupo', '2do Grupo', '3er Grupo']
  },

  {
    label: 'Asignaturas y Especialidades',
    options: ['Francés', 'Inglés', 'Robótica', 'Tecnología', 'Computación', 'Educación Física y Deportes', 'Música', 'Educación Artística']
  }
];

export const FieldTripFormModal: React.FC<Props> = ({ initialData, onClose, onSaved }) => {
  const { currentUser, viewMode, addFieldTrip, updateFieldTrip, classroomProjects } = useEduPlan();
  const isCoordinator = viewMode === 'coordinator';

  const [formData, setFormData] = useState<Omit<FieldTrip, 'id' | 'createdAt' | 'updatedAt'>>({
    type: 'salida_campo',
    grade: currentUser.schoolGrade || '6to Grado',
    lapso: '1er Lapso',
    weekNumber: 8,
    lapsoSemanaLabel: '1/8',
    date: new Date().toISOString().split('T')[0],
    destinationOrGuest: '',
    allianceName: '',
    contactPhone: '',
    alliancesOrContacts: '',
    purpose: '',
    subjectOrContext: '',
    projectId: '',
    responsibleTeacher: currentUser.fullName,
    chaperoneTeachers: '',
    resources: 'Unidad de transporte de la institución',
    focus: {
      socialResponsibility: false,
      citizenParticipation: false,
      nationalIdentity: false,
      introspection: false,
    },
    methodology: '',
    keyLearnings: '',
    observations: '',
    chaperoneParents: '',
    status: isCoordinator ? 'approved' : 'submitted',
    transportRequired: true,
  });

  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Proyectos de aula (IPC / DIEV) cargados para el grado seleccionado
  const gradeProjects = useMemo(() => {
    if (!formData.grade) return [];
    const normGrade = formData.grade.toLowerCase().trim();
    return classroomProjects.filter((p) => {
      const pGrade = p.grade.toLowerCase().trim();
      return pGrade === normGrade || pGrade.includes(normGrade) || normGrade.includes(pGrade);
    });
  }, [formData.grade, classroomProjects]);

  const ipcProjects = useMemo(() => gradeProjects.filter((p) => p.type === 'IPC'), [gradeProjects]);
  const dievProjects = useMemo(() => gradeProjects.filter((p) => p.type === 'DIEV'), [gradeProjects]);

  useEffect(() => {
    if (initialData) {
      let initAlliance = initialData.allianceName || '';
      let initPhone = initialData.contactPhone || '';

      if (!initAlliance && initialData.alliancesOrContacts) {
        if (initialData.alliancesOrContacts.includes(' - ')) {
          const parts = initialData.alliancesOrContacts.split(' - ');
          initAlliance = parts[0];
          initPhone = parts.slice(1).join(' - ');
        } else {
          initAlliance = initialData.alliancesOrContacts;
        }
      }

      setFormData({
        type: initialData.type,
        grade: initialData.grade,
        lapso: initialData.lapso,
        weekNumber: initialData.weekNumber,
        lapsoSemanaLabel: initialData.lapsoSemanaLabel || `${initialData.lapso.slice(0, 1)}/${initialData.weekNumber}`,
        date: initialData.date,
        destinationOrGuest: initialData.destinationOrGuest,
        allianceName: initAlliance,
        contactPhone: initPhone,
        alliancesOrContacts: initialData.alliancesOrContacts || `${initAlliance}${initPhone ? ` - ${initPhone}` : ''}`,
        purpose: initialData.purpose,
        subjectOrContext: initialData.subjectOrContext,
        projectId: initialData.projectId || '',
        responsibleTeacher: initialData.responsibleTeacher,
        chaperoneTeachers: initialData.chaperoneTeachers || '',
        resources: initialData.resources || '',
        focus: initialData.focus || {
          socialResponsibility: false,
          citizenParticipation: false,
          nationalIdentity: false,
          introspection: false,
        },
        methodology: initialData.methodology,
        keyLearnings: initialData.keyLearnings || '',
        observations: initialData.observations || '',
        chaperoneParents: initialData.chaperoneParents || '',
        status: initialData.status,
        coordinationFeedback: initialData.coordinationFeedback || '',
        transportRequired: initialData.transportRequired ?? (initialData.type === 'salida_campo'),
      });

      if (initialData.projectId) {
        setSelectedProjectId(initialData.projectId);
      } else {
        const matched = classroomProjects.find(
          (p) => initialData.subjectOrContext && initialData.subjectOrContext.includes(p.title)
        );
        if (matched) {
          setSelectedProjectId(matched.id);
        }
      }

      const allKnown = GRADE_GROUPS.flatMap((g) => g.options);
      if (!allKnown.includes(initialData.grade)) {
        setIsCustomGrade(true);
      }
    }
  }, [initialData, classroomProjects]);

  const handleTypeChange = (newType: FieldTripType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      transportRequired: newType === 'salida_campo',
      resources: newType === 'salida_campo' 
        ? 'Unidad de transporte de la institución' 
        : prev.resources || 'Biblioteca de primaria / Aula de clases',
    }));
  };

  const handleLapsoOrWeekChange = (lapso: string, week: number) => {
    const lapsoNum = lapso.includes('1') ? '1' : lapso.includes('2') ? '2' : '3';
    setFormData((prev) => ({
      ...prev,
      lapso,
      weekNumber: week,
      lapsoSemanaLabel: `${lapsoNum}/${week}`,
    }));
  };

  const handleGradeSelect = (val: string) => {
    if (val === '__custom__') {
      setIsCustomGrade(true);
      setFormData((prev) => ({ ...prev, grade: '' }));
      setSelectedProjectId('');
    } else {
      setIsCustomGrade(false);
      setFormData((prev) => ({ ...prev, grade: val }));
      setSelectedProjectId('');
    }
  };

  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId);
    if (!projId || projId === '__manual__') {
      setFormData((prev) => ({
        ...prev,
        projectId: undefined,
      }));
      return;
    }

    const proj = classroomProjects.find((p) => p.id === projId);
    if (proj) {
      setFormData((prev) => ({
        ...prev,
        projectId: proj.id,
        subjectOrContext: `Proyecto ${proj.type}: "${proj.title}"`,
        purpose: prev.purpose.trim() ? prev.purpose : proj.purpose,
      }));
    }
  };

  const handleAllianceNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      allianceName: val,
      alliancesOrContacts: val ? (prev.contactPhone ? `${val} - ${prev.contactPhone}` : val) : (prev.contactPhone || ''),
    }));
  };

  const handleContactPhoneChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPhone: val,
      alliancesOrContacts: prev.allianceName ? (val ? `${prev.allianceName} - ${val}` : prev.allianceName) : (val || ''),
    }));
  };

  const toggleFocus = (key: keyof FieldTrip['focus']) => {
    setFormData((prev) => ({
      ...prev,
      focus: {
        ...prev.focus,
        [key]: !prev.focus[key],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destinationOrGuest.trim()) {
      alert('Por favor indica el Destino o el Nombre del Invitado Especial.');
      return;
    }
    if (!formData.grade.trim()) {
      alert('Por favor selecciona o indica el Grado o Asignatura.');
      return;
    }

    const consolidated = [formData.allianceName, formData.contactPhone].filter(Boolean).join(' - ');

    const payload = {
      ...formData,
      alliancesOrContacts: consolidated || formData.alliancesOrContacts || '',
    };

    if (initialData) {
      const updated: FieldTrip = {
        ...payload,
        id: initialData.id,
        createdAt: initialData.createdAt,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      updateFieldTrip(updated);
      onSaved(updated);
    } else {
      const created = addFieldTrip(payload);
      onSaved(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-5 sm:px-7 py-4 bg-gradient-to-r from-[#285A14] to-[#3A6B1F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              {formData.type === 'salida_campo' ? (
                <Bus className="w-5 h-5 text-white" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#F8CB0A]" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider block">
                {initialData ? 'Actualizar Registro' : 'Nuevo Registro Institucional'}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {formData.type === 'salida_campo' ? 'Salida de Campo' : 'Invitado Especial'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* 1. SELECCIÓN DE TIPO DE ACTIVIDAD */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tipo de Experiencia Pedagógica
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('salida_campo')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                  formData.type === 'salida_campo'
                    ? 'border-[#5EA832] bg-emerald-50/80 ring-2 ring-[#5EA832]/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  formData.type === 'salida_campo' ? 'bg-[#5EA832] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Salida de Campo</h4>
                  <p className="text-xs text-slate-500">Visita o paseo vivencial fuera de las instalaciones del plantel</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('invitado_especial')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                  formData.type === 'invitado_especial'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  formData.type === 'invitado_especial' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Invitado Especial</h4>
                  <p className="text-xs text-slate-500">Especialista, ponente, tallerista o familia invitada al aula</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. TEMPORALIDAD Y GRADO DESPLEGABLE */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#5EA832]" />
              Temporalidad y Nivel Académico
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Grado / Asignatura *
                </label>
                {!isCustomGrade ? (
                  <select
                    required
                    value={formData.grade}
                    onChange={(e) => handleGradeSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                  >
                    <option value="" disabled>Seleccione Grado o Asignatura</option>
                    {GRADE_GROUPS.map((grp) => (
                      <optgroup key={grp.label} label={grp.label}>
                        {grp.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="__custom__">✏️ Otro (personalizado)...</option>
                  </select>
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="ej. 6to Grado, Francés"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomGrade(false)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 rounded-lg shrink-0 cursor-pointer"
                      title="Volver a lista desplegable"
                    >
                      Lista
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lapso</label>
                <select
                  value={formData.lapso}
                  onChange={(e) => handleLapsoOrWeekChange(e.target.value, formData.weekNumber)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                >
                  <option value="1er Lapso">1er Lapso</option>
                  <option value="2do Lapso">2do Lapso</option>
                  <option value="3er Lapso">3er Lapso</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Semana (1 a 15)</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  required
                  value={formData.weekNumber}
                  onChange={(e) => handleLapsoOrWeekChange(formData.lapso, parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha Programada</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 3. ANTES DEL PASEO O INVITADO */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#5EA832]" />
              Antes del Paseo o Invitado (Planificación Logística y Pedagógica)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {formData.type === 'salida_campo' ? 'Destino / Lugar de la Visita *' : 'Nombre del Invitado / Ponente *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.type === 'salida_campo'
                      ? 'ej. Centro de Especialidades Médicas Anzoátegui, Mochima, Museo'
                      : 'ej. Psicólogo Araima Cabrera, Thalia Villarroel, Familia González'
                  }
                  value={formData.destinationOrGuest}
                  onChange={(e) => setFormData({ ...formData, destinationOrGuest: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#5EA832]" />
                  <span>Nombre de la Alianza / Contacto</span>
                </label>
                <input
                  type="text"
                  placeholder="ej. Dra. Yndira Hernández, Alianza Francesa, INPARQUES"
                  value={formData.allianceName || ''}
                  onChange={(e) => handleAllianceNameChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#5EA832]" />
                  <span>Número de Contacto (Teléfono / Celular)</span>
                </label>
                <input
                  type="tel"
                  placeholder="ej. 0426-2185633, +58 281-2814522"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleContactPhoneChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden font-mono"
                />
              </div>

              {/* CONTEXTO DEL PROYECTO (CON DESPLEGABLE DE PROYECTOS IPC / DIEV) */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Contexto del proyecto
                  </label>
                  {gradeProjects.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {gradeProjects.length} proyecto(s) IPC/DIEV de {formData.grade}
                    </span>
                  )}
                </div>

                {gradeProjects.length > 0 ? (
                  <div className="space-y-1.5">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => handleProjectSelect(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm bg-emerald-50/40 border border-emerald-300/80 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden cursor-pointer"
                    >
                      <option value="">-- Seleccionar proyecto de aula ({formData.grade}) --</option>
                      
                      {ipcProjects.length > 0 && (
                        <optgroup label="Proyectos IPC (Interés por el Conocimiento)">
                          {ipcProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                              [IPC] {p.title}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {dievProjects.length > 0 && (
                        <optgroup label="Proyectos DIEV (Desarrollo Integral, Ética y Valores)">
                          {dievProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                              [DIEV] {p.title}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      <option value="__manual__">✏️ Escribir otro contexto personalizado...</option>
                    </select>

                    <input
                      type="text"
                      placeholder='ej. Proyecto "LA TECNOLOGÍA EN LA MEDICINA", o Asignatura...'
                      value={formData.subjectOrContext}
                      onChange={(e) => {
                        setFormData({ ...formData, subjectOrContext: e.target.value });
                        if (selectedProjectId !== '__manual__') setSelectedProjectId('');
                      }}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder='ej. Proyecto "LA TECNOLOGÍA EN LA MEDICINA", Francés, o Plan Lector...'
                    value={formData.subjectOrContext}
                    onChange={(e) => setFormData({ ...formData, subjectOrContext: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                  />
                )}
                <p className="text-[11px] text-slate-500">
                  Asocia la salida o invitado al proyecto pedagógico de aula del grado o a la asignatura correspondiente.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tema / Propósito Pedagógico
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Que los alumnos a través de esta experiencia conozcan los beneficios que aporta la tecnología en el campo de la salud..."
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Docente Responsable
                </label>
                <input
                  type="text"
                  required
                  value={formData.responsibleTeacher}
                  onChange={(e) => setFormData({ ...formData, responsibleTeacher: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Docentes Acompañantes
                </label>
                <input
                  type="text"
                  placeholder="ej. Paola Cueche y Patricia Rodríguez"
                  value={formData.chaperoneTeachers}
                  onChange={(e) => setFormData({ ...formData, chaperoneTeachers: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recursos Requeridos
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="ej. Unidad de transporte de la institución, Biblioteca de primaria"
                    value={formData.resources}
                    onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                  />
                  <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-semibold text-slate-700 shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.transportRequired}
                      onChange={(e) => setFormData({ ...formData, transportRequired: e.target.checked })}
                      className="rounded text-[#5EA832] focus:ring-[#5EA832]"
                    />
                    <span>Transporte Institucional</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 4. ENFOQUES RELACIONADOS (PILARES DEL MANGLAR) */}
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700" />
                Enfoques Relacionados (Pilares Institucionales El Manglar)
              </h3>
              <span className="text-[10px] text-amber-800 font-semibold">Marca los ejes formativos</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'socialResponsibility' as const, label: 'RESPONSABILIDAD SOCIAL' },
                { key: 'citizenParticipation' as const, label: 'PARTICIPACIÓN CIUDADANA' },
                { key: 'nationalIdentity' as const, label: 'IDENTIDAD NACIONAL' },
                { key: 'introspection' as const, label: 'INTROSPECCIÓN' },
              ].map(({ key, label }) => {
                const isChecked = formData.focus[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleFocus(key)}
                    className={`px-3 py-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isChecked
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-2xs ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 font-medium'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-amber-700 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className="text-[11px] leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. METODOLOGÍA Y APRENDIZAJES CLAVE (¿CÓMO?) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#5EA832]" />
              Metodología Vivencial y Aprendizajes
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ¿CÓMO? (Desarrollo y metodología de la experiencia vivencial)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe cómo se desarrollará la actividad vivencial, actividades guiadas, preguntas orientadoras o recorrido..."
                  value={formData.methodology}
                  onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aprendizajes Claves
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Las emociones, diferencia entre emociones y sentimientos, gestión de emociones."
                  value={formData.keyLearnings}
                  onChange={(e) => setFormData({ ...formData, keyLearnings: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Representantes Acompañantes
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Sra. Valentina Méndez, Familia Dorash Nasser"
                    value={formData.chaperoneParents}
                    onChange={(e) => setFormData({ ...formData, chaperoneParents: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Observaciones Logísticas
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Salida autorizada por Dirección a las 8:30 am"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 6. ESTADO DE COORDINACIÓN */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Estado del Registro</span>
              <p className="text-xs text-slate-500">
                {isCoordinator 
                  ? 'Como coordinación puedes aprobar o cambiar el estado directamente.'
                  : 'Envía a coordinación para su revisión pedagógica y logística institucional.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as FieldTripStatus })}
                className="px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
              >
                <option value="draft">Borrador</option>
                <option value="submitted">Enviada a Coordinación</option>
                <option value="approved">Aprobada (Visto Bueno)</option>
                <option value="completed">Realizada</option>
              </select>
            </div>
          </div>

        </form>

        {/* MODAL FOOTER */}
        <div className="px-5 sm:px-7 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-[#5EA832] hover:bg-[#498925] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{initialData ? 'Guardar Cambios' : 'Registrar Experiencia'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
