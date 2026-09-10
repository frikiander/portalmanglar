import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Clock, MapPin, User, Tag, AlertCircle } from 'lucide-react';
import { ClassScheduleCell, ScheduleDay, SubjectCategory } from '../types';
import { CATEGORY_STYLES, COMMON_SUBJECT_SUGGESTIONS, detectSubjectCategory } from '../data/mockSchedules';
import { useEduPlan } from '../context/EduPlanContext';

interface ScheduleCellModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: ScheduleDay;
  timeSlot: string;
  grade: string;
  weekNumber: number;
  lapso: string;
  initialCell?: ClassScheduleCell;
  onSave: (cell: ClassScheduleCell) => void;
  onClear: () => void;
  readOnly?: boolean;
}

export const ScheduleCellModal: React.FC<ScheduleCellModalProps> = ({
  isOpen,
  onClose,
  day,
  timeSlot,
  grade,
  weekNumber,
  lapso,
  initialCell,
  onSave,
  onClear,
  readOnly = false,
}) => {
  const { subjects } = useEduPlan();
  const [subject, setSubject] = useState(initialCell?.subject || '');
  const [category, setCategory] = useState<SubjectCategory>(
    initialCell?.category || 'otro'
  );
  const [classroom, setClassroom] = useState(initialCell?.classroom || initialCell?.room || '');
  const [teacherName, setTeacherName] = useState(initialCell?.teacherName || initialCell?.teacher || '');
  const [variationNote, setVariationNote] = useState(initialCell?.variationNote || initialCell?.note || '');
  const [hasVariation, setHasVariation] = useState(initialCell?.hasVariation || initialCell?.isVariation || false);

  useEffect(() => {
    if (initialCell) {
      setSubject(initialCell.subject || '');
      setCategory(initialCell.category || detectSubjectCategory(initialCell.subject));
      setClassroom(initialCell.classroom || initialCell.room || '');
      setTeacherName(initialCell.teacherName || initialCell.teacher || '');
      setVariationNote(initialCell.variationNote || initialCell.note || '');
      setHasVariation(Boolean(initialCell.hasVariation || initialCell.isVariation || initialCell.variationNote || initialCell.note));
    } else {
      setSubject('');
      setCategory('otro');
      setClassroom('');
      setTeacherName('');
      setVariationNote('');
      setHasVariation(false);
    }
  }, [initialCell, isOpen]);

  if (!isOpen) return null;

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    const detected = detectSubjectCategory(val);
    setCategory(detected);
  };

  const handleSelectPredefined = (subj: string) => {
    setSubject(subj);
    const detected = detectSubjectCategory(subj);
    setCategory(detected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      onClear();
      onClose();
      return;
    }

    const updatedCell: ClassScheduleCell = {
      subject: subject.trim(),
      category: category || detectSubjectCategory(subject),
      classroom: classroom.trim() || undefined,
      teacherName: teacherName.trim() || undefined,
      variationNote: variationNote.trim() || undefined,
      hasVariation: hasVariation || Boolean(variationNote.trim()),
    };

    onSave(updatedCell);
    onClose();
  };

  const currentCategoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.otro;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div 
        id="schedule-cell-modal-container"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                Editar Bloque de Clase
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-300">
                {grade}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {day} · {timeSlot}
            </h3>
            <p className="text-xs text-slate-300">
              {lapso} — Semana {weekNumber}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Predefined Subjects */}
          {!readOnly && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Sugerencias Rápidas de Asignatura:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {(subjects.length > 0 ? subjects.map((s) => s.name) : COMMON_SUBJECT_SUGGESTIONS).map((s) => {
                  const cat = detectSubjectCategory(s);
                  const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.otro;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSelectPredefined(s)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        subject.toLowerCase() === s.toLowerCase()
                          ? 'ring-2 ring-indigo-500 font-bold shadow-xs'
                          : 'hover:opacity-80'
                      } ${style.bg} ${style.border} ${style.text}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subject Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Nombre de la Asignatura / Actividad *
            </label>
            <input
              type="text"
              required
              disabled={readOnly}
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              placeholder="Ej. MATEMÁTICA, LENGUAJE, INGLÉS..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold text-slate-800 disabled:bg-slate-100"
            />
          </div>

          {/* Category & Visual Color Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría y Color Temático
              </label>
              <select
                value={category}
                disabled={readOnly}
                onChange={(e) => setCategory(e.target.value as SubjectCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="matematica">Matemática (Azul Cielo)</option>
                <option value="lengua">Lengua / Literatura (Rosa Suave)</option>
                <option value="ingles">Inglés (Lavanda / Violeta)</option>
                <option value="ciencia">Ciencias Naturales (Verde Lima)</option>
                <option value="sociales">Ciencias Sociales (Naranja)</option>
                <option value="deporte">Educación Física / Deporte (Ámbar / Oro)</option>
                <option value="especiales">Especiales (Música, Arte, Robótica, etc.)</option>
                <option value="proyecto">Proyecto de Aula (Índigo)</option>
                <option value="rutina">Rutina / Lectura (Crema / Amarillo)</option>
                <option value="recreo">Recreo / Almuerzo</option>
                <option value="otro">General / Otra Asignatura</option>
              </select>
            </div>

            {/* Live Card Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vista Previa de la Tarjeta
              </label>
              <div
                className={`p-2.5 rounded-xl border ${currentCategoryStyle.bg} ${currentCategoryStyle.border} ${currentCategoryStyle.text} text-center shadow-2xs`}
              >
                <div className="font-bold text-xs truncate">
                  {subject || 'Nombre de Asignatura'}
                </div>
                <div className="text-[10px] opacity-80 truncate">
                  {classroom || 'Aula / Espacio'} · {teacherName || 'Docente'}
                </div>
              </div>
            </div>
          </div>

          {/* Classroom and Teacher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Aula / Espacio</span>
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="Ej. Aula 1A, Cancha, Laboratorio..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Docente Responsable</span>
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Ej. Prof. Andrea, Prof. Carlos..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Weekly Variation / Seguimiento de Cambios */}
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Variación Especial para esta Semana</span>
              </label>
              <input
                type="checkbox"
                disabled={readOnly}
                checked={hasVariation}
                onChange={(e) => setHasVariation(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
            </div>
            <p className="text-[11px] text-amber-700">
              Marca si en la <strong>Semana {weekNumber}</strong> este bloque tendrá un cambio temporal, evaluación o actividad especial frente al horario regular.
            </p>
            {hasVariation && (
              <input
                type="text"
                disabled={readOnly}
                value={variationNote}
                onChange={(e) => setVariationNote(e.target.value)}
                placeholder="Ej. Prueba corta de fracciones / Cambio de bloque con Robótica..."
                className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-4">
            {!readOnly && initialCell?.subject ? (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  onClose();
                }}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Celda</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                {readOnly ? 'Cerrar' : 'Cancelar'}
              </button>
              {!readOnly && (
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Bloque</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
