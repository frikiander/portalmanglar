/**
 * src/utils/xlsxReader.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads every sheet of an .xlsx workbook as plain text cells. The parser is
 * loaded on demand so it only costs bandwidth when someone uploads a file.
 */
import { toISODate } from './lapsoCalendar';

export interface WorkbookSheet {
  name: string;
  rows: string[][];
}

function cellToText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return toISODate(value);
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
}

export async function readWorkbook(file: File): Promise<WorkbookSheet[]> {
  const { default: readXlsxFile } = await import('read-excel-file/browser');
  const sheets = await readXlsxFile(file);
  return sheets.map((s) => ({
    name: s.sheet,
    rows: s.data.map((row) => row.map(cellToText)),
  }));
}
