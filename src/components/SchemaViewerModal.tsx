import React from 'react';
import { X, Database, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onClose: () => void;
}

export const SchemaViewerModal: React.FC<Props> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const schemaSnippet = `-- ==============================================================================
-- EduPlan - Schema SQL para PostgreSQL (Supabase)
-- Tablas: users, competencies, lesson_plans, lesson_plan_competencies
-- ==============================================================================

CREATE TYPE user_role AS ENUM ('teacher', 'coordinator');
CREATE TYPE plan_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'teacher',
    avatar_url TEXT,
    specialty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE competencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,          -- Ej: 'English', 'Matemáticas'
    grade TEXT NOT NULL,            -- Ej: '4to Grado'
    code TEXT,                      -- Ej: 'ENG-4.1'
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    created_by UUID REFERENCES users(id)
);

CREATE TABLE lesson_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 15),
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    topic TEXT NOT NULL,
    status plan_status NOT NULL DEFAULT 'draft',
    start_activity TEXT NOT NULL DEFAULT '',        -- Inicio
    development_activity TEXT NOT NULL DEFAULT '',  -- Desarrollo
    closing_activity TEXT NOT NULL DEFAULT '',      -- Cierre
    resources TEXT NOT NULL DEFAULT '',             -- Recursos
    observations TEXT DEFAULT '',                   -- Observaciones
    coordinator_feedback TEXT DEFAULT '',           -- Feedback coordinación
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_teacher_week_subject_grade UNIQUE (teacher_id, week_number, subject, grade)
);

CREATE TABLE lesson_plan_competencies (
    lesson_plan_id UUID NOT NULL REFERENCES lesson_plans(id) ON DELETE CASCADE,
    competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    PRIMARY KEY (lesson_plan_id, competency_id)
);

-- Salidas de Campo e Invitados Especiales
CREATE TABLE field_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('salida_campo', 'invitado_especial')),
    grade TEXT NOT NULL,
    lapso TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    date DATE NOT NULL,
    destination_or_guest TEXT NOT NULL,
    alliances_or_contacts TEXT,
    purpose TEXT,
    subject_or_context TEXT,
    responsible_teacher TEXT NOT NULL,
    chaperone_teachers TEXT,
    resources TEXT,
    focus_social_responsibility BOOLEAN DEFAULT FALSE,
    focus_citizen_participation BOOLEAN DEFAULT FALSE,
    focus_national_identity BOOLEAN DEFAULT FALSE,
    focus_introspection BOOLEAN DEFAULT FALSE,
    methodology TEXT,
    key_learnings TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    transport_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full border border-slate-600 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-[#F8CB0A]" />
            <div>
              <h3 className="text-sm font-bold text-white">schema.sql (PostgreSQL / Supabase)</h3>
              <p className="text-[11px] text-slate-400">Portal Manglar · Esquema de Base de Datos Relacional</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto font-mono text-xs text-indigo-200 leading-relaxed bg-slate-950/80">
          <pre>{schemaSnippet}</pre>
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <span>Incluye Row Level Security (RLS) e índices de búsqueda</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#5EA832] hover:bg-[#498925] text-white rounded-lg font-medium cursor-pointer transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
