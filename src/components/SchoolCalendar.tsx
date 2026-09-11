import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Users, 
  Award, 
  Sparkles, 
  CalendarDays, 
  FileText, 
  AlertCircle, 
  X, 
  Trash2, 
  MapPin,
  CheckCircle2,
  CalendarRange
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { SchoolEvent, CalendarViewType, EventType } from '../types';

interface Props {
  className?: string;
}

export const SchoolCalendar: React.FC<Props> = ({ className = '' }) => {
  const { events, addSchoolEvent, deleteSchoolEvent, viewMode, currentUser } = useEduPlan();

  // Current view date state (Default to September 2026, matching academic calendar)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 5)); // Sep 5, 2026
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);

  // Form state for creating new event (by Coordinator)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<EventType>('planning_deadline');
  const [newDate, setNewDate] = useState('2026-09-15');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newTargetRole, setNewTargetRole] = useState<'all' | 'teachers' | 'coordinators'>('teachers');

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNamesShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case 'planning_deadline':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
          badge: 'bg-amber-100 text-amber-800',
          label: 'Entrega Planificación',
          icon: <Clock className="w-3 h-3 text-amber-600" />
        };
      case 'meeting':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
          dot: 'bg-indigo-500',
          badge: 'bg-indigo-100 text-indigo-800',
          label: 'Reunión / Consejo',
          icon: <Users className="w-3 h-3 text-indigo-600" />
        };
      case 'academic':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-100 text-emerald-800',
          label: 'Actividad Curricular',
          icon: <Award className="w-3 h-3 text-emerald-600" />
        };
      case 'exam':
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-200',
          dot: 'bg-purple-500',
          badge: 'bg-purple-100 text-purple-800',
          label: 'Evaluaciones',
          icon: <FileText className="w-3 h-3 text-purple-600" />
        };
      case 'holiday':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-200',
          dot: 'bg-rose-500',
          badge: 'bg-rose-100 text-rose-800',
          label: 'Feriado / Receso',
          icon: <Sparkles className="w-3 h-3 text-rose-600" />
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-900 border-slate-200',
          dot: 'bg-slate-500',
          badge: 'bg-slate-100 text-slate-800',
          label: 'General',
          icon: <CalendarIcon className="w-3 h-3 text-slate-600" />
        };
    }
  };

  // Date Navigation handlers
  const handlePrev = () => {
    if (calendarView === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    } else if (calendarView === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else if (calendarView === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (calendarView === 'year') {
      setCurrentDate(new Date(year - 1, month, 1));
    }
  };

  const handleNext = () => {
    if (calendarView === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    } else if (calendarView === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else if (calendarView === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (calendarView === 'year') {
      setCurrentDate(new Date(year + 1, month, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 5)); // Set to 5 Sep 2026
  };

  // Generate days for Month View
  const getDaysInMonth = () => {
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday as 0
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete weeks
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Format date helper: YYYY-MM-DD
  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getEventsForDate = (d: Date) => {
    const key = formatDateKey(d);
    return events.filter((e) => e.date === key);
  };

  // Get days for Week view
  const getWeekDays = () => {
    const currentDayOfWeek = (currentDate.getDay() + 6) % 7;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - currentDayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addSchoolEvent({
      title: newTitle.trim(),
      description: newDesc.trim(),
      type: newType,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      targetRole: newTargetRole,
    });

    setNewTitle('');
    setNewDesc('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className={`w-full ${className}`}>
      
      {/* Top Header & Toolbar matching Reference Image */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        {/* Left: Heading */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Calendario
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Cronograma académico y efemérides institucionales
          </p>
        </div>

        {/* Right: View Switcher (WEEK | MONTH | YEAR), Navigation (< July 2023 >), + Evento */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          
          {/* Calendar View Toggle (Segmented control) */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
              Vista:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50/70 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setCalendarView('day')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  calendarView === 'day'
                    ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                DÍA
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  calendarView === 'week'
                    ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                SEMANA
              </button>
              <button
                onClick={() => setCalendarView('month')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  calendarView === 'month'
                    ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                MES
              </button>
              <button
                onClick={() => setCalendarView('year')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  calendarView === 'year'
                    ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                AÑO
              </button>
            </div>
          </div>

          {/* Month / Period Navigation: < Month Year > in vibrant violet/indigo */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 shadow-2xs">
            <button
              onClick={handlePrev}
              className="p-1 text-indigo-600 hover:text-indigo-800 rounded transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs sm:text-sm font-bold text-slate-800 px-1 select-none">
              {calendarView === 'day' && `${currentDate.getDate()} ${monthNames[month]} ${year}`}
              {calendarView === 'week' && `Semana ${getWeekDays()[0].getDate()} ${monthNames[getWeekDays()[0].getMonth()]}`}
              {calendarView === 'month' && `${monthNames[month]} ${year}`}
              {calendarView === 'year' && `${year}`}
            </span>

            <button
              onClick={handleNext}
              className="p-1 text-indigo-600 hover:text-indigo-800 rounded transition-colors"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* "+ Evento" Action Button */}
          <button
            id="btn-add-school-event"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Evento</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. VISTA MES (Matching Reference Image Grid & Banner)                      */}
      {/* ========================================================================= */}
      {calendarView === 'month' && (
        <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200/80">
          {/* Solid Indigo/Purple Header Row */}
          <div className="grid grid-cols-7 bg-indigo-600 text-white text-center text-xs font-bold uppercase tracking-wider py-3">
            <div>DOM</div>
            <div>LUN</div>
            <div>MAR</div>
            <div>MIÉ</div>
            <div>JUE</div>
            <div>VIE</div>
            <div>SÁB</div>
          </div>

          {/* Month Grid Table */}
          <div className="grid grid-cols-7 bg-slate-200 gap-px">
            {getDaysInMonth().map((item, idx) => {
              const dayEvents = getEventsForDate(item.date);
              const isToday =
                item.date.getDate() === 5 &&
                item.date.getMonth() === 8 &&
                item.date.getFullYear() === 2026;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentDate(item.date);
                    if (dayEvents.length > 0) {
                      setCalendarView('day');
                    }
                  }}
                  className={`min-h-[100px] sm:min-h-[120px] p-2 sm:p-2.5 transition-colors flex flex-col justify-between cursor-pointer ${
                    item.isCurrentMonth
                      ? isToday
                        ? 'bg-indigo-50/40 hover:bg-indigo-50/70'
                        : 'bg-white hover:bg-slate-50/80'
                      : 'bg-slate-50/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : item.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400 font-normal'
                      }`}
                    >
                      {item.date.getDate()}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Clean event list matching reference image style */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const isExamOrDeadline = ev.type === 'exam' || ev.type === 'planning_deadline';
                      const accentColor = isExamOrDeadline ? 'border-pink-500' : 'border-indigo-500';

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`text-left text-[11px] font-medium text-slate-700 truncate border-b-2 ${accentColor} pb-0.5 hover:text-indigo-700 transition-colors cursor-pointer`}
                          title={`${ev.title} (${ev.startTime || ''})`}
                        >
                          {ev.title}
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-slate-400 font-semibold pt-0.5">
                        +{dayEvents.length - 2} más...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VISTA SEMANA                                                            */}
      {/* ========================================================================= */}
      {calendarView === 'week' && (
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {getWeekDays().map((d, i) => {
              const dayEvents = getEventsForDate(d);
              const isToday =
                d.getDate() === 5 &&
                d.getMonth() === 8 &&
                d.getFullYear() === 2026;

              return (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border flex flex-col min-h-[220px] ${
                    isToday
                      ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="pb-2 border-b border-slate-100 flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {dayNamesShort[i]}
                    </span>
                    <span
                      className={`text-xs font-black rounded-lg w-6 h-6 flex items-center justify-center ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-slate-800'
                      }`}
                    >
                      {d.getDate()}
                    </span>
                  </div>

                  {/* Day events list */}
                  <div className="flex-1 space-y-2">
                    {dayEvents.length > 0 ? (
                      dayEvents.map((ev) => {
                        const badge = getEventBadge(ev.type);
                        return (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className={`p-2 rounded-xl border text-xs cursor-pointer hover:shadow-xs transition-shadow ${badge.bg}`}
                          >
                            <div className="flex items-center space-x-1 font-bold text-[11px] mb-0.5">
                              {badge.icon}
                              <span className="truncate">{ev.title}</span>
                            </div>
                            {ev.startTime && (
                              <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{ev.startTime} - {ev.endTime || ''}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-300 font-medium italic">
                        Sin eventos
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VISTA DÍA                                                               */}
      {/* ========================================================================= */}
      {calendarView === 'day' && (
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Agenda del Día
              </span>
              <h4 className="text-lg font-black text-slate-900">
                {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h4>
            </div>

            <div className="text-xs font-bold text-slate-500">
              {getEventsForDate(currentDate).length} actividad{getEventsForDate(currentDate).length !== 1 ? 'es' : ''} programada{getEventsForDate(currentDate).length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-3">
            {getEventsForDate(currentDate).length > 0 ? (
              getEventsForDate(currentDate).map((ev) => {
                const badge = getEventBadge(ev.type);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-xs flex items-start justify-between ${badge.bg}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.badge}`}>
                          {badge.label}
                        </span>
                        {ev.startTime && (
                          <span className="text-xs font-bold text-slate-600 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{ev.startTime} - {ev.endTime || ''}</span>
                          </span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold text-slate-900">
                        {ev.title}
                      </h5>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                        {ev.description}
                      </p>
                    </div>

                    <div className="shrink-0 ml-3">
                      <span className="text-xs font-medium text-slate-400">Ver detalle</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  No hay eventos registrados para este día.
                </p>
                <button
                  onClick={() => {
                    setNewDate(formatDateKey(currentDate));
                    setIsCreateModalOpen(true);
                  }}
                  className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                >
                  + Programar evento aquí
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VISTA AÑO                                                               */}
      {/* ========================================================================= */}
      {calendarView === 'year' && (
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {monthNames.map((mName, mIdx) => {
              const monthEvents = events.filter((e) => {
                const [ey, em] = e.date.split('-');
                return parseInt(ey) === year && parseInt(em) - 1 === mIdx;
              });

              return (
                <div
                  key={mName}
                  onClick={() => {
                    setCurrentDate(new Date(year, mIdx, 1));
                    setCalendarView('month');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer hover:border-indigo-300 hover:shadow-xs ${
                    mIdx === month
                      ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">
                      {mName}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {monthEvents.length} ev.
                    </span>
                  </div>

                  <div className="space-y-1">
                    {monthEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[10px] text-slate-600 truncate flex items-center space-x-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}

                    {monthEvents.length === 0 && (
                      <div className="text-[10px] text-slate-400 italic">
                        Sin eventos
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom info footer */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-slate-700">Tipos de eventos:</span>
          <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-500" /><span>Entrega Planificación</span></span>
          <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /><span>Reunión</span></span>
          <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span>Curricular</span></span>
          <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-purple-500" /><span>Evaluación</span></span>
          <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-rose-500" /><span>Feriado</span></span>
        </div>

        <div className="italic">
          * Eventos gestionados por Coordinación Académica
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CARGAR NUEVO EVENTO ESCOLAR (Coordinador)                          */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Cargar Evento en Calendario Escolar
                  </h4>
                  <p className="text-xs text-slate-500">
                    Visible para toda la comunidad y el cuerpo docente
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Entrega de Planificaciones Quincenales / Consejo Técnico"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as EventType)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="planning_deadline">Entrega de Planificación</option>
                    <option value="meeting">Reunión / Consejo Técnico</option>
                    <option value="academic">Actividad Curricular</option>
                    <option value="exam">Evaluación / Exámenes</option>
                    <option value="holiday">Feriado / Receso Escolar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Fecha (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Descripción o Instrucciones
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detalles sobre lugar, formato de entrega, rúbrica o enlaces..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Guardar en Calendario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETALLE DEL EVENTO                                                 */}
      {/* ========================================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            {(() => {
              const badge = getEventBadge(selectedEvent.type);
              return (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.badge}`}>
                      {badge.label}
                    </span>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="py-4 space-y-3">
                    <h4 className="text-lg font-bold text-slate-900">
                      {selectedEvent.title}
                    </h4>

                    <div className="flex items-center space-x-3 text-xs text-slate-600">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{selectedEvent.date}</span>
                      </div>
                      {selectedEvent.startTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedEvent.startTime} {selectedEvent.endTime ? `- ${selectedEvent.endTime}` : ''}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      {selectedEvent.description || 'Sin descripción adicional proporcionada.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        deleteSchoolEvent(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                      className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Evento</span>
                    </button>

                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};
