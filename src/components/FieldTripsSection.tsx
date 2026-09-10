import React, { useState, useMemo } from 'react';
import { 
  Bus, Sparkles, Plus, Search, Filter, Calendar, MapPin, 
  Users, CheckCircle2, Clock, Printer, Eye, Edit3, Trash2, 
  FileSpreadsheet, LayoutGrid, Phone, MessageCircle, ArrowUpDown,
  BookOpen, ChevronRight, CheckSquare, Square, Download, Check, Building2
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { FieldTrip, FieldTripType, FieldTripStatus } from '../types';
import { AVAILABLE_GRADES } from '../data/mockData';
import { FieldTripFormModal } from './FieldTripFormModal';
import { FieldTripDetailModal } from './FieldTripDetailModal';
import { FieldTripPrintViewModal } from './FieldTripPrintViewModal';

export const FieldTripsSection: React.FC = () => {
  const { 
    fieldTrips, 
    viewMode, 
    currentUser, 
    updateFieldTripStatus, 
    deleteFieldTrip, 
    addToast,
    availableGradeNames
  } = useEduPlan();

  const isCoordinator = viewMode === 'coordinator';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<FieldTripType | 'ALL'>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedLapso, setSelectedLapso] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<FieldTripStatus | 'ALL'>('ALL');
  const [viewStyle, setViewStyle] = useState<'matrix' | 'cards'>('matrix');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<FieldTrip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<FieldTrip | null>(null);
  const [printingTrip, setPrintingTrip] = useState<FieldTrip | null>(null);

  // Filtered List
  const filteredTrips = useMemo(() => {
    return fieldTrips.filter((trip) => {
      // Type
      if (selectedType !== 'ALL' && trip.type !== selectedType) return false;
      // Grade
      if (selectedGrade !== 'ALL' && trip.grade !== selectedGrade) return false;
      // Lapso
      if (selectedLapso !== 'ALL' && trip.lapso !== selectedLapso) return false;
      // Status
      if (selectedStatus !== 'ALL' && trip.status !== selectedStatus) return false;
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesDestination = trip.destinationOrGuest?.toLowerCase().includes(term);
        const matchesContact = trip.alliancesOrContacts?.toLowerCase().includes(term);
        const matchesTeacher = trip.responsibleTeacher?.toLowerCase().includes(term) || trip.chaperoneTeachers?.toLowerCase().includes(term);
        const matchesSubject = trip.subjectOrContext?.toLowerCase().includes(term);
        const matchesPurpose = trip.purpose?.toLowerCase().includes(term);
        const matchesMethodology = trip.methodology?.toLowerCase().includes(term);
        const matchesGrade = trip.grade?.toLowerCase().includes(term);
        if (!matchesDestination && !matchesContact && !matchesTeacher && !matchesSubject && !matchesPurpose && !matchesMethodology && !matchesGrade) {
          return false;
        }
      }
      return true;
    });
  }, [fieldTrips, selectedType, selectedGrade, selectedLapso, selectedStatus, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = fieldTrips.length;
    const salidas = fieldTrips.filter((t) => t.type === 'salida_campo').length;
    const invitados = fieldTrips.filter((t) => t.type === 'invitado_especial').length;
    const transporte = fieldTrips.filter((t) => t.transportRequired).length;
    const pendientes = fieldTrips.filter((t) => t.status === 'submitted').length;
    const aprobadas = fieldTrips.filter((t) => t.status === 'approved').length;
    const realizadas = fieldTrips.filter((t) => t.status === 'completed').length;

    // Pilares
    const social = fieldTrips.filter((t) => t.focus.socialResponsibility).length;
    const ciudadana = fieldTrips.filter((t) => t.focus.citizenParticipation).length;
    const nacional = fieldTrips.filter((t) => t.focus.nationalIdentity).length;
    const introspeccion = fieldTrips.filter((t) => t.focus.introspection).length;

    return { total, salidas, invitados, transporte, pendientes, aprobadas, realizadas, social, ciudadana, nacional, introspeccion };
  }, [fieldTrips]);

  // Unique grades present in the data for easy filtering
  const allGrades = useMemo(() => {
    const set = new Set<string>();
    const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : AVAILABLE_GRADES;
    displayGrades.forEach((g) => set.add(g));
    fieldTrips.forEach((t) => set.add(t.grade));
    return Array.from(set).sort();
  }, [fieldTrips, availableGradeNames]);

  const handleOpenNew = () => {
    setEditingTrip(null);
    setIsFormOpen(true);
  };

  const handleEdit = (trip: FieldTrip) => {
    setViewingTrip(null);
    setEditingTrip(trip);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro "${name}"?`)) {
      deleteFieldTrip(id);
    }
  };

  return (
    <section id="seccion-salidas-campo" className="space-y-6">
      
      {/* 1. SIMPLE HEADER WITH ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Salidas de Campo e Invitados Especiales
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Colegio Integral El Manglar · Experiencias vivenciales y alianzas institucionales
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="px-4 py-2 text-xs font-bold text-white bg-[#285A14] hover:bg-[#1f4710] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Experiencia</span>
          </button>
        </div>
      </div>

      {/* 2. STATS & INSTITUTIONAL FOCUS PILLARS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Registros
            </span>
            <span className="text-lg font-black text-slate-900">{stats.total}</span>
            <span className="text-[10px] text-slate-500 block">planificadas</span>
          </div>

          <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[10px] font-bold text-[#3A6B1F] uppercase tracking-wider flex items-center gap-1">
              <Bus className="w-3 h-3" />
              Salidas de Campo
            </span>
            <span className="text-lg font-black text-[#285A14]">{stats.salidas}</span>
            <span className="text-[10px] text-[#3A6B1F]">
              {stats.transporte} con transporte
            </span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Invitados Aula
            </span>
            <span className="text-lg font-black text-amber-950">{stats.invitados}</span>
            <span className="text-[10px] text-amber-700">talleres y ponentes</span>
          </div>

          <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
              Visto Bueno
            </span>
            <span className="text-lg font-black text-blue-950">{stats.aprobadas}</span>
            <span className="text-[10px] text-blue-700">{stats.pendientes} en revisión</span>
          </div>

          {/* PILARES DEL MANGLAR BADGES */}
          <div className="col-span-2 bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/50 p-3 rounded-2xl border border-amber-200/60 flex flex-col justify-between">
            <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider block mb-1">
              Pilares Institucionales Impactados
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span className="truncate">Resp. Social:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">{stats.social}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate">Part. Ciudadana:</span>
                <span className="font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded">{stats.ciudadana}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate">Ident. Nacional:</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">{stats.nacional}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="truncate">Introspección:</span>
                <span className="font-bold text-purple-800 bg-purple-100 px-1.5 py-0.2 rounded">{stats.introspeccion}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por destino, invitado, docente, contacto, materia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              x
            </button>
          )}
        </div>

        {/* Right: Selectors & View switcher */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Filter Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as FieldTripType | 'ALL')}
            className="px-2.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Todos los Tipos</option>
            <option value="salida_campo">🚌 Solo Salidas de Campo</option>
            <option value="invitado_especial">🌟 Solo Invitados Especiales</option>
          </select>

          {/* Filter Grade */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-2.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Todos los Grados</option>
            {allGrades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Filter Lapso */}
          <select
            value={selectedLapso}
            onChange={(e) => setSelectedLapso(e.target.value)}
            className="px-2.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Todos los Lapsos</option>
            <option value="1er Lapso">1er Lapso</option>
            <option value="2do Lapso">2do Lapso</option>
            <option value="3er Lapso">3er Lapso</option>
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FieldTripStatus | 'ALL')}
            className="px-2.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="approved">Aprobadas</option>
            <option value="submitted">En Revisión</option>
            <option value="completed">Realizadas</option>
            <option value="draft">Borrador</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewStyle('matrix')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                viewStyle === 'matrix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista Matriz Oficial (Tabla estructurada El Manglar)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#5EA832]" />
              <span className="hidden sm:inline">Matriz Oficial</span>
            </button>
            <button
              onClick={() => setViewStyle('cards')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                viewStyle === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista Fichas Didácticas"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Fichas</span>
            </button>
          </div>

        </div>

      </div>

      {/* 4. CONTENT DISPLAY */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Bus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No se encontraron registros</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No hay experiencias registradas con los filtros actuales. Puedes ajustar la búsqueda o registrar una nueva salida o invitado especial.
          </p>
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#5EA832] hover:bg-[#498925] rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Experiencia</span>
          </button>
        </div>
      ) : viewStyle === 'matrix' ? (
        
        /* -------------------------------------------------------------
           VISTA MATRIZ OFICIAL (RECREACIÓN FIEL DE LA HOJA DE CÁLCULO)
           ------------------------------------------------------------- */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              {/* TWO-LEVEL TABLE HEADER */}
              <thead>
                {/* Level 1: Category Groups */}
                <tr className="border-b border-slate-200 text-center font-black uppercase text-[10px] tracking-wider">
                  <th colSpan={4} className="bg-slate-100/90 py-2.5 px-3 border-r border-slate-200 text-slate-700">
                    Datos Generales
                  </th>
                  <th colSpan={5} className="bg-[#285A14]/10 py-2.5 px-3 border-r border-slate-200 text-[#285A14]">
                    Antes del Paseo o Invitado
                  </th>
                  <th colSpan={4} className="bg-amber-100/70 py-2.5 px-3 border-r border-slate-200 text-amber-950">
                    Enfoques Relacionados (El Manglar)
                  </th>
                  <th colSpan={2} className="bg-slate-100/90 py-2.5 px-3 border-r border-slate-200 text-slate-700">
                    Metodología y Aprendizajes
                  </th>
                  <th className="bg-slate-100/90 py-2.5 px-3 text-slate-700">
                    Acciones
                  </th>
                </tr>

                {/* Level 2: Column Titles */}
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-[11px] text-slate-700">
                  <th className="py-2.5 px-3 whitespace-nowrap">Tipo / Estado</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Grado</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">Lapso/Sem</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Fecha</th>
                  
                  {/* Antes del paseo o invitado */}
                  <th className="py-2.5 px-3 min-w-[180px] text-[#285A14] bg-emerald-50/30">Destino / Invitado</th>
                  <th className="py-2.5 px-3 min-w-[150px] text-[#285A14] bg-emerald-50/30">Alianza y Contacto</th>
                  <th className="py-2.5 px-3 min-w-[200px] text-[#285A14] bg-emerald-50/30">Tema / Propósito</th>
                  <th className="py-2.5 px-3 min-w-[140px] text-[#285A14] bg-emerald-50/30">Contexto del proyecto</th>
                  <th className="py-2.5 px-3 min-w-[140px] text-[#285A14] bg-emerald-50/30 border-r border-slate-200">Docente Resp.</th>
                  
                  {/* Enfoques Relacionados */}
                  <th className="py-2.5 px-2 text-center text-[10px] text-amber-950 bg-amber-50/50" title="Responsabilidad Social">
                    Resp. Social
                  </th>
                  <th className="py-2.5 px-2 text-center text-[10px] text-amber-950 bg-amber-50/50" title="Participación Ciudadana">
                    Part. Ciudadana
                  </th>
                  <th className="py-2.5 px-2 text-center text-[10px] text-amber-950 bg-amber-50/50" title="Identidad Nacional">
                    Ident. Nacional
                  </th>
                  <th className="py-2.5 px-2 text-center text-[10px] text-amber-950 bg-amber-50/50 border-r border-slate-200" title="Introspección">
                    Introspección
                  </th>

                  {/* Metodología */}
                  <th className="py-2.5 px-3 min-w-[220px]">¿CÓMO? (Metodología)</th>
                  <th className="py-2.5 px-3 min-w-[160px] border-r border-slate-200">Aprendizajes Claves</th>

                  {/* Acciones */}
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Gestión</th>
                </tr>
              </thead>

              {/* TABLE BODY ROWS */}
              <tbody className="divide-y divide-slate-200">
                {filteredTrips.map((trip) => {
                  const isSalida = trip.type === 'salida_campo';

                  return (
                    <tr 
                      key={trip.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Tipo / Estado */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        <div className="space-y-1">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isSalida
                              ? 'bg-emerald-100 text-[#285A14]'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isSalida ? <Bus className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                            <span>{isSalida ? 'Salida' : 'Invitado'}</span>
                          </div>

                          <div>
                            <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              trip.status === 'approved'
                                ? 'text-[#3A6B1F] bg-emerald-50'
                                : trip.status === 'completed'
                                ? 'text-blue-700 bg-blue-50'
                                : trip.status === 'submitted'
                                ? 'text-amber-700 bg-amber-50'
                                : 'text-slate-500 bg-slate-100'
                            }`}>
                              {trip.status === 'approved' ? 'Aprobada' :
                               trip.status === 'submitted' ? 'Revisión' :
                               trip.status === 'completed' ? 'Realizada' : 'Borrador'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Grado */}
                      <td className="py-3 px-3 align-top font-bold text-slate-900 whitespace-nowrap">
                        {trip.grade}
                      </td>

                      {/* Lapso/Semana (ej. 1/8) */}
                      <td className="py-3 px-3 align-top text-center font-black text-slate-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md font-mono text-[11px]">
                          {trip.lapsoSemanaLabel || `${trip.lapso.slice(0, 1)}/${trip.weekNumber}`}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="py-3 px-3 align-top font-medium text-slate-600 whitespace-nowrap text-[11px]">
                        {trip.date}
                      </td>

                      {/* Destino / Invitado */}
                      <td className="py-3 px-3 align-top bg-emerald-50/10">
                        <div className="font-bold text-slate-900 leading-snug">
                          {trip.destinationOrGuest}
                        </div>
                        {trip.transportRequired && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-700 font-semibold mt-1">
                            <Bus className="w-3 h-3" /> Transporte requerido
                          </span>
                        )}
                      </td>

                      {/* Alianza y Contacto */}
                      <td className="py-3 px-3 align-top text-slate-700 text-[11px] bg-emerald-50/10">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {trip.allianceName || trip.alliancesOrContacts || '-'}
                        </div>
                        {trip.contactPhone && (
                          <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1 mt-0.5 font-medium">
                            <Phone className="w-2.5 h-2.5 text-[#5EA832] shrink-0" />
                            <span>{trip.contactPhone}</span>
                          </div>
                        )}
                      </td>

                      {/* Tema / Propósito */}
                      <td className="py-3 px-3 align-top text-slate-700 text-[11px] leading-relaxed bg-emerald-50/10">
                        <p className="line-clamp-3" title={trip.purpose}>{trip.purpose || '-'}</p>
                      </td>

                      {/* Contexto del proyecto */}
                      <td className="py-3 px-3 align-top text-slate-700 text-[11px] bg-emerald-50/10">
                        <div className="font-semibold text-slate-800">{trip.subjectOrContext || '-'}</div>
                      </td>

                      {/* Docente Responsable */}
                      <td className="py-3 px-3 align-top text-slate-800 text-[11px] border-r border-slate-200 bg-emerald-50/10">
                        <div className="font-semibold">{trip.responsibleTeacher}</div>
                        {trip.chaperoneTeachers && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Acomp: {trip.chaperoneTeachers}
                          </div>
                        )}
                      </td>

                      {/* Enfoque 1: Responsabilidad Social */}
                      <td className="py-3 px-2 align-top text-center bg-amber-50/20">
                        {trip.focus.socialResponsibility ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[#285A14] font-black text-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Enfoque 2: Participación Ciudadana */}
                      <td className="py-3 px-2 align-top text-center bg-amber-50/20">
                        {trip.focus.citizenParticipation ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-black text-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Enfoque 3: Identidad Nacional */}
                      <td className="py-3 px-2 align-top text-center bg-amber-50/20">
                        {trip.focus.nationalIdentity ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-black text-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Enfoque 4: Introspección */}
                      <td className="py-3 px-2 align-top text-center border-r border-slate-200 bg-amber-50/20">
                        {trip.focus.introspection ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-900 font-black text-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* ¿CÓMO? Metodología */}
                      <td className="py-3 px-3 align-top text-slate-700 text-[11px] leading-relaxed">
                        <p className="line-clamp-3" title={trip.methodology}>
                          {trip.methodology || '-'}
                        </p>
                      </td>

                      {/* Aprendizajes Claves */}
                      <td className="py-3 px-3 align-top text-slate-700 text-[11px] leading-relaxed border-r border-slate-200">
                        <p className="line-clamp-3" title={trip.keyLearnings}>
                          {trip.keyLearnings || '-'}
                        </p>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingTrip(trip)}
                            className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Ver ficha completa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleEdit(trip)}
                            className="p-1 rounded-lg text-slate-500 hover:text-[#5EA832] hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setPrintingTrip(trip)}
                            className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Imprimir planilla oficial"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {isCoordinator && trip.status === 'submitted' && (
                            <button
                              onClick={() => updateFieldTripStatus(trip.id, 'approved')}
                              className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer font-bold text-[10px]"
                              title="Aprobar de inmediato"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(trip.id, trip.destinationOrGuest)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* -------------------------------------------------------------
           VISTA FICHAS / TARJETAS
           ------------------------------------------------------------- */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTrips.map((trip) => {
            const isSalida = trip.type === 'salida_campo';
            const hasPhone = /[0-9]{7,}/.test(trip.alliancesOrContacts);

            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* CARD TOP BAR */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isSalida ? 'bg-emerald-100 text-[#285A14]' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isSalida ? <Bus className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isSalida ? 'Salida de Campo' : 'Invitado Especial'}</span>
                      </span>

                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                        {trip.grade}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      trip.status === 'approved'
                        ? 'bg-emerald-50 text-[#3A6B1F] border border-emerald-200'
                        : trip.status === 'completed'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : trip.status === 'submitted'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {trip.status === 'approved' ? 'Aprobada' :
                       trip.status === 'submitted' ? 'En Revisión' :
                       trip.status === 'completed' ? 'Realizada' : 'Borrador'}
                    </span>
                  </div>

                  {/* DESTINATION / GUEST TITLE */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#285A14] transition-colors">
                      {trip.destinationOrGuest}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#5EA832]" />
                        {trip.date}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        Semana {trip.lapsoSemanaLabel || `${trip.lapso} Sem ${trip.weekNumber}`}
                      </span>
                    </div>
                  </div>

                  {/* ALLIANCES & CONTACTS */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Alianza y Contacto
                    </span>
                    <div className="font-semibold text-slate-900 truncate">
                      {trip.allianceName || trip.alliancesOrContacts || 'Sin contactos externos'}
                    </div>
                    {trip.contactPhone && (
                      <div className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#5EA832]" />
                        <span>{trip.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* CONTEXTO DEL PROYECTO */}
                  {trip.subjectOrContext && (
                    <div className="text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Contexto del proyecto
                      </span>
                      <span className="font-medium text-slate-700 block truncate">
                        {trip.subjectOrContext}
                      </span>
                    </div>
                  )}

                  {/* PURPOSE */}
                  {trip.purpose && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {trip.purpose}
                    </p>
                  )}

                  {/* INSTITUTIONAL FOCUS PILLARS */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Enfoques El Manglar
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {trip.focus.socialResponsibility && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#3A6B1F] border border-emerald-200">
                          Resp. Social
                        </span>
                      )}
                      {trip.focus.citizenParticipation && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                          Part. Ciudadana
                        </span>
                      )}
                      {trip.focus.nationalIdentity && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                          Ident. Nacional
                        </span>
                      )}
                      {trip.focus.introspection && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200">
                          Introspección
                        </span>
                      )}
                      {!trip.focus.socialResponsibility && !trip.focus.citizenParticipation && !trip.focus.nationalIdentity && !trip.focus.introspection && (
                        <span className="text-[10px] text-slate-400 italic">Sin enfoque marcado</span>
                      )}
                    </div>
                  </div>

                  {/* TEACHER & TRANSPORT */}
                  <div className="pt-1 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100">
                    <span className="truncate">
                      Resp: <strong>{trip.responsibleTeacher}</strong>
                    </span>
                    {trip.transportRequired && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
                        <Bus className="w-3 h-3" /> Bus
                      </span>
                    )}
                  </div>
                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPrintingTrip(trip)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Imprimir Ficha"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(trip)}
                      className="p-1.5 text-slate-400 hover:text-[#5EA832] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setViewingTrip(trip)}
                    className="px-3.5 py-1.5 text-xs font-bold text-[#3A6B1F] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Detalle</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {isFormOpen && (
        <FieldTripFormModal
          initialData={editingTrip}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTrip(null);
          }}
          onSaved={(saved) => {
            setIsFormOpen(false);
            setEditingTrip(null);
          }}
        />
      )}

      {viewingTrip && (
        <FieldTripDetailModal
          fieldTrip={viewingTrip}
          onClose={() => setViewingTrip(null)}
          onEdit={(trip) => handleEdit(trip)}
          onPrint={(trip) => {
            setViewingTrip(null);
            setPrintingTrip(trip);
          }}
        />
      )}

      {printingTrip && (
        <FieldTripPrintViewModal
          fieldTrip={printingTrip}
          onClose={() => setPrintingTrip(null)}
        />
      )}

    </section>
  );
};
