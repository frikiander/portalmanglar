import React from 'react';
import { 
  X, Bus, Sparkles, Calendar, Clock, MapPin, User, Users, 
  BookOpen, CheckCircle2, AlertCircle, Edit3, Trash2, Phone, 
  MessageCircle, Copy, Check, Printer, FileText 
} from 'lucide-react';
import { FieldTrip } from '../types';
import { useEduPlan } from '../context/EduPlanContext';

interface Props {
  fieldTrip: FieldTrip;
  onClose: () => void;
  onEdit: (fieldTrip: FieldTrip) => void;
  onPrint: (fieldTrip: FieldTrip) => void;
}

export const FieldTripDetailModal: React.FC<Props> = ({ fieldTrip, onClose, onEdit, onPrint }) => {
  const { viewMode, deleteFieldTrip, updateFieldTripStatus, addToast } = useEduPlan();
  const isCoordinator = viewMode === 'coordinator';
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    addToast(`${label} copiado al portapapeles.`, 'info');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de "${fieldTrip.destinationOrGuest}"?`)) {
      deleteFieldTrip(fieldTrip.id);
      onClose();
    }
  };

  const getWhatsAppLink = (contact: string) => {
    const cleaned = contact.replace(/[^0-9]/g, '');
    if (!cleaned) return '#';
    let intl = cleaned;
    if (cleaned.startsWith('0')) {
      intl = '58' + cleaned.slice(1);
    } else if (!cleaned.startsWith('58')) {
      intl = '58' + cleaned;
    }
    const text = encodeURIComponent(
      `Estimados aliados de ${fieldTrip.destinationOrGuest}, le contactamos desde la Coordinación del Colegio Integral El Manglar.`
    );
    return `https://wa.me/${intl}?text=${text}`;
  };

  const hasPhone = /[0-9]{7,}/.test(fieldTrip.alliancesOrContacts);

  return (
    <div className="fixed inset-0 z-50 bg-raiz/40 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        
        {/* HEADER */}
        <div className="px-5 sm:px-7 py-4 bg-raiz text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
              {fieldTrip.type === 'salida_campo' ? (
                <Bus className="w-5 h-5 text-white" />
              ) : (
                <Sparkles className="w-5 h-5 text-attention-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/20 text-white font-bold">
                  {fieldTrip.type === 'salida_campo' ? 'Salida de Campo' : 'Invitado Especial'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-success-900/40 text-success-200 font-bold">
                  {fieldTrip.grade}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/15 text-white font-semibold">
                  Semana {fieldTrip.lapsoSemanaLabel || `${fieldTrip.lapso} Sem ${fieldTrip.weekNumber}`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate mt-0.5">
                {fieldTrip.destinationOrGuest}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => onPrint(fieldTrip)}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Imprimir o exportar ficha oficial"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-800">
          
          {/* STATUS & DATE RIBBON */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                fieldTrip.status === 'approved'
                  ? 'bg-success-100 text-primary-700 border border-success-300'
                  : fieldTrip.status === 'completed'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : fieldTrip.status === 'submitted'
                  ? 'bg-warning-100 text-warning-800 border border-warning-300'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {fieldTrip.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {fieldTrip.status === 'submitted' && <Clock className="w-3.5 h-3.5" />}
                {fieldTrip.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {fieldTrip.status === 'approved' ? 'Aprobada por Coordinación' :
                 fieldTrip.status === 'submitted' ? 'En Revisión por Coordinación' :
                 fieldTrip.status === 'completed' ? 'Experiencia Realizada' : 'Borrador'}
              </span>

              {fieldTrip.transportRequired && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 font-semibold flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5" />
                  Transporte solicitado
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span>Fecha: <strong className="text-slate-900">{fieldTrip.date}</strong></span>
            </div>
          </div>

          {/* GRID OF LOGISTICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Alianzas y Contactos */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-500 block">
                Alianza y contacto
              </span>
              <div>
                <div className="text-xs text-slate-500 font-medium">Nombre de la alianza / especialista:</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {fieldTrip.allianceName || fieldTrip.alliancesOrContacts || 'Sin alianzas externas registradas'}
                </div>
              </div>

              {(fieldTrip.contactPhone || hasPhone) && (
                <div className="pt-1 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Número de contacto:</div>
                  <div className="text-xs font-bold text-slate-800 tabular-nums mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary-600" />
                    <span>{fieldTrip.contactPhone || fieldTrip.alliancesOrContacts}</span>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <a
                      href={`tel:${(fieldTrip.contactPhone || fieldTrip.alliancesOrContacts).replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Llamar</span>
                    </a>
                    <a
                      href={getWhatsAppLink(fieldTrip.contactPhone || fieldTrip.alliancesOrContacts)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-success-50 hover:bg-success-100 text-primary-700 border border-success-200 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Contexto del proyecto */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-slate-500 block">
                Contexto del proyecto
              </span>
              <div className="text-sm font-bold text-slate-900">
                {fieldTrip.subjectOrContext || 'Proyecto de Aula'}
              </div>
              <span className="text-xs text-slate-500 block">
                Grado: {fieldTrip.grade} • Lapso: {fieldTrip.lapso}
              </span>
            </div>

            {/* Docentes */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-slate-500 block">
                Equipo docente
              </span>
              <div className="text-xs text-slate-700">
                <strong className="text-slate-900">Docente responsable:</strong> {fieldTrip.responsibleTeacher}
              </div>
              {fieldTrip.chaperoneTeachers && (
                <div className="text-xs text-slate-600">
                  <strong>Acompañantes:</strong> {fieldTrip.chaperoneTeachers}
                </div>
              )}
            </div>

            {/* Recursos y Representantes */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-slate-500 block">
                Recursos y representantes acompañantes
              </span>
              <div className="text-xs text-slate-700">
                <strong className="text-slate-900">Recursos:</strong> {fieldTrip.resources || 'Ninguno especificado'}
              </div>
              {fieldTrip.chaperoneParents && (
                <div className="text-xs text-slate-600">
                  <strong>Padres chaperones:</strong> {fieldTrip.chaperoneParents}
                </div>
              )}
            </div>
          </div>

          {/* PROPÓSITO / TEMA */}
          {fieldTrip.purpose && (
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 block">
                Tema / propósito pedagógico
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {fieldTrip.purpose}
              </p>
            </div>
          )}

          {/* ENFOQUES RELACIONADOS (PILARES DEL MANGLAR) */}
          <div className="bg-warning-50/70 p-4 rounded-2xl border border-warning-200/80 space-y-2.5">
            <span className="text-xs font-bold text-warning-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-warning-700" />
              Enfoques relacionados (pilares institucionales El Manglar)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { label: 'Responsabilidad Social', checked: fieldTrip.focus.socialResponsibility },
                { label: 'Participación Ciudadana', checked: fieldTrip.focus.citizenParticipation },
                { label: 'Identidad Nacional', checked: fieldTrip.focus.nationalIdentity },
                { label: 'Introspección', checked: fieldTrip.focus.introspection },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-xl text-xs font-bold text-center border ${
                    item.checked
                      ? 'bg-warning-100 text-warning-950 border-warning-300 shadow-2xs ring-1 ring-warning-300'
                      : 'bg-white/80 text-slate-500 border-slate-200 line-through opacity-60'
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* METODOLOGÍA (¿CÓMO?) */}
          {fieldTrip.methodology && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-xs font-bold text-primary-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary-600" />
                ¿CÓMO? (Metodología vivencial y desarrollo de la actividad)
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {fieldTrip.methodology}
              </p>
            </div>
          )}

          {/* APRENDIZAJES CLAVE */}
          {fieldTrip.keyLearnings && (
            <div className="bg-success-50/60 p-4 rounded-2xl border border-success-200/80 space-y-1.5">
              <span className="text-xs font-bold text-success-950 block">
                Aprendizajes clave alcanzados / proyectados
              </span>
              <p className="text-xs sm:text-sm text-success-900 leading-relaxed font-medium">
                {fieldTrip.keyLearnings}
              </p>
            </div>
          )}

          {/* OBSERVACIONES */}
          {fieldTrip.observations && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600">
              <strong className="text-slate-800">Observaciones generales:</strong> {fieldTrip.observations}
            </div>
          )}

          {/* COORDINATION ACTIONS */}
          {isCoordinator && (
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Acción de Coordinación</span>
                <span className="text-xs text-slate-500">
                  Actualiza el visto bueno o marca la experiencia como ejecutada.
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {fieldTrip.status !== 'approved' && (
                  <button
                    onClick={() => updateFieldTripStatus(fieldTrip.id, 'approved')}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-600 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Aprobar salida
                  </button>
                )}
                {fieldTrip.status !== 'completed' && (
                  <button
                    onClick={() => updateFieldTripStatus(fieldTrip.id, 'completed')}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Marcar realizada
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-5 sm:px-7 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-xs font-bold text-danger-600 hover:bg-danger-50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(fieldTrip)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-primary-600" />
              <span>Editar registro</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
