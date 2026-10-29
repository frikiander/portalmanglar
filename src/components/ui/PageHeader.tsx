import React from 'react';
import { cn } from './cn';

export interface PageHeaderProps {
  title: React.ReactNode;
  /** One line on what this module is for, or who/what it is scoped to. */
  description?: React.ReactNode;
  /** Primary and secondary actions, right-aligned on wide screens. */
  actions?: React.ReactNode;
  className?: string;
}

/** Top of every module: title, one line of context, actions. No eyebrow labels or decorative icons. */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, className }) => (
  <header className={cn('flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4', className)}>
    <div className="min-w-0">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-raiz">{title}</h1>
      {description && <div className="mt-1 text-sm text-slate-600 max-w-[70ch]">{description}</div>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
  </header>
);
