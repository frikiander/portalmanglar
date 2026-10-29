import React, { useMemo, useRef, useState } from 'react';
import { DownloadSimple, UploadSimple, ClipboardText } from '@phosphor-icons/react';
import { useEduPlan } from '../context/EduPlanContext';
import { AVAILABLE_GRADES, AVAILABLE_SUBJECTS } from '../data/mockData';
import { Badge, Button, Tabs } from './ui';
import {
  TEMPLATE_HEADERS,
  analyzeCompetencyImport,
  analyzeCompetencyTable,
  buildTemplateCsv,
  findHeaderRow,
  type ImportResult,
} from '../utils/competencyImport';
import { readWorkbook } from '../utils/xlsxReader';

interface Props {
  /** Called after a successful import, e.g. to show the bank. */
  onImported: () => void;
}

type DuplicatePolicy = 'skip' | 'update';

const MAX_TEXT_BYTES = 2 * 1024 * 1024;
const MAX_XLSX_BYTES = 10 * 1024 * 1024;

export const CompetencyBatchImport: React.FC<Props> = ({ onImported }) => {
  const { competencies, importCompetencies, availableSubjectNames, availableGradeNames, addToast } = useEduPlan();
  const subjects = availableSubjectNames?.length > 0 ? availableSubjectNames : AVAILABLE_SUBJECTS;
  const grades = availableGradeNames?.length > 0 ? availableGradeNames : AVAILABLE_GRADES;

  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [policy, setPolicy] = useState<DuplicatePolicy>('skip');
  const [isReading, setIsReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(() => {
    const rows = result?.rows ?? [];
    return {
      new: rows.filter((r) => r.status === 'new').length,
      duplicate: rows.filter((r) => r.status === 'duplicate').length,
      error: rows.filter((r) => r.status === 'error').length,
    };
  }, [result]);
  const toSave = counts.new + (policy === 'update' ? counts.duplicate : 0);

  const ctx = { subjects, grades, bank: competencies };

  const review = (input: string) => {
    setResult(analyzeCompetencyImport(input, ctx));
  };

  const handleXlsx = async (file: File) => {
    if (file.size > MAX_XLSX_BYTES) {
      addToast('El archivo supera 10 MB. Copia solo la tabla de competencias a un libro nuevo.', 'warning');
      return;
    }
    setIsReading(true);
    try {
      const sheets = await readWorkbook(file);
      // First sheet with the expected headers; otherwise report on the first sheet
      const sheet = sheets.find((s) => findHeaderRow(s.rows) >= 0) ?? sheets[0];
      if (!sheet) {
        addToast('El libro no tiene hojas con datos.', 'warning');
        return;
      }
      setText('');
      setFileName(sheets.length > 1 ? `${file.name}, hoja «${sheet.name}»` : file.name);
      setResult(analyzeCompetencyTable(sheet.rows, ctx));
    } catch {
      addToast('No se pudo leer el archivo. Ábrelo en Excel, guárdalo de nuevo como .xlsx e inténtalo otra vez.', 'error');
    } finally {
      setIsReading(false);
    }
  };

  const handleFile = async (file: File) => {
    if (/\.xlsx$/i.test(file.name)) return handleXlsx(file);
    if (/\.(xls|xlsm|xlsb|ods|numbers)$/i.test(file.name)) {
      addToast('Ese formato no se puede leer. Guárdalo como Excel (.xlsx) o CSV.', 'warning');
      return;
    }
    if (file.size > MAX_TEXT_BYTES) {
      addToast('El archivo supera 2 MB. Divide la tabla en partes más pequeñas.', 'warning');
      return;
    }
    const content = await file.text();
    setFileName(file.name);
    setText(content);
    review(content);
  };

  const downloadTemplate = () => {
    const blob = new Blob([buildTemplateCsv()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_competencias_manglar.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!result) return;
    const toAdd = result.rows.filter((r) => r.status === 'new').map((r) => r.data);
    const toUpdate = policy === 'update'
      ? result.rows
          .filter((r) => r.status === 'duplicate' && r.existing)
          .map((r) => ({ ...r.existing!, ...r.data, id: r.existing!.id }))
      : [];
    if (toAdd.length + toUpdate.length === 0) return;
    importCompetencies(toAdd, toUpdate);
    setText('');
    setFileName(null);
    setResult(null);
    onImported();
  };

  // ── Step 1: paste or upload ──────────────────────────────────────────────
  if (!result || result.fatal.length > 0) {
    return (
      <div className="space-y-5">
        <div className="text-sm text-slate-600 space-y-1.5 max-w-[68ch]">
          <p>
            Sube un archivo de Excel (.xlsx) o CSV, o copia la tabla desde Excel o Google Sheets y pégala aquí. La tabla
            necesita una fila de encabezados con: <strong className="text-raiz">{TEMPLATE_HEADERS.join(', ')}</strong>. Eje y código son opcionales.
          </p>
          <p>
            Pon varios indicadores en la misma celda, uno por línea o separados por «|». También puedes repetir la competencia
            en varias filas, una por indicador, y se agrupan solas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={DownloadSimple} onClick={downloadTemplate}>Descargar plantilla</Button>
          <Button variant="secondary" size="sm" icon={UploadSimple} onClick={() => fileRef.current?.click()} disabled={isReading}>
            {isReading ? 'Leyendo archivo…' : 'Subir Excel o CSV'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv,.tsv,.txt,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
          />
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        >
          <label htmlFor="batch-competencies-input" className="block text-sm font-bold text-slate-700 mb-1.5">
            Tabla de competencias {fileName && <span className="font-normal text-slate-500">({fileName})</span>}
          </label>
          <textarea
            id="batch-competencies-input"
            value={text}
            onChange={(e) => { setText(e.target.value); setFileName(null); if (result) setResult(null); }}
            placeholder={`${TEMPLATE_HEADERS.join('\t')}\nMatemática\t4to Grado\tFracciones y medida\tResuelve problemas con fracciones…\tRepresenta fracciones | Compara fracciones`}
            rows={9}
            spellCheck={false}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-raiz placeholder:text-slate-500 tabular-nums focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20"
          />
          <p className="text-xs text-slate-500 mt-1">También puedes arrastrar el archivo de Excel o CSV sobre este recuadro.</p>
        </div>

        {result?.fatal.map((msg) => (
          <p key={msg} role="alert" className="p-3 rounded-md bg-danger-50 border border-danger-200 text-sm text-danger-800">{msg}</p>
        ))}

        <div className="flex justify-end">
          <Button icon={ClipboardText} onClick={() => review(text)} disabled={!text.trim()}>Revisar tabla</Button>
        </div>
      </div>
    );
  }

  // ── Step 2: review ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge tone="success">{counts.new} nuevas</Badge>
        <Badge tone="warning">{counts.duplicate} ya están en el banco</Badge>
        <Badge tone={counts.error > 0 ? 'danger' : 'neutral'}>{counts.error} con errores</Badge>
      </div>

      {counts.duplicate > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-700">Las que ya están en el banco:</span>
          <Tabs<DuplicatePolicy>
            label="Qué hacer con las competencias repetidas"
            value={policy}
            onChange={setPolicy}
            options={[{ value: 'skip', label: 'Omitirlas' }, { value: 'update', label: 'Reemplazarlas' }]}
          />
        </div>
      )}

      {counts.error > 0 && (
        <p className="text-sm text-slate-600">
          Las filas con errores no se cargan. Corrígelas en tu hoja y vuelve a pegar la tabla, o carga ahora las demás.
        </p>
      )}

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-600 sticky top-0">
              <tr>
                <th scope="col" className="px-3 py-2 font-bold w-14">Fila</th>
                <th scope="col" className="px-3 py-2 font-bold">Competencia</th>
                <th scope="col" className="px-3 py-2 font-bold w-28">Indicadores</th>
                <th scope="col" className="px-3 py-2 font-bold w-40">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.rows.map((row) => (
                <tr key={row.lines.join('-')} className={row.status === 'error' ? 'bg-danger-50/40' : undefined}>
                  <td className="px-3 py-2 align-top text-slate-500 tabular-nums">{row.lines.join(', ')}</td>
                  <td className="px-3 py-2 align-top">
                    <span className="block font-bold text-raiz">{row.data.title || 'Sin enunciado'}</span>
                    <span className="block text-xs text-slate-500">
                      {row.data.subject || 'Sin asignatura'}, {row.data.grade || 'sin grado'}. {row.data.category}. {row.data.code}
                    </span>
                    {row.problems.length > 0 && (
                      <ul className="mt-1 text-xs text-danger-700 list-disc pl-4">
                        {row.problems.map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top tabular-nums text-slate-700">{row.data.indicators.length}</td>
                  <td className="px-3 py-2 align-top">
                    {row.status === 'new' && <Badge tone="success">Nueva</Badge>}
                    {row.status === 'duplicate' && (
                      <Badge tone="warning">{policy === 'update' ? 'Se reemplaza' : 'Se omite'}</Badge>
                    )}
                    {row.status === 'error' && <Badge tone="danger">No se carga</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" size="sm" className="mr-auto" onClick={() => setResult(null)}>Volver a la tabla</Button>
        <Button onClick={handleImport} disabled={toSave === 0}>
          {toSave === 0
            ? 'No hay competencias para cargar'
            : `Cargar ${toSave} ${toSave === 1 ? 'competencia' : 'competencias'}`}
        </Button>
      </div>
    </div>
  );
};
