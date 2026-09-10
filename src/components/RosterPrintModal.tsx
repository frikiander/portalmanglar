import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Student } from '../types';
import { ManglarEmblem } from './ManglarLogo';

interface Props {
  grade: string;
  students: Student[];
  onClose: () => void;
}

export const RosterPrintModal: React.FC<Props> = ({ grade, students, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'N°',
      'Apellidos y Nombres',
      'Cédula Escolar',
      'Fecha Nac.',
      'Condición',
      'Hermanos',
      'Madre',
      'C.I. Madre',
      'Móvil Madre',
      'Email Madre',
      'Padre',
      'C.I. Padre',
      'Móvil Padre',
      'Email Padre',
      'Habitación/Oficina',
      'Correo Alumno',
      'Canvas Aceptado',
      'Observaciones Canvas',
      'Grupo Sociograma',
    ];

    const rows = students.map((s) => [
      s.orderNumber,
      `"${s.fullName}"`,
      `"${s.schoolId}"`,
      `"${s.birthDate || ''}"`,
      `"${s.condition}"`,
      `"${s.siblings || ''}"`,
      `"${s.motherName || ''}"`,
      `"${s.motherId || ''}"`,
      `"${s.motherPhone || ''}"`,
      `"${s.motherEmail || ''}"`,
      `"${s.fatherName || ''}"`,
      `"${s.fatherId || ''}"`,
      `"${s.fatherPhone || ''}"`,
      `"${s.fatherEmail || ''}"`,
      `"${s.homeOfficePhone || ''}"`,
      `"${s.email || ''}"`,
      s.canvasAccepted ? 'SI' : 'NO',
      `"${s.canvasObservations || ''}"`,
      `"${s.sociogramGroup || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nomina_Manglar_${grade.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <Printer className="w-5 h-5 text-[#FACD00]" />
            <span className="text-sm font-bold">Vista Preliminar de Impresión / Nómina Oficial</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel (CSV)</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5EA832] hover:bg-[#498925] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Nómina</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible flex-1 bg-white text-slate-900 font-sans">
          {/* Institutional Header */}
          <div className="border-b-2 border-emerald-800 pb-4 mb-5 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs flex items-center justify-center">
                <ManglarEmblem className="w-full h-full" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5EA832] block">
                  República Bolivariana de Venezuela · MPPE
                </span>
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  COLEGIO INTEGRAL EL MANGLAR
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Coordinación de Control de Estudios y Evaluación · Portal Manglar
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                <span className="text-xs font-black text-emerald-900 block">{grade}</span>
                <span className="text-[10px] font-bold text-emerald-700">Año Escolar 2025 - 2026</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Matrícula Activa: <strong>{students.length} Estudiantes</strong>
              </span>
            </div>
          </div>

          <div className="text-center my-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Nómina General de Estudiantes
            </h2>
            <p className="text-[11px] text-slate-500">
              Documento administrativo oficial de verificación de matrícula y estatus escolar
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="py-2 px-2 text-center w-8 border-r border-slate-300">N°</th>
                  <th className="py-2 px-3 text-left border-r border-slate-300">Apellidos y Nombres</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">C.E. / C.I.</th>
                  <th className="py-2 px-2 text-center border-r border-slate-300">Condición</th>
                  <th className="py-2 px-2 text-left border-r border-slate-300">Representante Madre</th>
                  <th className="py-2 px-2 text-left border-r border-slate-300">Representante Padre</th>
                  <th className="py-2 px-2 text-center">Canvas LMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student, idx) => (
                  <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-1.5 px-2 text-center font-bold text-slate-700 border-r border-slate-200">
                      {student.orderNumber}
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                      {student.fullName}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono text-slate-700 border-r border-slate-200">
                      {student.schoolId}
                    </td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-200">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        student.condition === 'NUEVO'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                          : 'text-slate-600'
                      }`}>
                        {student.condition}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-slate-700">
                      <div className="font-medium truncate max-w-[140px]" title={student.motherName}>
                        {student.motherName || '-'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {student.motherPhone || ''}
                      </div>
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-200 text-slate-700">
                      <div className="font-medium truncate max-w-[140px]" title={student.fatherName}>
                        {student.fatherName || '-'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {student.fatherPhone && student.fatherPhone !== 'n/a' ? student.fatherPhone : ''}
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        student.canvasAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {student.canvasAccepted ? 'Aceptado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures Footer */}
          <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 w-40 mx-auto mb-2"></div>
              <p className="font-bold text-slate-800">Docente Titular de Aula</p>
              <p className="text-[10px] text-slate-500">Colegio Integral El Manglar</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-40 mx-auto mb-2"></div>
              <p className="font-bold text-slate-800">Coordinación Pedagógica</p>
              <p className="text-[10px] text-slate-500">Control de Estudios y Evaluación</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-40 mx-auto mb-2"></div>
              <p className="font-bold text-slate-800">Dirección General</p>
              <p className="text-[10px] text-slate-500">Colegio Integral El Manglar</p>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400">
            Emitido a través de Portal Manglar · Fecha de impresión: {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};
