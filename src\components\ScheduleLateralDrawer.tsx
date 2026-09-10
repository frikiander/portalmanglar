import React, { useState } from 'react';
import {
  GripVertical,
  Layers,
  Inbox,
  Sparkles,
  Plus,
  Trash2,
  X,
  BookOpen,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  MoveRight
} from 'lucide-react';
import { ClassScheduleCell, SubjectCategory } from '../types';
import { CATEGORY_STYLES, detectSubjectCategory } from '../data/mockSchedules';
import { useEduPlan } from '../context/EduPlanContext';

export interface QuickPaletteItem {
  id: string;
  name: string;
  category: SubjectCategory;
  defaultRoom?: string;
}

export const INSTITUTIONAL_PALETTE_ITEMS: QuickPaletteItem[] = [
  { id: 'pal-mate', name: 'Matemática', category: 'matematica' },
  { id: 'pal-leng', name: 'Lenguaje y Comunicación', category: 'lengua' },
  { id: 'pal-cienc', name: 'Ciencias de la Naturaleza', category: 'ciencia' },
  { id: 'pal-soc', name: 'Ciencias Sociales', category: 'sociales' },
  { id: 'pal-ing', name: 'Inglés', category: 'ingles' },
  { id: 'pal-edfis', name: 'Educación Física / Deporte', category: 'deporte' },
  { id: 'pal-proy', name: 'Proyecto de Aula (IPC / DIEV)', category: 'proyecto' },
  { id: 'pal-rob', name: 'Robótica', category: 'especiales' },
  { id: 'pal-tec', name: 'Tecnología', category: 'especiales' },
  { id: 'pal-com', name: 'Computación', category: 'especiales' },
  { id: 'pal-mus', name: 'Música / Estudiantina', category: 'especiales' },
  { id: 'pal-art', name: 'Artes Plásticas', category: 'especiales' },
  { id: 'pal-lib', name: 'Libre / Estudio Dirigido', category: 'otro' },
];

interface ScheduleLateralDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  unassignedSubjects: ClassScheduleCell[];
  onRemoveUnassigned: (index: number) => void;
  onClearAllUnassigned: () => void;
  onDropToUnassigned: (cell: ClassScheduleCell) => void;
  onDragStartUnassigned: (cell: ClassScheduleCell, index: number) => void;
  onDragStartPalette: (subject: string, category: SubjectCategory, defaultRoom?: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  draggedItemDescription?: string;
  readOnly?: boolean;
}

