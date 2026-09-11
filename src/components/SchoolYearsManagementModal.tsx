import React, { useState } from 'react';
import {
  X,
  Calendar,
  Plus,
  Star,
  Trash2,
  CheckCircle2,
  Info,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useEduPlan } from '../context/EduPlanContext';

interface SchoolYearsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolYearsManagementModal: React.FC<SchoolYearsManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    availableSchoolYears,
    defaultSchoolYear,
    setDefaultSchoolYear,
    addSchoolYear,
    deleteSchoolYear,
    addToast,
  } = useEduPlan();

  const [newYearInput, setNewYearInput] = useState('');
  const [deleteConfirmYear, setDeleteConfirmYear] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newYearInput.trim();
    if (!trimmed) {
      addToast('Por favor ingrese un nombre de año escolar (ej: 2027-2028).', 'warning');
      return;
    }
    // Simple format check (e.g. 2027-2028)
    const formatRegex = /^\d{4}[-–]\d{4}$/;
    if (!formatRegex.test(trimmed)) {
      addToast('El formato recomendado es YYYY-YYYY (ejemplo: 2027-2028).', 'info');
    }

    addSchoolYear(trimmed);
    setNewYearInput('');
  };

  const handleSetDefault = (year: string) => {
    setDefaultSchoolYear(year);
  };

  const handleDelete = (year: string) => {
    deleteSchoolYear(year);
    setDeleteConfirmYear(null);
  };

  // Helper to suggest next school year
  const getSuggestedYear = () => {
    if (availableSchoolYears.length === 0) return '2027-2028';
    const latest = availableSchoolYears[0];
    const parts = latest.split(/[-–]/);
    if (parts.length === 2) {
      const start = parseInt(parts[0], 10);
      const end = parseInt(parts[1], 10);
      if (!isNaN(start) && !isNaN(end)) {
        return `${start + 1}-${end + 1}`;
      }
    }
    return '2027-2028';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-transparent flex items-center justify-center p-4">
      <div
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Gestión de Años Escolares</h2>
              <p className="text-xs text-slate-500">Configuración global y año escolar predeterminado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Information Notice */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Año Predeterminado:</span> El año marcado con la estrella{' '}
              <Star className="w-3.5 h-3.5 text-amber-500 inline fill-amber-400" /> se cargará automáticamente
              para todos los usuarios al ingresar a la plataforma.
            </div>
          </div>

          {/* Form to Add New Year */}
          <form onSubmit={handleAddYear} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Crear Nuevo Año Escolar
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  placeholder={`Ej: ${getSuggestedYear()}`}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                {newYearInput === '' && (
                  <button
                    type="button"
                    onClick={() => setNewYearInput(getSuggestedYear())}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2 py-1 rounded-lg transition-colors"
                  >
                    + {getSuggestedYear()}
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir</span>
              </button>
            </div>
          </form>

          {/* List of School Years */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Años Escolares Registrados ({availableSchoolYears.length})
            </label>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {availableSchoolYears.map((year) => {
                const isDefault = year === defaultSchoolYear;
                return (
                  <div
                    key={year}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isDefault
                        ? 'bg-amber-50/60 border-amber-200 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDefault ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isDefault ? (
                          <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                        ) : (
                          <Calendar className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{year}</span>
                          {isDefault && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              <CheckCircle2 className="w-3 h-3 text-amber-600" />
                              Predeterminado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(year)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          title="Establecer como año escolar que cargará por defecto al ingresar"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Hacer Predeterminado</span>
                        </button>
                      ) : null}

                      {!isDefault && (
                        <>
                          {deleteConfirmYear === year ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                              <span className="text-[10px] font-bold text-red-700 px-1">¿Eliminar?</span>
                              <button
                                type="button"
                                onClick={() => handleDelete(year)}
                                className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded transition-colors"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmYear(null)}
                                className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-1 rounded transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmYear(year)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar año escolar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
