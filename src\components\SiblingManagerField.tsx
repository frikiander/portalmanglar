import React, { useState, useMemo } from 'react';
import { Users, Plus, X, Copy, Check, Info, UserCheck, ChevronDown, Sparkles } from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';
import { Student } from '../types';
import { SCHOOL_GRADES } from '../data/mockRoster';

interface ParentsData {
  motherName?: string;
  motherPhone?: string;
  motherEmail?: string;
  motherId?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  fatherId?: string;
  homeOfficePhone?: string;
}

interface Props {
  currentStudentId?: string;
  currentGrade?: string;
  siblingsValue: string;
  onChangeSiblings: (val: string) => void;
  onAutofillParents?: (parents: ParentsData) => void;
}

export const SiblingManagerField: React.FC<Props> = ({
  currentStudentId,
  siblingsValue,
  onChangeSiblings,
  onAutofillParents,
}) => {
  const { students, addToast, availableGradeNames } = useEduPlan();

  const displayGrades = availableGradeNames?.length > 0 ? availableGradeNames : SCHOOL_GRADES;

  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>('');
  const [lastCopiedSibling, setLastCopiedSibling] = useState<string | null>(null);

  // Parse existing siblings into individual tokens
  const currentSiblingsList = useMemo(() => {
    if (!siblingsValue || !siblingsValue.trim()) return [];
    return siblingsValue
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [siblingsValue]);

  // Students in selected grade (excluding current student being edited)
  const studentsInGrade = useMemo(() => {
    if (!selectedGrade) return [];
    return students
      .filter((s) => s.grade === selectedGrade && s.id !== currentStudentId)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [students, selectedGrade, currentStudentId]);

  // Handle adding an existing enrolled student as sibling
  const handleAddEnrolledStudent = () => {
    if (!selectedStudentId) {
      addToast('Por favor selecciona un estudiante de la lista.', 'warning');
      return;
    }

    const studentToAdd = students.find((s) => s.id === selectedStudentId);
    if (!studentToAdd) return;

    // Formatted label: "Apellidos Nombres (Grado)"
    const label = `${studentToAdd.fullName} (${studentToAdd.grade})`;

    // Prevent duplicates
    if (currentSiblingsList.some((s) => s.toLowerCase().includes(studentToAdd.fullName.toLowerCase()))) {
      addToast('Este estudiante ya está vinculado como hermano.', 'info');
      return;
    }

    const updated = [...currentSiblingsList, label].join('; ');
    onChangeSiblings(updated);

    // If parents data is available in the sibling, offer or autofill
    if (onAutofillParents && (studentToAdd.motherName || studentToAdd.fatherName)) {
      onAutofillParents({
        motherName: studentToAdd.motherName,
        motherPhone: studentToAdd.motherPhone,
        motherEmail: studentToAdd.motherEmail,
        motherId: studentToAdd.motherId,
        fatherName: studentToAdd.fatherName,
        fatherPhone: studentToAdd.fatherPhone,
        fatherEmail: studentToAdd.fatherEmail,
        fatherId: studentToAdd.fatherId,
        homeOfficePhone: studentToAdd.homeOfficePhone,
      });
      addToast(
        `Hermano vinculado. Datos de los padres sincronizados automáticamente con los de ${studentToAdd.fullName.split(' ')[0]}.`,
        'success'
      );
    } else {
      addToast(`Hermano(a) ${studentToAdd.fullName} vinculado correctamente.`, 'success');
    }

    setSelectedStudentId('');
  };

  // Handle adding manual sibling entry (e.g. "PREMATERNAL", "Graduado")
  const handleAddManual = () => {
    if (!manualText.trim()) return;
    const label = manualText.trim();
    if (currentSiblingsList.includes(label)) return;

    const updated = [...currentSiblingsList, label].join('; ');
    onChangeSiblings(updated);
    setManualText('');
    setShowManualInput(false);
    addToast('Hermano registrado.', 'success');
  };

  // Remove a sibling item
  const handleRemoveSibling = (indexToRemove: number) => {
    const updatedList = currentSiblingsList.filter((_, idx) => idx !== indexToRemove);
    onChangeSiblings(updatedList.join('; '));
    addToast('Hermano desvinculado.', 'info');
  };

  // Sibling student lookup to allow copying parent data on demand
  const findStudentMatch = (siblingText: string): Student | undefined => {
    return students.find((s) => siblingText.toLowerCase().includes(s.fullName.toLowerCase()));
  };

  const handleCopyParentsFromSibling = (siblingText: string) => {
    const matched = findStudentMatch(siblingText);
    if (!matched || !onAutofillParents) {
      addToast('No se encontró el registro escolar completo de este hermano para copiar datos.', 'info');
      return;
    }

    onAutofillParents({
      motherName: matched.motherName,
      motherPhone: matched.motherPhone,
      motherEmail: matched.motherEmail,
      motherId: matched.motherId,
      fatherName: matched.fatherName,
      fatherPhone: matched.fatherPhone,
      fatherEmail: matched.fatherEmail,
      fatherId: matched.fatherId,
      homeOfficePhone: matched.homeOfficePhone,
    });

    setLastCopiedSibling(siblingText);
    setTimeout(() => setLastCopiedSibling(null), 3000);
    addToast(`Datos de los representantes copiados desde el expediente de ${matched.fullName}.`, 'success');
  };

  return (
    <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#5EA832]" />
          Hermanos en el Colegio
        </label>

        {currentSiblingsList.length > 0 && (
          <span className="text-[11px] font-semibold text-slate-500">
            {currentSiblingsList.length} {currentSiblingsList.length === 1 ? 'hermano vinculado' : 'hermanos vinculados'}
          </span>
        )}
      </div>

      {/* Chips / Cards de Hermanos Vinculados */}
      {currentSiblingsList.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {currentSiblingsList.map((sib, index) => {
            const matchedStudent = findStudentMatch(sib);
            const isCopied = lastCopiedSibling === sib;

            return (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 shadow-2xs group"
              >
                <div className="w-2 h-2 rounded-full bg-[#5EA832]" />
                <span className="font-semibold text-slate-900">{sib}</span>

                {/* Botón de Sincronizar Representantes si está disponible */}
                {matchedStudent && onAutofillParents && (
                  <button
                    type="button"
                    onClick={() => handleCopyParentsFromSibling(sib)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-[#3A6B1F] bg-white hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer ml-1"
                    title="Autocompletar teléfono, cédula y nombres de los padres con los datos de este hermano"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? '¡Sincronizado!' : 'Copiar Padres'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveSibling(index)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Desvincular hermano"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 italic">
          Sin hermanos vinculados actualmente. Selecciona el grado y el alumno a continuación:
        </p>
      )}

      {/* Selector Interactivo: Grado -> Estudiante */}
      <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          {/* 1. Selector de Grado */}
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              1. Grado / Salón del Hermano
            </label>
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedStudentId('');
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden appearance-none pr-7 cursor-pointer"
              >
                <option value="">-- Seleccionar Grado --</option>
                {displayGrades.map((grade) => {
                  const count = students.filter(
                    (s) => s.grade === grade && s.id !== currentStudentId
                  ).length;
                  return (
                    <option key={grade} value={grade}>
                      {grade} {count > 0 ? `(${count} alumnos)` : '(0 alumnos)'}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. Selector de Estudiante de ese Salón */}
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              2. Estudiante de ese Salón
            </label>
            <div className="relative">
              <select
                disabled={!selectedGrade || studentsInGrade.length === 0}
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden appearance-none pr-7 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
              >
                <option value="">
                  {!selectedGrade
                    ? 'Primero elige el grado...'
                    : studentsInGrade.length === 0
                    ? 'Sin alumnos en este grado'
                    : '-- Seleccionar Alumno(a) --'}
                </option>
                {studentsInGrade.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} {s.schoolId ? `(C.I. ${s.schoolId})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Botón de Vincular */}
          <div className="sm:col-span-2 flex items-end">
            <button
              type="button"
              disabled={!selectedStudentId}
              onClick={handleAddEnrolledStudent}
              className="w-full py-1.5 px-3 text-xs font-bold text-white bg-[#5EA832] hover:bg-[#498925] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              title="Vincular este hermano y autocompletar representantes"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Vincular</span>
            </button>
          </div>
        </div>

        {/* Opción alternativa para ingresar texto manual si está en maternal externo o egresado */}
        <div className="pt-1 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-slate-500 hover:text-[#3A6B1F] font-semibold underline underline-offset-2 cursor-pointer flex items-center gap-1"
          >
            <span>{showManualInput ? 'Cerrar ingreso manual' : '+ ¿Hermano en nivel no matriculado o egresado? (Texto manual)'}</span>
          </button>
          <span className="text-[10px] text-slate-400">
            Al vincular, se copian los datos de los padres automáticamente
          </span>
        </div>

        {showManualInput && (
          <div className="flex items-center gap-2 pt-1 animate-fadeIn">
            <input
              type="text"
              placeholder="ej. 3er Grado, PREMATERNAL, Egresado Promo XXIV..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddManual();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5EA832] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddManual}
              disabled={!manualText.trim()}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Agregar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
