import React from 'react';
import { Award, CheckCircle2, AlertCircle, FileSpreadsheet, ArrowRight, Eye } from 'lucide-react';
import { EvaluationRecord, EvaluationMoment, GradeScale, Student } from '../types';
import { GRADE_SCALE_CONFIG } from '../data/mockEvaluations';
import { getGradeLeftAccentStyle, GradeBadge } from '../utils/gradeColors';

interface EvaluationLapsoMatrixProps {
  schoolYear: string;
  grade: string;
  subject: string;
  lapso: '1er Lapso' | '2do Lapso' | '3er Lapso';
  students: Student[];
  allEvaluations: EvaluationRecord[];
  onSelectMoment: (moment: EvaluationMoment) => void;
}

export const EvaluationLapsoMatrix: React.FC<EvaluationLapsoMatrixProps> = ({
  schoolYear,
  grade,
  subject,
  lapso,
  students,
  allEvaluations,
  onSelectMoment,
}) => {
  // Find evaluations for each moment in this grade, subject, lapso, schoolYear
  const getEvalForMoment = (moment: EvaluationMoment) => {
    return allEvaluations.find(
      (e) =>
        e.schoolYear === schoolYear &&
        e.grade.toLowerCase().trim() === grade.toLowerCase().trim() &&
        e.subject === subject &&
        e.lapso === lapso &&
        e.moment === moment
    );
  };

  const evalM1 = getEvalForMoment('mensual_1');
  const evalM2 = getEvalForMoment('mensual_2');
  const evalM3 = getEvalForMoment('mensual_3');
  const evalExamen = getEvalForMoment('examen_lapso');

  const moments: { id: EvaluationMoment; label: string; record?: EvaluationRecord }[] = [
    { id: 'mensual_1', label: 'Mensual I (25%)', record: evalM1 },
    { id: 'mensual_2', label: 'Mensual II (25%)', record: evalM2 },
    { id: 'mensual_3', label: 'Mensual III (25%)', record: evalM3 },
    { id: 'examen_lapso', label: 'Examen de Lapso (25%)', record: evalExamen },
  ];

  // Helper to calculate estimated global achievement
  const calculateGlobalGrade = (grades: (GradeScale | undefined)[]): GradeScale | '-' => {
    const validGrades = grades.filter((g): g is GradeScale => !!g && g !== 'SE');
    if (validGrades.length === 0) return '-';

    const points: Record<GradeScale, number> = {
      A: 20,
      B: 17,
      C: 14,
      D: 11,
      E: 5,
      SE: 0,
    };

    const sum = validGrades.reduce((acc, g) => acc + points[g], 0);
    const avg = sum / validGrades.length;

    if (avg >= 18.5) return 'A';
    if (avg >= 15.5) return 'B';
    if (avg >= 12.5) return 'C';
    if (avg >= 9.5) return 'D';
    return 'E';
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
      style={getGradeLeftAccentStyle(grade, 6)}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#285A14]" />
            <h3 className="text-base font-bold text-slate-900">
              Matriz Consolidada de Evaluaciones · {lapso}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <GradeBadge grade={grade} size="xs" showDot />
            <span className="text-xs text-slate-500">
              · {subject} · Año Escolar {schoolYear} · Resumen integral de los 4 momentos evaluativos
            </span>
          </div>
        </div>

        {/* Momento quick cards */}
        <div className="flex items-center gap-2 flex-wrap">
          {moments.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMoment(m.id)}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 shadow-2xs"
            >
              <span>{m.label.split(' ')[0]}</span>
              {m.record?.status === 'audited' ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Auditado" />
              ) : m.record?.status === 'submitted' ? (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Consolidado" />
              ) : m.record ? (
                <span className="w-2 h-2 rounded-full bg-slate-400" title="Borrador" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-200" title="Sin iniciar" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <th className="py-3 px-3 w-10 text-center font-bold">N°</th>
              <th className="py-3 px-3 min-w-[200px] font-bold text-slate-900">Estudiante</th>
              <th className="py-3 px-3 w-28 text-center font-semibold bg-emerald-50/20">
                Mensual I
              </th>
              <th className="py-3 px-3 w-28 text-center font-semibold bg-sky-50/20">
                Mensual II
              </th>
              <th className="py-3 px-3 w-28 text-center font-semibold bg-indigo-50/20">
                Mensual III
              </th>
              <th className="py-3 px-3 w-28 text-center font-semibold bg-amber-50/20">
                Examen Lapso
              </th>
              <th className="py-3 px-3 w-32 text-center font-black text-[#285A14] bg-[#285A14]/5">
                Logro Estimado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No hay estudiantes inscritos en este grado.
                </td>
              </tr>
            ) : (
              students.map((st, idx) => {
                const g1 = evalM1?.grades.find((g) => g.studentId === st.id);
                const g2 = evalM2?.grades.find((g) => g.studentId === st.id);
                const g3 = evalM3?.grades.find((g) => g.studentId === st.id);
                const gEx = evalExamen?.grades.find((g) => g.studentId === st.id);

                const globalGrade = calculateGlobalGrade([
                  g1?.gradeValue,
                  g2?.gradeValue,
                  g3?.gradeValue,
                  gEx?.gradeValue,
                ]);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      {st.orderNumber || idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div>{st.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{st.schoolId}</div>
                    </td>

                    {/* M1 */}
                    <td className="py-2.5 px-3 text-center bg-emerald-50/10">
                      {g1?.gradeValue ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded font-black text-xs border ${
                            GRADE_SCALE_CONFIG[g1.gradeValue]?.bgBadge || 'bg-slate-100'
                          }`}
                        >
                          {g1.gradeValue}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* M2 */}
                    <td className="py-2.5 px-3 text-center bg-sky-50/10">
                      {g2?.gradeValue ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded font-black text-xs border ${
                            GRADE_SCALE_CONFIG[g2.gradeValue]?.bgBadge || 'bg-slate-100'
                          }`}
                        >
                          {g2.gradeValue}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* M3 */}
                    <td className="py-2.5 px-3 text-center bg-indigo-50/10">
                      {g3?.gradeValue ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded font-black text-xs border ${
                            GRADE_SCALE_CONFIG[g3.gradeValue]?.bgBadge || 'bg-slate-100'
                          }`}
                        >
                          {g3.gradeValue}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Examen de Lapso */}
                    <td className="py-2.5 px-3 text-center bg-amber-50/10">
                      {gEx?.gradeValue ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded font-black text-xs border ${
                            GRADE_SCALE_CONFIG[gEx.gradeValue]?.bgBadge || 'bg-slate-100'
                          }`}
                        >
                          {gEx.gradeValue}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Logro Estimado */}
                    <td className="py-2.5 px-3 text-center bg-[#285A14]/5 font-black">
                      {globalGrade !== '-' ? (
                        <span
                          className={`inline-block px-3 py-1 rounded-lg font-black text-xs border ${
                            GRADE_SCALE_CONFIG[globalGrade]?.bgBadge || 'bg-slate-100'
                          }`}
                        >
                          {globalGrade}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
