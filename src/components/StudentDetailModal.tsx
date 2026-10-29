import React, { useState, useEffect } from 'react';
import { 
  X, Phone, Mail, User, Heart, Shield, Edit3, Trash2, 
  MessageCircle, ExternalLink, Calendar, MapPin, CheckCircle2, 
  AlertCircle, Key, Users, BookOpen, Clock, Save, Copy, Check, ArrowRight
} from 'lucide-react';
import { Student, StudentCondition, CanvasStatus } from '../types';
import { useEduPlan } from '../context/EduPlanContext';
import { ManglarEmblem } from './ManglarLogo';
import { SiblingManagerField } from './SiblingManagerField';

interface Props {
  student: Student;
  onClose: () => void;
  onEdit?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<Props> = ({ student: initialStudent, onClose }) => {
  const { students, updateStudent, deleteStudent, viewMode, addToast } = useEduPlan();
  const [activeStudent, setActiveStudent] = useState<Student>(initialStudent);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Student>(initialStudent);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setActiveStudent(initialStudent);
    setFormData(initialStudent);
  }, [initialStudent]);

  const isCoordinator = viewMode === 'coordinator';

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    addToast(`Copiado: ${text}`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent(formData);
    setActiveStudent(formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar a ${activeStudent.fullName} de la nómina?`)) {
      deleteStudent(activeStudent.id);
      onClose();
    }
  };

  const navigateToSibling = (matched: Student) => {
    setActiveStudent(matched);
    setFormData(matched);
    setIsEditing(false);
    addToast(`Mostrando expediente de ${matched.fullName} (${matched.grade}).`, 'info');
  };

  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/[^0-9]/g, '');
    let intl = cleaned;
    if (cleaned.startsWith('0')) {
      intl = '58' + cleaned.slice(1);
    } else if (!cleaned.startsWith('58') && cleaned.length >= 10) {
      intl = '58' + cleaned;
    }
    const text = encodeURIComponent(
      `Estimado representante de ${activeStudent.fullName}, le contactamos desde la Coordinación del Colegio Integral El Manglar.`
    );
    return `https://wa.me/${intl}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-raiz/40 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-raiz text-white shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-xs flex items-center justify-center shrink-0">
              <ManglarEmblem className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/20 text-white font-bold">
                  N° {activeStudent.orderNumber}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                  activeStudent.condition === 'NUEVO'
                    ? 'bg-attention-400 text-slate-950 font-black'
                    : 'bg-white/20 text-white'
                }`}>
                  {activeStudent.condition}
                </span>
                <span className="text-xs text-success-100 font-medium">
                  {activeStudent.grade}
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                {activeStudent.fullName}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isCoordinator && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-success-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Editar Estudiante"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-success-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isEditing ? (
            <form id="student-edit-form" onSubmit={handleSave} className="space-y-6">
              {/* Bloque 1: Datos Personales */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600" />
                  Datos personales & filiación
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos y nombres</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cédula escolar</label>
                    <input
                      type="text"
                      required
                      value={formData.schoolId}
                      onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de nacimiento</label>
                    <input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={formData.birthDate || ''}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Condición</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as StudentCondition })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                    >
                      <option value="Regular">Regular</option>
                      <option value="NUEVO">NUEVO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Lugar de nacimiento</label>
                    <input
                      type="text"
                      value={formData.birthPlace || ''}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Estado / país</label>
                    <input
                      type="text"
                      value={formData.birthState || ''}
                      onChange={(e) => setFormData({ ...formData, birthState: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                    />
                  </div>
                  {/* Selector Avanzado de Hermanos en el Colegio */}
                  <div className="sm:col-span-2">
                    <SiblingManagerField
                      currentStudentId={activeStudent.id}
                      currentGrade={formData.grade}
                      siblingsValue={formData.siblings || ''}
                      onChangeSiblings={(val) => setFormData({ ...formData, siblings: val })}
                      onAutofillParents={handleAutofillParents}
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Contacto Familiar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-600" />
                  Información familiar & representantes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-pink-700">Datos de la madre</span>
                    <input
                      type="text"
                      placeholder="Nombre de la Madre"
                      value={formData.motherName || ''}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="C.I. Madre"
                      value={formData.motherId || ''}
                      onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md tabular-nums"
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
                      placeholder="Email Madre"
                      value={formData.motherEmail || ''}
                      onChange={(e) => setFormData({ ...formData, motherEmail: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-blue-700">Datos del padre</span>
                    <input
                      type="text"
                      placeholder="Nombre del Padre"
                      value={formData.fatherName || ''}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="C.I. Padre"
                      value={formData.fatherId || ''}
                      onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md tabular-nums"
                    />
                    <input
                      type="text"
                      placeholder="Móvil Padre (ej. 0424-879-31-60)"
                      value={formData.fatherPhone || ''}
                      onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                    <input
                      type="email"
                      placeholder="Email Padre"
                      value={formData.fatherEmail || ''}
                      onChange={(e) => setFormData({ ...formData, fatherEmail: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Telf. Habitación / oficina</label>
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

              {/* Bloque 3: Canvas LMS & Sociograma */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success-600" />
                  Plataforma digital Canvas LMS & sociograma
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Correo alumno</label>
                    <input
                      type="text"
                      placeholder="correo@ejemplo.com o 'no tiene correo'"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña Canvas</label>
                    <input
                      type="text"
                      value={formData.canvasPassword || ''}
                      onChange={(e) => setFormData({ ...formData, canvasPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg tabular-nums"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.canvasAccepted}
                        onChange={(e) => setFormData({ ...formData, canvasAccepted: e.target.checked })}
                        className="w-4 h-4 text-primary-600 rounded-sm focus:ring-primary-500"
                      />
                      <span className="text-xs font-semibold text-slate-700">Invitación Canvas aceptada</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Grupo de sociograma</label>
                    <select
                      value={formData.sociogramGroup || 'Grupo 1'}
                      onChange={(e) => setFormData({ ...formData, sociogramGroup: e.target.value as 'Grupo 1' | 'Grupo 2' })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg"
                    >
                      <option value="Grupo 1">Grupo 1</option>
                      <option value="Grupo 2">Grupo 2</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Observaciones de Canvas</label>
                    <input
                      type="text"
                      placeholder="ej. TIENE TODOS SUS MÓDULOS LISTOS"
                      value={formData.canvasObservations || ''}
                      onChange={(e) => setFormData({ ...formData, canvasObservations: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <>
              {/* TARJETA 1: DATOS PERSONALES & ACADÉMICOS */}
              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-600" />
                    Datos académicos y registro
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700">
                    Grupo: <strong className="text-success-700">{activeStudent.sociogramGroup || 'Sin asignar'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-xs text-slate-500 font-semibold block">Cédula escolar</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs sm:text-sm tabular-nums font-bold text-slate-800">{activeStudent.schoolId}</span>
                      <button
                        onClick={() => handleCopy(activeStudent.schoolId, 'schoolId')}
                        className="text-slate-500 hover:text-slate-600 p-1 cursor-pointer"
                        title="Copiar Cédula Escolar"
                      >
                        {copiedField === 'schoolId' ? <Check className="w-3.5 h-3.5 text-success-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-xs text-slate-500 font-semibold block">Fecha de nacimiento</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block">
                      {activeStudent.birthDate || 'No registrada'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-xs text-slate-500 font-semibold block">Lugar y entidad</span>
                    <span className="text-xs font-medium text-slate-700 mt-1 block truncate" title={`${activeStudent.birthPlace || ''}, ${activeStudent.birthState || ''}`}>
                      {activeStudent.birthPlace ? `${activeStudent.birthPlace}, ${activeStudent.birthState}` : 'No registrado'}
                    </span>
                  </div>

                  {/* Hermanos en el Colegio con Fichas Interactivas */}
                  <div className="col-span-2 sm:col-span-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary-600" />
                        Hermanos en el Colegio
                      </span>
                      {activeStudent.siblings ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success-50 text-primary-700 border border-success-200 font-bold">
                          Familia activa en el plantel
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Hijo(a) único(a)</span>
                      )}
                    </div>

                    {activeStudent.siblings ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {activeStudent.siblings
                          .split(';')
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((siblingText, idx) => {
                            const matched = students.find((st) =>
                              siblingText.toLowerCase().includes(st.fullName.toLowerCase())
                            );
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-3 py-1.5 bg-success-50/70 border border-success-200 rounded-xl text-xs"
                              >
                                <div className="w-2 h-2 rounded-full bg-primary-600" />
                                <span className="font-bold text-slate-800">{siblingText}</span>
                                {matched && (
                                  <button
                                    type="button"
                                    onClick={() => navigateToSibling(matched)}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-primary-600 hover:bg-primary-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer shadow-2xs ml-1"
                                    title={`Ver expediente completo de ${matched.fullName}`}
                                  >
                                    <span>Ver expediente</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic block">
                        No registra hermanos matriculados en este período.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* TARJETA 2: FAMILIAS Y CONTACTO DE EMERGENCIA */}
              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-600" />
                  Directorio familiar & representantes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Madre */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-pink-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Madre
                      </span>
                      {activeStudent.motherId && (
                        <span className="text-xs tabular-nums text-slate-500">CI: {activeStudent.motherId}</span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      {activeStudent.motherName || 'No registrada'}
                    </div>

                    {activeStudent.motherPhone && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs tabular-nums text-slate-700">{activeStudent.motherPhone}</span>
                        <div className="flex items-center space-x-1">
                          <a
                            href={`tel:${activeStudent.motherPhone}`}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                            title="Llamar a la Madre"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={getWhatsAppLink(activeStudent.motherPhone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-success-100 hover:bg-success-200 text-success-800 rounded-lg text-xs"
                            title="Enviar WhatsApp institucional"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {activeStudent.motherEmail && (
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{activeStudent.motherEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Padre */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Padre
                      </span>
                      {activeStudent.fatherId && (
                        <span className="text-xs tabular-nums text-slate-500">CI: {activeStudent.fatherId}</span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      {activeStudent.fatherName || 'No registrado'}
                    </div>

                    {activeStudent.fatherPhone && activeStudent.fatherPhone !== 'n/a' && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs tabular-nums text-slate-700">{activeStudent.fatherPhone}</span>
                        <div className="flex items-center space-x-1">
                          <a
                            href={`tel:${activeStudent.fatherPhone}`}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                            title="Llamar al Padre"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={getWhatsAppLink(activeStudent.fatherPhone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-success-100 hover:bg-success-200 text-success-800 rounded-lg text-xs"
                            title="Enviar WhatsApp institucional"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {activeStudent.fatherEmail && activeStudent.fatherEmail !== 'n/a' && (
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{activeStudent.fatherEmail}</span>
                      </div>
                    )}
                  </div>

                  {activeStudent.homeOfficePhone && (
                    <div className="sm:col-span-2 bg-warning-50/80 p-2.5 rounded-xl border border-warning-200/70 flex items-center justify-between">
                      <span className="text-xs font-semibold text-warning-900">
                        Teléfono local / oficina familiar:
                      </span>
                      <span className="text-xs tabular-nums font-bold text-warning-950">
                        {activeStudent.homeOfficePhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* TARJETA 3: PLATAFORMA CANVAS LMS */}
              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success-600" />
                    Plataforma digital Canvas LMS (instructure)
                  </h4>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    activeStudent.canvasAccepted
                      ? 'bg-success-100 text-success-800 border border-success-200'
                      : 'bg-warning-100 text-warning-800 border border-warning-200'
                  }`}>
                    {activeStudent.canvasAccepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {activeStudent.canvasAccepted ? 'Invitación Aceptada' : 'Pendiente Aceptación'}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block">Correo del alumno</span>
                      <span className={`text-xs sm:text-sm font-semibold block mt-1 ${activeStudent.email ? 'text-slate-800' : 'text-slate-500 italic'}`}>
                        {activeStudent.email || 'No tiene correo registrado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block">Contraseña asignada</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs tabular-nums font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {activeStudent.canvasPassword || '12345678'}
                        </span>
                        <button
                          onClick={() => handleCopy(activeStudent.canvasPassword || '12345678', 'pwd')}
                          className="text-slate-500 hover:text-slate-600 p-1 cursor-pointer"
                          title="Copiar contraseña"
                        >
                          {copiedField === 'pwd' ? <Check className="w-3.5 h-3.5 text-success-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Estado y observaciones del curso</span>
                    <div className={`p-2.5 rounded-lg text-xs font-semibold border ${
                      activeStudent.canvasObservations?.includes('TODOS SUS MÓDULOS')
                        ? 'bg-success-50 text-success-800 border-success-200'
                        : activeStudent.canvasObservations?.includes('ENVIAR')
                        ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                        : activeStudent.canvasObservations?.includes('NO TIENE CORREO')
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-warning-50 text-warning-800 border-warning-200'
                    }`}>
                      {activeStudent.canvasObservations || 'Sin observaciones registradas'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {isEditing && isCoordinator && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-danger-700 bg-danger-50 hover:bg-danger-100 border border-danger-200 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar estudiante</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(activeStudent);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="student-edit-form"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-600 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar cambios</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Cerrar ficha
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
