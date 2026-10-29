/**
 * src/utils/competencyImport.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Batch import for the competency bank. Accepts a table pasted from Excel or
 * Google Sheets (tab-separated) or a CSV file (comma or semicolon). One row per
 * competency with its indicators in one cell, or one row per indicator with the
 * competency repeated — rows for the same competency are merged.
 */
import type { Competency } from '../types';
import { matchGrades, matchSubjects, stripDiacritics } from './curricularMatcher';
import { generateCompetencyCode } from './competencyCode';

type Field = 'subject' | 'grade' | 'category' | 'title' | 'indicators' | 'code';

const HEADER_ALIASES: Record<Field, string[]> = {
  subject:    ['asignatura', 'materia', 'subject'],
  grade:      ['grado', 'nivel', 'grade', 'grado o nivel'],
  category:   ['eje', 'categoria', 'eje o categoria', 'eje curricular', 'area', 'category'],
  title:      ['competencia', 'enunciado', 'enunciado de la competencia', 'titulo', 'competency', 'title'],
  indicators: ['indicadores', 'indicador', 'indicadores de logro', 'indicators'],
  code:       ['codigo', 'code', 'cod'],
};

export const TEMPLATE_HEADERS = ['Asignatura', 'Grado', 'Eje o categoría', 'Competencia', 'Indicadores', 'Código'];

/** CSV for Excel: semicolon-separated with a BOM so accents open correctly in Spanish-locale Excel. */
export function buildTemplateCsv(): string {
  const rows = [
    TEMPLATE_HEADERS,
    ['Matemática', '4to Grado', 'Fracciones y medida', 'Resuelve problemas con fracciones equivalentes en situaciones cotidianas.',
      'Representa fracciones con material concreto | Compara fracciones con igual denominador | Explica su procedimiento', ''],
    ['Inglés (Language Arts)', '4to Grado', 'Reading & Comprehension', 'Comprende textos breves sobre rutinas diarias.',
      'Identifica la idea principal | Responde preguntas de comprensión', 'ENG-4GR-RDN'],
  ];
  const cell = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return '﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n');
}

/** Splits delimited text into rows of cells, honouring quotes (including line breaks inside quoted cells). */
export function parseDelimited(input: string): { rows: string[][]; delimiter: string } {
  const text = input.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const firstLine = text.split('\n', 1)[0] ?? '';
  const counts = { '\t': firstLine.split('\t').length, ';': firstLine.split(';').length, ',': firstLine.split(',').length };
  const delimiter = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"' && cell === '') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell); cell = '';
    } else if (ch === '\n') {
      row.push(cell); rows.push(row); row = []; cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); }
  // Blank lines are kept so reported row numbers match the spreadsheet
  return { rows, delimiter };
}

const norm = (s: string) => stripDiacritics(s).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

function mapHeaders(header: string[]): Partial<Record<Field, number>> {
  const map: Partial<Record<Field, number>> = {};
  header.forEach((h, idx) => {
    const key = norm(h);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [Field, string[]][]) {
      if (map[field] === undefined && aliases.includes(key)) map[field] = idx;
    }
  });
  return map;
}

/** Indicators in one cell: one per line (Alt+Enter in Excel), or separated by | • or ; */
export function splitIndicators(cell: string, delimiter: string): string[] {
  const separators = delimiter === ';' ? /\n|\||•/ : /\n|\||•|;/;
  return cell
    .split(separators)
    .map((s) => s.replace(/^\s*[-–*\d.)]+\s+/, '').trim())
    .filter(Boolean);
}

export type ImportRowStatus = 'new' | 'duplicate' | 'error';

export interface ImportRow {
  /** Spreadsheet row numbers this competency came from (header is row 1). */
  lines: number[];
  status: ImportRowStatus;
  problems: string[];
  data: Omit<Competency, 'id'>;
  /** Bank competency this row repeats, when status is 'duplicate'. */
  existing?: Competency;
}

export interface ImportResult {
  rows: ImportRow[];
  /** Problems with the whole input (e.g. unrecognised headers). Empty when the table was readable. */
  fatal: string[];
}

export type ImportContext = { subjects: string[]; grades: string[]; bank: Competency[] };

const REQUIRED: Field[] = ['subject', 'grade', 'title', 'indicators'];
const FIELD_NAMES: Record<Field, string> = { subject: 'Asignatura', grade: 'Grado', title: 'Competencia', indicators: 'Indicadores', category: 'Eje', code: 'Código' };
/** How far down to look for the header row (sheets often have a title or school name on top). */
const HEADER_SEARCH_ROWS = 10;

