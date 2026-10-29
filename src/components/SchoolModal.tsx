import React, { useState } from 'react';
import { Building2, Mail, Phone, User, Award, Save, Trash2, Plus } from 'lucide-react';
import { ExternalSchool, IntercollegiateEventKey } from '../types';
import { useEduPlan } from '../context/EduPlanContext';
import { EVENT_DEFINITIONS } from '../data/mockSchools';
import { Button, Modal } from './ui';

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

  const footer = (
    <>
      {isEditing && isCoordinator && (
        <Button variant="secondary" size="sm" icon={Trash2} onClick={handleDelete} className="mr-auto text-danger-700">
          Eliminar
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
      <Button type="submit" form="school-form" size="sm" icon={Save}>
        {isEditing ? 'Guardar cambios' : 'Registrar colegio'}
      </Button>
    </>
  );

  return (
    <Modal
      onClose={onClose}
      title={isEditing ? 'Editar ficha del colegio' : 'Registrar nuevo colegio'}
      subtitle="Directorio intercolegial"
      footer={footer}
    >
        {/* Form Body */}
        <form id="school-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Identificación */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Nombre de la institución educativa <span className="text-danger-700">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="ej. Colegio La Paz, U.E. Colegio Santa María..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Correos */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              Correos electrónicos (separados por coma si son varios)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <textarea
                rows={2}
                placeholder="ej. direccion@colegio.edu.ve, coordinacion@gmail.com"
                value={emailsInput}
                onChange={(e) => setEmailsInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-hidden tabular-nums"
              />
            </div>
          </div>

          {/* Contacto Principal */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-600" />
              Contacto principal & teléfonos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del contacto / cargo</label>
                <input
                  type="text"
                  placeholder="ej. Lérida Velásquez, Prof. Rosa León..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono móvil / principal</label>
                <input
                  type="text"
                  placeholder="ej. 0424-8040990, 0414-8251494..."
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden tabular-nums"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contacto secundario / alternativo</label>
                <input
                  type="text"
                  placeholder="ej. Sede 0281-2810306 / María Rivas 0414-7968583..."
                  value={secondaryContact}
                  onChange={(e) => setSecondaryContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Historial de Eventos Participados */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-warning-500" />
              Eventos en los que ha participado en el Colegio
            </h4>
            <p className="text-xs text-slate-500">
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
                      className="w-4 h-4 text-primary-600 rounded-sm focus:ring-primary-500"
                    />
                    <span className="text-xs">{def.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Observaciones / ubicación</label>
            <input
              type="text"
              placeholder="ej. Sede Lechería, Puerto La Cruz, Barcelona..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
            />
          </div>
        </form>
    </Modal>
  );
};
