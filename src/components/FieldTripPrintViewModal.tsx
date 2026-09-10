import React from 'react';
import { X, Printer, Download, CheckCircle2, Bus, Sparkles } from 'lucide-react';
import { FieldTrip } from '../types';

interface Props {
  fieldTrip: FieldTrip;
  onClose: () => void;
}

export const FieldTripPrintViewModal: React.FC<Props> = ({ fieldTrip, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* TOP BAR ACTIONS */}
        <div className="px-6 py-3.5 bg-slate-800 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Vista Previa de Impresión - Planilla Oficial
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#5EA832] hover:bg-[#498925] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-900 bg-white print:p-0 print:m-0 space-y-6 text-xs sm:text-sm leading-normal">
          
          {/* INSTITUTIONAL HEADER */}
          <div className="border-b-2 border-[#285A14] pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-[#285A14] flex items-center justify-center text-white font-black text-xl">
                M
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#285A14] uppercase">
                  Colegio Integral El Manglar
                </h1>
                <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
                  Coordinación Pedagógica de Primaria • Año Escolar 2025-2026
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-black text-[#285A14] uppercase">
                {fieldTrip.type === 'salida_campo' ? 'Ficha de Salida de Campo' : 'Ficha de Invitado Especial'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Cód. {fieldTrip.id}</p>
            </div>
          </div>

          {/* TITLE & BASIC INFO */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Grado / Asignatura</span>
              <span className="text-sm font-black text-slate-900">{fieldTrip.grade}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Lapso / Semana</span>
              <span className="text-sm font-black text-slate-900">{fieldTrip.lapsoSemanaLabel || `${fieldTrip.lapso} Sem ${fieldTrip.weekNumber}`}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Fecha Prevista</span>
              <span className="text-sm font-black text-slate-900">{fieldTrip.date}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Estado</span>
              <span className="text-xs font-bold text-[#3A6B1F] uppercase">{fieldTrip.status}</span>
            </div>
          </div>

          {/* ANTES DEL PASEO O INVITADO */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#285A14] border-b border-slate-200 pb-1">
              1. Planificación Inicial: {fieldTrip.type === 'salida_campo' ? 'Destino y Logística' : 'Invitado y Contacto'}
            </h3>
            
            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="w-1/3 bg-slate-100/70 p-2.5 font-bold text-slate-700">
                    {fieldTrip.type === 'salida_campo' ? 'Destino de la Visita:' : 'Nombre del Invitado:'}
                  </td>
                  <td className="p-2.5 font-black text-slate-900">{fieldTrip.destinationOrGuest}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-100/70 p-2.5 font-bold text-slate-700">Alianza / Contacto:</td>
                  <td className="p-2.5 text-slate-800">
                    {fieldTrip.allianceName || fieldTrip.alliancesOrContacts || 'N/A'}
                    {fieldTrip.contactPhone ? ` (Tlf: ${fieldTrip.contactPhone})` : ''}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-100/70 p-2.5 font-bold text-slate-700">Contexto del proyecto:</td>
                  <td className="p-2.5 text-slate-800">{fieldTrip.subjectOrContext || 'Proyecto de Aula'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-100/70 p-2.5 font-bold text-slate-700">Tema / Propósito Pedagógico:</td>
                  <td className="p-2.5 text-slate-800 leading-relaxed">{fieldTrip.purpose || 'Sin especificar'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-100/70 p-2.5 font-bold text-slate-700">Docente Responsable:</td>
                  <td className="p-2.5 text-slate-800">{fieldTrip.responsibleTeacher}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="bg-slate-100/70 p-2.5 font-bold text-slate-700">Docentes Acompañantes:</td>
                  <td className="p-2.5 text-slate-800">{fieldTrip.chaperoneTeachers || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="bg-slate-100/70 p-2.5 font-bold text-slate-700">Recursos Requeridos:</td>
                  <td className="p-2.5 text-slate-800">
                    {fieldTrip.resources || 'N/A'}
                    {fieldTrip.transportRequired ? ' (Incluye Transporte Institucional)' : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ENFOQUES RELACIONADOS */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#285A14] border-b border-slate-200 pb-1">
              2. Enfoques Relacionados (Pilares Institucionales El Manglar)
            </h3>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { label: 'Responsabilidad Social', checked: fieldTrip.focus.socialResponsibility },
                { label: 'Participación Ciudadana', checked: fieldTrip.focus.citizenParticipation },
                { label: 'Identidad Nacional', checked: fieldTrip.focus.nationalIdentity },
                { label: 'Introspección', checked: fieldTrip.focus.introspection },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-center font-bold text-[11px] ${
                    item.checked
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-black'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="mr-1">{item.checked ? '[X]' : '[ ]'}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* METODOLOGÍA (¿CÓMO?) */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#285A14] border-b border-slate-200 pb-1">
              3. ¿CÓMO? (Metodología Vivencial de la Experiencia)
            </h3>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 whitespace-pre-line">
              {fieldTrip.methodology || 'No registrada.'}
            </div>
          </div>

          {/* APRENDIZAJES CLAVE */}
          {fieldTrip.keyLearnings && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#285A14] border-b border-slate-200 pb-1">
                4. Aprendizajes Clave
              </h3>
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs leading-relaxed text-slate-800">
                {fieldTrip.keyLearnings}
              </div>
            </div>
          )}

          {/* SIGNATURES SECTION */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-8 text-center text-xs">
            <div className="space-y-2">
              <div className="h-16 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="text-[10px] text-slate-400 italic">Firma del Docente</span>
              </div>
              <p className="font-bold text-slate-800">{fieldTrip.responsibleTeacher}</p>
              <p className="text-[10px] text-slate-500">Docente Responsable</p>
            </div>

            <div className="space-y-2">
              <div className="h-16 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="text-[10px] text-slate-400 italic">Firma de Coordinación</span>
              </div>
              <p className="font-bold text-slate-800">Lic. Elena Rivas</p>
              <p className="text-[10px] text-slate-500">Coordinación Pedagógica</p>
            </div>

            <div className="space-y-2">
              <div className="h-16 border-b border-slate-400 flex items-end justify-center pb-1">
                <span className="text-[10px] text-slate-400 italic">Visto Bueno</span>
              </div>
              <p className="font-bold text-slate-800">Dirección General</p>
              <p className="text-[10px] text-slate-500">Colegio Integral El Manglar</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
