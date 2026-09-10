import React, { useState } from 'react';
import { X, Building2, Mail, Phone, User, Award, Save, Trash2, Plus } from 'lucide-react';
import { ExternalSchool, IntercollegiateEventKey } from '../types';
import { useEduPlan } from '../context/EduPlanContext';
import { EVENT_DEFINITIONS } from '../data/mockSchools';
import { ManglarEmblem } from './ManglarLogo';

interface Props {
  school?: ExternalSchool | null;
  onClose: () => void;
}

export const SchoolModal: React.FC<Props> = ({ school, onClose }) => {
  const { addSchool, updateSchool, deleteSchool, viewMode } = useEduPlan();
  const isEditing = !!school;
  const isCoordinator = viewMode === 'coordinator';

  const [name, setName] = useState(school?.name || '');
  const [emailsInput, setEmailsInput] = useState(school?.emails.join(', ') || '');
  const [contactName, setContactName] = useState(school?.contactName || '');
  const [contactPhone, setContactPhone] = useState(school?.contactPhone || '');
  const [secondaryContact, setSecondaryContact] = useState(school?.secondaryContact || '');
  const [notes, setNotes] = useState(school?.notes || '');
  const [events, setEvents] = useState(
    school?.events || {
      futbol: false,
      beachtennis: false,
      spelling_bee: false,
      deletreo_espanol: false,
      ajedrez: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const emailsArray = emailsInput
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@'));

    if (isEditing && school) {
      updateSchool({
        ...school,
        name: name.trim(),
        emails: emailsArray,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        secondaryContact: secondaryContact.trim() || undefined,
        notes: notes.trim() || undefined,
        events,
      });
    } else {
      addSchool({
        name: name.trim(),
        emails: emailsArray,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        secondaryContact: secondaryContact.trim() || undefined,
        notes: notes.trim() || undefined,
        events,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (school && window.confirm(`¿Estás seguro de eliminar a "${school.name}" del directorio?`)) {
      deleteSchool(school.id);
      onClose();
    }
  };

  const toggleEvent = (key: IntercollegiateEventKey) => {
    setEvents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-[#3A6B1F] text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-xs flex items-center justify-center shrink-0">
              <ManglarEmblem className="w-full h-full" />
            </div>
            <div>
              <span className="text-xs text-emerald-100 font-semibold block">
                Directorio Institucional Intercolegial
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEditing ? 'Editar Ficha del Colegio' : 'Registrar Nuevo Colegio'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="school-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Identificación */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nombre de la Institución Educativa <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="ej. Colegio La Paz, U.E. Colegio Santa María..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Correos */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              Correos Electrónicos (separados por coma si son varios)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                placeholder="ej. direccion@colegio.edu.ve, coordinacion@gmail.com"
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Contacto Principal */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#5EA832]" />
              Contacto Principal & Teléfonos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Contacto / Cargo</label>
                <input
                  type="text"
                  placeholder="ej. Lérida Velásquez, Prof. Rosa León..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono Móvil / Principal</label>
                <input
                  type="text"
                  placeholder="ej. 0424-8040990, 0414-8251494..."
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contacto Secundario / Alternativo</label>
                <input
                  type="text"
                  placeholder="ej. Sede 0281-2810306 / María Rivas 0414-7968583..."
                  value={secondaryContact}
                  onChange={(e) => setSecondaryContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Historial de Eventos Participados */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Eventos en los que ha participado en el Colegio
            </h4>
            <p className="text-[11px] text-slate-500">
              Marca las disciplinas y eventos intercolegiales en los que la institución participa activamente:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {EVENT_DEFINITIONS.map((def) => {
                const isChecked = events[def.key];
                return (
                  <label
                    key={def.key}
                    onClick={() => toggleEvent(def.key)}
                    className={`flex items-center space-x-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? `${def.badgeBg} ${def.badgeBorder} shadow-2xs font-bold`
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by label click
                      className="w-4 h-4 text-[#5EA832] rounded-sm focus:ring-[#5EA832]"
                    />
                    <span className="text-xs">{def.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Observaciones / Ubicación</label>
            <input
              type="text"
              placeholder="ej. Sede Lechería, Puerto La Cruz, Barcelona..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {isEditing && isCoordinator && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="school-form"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#5EA832] hover:bg-[#498925] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Registrar Colegio'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
