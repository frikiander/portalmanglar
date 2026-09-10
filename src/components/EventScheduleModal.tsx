import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Calendar, Clock, MapPin, Users, FileText, Sparkles } from 'lucide-react';
import { EventSchedule, EventScheduleItem, EventScheduleType } from '../types';
import { GRADE_LIST } from '../data/mockSchedules';

interface EventScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventSchedule | null;
  onSave: (event: Omit<EventSchedule, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  coordinatorName: string;
}

export const EventScheduleModal: React.FC<EventScheduleModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSave,
  coordinatorName,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventScheduleType>('academic');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('12:30');
  const [location, setLocation] = useState('');
  const [targetGrades, setTargetGrades] = useState<string[]>(['Todos los Grados']);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [agenda, setAgenda] = useState<EventScheduleItem[]>([
    {
      id: 'ag-1',
      time: '07:30 - 08:00',
      activity: 'Instalación y Llegada de Estudiantes',
      responsible: 'Docentes Guía',
      location: 'Patio Central',
    },
  ]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setType(eventToEdit.type || 'academic');
      setDate(eventToEdit.date || '');
      setStartTime(eventToEdit.startTime || '07:30');
      setEndTime(eventToEdit.endTime || '12:30');
      setLocation(eventToEdit.location || '');
      setTargetGrades(eventToEdit.targetGrades?.length ? eventToEdit.targetGrades : ['Todos los Grados']);
      setDescription(eventToEdit.description || '');
      setNotes(eventToEdit.notes || '');
      setAgenda(
        eventToEdit.agenda?.length
          ? eventToEdit.agenda
          : [
              {
                id: 'ag-1',
                time: '08:00 - 08:30',
                activity: 'Apertura',
                responsible: coordinatorName,
                location: eventToEdit.location || 'Patio Central',
              },
            ]
      );
    } else {
      setTitle('');
      setType('academic');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('07:30');
      setEndTime('12:30');
      setLocation('Patio Central y Aulas');
      setTargetGrades(['Todos los Grados']);
      setDescription('');
      setNotes('');
      setAgenda([
        {
          id: 'ag-1',
          time: '07:30 - 08:00',
          activity: 'Instalación y Organización de Grados',
          responsible: 'Docentes Guía y Coordinación',
          location: 'Patio Central',
        },
        {
          id: 'ag-2',
          time: '08:00 - 10:00',
          activity: 'Desarrollo de Actividades por Estaciones',
          responsible: 'Docentes de Área y Especialistas',
          location: 'Canchas y Salones',
        },
        {
          id: 'ag-3',
          time: '10:00 - 10:45',
          activity: 'Compartir y Cierre Institucional',
          responsible: coordinatorName,
          location: 'Patio Central',
        },
      ]);
    }
  }, [eventToEdit, isOpen, coordinatorName]);

  if (!isOpen) return null;

  const handleToggleGrade = (grade: string) => {
    if (grade === 'Todos los Grados') {
      setTargetGrades(['Todos los Grados']);
      return;
    }

    let next = targetGrades.filter((g) => g !== 'Todos los Grados');
    if (next.includes(grade)) {
      next = next.filter((g) => g !== grade);
    } else {
      next = [...next, grade];
    }

    if (next.length === 0 || next.length === GRADE_LIST.length) {
      setTargetGrades(['Todos los Grados']);
    } else {
      setTargetGrades(next);
    }
  };

  const handleAddAgendaItem = () => {
    const newItem: EventScheduleItem = {
      id: `ag-${Date.now()}`,
      time: '00:00 - 00:00',
      activity: '',
      responsible: '',
      location: location || '',
    };
    setAgenda([...agenda, newItem]);
  };

  const handleUpdateAgendaItem = (id: string, field: keyof EventScheduleItem, value: string) => {
    setAgenda(
      agenda.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveAgendaItem = (id: string) => {
    if (agenda.length <= 1) return;
    setAgenda(agenda.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    onSave({
      id: eventToEdit?.id,
      title: title.trim(),
      type,
      date,
      startTime,
      endTime,
      location: location.trim(),
      targetGrades,
      description: description.trim(),
      agenda,
      notes: notes.trim() || undefined,
      createdBy: eventToEdit?.createdBy || coordinatorName,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div 
        id="event-schedule-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Coordinación Pedagógica
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-300">
                Horario de Eventos Especiales
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              {eventToEdit ? 'Editar Horario de Evento' : 'Crear Nuevo Horario de Evento'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Publica el cronograma de actividades para que todos los docentes puedan sincronizarse.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title & Event Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Nombre del Evento o Jornada *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Cierre de Proyecto 3er Lapso / Olimpiadas de Ciencias..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Tipo de Evento *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventScheduleType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="academic">Académico / Cierre Proyecto</option>
                <option value="sports">Deportivo / Intercolegial</option>
                <option value="cultural">Cultural / Artístico</option>
                <option value="institutional">Institucional / Acto General</option>
                <option value="other">Otro Evento Especial</option>
              </select>
            </div>
          </div>

          {/* Date, Time Slots & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Fecha *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hora Inicio</span>
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="07:30"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Hora Fin</span>
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="12:30"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Lugar / Espacio</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Cancha techada, Aulas..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Target Grades */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Grados Participantes</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleToggleGrade('Todos los Grados')}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all ${
                  targetGrades.includes('Todos los Grados')
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Todos los Grados (1º a 6º)
              </button>
              {GRADE_LIST.map((gr) => {
                const isSelected =
                  targetGrades.includes(gr) && !targetGrades.includes('Todos los Grados');
                return (
                  <button
                    key={gr}
                    type="button"
                    onClick={() => handleToggleGrade(gr)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {gr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Descripción y Propósito del Evento
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica brevemente la logística, objetivo o instrucciones para el personal docente..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Dynamic Agenda Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Cronograma / Agenda Detallada del Evento
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddAgendaItem}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar Bloque</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {agenda.map((item, index) => (
                <div key={item.id} className="p-3 bg-white hover:bg-slate-50/70 flex flex-col md:flex-row gap-2 items-start md:items-center">
                  <span className="text-xs font-bold text-slate-400 w-6">
                    #{index + 1}
                  </span>
                  <div className="w-full md:w-32">
                    <input
                      type="text"
                      placeholder="Horario (08:00 - 08:30)"
                      value={item.time}
                      onChange={(e) => handleUpdateAgendaItem(item.id, 'time', e.target.value)}
                      className="w-full px-2 py-1 rounded-md border border-slate-300 text-xs font-medium text-slate-800"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Actividad o Fase..."
                      value={item.activity}
                      onChange={(e) => handleUpdateAgendaItem(item.id, 'activity', e.target.value)}
                      className="w-full px-2 py-1 rounded-md border border-slate-300 text-xs font-semibold text-slate-800"
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <input
                      type="text"
                      placeholder="Responsable..."
                      value={item.responsible}
                      onChange={(e) => handleUpdateAgendaItem(item.id, 'responsible', e.target.value)}
                      className="w-full px-2 py-1 rounded-md border border-slate-300 text-xs text-slate-700"
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <input
                      type="text"
                      placeholder="Lugar..."
                      value={item.location || ''}
                      onChange={(e) => handleUpdateAgendaItem(item.id, 'location', e.target.value)}
                      className="w-full px-2 py-1 rounded-md border border-slate-300 text-xs text-slate-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAgendaItem(item.id)}
                    disabled={agenda.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 self-end md:self-center"
                    title="Eliminar fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes / Uniform / Materials */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Notas Adicionales / Materiales / Uniforme</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Uniforme de gala / Traer hidratación y protector solar..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{eventToEdit ? 'Guardar Cambios' : 'Publicar Horario de Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
