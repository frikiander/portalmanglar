import React, { useState, useMemo } from 'react';
import { 
  Building2, Search, Plus, Printer, Download, Mail, Phone, 
  MessageCircle, Copy, Check, Filter, Award, Trophy, Sparkles, 
  BookOpen, Edit3, Trash2, ExternalLink, CheckCircle2, ChevronRight,
  Send, Users, HelpCircle
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { ExternalSchool, IntercollegiateEventKey } from '../types';
import { EVENT_DEFINITIONS } from '../data/mockSchools';
import { SchoolModal } from './SchoolModal';
import { ManglarEmblem } from './ManglarLogo';

export const SchoolDirectorySection: React.FC = () => {
  const { schools, toggleSchoolEvent, deleteSchool, viewMode, addToast } = useEduPlan();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<'ALL' | IntercollegiateEventKey>('ALL');
  const [viewModeTab, setViewModeTab] = useState<'table' | 'cards' | 'broadcast'>('table');
  const [selectedSchoolForEdit, setSelectedSchoolForEdit] = useState<ExternalSchool | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);

  const isCoordinator = viewMode === 'coordinator';

  // Event counts
  const stats = useMemo(() => {
    return {
      total: schools.length,
      futbol: schools.filter((s) => s.events.futbol).length,
      beachtennis: schools.filter((s) => s.events.beachtennis).length,
      spelling_bee: schools.filter((s) => s.events.spelling_bee).length,
      deletreo_espanol: schools.filter((s) => s.events.deletreo_espanol).length,
      ajedrez: schools.filter((s) => s.events.ajedrez).length,
      withEmail: schools.filter((s) => s.emails.length > 0).length,
      withPhone: schools.filter((s) => s.contactPhone).length,
    };
  }, [schools]);

  // Filter schools
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        school.name.toLowerCase().includes(q) ||
        school.emails.some((e) => e.toLowerCase().includes(q)) ||
        (school.contactName && school.contactName.toLowerCase().includes(q)) ||
        (school.contactPhone && school.contactPhone.includes(q)) ||
        (school.secondaryContact && school.secondaryContact.toLowerCase().includes(q)) ||
        (school.notes && school.notes.toLowerCase().includes(q));

      const matchesEvent =
        selectedEventFilter === 'ALL' || school.events[selectedEventFilter];

      return matchesSearch && matchesEvent;
    });
  }, [schools, searchTerm, selectedEventFilter]);

  // List of emails from currently filtered schools
  const activeEmails = useMemo(() => {
    const list: string[] = [];
    filteredSchools.forEach((s) => {
      s.emails.forEach((e) => {
        if (e && !list.includes(e)) list.push(e);
      });
    });
    return list;
  }, [filteredSchools]);

  const handleCopyAllEmails = () => {
    if (activeEmails.length === 0) {
      addToast('No hay correos en la selección actual.', 'warning');
      return;
    }
    const text = activeEmails.join('; ');
    navigator.clipboard.writeText(text);
    setCopiedEmails(true);
    addToast(`${activeEmails.length} correos copiados al portapapeles. Listo para pegar en CCO/BCC.`, 'success');
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  const handleOpenMailClient = () => {
    if (activeEmails.length === 0) {
      addToast('No hay correos en la selección actual.', 'warning');
      return;
    }
    const bcc = activeEmails.join(',');
    const eventName = selectedEventFilter !== 'ALL' 
      ? EVENT_DEFINITIONS.find((d) => d.key === selectedEventFilter)?.label 
      : 'Eventos Intercolegiales';
    const subject = encodeURIComponent(`Convocatoria Oficial: ${eventName} - Colegio Integral El Manglar`);
    const body = encodeURIComponent(
      `Estimada Dirección y Coordinación,\n\nReciban un cordial y afectuoso saludo del Colegio Integral El Manglar.\n\nPor medio de la presente, nos complace extenderles la más cordial invitación a participar en nuestro próximo encuentro de ${eventName}.\n\nAgradecemos confirmar su participación.\n\nAtentamente,\nCoordinación General\nColegio Integral El Manglar`
    );
    window.location.href = `mailto:coordinacion@manglar.edu.ve?bcc=${bcc}&subject=${subject}&body=${body}`;
  };

  const getWhatsAppLink = (phone?: string, schoolName?: string) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/[^0-9]/g, '');
    let intl = cleaned;
    if (cleaned.startsWith('0')) {
      intl = '58' + cleaned.slice(1);
    } else if (!cleaned.startsWith('58') && cleaned.length >= 10) {
      intl = '58' + cleaned;
    }
    const text = encodeURIComponent(
      `Estimado colega de ${schoolName || 'la institución'}, le saludamos de la Coordinación del Colegio Integral El Manglar con relación a las actividades y eventos intercolegiales.`
    );
    return `https://wa.me/${intl}?text=${text}`;
  };

  const handleExportCSV = () => {
    const headers = [
      'Colegio',
      'Correos',
      'Contacto',
      'Teléfono',
      'Contacto Secundario',
      'Interescolar Fútbol',
      'Beach Tennis',
      'Spelling Bee',
      'Deletreo Español',
      'Ajedrez',
      'Notas',
    ];

    const rows = filteredSchools.map((s) => [
      `"${s.name}"`,
      `"${s.emails.join('; ')}"`,
      `"${s.contactName || ''}"`,
      `"${s.contactPhone || ''}"`,
      `"${s.secondaryContact || ''}"`,
      s.events.futbol ? 'SI' : 'NO',
      s.events.beachtennis ? 'SI' : 'NO',
      s.events.spelling_bee ? 'SI' : 'NO',
      s.events.deletreo_espanol ? 'SI' : 'NO',
      s.events.ajedrez ? 'SI' : 'NO',
      `"${s.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Directorio_Colegios_Manglar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Directorio de Colegios exportado a CSV.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Directorio de Colegios
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Colegio Integral El Manglar · Relaciones institucionales y convocatorias
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Exportar Excel</span>
          </button>

          {isCoordinator && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#285A14] hover:bg-[#1f4710] shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Colegio</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards por Evento */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setSelectedEventFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedEventFilter === 'ALL'
              ? 'bg-gradient-to-br from-emerald-800 to-[#3A6B1F] text-white shadow-sm border-emerald-900'
              : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedEventFilter === 'ALL' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Total Colegios
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-black">{stats.total}</span>
            <span className={`text-[11px] ${selectedEventFilter === 'ALL' ? 'text-emerald-100' : 'text-slate-500'}`}>planteles</span>
          </div>
        </div>

        {EVENT_DEFINITIONS.map((def) => {
          const count = stats[def.key];
          const isSelected = selectedEventFilter === def.key;
          return (
            <div
              key={def.key}
              onClick={() => setSelectedEventFilter(def.key)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-800 to-[#3A6B1F] text-white shadow-sm border-emerald-900'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider truncate block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {def.shortLabel}
                </span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : def.type === 'deporte' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {def.type === 'deporte' ? 'Dep.' : 'Acad.'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl font-black">{count}</span>
                <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  ({Math.round((count / stats.total) * 100)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por colegio, correo, persona de contacto o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Botones de Convocatoria Rápida y Vistas */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyAllEmails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#3A6B1F] border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Copiar lista de correos separados por punto y coma listo para CCO en Gmail/Outlook"
            >
              {copiedEmails ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmails ? '¡Copiados!' : `Copiar Correos (${activeEmails.length})`}</span>
            </button>

            <button
              onClick={handleOpenMailClient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Abrir tu cliente de correo con plantilla de invitación"
            >
              <Send className="w-3.5 h-3.5 text-[#FACD00]" />
              <span>Convocatoria Masiva</span>
            </button>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl ml-auto sm:ml-0">
              <button
                onClick={() => setViewModeTab('table')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewModeTab === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabla
              </button>
              <button
                onClick={() => setViewModeTab('cards')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewModeTab === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tarjetas
              </button>
            </div>
          </div>
        </div>

        {/* Chips de filtro por evento */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Filtrar por Disciplina:
          </span>
          <button
            onClick={() => setSelectedEventFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedEventFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todos ({schools.length})
          </button>
          {EVENT_DEFINITIONS.map((def) => {
            const isSelected = selectedEventFilter === def.key;
            return (
              <button
                key={def.key}
                onClick={() => setSelectedEventFilter(def.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#5EA832] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{def.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {stats[def.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredSchools.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron colegios</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No hay colegios que coincidan con la búsqueda o el filtro de disciplina seleccionado.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedEventFilter('ALL');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <>
          {/* VISTA 1: TABLA PRINCIPAL INTERACTIVA */}
          {viewModeTab === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-3 text-center w-10">#</th>
                      <th className="py-3 px-4 min-w-[200px]">Colegio / Institución</th>
                      <th className="py-3 px-3 min-w-[190px]">Correo Electrónico</th>
                      <th className="py-3 px-3 min-w-[190px]">Contacto Principal</th>
                      {EVENT_DEFINITIONS.map((def) => (
                        <th key={def.key} className="py-3 px-2 text-center min-w-[85px]">
                          <span className="block text-[10px] leading-tight" title={def.label}>
                            {def.shortLabel}
                          </span>
                        </th>
                      ))}
                      <th className="py-3 px-3 text-right w-16">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSchools.map((school, index) => (
                      <tr 
                        key={school.id} 
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3 px-3 text-center font-bold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors text-xs sm:text-sm">
                            {school.name}
                          </div>
                          {school.notes && (
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {school.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {school.emails.length > 0 ? (
                            <div className="space-y-1">
                              {school.emails.map((email, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <a
                                    href={`mailto:${email}`}
                                    className="hover:text-[#5EA832] truncate max-w-[170px]"
                                    title={`Enviar correo a ${email}`}
                                  >
                                    {email}
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Sin correo registrado</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            {school.contactName && (
                              <div className="font-bold text-slate-800 text-[11px]">
                                {school.contactName}
                              </div>
                            )}
                            {school.contactPhone && (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] text-slate-600">{school.contactPhone}</span>
                                <a
                                  href={`tel:${school.contactPhone}`}
                                  className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                                  title="Llamar"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                                <a
                                  href={getWhatsAppLink(school.contactPhone, school.name)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-emerald-50 text-emerald-700 rounded"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                            {school.secondaryContact && (
                              <div className="text-[10px] text-slate-500 line-clamp-1 max-w-[180px]" title={school.secondaryContact}>
                                Secundario: {school.secondaryContact}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Interactive Checkbox Cells for Events */}
                        {EVENT_DEFINITIONS.map((def) => {
                          const isChecked = school.events[def.key];
                          return (
                            <td 
                              key={def.key} 
                              className="py-3 px-2 text-center"
                            >
                              <button
                                onClick={() => toggleSchoolEvent(school.id, def.key)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-[#5EA832] text-white shadow-2xs hover:bg-[#498925]'
                                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400'
                                }`}
                                title={`Alternar ${def.label} para ${school.name}`}
                              >
                                <Check className={`w-3.5 h-3.5 stroke-[3] ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                              </button>
                            </td>
                          );
                        })}

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedSchoolForEdit(school)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar Colegio"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 2: TARJETAS INSTITUCIONALES */}
          {viewModeTab === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchools.map((school) => {
                const totalEventsParticipating = Object.values(school.events).filter(Boolean).length;
                return (
                  <div
                    key={school.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#5EA832]/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top bar of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#5EA832]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 leading-tight">
                              {school.name}
                            </h4>
                            {school.notes && (
                              <span className="text-[10px] text-slate-400 block">{school.notes}</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedSchoolForEdit(school)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Editar Colegio"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Contact Details */}
                      <div className="mt-3.5 space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs">
                        {school.contactName && (
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{school.contactName}</span>
                          </div>
                        )}

                        {school.contactPhone && (
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="font-mono text-slate-700 font-bold">{school.contactPhone}</span>
                            <div className="flex items-center gap-1">
                              <a
                                href={`tel:${school.contactPhone}`}
                                className="p-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                                title="Llamar"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <a
                                href={getWhatsAppLink(school.contactPhone, school.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )}

                        {school.emails.length > 0 && (
                          <div className="pt-1 border-t border-slate-200/60 space-y-1">
                            {school.emails.map((email, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 truncate">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <a href={`mailto:${email}`} className="hover:text-[#5EA832] truncate">
                                  {email}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}

                        {school.secondaryContact && (
                          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <strong>Secundario:</strong> {school.secondaryContact}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Event Badges List */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Participación en Eventos ({totalEventsParticipating})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {EVENT_DEFINITIONS.map((def) => {
                          const isChecked = school.events[def.key];
                          return (
                            <button
                              key={def.key}
                              onClick={() => toggleSchoolEvent(school.id, def.key)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                isChecked
                                  ? `${def.badgeBg} ${def.badgeText} border ${def.badgeBorder}`
                                  : 'bg-slate-100 text-slate-400 border border-slate-200/60 line-through opacity-60'
                              }`}
                              title="Haz clic para alternar participación"
                            >
                              {def.shortLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <SchoolModal
          onClose={() => setShowAddModal(false)}
        />
      )}

      {selectedSchoolForEdit && (
        <SchoolModal
          school={selectedSchoolForEdit}
          onClose={() => setSelectedSchoolForEdit(null)}
        />
      )}
    </div>
  );
};
