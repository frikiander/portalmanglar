import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, Plus, Printer, Download, UserCheck, 
  UserPlus, Shield, MessageCircle, Phone, Mail, ExternalLink, 
  Calendar, CheckCircle2, AlertCircle, ArrowRightLeft, FileSpreadsheet,
  ChevronRight, Eye, MoreHorizontal, Layers, Sparkles
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { Student, StudentCondition } from '../types';
import { SCHOOL_GRADES } from '../data/mockRoster';
import { getGradeColorConfig, getGradeHex, getGradeLeftAccentStyle, GradeBadge } from '../utils/gradeColors';
import { StudentDetailModal } from './StudentDetailModal';
import { StudentFormModal } from './StudentFormModal';
import { RosterPrintModal } from './RosterPrintModal';

type RosterViewMode = 'general' | 'family' | 'canvas' | 'sociogram' | 'filiation';

export const RosterSection: React.FC = () => {
  const { 
    students, 
    selectedRosterGrade, 
    setSelectedRosterGrade, 
    toggleSociogramGroup, 
    updateCanvasStatus,
    viewMode, 
    addToast,
    availableGradeNames,
  } = useEduPlan();

  const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : SCHOOL_GRADES;

  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'ALL' | StudentCondition>('ALL');
  const [canvasFilter, setCanvasFilter] = useState<'ALL' | 'accepted' | 'pending' | 'modules_ready'>('ALL');
  const [viewTab, setViewTab] = useState<RosterViewMode>('general');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const isCoordinator = viewMode === 'coordinator';

  // Filter students for the selected grade
  const gradeStudents = useMemo(() => {
    return students.filter((s) => s.grade === selectedRosterGrade);
  }, [students, selectedRosterGrade]);

  // Filter with search term and filter criteria
  const filteredStudents = useMemo(() => {
    return gradeStudents.filter((student) => {
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.schoolId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.motherName && student.motherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.fatherName && student.fatherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.motherPhone && student.motherPhone.includes(searchTerm)) ||
        (student.fatherPhone && student.fatherPhone.includes(searchTerm)) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCondition =
        conditionFilter === 'ALL' || student.condition === conditionFilter;

      let matchesCanvas = true;
      if (canvasFilter === 'accepted') matchesCanvas = student.canvasAccepted;
      if (canvasFilter === 'pending') matchesCanvas = !student.canvasAccepted;
      if (canvasFilter === 'modules_ready') {
        matchesCanvas = !!student.canvasObservations?.includes('TODOS SUS MÓDULOS');
      }

      return matchesSearch && matchesCondition && matchesCanvas;
    });
  }, [gradeStudents, searchTerm, conditionFilter, canvasFilter]);

  // Key metrics for this grade
  const totalInGrade = gradeStudents.length;
  const newStudentsCount = gradeStudents.filter((s) => s.condition === 'NUEVO').length;
  const regularCount = gradeStudents.filter((s) => s.condition === 'Regular').length;
  const canvasAcceptedCount = gradeStudents.filter((s) => s.canvasAccepted).length;
  const group1Count = gradeStudents.filter((s) => s.sociogramGroup === 'Grupo 1').length;
  const group2Count = gradeStudents.filter((s) => s.sociogramGroup === 'Grupo 2').length;

  const getWhatsAppLink = (phone?: string, studentName?: string) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/[^0-9]/g, '');
    let intl = cleaned;
    if (cleaned.startsWith('0')) {
      intl = '58' + cleaned.slice(1);
    } else if (!cleaned.startsWith('58') && cleaned.length >= 10) {
      intl = '58' + cleaned;
    }
    const text = encodeURIComponent(
      `Estimado representante de ${studentName || 'el alumno'}, le saludamos de la Coordinación del Colegio Integral El Manglar.`
    );
    return `https://wa.me/${intl}?text=${text}`;
  };

  const handleExportCSV = () => {
    const headers = [
      'N°',
      'Apellidos y Nombres',
      'Cédula Escolar',
      'Fecha Nac.',
      'Condición',
      'Hermanos',
      'Madre',
      'C.I. Madre',
      'Móvil Madre',
      'Email Madre',
      'Padre',
      'C.I. Padre',
      'Móvil Padre',
      'Email Padre',
      'Habitación/Oficina',
      'Correo Alumno',
      'Canvas Aceptado',
      'Observaciones Canvas',
      'Grupo Sociograma',
    ];

    const rows = filteredStudents.map((s) => [
      s.orderNumber,
      `"${s.fullName}"`,
      `"${s.schoolId}"`,
      `"${s.birthDate || ''}"`,
      `"${s.condition}"`,
      `"${s.siblings || ''}"`,
      `"${s.motherName || ''}"`,
      `"${s.motherId || ''}"`,
      `"${s.motherPhone || ''}"`,
      `"${s.motherEmail || ''}"`,
      `"${s.fatherName || ''}"`,
      `"${s.fatherId || ''}"`,
      `"${s.fatherPhone || ''}"`,
      `"${s.fatherEmail || ''}"`,
      `"${s.homeOfficePhone || ''}"`,
      `"${s.email || ''}"`,
      s.canvasAccepted ? 'SI' : 'NO',
      `"${s.canvasObservations || ''}"`,
      `"${s.sociogramGroup || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nomina_${selectedRosterGrade.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Archivo Excel (.CSV) descargado con éxito.', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Nómina de Estudiantes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Colegio Integral El Manglar · Año Escolar 2025 - 2026
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Exportar Excel</span>
          </button>

          {isCoordinator && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#285A14] hover:bg-[#1f4710] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inscribir Estudiante</span>
            </button>
          )}
        </div>
      </div>

      {/* Grade Selector Tabs (Hojas del Libro de Excel) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between px-3 py-1.5 mb-1 border-b border-slate-100">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#5EA832]" />
            Hojas de Grado (Excel Nómina)
          </span>
          <span className="text-[11px] text-slate-400">
            Total matriculados en plantel: <strong>{students.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 py-2 px-1">
          {displayGrades.map((grade) => {
            const count = students.filter((s) => s.grade === grade).length;
            const isSelected = selectedRosterGrade === grade;
            const colorCfg = getGradeColorConfig(grade);
            return (
              <button
                key={grade}
                onClick={() => setSelectedRosterGrade(grade)}
                style={
                  isSelected && colorCfg
                    ? {
                        backgroundColor: '#0f172a',
                        borderBottomWidth: '3px',
                        borderBottomColor: colorCfg.hex,
                      }
                    : undefined
                }
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-xs border border-slate-800'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {colorCfg ? (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ring-1 ring-black/10"
                      style={{ backgroundColor: colorCfg.hex }}
                      title={`Color oficial: ${colorCfg.hex}`}
                    />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span className="truncate">{grade}</span>
                </div>
                <span
                  style={
                    isSelected && colorCfg
                      ? {
                          backgroundColor: colorCfg.hex,
                          color: colorCfg.textColor,
                        }
                      : undefined
                  }
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                    !isSelected
                      ? count > 0
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-200/50 text-slate-400'
                      : ''
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Identification Header Banner */}
      <div 
        className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={getGradeLeftAccentStyle(selectedRosterGrade, 6)}
      >
        <div className="flex items-center gap-3">
          <GradeBadge grade={selectedRosterGrade} size="md" showDot />
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              Nómina Oficial · {selectedRosterGrade}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Colegio Integral El Manglar · {totalInGrade} estudiantes matriculados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getGradeColorConfig(selectedRosterGrade) && (
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getGradeHex(selectedRosterGrade) }} />
              <span>Color Institucional: <strong>{getGradeHex(selectedRosterGrade)}</strong></span>
            </span>
          )}
        </div>
      </div>

      {/* KPIs & Summary Metrics for Selected Grade */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#5EA832]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Total Matrícula
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{totalInGrade}</span>
              <span className="text-xs text-slate-500 font-medium">alumnos</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Nuevos Ingresos
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-amber-600">{newStudentsCount}</span>
              <span className="text-xs text-slate-500 font-medium">/ {regularCount} Regulares</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-cyan-700" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Canvas Aceptados
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {totalInGrade > 0 ? Math.round((canvasAcceptedCount / totalInGrade) * 100) : 0}%
              </span>
              <span className="text-xs text-slate-500 font-medium">({canvasAcceptedCount}/{totalInGrade})</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Sociograma
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                G1: {group1Count}
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                G2: {group2Count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Tabs Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Row 1: Search & Condition/Canvas filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por alumno, cédula, madre, padre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Condición:</span>
              {(['ALL', 'Regular', 'NUEVO'] as const).map((cond) => (
                <button
                  key={cond}
                  onClick={() => setConditionFilter(cond)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    conditionFilter === cond
                      ? cond === 'NUEVO'
                        ? 'bg-[#F8CB0A] text-slate-950 shadow-2xs'
                        : 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cond === 'ALL' ? 'Todos' : cond}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Canvas:</span>
              <select
                value={canvasFilter}
                onChange={(e) => setCanvasFilter(e.target.value as any)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">Todos los estatus</option>
                <option value="accepted">Invitación Aceptada</option>
                <option value="pending">Pendiente Invitación</option>
                <option value="modules_ready">Módulos Listos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Segmented View Tabs (Solución optimizada a las columnas anchas de Excel) */}
        <div className="flex items-center gap-1 pt-3 border-t border-slate-100 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-2 hidden sm:inline">
            Modo de Vista:
          </span>
          <button
            onClick={() => setViewTab('general')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              viewTab === 'general'
                ? 'bg-emerald-50 text-[#3A6B1F] border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Ficha General</span>
          </button>

          <button
            onClick={() => setViewTab('family')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              viewTab === 'family'
                ? 'bg-emerald-50 text-[#3A6B1F] border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-pink-600" />
            <span>Directorio Familiar & WhatsApp</span>
          </button>

          <button
            onClick={() => setViewTab('canvas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              viewTab === 'canvas'
                ? 'bg-emerald-50 text-[#3A6B1F] border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-600" />
            <span>Canvas LMS Tracker</span>
          </button>

          <button
            onClick={() => setViewTab('sociogram')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              viewTab === 'sociogram'
                ? 'bg-emerald-50 text-[#3A6B1F] border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
            <span>Sociograma (Grupos)</span>
          </button>

          <button
            onClick={() => setViewTab('filiation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              viewTab === 'filiation'
                ? 'bg-emerald-50 text-[#3A6B1F] border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Filiación & Nacimiento</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron estudiantes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || conditionFilter !== 'ALL' || canvasFilter !== 'ALL'
              ? 'Intenta ajustar los criterios de búsqueda o filtros activos.'
              : `No hay alumnos registrados en ${selectedRosterGrade}. Puedes agregar el primero usando el botón Inscribir Estudiante.`}
          </p>
          {isCoordinator && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl text-xs font-bold text-white bg-[#5EA832] hover:bg-[#498925] shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inscribir en {selectedRosterGrade}</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* VISTA 1: FICHA GENERAL */}
          {viewTab === 'general' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3 text-center w-12">N°</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-3">Cédula Escolar</th>
                      <th className="py-3 px-3">Condición</th>
                      <th className="py-3 px-3">Contactos Familiares</th>
                      <th className="py-3 px-3">Canvas LMS</th>
                      <th className="py-3 px-3 text-center">Sociograma</th>
                      <th className="py-3 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr 
                        key={student.id} 
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {student.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-900 group-hover:text-emerald-800 transition-colors text-xs sm:text-sm">
                            {student.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                            {student.email || 'Sin correo asignado'}
                            {student.siblings && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                Hermanos: {student.siblings}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                          {student.schoolId}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            student.condition === 'NUEVO'
                              ? 'bg-[#F8CB0A] text-slate-950 font-black'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {student.condition}
                          </span>
                        </td>
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-1">
                            {student.motherPhone && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-pink-700">M:</span>
                                <span className="font-mono text-slate-700 text-[11px]">{student.motherPhone}</span>
                                <a
                                  href={getWhatsAppLink(student.motherPhone, student.fullName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}
                            {student.fatherPhone && student.fatherPhone !== 'n/a' && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-blue-700">P:</span>
                                <span className="font-mono text-slate-700 text-[11px]">{student.fatherPhone}</span>
                                <a
                                  href={getWhatsAppLink(student.fatherPhone, student.fullName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:text-emerald-900 p-0.5 rounded"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${student.canvasAccepted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className={`text-[11px] font-bold ${student.canvasAccepted ? 'text-emerald-800' : 'text-amber-800'}`}>
                              {student.canvasAccepted ? 'Aceptado' : 'Pendiente'}
                            </span>
                          </div>
                          {student.canvasObservations && (
                            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[170px]" title={student.canvasObservations}>
                              {student.canvasObservations}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleSociogramGroup(student.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                              student.sociogramGroup === 'Grupo 1'
                                ? 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                                : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                            }`}
                            title="Haz clic para alternar grupo"
                          >
                            {student.sociogramGroup || 'Grupo 1'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver Ficha Completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 2: DIRECTORIO FAMILIAR & WHATSAPP */}
          {viewTab === 'family' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#5EA832]/40 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          N° {student.orderNumber}
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${
                          student.condition === 'NUEVO' ? 'bg-[#F8CB0A] text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {student.condition}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mt-1">
                        {student.fullName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {student.schoolId}
                    </span>
                  </div>

                  {/* Madre Box */}
                  <div className="p-2.5 rounded-xl bg-pink-50/70 border border-pink-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-pink-800 uppercase flex items-center gap-1">
                        Madre: {student.motherName || 'No registrada'}
                      </span>
                      {student.motherId && (
                        <span className="text-[10px] font-mono text-pink-700">CI: {student.motherId}</span>
                      )}
                    </div>
                    {student.motherPhone && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-mono font-bold text-slate-800">{student.motherPhone}</span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`tel:${student.motherPhone}`}
                            className="p-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md text-xs border border-pink-200"
                            title="Llamar"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <a
                            href={getWhatsAppLink(student.motherPhone, student.fullName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs"
                            title="WhatsApp institucional"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                    {student.motherEmail && (
                      <div className="text-[11px] text-slate-500 truncate">{student.motherEmail}</div>
                    )}
                  </div>

                  {/* Padre Box */}
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1">
                        Padre: {student.fatherName || 'No registrado'}
                      </span>
                      {student.fatherId && (
                        <span className="text-[10px] font-mono text-blue-700">CI: {student.fatherId}</span>
                      )}
                    </div>
                    {student.fatherPhone && student.fatherPhone !== 'n/a' ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-mono font-bold text-slate-800">{student.fatherPhone}</span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`tel:${student.fatherPhone}`}
                            className="p-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md text-xs border border-blue-200"
                            title="Llamar"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <a
                            href={getWhatsAppLink(student.fatherPhone, student.fullName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs"
                            title="WhatsApp institucional"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sin teléfono registrado</span>
                    )}
                    {student.fatherEmail && student.fatherEmail !== 'n/a' && (
                      <div className="text-[11px] text-slate-500 truncate">{student.fatherEmail}</div>
                    )}
                  </div>

                  {student.homeOfficePhone && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span>Habitación / Oficina:</span>
                      <strong className="font-mono text-slate-700">{student.homeOfficePhone}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* VISTA 3: CANVAS LMS TRACKER */}
          {viewTab === 'canvas' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#5EA832]" />
                  <span className="text-xs font-bold text-emerald-950">
                    Seguimiento de Invitaciones y Módulos de Canvas LMS
                  </span>
                </div>
                <div className="text-xs text-emerald-900">
                  Aceptadas: <strong>{canvasAcceptedCount}</strong> de <strong>{totalInGrade}</strong> ({totalInGrade > 0 ? Math.round((canvasAcceptedCount/totalInGrade)*100) : 0}%)
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <th className="py-3 px-3 text-center w-12">N°</th>
                      <th className="py-3 px-4">Alumno</th>
                      <th className="py-3 px-3">Correo Institucional / Usuario</th>
                      <th className="py-3 px-3">Contraseña</th>
                      <th className="py-3 px-3 text-center">Invitación Aceptada</th>
                      <th className="py-3 px-4">Estatus y Observaciones</th>
                      <th className="py-3 px-3 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr 
                        key={student.id} 
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {student.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{student.fullName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">C.E. {student.schoolId}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-mono text-xs ${student.email ? 'text-slate-800' : 'text-rose-500 font-semibold'}`}>
                            {student.email || 'NO TIENE CORREO'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {student.canvasPassword || '12345678'}
                        </td>
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => updateCanvasStatus(student.id, !student.canvasAccepted)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              student.canvasAccepted
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Alternar estado de aceptación"
                          >
                            {student.canvasAccepted ? '✓ Aceptado' : '⏳ Pendiente'}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            student.canvasObservations?.includes('TODOS SUS MÓDULOS')
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : student.canvasObservations?.includes('ENVIAR')
                              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                              : student.canvasObservations?.includes('NO TIENE CORREO')
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {student.canvasObservations || 'Sin observaciones'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 4: SOCIOGRAMA (GRUPOS DINÁMICOS) */}
          {viewTab === 'sociogram' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                    Balance de Grupos de Aula (Sociograma)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distribución de estudiantes para actividades grupales y dinámicas pedagógicas. Haz clic en la flecha para transferir alumnos entre grupos.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900">
                    Grupo 1: {group1Count}
                  </span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900">
                    Grupo 2: {group2Count}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna Grupo 1 */}
                <div className="bg-purple-50/40 rounded-2xl border-2 border-purple-200 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-600" />
                      <h4 className="text-sm font-black text-purple-950">Grupo 1 ({group1Count} alumnos)</h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredStudents
                      .filter((s) => s.sociogramGroup === 'Grupo 1')
                      .map((student) => (
                        <div
                          key={student.id}
                          className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                #{student.orderNumber}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{student.fullName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              {student.schoolId} · {student.condition}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleSociogramGroup(student.id)}
                            className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Mover a Grupo 2"
                          >
                            <span>Mover</span>
                            <ArrowRightLeft className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Columna Grupo 2 */}
                <div className="bg-blue-50/40 rounded-2xl border-2 border-blue-200 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600" />
                      <h4 className="text-sm font-black text-blue-950">Grupo 2 ({group2Count} alumnos)</h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredStudents
                      .filter((s) => s.sociogramGroup === 'Grupo 2')
                      .map((student) => (
                        <div
                          key={student.id}
                          className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs flex items-center justify-between hover:shadow-xs transition-shadow"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                #{student.orderNumber}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{student.fullName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              {student.schoolId} · {student.condition}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleSociogramGroup(student.id)}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Mover a Grupo 1"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Mover</span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISTA 5: FILIACIÓN & DATOS DE NACIMIENTO */}
          {viewTab === 'filiation' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <th className="py-3 px-3 text-center w-12">N°</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-3">Cédula Escolar</th>
                      <th className="py-3 px-3">Fecha de Nacimiento</th>
                      <th className="py-3 px-3">Lugar & Estado</th>
                      <th className="py-3 px-3">Hermanos en el Colegio</th>
                      <th className="py-3 px-3 text-center">Condición</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr 
                        key={student.id} 
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {student.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {student.fullName}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                          {student.schoolId}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {student.birthDate || 'No registrada'}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {student.birthPlace ? `${student.birthPlace}, ${student.birthState || ''}` : '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-xs ${student.siblings ? 'font-bold text-emerald-800' : 'text-slate-400'}`}>
                            {student.siblings || 'Hijo único en plantel'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            student.condition === 'NUEVO' ? 'bg-[#F8CB0A] text-slate-950 font-black' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {student.condition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {showAddModal && (
        <StudentFormModal
          defaultGrade={selectedRosterGrade}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showPrintModal && (
        <RosterPrintModal
          grade={selectedRosterGrade}
          students={filteredStudents}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
