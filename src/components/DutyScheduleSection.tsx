import React, { useState, useMemo } from 'react';
import { useEduPlan } from '../context/EduPlanContext';
import { DutyCategory, DutySlot } from '../types';
import { DUTY_DAYS, INITIAL_GRADE_TURNS, INITIAL_COURT_DISTRIBUTION, DUTY_PROTOCOL_CONTENT } from '../data/mockData';
import {
  ShieldAlert,
  Clock,
  MapPin,
  UserCheck,
  Search,
  Filter,
  Calendar,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Printer,
  ChevronDown,
  X,
  Megaphone,
  School,
  Users
} from 'lucide-react';
import { CompoundGradeBadges, GradeBadge } from '../utils/gradeColors';

export const DutyScheduleSection: React.FC = () => {
  const { currentUser, dutySlots, updateDutySlot, selectedDutyTeacher, setSelectedDutyTeacher, addToast, viewMode } = useEduPlan();
  // Coordinación assigns duty turns; teachers see theirs highlighted
  const canEditDuties = viewMode === 'coordinator';
  const openSlotEditor = (slot: DutySlot) => {
    if (!canEditDuties) return;
    setEditingSlot(slot);
    setEditPersonName(slot.assignedPerson);
  };

  // Active view tab
  const [activeTab, setActiveTab] = useState<'sabana' | 'grados_canchas' | 'mis_guardias'>('sabana');
  // Category subfilter in sábana view: 'all' | 'entrada_salida' | 'recesos_primaria' | 'bachillerato'
  const [categoryFilter, setCategoryFilter] = useState<'all' | DutyCategory>('all');
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  // Only show highlighted teacher's rows/cells
  const [onlyMyDuties, setOnlyMyDuties] = useState(false);
  // Show institutional protocol modal
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  // Slot editing modal
  const [editingSlot, setEditingSlot] = useState<DutySlot | null>(null);
  const [editPersonName, setEditPersonName] = useState('');

  // Extract all unique assigned people from duty slots for the quick filter dropdown
  const allTeachersList = useMemo(() => {
    const namesSet = new Set<string>();
    dutySlots.forEach((slot) => {
      const parts = slot.assignedPerson.split('/').map((p) => p.trim());
      parts.forEach((p) => {
        if (p && !p.toLowerCase().includes('vacante')) {
          namesSet.add(p);
        }
      });
    });
    return Array.from(namesSet).sort();
  }, [dutySlots]);

  // Normalize name check helper
  const isTeacherAssigned = (assignedText: string, teacherToMatch: string) => {
    if (!teacherToMatch) return false;
    const cleanAssigned = assignedText.toLowerCase().trim();
    const cleanTeacher = teacherToMatch.toLowerCase().trim();
    
    // Check direct substring
    if (cleanAssigned.includes(cleanTeacher)) return true;

    // Check partial words (e.g. "Carlos" in "Carlos F." or "Carlos / Gonzalo")
    const words = cleanTeacher.split(' ');
    for (const w of words) {
      if (w.length > 3 && cleanAssigned.includes(w)) return true;
    }
    return false;
  };

  // Determine current active highlighting name:
  // If user specifically picked one, use that; else derive from currentUser
  const currentHighlightName = useMemo(() => {
    if (selectedDutyTeacher) return selectedDutyTeacher;
    if (currentUser.fullName) {
      // If "Prof. Carlos Mendoza", return "Carlos"
      const parts = currentUser.fullName.replace(/^Prof\.\s*/i, '').split(' ');
      return parts[0] || 'Carlos';
    }
    return 'Carlos';
  }, [selectedDutyTeacher, currentUser]);

  // Filter slots for "Mis Guardias"
  const myAssignedDuties = useMemo(() => {
    return dutySlots.filter((slot) => isTeacherAssigned(slot.assignedPerson, currentHighlightName));
  }, [dutySlots, currentHighlightName]);

  // Grouped slots for the tables
  const entradaSalidaSlots = useMemo(() => {
    return dutySlots.filter((s) => s.category === 'entrada_salida');
  }, [dutySlots]);

  const recesosPrimariaSlots = useMemo(() => {
    return dutySlots.filter((s) => s.category === 'recesos_primaria');
  }, [dutySlots]);

  const bachilleratoSlots = useMemo(() => {
    return dutySlots.filter((s) => s.category === 'bachillerato');
  }, [dutySlots]);

  // Handle slot edit save
  const handleSaveSlotEdit = () => {
    if (!editingSlot) return;
    updateDutySlot(editingSlot.id, editPersonName.trim());
    setEditingSlot(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="duty-schedule-section" className="mt-12 space-y-6">
      {/* SIMPLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-raiz">
            Guardias escolares
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Turnos de entrada, salida y recesos.
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="duty-protocol-btn"
            onClick={() => setShowProtocolModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-success-700" />
            <span>Protocolo</span>
          </button>

          <button
            id="duty-print-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-success-700" />
            <span>Imprimir guardia general</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        {/* HIGHLIGHT CONTROL BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-warning-50/90 border border-warning-200 px-3.5 py-2 rounded-xl text-warning-900">
              <Sparkles className="w-4 h-4 text-warning-600 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-warning-950">Destacando guardias de: </span>
                <span className="font-bold underline ml-1 text-warning-900">{currentHighlightName}</span>
              </div>
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-warning-200/80 text-warning-950">
                {myAssignedDuties.length} {myAssignedDuties.length === 1 ? 'turno' : 'turnos'}
              </span>
            </div>

            {/* Teacher selector picker to inspect any staff member */}
            <div className="flex items-center gap-2">
              <label htmlFor="teacher-duty-selector" className="text-xs text-slate-500 font-medium">
                Cambiar docente:
              </label>
              <select
                id="teacher-duty-selector"
                value={selectedDutyTeacher}
                onChange={(e) => setSelectedDutyTeacher(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-success-500 focus:outline-none"
              >
                <option value="Carlos">Prof. Carlos mendoza (tú)</option>
                {allTeachersList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters & Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="filter-only-my-duties-btn"
              onClick={() => setOnlyMyDuties(!onlyMyDuties)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                onlyMyDuties
                  ? 'bg-warning-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {onlyMyDuties ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {onlyMyDuties ? 'Mostrando solo mis turnos' : 'Filtrar solo mis turnos'}
            </button>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="duty-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar espacio o docente..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-success-500 focus:outline-none w-44 md:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW TABS */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <button
            id="tab-sabana"
            onClick={() => setActiveTab('sabana')}
            className={`px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 inline-flex items-center gap-2 cursor-pointer ${
              activeTab === 'sabana'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25 font-bold ring-2 ring-primary-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <School className={`w-4 h-4 shrink-0 ${activeTab === 'sabana' ? 'text-white' : 'text-slate-500'}`} />
            <span>Guardia general</span>
          </button>

          <button
            id="tab-grados-canchas"
            onClick={() => setActiveTab('grados_canchas')}
            className={`px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 inline-flex items-center gap-2 cursor-pointer ${
              activeTab === 'grados_canchas'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25 font-bold ring-2 ring-primary-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Users className={`w-4 h-4 shrink-0 ${activeTab === 'grados_canchas' ? 'text-white' : 'text-slate-500'}`} />
            <span>Turnos de grados y canchas</span>
          </button>

          <button
            id="tab-mis-guardias"
            onClick={() => setActiveTab('mis_guardias')}
            className={`px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 inline-flex items-center gap-2 cursor-pointer ${
              activeTab === 'mis_guardias'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25 font-bold ring-2 ring-primary-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <UserCheck className={`w-4 h-4 shrink-0 ${activeTab === 'mis_guardias' ? 'text-white' : 'text-slate-500'}`} />
            <span>Mi agenda semanal de guardias</span>
            <span className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
              activeTab === 'mis_guardias'
                ? 'bg-attention-400 text-slate-950 font-black shadow-xs'
                : 'bg-warning-100 text-warning-900 font-bold border border-warning-200'
            }`}>
              {myAssignedDuties.length}
            </span>
          </button>
        </div>

        {/* Subfilter for Guardia General View */}
        {activeTab === 'sabana' && (
          <div className="flex items-center flex-wrap gap-1.5 px-1 py-0.5">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Filtrar:</span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                categoryFilter === 'all' 
                  ? 'bg-slate-800 text-white shadow-2xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setCategoryFilter('entrada_salida')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                categoryFilter === 'entrada_salida' 
                  ? 'bg-warning-600 text-white shadow-2xs' 
                  : 'bg-white text-warning-800 hover:bg-warning-50 border border-warning-200/60'
              }`}
            >
              Entrada y salida
            </button>
            <button
              onClick={() => setCategoryFilter('recesos_primaria')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                categoryFilter === 'recesos_primaria' 
                  ? 'bg-primary-600 text-white shadow-2xs' 
                  : 'bg-white text-primary-700 hover:bg-success-50 border border-success-200/60'
              }`}
            >
              Recesos primaria
            </button>
            <button
              onClick={() => setCategoryFilter('bachillerato')}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                categoryFilter === 'bachillerato' 
                  ? 'bg-info-700 text-white shadow-2xs' 
                  : 'bg-white text-info-800 hover:bg-info-50 border border-info-200/60'
              }`}
            >
              Bachillerato
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          TAB 1: SÁBANA GENERAL COMPLETA (MATCHES USER'S EXCEL/IMAGE SPREADSHEET)
          ========================================================================= */}
      {activeTab === 'sabana' && (
        <div className="space-y-8">
          {/* Quick Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-3.5 rounded-sm bg-warning-200 border-2 border-warning-500 inline-block" />
              <span>Tu guardia asignada ({currentHighlightName})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-3.5 rounded-sm bg-slate-100 border border-slate-300 inline-block" />
              <span>Guardia de otro compañero</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-500">
              <Edit3 className="w-3 h-3 text-slate-500" />
              <span>Haz clic sobre cualquier celda para reasignar el docente</span>
            </div>
          </div>

          {/* 1. GUARDIAS DE ENTRADA Y SALIDA */}
          {(categoryFilter === 'all' || categoryFilter === 'entrada_salida') && (
            <DutyTableSection
              title="GUARDIAS DE ENTRADA Y SALIDA"
              subtitle="Supervisión en portones, cancha, patio y control vehicular de salida (3:30 pm)"
              headerTheme="amber"
              slots={entradaSalidaSlots}
              currentHighlightName={currentHighlightName}
              onlyMyDuties={onlyMyDuties}
              searchQuery={searchQuery}
              onEditSlot={canEditDuties ? openSlotEditor : undefined}
              isTeacherAssigned={isTeacherAssigned}
            />
          )}

          {/* 2. GUARDIA RECESOS PRIMARIA */}
          {(categoryFilter === 'all' || categoryFilter === 'recesos_primaria') && (
            <DutyTableSection
              title="GUARDIA RECESOS PRIMARIA"
              subtitle="Receso matutino (9:30 - 10:00 am), almuerzo (12:15 - 12:45 pm) y patio/canchas (12:45 - 1:15 pm)"
              headerTheme="emerald"
              slots={recesosPrimariaSlots}
              currentHighlightName={currentHighlightName}
              onlyMyDuties={onlyMyDuties}
              searchQuery={searchQuery}
              onEditSlot={canEditDuties ? openSlotEditor : undefined}
              isTeacherAssigned={isTeacherAssigned}
            />
          )}

          {/* 3. GUARDIAS BACHILLERATO 26-27 */}
          {(categoryFilter === 'all' || categoryFilter === 'bachillerato') && (
            <DutyTableSection
              title="GUARDIAS BACHILLERATO 26-27"
              subtitle="Salón de Reflexión (7:30 - 8:15 am), receso (10:00 - 10:30 am) y receso tarde (1:00 - 1:30 pm)"
              headerTheme="teal"
              slots={bachilleratoSlots}
              currentHighlightName={currentHighlightName}
              onlyMyDuties={onlyMyDuties}
              searchQuery={searchQuery}
              onEditSlot={canEditDuties ? openSlotEditor : undefined}
              isTeacherAssigned={isTeacherAssigned}
            />
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: TURNOS DE GRADOS Y CANCHAS
          ========================================================================= */}
      {activeTab === 'grados_canchas' && (
        <div className="space-y-8">
          {/* TURNOS DE GRADOS EN RECESOS */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-primary-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-200" />
                  TURNOS RECESOS DE PRIMARIA (DISTRIBUCIÓN POR GRADOS)
                </h3>
                <p className="text-xs text-primary-100 mt-0.5">
                  Organización rotativa de los grados en integralidad, pasillos y patio techado
                </p>
              </div>
              <span className="text-xs bg-primary-800/80 px-3 py-1 rounded-full text-primary-100 font-medium">
                Primaria rotativa
              </span>
            </div>

            <div className="p-4 overflow-x-auto">
              {/* Receso 9:30 am a 10:00 am */}
              <div className="mb-6">
                <div className="bg-primary-50 text-primary-900 font-bold text-xs px-3 py-2 rounded-lg mb-2 flex items-center gap-2 border border-primary-100">
                  <Clock className="w-3.5 h-3.5 text-primary-600" />
                  Receso 9:30 am a 10:00 am (distribución de grados)
                </div>
                <GradeTurnsTable
                  slots={INITIAL_GRADE_TURNS.filter((t) => t.timeSlot.includes('9:30'))}
                  searchQuery={searchQuery}
                />
              </div>

              {/* Almuerzo 12:15 pm a 12:45 pm */}
              <div>
                <div className="bg-primary-50 text-primary-900 font-bold text-xs px-3 py-2 rounded-lg mb-2 flex items-center gap-2 border border-primary-100">
                  <Clock className="w-3.5 h-3.5 text-primary-600" />
                  Almuerzo 12:15 pm a 12:45 pm (distribución de grados)
                </div>
                <GradeTurnsTable
                  slots={INITIAL_GRADE_TURNS.filter((t) => t.timeSlot.includes('12:15'))}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </div>

          {/* DISTRIBUCIÓN DE USO DE CANCHAS (12:45 PM A 1:15 PM) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-success-800 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
                  <School className="w-5 h-5 text-success-200" />
                  DISTRIBUCIÓN DE USO DE CANCHAS (12:45 PM A 1:15 PM)
                </h3>
                <p className="text-xs text-success-100 mt-0.5">
                  Asignación equitativa de fútbol y básquetbol para los grados de primaria
                </p>
              </div>
              <span className="text-xs bg-success-900/80 px-3 py-1 rounded-full text-success-100 font-medium">
                Deportes & recreación
              </span>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold text-xs w-36">Cancha</th>
                    {DUTY_DAYS.map((day) => (
                      <th key={day} className="py-2.5 px-3 font-bold text-xs">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {INITIAL_COURT_DISTRIBUTION.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-3 px-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-success-600" />
                        {row.court}
                      </td>
                      <td className="py-3 px-3 font-semibold text-success-900 bg-success-50/30">
                        <CompoundGradeBadges text={row.Lunes} size="xs" />
                      </td>
                      <td className="py-3 px-3 font-semibold text-success-900 bg-success-50/30">
                        <CompoundGradeBadges text={row.Martes} size="xs" />
                      </td>
                      <td className="py-3 px-3 font-semibold text-success-900 bg-success-50/30">
                        <CompoundGradeBadges text={row.Miércoles} size="xs" />
                      </td>
                      <td className="py-3 px-3 font-semibold text-success-900 bg-success-50/30">
                        <CompoundGradeBadges text={row.Jueves} size="xs" />
                      </td>
                      <td className="py-3 px-3 font-semibold text-success-900 bg-success-50/30">
                        <CompoundGradeBadges text={row.Viernes} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MIS GUARDIAS ASIGNADAS (AGENDA PERSONAL DEL DOCENTE)
          ========================================================================= */}
      {activeTab === 'mis_guardias' && (
        <div className="space-y-6">
          <div className="bg-raiz rounded-2xl p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-warning-400/40 text-warning-50 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Agenda personal del docente
                </span>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Guardias de {currentHighlightName}
                </h3>
                <p className="text-warning-100 text-sm mt-1 max-w-xl">
                  Tienes un total de <span className="font-bold underline">{myAssignedDuties.length} turnos</span> asignados a lo largo de la semana escolar.
                </p>
              </div>

              <div className="text-right bg-white/10 p-4 rounded-xl border border-white/20">
                <div className="text-3xl font-extrabold">{myAssignedDuties.length}</div>
                <div className="text-xs text-warning-100 font-medium">Turnos semanales</div>
              </div>
            </div>
          </div>

          {myAssignedDuties.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">
                No se encontraron turnos asignados para "{currentHighlightName}"
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Puedes cambiar el docente seleccionado en el selector superior para revisar los turnos de otros compañeros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myAssignedDuties.map((slot) => {
                const getCategoryBadge = (cat: DutyCategory) => {
                  switch (cat) {
                    case 'entrada_salida':
                      return { label: 'Entrada y Salida', color: 'bg-warning-100 text-warning-800 border-warning-200' };
                    case 'recesos_primaria':
                      return { label: 'Recesos Primaria', color: 'bg-success-100 text-success-800 border-success-200' };
                    case 'bachillerato':
                      return { label: 'Bachillerato', color: 'bg-info-100 text-info-800 border-info-200' };
                  }
                };
                const catBadge = getCategoryBadge(slot.category);

                return (
                  <div
                    key={slot.id}
                    className="bg-white rounded-2xl p-5 border-2 border-warning-400/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group"
                  >

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
                          <Calendar className="w-3.5 h-3.5" />
                          {slot.day}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catBadge.color}`}>
                          {catBadge.label}
                        </span>
                      </div>

                      <div className="space-y-2 mt-2">
                        <div className="flex items-start gap-2 text-slate-700">
                          <Clock className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs text-slate-500 font-bold">Horario</div>
                            <div className="text-sm font-bold text-slate-900">{slot.timeSlot}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-700">
                          <MapPin className="w-4 h-4 text-success-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs text-slate-500 font-bold">Ubicación / puesto</div>
                            <div className="text-sm font-semibold text-slate-800">{slot.location}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-slate-700">
                          <UserCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs text-slate-500 font-bold">Asignación en guardia general</div>
                            <div className="text-xs font-semibold text-primary-900 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                              {slot.assignedPerson}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 text-success-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Turno vigente
                      </span>
                      {canEditDuties && <button
                        onClick={() => openSlotEditor(slot)}
                        className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Editar
                      </button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: EDITAR ASIGNACIÓN DE GUARDIA
          ========================================================================= */}
      {editingSlot && (
        <div className="fixed inset-0 bg-raiz/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-warning-600" />
                Reasignar docente de guardia
              </h3>
              <button
                onClick={() => setEditingSlot(null)}
                className="text-slate-500 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Día:</span>
                <span className="font-bold text-slate-900">{editingSlot.day}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Horario:</span>
                <span className="font-bold text-slate-900">{editingSlot.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Ubicación / puesto:</span>
                <span className="font-bold text-slate-900">{editingSlot.location}</span>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="assigned-person-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nombre del docente responsable
              </label>
              <input
                id="assigned-person-input"
                type="text"
                value={editPersonName}
                onChange={(e) => setEditPersonName(e.target.value)}
                placeholder="Ej: Prof. Carlos Mendoza / Irene"
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-warning-500 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-slate-500 w-full mb-0.5">Sugerencias rápidas:</span>
                {allTeachersList.slice(0, 8).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditPersonName(t)}
                    className="text-xs px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSlotEdit}
                className="px-5 py-2 text-xs font-semibold text-white bg-warning-600 hover:bg-warning-700 rounded-xl transition-colors shadow-xs"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PROTOCOLO INSTITUCIONAL DE GUARDIAS ESCOLARES
          ========================================================================= */}
      {showProtocolModal && (
        <div className="fixed inset-0 bg-raiz/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-success-100 text-success-800 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5 text-success-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {DUTY_PROTOCOL_CONTENT.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Normativa de seguridad y convivencia institucional
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProtocolModal(false)}
                className="text-slate-500 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="bg-success-50/80 border border-success-200 rounded-xl p-4 text-xs text-success-950">
                <span className="font-bold block mb-1">Propósito institucional:</span>
                {DUTY_PROTOCOL_CONTENT.objective}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-600 mb-3">
                  Obligaciones y puntos clave del docente en guardia:
                </h4>
                <div className="space-y-2.5">
                  {DUTY_PROTOCOL_CONTENT.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowProtocolModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors"
              >
                Entendido y cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// =========================================================================
// SUB-COMPONENT: DUTY TABLE SECTION (GRID FORMAT SIMILAR TO USER'S SPREADSHEET)
// =========================================================================
interface DutyTableSectionProps {
  title: string;
  subtitle: string;
  headerTheme: 'amber' | 'emerald' | 'teal';
  slots: DutySlot[];
  currentHighlightName: string;
  onlyMyDuties: boolean;
  searchQuery: string;
  /** Absent for teachers: cells are read-only. */
  onEditSlot?: (slot: DutySlot) => void;
  isTeacherAssigned: (assignedText: string, teacherToMatch: string) => boolean;
}

const DutyTableSection: React.FC<DutyTableSectionProps> = ({
  title,
  subtitle,
  headerTheme,
  slots,
  currentHighlightName,
  onlyMyDuties,
  searchQuery,
  onEditSlot,
  isTeacherAssigned
}) => {
  // Theme color styles
  const themeStyles = {
    amber: {
      headerBg: 'bg-warning-500 text-warning-950',
      headerSub: 'text-warning-900',
      tag: 'bg-warning-600 text-white',
      border: 'border-warning-300'
    },
    emerald: {
      headerBg: 'bg-success-700 text-white',
      headerSub: 'text-success-100',
      tag: 'bg-success-800 text-success-100',
      border: 'border-success-300'
    },
    teal: {
      headerBg: 'bg-info-800 text-white',
      headerSub: 'text-info-100',
      tag: 'bg-info-900 text-info-100',
      border: 'border-info-300'
    }
  }[headerTheme];

  // Group slots by timeSlot, then by location
  // Collect distinct timeSlots
  const distinctTimeSlots = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((s) => set.add(s.timeSlot));
    return Array.from(set);
  }, [slots]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Header */}
      <div className={`${themeStyles.headerBg} px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
        <div>
          <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0 opacity-90" />
            {title}
          </h3>
          <p className={`text-xs ${themeStyles.headerSub} mt-0.5`}>{subtitle}</p>
        </div>
        <span className={`text-xs ${themeStyles.tag} px-3 py-1 rounded-full font-medium self-start sm:self-auto`}>
          {slots.length} Asignaciones
        </span>
      </div>

      {/* Grouped by Time Slots */}
      <div className="p-4 space-y-6 overflow-x-auto">
        {distinctTimeSlots.map((timeSlot) => {
          const slotsForTime = slots.filter((s) => s.timeSlot === timeSlot);

          // Get unique locations in order of appearance
          const locationsInTime: string[] = [];
          slotsForTime.forEach((s) => {
            if (!locationsInTime.includes(s.location)) {
              locationsInTime.push(s.location);
            }
          });

          // Check if this time block matches search or my duties filter
          const hasMatches = locationsInTime.some((loc) => {
            const rowSlots = slotsForTime.filter((s) => s.location === loc);
            if (onlyMyDuties) {
              return rowSlots.some((s) => isTeacherAssigned(s.assignedPerson, currentHighlightName));
            }
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              if (loc.toLowerCase().includes(query)) return true;
              return rowSlots.some(
                (s) => s.assignedPerson.toLowerCase().includes(query)
              );
            }
            return true;
          });

          if (!hasMatches) return null;

          return (
            <div key={timeSlot} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Subheader for time block */}
              <div className="bg-slate-100 text-slate-800 px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {timeSlot}
                </span>
                <span className="text-xs text-slate-500 font-medium lowercase">
                  supervisión de pasillos y espacios comunes
                </span>
              </div>

              {/* Table of locations x Days */}
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold text-xs w-48 border-r border-slate-200">
                      Ubicación / puesto
                    </th>
                    {DUTY_DAYS.map((day) => (
                      <th
                        key={day}
                        className="py-2.5 px-3 font-bold text-xs border-r border-slate-200 last:border-r-0"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {locationsInTime.map((location) => {
                    const slotsForLoc = slotsForTime.filter((s) => s.location === location);

                    // If filter onlyMyDuties is on, check if at least one slot has teacher
                    const hasMyDutyInRow = slotsForLoc.some((s) =>
                      isTeacherAssigned(s.assignedPerson, currentHighlightName)
                    );
                    if (onlyMyDuties && !hasMyDutyInRow) return null;

                    // If searchQuery is on, check match
                    if (searchQuery) {
                      const query = searchQuery.toLowerCase();
                      const matchLoc = location.toLowerCase().includes(query);
                      const matchPerson = slotsForLoc.some((s) =>
                        s.assignedPerson.toLowerCase().includes(query)
                      );
                      if (!matchLoc && !matchPerson) return null;
                    }

                    // Count max slots on any day for this location (for multiple teachers in same spot, like pasillos)
                    const maxRowsForLoc = Math.max(
                      1,
                      ...DUTY_DAYS.map(
                        (d) => slotsForLoc.filter((s) => s.day === d).length
                      )
                    );

                    // Render rows for this location
                    return Array.from({ length: maxRowsForLoc }).map((_, rowIndex) => (
                      <tr key={`${location}-${rowIndex}`} className="hover:bg-slate-50/70 transition-colors">
                        {rowIndex === 0 ? (
                          <td
                            rowSpan={maxRowsForLoc}
                            className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50/60 border-r border-slate-200 align-top"
                          >
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{location}</span>
                            </div>
                          </td>
                        ) : null}

                        {DUTY_DAYS.map((day) => {
                          const daySlots = slotsForLoc.filter((s) => s.day === day);
                          const slot = daySlots[rowIndex];

                          if (!slot) {
                            return (
                              <td
                                key={day}
                                className="py-2.5 px-3 text-slate-300 border-r border-slate-200 last:border-r-0 text-center"
                              >
                                —
                              </td>
                            );
                          }

                          const isMine = isTeacherAssigned(slot.assignedPerson, currentHighlightName);
                          const isVacante = slot.assignedPerson.toLowerCase().includes('vacante');

                          return (
                            <td
                              key={day}
                              onClick={onEditSlot ? () => onEditSlot(slot) : undefined}
                              className={`py-2 px-2.5 border-r border-slate-200 last:border-r-0 ${onEditSlot ? 'cursor-pointer' : ''} transition-all group/cell relative ${
                                isMine
                                  ? 'bg-warning-100/90 text-warning-950 font-bold border-warning-300'
                                  : isVacante
                                  ? 'bg-danger-50/60 text-danger-700 italic'
                                  : 'text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate">
                                  {slot.assignedPerson || '—'}
                                </span>

                                {isMine && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-extrabold bg-warning-300/90 text-warning-950 shrink-0 border border-warning-400">
                                    ¡Tuya!
                                  </span>
                                )}

                                {onEditSlot && <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 ml-1" />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: GRADE TURNS TABLE (RECESOS DE PRIMARIA)
// =========================================================================
interface GradeTurnsTableProps {
  slots: { day: string; timeSlot: string; location: string; assignedGrade: string }[];
  searchQuery: string;
}

const GradeTurnsTable: React.FC<GradeTurnsTableProps> = ({ slots, searchQuery }) => {
  const distinctLocations = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((s) => set.add(s.location));
    return Array.from(set);
  }, [slots]);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-left text-xs border-collapse min-w-[650px]">
        <thead>
          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <th className="py-2.5 px-3 font-bold text-xs w-48 border-r border-slate-200">
              Espacio / zona
            </th>
            {DUTY_DAYS.map((day) => (
              <th
                key={day}
                className="py-2.5 px-3 font-bold text-xs border-r border-slate-200 last:border-r-0"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {distinctLocations.map((loc) => {
            const locSlots = slots.filter((s) => s.location === loc);
            if (searchQuery) {
              const q = searchQuery.toLowerCase();
              const matchLoc = loc.toLowerCase().includes(q);
              const matchGrade = locSlots.some((s) => s.assignedGrade.toLowerCase().includes(q));
              if (!matchLoc && !matchGrade) return null;
            }

            return (
              <tr key={loc} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-600" />
                  {loc}
                </td>
                {DUTY_DAYS.map((day) => {
                  const slot = locSlots.find((s) => s.day === day);
                  return (
                    <td
                      key={day}
                      className="py-2.5 px-3 text-slate-800 border-r border-slate-200 last:border-r-0 font-medium"
                    >
                      {slot ? (
                        <CompoundGradeBadges text={slot.assignedGrade} size="xs" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
