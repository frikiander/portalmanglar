import React, { useState } from 'react';
import { X, UserPlus, User, Heart, Shield, Save } from 'lucide-react';
import { Student, StudentCondition } from '../types';
import { useEduPlan } from '../context/EduPlanContext';
import { ManglarEmblem } from './ManglarLogo';
import { SiblingManagerField } from './SiblingManagerField';

interface Props {
  defaultGrade: string;
  onClose: () => void;
}

export const StudentFormModal: React.FC<Props> = ({ defaultGrade, onClose }) => {
  const { addStudent } = useEduPlan();

  const [formData, setFormData] = useState<Omit<Student, 'id' | 'orderNumber'>>({
    fullName: '',
    email: '',
    birthPlace: '',
    birthState: 'Anzoátegui',
    birthDate: '',
    schoolId: '',
    condition: 'Regular',
    siblings: '',
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    motherId: '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherId: '',
    homeOfficePhone: '',
    canvasAccepted: false,
    canvasPassword: '12345678',
    canvasObservations: 'ENVIARLE LA INVITACIÓN A CANVAS INSTRUCTURE',
    canvasStatus: 'send_invitation',
    sociogramGroup: 'Grupo 1',
    grade: defaultGrade,
  });

  const handleAutofillParents = (parents: {
    motherName?: string;
    motherPhone?: string;
    motherEmail?: string;
    motherId?: string;
    fatherName?: string;
    fatherPhone?: string;
    fatherEmail?: string;
    fatherId?: string;
    homeOfficePhone?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      motherName: parents.motherName ?? prev.motherName,
      motherPhone: parents.motherPhone ?? prev.motherPhone,
      motherEmail: parents.motherEmail ?? prev.motherEmail,
      motherId: parents.motherId ?? prev.motherId,
      fatherName: parents.fatherName ?? prev.fatherName,
      fatherPhone: parents.fatherPhone ?? prev.fatherPhone,
      fatherEmail: parents.fatherEmail ?? prev.fatherEmail,
      fatherId: parents.fatherId ?? prev.fatherId,
      homeOfficePhone: parents.homeOfficePhone ?? prev.homeOfficePhone,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.schoolId.trim()) return;
    addStudent(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-[#3A6B1F] text-white shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-xs flex items-center justify-center shrink-0">
              <ManglarEmblem className="w-full h-full" />
            </div>
            <div>
              <span className="text-xs text-emerald-100 font-semibold block">
                Nómina Escolar · {defaultGrade}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                Inscribir Nuevo Estudiante
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
        <form id="new-student-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Bloque 1 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#5EA832]" />
              Identificación del Alumno
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Apellidos y Nombres <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Pérez Gómez Alejandro José"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Cédula Escolar Niño(a) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. 11820410317"
                  value={formData.schoolId}
                  onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de Nacimiento</label>
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  value={formData.birthDate || ''}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Condición</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as StudentCondition })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                >
                  <option value="Regular">Regular</option>
                  <option value="NUEVO">NUEVO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lugar de Nacimiento</label>
                <input
                  type="text"
                  placeholder="ej. Diego Bautista Urbaneja, Florida..."
                  value={formData.birthPlace || ''}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Estado / País</label>
                <input
                  type="text"
                  placeholder="ej. Anzoátegui, Estados Unidos..."
                  value={formData.birthState || ''}
                  onChange={(e) => setFormData({ ...formData, birthState: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
                />
              </div>

              {/* Selector Avanzado de Hermanos en el Colegio */}
              <div className="sm:col-span-2">
                <SiblingManagerField
                  currentGrade={formData.grade}
                  siblingsValue={formData.siblings || ''}
                  onChangeSiblings={(val) => setFormData({ ...formData, siblings: val })}
                  onAutofillParents={handleAutofillParents}
                />
              </div>
            </div>
          </div>

          {/* Bloque 2 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-600" />
              Directorio de Padres / Representantes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-pink-700 uppercase block">Madre</span>
                <input
                  type="text"
                  placeholder="Nombre de la Madre"
                  value={formData.motherName || ''}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="C.I. Madre (ej. 18.568.973)"
                  value={formData.motherId || ''}
                  onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
                />
                <input
                  type="text"
                  placeholder="Móvil Madre (ej. 0414-809-72-83)"
                  value={formData.motherPhone || ''}
                  onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
                <input
                  type="email"
                  placeholder="Email de la Madre"
                  value={formData.motherEmail || ''}
                  onChange={(e) => setFormData({ ...formData, motherEmail: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-blue-700 uppercase block">Padre</span>
                <input
                  type="text"
                  placeholder="Nombre del Padre"
                  value={formData.fatherName || ''}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="C.I. Padre (ej. 16.067.289)"
                  value={formData.fatherId || ''}
                  onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
                />
                <input
                  type="text"
                  placeholder="Móvil Padre (ej. 0414-806-87-69)"
                  value={formData.fatherPhone || ''}
                  onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
                <input
                  type="email"
                  placeholder="Email del Padre"
                  value={formData.fatherEmail || ''}
                  onChange={(e) => setFormData({ ...formData, fatherEmail: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Telf. Habitación / Oficina</label>
                <input
                  type="text"
                  placeholder="ej. 0281-2817808"
                  value={formData.homeOfficePhone || ''}
                  onChange={(e) => setFormData({ ...formData, homeOfficePhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Bloque 3 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Canvas LMS & Dinámica de Grupos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Alumno</label>
                <input
                  type="text"
                  placeholder="alumno@ejemplo.com o vacío"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Grupo de Sociograma</label>
                <select
                  value={formData.sociogramGroup || 'Grupo 1'}
                  onChange={(e) => setFormData({ ...formData, sociogramGroup: e.target.value as 'Grupo 1' | 'Grupo 2' })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg"
                >
                  <option value="Grupo 1">Grupo 1</option>
                  <option value="Grupo 2">Grupo 2</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="new-student-form"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#5EA832] hover:bg-[#498925] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscribir en {defaultGrade}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