export const ScheduleLateralDrawer: React.FC<ScheduleLateralDrawerProps> = ({
  isOpen,
  onToggle,
  unassignedSubjects,
  onRemoveUnassigned,
  onClearAllUnassigned,
  onDropToUnassigned,
  onDragStartUnassigned,
  onDragStartPalette,
  onDragEnd,
  isDragging,
  draggedItemDescription,
  readOnly = false,
}) => {
  const { subjects } = useEduPlan();
  const [isDropOverTray, setIsDropOverTray] = useState(false);
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const paletteItems: QuickPaletteItem[] = subjects.length > 0
    ? subjects.map((s) => ({
        id: `pal-${s.id}`,
        name: s.name,
        category: s.category,
      }))
    : INSTITUTIONAL_PALETTE_ITEMS;

  const handleTrayDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDropOverTray) setIsDropOverTray(true);
  };

  const handleTrayDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropOverTray(false);
  };

  const handleTrayDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropOverTray(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const payload = JSON.parse(dataStr);
        if (payload.type === 'cell' && payload.cell) {
          onDropToUnassigned(payload.cell);
        }
      }
    } catch (err) {
      console.error('Error dropping to unassigned tray:', err);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSubjectName.trim()) return;
    const cat = detectSubjectCategory(customSubjectName.trim());
    const newCell: ClassScheduleCell = {
      subject: customSubjectName.trim(),
      category: cat,
    };
    onDropToUnassigned(newCell);
    setCustomSubjectName('');
    setIsAddingCustom(false);
  };

  return (
    <>
      {/* Docked / Slide-out Container */}
      <aside
        className={`bg-white border-l border-slate-200 shadow-md flex flex-col transition-all duration-300 z-10 ${
          isOpen ? 'w-80 lg:w-88' : 'w-12'
        } shrink-0`}
      >
        {/* Header / Toggle Button */}
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          {isOpen ? (
            <>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#3A6B1F] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider truncate">
                    Panel de Asignaturas
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate">
                    Arrastra dentro y fuera del horario
                  </p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                title="Contraer panel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="w-full flex flex-col items-center justify-center py-2 text-slate-500 hover:text-emerald-700 transition-colors"
              title="Expandir barra lateral de asignaturas"
            >
              <ChevronLeft className="w-4 h-4 mb-2" />
              <span className="text-[10px] font-black uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
                Asignaturas & Bandeja
              </span>
              {unassignedSubjects.length > 0 && (
                <span className="mt-2 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {unassignedSubjects.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Content (Only rendered when expanded) */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-800">
            {/* Quick Info Hint */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-950 flex items-start space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#5EA832] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Interacción Drag & Drop:</span> Arrastra cualquier tarjeta a una celda para asignarla, entre celdas para intercambiar, o hacia la bandeja para sacarla del horario.
              </div>
            </div>

            {/* SECTION 1: BANDEJA DE ASIGNATURAS SIN ASIGNAR / DESPLAZADAS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Inbox className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Bandeja Sin Asignar
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    {unassignedSubjects.length}
                  </span>
                </div>
                {unassignedSubjects.length > 0 && !readOnly && (
                  <button
                    onClick={onClearAllUnassigned}
                    className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {/* Drop Target Area for Unassigning */}
              <div
                onDragOver={handleTrayDragOver}
                onDragLeave={handleTrayDragLeave}
                onDrop={handleTrayDrop}
                className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                  isDropOverTray
                    ? 'border-emerald-500 bg-emerald-100/70 scale-[1.02] shadow-md ring-2 ring-emerald-400'
                    : isDragging
                    ? 'border-amber-400 bg-amber-50/70 text-amber-900 animate-pulse'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center text-slate-500 pointer-events-none py-1">
                  <Inbox className={`w-5 h-5 mb-1 ${isDropOverTray ? 'text-emerald-700' : isDragging ? 'text-amber-600' : 'text-slate-400'}`} />
                  <p className="text-[11px] font-bold text-slate-700 leading-tight">
                    {isDropOverTray
                      ? '¡Suelta para mover a la bandeja!'
                      : isDragging
                      ? 'Suelta aquí para sacar del horario'
                      : 'Arrastra una materia aquí para desasignarla'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Se guardará aquí para reubicarla cuando desees
                  </p>
                </div>
              </div>

              {/* Items in the Unassigned Tray */}
              {unassignedSubjects.length > 0 && (
                <div className="space-y-2 mt-2 max-h-56 overflow-y-auto pr-1">
                  {unassignedSubjects.map((item, idx) => {
                    const catStyle = CATEGORY_STYLES[item.category || 'otro'] || CATEGORY_STYLES.otro;
                    return (
                      <div
                        key={idx}
                        draggable={!readOnly}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({ type: 'unassigned', index: idx, cell: item })
                          );
                          e.dataTransfer.effectAllowed = 'move';
                          onDragStartUnassigned(item, idx);
                        }}
                        onDragEnd={onDragEnd}
                        className={`p-2.5 rounded-xl border flex items-center justify-between group transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-sm ${catStyle.bg} ${catStyle.border}`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-slate-600" />
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 truncate">
                              {item.subject}
                            </div>
                            {(item.classroom || item.teacherName) && (
                              <div className="text-[10px] text-slate-600 truncate">
                                {item.classroom && <span>{item.classroom}</span>}
                                {item.classroom && item.teacherName && <span> · </span>}
                                {item.teacherName && <span>{item.teacherName}</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        {!readOnly && (
                          <button
                            onClick={() => onRemoveUnassigned(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors shrink-0"
                            title="Eliminar de la bandeja"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <hr className="border-slate-200" />

            {/* SECTION 2: BANCO DE ASIGNATURAS RÁPIDAS INSTITUCIONALES */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-[#3A6B1F]" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Banco de Asignaturas
                  </span>
                </div>
                <button
                  onClick={() => setIsAddingCustom(!isAddingCustom)}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Personalizada</span>
                </button>
              </div>

              {/* Form to add custom subject */}
              {isAddingCustom && (
                <form onSubmit={handleAddCustomSubject} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <input
                    type="text"
                    placeholder="Nombre de la asignatura..."
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-white"
                    autoFocus
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(false)}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!customSubjectName.trim()}
                      className="text-[10px] font-bold px-2 py-1 bg-[#5EA832] text-white rounded-md disabled:opacity-50"
                    >
                      Añadir a Bandeja
                    </button>
                  </div>
                </form>
              )}

              <p className="text-[11px] text-slate-500 leading-tight">
                Arrastra cualquier asignatura directamente a una casilla de la tabla semanal:
              </p>

              {/* List of Draggable Institutional Subject Chips */}
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {paletteItems.map((item) => {
                  const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.otro;
                  return (
                    <div
                      key={item.id}
                      draggable={!readOnly}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            type: 'palette',
                            subject: item.name,
                            category: item.category,
                            defaultRoom: item.defaultRoom,
                          })
                        );
                        e.dataTransfer.effectAllowed = 'copy';
                        onDragStartPalette(item.name, item.category, item.defaultRoom);
                      }}
                      onDragEnd={onDragEnd}
                      className={`p-2 rounded-xl border flex items-center justify-between group cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01] hover:shadow-xs select-none ${catStyle.bg} ${catStyle.border}`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                        <span className={`text-xs font-bold truncate ${catStyle.text}`}>
                          {item.name}
                        </span>
                      </div>
                      <MoveRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