/** Index of the first row that has all required headers, or -1. */
export function findHeaderRow(rows: string[][]): number {
  const limit = Math.min(rows.length, HEADER_SEARCH_ROWS);
  for (let i = 0; i < limit; i++) {
    const cols = mapHeaders(rows[i]);
    if (REQUIRED.every((f) => cols[f] !== undefined)) return i;
  }
  return -1;
}

/** Pasted text or CSV file. */
export function analyzeCompetencyImport(input: string, ctx: ImportContext): ImportResult {
  const { rows, delimiter } = parseDelimited(input);
  return analyzeCompetencyTable(rows, ctx, delimiter);
}

/**
 * Validates a table of cells (from text or from an .xlsx sheet). Rows above the header row are ignored;
 * reported line numbers match the spreadsheet (1-based).
 */
export function analyzeCompetencyTable(rows: string[][], ctx: ImportContext, delimiter = ''): ImportResult {
  const isBlank = (r: string[]) => r.every((c) => c.trim() === '');
  if (rows.filter((r) => !isBlank(r)).length < 2) {
    return { rows: [], fatal: ['La tabla necesita una fila de encabezados y al menos una competencia.'] };
  }
  const headerIdx = findHeaderRow(rows);
  if (headerIdx < 0) {
    const cols = mapHeaders(rows[0]);
    const missing = REQUIRED.filter((f) => cols[f] === undefined);
    return {
      rows: [],
      fatal: [`No se encontraron las columnas ${missing.map((m) => FIELD_NAMES[m]).join(', ')}. Usa una fila de encabezados con: ${TEMPLATE_HEADERS.join(', ')}.`],
    };
  }
  const cols = mapHeaders(rows[headerIdx]);

  const get = (r: string[], f: Field) => (cols[f] !== undefined ? (r[cols[f]!] ?? '').trim() : '');
  const merged = new Map<string, ImportRow>();
  const order: ImportRow[] = [];

  rows.slice(headerIdx + 1).forEach((r, i) => {
    if (isBlank(r)) return;
    const line = headerIdx + i + 2;
    const rawSubject = get(r, 'subject');
    const rawGrade = get(r, 'grade');
    const title = get(r, 'title').replace(/\s+/g, ' ');
    const category = get(r, 'category');
    const indicators = splitIndicators(get(r, 'indicators'), delimiter);
    const problems: string[] = [];

    // Match the catalogue so "Ingles" or "4to" land on the official names
    const subject = ctx.subjects.find((s) => matchSubjects(s, rawSubject)) ?? rawSubject;
    const grade = ctx.grades.find((g) => matchGrades(g, rawGrade)) ?? rawGrade;
    if (!rawSubject) problems.push('Falta la asignatura.');
    else if (!ctx.subjects.some((s) => matchSubjects(s, rawSubject))) problems.push(`"${rawSubject}" no está en el catálogo de asignaturas.`);
    if (!rawGrade) problems.push('Falta el grado.');
    else if (!ctx.grades.some((g) => matchGrades(g, rawGrade))) problems.push(`"${rawGrade}" no es un grado registrado.`);
    if (!title) problems.push('Falta el enunciado de la competencia.');

    const key = `${norm(subject)}|${norm(grade)}|${norm(title)}`;
    const prior = title ? merged.get(key) : undefined;
    if (prior) {
      // Same competency on another row: add its indicators
      prior.lines.push(line);
      indicators.forEach((ind) => { if (!prior.data.indicators.includes(ind)) prior.data.indicators.push(ind); });
      prior.problems.push(...problems.filter((p) => !prior.problems.includes(p)));
      return;
    }

    const row: ImportRow = {
      lines: [line],
      status: 'new',
      problems,
      data: {
        subject,
        grade,
        category: category || 'Sin eje',
        title,
        indicators,
        code: (get(r, 'code') || generateCompetencyCode(subject, grade, category)).toUpperCase(),
      },
    };
    if (title) merged.set(key, row);
    order.push(row);
  });

  for (const row of order) {
    if (row.data.indicators.length === 0) row.problems.push('Agrega al menos un indicador.');
    if (row.problems.length > 0) { row.status = 'error'; continue; }
    const existing = ctx.bank.find(
      (c) => matchSubjects(c.subject, row.data.subject) && matchGrades(c.grade, row.data.grade) && norm(c.title) === norm(row.data.title),
    );
    if (existing) { row.status = 'duplicate'; row.existing = existing; }
  }

  return { rows: order, fatal: [] };
}
